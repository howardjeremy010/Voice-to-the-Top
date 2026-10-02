"""Employee-facing routes: submit VTT, my tickets, anonymous lookup, appreciation wall, summary."""

import secrets
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pymongo import ReturnDocument

from lib.auth import get_current_user, require_role
from lib.db import db
from lib.tickets import HC_REVIEW_DAYS, add_working_days, audit, now, sender_display, to_ticket
from models.schemas import LookupIn, Summary, Ticket, TicketCreate, TicketCreated, WallItem

router = APIRouter()

CLOSED_ACTIVE = ["diteruskan", "ditindaklanjuti"]


async def next_ticket_no() -> str:
    year = now().year
    counter = await db.counters.find_one_and_update(
        {"id": f"vtt-{year}"}, {"$inc": {"seq": 1}}, upsert=True, return_document=ReturnDocument.AFTER
    )
    return f"VTT-{year}-{counter['seq']:04d}"


@router.post("/tickets", response_model=TicketCreated)
async def create_ticket(body: TicketCreate, user: dict = Depends(require_role("karyawan"))):
    if body.mode == "bernama" and not (body.display_name or "").strip():
        raise HTTPException(status_code=400, detail="Nama wajib diisi untuk mode Bernama")
    if body.category == "apresiasi":
        if not body.publish_consent:
            raise HTTPException(status_code=400, detail="Izin publikasi wajib dicentang untuk Apresiasi")
        if not (body.recipient_name or "").strip():
            raise HTTPException(status_code=400, detail="Nama rekan yang diapresiasi wajib diisi")
    ts = now()
    anonymous = body.mode == "anonim"
    doc = {
        "id": str(uuid.uuid4()),
        "ticket_no": await next_ticket_no(),
        "access_code": secrets.token_hex(3).upper(),
        "category": body.category,
        "mode": body.mode,
        "title": body.title.strip(),
        "message": body.message.strip(),
        "recipient_name": (body.recipient_name or "").strip() or None if body.category == "apresiasi" else None,
        "publish_consent": body.publish_consent if body.category == "apresiasi" else False,
        "display_name": body.display_name.strip() if body.mode == "bernama" and body.display_name else None,
        # Anonim: identity is never stored.
        "owner_id": None if anonymous else user["id"],
        "owner_name": None if anonymous else user["name"],
        "owner_department": None if anonymous else user["department"],
        "status": "terkirim",
        "created_at": ts,
        "review_due_at": add_working_days(ts, HC_REVIEW_DAYS),
        "response_due_at": None,
        "history": [{"status": "terkirim", "at": ts, "note": None}],
        "resubmitted_from": body.resubmitted_from,
    }
    await db.tickets.insert_one(doc)
    await audit({"name": "Anonim" if anonymous else sender_display(doc), "role": "karyawan"}, "Pesan dikirim", doc)
    return TicketCreated(id=doc["id"], ticket_no=doc["ticket_no"], access_code=doc["access_code"], status="terkirim")


@router.get("/tickets/mine", response_model=list[Ticket])
async def my_tickets(user: dict = Depends(require_role("karyawan"))):
    docs = await db.tickets.find({"owner_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [to_ticket(d, "karyawan") for d in docs]


@router.post("/tickets/lookup", response_model=Ticket)
async def lookup(body: LookupIn, user: dict = Depends(get_current_user)):
    doc = await db.tickets.find_one(
        {"ticket_no": body.ticket_no.strip().upper(), "access_code": body.access_code.strip().upper()}, {"_id": 0}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Nomor tiket atau kode akses tidak ditemukan")
    return to_ticket(doc, "karyawan")


@router.get("/wall", response_model=list[WallItem])
async def wall(user: dict = Depends(get_current_user)):
    docs = await db.tickets.find(
        {"category": "apresiasi", "status": "disetujui", "publish_consent": True}, {"_id": 0}
    ).sort("decided_at", -1).to_list(500)
    return [
        WallItem(
            id=d["id"], ticket_no=d["ticket_no"], title=d["title"], message=d["message"],
            recipient_name=d.get("recipient_name"), sender_display=sender_display(d),
            published_at=d.get("decided_at") or d["created_at"],
        )
        for d in docs
    ]


@router.get("/summary", response_model=Summary)
async def summary(user: dict = Depends(get_current_user)):
    return Summary(
        hc_pending=await db.tickets.count_documents({"status": {"$in": ["terkirim", "ditinjau"]}}),
        exec_pending=await db.tickets.count_documents({"status": {"$in": CLOSED_ACTIVE}}),
        my_open=await db.tickets.count_documents(
            {"owner_id": user["id"], "status": {"$nin": ["selesai", "ditolak", "disetujui"]}}
        ),
        wall_count=await db.tickets.count_documents({"category": "apresiasi", "status": "disetujui", "publish_consent": True}),
    )
