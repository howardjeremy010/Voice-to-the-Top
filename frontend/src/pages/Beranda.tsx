import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, Lock, Globe2, ShieldAlert, Phone, Search, Quote } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { WallItem } from "@/lib/types";

const MARQUEE = ["Setiap suara didengar", "Ditinjau Human Capital", "Sampai ke CEO & CHCO", "Terpantau dengan nomor tiket", "Where Every Voice Matters"];

const STEPS = [
  { title: "Sampaikan", text: "Pilih kategori, tulis pesan, dan pilih cara mengirim: Rahasia, Bernama, atau Anonim." },
  { title: "Simpan tiket", text: "Anda menerima nomor tiket dan kode akses untuk memantau status." },
  { title: "Ditinjau", text: "Human Capital meninjau maksimal 3 hari kerja agar pesan layak dan santun." },
  { title: "Diteruskan", text: "Pesan tertutup diteruskan ke CEO & CHCO; apresiasi tampil di Dinding Apresiasi." },
  { title: "Ditanggapi", text: "CEO & CHCO membalas maksimal 7 hari kerja. Status tiket menjadi Selesai." },
];

const PRINCIPLES = [
  { title: "Langsung ke pimpinan", text: "Voice to the Top membuka jalur resmi dari setiap insan kepada CEO & CHCO." },
  { title: "Aman dan terjaga", text: "Kategori tertutup tidak terlihat oleh karyawan lain. Mode Anonim tidak mengumpulkan identitas." },
  { title: "Adil dan terawasi", text: "Setiap keputusan tercatat di audit log. Penolakan selalu disertai alasan dan bisa dikirim ulang." },
];

