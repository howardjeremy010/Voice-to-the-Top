import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, Send, CheckCircle2, XCircle, Inbox, UserRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageHeader from "@/components/common/PageHeader";
import { CategoryPill, SlaBadge, StatusBadge } from "@/components/common/Badges";
import StatusTimeline from "@/components/common/StatusTimeline";
import { apiGet, apiPost } from "@/lib/api";
import { errMsg } from "@/lib/hooks";
import { queryClient } from "@/lib/queryClient";
import { CATEGORIES, CATEGORY_BY_ID, MODE_LABEL, STATUS_META, fmtDate, fmtDateTime } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/lib/types";

const ALL = "semua";
const PENDING = "menunggu";
const CAT_LABELS: Record<string, string> = { [ALL]: "Semua kategori", ...Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name])) };
const STATUS_LABELS: Record<string, string> = {
  [PENDING]: "Perlu keputusan",
  [ALL]: "Semua status",
  ...Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, v.label])),
};

export default function HcModerasi() {
  const [cat, setCat] = useState(ALL);
  const [status, setStatus] = useState(PENDING);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const qs = new URLSearchParams();
  if (cat !== ALL) qs.set("category", cat);
  if (status !== ALL && status !== PENDING) qs.set("status", status);
  const tickets = useQuery({
    queryKey: ["hc-tickets", cat, status],
    queryFn: () => apiGet<Ticket[]>(`/hc/tickets?${qs.toString()}`),
    retry: false,
  });
  const list = (tickets.data ?? []).filter((t) => status !== PENDING || t.status === "terkirim" || t.status === "ditinjau");
  const selected = list.find((t) => t.id === selectedId) ?? list[0] ?? null;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["hc-tickets"] });
    void queryClient.invalidateQueries({ queryKey: ["summary"] });
    void queryClient.invalidateQueries({ queryKey: ["wall"] });
  };

  const act = useMutation({
    mutationFn: ({ id, action, body }: { id: string; action: "review" | "approve" | "reject"; body?: unknown }) =>
      apiPost<Ticket>(`/hc/tickets/${id}/${action}`, body),
    onSuccess: (t, v) => {
      refresh();
      setNote("");
      if (v.action === "review") toast.success(`${t.ticket_no} kini berstatus Ditinjau`);
      if (v.action === "approve")
        toast.success(t.category === "apresiasi" ? "Apresiasi disetujui dan tampil di Dinding Apresiasi" : "Pesan diteruskan ke CEO & CHCO");
      if (v.action === "reject") {
        toast.success("Pesan ditolak, alasan dikirim ke karyawan");
        setRejectOpen(false);
        setReason("");
      }
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const decidable = selected && (selected.status === "terkirim" || selected.status === "ditinjau");

  return (
    <div>
      <PageHeader
        eyebrow="Human Capital"
        title="Moderasi Pesan"
        description="Filter pesan dari enam kategori Voice to the Top. Teruskan pesan tertutup yang layak ke CEO & CHCO, setujui apresiasi, atau tolak dengan alasan."
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <Select value={cat} onValueChange={(v: string) => { setCat(v); setSelectedId(null); }}>
          <SelectTrigger data-testid="hc-filter-category" className="min-w-[210px] bg-white">
            <SelectValue>{(v) => CAT_LABELS[v as string]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CAT_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v: string) => { setStatus(v); setSelectedId(null); }}>
          <SelectTrigger data-testid="hc-filter-status" className="min-w-[190px] bg-white">
            <SelectValue>{(v) => STATUS_LABELS[v as string]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span data-testid="hc-result-count" className="self-center text-sm text-muted-foreground">{list.length} pesan</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <div className="space-y-2" data-testid="hc-ticket-list">
          {tickets.isPending && <div className="h-40 animate-pulse rounded-xl bg-slate-100" />}
          {tickets.isError && <p className="text-sm text-muted-foreground">Daftar pesan belum dapat dimuat.</p>}
          {tickets.isSuccess && list.length === 0 && (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 py-12 text-center">
              <Inbox className="size-8 text-slate-400" />
              <p className="mt-3 text-sm text-muted-foreground">Tidak ada pesan pada filter ini.</p>
            </div>
          )}
          {!tickets.isError &&
            list.map((t) => (
              <button
                key={t.id}
                type="button"
                data-testid={`hc-ticket-item-${t.ticket_no}`}
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
          <section key={selected.id} data-testid="hc-ticket-detail" className="animate-rise rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-navy">{selected.ticket_no}</span>
              <CategoryPill category={selected.category} />
              <StatusBadge status={selected.status} />
              <SlaBadge state={selected.sla_state} />
            </div>
            <h2 data-testid="hc-detail-title" className="mt-4 text-2xl font-bold text-navy">{selected.title}</h2>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <UserRound className="size-4" />
                <span data-testid="hc-detail-identity">
                  {MODE_LABEL[selected.mode]}
                  {selected.identity_name && ` · ${selected.identity_name}`}
                  {selected.identity_department && ` (${selected.identity_department})`}
                </span>
                {selected.identity_employee_id && (
                  <span data-testid="hc-detail-nik" className="ml-1 rounded-md bg-accent px-2 py-0.5 font-mono text-xs font-semibold text-navy">
                    NIK {selected.identity_employee_id}
                  </span>
                )}
              </span>
              <span>Dikirim {fmtDateTime(selected.created_at)}</span>
              <span>Batas tinjau {fmtDate(selected.review_due_at)}</span>
            </div>
            {selected.recipient_name && (
              <p className="mt-3 text-sm"><span className="text-muted-foreground">Apresiasi untuk:</span> <span className="font-semibold">{selected.recipient_name}</span></p>
            )}
            <p data-testid="hc-detail-message" className="mt-5 whitespace-pre-line rounded-xl bg-secondary/70 p-5 leading-relaxed text-slate-700">
              {selected.message}
            </p>
            {selected.resubmitted_from && <p className="mt-2 text-xs text-muted-foreground">Kiriman ulang dari {selected.resubmitted_from}</p>}

            <div className="mt-6"><StatusTimeline ticket={selected} /></div>

            {selected.rejection_reason && (
              <p className="mt-5 rounded-lg bg-rose-50 p-4 text-sm text-rose-900"><span className="font-semibold">Alasan penolakan:</span> {selected.rejection_reason}</p>
            )}
            {selected.hc_note && (
              <p className="mt-5 rounded-lg bg-teal-50 p-4 text-sm text-teal-900"><span className="font-semibold">Catatan HC:</span> {selected.hc_note}</p>
            )}

            {decidable && (
              <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="hc-note">Catatan telaah HC (opsional)</Label>
                  <Textarea id="hc-note" data-testid="hc-note-input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Konteks singkat untuk CEO & CHCO" />
                </div>
                <div className="flex flex-wrap gap-3">
                  {selected.status === "terkirim" && (
                    <Button
                      data-testid="hc-review-button"
                      variant="outline"
                      disabled={act.isPending}
                      onClick={() => act.mutate({ id: selected.id, action: "review" })}
                    >
                      <Eye className="size-4" /> Mulai tinjau
                    </Button>
                  )}
                  <Button
                    data-testid="hc-approve-button"
                    className="bg-teal text-white hover:bg-teal/90"
                    disabled={act.isPending}
                    onClick={() => act.mutate({ id: selected.id, action: "approve", body: { note: note || null } })}
                  >
                    {act.isPending ? <Loader2 className="size-4 animate-spin" /> : selected.category === "apresiasi" ? <CheckCircle2 className="size-4" /> : <Send className="size-4" />}
                    {selected.category === "apresiasi" ? "Setujui & tampilkan di Dinding" : "Teruskan ke CEO & CHCO"}
                  </Button>
                  <Button data-testid="hc-reject-button" variant="destructive" disabled={act.isPending} onClick={() => setRejectOpen(true)}>
                    <XCircle className="size-4" /> Tolak
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Setiap keputusan tercatat di audit log dan dapat dilihat CEO & CHCO dalam rekap tanpa isi pesan.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className="hidden items-center justify-center rounded-2xl border border-dashed border-slate-300 p-10 text-sm text-muted-foreground lg:flex">
            Pilih pesan untuk melihat detail.
          </section>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent data-testid="hc-reject-dialog">
          <DialogHeader>
            <DialogTitle>Tolak pesan {selected?.ticket_no}</DialogTitle>
            <DialogDescription>
              Alasan wajib diisi dan akan terlihat oleh karyawan pengirim. Karyawan dapat memperbaiki lalu mengirim ulang.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            data-testid="hc-reject-reason-input"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`Contoh: Pesan memuat bahasa yang tidak pantas. Mohon sampaikan kembali ${selected ? CATEGORY_BY_ID[selected.category].kind.toLowerCase() : "pesan"} Anda dengan bahasa yang santun.`}
          />
          <DialogFooter>
            <Button variant="ghost" data-testid="hc-reject-cancel" onClick={() => setRejectOpen(false)}>Batal</Button>
            <Button
              data-testid="hc-reject-confirm"
              variant="destructive"
              disabled={reason.trim().length < 5 || act.isPending}
              onClick={() => selected && act.mutate({ id: selected.id, action: "reject", body: { reason: reason.trim() } })}
            >
              Tolak dengan alasan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
