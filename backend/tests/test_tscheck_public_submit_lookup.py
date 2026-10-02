"""Criterion: Anyone can submit VTT without login; public tracking by ticket+access code."""

import uuid


def test_submit_anonim_and_lookup(client):
    tag = uuid.uuid4().hex[:8]
    body = {
        "category": "keluhan",
        "mode": "anonim",
        "title": f"tscheck-public-{tag}",
        "message": "Pesan uji otomatis untuk verifikasi pengiriman anonim tanpa login.",
        "display_name": None,
        "department": None,
        "recipient_name": None,
        "publish_consent": False,
        "resubmitted_from": None,
    }
    r = client.post("/tickets", json=body)
    assert r.status_code == 200, r.text
    created = r.json()
    assert created["ticket_no"].startswith("VTT-")
    assert created["status"] == "terkirim"
    assert len(created["access_code"]) == 6

    # correct lookup
    r2 = client.post("/tickets/lookup", json={"ticket_no": created["ticket_no"], "access_code": created["access_code"]})
    assert r2.status_code == 200, r2.text
    ticket = r2.json()
    assert ticket["ticket_no"] == created["ticket_no"]
    assert ticket["status"] == "terkirim"
    # anonymous identity never exposed
    assert ticket["identity_name"] is None

    # wrong access code -> 404
    r3 = client.post("/tickets/lookup", json={"ticket_no": created["ticket_no"], "access_code": "WRONG1"})
    assert r3.status_code == 404


def test_rahasia_requires_name_and_apresiasi_requires_consent(client):
    tag = uuid.uuid4().hex[:8]
    # Rahasia without display_name -> 400
    r = client.post("/tickets", json={
        "category": "aspirasi", "mode": "rahasia",
        "title": f"tscheck-rahasia-{tag}", "message": "Pesan uji rahasia tanpa nama wajib ditolak server.",
        "display_name": None, "department": None, "recipient_name": None,
        "publish_consent": False, "resubmitted_from": None,
    })
    assert r.status_code == 400

    # Apresiasi without consent -> 400
    r2 = client.post("/tickets", json={
        "category": "apresiasi", "mode": "bernama",
        "title": f"tscheck-apresiasi-{tag}", "message": "Pesan uji apresiasi tanpa izin publikasi wajib ditolak.",
        "display_name": "Tester Tscheck", "department": None, "recipient_name": "Rekan Uji",
        "publish_consent": False, "resubmitted_from": None,
    })
    assert r2.status_code == 400

    # valid apresiasi with consent -> 200
    r3 = client.post("/tickets", json={
        "category": "apresiasi", "mode": "bernama",
        "title": f"tscheck-apresiasi-ok-{tag}", "message": "Pesan uji apresiasi dengan izin publikasi dicentang.",
        "display_name": "Tester Tscheck", "department": None, "recipient_name": "Rekan Uji",
        "publish_consent": True, "resubmitted_from": None,
    })
    assert r3.status_code == 200, r3.text


def test_seeded_rejected_ticket_lookup(client):
    r = client.post("/tickets/lookup", json={"ticket_no": "VTT-2026-0007", "access_code": "DEMO07"})
    assert r.status_code == 200, r.text
    ticket = r.json()
    assert ticket["status"] == "ditolak"
    assert ticket["rejection_reason"]
