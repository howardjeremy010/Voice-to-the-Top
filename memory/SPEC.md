# Insan Bersuara: Where Every Voice Matters — SPEC

Internal employee voice portal (Bahasa Indonesia UI). FastAPI + Mongo backend, Vite React frontend.

## Access
- **Public (no login)** — PublicShell, landing modelled on s.id/VoOStore: / Beranda (hero, marquee, 6 categories, commitments, process, wall preview, CTA), /vtt wizard, /lacak (track by ticket no + access code, supports ?no=&kode=), /dinding-apresiasi, /wbs, /hotline-hc, /cara-kerja. POST /api/tickets, POST /api/tickets/lookup, GET /api/wall are unauthenticated.
- **Management login only** (cookie session `ib_session`, POST /api/auth/login at /login) — AppShell; /manajemen/dinding-apresiasi (read-only) and /manajemen/cara-kerja.
- **hc**: /hc Moderasi Pesan — filters by category/status, actions: Mulai tinjau (→ditinjau), Approve (apresiasi→disetujui & on wall; closed→diteruskan + email to NOTIFY_EMAILS), Reject (reason required →ditolak).
- **exec** (CEO & CHCO): /eksekutif inbox (diteruskan/ditindaklanjuti/selesai only), Tandai Ditindaklanjuti, Reply (→selesai). /eksekutif/rekap: counts, rejection reasons, overdue escalations, audit log — no title/message content. Read-only wall.

## VTT categories
apresiasi (Insan Menginspirasi, open → wall), aspirasi (Asa Insan), perbaikan (Insan Bertumbuh), inovasi (Insan Berkarya), keluhan (Ruang Peduli Insan), opini (Ragam Insan) — closed.

## Modes
- rahasia: display_name (required) + employee_id/NIK (required) + department (optional) stored; visible to HC & exec only; public shows "Rahasia".
- bernama: display_name + employee_id/NIK (required) + department; name shown publicly, NIK only to HC & exec.
- anonim: no identity stored (no name, no NIK).
- All modes tracked via ticket_no + access_code (no accounts for employees).
- Apresiasi requires recipient_name + publish_consent=true.

## Status lifecycle
terkirim → ditinjau → (diteruskan → ditindaklanjuti → selesai) | (disetujui for apresiasi) | ditolak (reason shown; "Perbaiki & kirim ulang" pre-fills wizard with resubmitted_from).

## SLA
Review due = created + 3 working days; response due = forwarded + 7 working days. sla_state: tepat_waktu / mendekati (<1 day) / terlambat.

## Data (Mongo)
users, sessions, tickets (id, ticket_no VTT-YYYY-NNNN, access_code, category, mode, title, message, recipient_name, publish_consent, owner_id/name/department, display_name, status, history[], rejection_reason, hc_note, reply{message,by_name,at}, created_at, review_due_at, response_due_at, decided_at), audit_logs, counters.

## Seed facts (python seed.py; tickets only seeded if empty)
- Access codes are DEMO01..DEMO07 for VTT-YYYY-0001..0007 (reset: python seed.py --reset)
- VTT-YYYY-0001..0003 apresiasi disetujui (on wall: Rudi Hartono, Dewi Lestari, Tim Customer Care)
- 0004 aspirasi rahasia (Siti) terkirim; 0005 keluhan anonim terkirim (overdue-ish)
- 0006 inovasi bernama (Andi) diteruskan → in exec inbox
- 0007 perbaikan rahasia (Siti) ditolak with reason

## Email
Emergent-managed Resend (lib/email.py). On HC forwarding closed message, emails NOTIFY_EMAILS (currently delivered@resend.dev test address) — ticket no + category only, no content.

## Placeholders (frontend/src/lib/constants.ts)
WBS_URL and HOTLINE_FEEDBACK_URL are placeholders; HOTLINE_WA_NUMBER is real (6287743900999).

## Branding (PT Supra Boga Lestari)
- Logo files in frontend/public: logo-sbl.png (header/receipt), logo-sbl-group.png (footer, incl. Farmers Market & Ranch Market), favicon-sbl.png.
- Supermarket theme: deep green #0B3D2E (navy token), Farmers green #12805C (teal token), market red #B4161B, gold #B8973A, cream bg #FBF8F2; red/white awning stripe on headers; categories shown as top band shows gold sparkle ornament (no text) with gold price-tag labels; VTT success shown as a receipt ("Struk Suara Insan"). Headings use Outfit.
