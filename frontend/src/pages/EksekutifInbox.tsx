import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Inbox, Send, Hourglass, UserRound, Loader2, MessageCircleReply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/common/PageHeader";
import { CategoryPill, SlaBadge, StatusBadge } from "@/components/common/Badges";
import StatusTimeline from "@/components/common/StatusTimeline";
import { apiGet, apiPost } from "@/lib/api";
import { errMsg } from "@/lib/hooks";
import { queryClient } from "@/lib/queryClient";
import { MODE_LABEL, fmtDate, fmtDateTime } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/lib/types";

export default function EksekutifInbox() {
  const [tab, setTab] = useState("aktif");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const tickets = useQuery({ queryKey: ["exec-tickets"], queryFn: () => apiGet<Ticket[]>("/exec/tickets"), retry: false });
  const list = (tickets.data ?? []).filter((t) => (tab === "aktif" ? t.status !== "selesai" : t.status === "selesai"));
  const selected = list.find((t) => t.id === selectedId) ?? list[0] ?? null;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["exec-tickets"] });
    void queryClient.invalidateQueries({ queryKey: ["summary"] });
  };

  const followup = useMutation({
    mutationFn: (id: string) => apiPost<Ticket>(`/exec/tickets/${id}/followup`),
    onSuccess: () => { refresh(); toast.success("Status diubah menjadi Ditindaklanjuti"); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const send = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => apiPost<Ticket>(`/exec/tickets/${id}/reply`, { message }),
    onSuccess: () => { refresh(); setReply(""); toast.success("Balasan terkirim. Tiket kini Selesai."); },
    onError: (e) => toast.error(errMsg(e)),
  });

  return (
    <div>
      <PageHeader
        eyebrow="CEO & CHCO"
        title="Kotak Masuk"
        description="Pesan tertutup yang telah ditinjau dan diteruskan oleh Human Capital. Balas langsung kepada karyawan pengirim."
        action={
          <Link to="/eksekutif/rekap" data-testid="exec-recap-link" className="text-sm font-medium text-sky-700 hover:underline">
            Lihat Rekap & Audit
          </Link>
        }
      />
      <Tabs value={tab} onValueChange={(v) => { setTab(String(v)); setSelectedId(null); }}>
        <TabsList className="mb-5">
          <TabsTrigger value="aktif" data-testid="exec-tab-aktif">Perlu tanggapan</TabsTrigger>
          <TabsTrigger value="selesai" data-testid="exec-tab-selesai">Sudah dibalas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-2" data-testid="exec-ticket-list">
          {tickets.isPending && <div className="h-40 animate-pulse rounded-xl bg-slate-100" />}
          {tickets.isError && <p className="text-sm text-muted-foreground">Kotak masuk belum dapat dimuat.</p>}
          {tickets.isSuccess && list.length === 0 && (
            <div data-testid="exec-empty" className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 py-12 text-center">
              <Inbox className="size-8 text-slate-400" />
              <p className="mt-3 text-sm text-muted-foreground">Tidak ada pesan di sini.</p>
            </div>
          )}
          {!tickets.isError &&
            list.map((t) => (
              <button
                key={t.id}
                type="button"
                data-testid={`exec-ticket-item-${t.ticket_no}`}
                onClick={() => setSelectedId(t.id)}
                className={cn(
                  "w-full rounded-xl border bg-white p-4 text-left transition-[border-color,box-shadow] duration-150",
                  selected?.id === t.id ? "border-teal shadow-[0_8px_24px_rgba(15,23,42,0.08)]" : "border-slate-200/80 hover:border-slate-300",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-navy">{t.ticket_no}</span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="mt-2 line-clamp-1 font-semibold text-foreground">{t.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CategoryPill category={t.category} />
                  <SlaBadge state={t.sla_state} />
                </div>
              </button>
            ))}
        </div>

        {selected ? (
          <section key={selected.id} data-testid="exec-ticket-detail" className="animate-rise rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-navy">{selected.ticket_no}</span>
              <CategoryPill category={selected.category} />
              <StatusBadge status={selected.status} />
              <SlaBadge state={selected.sla_state} />
            </div>
            <h2 data-testid="exec-detail-title" className="mt-4 text-2xl font-bold text-navy">{selected.title}</h2>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <UserRound className="size-4" />
                <span data-testid="exec-detail-identity">
                  {MODE_LABEL[selected.mode]}
                  {selected.identity_name && ` · ${selected.identity_name}`}
                  {selected.identity_department && ` (${selected.identity_department})`}
                </span>
                {selected.identity_employee_id && (
                  <span data-testid="exec-detail-nik" className="ml-1 rounded-md bg-accent px-2 py-0.5 font-mono text-xs font-semibold text-navy">
                    NIK {selected.identity_employee_id}
                  </span>
                )}
              </span>
              {selected.response_due_at && <span>Batas tanggapan {fmtDate(selected.response_due_at)}</span>}
            </div>
            <p data-testid="exec-detail-message" className="mt-5 whitespace-pre-line rounded-xl bg-secondary/70 p-5 leading-relaxed text-slate-700">
              {selected.message}
            </p>
            {selected.hc_note && (
              <p className="mt-4 rounded-lg bg-teal-50 p-4 text-sm text-teal-900"><span className="font-semibold">Catatan telaah HC:</span> {selected.hc_note}</p>
            )}
            <div className="mt-6"><StatusTimeline ticket={selected} /></div>

            {selected.reply ? (
              <div data-testid="exec-reply-sent" className="mt-6 rounded-xl border border-teal-200 bg-teal-50/60 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-teal-900"><MessageCircleReply className="size-4" /> Balasan {selected.reply.by_name}</p>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{selected.reply.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{fmtDateTime(selected.reply.at)}</p>
              </div>
            ) : (
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                <label htmlFor="exec-reply" className="text-sm font-semibold text-foreground">Balas kepada karyawan</label>
                {selected.mode === "anonim" && (
                  <p className="text-xs text-muted-foreground">Pengirim anonim akan membaca balasan melalui nomor tiket.</p>
                )}
                <Textarea
                  id="exec-reply"
                  data-testid="exec-reply-input"
                  rows={5}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Terima kasih atas masukan Anda..."
                />
                <div className="flex flex-wrap gap-3">
                  {selected.status === "diteruskan" && (
                    <Button data-testid="exec-followup-button" variant="outline" disabled={followup.isPending} onClick={() => followup.mutate(selected.id)}>
                      <Hourglass className="size-4" /> Tandai Ditindaklanjuti
                    </Button>
                  )}
                  <Button
                    data-testid="exec-send-reply-button"
                    className="bg-teal text-white hover:bg-teal/90"
                    disabled={reply.trim().length < 5 || send.isPending}
                    onClick={() => send.mutate({ id: selected.id, message: reply.trim() })}
                  >
                    {send.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Kirim balasan
                  </Button>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="hidden items-center justify-center rounded-2xl border border-dashed border-slate-300 p-10 text-sm text-muted-foreground lg:flex">
            Pilih pesan untuk membaca.
          </section>
        )}
      </div>
    </div>
  );
}
