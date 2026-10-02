import { cn } from "@/lib/utils";
import { CATEGORY_BY_ID, STATUS_META } from "@/lib/constants";
import type { Category, SlaState, Status } from "@/lib/types";

export function CategoryPill({ category, className }: { category: Category; className?: string }) {
  const meta = CATEGORY_BY_ID[category];
  const Icon = meta.icon;
  return (
    <span
      data-testid="category-pill"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        meta.pill,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {meta.name}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      data-testid="ticket-status-badge"
      className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", meta.className)}
    >
      {meta.label}
    </span>
  );
}

const SLA: Record<SlaState, { label: string; className: string; dot: string }> = {
  tepat_waktu: { label: "Sesuai target", className: "bg-sky-50 text-sky-800", dot: "bg-sky-500" },
  mendekati: { label: "Mendekati batas", className: "bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  terlambat: { label: "Melewati batas", className: "bg-red-100 text-red-800", dot: "bg-red-600 animate-soft-pulse" },
};

export function SlaBadge({ state }: { state: SlaState | null }) {
  if (!state) return null;
  const s = SLA[state];
  return (
    <span
      data-testid="sla-badge"
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", s.className)}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
