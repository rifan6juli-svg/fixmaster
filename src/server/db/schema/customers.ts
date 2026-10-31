import {
  index,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "./columns";
import { tenants } from "./tenants";

export const customers = pgTable(
  "customers",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 100 }).notNull(),
    phoneWa: varchar("phone_wa", { length: 20 }).notNull(),
    notes: varchar("notes", { length: 500 }),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("customers_tenant_phone_unique").on(
      table.tenantId,
      table.phoneWa,
    ),
    index("customers_tenant_name_idx").on(table.tenantId, table.name),
  ],
).enableRLS();
