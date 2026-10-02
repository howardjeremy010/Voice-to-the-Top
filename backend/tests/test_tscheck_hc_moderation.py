"""Criterion: HC moderation - review, approve (apresiasi -> wall), reject with mandatory reason."""

import uuid

import httpx


def _hc_client(backend_url):
    c = httpx.Client(base_url=f"{backend_url}/api", timeout=30.0)
    r = c.post("/auth/login", json={"email": "hc@insan.co.id", "password": "Insan2026!"})
    assert r.status_code == 200, r.text
    return c


def test_hc_approve_apresiasi_appears_on_wall(client, backend_url):
    tag = uuid.uuid4().hex[:8]
    created = client.post("/tickets", json={
        "category": "apresiasi", "mode": "bernama",
        "title": f"tscheck-hc-approve-{tag}", "message": "Pesan uji apresiasi untuk moderasi HC otomatis.",
        "display_name": "Tester HC", "department": None, "recipient_name": f"Rekan-{tag}",
        "publish_consent": True, "resubmitted_from": None,
    }).json()

    hc = _hc_client(backend_url)
    pending = hc.get("/hc/tickets", params={"status": "terkirim"})
    assert pending.status_code == 200
    assert any(t["ticket_no"] == created["ticket_no"] for t in pending.json())

    rv = hc.post(f"/hc/tickets/{created['id']}/review")
    assert rv.status_code == 200, rv.text
    assert rv.json()["status"] == "ditinjau"

    ap = hc.post(f"/hc/tickets/{created['id']}/approve", json={"note": None})
    assert ap.status_code == 200, ap.text
    assert ap.json()["status"] == "disetujui"

    wall = client.get("/wall")
    assert wall.status_code == 200
    assert any(w["ticket_no"] == created["ticket_no"] for w in wall.json())
    hc.close()


def test_hc_reject_requires_reason(client, backend_url):
    tag = uuid.uuid4().hex[:8]
    created = client.post("/tickets", json={
        "category": "keluhan", "mode": "anonim",
        "title": f"tscheck-hc-reject-{tag}", "message": "Pesan uji keluhan untuk ditolak HC otomatis.",
        "display_name": None, "department": None, "recipient_name": None,
        "publish_consent": False, "resubmitted_from": None,
    }).json()

    hc = _hc_client(backend_url)
    # reason too short -> validation error
    bad = hc.post(f"/hc/tickets/{created['id']}/reject", json={"reason": "no"})
    assert bad.status_code == 422

    ok = hc.post(f"/hc/tickets/{created['id']}/reject", json={"reason": "Pesan tidak jelas, mohon diperjelas lagi."})
    assert ok.status_code == 200, ok.text
    body = ok.json()
    assert body["status"] == "ditolak"
    assert body["rejection_reason"]
    hc.close()
