"""Ticket helpers: SLA working-day math, serialization per viewer, audit logging."""

import uuid
from datetime import datetime, timedelta, timezone

from lib.db import db
from models.schemas import Reply, HistoryItem, Ticket

HC_REVIEW_DAYS = 3
RESPONSE_DAYS = 7

CATEGORY_NAMES = {
    "apresiasi": "Insan Menginspirasi",
    "aspirasi": "Asa Insan",
    "perbaikan": "Insan Bertumbuh",
    "inovasi": "Insan Berkarya",
    "keluhan": "Ruang Peduli Insan",
    "opini": "Ragam Insan",
}


def now() -> datetime:
    return datetime.now(timezone.utc)


def aware(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def add_working_days(start: datetime, days: int) -> datetime:
    d = start
    added = 0
    while added < days:
        d += timedelta(days=1)
        if d.weekday() < 5:
            added += 1
    return d


def sla_state(doc: dict) -> str | None:
    status = doc["status"]
    if status in ("terkirim", "ditinjau"):
        due = aware(doc["review_due_at"])
    elif status in ("diteruskan", "ditindaklanjuti"):
        due = aware(doc.get("response_due_at"))
    else:
        return None
    if due is None:
        return None
    left = due - now()
    if left.total_seconds() < 0:
        return "terlambat"
    if left < timedelta(days=1):
        return "mendekati"
    return "tepat_waktu"


def sender_display(doc: dict) -> str:
    if doc["mode"] == "anonim":
        return "Anonim"
    if doc["mode"] == "rahasia":
        return "Rahasia"
    return doc.get("display_name") or "Bernama"


def to_ticket(doc: dict, viewer_role: str) -> Ticket:
    """viewer_role: 'public' (lookup by ticket+code), 'hc' or 'exec'."""
    reviewer = viewer_role in ("hc", "exec")
    reply = doc.get("reply")
    return Ticket(
        id=doc["id"],
        ticket_no=doc["ticket_no"],
        category=doc["category"],
        mode=doc["mode"],
        title=doc["title"],
        message=doc["message"],
        recipient_name=doc.get("recipient_name"),
        publish_consent=doc.get("publish_consent", False),
        status=doc["status"],
        sender_display=sender_display(doc),
        identity_name=doc.get("display_name") if reviewer and doc["mode"] != "anonim" else None,
        identity_department=doc.get("department") if reviewer and doc["mode"] != "anonim" else None,
        rejection_reason=doc.get("rejection_reason"),
        hc_note=doc.get("hc_note") if reviewer else None,
        reply=Reply(message=reply["message"], by_name=reply["by_name"], at=aware(reply["at"])) if reply else None,
        created_at=aware(doc["created_at"]),
        review_due_at=aware(doc["review_due_at"]),
        response_due_at=aware(doc.get("response_due_at")),
        sla_state=sla_state(doc),
        history=[HistoryItem(status=h["status"], at=aware(h["at"]), note=h.get("note")) for h in doc.get("history", [])],
        resubmitted_from=doc.get("resubmitted_from"),
    )


async def set_status(doc: dict, status: str, actor: dict, action: str, note: str | None = None, extra: dict | None = None) -> dict:
    ts = now()
    update = {"status": status, **(extra or {})}
    await db.tickets.update_one(
        {"id": doc["id"]},
        {"$set": update, "$push": {"history": {"status": status, "at": ts, "note": note}}},
    )
    await audit(actor, action, doc, note)
    return await db.tickets.find_one({"id": doc["id"]}, {"_id": 0})


async def audit(actor: dict, action: str, doc: dict, detail: str | None = None) -> None:
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "at": now(),
        "actor_name": actor["name"],
        "actor_role": actor["role"],
        "action": action,
        "ticket_no": doc["ticket_no"],
        "category": doc["category"],
        "detail": detail,
    })
