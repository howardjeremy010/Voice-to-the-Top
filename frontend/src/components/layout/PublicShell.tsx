import { useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { Phone, Menu, X, LogIn } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import BrandLogo from "@/components/common/BrandLogo";

const NAV = [
  { to: "/", label: "Beranda", testid: "nav-beranda" },
  { to: "/vtt", label: "Voice to the Top", testid: "nav-vtt" },
  { to: "/lacak", label: "Lacak Tiket", testid: "nav-lacak" },
  { to: "/dinding-apresiasi", label: "Dinding Apresiasi", testid: "nav-dinding" },
  { to: "/wbs", label: "Whistle Blowing", testid: "nav-wbs" },
  { to: "/hotline-hc", label: "Hotline HC", testid: "nav-hotline" },
  { to: "/cara-kerja", label: "Cara Kerja", testid: "nav-cara-kerja" },
];

export default function PublicShell() {
  const [open, setOpen] = useState(false);
  const isHome = useLocation().pathname === "/";
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-[#E7E1D3] bg-white/90 backdrop-blur-md">
        <div className="awning h-2" aria-hidden />
        <div className="flex w-full items-center gap-4 px-4 py-3 md:px-10 lg:px-16">
          <Link to="/" data-testid="brand-home-link" className="flex items-center gap-2.5">
            <BrandLogo subtitle="Where Every Voice Matters" />
          </Link>
          <nav className="hidden flex-1 items-center gap-0.5 xl:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                data-testid={item.testid}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors duration-150",
                    isActive ? "bg-navy text-white" : "text-slate-600 hover:bg-slate-100 hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/hotline-hc"
              data-testid="header-hotline-pill"
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 transition-colors duration-150 hover:bg-rose-100 md:inline-flex xl:hidden 2xl:inline-flex"
            >
              <Phone className="size-3.5" /> Darurat?
            </Link>
            <Link
              to="/login"
              data-testid="header-management-login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden whitespace-nowrap sm:inline-flex")}
            >
              <LogIn className="size-3.5" /> Masuk Manajemen
            </Link>
            <button
              type="button"
              data-testid="mobile-menu-toggle"
              aria-label="Menu"
              onClick={() => setOpen((o) => !o)}
              className="rounded-lg p-2 text-navy transition-colors duration-150 hover:bg-slate-100 xl:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="grid gap-1 border-t border-slate-100 px-4 py-3 xl:hidden" data-testid="mobile-menu">
            {[...NAV, { to: "/login", label: "Masuk Manajemen", testid: "nav-login-mobile" }].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                data-testid={`${item.testid}-mobile`}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn("rounded-lg px-3 py-2 text-sm font-medium", isActive ? "bg-navy text-white" : "text-slate-700 hover:bg-slate-100")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className={cn("w-full", !isHome && "px-4 py-10 md:px-10 md:py-14 lg:px-16")}>
        <Outlet />
      </main>
      <footer className="border-t border-[#E7E1D3] bg-white">
        <div className="awning-green h-1.5" aria-hidden />
        <div className="flex w-full flex-wrap items-center justify-between gap-6 px-4 py-8 text-xs text-muted-foreground md:px-10 lg:px-16">
          <div className="flex items-center gap-4">
            <img src="/logo-sbl-group.png" alt="Supra Boga Lestari — Farmers Market dan Ranch Market" data-testid="footer-group-logo" className="h-16 w-auto" />
            <span className="max-w-[220px]">Insan Bersuara · Where Every Voice Matters. Kanal suara insan PT Supra Boga Lestari.</span>
          </div>
          <Link to="/login" data-testid="footer-management-login" className="hover:text-navy">
            Akses Manajemen (Human Capital, CEO & CHCO)
          </Link>
        </div>
      </footer>
      <Toaster richColors />
    </div>
  );
}
