import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Copy, Lock, Globe2, Loader2, ShieldCheck, UserRound, EyeOff } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import PageHeader from "@/components/common/PageHeader";
import { CategoryPill } from "@/components/common/Badges";
import { apiPost } from "@/lib/api";
import { errMsg } from "@/lib/hooks";
import { queryClient } from "@/lib/queryClient";
import { CATEGORIES, CATEGORY_BY_ID, MODES, MODE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category, Mode, TicketCreate, TicketCreated } from "@/lib/types";

const STEPS = ["Kategori", "Tulis Pesan", "Cara Mengirim", "Tinjau dan Konfirmasi"];
const MODE_ICON = { rahasia: ShieldCheck, bernama: UserRound, anonim: EyeOff } as const;

function isCategory(v: string | null): v is Category {
  return !!v && v in CATEGORY_BY_ID;
}

export default function Vtt() {
  const [params] = useSearchParams();
  const location = useLocation();
  const prefill = (location.state as { prefill?: Partial<TicketCreate> } | null)?.prefill;
  const initialCat = prefill?.category ?? (isCategory(params.get("kategori")) ? (params.get("kategori") as Category) : null);

  const [step, setStep] = useState(initialCat ? 1 : 0);
  const [category, setCategory] = useState<Category | null>(initialCat);
  const [title, setTitle] = useState(prefill?.title ?? "");
  const [message, setMessage] = useState(prefill?.message ?? "");
  const [recipient, setRecipient] = useState(prefill?.recipient_name ?? "");
  const [mode, setMode] = useState<Mode | null>(prefill?.mode ?? null);
  const [displayName, setDisplayName] = useState("");
  const [department, setDepartment] = useState("");
  const [consent, setConsent] = useState(false);
  const [created, setCreated] = useState<TicketCreated | null>(null);

  const isApresiasi = category === "apresiasi";
  const nameValue = displayName;
  const needsIdentity = mode === "rahasia" || mode === "bernama";

  const submit = useMutation({
    mutationFn: (body: TicketCreate) => apiPost<TicketCreated>("/tickets", body),
    onSuccess: (res) => {
      setCreated(res);
      void queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      void queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Pesan berhasil dikirim");
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const canNext = [
    !!category,
    title.trim().length >= 3 && message.trim().length >= 10 && (!isApresiasi || recipient.trim().length > 0),
    !!mode && (!needsIdentity || nameValue.trim().length > 0) && (!isApresiasi || consent),
    true,
  ][step];

  const send = () => {
    if (!category || !mode) return;
    submit.mutate({
      category,
      mode,
      title: title.trim(),
      message: message.trim(),
      display_name: needsIdentity ? nameValue.trim() : null,
      department: needsIdentity ? department.trim() || null : null,
      recipient_name: isApresiasi ? recipient.trim() : null,
      publish_consent: isApresiasi ? consent : false,
      resubmitted_from: prefill?.resubmitted_from ?? null,
    });
  };

  if (created) return <Success created={created} anonymous={mode === "anonim"} />;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Voice to the Top"
        title="Sampaikan suara Anda"
        description="Pesan Anda akan ditinjau Human Capital sebelum diteruskan kepada CEO & CHCO atau ditampilkan di Dinding Apresiasi."
      />
      {prefill?.resubmitted_from && (
        <p data-testid="resubmit-notice" className="mb-6 rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Anda sedang memperbaiki dan mengirim ulang tiket <span className="font-mono font-semibold">{prefill.resubmitted_from}</span>.
        </p>
      )}

      <ol className="mb-8 grid grid-cols-4 gap-2" data-testid="wizard-steps">
        {STEPS.map((s, i) => (
          <li key={s} className="space-y-2">
            <div className={cn("h-1.5 rounded-full transition-colors duration-300", i <= step ? "bg-teal" : "bg-slate-200")} />
            <p className={cn("text-xs font-semibold", i === step ? "text-navy" : "text-muted-foreground")}>
              <span className="hidden sm:inline">{i + 1}. </span>
              {s}
            </p>
          </li>
        ))}
      </ol>

      <div key={step} className="animate-rise rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] md:p-8">
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold text-navy">Apa yang ingin Anda sampaikan?</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    data-testid={`wizard-category-${c.id}`}
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      "flex gap-3 rounded-xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-150",
                      active ? "border-teal bg-teal-50/60 ring-2 ring-teal/20" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", c.tile)}>
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        {c.name}
                        {c.open ? <Globe2 className="size-3.5 text-muted-foreground" /> : <Lock className="size-3.5 text-muted-foreground" />}
                      </span>
                      <span className="block text-xs font-semibold text-teal">{c.kind}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{c.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && category && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-navy">Tulis pesan Anda</h2>
              <CategoryPill category={category} />
            </div>
            <p className="text-sm text-muted-foreground">
              {CATEGORY_BY_ID[category].open
                ? "Kategori terbuka: setelah disetujui Human Capital, apresiasi tampil di Dinding Apresiasi."
                : "Kategori tertutup: pesan tidak terlihat oleh karyawan lain dan hanya dibaca Human Capital serta CEO & CHCO."}
            </p>
            {isApresiasi && (
              <div className="space-y-1.5">
                <Label htmlFor="recipient">Rekan yang ingin Anda apresiasi</Label>
                <Input
                  id="recipient"
                  data-testid="wizard-recipient-input"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Nama rekan atau tim"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="title">Judul singkat</Label>
              <Input
                id="title"
                data-testid="wizard-title-input"
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Usulan jam kerja fleksibel"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Isi pesan</Label>
              <Textarea
                id="message"
                data-testid="wizard-message-input"
                value={message}
                maxLength={4000}
                rows={7}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Sampaikan dengan santun, jelas, dan spesifik."
              />
              <p className="text-right text-xs text-muted-foreground">{message.length}/4000 · minimal 10 karakter</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-navy">Bagaimana Anda ingin mengirim ini?</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {MODES.map((m) => {
                const Icon = MODE_ICON[m.id];
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    data-testid={`wizard-mode-${m.id}`}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-150",
                      active ? "border-teal bg-teal-50/60 ring-2 ring-teal/20" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <Icon className={cn("size-5", active ? "text-teal" : "text-navy")} />
                    <p className="mt-3 font-semibold text-foreground">{m.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                  </button>
                );
              })}
            </div>
            {needsIdentity && (
              <div className="grid gap-4 animate-rise sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="display-name">Nama lengkap</Label>
                  <Input
                    id="display-name"
                    data-testid="wizard-display-name-input"
                    value={nameValue}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nama Anda"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="department">Unit / divisi (opsional)</Label>
                  <Input
                    id="department"
                    data-testid="wizard-department-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Contoh: Operasional"
                  />
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  {mode === "rahasia"
                    ? "Nama hanya terlihat oleh Human Capital serta CEO & CHCO, tidak ditampilkan kepada karyawan lain."
                    : "Nama Anda akan ditampilkan bersama pesan."}
                </p>
              </div>
            )}
            {mode === "anonim" && (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Identitas Anda tidak dikumpulkan. Simpan nomor tiket dan kode akses yang diberikan setelah pengiriman
                untuk memantau status dan balasan.
              </p>
            )}
            {isApresiasi && (
              <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
                <Checkbox
                  data-testid="wizard-consent-checkbox"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm text-amber-950">
                  Saya mengizinkan apresiasi ini dipublikasikan di Dinding Apresiasi setelah disetujui Human Capital.
                </span>
              </label>
            )}
          </div>
        )}

        {step === 3 && category && mode && (
          <div className="space-y-5" data-testid="wizard-review">
            <h2 className="text-xl font-bold text-navy">Tinjau dan Konfirmasi</h2>
            <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              <Row label="Kategori"><CategoryPill category={category} /></Row>
              <Row label="Sifat">{CATEGORY_BY_ID[category].open ? "Terbuka (Dinding Apresiasi)" : "Tertutup"}</Row>
              <Row label="Cara mengirim">
                {MODE_LABEL[mode]}
                {needsIdentity && ` · ${nameValue}${department ? ` (${department})` : ""}`}
              </Row>
              {isApresiasi && <Row label="Untuk">{recipient}</Row>}
              {isApresiasi && <Row label="Izin publikasi">{consent ? "Diizinkan" : "Tidak"}</Row>}
              <Row label="Judul">{title}</Row>
              <Row label="Pesan"><span className="whitespace-pre-line">{message}</span></Row>
            </dl>
            <p className="text-sm text-muted-foreground">
              Target layanan: ditinjau Human Capital maksimal 3 hari kerja
              {isApresiasi ? "." : ", ditanggapi CEO & CHCO maksimal 7 hari kerja setelah diteruskan."}
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
          <Button
            data-testid="wizard-back-button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="size-4" /> Kembali
          </Button>
          {step < 3 ? (
            <Button data-testid="wizard-next-button" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Lanjut <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              data-testid="wizard-submit-button"
              className="bg-teal text-white hover:bg-teal/90"
              onClick={send}
              disabled={submit.isPending}
            >
              {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Kirim pesan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[160px_1fr]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

function Success({ created, anonymous }: { created: TicketCreated; anonymous: boolean }) {
  const copy = (text: string) => {
    void navigator.clipboard?.writeText(text);
    toast.success("Disalin ke papan klip");
  };
  const now = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  return (
    <div className="mx-auto max-w-md animate-rise">
      <div data-testid="success-receipt" className="relative bg-white px-7 pb-8 pt-7 font-mono text-sm text-slate-700 shadow-[0_12px_32px_rgba(11,61,46,0.12)]">
        <div className="text-center">
          <img src="/logo-sbl.png" alt="Supra Boga Lestari" className="mx-auto h-12 w-auto" />
          <p className="mt-3 font-heading text-lg font-bold text-navy">STRUK SUARA INSAN</p>
          <p className="text-xs text-muted-foreground">Insan Bersuara · Voice to the Top</p>
        </div>
        <div className="my-4 border-t border-dashed border-slate-300" />
        <div className="flex items-center justify-center gap-2 text-teal">
          <Check className="size-5" />
          <h1 data-testid="success-title" className="font-heading text-base font-bold">Pesan Anda telah terkirim</h1>
        </div>
        <div className="my-4 border-t border-dashed border-slate-300" />
        <dl className="space-y-2">
          <div className="flex justify-between"><dt>Tanggal</dt><dd>{now}</dd></div>
          <div className="flex justify-between"><dt>Status</dt><dd className="font-bold text-navy">TERKIRIM</dd></div>
          <div className="flex justify-between"><dt>Cara kirim</dt><dd>{anonymous ? "ANONIM" : "TERCATAT"}</dd></div>
          <div className="flex justify-between"><dt>Target tinjau</dt><dd>3 hari kerja</dd></div>
        </dl>
        <div className="my-4 border-t border-dashed border-slate-300" />
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-cream px-3 py-2.5">
            <span>
              <span className="block text-[11px] uppercase text-muted-foreground">Nomor tiket</span>
              <span data-testid="success-ticket-number" className="text-lg font-bold text-navy">{created.ticket_no}</span>
            </span>
            <Button data-testid="copy-ticket-number" variant="ghost" size="icon-sm" onClick={() => copy(created.ticket_no)} aria-label="Salin nomor tiket">
              <Copy className="size-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-cream px-3 py-2.5">
            <span>
              <span className="block text-[11px] uppercase text-muted-foreground">Kode akses</span>
              <span data-testid="success-access-code" className="text-lg font-bold text-market-red">{created.access_code}</span>
            </span>
            <Button data-testid="copy-access-code" variant="ghost" size="icon-sm" onClick={() => copy(created.access_code)} aria-label="Salin kode akses">
              <Copy className="size-4" />
            </Button>
          </div>
        </div>
        <p data-testid="success-save-warning" className="mt-4 text-center text-xs leading-relaxed text-slate-600">
          Simpan struk ini. Nomor tiket dan kode akses adalah satu-satunya cara memantau status dan membaca balasan
          {anonymous ? " — identitas Anda tidak tersimpan." : "."}
        </p>
        <p className="mt-4 text-center text-xs tracking-[0.3em] text-slate-400">*** TERIMA KASIH ***</p>
        <div className="receipt-edge absolute inset-x-0 -bottom-[14px] h-[14px] rotate-180" aria-hidden />
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          to={`/lacak?no=${encodeURIComponent(created.ticket_no)}&kode=${encodeURIComponent(created.access_code)}`}
          data-testid="success-track-link"
          className={buttonVariants()}
        >
          Lacak tiket ini
        </Link>
        <Link to="/" data-testid="success-home-link" className={buttonVariants({ variant: "outline" })}>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
