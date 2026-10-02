import { ShieldCheck, EyeOff, Scale, FileWarning, Mail, MessageCircle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import QrPanel from "@/components/common/QrPanel";
import { buttonVariants } from "@/components/ui/button";
import { WBS_EMAIL, WBS_WA_DISPLAY, wbsMailUrl, wbsWaUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

const POINTS = [
  { icon: Scale, title: "Apa yang dilaporkan", text: "Dugaan pelanggaran kode etik, kecurangan (fraud), korupsi, gratifikasi, benturan kepentingan, dan pelanggaran hukum." },
  { icon: EyeOff, title: "Kerahasiaan pelapor", text: "Identitas pelapor dilindungi. Laporan dapat disampaikan tanpa mencantumkan nama." },
  { icon: ShieldCheck, title: "Di luar Insan Bersuara", text: "Laporan tidak diproses di web ini dan tidak dilihat oleh Human Capital melalui Insan Bersuara." },
  { icon: FileWarning, title: "Sertakan bukti pendukung", text: "Jelaskan apa, siapa, kapan, di mana, dan bagaimana kejadiannya agar laporan dapat ditindaklanjuti." },
];

export default function Wbs() {
  return (
    <div>
      <PageHeader
        eyebrow="Kanal pengaduan"
        title="Whistle Blowing System"
        description="Halaman ini hanya berisi informasi. Laporan dugaan pelanggaran disampaikan langsung melalui WhatsApp atau email Whistle Blowing di bawah ini, dan tidak diproses di Insan Bersuara."
      />
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={wbsWaUrl()}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="wbs-whatsapp-card"
              className="group flex gap-4 rounded-xl border border-teal/30 bg-white p-5 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(11,61,46,0.1)]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-teal"><MessageCircle className="size-5" /></span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp</span>
                <span data-testid="wbs-whatsapp-number" className="mt-0.5 block font-mono text-lg font-bold text-navy">{WBS_WA_DISPLAY}</span>
                <span className="mt-1 block text-xs text-muted-foreground">Ketuk untuk membuka chat</span>
              </span>
            </a>
            <a
              href={wbsMailUrl()}
              data-testid="wbs-email-card"
              className="group flex gap-4 rounded-xl border border-teal/30 bg-white p-5 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(11,61,46,0.1)]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-teal"><Mail className="size-5" /></span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
                <span data-testid="wbs-email-address" className="mt-0.5 block break-all font-mono text-sm font-bold text-navy">{WBS_EMAIL}</span>
                <span className="mt-1 block text-xs text-muted-foreground">Ketuk untuk menulis email</span>
              </span>
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {POINTS.map((p, i) => (
              <div key={p.title} style={{ animationDelay: `${i * 60}ms` }} className="animate-rise rounded-xl border border-slate-200/80 bg-white p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-navy">
                  <p.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-navy p-5 text-sm leading-relaxed text-slate-200">
            Untuk masukan, saran, atau keluhan umum tempat kerja, gunakan <span className="font-semibold text-white">Voice to the Top</span>.
            Whistle Blowing System khusus untuk dugaan pelanggaran.
          </div>
        </div>
        <div className="space-y-3">
          <QrPanel
            testid="wbs"
            value={wbsWaUrl()}
            label="Lapor via WhatsApp"
            caption={`Pindai kode QR untuk membuka WhatsApp Whistle Blowing ${WBS_WA_DISPLAY}.`}
          />
          <a
            href={wbsMailUrl()}
            data-testid="wbs-email-button"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full bg-white")}
          >
            <Mail className="size-4" /> Lapor via Email
          </a>
        </div>
      </div>
    </div>
  );
}
