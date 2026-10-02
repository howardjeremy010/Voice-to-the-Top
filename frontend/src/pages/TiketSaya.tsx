import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Search, Loader2, Inbox } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/common/PageHeader";
import TicketCard from "@/components/tickets/TicketCard";
import { apiGet, apiPost } from "@/lib/api";
import { errMsg } from "@/lib/hooks";
import type { Ticket } from "@/lib/types";

const FILTERS: Record<string, (t: Ticket) => boolean> = {
  semua: () => true,
  proses: (t) => ["terkirim", "ditinjau", "diteruskan", "ditindaklanjuti"].includes(t.status),
  selesai: (t) => ["selesai", "disetujui"].includes(t.status),
  ditolak: (t) => t.status === "ditolak",
};

export default function TiketSaya() {
  const [filter, setFilter] = useState("semua");
  const [ticketNo, setTicketNo] = useState("");
  const [code, setCode] = useState("");
  const mine = useQuery({ queryKey: ["my-tickets"], queryFn: () => apiGet<Ticket[]>("/tickets/mine"), retry: false });
  const lookup = useMutation({
    mutationFn: (body: { ticket_no: string; access_code: string }) => apiPost<Ticket>("/tickets/lookup", body),
  });

  const submitLookup = (e: FormEvent) => {
    e.preventDefault();
    lookup.mutate({ ticket_no: ticketNo, access_code: code });
  };

  const list = (mine.data ?? []).filter(FILTERS[filter]);

  return (
    <div>
      <PageHeader
        eyebrow="Pantau pesan"
        title="Tiket Saya"
        description="Pantau status pesan Voice to the Top yang Anda kirim dalam mode Rahasia atau Bernama."
        action={
          <Link to="/vtt" data-testid="tickets-new-button" className={buttonVariants()}>
            Kirim pesan baru
          </Link>
        }
      />

      <section className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6">
        <h2 className="font-semibold text-navy">Lacak tiket Anonim</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pesan anonim tidak terhubung ke akun. Masukkan nomor tiket dan kode akses untuk melihat status dan balasan.
        </p>
        <form onSubmit={submitLookup} className="mt-4 flex flex-col gap-3 sm:flex-row" data-testid="lookup-form">
          <Input
            data-testid="lookup-ticket-input"
            placeholder="Nomor tiket, mis. VTT-2026-0008"
            value={ticketNo}
            onChange={(e) => setTicketNo(e.target.value)}
            className="font-mono sm:max-w-xs"
            required
          />
          <Input
            data-testid="lookup-code-input"
            placeholder="Kode akses"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono sm:max-w-[160px]"
            required
          />
          <Button data-testid="lookup-submit-button" type="submit" variant="outline" disabled={lookup.isPending}>
            {lookup.isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Lacak
          </Button>
        </form>
        {lookup.isError && (
          <p data-testid="lookup-error" className="mt-3 text-sm text-destructive">{errMsg(lookup.error)}</p>
        )}
        {lookup.data && (
          <div className="mt-5" data-testid="lookup-result">
            <TicketCard ticket={lookup.data} />
          </div>
        )}
      </section>

      <Tabs value={filter} onValueChange={(v) => setFilter(String(v))}>
        <TabsList className="mb-5">
          <TabsTrigger value="semua" data-testid="tickets-filter-semua">Semua</TabsTrigger>
          <TabsTrigger value="proses" data-testid="tickets-filter-proses">Dalam proses</TabsTrigger>
          <TabsTrigger value="selesai" data-testid="tickets-filter-selesai">Selesai</TabsTrigger>
          <TabsTrigger value="ditolak" data-testid="tickets-filter-ditolak">Ditolak</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4" data-testid="my-tickets-list">
        {mine.isPending && <div className="h-40 animate-pulse rounded-xl bg-slate-100" />}
        {mine.isError && <p className="text-sm text-muted-foreground">Daftar tiket belum dapat dimuat.</p>}
        {mine.isSuccess && list.length === 0 && (
          <div data-testid="my-tickets-empty" className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 py-12 text-center">
            <Inbox className="size-8 text-slate-400" />
            <p className="mt-3 text-sm text-muted-foreground">Belum ada tiket pada kategori ini.</p>
          </div>
        )}
        {!mine.isError && list.map((t) => <TicketCard key={t.id} ticket={t} />)}
      </div>
    </div>
  );
}
