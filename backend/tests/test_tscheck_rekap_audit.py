"""Criterion: Rekap & Audit - counts, rejections, overdue, audit log; never exposes message titles/content."""

import httpx


def _login(backend_url, email):
    c = httpx.Client(base_url=f"{backend_url}/api", timeout=30.0)
    r = c.post("/auth/login", json={"email": email, "password": "Insan2026!"})
    assert r.status_code == 200, r.text
    return c


def test_recap_shape_and_no_message_content(backend_url):
    ceo = _login(backend_url, "ceo@insan.co.id")
    r = ceo.get("/exec/recap")
    assert r.status_code == 200, r.text
    body = r.json()
    for key in ("total", "by_status", "by_category", "rejections_by_category", "rejections", "overdue", "audit"):
        assert key in body
    assert body["total"] >= 7  # seeded tickets at minimum
    # rejection + audit entries must never carry 'title' or 'message' fields
    for rej in body["rejections"]:
        assert "title" not in rej and "message" not in rej
    for a in body["audit"]:
        assert "title" not in a and "message" not in a
    ceo.close()


def test_recap_forbidden_for_hc_role(backend_url):
    hc = _login(backend_url, "hc@insan.co.id")
    r = hc.get("/exec/recap")
    assert r.status_code == 403
    hc.close()
