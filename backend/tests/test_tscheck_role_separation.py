"""Criterion: role separation - HC cannot open exec endpoints and vice versa."""

import httpx


def _login(backend_url, email):
    c = httpx.Client(base_url=f"{backend_url}/api", timeout=30.0)
    r = c.post("/auth/login", json={"email": email, "password": "Insan2026!"})
    assert r.status_code == 200, r.text
    return c


def test_hc_cannot_access_exec_endpoints(backend_url):
    hc = _login(backend_url, "hc@insan.co.id")
    r = hc.get("/exec/tickets")
    assert r.status_code == 403
    r2 = hc.get("/exec/recap")
    assert r2.status_code == 403
    hc.close()


def test_exec_cannot_access_hc_endpoints(backend_url):
    ceo = _login(backend_url, "ceo@insan.co.id")
    r = ceo.get("/hc/tickets")
    assert r.status_code == 403
    ceo.close()
