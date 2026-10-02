"""Pydantic models for Insan Bersuara. Each mirrors a TS interface in frontend/src/lib/types.ts."""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

Role = Literal["hc", "exec"]
Category = Literal["apresiasi", "aspirasi", "perbaikan", "inovasi", "keluhan", "opini"]
Mode = Literal["rahasia", "bernama", "anonim"]
Status = Literal["terkirim", "ditinjau", "diteruskan", "disetujui", "ditindaklanjuti", "ditolak", "selesai"]
SlaState = Literal["tepat_waktu", "mendekati", "terlambat"]


class User(BaseModel):
    id: str
    name: str
    email: str
    role: Role
    title: str
    department: str


class LoginIn(BaseModel):
    email: str
    password: str


class TicketCreate(BaseModel):
    category: Category
    mode: Mode
    title: str = Field(min_length=3, max_length=120)
    message: str = Field(min_length=10, max_length=4000)
    display_name: Optional[str] = None  # required for bernama & rahasia; never stored for anonim
    department: Optional[str] = None  # unit kerja, optional, never stored for anonim
    employee_id: Optional[str] = Field(default=None, max_length=30)  # NIK, required for rahasia & bernama
    recipient_name: Optional[str] = None  # only for apresiasi
    publish_consent: bool = False
    resubmitted_from: Optional[str] = None  # ticket_no


class TicketCreated(BaseModel):
    id: str
    ticket_no: str
    access_code: str
    status: Status


class HistoryItem(BaseModel):
    status: Status
    at: datetime
    note: Optional[str] = None


class Reply(BaseModel):
    message: str
    by_name: str
    at: datetime


class Ticket(BaseModel):
    id: str
    ticket_no: str
    category: Category
    mode: Mode
    title: str
    message: str
    recipient_name: Optional[str] = None
    publish_consent: bool
    status: Status
    sender_display: str
    identity_name: Optional[str] = None  # visible to HC/exec only for rahasia & bernama
    identity_department: Optional[str] = None
    identity_employee_id: Optional[str] = None  # NIK, HC/exec only
    rejection_reason: Optional[str] = None
    hc_note: Optional[str] = None
    reply: Optional[Reply] = None
    created_at: datetime
    review_due_at: datetime
    response_due_at: Optional[datetime] = None
    sla_state: Optional[SlaState] = None
    history: list[HistoryItem]
    resubmitted_from: Optional[str] = None


class LookupIn(BaseModel):
    ticket_no: str
    access_code: str


class HcApprove(BaseModel):
    note: Optional[str] = None


class HcReject(BaseModel):
    reason: str = Field(min_length=5, max_length=1000)


class ExecReply(BaseModel):
    message: str = Field(min_length=5, max_length=4000)


class WallItem(BaseModel):
    id: str
    ticket_no: str
    title: str
    message: str
    recipient_name: Optional[str] = None
    sender_display: str
    published_at: datetime


class Summary(BaseModel):
    hc_pending: int
    exec_pending: int
    wall_count: int


class CountItem(BaseModel):
    key: str
    count: int


class RejectionItem(BaseModel):
    ticket_no: str
    category: Category
    reason: str
    by_name: str
    at: datetime


class OverdueItem(BaseModel):
    ticket_no: str
    category: Category
    status: Status
    stage: Literal["tinjau_hc", "tanggapan"]
    due_at: datetime


class AuditEntry(BaseModel):
    id: str
    at: datetime
    actor_name: str
    actor_role: str
    action: str
    ticket_no: str
    category: Category
    detail: Optional[str] = None


class ExecRecap(BaseModel):
    total: int
    by_status: list[CountItem]
    by_category: list[CountItem]
    rejections_by_category: list[CountItem]
    rejections: list[RejectionItem]
    overdue: list[OverdueItem]
    audit: list[AuditEntry]
