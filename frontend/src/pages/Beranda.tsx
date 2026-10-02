import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Lock, Globe2, ShieldAlert, Phone, Ticket as TicketIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { useMe, useSummary } from "@/lib/hooks";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { WallItem } from "@/lib/types";

export default function Beranda() {
  const { data: me } = useMe();
  const summary = useSummary(!!me);
  const wall = useQuery({ queryKey: ["wall"], queryFn: () => apiGet<WallItem[]>("/wall"), retry: false });
  const firstName = me?.name.split(" ")[0];

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-navy px-6 py-10 text-white md:px-12 md:py-14 animate-rise">
        <img
          src="https://images.unsplash.com/photo-1521791136064-7986c2920216?crop=entropy&cs=srgb&fm=jpg&q=70&w=1400"
          alt="Komitmen pimpinan mendengarkan insan perusahaan"
          className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-30 md:block"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/30" />
        <div className="relative max-w-xl">
          <p className="text-sm font-semibold text-teal-300">Selamat datang{firstName ? `, ${firstName}` : ""}</p>
          <h1 data-testid="page-title" className="mt-2 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Suara Anda sampai ke pimpinan.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Voice to the Top menghubungkan Anda langsung dengan CEO &amp; CHCO. Setiap pesan ditinjau Human Capital
            dan dapat dipantau melalui nomor tiket.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/vtt"
              data-testid="hero-send-vtt-button"
              className={cn(buttonVariants({ size: "lg" }), "bg-teal text-white hover:bg-teal/90")}
            >
              Sampaikan suara Anda <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/tiket-saya"
              data-testid="hero-my-tickets-button"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white")}
            >
              <TicketIcon className="size-4" /> Tiket Saya
              {summary.data && summary.data.my_open > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 text-xs">{summary.data.my_open}</span>
              )}
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Voice to the Top</p>
            <h2 className="mt-1 text-2xl font-bold text-navy">Pilih kategori pesan</h2>
          </div>
          <Link to="/cara-kerja" data-testid="home-cara-kerja-link" className="text-sm font-medium text-sky-700 hover:underline">
            Lihat Cara Kerja
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.id}
                to={`/vtt?kategori=${c.id}`}
                data-testid={`home-category-${c.id}`}
                style={{ animationDelay: `${i * 50}ms` }}
                className={cn(
                  "group animate-rise rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
                  c.open && "sm:col-span-2 lg:col-span-1 lg:row-span-2 bg-gradient-to-br from-amber-50 to-white",
                )}
              >
                <div className="flex items-start justify-between">
                  <span className={cn("flex size-11 items-center justify-center rounded-xl", c.tile)}>
                    <Icon className="size-5" />
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    {c.open ? <Globe2 className="size-3.5" /> : <Lock className="size-3.5" />}
                    {c.open ? "Terbuka" : "Tertutup"}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{c.name}</h3>
                <p className="text-xs font-semibold text-teal">{c.kind}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                {c.open && (
                  <p className="mt-4 text-sm text-amber-900">
                    Apresiasi yang disetujui tampil di Dinding Apresiasi untuk seluruh karyawan.
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy transition-[gap] duration-150 group-hover:gap-2">
                  Tulis pesan <ArrowRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy">Dinding Apresiasi terbaru</h2>
            <Link to="/dinding-apresiasi" data-testid="home-wall-link" className="text-sm font-medium text-sky-700 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {wall.isError && <p className="text-sm text-muted-foreground">Dinding Apresiasi belum dapat dimuat.</p>}
            {wall.data?.length === 0 && <p className="text-sm text-muted-foreground">Belum ada apresiasi.</p>}
            {!wall.isError &&
              wall.data?.slice(0, 3).map((w) => (
                <div key={w.id} data-testid="home-wall-item" className="rounded-xl bg-amber-50/70 p-4">
                  <p className="text-sm font-semibold text-amber-900">Untuk {w.recipient_name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-700">“{w.message}”</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">dari {w.sender_display}</p>
                </div>
              ))}
          </div>
        </div>
        <div className="space-y-4">
          <Link
            to="/wbs"
            data-testid="home-wbs-card"
            className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-navy">
              <ShieldAlert className="size-5" />
            </span>
            <span>
              <span className="block font-semibold text-foreground">Whistle Blowing System</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Laporkan dugaan pelanggaran melalui kanal terpisah yang independen.
              </span>
            </span>
          </Link>
          <Link
            to="/hotline-hc"
            data-testid="home-hotline-card"
            className="flex gap-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-5 transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
              <Phone className="size-5" />
            </span>
            <span>
              <span className="block font-semibold text-foreground">Hotline Human Capital</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Kecelakaan kerja, darurat BPJS, dan keadaan darurat K3.
              </span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
