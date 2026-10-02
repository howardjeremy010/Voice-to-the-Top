import { Lock, Globe2, ShieldCheck, Clock, FileSearch } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/Badges";
import { CATEGORIES, MODES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/types";

const FLOW: { title: string; text: string }[] = [
  { title: "Pilih kategori & tulis pesan", text: "Karyawan memilih satu dari enam kategori, menulis pesan, dan memilih cara mengirim: Rahasia, Bernama, atau Anonim." },
  { title: "Terima nomor tiket", text: "Tanpa perlu login, karyawan menerima nomor tiket dan kode akses untuk dilacak di menu Lacak Tiket. Status awal: Terkirim." },
  { title: "Tinjauan Human Capital", text: "Human Capital membaca pesan (status Ditinjau) dan memutuskan: meneruskan, menyetujui, atau menolak dengan alasan." },
  { title: "Diteruskan atau ditampilkan", text: "Pesan tertutup diteruskan ke CEO & CHCO dan notifikasi email dikirim. Apresiasi yang disetujui tampil di Dinding Apresiasi." },
  { title: "Tanggapan CEO & CHCO", text: "CEO & CHCO membaca pesan (status Ditindaklanjuti), lalu membalas langsung kepada karyawan pengirim." },
  { title: "Selesai", text: "Setelah balasan terkirim, status menjadi Selesai. Balasan dibaca melalui Lacak Tiket dengan nomor tiket dan kode akses." },
];

const STATUS_DEF: { s: Status; text: string }[] = [
  { s: "terkirim", text: "Pesan sudah masuk dan menunggu tinjauan Human Capital." },
  { s: "ditinjau", text: "Human Capital sedang membaca dan menilai kelayakan pesan." },
  { s: "diteruskan", text: "Pesan tertutup lolos tinjauan dan diteruskan ke CEO & CHCO." },
  { s: "disetujui", text: "Apresiasi lolos tinjauan dan tampil di Dinding Apresiasi." },
  { s: "ditindaklanjuti", text: "CEO & CHCO sedang menyiapkan tanggapan." },
  { s: "selesai", text: "Balasan CEO & CHCO telah dikirim kepada karyawan." },
  { s: "ditolak", text: "Pesan tidak dapat diteruskan. Alasan ditampilkan dan pesan dapat diperbaiki lalu dikirim ulang." },
];

export default function CaraKerja() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Dokumentasi"
        title="Cara Kerja"
        description="Alur Voice to the Top dari pesan dikirim hingga mendapat tanggapan, beserta jaminan kerahasiaan dan target layanan."
      />

      <section>
        <h2 className="text-xl font-bold text-navy">Alur pesan</h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="cara-kerja-flow">
          {FLOW.map((f, i) => (
            <li key={f.title} style={{ animationDelay: `${i * 60}ms` }} className="relative animate-rise rounded-xl border border-slate-200/80 bg-white p-5">
              <span className="font-mono text-3xl font-bold text-teal/30">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy"><FileSearch className="size-5 text-teal" /> Arti status tiket</h2>
          <dl className="mt-4 space-y-3">
            {STATUS_DEF.map((d) => (
              <div key={d.s} className="grid grid-cols-[130px_1fr] items-start gap-3">
                <dt><StatusBadge status={d.s} /></dt>
                <dd className="text-sm text-muted-foreground">{d.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl bg-navy p-6 text-white">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Clock className="size-5 text-teal-300" /> Target layanan</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-3xl font-bold">3</p>
                <p className="text-sm text-slate-300">hari kerja maksimal tinjauan Human Capital</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-3xl font-bold">7</p>
                <p className="text-sm text-slate-300">hari kerja maksimal tanggapan CEO & CHCO</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300">
              Tiket yang melewati batas diberi penanda dan tampil sebagai eskalasi pada Rekap CEO & CHCO.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-navy"><ShieldCheck className="size-5 text-teal" /> Cara mengirim & kerahasiaan</h2>
            <ul className="mt-4 space-y-3">
              {MODES.map((m) => (
                <li key={m.id} className="text-sm"><span className="font-semibold text-foreground">{m.title}:</span> <span className="text-muted-foreground">{m.description}</span></li>
              ))}
              <li className="text-sm text-muted-foreground">
                Setiap keputusan Human Capital tercatat di audit log. CEO & CHCO dapat melihat rekap jumlah dan alasan
                penolakan tanpa membuka isi pesan.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy">Enam kategori Voice to the Top</h2>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          {CATEGORIES.map((c) => (
            <div key={c.id} className="grid gap-2 border-b border-slate-100 p-4 last:border-0 md:grid-cols-[220px_160px_1fr_120px] md:items-center">
              <span className="flex items-center gap-2 font-semibold text-foreground">
                <span className={cn("flex size-8 items-center justify-center rounded-lg", c.tile)}><c.icon className="size-4" /></span>
                {c.name}
              </span>
              <span className="text-sm font-medium text-teal">{c.kind}</span>
              <span className="text-sm text-muted-foreground">{c.description}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                {c.open ? <Globe2 className="size-3.5" /> : <Lock className="size-3.5" />}
                {c.open ? "Terbuka" : "Tertutup"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
