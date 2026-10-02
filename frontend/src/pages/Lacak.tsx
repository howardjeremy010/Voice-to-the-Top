import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/common/PageHeader";
import TicketCard from "@/components/tickets/TicketCard";
import { apiPost } from "@/lib/api";
import { errMsg } from "@/lib/hooks";
import type { Ticket } from "@/lib/types";

export default function Lacak() {
  const [params, setParams] = useSearchParams();
  const no = params.get("no") ?? "";
  const kode = params.get("kode") ?? "";
  const [ticketNo, setTicketNo] = useState(no);
  const [code, setCode] = useState(kode);

  // The URL is the source of truth: a submitted search (or the link from the success screen) sets ?no=&kode=.
  const lookup = useQuery({
    queryKey: ["lookup", no.toUpperCase(), kode.toUpperCase()],
    queryFn: () => apiPost<Ticket>("/tickets/lookup", { ticket_no: no, access_code: kode }),
    enabled: !!no && !!kode,
    retry: false,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setParams({ no: ticketNo.trim(), kode: code.trim() });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Pantau pesan"
        title="Lacak Tiket"
        description="Masukkan nomor tiket dan kode akses yang Anda terima saat mengirim pesan untuk melihat status terbaru dan balasan."
        action={<Link to="/vtt" data-testid="track-new-button" className={buttonVariants({ variant: "outline" })}>Kirim pesan baru</Link>}
      />
      <form onSubmit={submit} data-testid="lookup-form" className="grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:grid-cols-[1fr_200px_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="ticket-no">Nomor tiket</Label>
          <Input id="ticket-no" data-testid="lookup-ticket-input" placeholder="VTT-2026-0008" value={ticketNo} onChange={(e) => setTicketNo(e.target.value)} className="font-mono" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="access-code">Kode akses</Label>
          <Input id="access-code" data-testid="lookup-code-input" placeholder="A1B2C3" value={code} onChange={(e) => setCode(e.target.value)} className="font-mono" required />
        </div>
        <Button data-testid="lookup-submit-button" type="submit" size="lg" disabled={lookup.isFetching}>
          {lookup.isFetching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Lacak
        </Button>
      </form>
      {lookup.isError && <p data-testid="lookup-error" className="mt-4 text-sm text-destructive">{errMsg(lookup.error)}</p>}
      {lookup.data && !lookup.isError && (
        <div className="mt-6" data-testid="lookup-result">
          <TicketCard ticket={lookup.data} />
        </div>
      )}
      {!lookup.data && (
        <p className="mt-6 text-sm text-muted-foreground">
          Kehilangan kode akses? Demi kerahasiaan, kode tidak dapat dipulihkan. Silakan kirim pesan baru bila diperlukan.
        </p>
      )}
    </div>
  );
}
