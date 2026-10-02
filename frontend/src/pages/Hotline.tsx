import { HardHat, HeartPulse, Siren, ClipboardCheck, ExternalLink } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import QrPanel from "@/components/common/QrPanel";
import { buttonVariants } from "@/components/ui/button";
import { HOTLINE_FEEDBACK_URL, HOTLINE_WA_DISPLAY, hotlineWaUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SERVICES = [
  { icon: HardHat, title: "Kecelakaan Kerja", text: "Pendampingan penanganan dan pelaporan kecelakaan saat bekerja.", tint: "bg-amber-50 text-amber-800" },
  { icon: HeartPulse, title: "Darurat BPJS Kesehatan & Ketenagakerjaan", text: "Kendala mendesak terkait layanan atau penjaminan BPJS.", tint: "bg-sky-50 text-sky-800" },
  { icon: Siren, title: "Darurat Kesehatan & Keselamatan", text: "Keadaan darurat lain yang berkaitan dengan kesehatan dan keselamatan kerja.", tint: "bg-rose-50 text-rose-800" },
];

export default function Hotline() {
  return (
    <div>
      <PageHeader
        eyebrow="Layanan darurat"
        title="Hotline Human Capital"
        description="Hubungi Hotline Human Capital melalui WhatsApp untuk keadaan darurat yang memerlukan bantuan segera."
      />
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {SERVICES.map((s, i) => (
            <div key={s.title} style={{ animationDelay: `${i * 60}ms` }} className="flex animate-rise gap-4 rounded-xl border border-slate-200/80 bg-white p-5">
              <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", s.tint)}>
                <s.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-teal">
                <ClipboardCheck className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">Nilai kualitas layanan Hotline</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bantu kami meningkatkan layanan. Formulir ini menilai kualitas layanan hotline, bukan isi kasus yang
                  Anda laporkan.
                </p>
                <a
                  data-testid="hotline-feedback-link"
                  href={HOTLINE_FEEDBACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3")}
                >
                  Isi formulir feedback <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <QrPanel
          testid="hotline"
          value={hotlineWaUrl()}
          label="Chat WhatsApp Hotline HC"
          caption={`Pindai untuk membuka WhatsApp Hotline Human Capital ${HOTLINE_WA_DISPLAY}.`}
        />
      </div>
    </div>
  );
}
