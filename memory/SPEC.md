# Insan Bersuara: Where Every Voice Matters — SPEC

Internal employee voice portal (Bahasa Indonesia UI). FastAPI + Mongo backend, Vite React frontend.

## Roles (cookie session `ib_session`, POST /api/auth/login)
- **karyawan**: Beranda, Dinding Apresiasi, Tiket Saya (+ anonymous lookup by ticket no + access code), Voice to the Top wizard, WBS (info+QR), Hotline HC (info+QR+Google Form link), Cara Kerja.
- **hc**: /hc Moderasi Pesan — filters by category/status, actions: Mulai tinjau (→ditinjau), Approve (apresiasi→disetujui & on wall; closed→diteruskan + email to NOTIFY_EMAILS), Reject (reason required →ditolak).
- **exec** (CEO & CHCO): /eksekutif inbox (diteruskan/ditindaklanjuti/selesai only), Tandai Ditindaklanjuti, Reply (→selesai). /eksekutif/rekap: counts, rejection reasons, overdue escalations, audit log — no title/message content. Read-only wall.

## VTT categories
apresiasi (Insan Menginspirasi, open → wall), aspirasi (Asa Insan), perbaikan (Insan Bertumbuh), inovasi (Insan Berkarya), keluhan (Ruang Peduli Insan), opini (Ragam Insan) — closed.

## Modes
- rahasia: owner stored; identity visible to HC & exec only; shows in Tiket Saya.
- bernama: display_name required; shows in Tiket Saya.
- anonim: no owner stored; NOT in Tiket Saya; tracked only via ticket_no + access_code (POST /api/tickets/lookup).
- Apresiasi requires recipient_name + publish_consent=true.

## Status lifecycle
terkirim → ditinjau → (diteruskan → ditindaklanjuti → selesai) | (disetujui for apresiasi) | ditolak (reason shown; "Perbaiki & kirim ulang" pre-fills wizard with resubmitted_from).

## SLA
Review due = created + 3 working days; response due = forwarded + 7 working days. sla_state: tepat_waktu / mendekati (<1 day) / terlambat.

## Data (Mongo)
users, sessions, tickets (id, ticket_no VTT-YYYY-NNNN, access_code, category, mode, title, message, recipient_name, publish_consent, owner_id/name/department, display_name, status, history[], rejection_reason, hc_note, reply{message,by_name,at}, created_at, review_due_at, response_due_at, decided_at), audit_logs, counters.

## Seed facts (python seed.py; tickets only seeded if empty)
- VTT-YYYY-0001..0003 apresiasi disetujui (on wall: Rudi Hartono, Dewi Lestari, Tim Customer Care)
- 0004 aspirasi rahasia (Siti) terkirim; 0005 keluhan anonim terkirim (overdue-ish)
- 0006 inovasi bernama (Andi) diteruskan → in exec inbox
- 0007 perbaikan rahasia (Siti) ditolak with reason

## Email
Emergent-managed Resend (lib/email.py). On HC forwarding closed message, emails NOTIFY_EMAILS (currently delivered@resend.dev test address) — ticket no + category only, no content.

## Placeholders (frontend/src/lib/constants.ts)
WBS_URL, HOTLINE_WA_NUMBER, HOTLINE_FEEDBACK_URL are placeholders.
