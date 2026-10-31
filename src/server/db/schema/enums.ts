import { pgEnum } from "drizzle-orm/pg-core";
import { TICKET_STATUSES } from "../../../lib/ticket-status";
import { USER_ROLES } from "../../../lib/user-role";

// Enum values from docs/BSD.md section 4.
export const userRole = pgEnum("user_role", USER_ROLES);

export const deviceType = pgEnum("device_type", [
  "laptop",
  "phone",
  "tablet",
  "other",
]);

export const lockType = pgEnum("lock_type", [
  "none",
  "pin",
  "password",
  "pattern",
]);

export const ticketStatus = pgEnum("ticket_status", TICKET_STATUSES);

export const approvalVia = pgEnum("approval_via", ["link", "manual"]);

export const itemKind = pgEnum("item_kind", ["service", "part"]);

export const stockReason = pgEnum("stock_reason", [
  "purchase",
  "ticket_use",
  "ticket_return",
  "adjustment",
]);

export const paymentKind = pgEnum("payment_kind", ["payment", "refund"]);

export const paymentMethod = pgEnum("payment_method", [
  "cash",
  "transfer",
  "qris",
  "other",
]);

export const printFormat = pgEnum("print_format", [
  "thermal_58",
  "thermal_80",
  "a4",
]);

export const ticketEventType = pgEnum("ticket_event_type", [
  "created",
  "status_changed",
  "assigned",
  "diagnosis_updated",
  "note",
  "estimate_approved",
  "estimate_rejected",
  "invoice_created",
  "invoice_reopened",
  "payment_recorded",
  "secret_viewed",
  "wa_opened",
]);

export const subscriptionAction = pgEnum("subscription_action", [
  "extend",
  "reset_owner_password",
]);