export default function Beranda() {
  const wall = useQuery({ queryKey: ["wall"], queryFn: () => apiGet<WallItem[]>("/wall"), retry: false });

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="-mx-4 -mt-8 md:-mx-8 md:-mt-10">
        <div className="relative overflow-hidden bg-navy text-white">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=srgb&fm=jpg&q=75&w=1800"
            alt="Produk segar di lorong supermarket"
            className="absolute inset-0 size-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/10" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
            <p className="inline-flex items-center gap-2 rounded-full bg-market-red px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white animate-rise">Insan Bersuara · Where Every Voice Matters</p>
            <h1 data-testid="page-title" className="mt-4 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight animate-rise md:text-7xl">
              Satu suara,<br />satu langkah,<br /><span className="text-[#E9D48B]">perubahan nyata.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300 animate-rise">
              Sampaikan apresiasi, aspirasi, saran, ide, keluhan, dan opini Anda kepada CEO &amp; CHCO. Tanpa perlu login —
              cukup simpan nomor tiket untuk memantau tanggapannya.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 animate-rise">
              <Link to="/vtt" data-testid="hero-send-vtt-button" className={cn(buttonVariants({ size: "lg" }), "h-12 bg-teal px-6 text-base text-white hover:bg-teal/90")}>
                Sampaikan Suara Anda <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/lacak"
                data-testid="hero-track-button"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-12 border-white/30 bg-white/5 px-6 text-base text-white hover:bg-white/15 hover:text-white")}
              >
                <Search className="size-4" /> Lacak Tiket Saya
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-400">Anda dapat mengirim secara Rahasia, Bernama, atau Anonim.</p>
          </div>
        </div>
        <div className="overflow-hidden bg-market-red py-3 text-white" aria-hidden>
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-sm font-semibold">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i} className="flex items-center gap-10">{m}<span className="text-[#E9D48B]">✦</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <p className="font-mono text-xs font-semibold text-teal">01 — Kategori</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-navy md:text-4xl">Enam lorong untuk didengar</h2>
          <p className="max-w-md text-sm text-muted-foreground">Pilih yang paling sesuai. Setiap pesan ditinjau dan dapat dipantau melalui nomor tiket.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.id}
                to={`/vtt?kategori=${c.id}`}
                data-testid={`home-category-${c.id}`}
                style={{ animationDelay: `${i * 50}ms` }}
                className={cn(
                  "group animate-rise overflow-hidden rounded-2xl border border-[#E7E1D3] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
                  c.open && "bg-gradient-to-br from-amber-50 to-white",
                )}
              >
                <div className="-mx-6 -mt-6 mb-5 flex items-center justify-between rounded-t-2xl bg-navy px-6 py-2.5 text-white">
                  <span data-testid={`aisle-sign-${c.id}`} className="font-mono text-xs font-bold tracking-widest">LORONG {String(i + 1).padStart(2, "0")}</span>
                  <ArrowUpRight className="size-4 text-white/60 transition-colors duration-150 group-hover:text-[#E9D48B]" />
                </div>
                <div className="flex items-start justify-between">
                  <span className={cn("flex size-11 items-center justify-center rounded-xl", c.tile)}><Icon className="size-5" /></span>
                  <span className="relative rounded-md rounded-l-none bg-[#E9D48B] py-1 pl-3 pr-2.5 text-[11px] font-bold text-navy before:absolute before:-left-2 before:top-0 before:h-full before:w-2 before:bg-[#E9D48B] before:[clip-path:polygon(100%_0,0_50%,100%_100%)]">
                    {c.kind}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{c.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  {c.open ? <Globe2 className="size-3.5" /> : <Lock className="size-3.5" />}
                  {c.open ? "Terbuka · tampil di Dinding Apresiasi" : "Tertutup · hanya HC serta CEO & CHCO"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Principles */}
      <section className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="font-mono text-xs font-semibold text-teal">02 — Komitmen</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy md:text-4xl">Bukan sekadar kotak saran. Jalur resmi menuju pimpinan.</h2>
          <div className="mt-8 space-y-6">
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className="flex gap-5">
                <span className="font-mono text-sm font-semibold text-teal">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1753354868616-544973e405c9?crop=entropy&cs=srgb&fm=jpg&q=70&w=1200"
            alt="Tim toko bekerja bersama"
            className="aspect-[4/3] w-full rounded-3xl object-cover"
          />
          <div className="absolute -bottom-6 left-6 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.1)] backdrop-blur">
            <p className="text-3xl font-bold text-navy">3 + 7</p>
            <p className="text-xs text-muted-foreground">hari kerja: tinjauan HC + tanggapan pimpinan</p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section>
        <p className="font-mono text-xs font-semibold text-teal">03 — Cara Kerja</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-navy md:text-4xl">Dari suara menjadi tanggapan</h2>
          <Link to="/cara-kerja" data-testid="home-cara-kerja-link" className="text-sm font-medium text-sky-700 hover:underline">Selengkapnya</Link>
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <span className="font-mono text-2xl font-bold text-teal/40">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Wall preview */}
      <section>
        <p className="font-mono text-xs font-semibold text-teal">Dinding Apresiasi</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-navy md:text-4xl">Insan yang menginspirasi kita.</h2>
          <Link to="/dinding-apresiasi" data-testid="home-wall-link" className="text-sm font-medium text-sky-700 hover:underline">Lihat semua</Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {wall.isError && <p className="text-sm text-muted-foreground">Dinding Apresiasi belum dapat dimuat.</p>}
          {wall.data?.length === 0 && <p className="text-sm text-muted-foreground">Belum ada apresiasi.</p>}
          {!wall.isError &&
            wall.data?.slice(0, 3).map((w) => (
              <figure key={w.id} data-testid="home-wall-item" className="rounded-2xl bg-amber-50/80 p-6">
                <Quote className="size-5 text-amber-500" />
                <blockquote className="mt-3 line-clamp-4 text-sm leading-relaxed text-slate-700">“{w.message}”</blockquote>
                <figcaption className="mt-4">
                  <span className="block font-semibold text-amber-900">{w.recipient_name}</span>
                  <span className="text-xs text-muted-foreground">dari {w.sender_display}</span>
                </figcaption>
              </figure>
            ))}
        </div>
      </section>

      {/* Other channels */}
      <section className="grid gap-4 md:grid-cols-2">
        <Link to="/wbs" data-testid="home-wbs-card" className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-navy"><ShieldAlert className="size-5" /></span>
          <span>
            <span className="block font-semibold text-foreground">Whistle Blowing System</span>
            <span className="mt-1 block text-sm text-muted-foreground">Laporkan dugaan pelanggaran melalui kanal terpisah yang independen.</span>
          </span>
        </Link>
        <Link to="/hotline-hc" data-testid="home-hotline-card" className="flex gap-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-6 transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-800"><Phone className="size-5" /></span>
          <span>
            <span className="block font-semibold text-foreground">Hotline Human Capital</span>
            <span className="mt-1 block text-sm text-muted-foreground">Kecelakaan kerja, darurat BPJS, dan keadaan darurat K3.</span>
          </span>
        </Link>
      </section>

      {/* Final CTA */}
      <section className="overflow-hidden rounded-3xl bg-navy text-center text-white">
        <div className="awning h-3" aria-hidden />
        <div className="px-6 py-14 md:px-12">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">Suara Anda dapat mengubah cara kita bekerja.</h2>
        <Link to="/vtt" data-testid="footer-cta-send" className={cn(buttonVariants({ size: "lg" }), "mt-8 h-12 bg-teal px-6 text-base text-white hover:bg-teal/90")}>
          Sampaikan Suara Anda <ArrowRight className="size-4" />
        </Link>
        </div>
      </section>
    </div>
  );
}
