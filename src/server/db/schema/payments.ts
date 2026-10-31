import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { createdAt, id } from "./columns";
import { paymentKind, paymentMethod } from "./enums";
import { tenants } from "./tenants";
import { tickets } from "./tickets";

export const payments = pgTable(
  "payments",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id),
    kind: paymentKind("kind").notNull(),
    method: paymentMethod("method").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
    note: varchar("note", { length: 200 }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (table) => [
    check("payments_amount_check", sql`${table.amount} > 0`),
    index("payments_tenant_paid_at_idx").on(table.tenantId, table.paidAt),
    index("payments_ticket_idx").on(table.ticketId),
  ],
).enableRLS();
