"""Human Capital moderation: filter the six VTT categories."""

import asyncio
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import require_role
from lib.db import db
from lib.email import notify_exec_forwarded
from lib.tickets import CATEGORY_NAMES, RESPONSE_DAYS, add_working_days, now, set_status, to_ticket
from models.schemas import HcApprove, HcReject, Ticket

router = APIRouter(prefix="/hc")
hc_only = require_role("hc")
_bg: set[asyncio.Task] = set()


async def _get(ticket_id: str) -> dict:
    doc = await db.tickets.find_one({"id": ticket_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Tiket tidak ditemukan")
    return doc


@router.get("/tickets", response_model=list[Ticket])
async def list_tickets(category: Optional[str] = None, status: Optional[str] = None, user: dict = Depends(hc_only)):
    q: dict = {}
    if category:
        q["category"] = category
    if status:
        q["status"] = status
    docs = await db.tickets.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [to_ticket(d, "hc") for d in docs]


@router.post("/tickets/{ticket_id}/review", response_model=Ticket)
async def review(ticket_id: str, user: dict = Depends(hc_only)):
    doc = await _get(ticket_id)
    if doc["status"] != "terkirim":
        raise HTTPException(status_code=400, detail="Hanya tiket berstatus Terkirim yang dapat mulai ditinjau")
    doc = await set_status(doc, "ditinjau", user, "Mulai ditinjau HC", extra={"reviewed_at": now()})
    return to_ticket(doc, "hc")


@router.post("/tickets/{ticket_id}/approve", response_model=Ticket)
async def approve(ticket_id: str, body: HcApprove, user: dict = Depends(hc_only)):
    doc = await _get(ticket_id)
    if doc["status"] not in ("terkirim", "ditinjau"):
        raise HTTPException(status_code=400, detail="Tiket ini sudah diputuskan")
    ts = now()
    note = (body.note or "").strip() or None
    if doc["category"] == "apresiasi":
        doc = await set_status(doc, "disetujui", user, "Disetujui & tampil di Dinding Apresiasi", note,
                               {"decided_at": ts, "hc_note": note})
    else:
        doc = await set_status(doc, "diteruskan", user, "Diteruskan ke CEO & CHCO", note,
                               {"decided_at": ts, "hc_note": note, "response_due_at": add_working_days(ts, RESPONSE_DAYS)})
        task = asyncio.create_task(notify_exec_forwarded(doc["ticket_no"], CATEGORY_NAMES[doc["category"]]))
        _bg.add(task)
        task.add_done_callback(_bg.discard)
    return to_ticket(doc, "hc")


@router.post("/tickets/{ticket_id}/reject", response_model=Ticket)
async def reject(ticket_id: str, body: HcReject, user: dict = Depends(hc_only)):
    doc = await _get(ticket_id)
    if doc["status"] not in ("terkirim", "ditinjau"):
        raise HTTPException(status_code=400, detail="Tiket ini sudah diputuskan")
    reason = body.reason.strip()
    doc = await set_status(doc, "ditolak", user, "Ditolak", reason, {"decided_at": now(), "rejection_reason": reason})
    return to_ticket(doc, "hc")
