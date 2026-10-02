import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Award, Quote } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import { apiGet } from "@/lib/api";
import { fmtDate } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { WallItem } from "@/lib/types";

const TINTS = ["bg-amber-50", "bg-white", "bg-teal-50/60", "bg-sky-50/60", "bg-white", "bg-amber-50/60"];

export default function DindingApresiasi({ readOnly = false }: { readOnly?: boolean }) {
  const wall = useQuery({ queryKey: ["wall"], queryFn: () => apiGet<WallItem[]>("/wall"), retry: false });

  return (
    <div>
      <PageHeader
        eyebrow="Insan Menginspirasi"
        title="Dinding Apresiasi"
        description="Ucapan terima kasih dan pengakuan antarinsan yang telah disetujui Human Capital."
        action={
          !readOnly ? (
            <Link to="/vtt?kategori=apresiasi" data-testid="wall-send-appreciation" className={cn(buttonVariants(), "bg-teal text-white hover:bg-teal/90")}>
              <Award className="size-4" /> Beri apresiasi
            </Link>
          ) : (
            <span data-testid="wall-readonly-note" className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Mode baca
            </span>
          )
        }
      />
      {wall.isPending && <div className="h-48 animate-pulse rounded-xl bg-slate-100" />}
      {wall.isError && <p className="text-sm text-muted-foreground">Dinding Apresiasi belum dapat dimuat.</p>}
      {wall.isSuccess && wall.data.length === 0 && (
        <p data-testid="wall-empty" className="text-sm text-muted-foreground">Belum ada apresiasi yang ditampilkan.</p>
      )}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3" data-testid="wall-grid">
        {!wall.isError &&
          wall.data?.map((w, i) => (
            <article
              key={w.id}
              data-testid="wall-card"
              style={{ animationDelay: `${(i % 9) * 60}ms` }}
              className={cn(
                "mb-4 break-inside-avoid animate-rise rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
                TINTS[i % TINTS.length],
              )}
            >
              <Quote className="size-6 text-amber-500" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-amber-800">Untuk</p>
              <p data-testid="wall-card-recipient" className="text-lg font-bold text-navy">{w.recipient_name}</p>
              <h3 className="mt-3 font-semibold text-foreground">{w.title}</h3>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{w.message}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span data-testid="wall-card-sender">dari {w.sender_display}</span>
                <span>{fmtDate(w.published_at)}</span>
              </div>
            </article>
          ))}
      </div>
    </div>
  );
}
