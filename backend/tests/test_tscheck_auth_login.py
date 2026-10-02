"""Criterion: only management (HC, CEO, CHCO) can log in; protected endpoints reject anonymous/wrong role."""


def test_login_hc_and_exec_success(client):
    for email in ["hc@insan.co.id", "ceo@insan.co.id", "chco@insan.co.id"]:
        r = client.post("/auth/login", json={"email": email, "password": "Insan2026!"})
        assert r.status_code == 200, f"{email}: {r.text}"
        user = r.json()
        assert user["email"] == email
        assert user["role"] in ("hc", "exec")


def test_login_wrong_password_rejected(client):
    r = client.post("/auth/login", json={"email": "hc@insan.co.id", "password": "wrong-password"})
    assert r.status_code == 401


def test_protected_endpoint_requires_session(client):
    r = client.get("/hc/tickets")
    assert r.status_code == 401
    r2 = client.get("/exec/tickets")
    assert r2.status_code == 401
