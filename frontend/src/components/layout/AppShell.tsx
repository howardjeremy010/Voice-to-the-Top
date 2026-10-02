import { NavLink, Navigate, Outlet, Link } from "react-router-dom";
import { LogOut, Phone, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api";
import { useMe, useSummary } from "@/lib/hooks";
import { endSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Role, Summary } from "@/lib/types";

interface NavItem {
  to: string;
  label: string;
  testid: string;
  count?: (s: Summary) => number;
}

const NAV: Record<Role, NavItem[]> = {
  karyawan: [
    { to: "/", label: "Beranda", testid: "nav-beranda" },
    { to: "/dinding-apresiasi", label: "Dinding Apresiasi", testid: "nav-dinding" },
    { to: "/tiket-saya", label: "Tiket Saya", testid: "nav-tiket", count: (s) => s.my_open },
    { to: "/vtt", label: "Voice to the Top", testid: "nav-vtt" },
    { to: "/wbs", label: "Whistle Blowing", testid: "nav-wbs" },
    { to: "/hotline-hc", label: "Hotline HC", testid: "nav-hotline" },
    { to: "/cara-kerja", label: "Cara Kerja", testid: "nav-cara-kerja" },
  ],
  hc: [
    { to: "/hc", label: "Moderasi Pesan", testid: "nav-hc-moderasi", count: (s) => s.hc_pending },
    { to: "/dinding-apresiasi", label: "Dinding Apresiasi", testid: "nav-dinding" },
    { to: "/cara-kerja", label: "Cara Kerja", testid: "nav-cara-kerja" },
  ],
  exec: [
    { to: "/eksekutif", label: "Kotak Masuk", testid: "nav-exec-inbox", count: (s) => s.exec_pending },
    { to: "/eksekutif/rekap", label: "Rekap & Audit", testid: "nav-exec-rekap" },
    { to: "/dinding-apresiasi", label: "Dinding Apresiasi", testid: "nav-dinding" },
    { to: "/cara-kerja", label: "Cara Kerja", testid: "nav-cara-kerja" },
  ],
};

export default function AppShell() {
  const me = useMe();
  const summary = useSummary(me.isSuccess);

  if (me.error instanceof ApiError && me.error.status === 401) return <Navigate to="/login" replace />;

  const user = me.data;
  const items = NAV[user?.role ?? "karyawan"];

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 md:px-8">
          <Link to="/" data-testid="brand-home-link" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-navy text-white">
              <Megaphone className="size-4.5" />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-bold tracking-tight text-navy">Insan Bersuara</span>
              <span className="block text-[11px] text-muted-foreground">Where Every Voice Matters</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            {user?.role === "karyawan" && (
              <Link
                to="/hotline-hc"
                data-testid="header-hotline-pill"
                className="hidden items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 transition-colors duration-150 hover:bg-rose-100 md:inline-flex"
              >
                <Phone className="size-3.5" /> Darurat? Hotline HC
              </Link>
            )}
            {user && (
              <div className="hidden text-right sm:block">
                <p data-testid="current-user-name" className="text-sm font-semibold text-foreground">
                  {user.name}
                </p>
                <p data-testid="current-user-role" className="text-[11px] text-muted-foreground">
                  {ROLE_LABEL[user.role]} · {user.title}
                </p>
              </div>
            )}
            <Button
              data-testid="logout-button"
              variant="ghost"
              size="icon-sm"
              aria-label="Keluar"
              onClick={() => void endSession()}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 md:px-8">
          {items.map((item) => {
            const n = item.count && summary.data ? item.count(summary.data) : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                data-testid={item.testid}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
                    isActive ? "bg-navy text-white" : "text-slate-600 hover:bg-slate-100 hover:text-foreground",
                  )
                }
              >
                {item.label}
                {n > 0 && (
                  <span
                    data-testid={`${item.testid}-count`}
                    className="rounded-full bg-teal px-1.5 py-px text-[10px] font-bold text-white"
                  >
                    {n}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <Outlet context={user} />
      </main>
      <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-muted-foreground">
        Insan Bersuara · Where Every Voice Matters
      </footer>
      <Toaster richColors />
    </div>
  );
}
