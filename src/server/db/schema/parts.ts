import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "./columns";
import { tenants } from "./tenants";

export const parts = pgTable(
  "parts",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    sku: varchar("sku", { length: 40 }),
    name: varchar("name", { length: 120 }).notNull(),
    costPrice: bigint("cost_price", { mode: "number" }).notNull().default(0),
    sellPrice: bigint("sell_price", { mode: "number" }).notNull().default(0),
    stock: integer("stock").notNull().default(0),
    minStock: integer("min_stock").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (table) => [
    check("parts_cost_price_check", sql`${table.costPrice} >= 0`),
    check("parts_sell_price_check", sql`${table.sellPrice} >= 0`),
    check("parts_stock_check", sql`${table.stock} >= 0`),
    check("parts_min_stock_check", sql`${table.minStock} >= 0`),
    uniqueIndex("parts_tenant_sku_unique")
      .on(table.tenantId, table.sku)
      .where(sql`${table.sku} IS NOT NULL`),
    index("parts_tenant_name_idx").on(table.tenantId, table.name),
  ],
).enableRLS();
