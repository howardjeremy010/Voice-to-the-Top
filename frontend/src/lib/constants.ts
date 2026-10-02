import { Award, Compass, TrendingUp, Lightbulb, HeartHandshake, MessagesSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category, Mode, Status, Role } from "./types";

export interface CategoryMeta {
  id: Category;
  name: string;
  kind: string;
  description: string;
  open: boolean;
  icon: LucideIcon;
  pill: string; // tailwind classes for tinted pill
  tile: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "apresiasi",
    name: "Insan Menginspirasi",
    kind: "Apresiasi",
    description: "Menghargai kerja sama, pelayanan, atau kepemimpinan rekan.",
    open: true,
    icon: Award,
    pill: "bg-amber-100 text-amber-900",
    tile: "bg-amber-50 text-amber-800",
  },
  {
    id: "aspirasi",
    name: "Asa Insan",
    kind: "Aspirasi",
    description: "Menyampaikan harapan terkait karier, pengembangan diri, dan masa depan bersama perusahaan.",
    open: false,
    icon: Compass,
    pill: "bg-sky-100 text-sky-800",
    tile: "bg-sky-50 text-sky-800",
  },
  {
    id: "perbaikan",
    name: "Insan Bertumbuh",
    kind: "Perbaikan/Saran",
    description: "Menyampaikan saran perbaikan atas proses kerja, kebijakan, atau fasilitas.",
    open: false,
    icon: TrendingUp,
    pill: "bg-emerald-100 text-emerald-800",
    tile: "bg-emerald-50 text-emerald-800",
  },
  {
    id: "inovasi",
    name: "Insan Berkarya",
    kind: "Ide Inovasi",
    description: "Membagikan ide dan gagasan baru untuk kemajuan perusahaan.",
    open: false,
    icon: Lightbulb,
    pill: "bg-violet-100 text-violet-800",
    tile: "bg-violet-50 text-violet-800",
  },
  {
    id: "keluhan",
    name: "Ruang Peduli Insan",
    kind: "Keluhan Tempat Kerja",
    description: "Menyampaikan keluhan atau kendala di tempat kerja yang perlu mendapat perhatian.",
    open: false,
    icon: HeartHandshake,
    pill: "bg-rose-100 text-rose-800",
    tile: "bg-rose-50 text-rose-800",
  },
  {
    id: "opini",
    name: "Ragam Insan",
    kind: "Opini Umum",
    description: "Menyampaikan pandangan atau pendapat umum tentang perusahaan dan budaya kerja.",
    open: false,
    icon: MessagesSquare,
    pill: "bg-slate-200 text-slate-700",
    tile: "bg-slate-100 text-slate-700",
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  Category,
  CategoryMeta
>;

export const MODES: { id: Mode; title: string; description: string }[] = [
  {
    id: "rahasia",
    title: "Rahasia",
    description: "Identitas Anda hanya terlihat oleh peninjau berwenang (Human Capital serta CEO & CHCO).",
  },
  {
    id: "bernama",
    title: "Bernama",
    description: "Nama Anda dibagikan secara terbuka bersama pesan.",
  },
  {
    id: "anonim",
    title: "Anonim",
    description: "Identitas tidak dikumpulkan. Pantau tiket dan balasan hanya melalui nomor tiket dan kode akses.",
  },
];

export const MODE_LABEL: Record<Mode, string> = { rahasia: "Rahasia", bernama: "Bernama", anonim: "Anonim" };

export const STATUS_META: Record<Status, { label: string; className: string }> = {
  terkirim: { label: "Terkirim", className: "bg-slate-100 text-slate-700 border-slate-200" },
  ditinjau: { label: "Ditinjau", className: "bg-sky-50 text-sky-800 border-sky-200" },
  diteruskan: { label: "Diteruskan", className: "bg-teal-50 text-teal-800 border-teal-200" },
  disetujui: { label: "Disetujui", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  ditindaklanjuti: { label: "Ditindaklanjuti", className: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  ditolak: { label: "Ditolak", className: "bg-rose-50 text-rose-800 border-rose-200" },
  selesai: { label: "Selesai", className: "bg-navy text-white border-navy" },
};

export const ROLE_LABEL: Record<Role, string> = {
  karyawan: "Karyawan",
  hc: "Human Capital",
  exec: "CEO & CHCO",
};

export const ROLE_HOME: Record<Role, string> = { karyawan: "/", hc: "/hc", exec: "/eksekutif" };

// PLACEHOLDER — replace with the real URLs/number once available.
export const WBS_URL = "https://wbs.perusahaan.co.id";
export const HOTLINE_WA_NUMBER = "6281200000000";
export const HOTLINE_WA_DISPLAY = "+62 812-0000-0000";
export const HOTLINE_FEEDBACK_URL = "https://forms.gle/contoh-feedback-hotline-hc";
export const hotlineWaUrl = (text = "Halo Hotline Human Capital, saya membutuhkan bantuan terkait ") =>
  `https://wa.me/${HOTLINE_WA_NUMBER}?text=${encodeURIComponent(text)}`;

export const DEMO_PASSWORD = "Insan2026!";
export const DEMO_ACCOUNTS: { email: string; name: string; role: Role; note: string }[] = [
  { email: "siti@insan.co.id", name: "Siti Rahmawati", role: "karyawan", note: "Operasional" },
  { email: "andi@insan.co.id", name: "Andi Wijaya", role: "karyawan", note: "Keuangan" },
  { email: "hc@insan.co.id", name: "Budi Prasetyo", role: "hc", note: "Human Capital Lead" },
  { email: "ceo@insan.co.id", name: "Hendra Kusuma", role: "exec", note: "CEO" },
  { email: "chco@insan.co.id", name: "Maya Arifin", role: "exec", note: "CHCO" },
];

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const dtfTime = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
export const fmtDate = (iso: string) => dtf.format(new Date(iso));
export const fmtDateTime = (iso: string) => dtfTime.format(new Date(iso));
