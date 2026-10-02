"""Emergent-managed Resend email. Recipients come from server config (NOTIFY_EMAILS), bodies from templates."""

import ipaddress
import logging
import os
import re
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse

import httpx

logger = logging.getLogger(__name__)

EMAIL_BASE_URL = "https://integrations.emergentagent.com"

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: list[str], subject: str, html: str) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": to, "subject": subject, "html": html, "from_name": os.environ["EMAIL_FROM_NAME"]}
    if os.environ.get("EMAIL_REPLY_TO"):
        payload["contact_email"] = os.environ["EMAIL_REPLY_TO"]
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{EMAIL_BASE_URL}/api/v1/email/send",
            headers={"X-Email-Key": os.environ["EMERGENT_EMAIL_KEY"]},
            json=payload,
        )
    resp.raise_for_status()
    return resp.json().get("id")


async def notify_exec_forwarded(ticket_no: str, category_name: str) -> None:
    """Fire-and-forget: never raises. Content of the message is NOT included (confidential)."""
    try:
        recipients = [e.strip() for e in os.environ.get("NOTIFY_EMAILS", "").split(",") if e.strip()]
        if not recipients:
            return
        app_url = os.environ.get("PUBLIC_APP_URL", "").rstrip("/")
        brand = escape(os.environ["EMAIL_FROM_NAME"])
        link = f'<p><a href="{escape(app_url)}/eksekutif" style="color:#0D9488">Buka Kotak Masuk Eksekutif</a></p>' if app_url.startswith("https://") else ""
        subject = f"Pesan Voice to the Top baru: {ticket_no}"
        html = (
            '<table role="presentation" width="100%"><tr><td style="padding:24px;font-family:Arial,sans-serif;color:#0F172A">'
            f'<h2 style="color:#0F2942;margin:0 0 12px">Pesan baru menanti tanggapan Anda</h2>'
            f'<p>Human Capital telah meninjau dan meneruskan pesan <strong>{escape(ticket_no)}</strong> '
            f'kategori <strong>{escape(category_name)}</strong> kepada CEO &amp; CHCO.</p>'
            '<p>Demi menjaga kerahasiaan, isi pesan hanya dapat dibaca di dalam aplikasi. '
            'Target tanggapan maksimal 7 hari kerja.</p>'
            f'{link}'
            f'<p style="font-size:12px;color:#64748B">Dikirim otomatis oleh {brand}. '
            'Kami tidak pernah meminta kata sandi melalui email.</p></td></tr></table>'
        )
        await send_email(to=recipients, subject=subject, html=html)
        logger.info("Exec notification sent for %s", ticket_no)
    except Exception as exc:
        logger.error("Exec notification failed for %s: %s", ticket_no, exc)
