import {
  bigint,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { createdAt, id } from "./columns";
import { subscriptionAction } from "./enums";
import { tenants } from "./tenants";

export const subscriptionLogs = pgTable(
  "subscription_logs",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    action: subscriptionAction("action").notNull(),
    activeUntilBefore: timestamp("active_until_before", { withTimezone: true }),
    activeUntilAfter: timestamp("active_until_after", { withTimezone: true }),
    amountPaid: bigint("amount_paid", { mode: "number" }),
    note: varchar("note", { length: 300 }),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (table) => [
    index("subscription_logs_tenant_created_idx").on(
      table.tenantId,
      table.createdAt.desc(),
    ),
  ],
).enableRLS();
