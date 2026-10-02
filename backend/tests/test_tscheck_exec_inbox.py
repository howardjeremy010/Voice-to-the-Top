"""Criterion: CEO & CHCO inbox gets only forwarded closed tickets; followup + reply -> Selesai; reply visible publicly."""

import uuid

import httpx


def _login(backend_url, email):
    c = httpx.Client(base_url=f"{backend_url}/api", timeout=30.0)
    r = c.post("/auth/login", json={"email": email, "password": "Insan2026!"})
    assert r.status_code == 200, r.text
    return c


def test_exec_followup_and_reply_visible_publicly(client, backend_url):
    tag = uuid.uuid4().hex[:8]
    created = client.post("/tickets", json={
        "category": "inovasi", "mode": "bernama",
        "title": f"tscheck-exec-{tag}", "message": "Pesan uji inovasi untuk alur CEO & CHCO otomatis.",
        "display_name": "Tester Exec", "department": "QA", "recipient_name": None,
        "publish_consent": False, "resubmitted_from": None,
    }).json()

    hc = _login(backend_url, "hc@insan.co.id")
    hc.post(f"/hc/tickets/{created['id']}/review")
    fwd = hc.post(f"/hc/tickets/{created['id']}/approve", json={"note": None})
    assert fwd.status_code == 200
    assert fwd.json()["status"] == "diteruskan"
    hc.close()

    ceo = _login(backend_url, "ceo@insan.co.id")
    inbox = ceo.get("/exec/tickets")
    assert inbox.status_code == 200
    assert any(t["ticket_no"] == created["ticket_no"] for t in inbox.json())

    fu = ceo.post(f"/exec/tickets/{created['id']}/followup")
    assert fu.status_code == 200, fu.text
    assert fu.json()["status"] == "ditindaklanjuti"

    reply = ceo.post(f"/exec/tickets/{created['id']}/reply", json={"message": "Terima kasih atas masukan Anda, akan kami tindak lanjuti."})
    assert reply.status_code == 200, reply.text
    assert reply.json()["status"] == "selesai"
    ceo.close()

    lookup = client.post("/tickets/lookup", json={"ticket_no": created["ticket_no"], "access_code": created["access_code"]})
    assert lookup.status_code == 200
    body = lookup.json()
    assert body["status"] == "selesai"
    assert body["reply"]["message"].startswith("Terima kasih")


def test_exec_inbox_excludes_pending_hc_tickets(backend_url, client):
    tag = uuid.uuid4().hex[:8]
    created = client.post("/tickets", json={
        "category": "opini", "mode": "anonim",
        "title": f"tscheck-exec-pending-{tag}", "message": "Pesan uji opini yang belum diteruskan HC sama sekali.",
        "display_name": None, "department": None, "recipient_name": None,
        "publish_consent": False, "resubmitted_from": None,
    }).json()

    ceo = _login(backend_url, "ceo@insan.co.id")
    inbox = ceo.get("/exec/tickets")
    assert inbox.status_code == 200
    assert not any(t["ticket_no"] == created["ticket_no"] for t in inbox.json())
    ceo.close()
