"""CEO & CHCO: forwarded closed messages, replies, and the content-free recap/audit."""

from collections import Counter

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import require_role
from lib.db import db
from lib.tickets import aware, now, set_status, sla_state, to_ticket
from models.schemas import AuditEntry, CountItem, ExecRecap, ExecReply, OverdueItem, RejectionItem, Ticket

router = APIRouter(prefix="/exec")
exec_only = require_role("exec")
VISIBLE = ["diteruskan", "ditindaklanjuti", "selesai"]


async def _get(ticket_id: str) -> dict:
    doc = await db.tickets.find_one({"id": ticket_id, "status": {"$in": VISIBLE}}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Tiket tidak ditemukan")
    return doc


@router.get("/tickets", response_model=list[Ticket])
async def list_tickets(user: dict = Depends(exec_only)):
    docs = await db.tickets.find({"status": {"$in": VISIBLE}}, {"_id": 0}).sort("decided_at", -1).to_list(1000)
    return [to_ticket(d, "exec") for d in docs]


@router.post("/tickets/{ticket_id}/followup", response_model=Ticket)
async def followup(ticket_id: str, user: dict = Depends(exec_only)):
    doc = await _get(ticket_id)
    if doc["status"] != "diteruskan":
        raise HTTPException(status_code=400, detail="Tiket sudah ditindaklanjuti atau selesai")
    doc = await set_status(doc, "ditindaklanjuti", user, "Ditindaklanjuti", f"oleh {user['name']}")
    return to_ticket(doc, "exec")


@router.post("/tickets/{ticket_id}/reply", response_model=Ticket)
async def reply(ticket_id: str, body: ExecReply, user: dict = Depends(exec_only)):
    doc = await _get(ticket_id)
    if doc["status"] == "selesai":
        raise HTTPException(status_code=400, detail="Tiket ini sudah dibalas")
    ts = now()
    doc = await set_status(
        doc, "selesai", user, "Balasan dikirim", f"Dibalas oleh {user['name']}",
        {"reply": {"message": body.message.strip(), "by_name": user["name"], "at": ts}, "completed_at": ts},
    )
    return to_ticket(doc, "exec")


@router.get("/recap", response_model=ExecRecap)
async def recap(user: dict = Depends(exec_only)):
    # Projection excludes message content: the recap never opens what HC filtered out.
    docs = await db.tickets.find({}, {"_id": 0, "message": 0, "title": 0}).to_list(5000)
    rejected = [d for d in docs if d["status"] == "ditolak"]
    overdue = []
    for d in docs:
        if sla_state(d) == "terlambat":
            stage = "tinjau_hc" if d["status"] in ("terkirim", "ditinjau") else "tanggapan"
            due = d["review_due_at"] if stage == "tinjau_hc" else d["response_due_at"]
            overdue.append(OverdueItem(ticket_no=d["ticket_no"], category=d["category"], status=d["status"], stage=stage, due_at=aware(due)))
    rej_by: dict[str, str] = {}
    for h in await db.audit_logs.find({"action": "Ditolak"}, {"_id": 0}).to_list(5000):
        rej_by[h["ticket_no"]] = h["actor_name"]
    audit_docs = await db.audit_logs.find({}, {"_id": 0}).sort("at", -1).to_list(200)
    return ExecRecap(
        total=len(docs),
        by_status=[CountItem(key=k, count=v) for k, v in Counter(d["status"] for d in docs).items()],
        by_category=[CountItem(key=k, count=v) for k, v in Counter(d["category"] for d in docs).items()],
        rejections_by_category=[CountItem(key=k, count=v) for k, v in Counter(d["category"] for d in rejected).items()],
        rejections=sorted(
            [RejectionItem(ticket_no=d["ticket_no"], category=d["category"], reason=d.get("rejection_reason") or "-",
                           by_name=rej_by.get(d["ticket_no"], "Human Capital"), at=aware(d.get("decided_at") or d["created_at"]))
             for d in rejected],
            key=lambda r: r.at, reverse=True,
        ),
        overdue=sorted(overdue, key=lambda o: o.due_at),
        audit=[AuditEntry(**{**a, "at": aware(a["at"])}) for a in audit_docs],
    )
