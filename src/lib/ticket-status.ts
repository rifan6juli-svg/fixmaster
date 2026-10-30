// `ticket_status` values from docs/BSD.md section 4, with UI labels from docs/DBD.md section 2.
export const TICKET_STATUSES = [
  "received",
  "diagnosing",
  "awaiting_approval",
  "in_progress",
  "waiting_parts",
  "ready",
  "picked_up",
  "cancelled",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  received: "Diterima",
  diagnosing: "Pengecekan",
  awaiting_approval: "Menunggu persetujuan",
  in_progress: "Dikerjakan",
  waiting_parts: "Menunggu part",
  ready: "Siap diambil",
  picked_up: "Sudah diambil",
  cancelled: "Dibatalkan",
};
