import { NavLink, Navigate, Outlet, Link } from "react-router-dom";
import { LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api";
import { useMe, useSummary } from "@/lib/hooks";
import { endSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import BrandLogo from "@/components/common/BrandLogo";
import type { Role, Summary } from "@/lib/types";

interface NavItem {
  to: string;
  label: string;
  testid: string;
  count?: (s: Summary) => number;
}

const NAV: Record<Role, NavItem[]> = {
  hc: [
    { to: "/hc", label: "Moderasi Pesan", testid: "nav-hc-moderasi", count: (s) => s.hc_pending },
    { to: "/manajemen/dinding-apresiasi", label: "Dinding Apresiasi", testid: "nav-m-dinding" },
    { to: "/manajemen/cara-kerja", label: "Cara Kerja", testid: "nav-m-cara-kerja" },
  ],
  exec: [
    { to: "/eksekutif", label: "Kotak Masuk", testid: "nav-exec-inbox", count: (s) => s.exec_pending },
    { to: "/eksekutif/rekap", label: "Rekap & Audit", testid: "nav-exec-rekap" },
    { to: "/manajemen/dinding-apresiasi", label: "Dinding Apresiasi", testid: "nav-m-dinding" },
    { to: "/manajemen/cara-kerja", label: "Cara Kerja", testid: "nav-m-cara-kerja" },
  ],
};

// Management-only shell (Human Capital, CEO & CHCO). Unauthenticated visitors go to /login.
export default function AppShell() {
  const me = useMe();
  const summary = useSummary(me.isSuccess);

  if (me.error instanceof ApiError && me.error.status === 401) return <Navigate to="/login" replace />;

  const user = me.data;
  const items = user ? NAV[user.role] : [];

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-[#E7E1D3] bg-white/90 backdrop-blur-md">
        <div className="awning h-2" aria-hidden />
        <div className="flex w-full items-center gap-6 px-4 py-3 md:px-10 lg:px-16">
          <Link to={user?.role === "exec" ? "/eksekutif" : "/hc"} data-testid="brand-home-link" className="flex items-center gap-2.5">
            <BrandLogo subtitle="Ruang Manajemen" />
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/" data-testid="header-public-site" className="hidden items-center gap-1 text-xs font-medium text-sky-700 hover:underline md:inline-flex">
              Situs publik <ExternalLink className="size-3" />
            </Link>
            {user && (
              <div className="hidden text-right sm:block">
                <p data-testid="current-user-name" className="text-sm font-semibold text-foreground">{user.name}</p>
                <p data-testid="current-user-role" className="text-[11px] text-muted-foreground">
                  {ROLE_LABEL[user.role]} · {user.title}
                </p>
              </div>
            )}
            <Button data-testid="logout-button" variant="ghost" size="icon-sm" aria-label="Keluar" onClick={() => void endSession("/login")}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
        <nav className="flex w-full gap-1 overflow-x-auto px-4 pb-2 md:px-10 lg:px-16">
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
                  <span data-testid={`${item.testid}-count`} className="rounded-full bg-teal px-1.5 py-px text-[10px] font-bold text-white">
                    {n}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </header>
      <main className="w-full px-4 py-8 md:px-10 md:py-10 lg:px-16">
        <Outlet />
      </main>
      <Toaster richColors />
    </div>
  );
}
