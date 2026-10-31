import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { createdAt, id, timestamps } from "./columns";
import { customers } from "./customers";
import {
  approvalVia,
  deviceType,
  itemKind,
  lockType,
  ticketEventType,
  ticketStatus,
} from "./enums";
import { parts } from "./parts";
import { tenants } from "./tenants";

export const tickets = pgTable(
  "tickets",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    number: varchar("number", { length: 20 }).notNull(),
    publicToken: varchar("public_token", { length: 32 }).notNull().unique(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    status: ticketStatus("status").notNull().default("received"),
    assignedTo: uuid("assigned_to").references(() => users.id),
    deviceType: deviceType("device_type").notNull(),
    brand: varchar("brand", { length: 50 }).notNull(),
    model: varchar("model", { length: 100 }).notNull(),
    serialOrImei: varchar("serial_or_imei", { length: 50 }),
    complaint: varchar("complaint", { length: 1000 }).notNull(),
    conditionNotes: varchar("condition_notes", { length: 500 }),
    accessories: text("accessories")
      .array()
      .notNull()
      .default(sql`'{}'`),
    accessoriesNote: varchar("accessories_note", { length: 200 }),
    lockType: lockType("lock_type").notNull().default("none"),
    lockSecretEnc: text("lock_secret_enc"),
    signatureSvg: text("signature_svg"),
    termsAcceptedAt: timestamp("terms_accepted_at", {
      withTimezone: true,
    }).notNull(),
    dueDate: date("due_date"),
    diagnosis: varchar("diagnosis", { length: 2000 }),
    discountAmount: bigint("discount_amount", { mode: "number" })
      .notNull()
      .default(0),
    warrantyDays: integer("warranty_days").notNull(),
    estimateApprovedTotal: bigint("estimate_approved_total", {
      mode: "number",
    }),
    estimateApprovedAt: timestamp("estimate_approved_at", {
      withTimezone: true,
    }),
    estimateApprovalVia: approvalVia("estimate_approval_via"),
    cancelReason: varchar("cancel_reason", { length: 300 }),
    invoiceNumber: varchar("invoice_number", { length: 20 }),
    invoicedAt: timestamp("invoiced_at", { withTimezone: true }),
    pickedUpAt: timestamp("picked_up_at", { withTimezone: true }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    ...timestamps(),
  },
  (table) => [
    check(
      "tickets_lock_secret_check",
      sql`${table.lockType} <> 'none' OR ${table.lockSecretEnc} IS NULL`,
    ),
    check("tickets_discount_amount_check", sql`${table.discountAmount} >= 0`),
    check(
      "tickets_warranty_days_check",
      sql`${table.warrantyDays} BETWEEN 0 AND 365`,
    ),
    uniqueIndex("tickets_tenant_number_unique").on(
      table.tenantId,
      table.number,
    ),
    uniqueIndex("tickets_tenant_invoice_number_unique").on(
      table.tenantId,
      table.invoiceNumber,
    ),
    index("tickets_tenant_status_created_idx").on(
      table.tenantId,
      table.status,
      table.createdAt.desc(),
    ),
    index("tickets_tenant_assigned_idx").on(table.tenantId, table.assignedTo),
    index("tickets_tenant_customer_idx").on(table.tenantId, table.customerId),
    index("tickets_tenant_picked_up_idx").on(table.tenantId, table.pickedUpAt),
  ],
).enableRLS();

export const ticketItems = pgTable(
  "ticket_items",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id),
    kind: itemKind("kind").notNull(),
    partId: uuid("part_id").references(() => parts.id),
    description: varchar("description", { length: 150 }).notNull(),
    qty: integer("qty").notNull(),
    unitPrice: bigint("unit_price", { mode: "number" }).notNull(),
    unitCost: bigint("unit_cost", { mode: "number" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    ...timestamps(),
  },
  (table) => [
    check(
      "ticket_items_part_id_check",
      sql`${table.kind} = 'part' OR ${table.partId} IS NULL`,
    ),
    check("ticket_items_qty_check", sql`${table.qty} BETWEEN 1 AND 99`),
    check("ticket_items_unit_price_check", sql`${table.unitPrice} >= 0`),
    index("ticket_items_ticket_idx").on(table.ticketId),
  ],
).enableRLS();

export const ticketEvents = pgTable(
  "ticket_events",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id),
    type: ticketEventType("type").notNull(),
    fromStatus: ticketStatus("from_status"),
    toStatus: ticketStatus("to_status"),
    note: varchar("note", { length: 1000 }),
    isPublic: boolean("is_public").notNull().default(false),
    actorId: uuid("actor_id").references(() => users.id),
    createdAt: createdAt(),
  },
  (table) => [
    index("ticket_events_ticket_created_idx").on(
      table.ticketId,
      table.createdAt,
    ),
  ],
).enableRLS();
