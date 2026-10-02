"""Idempotent seed: management users (reset every run) + sample tickets (only when empty, or with --reset)."""

import asyncio
import secrets
import sys
import uuid
from datetime import timedelta

from lib.auth import hash_password
from lib.db import db, ensure_indexes
from lib.tickets import HC_REVIEW_DAYS, RESPONSE_DAYS, add_working_days, now

PASSWORD = "Insan2026!"
USERS = [
    {"name": "Budi Prasetyo", "email": "hc@insan.co.id", "role": "hc", "title": "Human Capital Lead", "department": "Human Capital"},
    {"name": "Hendra Kusuma", "email": "ceo@insan.co.id", "role": "exec", "title": "Chief Executive Officer", "department": "Direksi"},
    {"name": "Maya Arifin", "email": "chco@insan.co.id", "role": "exec", "title": "Chief Human Capital Officer", "department": "Direksi"},
]


async def main():
    # Employees no longer log in — only management accounts exist.
    await db.users.delete_many({"role": {"$nin": ["hc", "exec"]}})
    for u in USERS:
        existing = await db.users.find_one({"email": u["email"]})
        uid = existing["id"] if existing else str(uuid.uuid4())
        await db.users.update_one(
            {"email": u["email"]},
            {"$set": {**u, "id": uid, "password_hash": hash_password(PASSWORD)}},
            upsert=True,
        )
    await ensure_indexes()

    if "--reset" in sys.argv:
        await db.tickets.delete_many({})
        await db.audit_logs.delete_many({})
        await db.counters.delete_many({})
        await db.sessions.delete_many({})

    if await db.tickets.count_documents({}) > 0:
        print("Users refreshed; tickets already present.")
        return

    siti = ("Siti Rahmawati", "Operasional")
    andi = ("Andi Wijaya", "Keuangan")
    t0 = now()
    samples = [
        # (category, mode, sender, title, message, recipient, status, days_ago)
        ("apresiasi", "bernama", siti, "Terima kasih atas bimbingannya", "Pak Rudi selalu sabar mendampingi tim saat migrasi sistem gudang. Kepemimpinan beliau membuat kami tetap tenang dan fokus.", "Rudi Hartono", "disetujui", 6),
        ("apresiasi", "rahasia", andi, "Pelayanan yang luar biasa", "Mbak Dewi dari tim IT membantu memulihkan data laporan bulanan di luar jam kerja. Sangat menginspirasi!", "Dewi Lestari", "disetujui", 4),
        ("apresiasi", "anonim", None, "Kerja sama tim yang solid", "Terima kasih tim Customer Care yang kompak menangani lonjakan keluhan pelanggan minggu lalu.", "Tim Customer Care", "disetujui", 2),
        ("aspirasi", "rahasia", siti, "Program pengembangan karier", "Saya berharap ada jalur sertifikasi profesional yang jelas untuk staf operasional agar kami bisa berkembang bersama perusahaan.", None, "terkirim", 1),
        ("keluhan", "anonim", None, "Pendingin ruangan lantai 3", "Pendingin ruangan di lantai 3 sering mati sejak dua minggu terakhir sehingga suasana kerja kurang kondusif.", None, "terkirim", 5),
        ("inovasi", "bernama", andi, "Digitalisasi pengajuan reimburse", "Usul agar pengajuan reimburse dibuat digital lengkap dengan unggah bukti, sehingga proses persetujuan lebih cepat dan transparan.", None, "diteruskan", 3),
        ("perbaikan", "rahasia", siti, "Alur persetujuan cuti", "Alur persetujuan cuti saat ini melewati terlalu banyak tahap. Mohon dipertimbangkan penyederhanaan menjadi dua tingkat saja.", None, "ditolak", 7),
    ]
    year = t0.year
    for i, (cat, mode, sender, title, msg, recipient, status, days) in enumerate(samples, start=1):
        created = t0 - timedelta(days=days)
        decided = created + timedelta(days=1)
        history = [{"status": "terkirim", "at": created, "note": None}]
        doc = {
            "id": str(uuid.uuid4()),
            "ticket_no": f"VTT-{year}-{i:04d}",
            "access_code": f"DEMO{i:02d}",
            "category": cat, "mode": mode, "title": title, "message": msg,
            "recipient_name": recipient, "publish_consent": cat == "apresiasi",
            "display_name": sender[0] if sender else None,
            "department": sender[1] if sender else None,
            "status": status, "created_at": created,
            "review_due_at": add_working_days(created, HC_REVIEW_DAYS),
            "response_due_at": None, "history": history, "resubmitted_from": None,
        }
        if status in ("disetujui", "diteruskan", "ditolak"):
            history.append({"status": "ditinjau", "at": created + timedelta(hours=3), "note": None})
            doc["decided_at"] = decided
        if status == "disetujui":
            history.append({"status": "disetujui", "at": decided, "note": None})
        if status == "diteruskan":
            doc["response_due_at"] = add_working_days(decided, RESPONSE_DAYS)
            doc["hc_note"] = "Ide relevan dengan program transformasi digital."
            history.append({"status": "diteruskan", "at": decided, "note": doc["hc_note"]})
        if status == "ditolak":
            doc["rejection_reason"] = "Usulan serupa sedang diproses melalui revisi kebijakan cuti; mohon kirim ulang dengan detail kendala spesifik."
            history.append({"status": "ditolak", "at": decided, "note": doc["rejection_reason"]})
        await db.tickets.insert_one(doc)
        actor = {"anonim": "Anonim", "rahasia": "Rahasia"}.get(mode) or sender[0]
        await db.audit_logs.insert_one({"id": str(uuid.uuid4()), "at": created, "actor_name": actor, "actor_role": "karyawan", "action": "Pesan dikirim", "ticket_no": doc["ticket_no"], "category": cat, "detail": None})
        if status == "ditolak":
            await db.audit_logs.insert_one({"id": str(uuid.uuid4()), "at": decided, "actor_name": "Budi Prasetyo", "actor_role": "hc", "action": "Ditolak", "ticket_no": doc["ticket_no"], "category": cat, "detail": doc["rejection_reason"]})
        if status in ("disetujui", "diteruskan"):
            action = "Disetujui & tampil di Dinding Apresiasi" if status == "disetujui" else "Diteruskan ke CEO & CHCO"
            await db.audit_logs.insert_one({"id": str(uuid.uuid4()), "at": decided, "actor_name": "Budi Prasetyo", "actor_role": "hc", "action": action, "ticket_no": doc["ticket_no"], "category": cat, "detail": None})
    await db.counters.update_one({"id": f"vtt-{year}"}, {"$set": {"seq": len(samples)}}, upsert=True)
    print("Seeded users and", len(samples), "tickets.")


if __name__ == "__main__":
    asyncio.run(main())
