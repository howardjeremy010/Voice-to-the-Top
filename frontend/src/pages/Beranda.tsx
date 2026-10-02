import { useEffect, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight, Lock, Globe2, ShieldAlert, Phone, Search, Quote, ShieldCheck, UserRound, EyeOff, Check, X, ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { WallItem } from "@/lib/types";

const MARQUEE = ["Setiap suara didengar", "Ditinjau Human Capital", "Sampai ke CEO & CHCO", "Terpantau dengan nomor tiket", "Where Every Voice Matters"];
const WORDS = ["apresiasi", "aspirasi", "saran", "ide inovasi", "keluhan", "opini"];

const STEPS = [
  { title: "Sampaikan", text: "Pilih salah satu dari enam cara, tulis pesan, lalu tentukan cara mengirim: Rahasia, Bernama, atau Anonim. Tanpa perlu login.", status: "Terkirim" },
  { title: "Simpan Nomor Tiket", text: "Anda langsung menerima struk berisi nomor tiket dan kode akses untuk memantau perkembangan pesan.", status: "Terkirim" },
  { title: "Ditinjau HC", text: "Human Capital membaca dan menilai kelayakan pesan maksimal 3 hari kerja, agar pimpinan hanya menerima pesan yang pantas.", status: "Ditinjau" },
  { title: "Diteruskan", text: "Pesan tertutup diteruskan ke CEO & CHCO dengan notifikasi email. Apresiasi yang disetujui tampil di Dinding Apresiasi.", status: "Diteruskan" },
  { title: "Ditanggapi", text: "CEO & CHCO membaca dan membalas maksimal 7 hari kerja. Balasan dapat dibaca melalui Lacak Tiket; status menjadi Selesai.", status: "Selesai" },
];

const MODES = [
  { id: "rahasia", label: "Rahasia", icon: ShieldCheck, desc: "Nama tercatat, hanya untuk peninjau berwenang.", hc: true, exec: true, peers: false },
  { id: "bernama", label: "Bernama", icon: UserRound, desc: "Nama dibagikan secara terbuka bersama pesan.", hc: true, exec: true, peers: true },
  { id: "anonim", label: "Anonim", icon: EyeOff, desc: "Identitas tidak dikumpulkan sama sekali.", hc: false, exec: false, peers: false },
] as const;

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return <p className="font-mono text-xs font-semibold uppercase tracking-widest text-teal">{n} — {children}</p>;
}

