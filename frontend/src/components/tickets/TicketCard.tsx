import { useNavigate } from "react-router-dom";
import { MessageCircleReply, RotateCcw, AlertCircle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryPill, StatusBadge, SlaBadge } from "@/components/common/Badges";
import StatusTimeline from "@/components/common/StatusTimeline";
import { MODE_LABEL, fmtDate, fmtDateTime } from "@/lib/constants";
import type { Ticket, TicketCreate } from "@/lib/types";

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const navigate = useNavigate();
  const resubmit = () => {
    const prefill: Partial<TicketCreate> = {
      category: ticket.category,
      mode: ticket.mode,
      title: ticket.title,
      message: ticket.message,
      recipient_name: ticket.recipient_name,
      resubmitted_from: ticket.ticket_no,
    };
    navigate("/vtt", { state: { prefill } });
  };

  return (
    <article
      data-testid={`ticket-card-${ticket.ticket_no}`}
      className="animate-rise rounded-xl border border-slate-200/80 bg-card p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] md:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span data-testid="ticket-number" className="font-mono text-sm font-semibold text-navy">
          {ticket.ticket_no}
        </span>
        <CategoryPill category={ticket.category} />
        <StatusBadge status={ticket.status} />
        <SlaBadge state={ticket.sla_state} />
        <span className="ml-auto text-xs text-muted-foreground">
          {MODE_LABEL[ticket.mode]} · {fmtDate(ticket.created_at)}
        </span>
      </div>
      <h3 data-testid="ticket-title" className="mt-3 text-lg font-semibold text-foreground">
        {ticket.title}
      </h3>
      {ticket.recipient_name && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <UserRound className="size-4" /> Untuk {ticket.recipient_name}
        </p>
      )}
      <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{ticket.message}</p>
      {ticket.resubmitted_from && (
        <p className="mt-2 text-xs text-muted-foreground">Kiriman ulang dari {ticket.resubmitted_from}</p>
      )}

      <div className="mt-5 rounded-lg bg-secondary/70 p-4">
        <StatusTimeline ticket={ticket} />
      </div>

      {ticket.status === "ditolak" && (
        <div data-testid="rejection-box" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-rose-800">
            <AlertCircle className="size-4" /> Alasan penolakan dari Human Capital
          </p>
          <p data-testid="rejection-reason" className="mt-1.5 text-sm text-rose-900">
            {ticket.rejection_reason}
          </p>
          <Button data-testid="resubmit-button" size="sm" variant="outline" className="mt-3" onClick={resubmit}>
            <RotateCcw className="size-4" /> Perbaiki & kirim ulang
          </Button>
        </div>
      )}

      {ticket.reply && (
        <div data-testid="reply-box" className="mt-4 rounded-lg border border-teal-200 bg-teal-50/60 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-teal-900">
            <MessageCircleReply className="size-4" /> Balasan dari {ticket.reply.by_name}
          </p>
          <p data-testid="reply-message" className="mt-1.5 whitespace-pre-line text-sm text-slate-700">
            {ticket.reply.message}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{fmtDateTime(ticket.reply.at)}</p>
        </div>
      )}
    </article>
  );
}
