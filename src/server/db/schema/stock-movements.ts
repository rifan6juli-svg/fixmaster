import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  integer,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { createdAt, id } from "./columns";
import { stockReason } from "./enums";
import { parts } from "./parts";
import { tenants } from "./tenants";
import { tickets } from "./tickets";

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    partId: uuid("part_id")
      .notNull()
      .references(() => parts.id),
    qtyChange: integer("qty_change").notNull(),
    reason: stockReason("reason").notNull(),
    ticketId: uuid("ticket_id").references(() => tickets.id),
    unitCost: bigint("unit_cost", { mode: "number" }),
    note: varchar("note", { length: 200 }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (table) => [
    check("stock_movements_qty_change_check", sql`${table.qtyChange} <> 0`),
    check(
      "stock_movements_ticket_id_check",
      sql`${table.reason} NOT IN ('ticket_use', 'ticket_return') OR ${table.ticketId} IS NOT NULL`,
    ),
    index("stock_movements_tenant_part_created_idx").on(
      table.tenantId,
      table.partId,
      table.createdAt.desc(),
    ),
    index("stock_movements_tenant_reason_created_idx").on(
      table.tenantId,
      table.reason,
      table.createdAt,
    ),
  ],
).enableRLS();