export default function Beranda() {
  const wall = useQuery({ queryKey: ["wall"], queryFn: () => apiGet<WallItem[]>("/wall"), retry: false });
  const [word, setWord] = useState(0);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("rahasia");
  const [autoStep, setAutoStep] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setWord((w) => (w + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!autoStep) return;
    const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 3800);
    return () => clearInterval(t);
  }, [autoStep]);

  // Hero parallax follows the cursor.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const bgX = useTransform(sx, (v) => v * -24);
  const bgY = useTransform(sy, (v) => v * -24);
  const onHeroMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onCardMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  const activeMode = MODES.find((m) => m.id === mode)!;
  const wallItems = wall.data ?? [];

  return (
    <div className="overflow-x-hidden">
      {/* Hero — full screen */}
      <section
        onMouseMove={onHeroMove}
        data-testid="home-hero"
        className="relative flex min-h-[calc(100svh-74px)] flex-col overflow-hidden bg-navy text-white"
      >
        <motion.img
          style={{ x: bgX, y: bgY, scale: 1.08 }}
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=srgb&fm=jpg&q=75&w=2000"
          alt="Produk segar di supermarket"
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/10" />
        <div className="relative flex flex-1 flex-col justify-center px-4 py-16 md:px-10 lg:px-16">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex w-fit items-center gap-2 rounded-full bg-market-red px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
            Insan Bersuara · Where Every Voice Matters
          </motion.p>
          <motion.h1
            data-testid="page-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-5 max-w-5xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl xl:text-8xl"
          >
            Sampaikan{" "}
            <span className="relative inline-flex h-[1.1em] overflow-hidden align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={WORDS[word]}
                  data-testid="hero-rotating-word"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[#E9D48B]"
                >
                  {WORDS[word]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br />Anda, langsung ke Top Management.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200 md:text-xl">
            Bersama menyuarakan, bersama mewujudkan.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-9 flex flex-wrap gap-3">
            <Link to="/vtt" data-testid="hero-send-vtt-button" className={cn(buttonVariants({ size: "lg" }), "group h-13 bg-teal px-7 text-base text-white shadow-[0_8px_24px_rgba(18,128,92,0.45)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-teal/90")}>
              Sampaikan Suara Anda <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/lacak"
              data-testid="hero-track-button"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-13 border-white/30 bg-white/5 px-7 text-base text-white backdrop-blur hover:bg-white/15 hover:text-white")}
            >
              <Search className="size-4" /> Lacak Tiket Saya
            </Link>
          </motion.div>
        </div>
        <a href="#cara" data-testid="hero-scroll-hint" className="relative mx-auto mb-4 flex flex-col items-center text-xs text-white/70 transition-colors duration-150 hover:text-white">
          Geser untuk memilih
          <ChevronDown className="mt-1 size-5 animate-bounce" />
        </a>
        <div className="relative overflow-hidden bg-market-red py-3 text-white" aria-hidden>
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-sm font-semibold">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i} className="flex items-center gap-10">{m}<span className="text-[#E9D48B]">✦</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="cara" className="scroll-mt-20 px-4 py-20 md:px-10 lg:px-16">
        <Reveal>
          <SectionLabel n="01">Kategori</SectionLabel>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-navy md:text-5xl">Enam cara untuk didengar</h2>
            <p className="max-w-md text-sm text-muted-foreground">Arahkan kursor dan pilih yang paling sesuai. Setiap pesan ditinjau dan dapat dipantau melalui nomor tiket.</p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.id} delay={i * 0.06}>
                <Link
                  to={`/vtt?kategori=${c.id}`}
                  data-testid={`home-category-${c.id}`}
                  onMouseMove={onCardMove}
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E7E1D3] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1.5 hover:border-teal/40 hover:shadow-[0_18px_40px_rgba(11,61,46,0.14)]",
                    c.open && "bg-gradient-to-br from-amber-50 to-white",
                  )}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: "radial-gradient(260px circle at var(--x, 50%) var(--y, 50%), rgba(18,128,92,0.12), transparent 65%)" }}
                  />
                  <div className="-mx-6 -mt-6 mb-5 flex items-center justify-between bg-navy px-6 py-2.5 text-white transition-colors duration-300 group-hover:bg-teal">
                    <span data-testid={`aisle-sign-${c.id}`} aria-hidden className="flex items-center gap-1.5">
                      {[0, 1, 2, 3, 4].map((d) => (
                        <span
                          key={d}
                          style={{ transitionDelay: `${d * 50}ms`, opacity: 1 - d * 0.17 }}
                          className="text-[11px] leading-none text-[#E9D48B] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-45"
                        >
                          ✦
                        </span>
                      ))}
                    </span>
                    <ArrowUpRight className="size-4 text-white/60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </div>
                  <div className="relative flex items-start justify-between">
                    <span className={cn("flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110", c.tile)}><Icon className="size-5" /></span>
                    <span className="relative rounded-md rounded-l-none bg-[#E9D48B] py-1 pl-3 pr-2.5 text-[11px] font-bold text-navy before:absolute before:-left-2 before:top-0 before:h-full before:w-2 before:bg-[#E9D48B] before:[clip-path:polygon(100%_0,0_50%,100%_100%)]">
                      {c.kind}
                    </span>
                  </div>
                  <h3 className="relative mt-5 text-xl font-semibold text-foreground">{c.name}</h3>
                  <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                  <div className="relative mt-5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      {c.open ? <Globe2 className="size-3.5" /> : <Lock className="size-3.5" />}
                      {c.open ? "Terbuka · Dinding Apresiasi" : "Tertutup · HC serta CEO & CHCO"}
                    </span>
                    <span className="inline-flex translate-x-2 items-center gap-1 text-sm font-semibold text-teal opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                      Tulis <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Mode explorer */}
      <section className="gingham px-4 py-20 md:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <Reveal>
            <SectionLabel n="02">Cara Mengirim</SectionLabel>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy md:text-5xl">Anda yang menentukan siapa yang tahu.</h2>
            <p className="mt-4 max-w-lg text-muted-foreground">Klik setiap pilihan untuk melihat siapa yang dapat melihat identitas Anda.</p>
            <div className="mt-8 flex flex-wrap gap-3" role="tablist">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.id}
                  data-testid={`home-mode-${m.id}`}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-[background-color,color,border-color,transform] duration-200 active:scale-95",
                    mode === m.id ? "border-navy bg-navy text-white" : "border-[#D6CFBF] bg-white text-navy hover:border-teal",
                  )}
                >
                  <m.icon className="size-4" /> {m.label}
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-[#E7E1D3] bg-white p-6 shadow-[0_18px_40px_rgba(11,61,46,0.08)] md:p-8">
              <AnimatePresence mode="wait">
                <motion.div key={mode} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                  <div className="flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-teal"><activeMode.icon className="size-6" /></span>
                    <div>
                      <p data-testid="home-mode-title" className="font-heading text-2xl font-bold text-navy">{activeMode.label}</p>
                      <p className="text-sm text-muted-foreground">{activeMode.desc}</p>
                    </div>
                  </div>
                  <ul className="mt-6 divide-y divide-[#EFEAE0]">
                    {[
                      { l: "Human Capital (peninjau)", v: activeMode.hc },
                      { l: "CEO & CHCO", v: activeMode.exec },
                      { l: "Karyawan lain", v: activeMode.peers },
                    ].map((r) => (
                      <li key={r.l} className="flex items-center justify-between py-3.5 text-sm">
                        <span className="text-foreground">{r.l}</span>
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", r.v ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600")}>
                          {r.v ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                          {r.v ? "Melihat nama" : "Tidak melihat nama"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-muted-foreground">Kategori tertutup tidak pernah terlihat oleh karyawan lain, apa pun cara mengirimnya.</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Process — interactive stepper */}
      <section className="px-4 py-20 md:px-10 lg:px-16">
        <Reveal>
          <SectionLabel n="03">Cara Kerja</SectionLabel>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-navy md:text-5xl">Dari suara menjadi tanggapan</h2>
            <Link to="/cara-kerja" data-testid="home-cara-kerja-link" className="text-sm font-medium text-sky-700 hover:underline">Selengkapnya</Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <ol className="space-y-2" onMouseEnter={() => setAutoStep(false)}>
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  data-testid={`home-step-${i + 1}`}
                  onClick={() => { setStep(i); setAutoStep(false); }}
                  className={cn(
                    "relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border px-5 py-4 text-left transition-[background-color,border-color] duration-200",
                    step === i ? "border-teal bg-white shadow-[0_8px_24px_rgba(11,61,46,0.08)]" : "border-transparent hover:bg-white/70",
                  )}
                >
                  <span className={cn("font-mono text-2xl font-bold transition-colors duration-200", step === i ? "text-teal" : "text-teal/30")}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={cn("font-heading text-lg font-semibold", step === i ? "text-navy" : "text-slate-500")}>{s.title}</span>
                  {step === i && autoStep && (
                    <motion.span key={`bar-${i}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 3.8, ease: "linear" }} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-teal" />
                  )}
                </button>
              </li>
            ))}
          </ol>
          <div className="relative overflow-hidden rounded-3xl bg-navy p-8 text-white md:p-10">
            <div className="awning absolute inset-x-0 top-0 h-2" aria-hidden />
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} data-testid="home-step-detail">
                <p className="font-mono text-sm text-[#E9D48B]">Langkah {step + 1} dari {STEPS.length}</p>
                <h3 className="mt-3 text-3xl font-bold md:text-4xl">{STEPS[step].title}</h3>
                <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-200">{STEPS[step].text}</p>
                <span className="mt-6 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Status tiket: {STEPS[step].status}</span>
              </motion.div>
            </AnimatePresence>
            <div className="mt-10 flex gap-1.5">
              {STEPS.map((_, i) => (
                <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-300", i <= step ? "bg-teal" : "bg-white/15")} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wall carousel */}
      <section className="bg-amber-50/60 py-20">
        <Reveal className="px-4 md:px-10 lg:px-16">
          <SectionLabel n="04">Dinding Apresiasi</SectionLabel>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-navy md:text-5xl">Insan yang menginspirasi kita.</h2>
            <Link to="/dinding-apresiasi" data-testid="home-wall-link" className="text-sm font-medium text-sky-700 hover:underline">Lihat semua</Link>
          </div>
        </Reveal>
        <div className="group mt-10 overflow-hidden">
          {wall.isError && <p className="px-4 text-sm text-muted-foreground md:px-10 lg:px-16">Dinding Apresiasi belum dapat dimuat.</p>}
          {wall.isSuccess && wallItems.length === 0 && <p className="px-4 text-sm text-muted-foreground md:px-10 lg:px-16">Belum ada apresiasi.</p>}
          {!wall.isError && wallItems.length > 0 && (
            <div className="flex w-max animate-marquee gap-5 pl-4 group-hover:[animation-play-state:paused] md:pl-10 lg:pl-16" style={{ animationDuration: "50s" }}>
              {[...wallItems, ...wallItems, ...wallItems, ...wallItems].slice(0, Math.max(8, wallItems.length * 2)).map((w, i) => (
                <figure
                  key={`${w.id}-${i}`}
                  data-testid="home-wall-item"
                  className="w-80 shrink-0 rounded-2xl border border-amber-100 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-[-1deg]"
                >
                  <Quote className="size-5 text-amber-500" />
                  <blockquote className="mt-3 line-clamp-4 text-sm leading-relaxed text-slate-700">“{w.message}”</blockquote>
                  <figcaption className="mt-4">
                    <span className="block font-semibold text-amber-900">{w.recipient_name}</span>
                    <span className="text-xs text-muted-foreground">dari {w.sender_display}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Other channels */}
      <section className="grid gap-5 px-4 py-20 md:grid-cols-2 md:px-10 lg:px-16">
        <Reveal>
          <Link to="/wbs" data-testid="home-wbs-card" className="group flex h-full gap-5 rounded-3xl border border-[#E7E1D3] bg-white p-8 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(11,61,46,0.12)]">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-navy transition-transform duration-300 group-hover:scale-110"><ShieldAlert className="size-6" /></span>
            <span className="flex-1">
              <span className="block font-heading text-xl font-semibold text-foreground">Whistle Blowing System</span>
              <span className="mt-1 block text-sm text-muted-foreground">Laporkan dugaan pelanggaran melalui kanal terpisah yang independen.</span>
            </span>
            <ArrowUpRight className="size-5 text-slate-400 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-navy" />
          </Link>
        </Reveal>
        <Reveal delay={0.08}>
          <Link to="/hotline-hc" data-testid="home-hotline-card" className="group flex h-full gap-5 rounded-3xl border border-rose-100 bg-rose-50/70 p-8 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(180,22,27,0.12)]">
            <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-market-red">
              <span className="absolute inset-0 animate-ping rounded-2xl bg-rose-200/60" />
              <Phone className="relative size-6" />
            </span>
            <span className="flex-1">
              <span className="block font-heading text-xl font-semibold text-foreground">Hotline Human Capital</span>
              <span className="mt-1 block text-sm text-muted-foreground">Kecelakaan kerja, darurat BPJS, dan keadaan darurat lainnya.</span>
            </span>
            <ArrowUpRight className="size-5 text-rose-300 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-market-red" />
          </Link>
        </Reveal>
      </section>

      {/* Final CTA — full bleed */}
      <section className="relative overflow-hidden bg-navy text-center text-white">
        <div className="awning h-3" aria-hidden />
        <div className="px-4 py-24 md:px-10">
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">Setiap Suara Insan SBL Berkontribusi pada Perubahan</h2>
            <Link to="/vtt" data-testid="footer-cta-send" className={cn(buttonVariants({ size: "lg" }), "group mt-10 h-13 bg-teal px-8 text-base text-white transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-teal/90")}>
              Sampaikan Suara Anda <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
