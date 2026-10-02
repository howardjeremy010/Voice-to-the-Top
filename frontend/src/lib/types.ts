// Hand-written mirrors of backend/models/schemas.py — keep in sync.
export type Role = "hc" | "exec";
export type Category = "apresiasi" | "aspirasi" | "perbaikan" | "inovasi" | "keluhan" | "opini";
export type Mode = "rahasia" | "bernama" | "anonim";
export type Status =
  | "terkirim"
  | "ditinjau"
  | "diteruskan"
  | "disetujui"
  | "ditindaklanjuti"
  | "ditolak"
  | "selesai";
export type SlaState = "tepat_waktu" | "mendekati" | "terlambat";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  department: string;
}

export interface TicketCreate {
  category: Category;
  mode: Mode;
  title: string;
  message: string;
  display_name?: string | null;
  department?: string | null;
  employee_id?: string | null;
  recipient_name?: string | null;
  publish_consent: boolean;
  resubmitted_from?: string | null;
}

export interface TicketCreated {
  id: string;
  ticket_no: string;
  access_code: string;
  status: Status;
}

export interface HistoryItem {
  status: Status;
  at: string;
  note: string | null;
}

export interface Reply {
  message: string;
  by_name: string;
  at: string;
}

export interface Ticket {
  id: string;
  ticket_no: string;
  category: Category;
  mode: Mode;
  title: string;
  message: string;
  recipient_name: string | null;
  publish_consent: boolean;
  status: Status;
  sender_display: string;
  identity_name: string | null;
  identity_department: string | null;
  identity_employee_id: string | null;
  rejection_reason: string | null;
  hc_note: string | null;
  reply: Reply | null;
  created_at: string;
  review_due_at: string;
  response_due_at: string | null;
  sla_state: SlaState | null;
  history: HistoryItem[];
  resubmitted_from: string | null;
}

export interface WallItem {
  id: string;
  ticket_no: string;
  title: string;
  message: string;
  recipient_name: string | null;
  sender_display: string;
  published_at: string;
}

export interface Summary {
  hc_pending: number;
  exec_pending: number;
  wall_count: number;
}

export interface CountItem {
  key: string;
  count: number;
}

export interface RejectionItem {
  ticket_no: string;
  category: Category;
  reason: string;
  by_name: string;
  at: string;
}

export interface OverdueItem {
  ticket_no: string;
  category: Category;
  status: Status;
  stage: "tinjau_hc" | "tanggapan";
  due_at: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor_name: string;
  actor_role: string;
  action: string;
  ticket_no: string;
  category: Category;
  detail: string | null;
}

export interface ExecRecap {
  total: number;
  by_status: CountItem[];
  by_category: CountItem[];
  rejections_by_category: CountItem[];
  rejections: RejectionItem[];
  overdue: OverdueItem[];
  audit: AuditEntry[];
}
