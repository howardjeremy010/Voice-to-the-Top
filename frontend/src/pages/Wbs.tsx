import { ShieldCheck, EyeOff, Scale, FileWarning } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import QrPanel from "@/components/common/QrPanel";
import { WBS_URL } from "@/lib/constants";

const POINTS = [
  { icon: Scale, title: "Apa yang dilaporkan", text: "Dugaan pelanggaran kode etik, kecurangan (fraud), korupsi, gratifikasi, benturan kepentingan, dan pelanggaran hukum." },
  { icon: EyeOff, title: "Kerahasiaan pelapor", text: "Identitas pelapor dilindungi. Laporan dapat disampaikan tanpa mencantumkan nama." },
  { icon: ShieldCheck, title: "Dikelola secara independen", text: "Laporan diproses di sistem Whistle Blowing yang terpisah dan tidak dilihat oleh Human Capital." },
  { icon: FileWarning, title: "Sertakan bukti pendukung", text: "Jelaskan apa, siapa, kapan, di mana, dan bagaimana kejadiannya agar laporan dapat ditindaklanjuti." },
];

export default function Wbs() {
  return (
    <div>
      <PageHeader
        eyebrow="Kanal terpisah"
        title="Whistle Blowing System"
        description="Halaman ini hanya berisi informasi. Laporan pelanggaran disampaikan langsung melalui web Whistle Blowing yang terpisah dan tidak diproses di Insan Bersuara."
      />
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
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
          <div className="rounded-xl bg-navy p-5 text-sm leading-relaxed text-slate-200 sm:col-span-2">
            Untuk masukan, saran, atau keluhan umum tempat kerja, gunakan <span className="font-semibold text-white">Voice to the Top</span>.
            Whistle Blowing System khusus untuk dugaan pelanggaran.
          </div>
        </div>
        <QrPanel
          testid="wbs"
          value={WBS_URL}
          label="Buka web Whistle Blowing"
          caption="Pindai kode QR dengan ponsel Anda atau klik tombol di bawah untuk menuju web Whistle Blowing."
        />
      </div>
    </div>
  );
}
