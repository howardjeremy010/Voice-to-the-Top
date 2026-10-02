import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_META, fmtDateTime } from "@/lib/constants";
import type { Ticket, Status } from "@/lib/types";

function pathFor(t: Ticket): Status[] {
  if (t.status === "ditolak") return ["terkirim", "ditinjau", "ditolak"];
  if (t.category === "apresiasi") return ["terkirim", "ditinjau", "disetujui"];
  return ["terkirim", "ditinjau", "diteruskan", "ditindaklanjuti", "selesai"];
}

export default function StatusTimeline({ ticket }: { ticket: Ticket }) {
  const steps = pathFor(ticket);
  const reached = new Map(ticket.history.map((h) => [h.status, h]));
  // "Selesai" implies earlier closed-path steps even if skipped (e.g. reply without explicit follow-up).
  const currentIdx = steps.indexOf(ticket.status);
  return (
    <ol data-testid="status-timeline" className="flex flex-wrap items-start gap-y-3">
      {steps.map((s, i) => {
        const done = i <= currentIdx || reached.has(s);
        const h = reached.get(s);
        const rejected = s === "ditolak";
        return (
          <li key={s} className="flex min-w-[96px] flex-1 items-start">
            <div className="flex flex-col items-start gap-1.5">
              <div className="flex items-center">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border text-[11px] font-bold transition-colors duration-200",
                    done
                      ? rejected
                        ? "border-rose-600 bg-rose-600 text-white"
                        : "border-teal bg-teal text-white"
                      : "border-slate-300 bg-white text-slate-400",
                  )}
                >
                  {done ? rejected ? <X className="size-3.5" /> : <Check className="size-3.5" /> : i + 1}
                </span>
              </div>
              <span className={cn("text-xs font-semibold", done ? "text-foreground" : "text-muted-foreground")}>
                {STATUS_META[s].label}
              </span>
              {h && <span className="text-[11px] text-muted-foreground">{fmtDateTime(h.at)}</span>}
            </div>
            {i < steps.length - 1 && (
              <span
                className={cn("mx-2 mt-3 h-px flex-1", i < currentIdx ? "bg-teal" : "bg-slate-200")}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
