import { cn } from "@/lib/utils";

// Supra Boga Lestari mark + product name. `light` for dark backgrounds.
export default function BrandLogo({ subtitle = "Where Every Voice Matters", light = false, className }: { subtitle?: string; light?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <img src="/logo-sbl.png" alt="Supra Boga Lestari" data-testid="brand-logo-img" className={cn("h-9 w-auto md:h-10", light && "rounded-md bg-white/95 p-1")} />
      <span className={cn("h-8 w-px", light ? "bg-white/30" : "bg-gold/40")} aria-hidden />
      <span className="leading-tight">
        <span className={cn("block font-heading text-[16px] font-bold tracking-tight", light ? "text-white" : "text-navy")}>Insan Bersuara</span>
        <span className={cn("block text-[11px]", light ? "text-white/70" : "text-muted-foreground")}>{subtitle}</span>
      </span>
    </span>
  );
}
