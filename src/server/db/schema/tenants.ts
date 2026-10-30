import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "./columns";
import { printFormat } from "./enums";

export const DEFAULT_SERVICE_TERMS = `1. Data dan kondisi unit pada tanda terima ini sudah diperiksa bersama dan dinyatakan benar oleh pelanggan.
2. Perbaikan berbiaya dikerjakan setelah estimasi disetujui pelanggan.
3. Pelanggan bertanggung jawab mencadangkan data sebelum unit diserahkan; toko tidak bertanggung jawab atas kehilangan data selama servis.
4. Garansi hanya berlaku untuk pekerjaan yang tercantum pada nota, selama masa garansi pada nota.
5. Pengambilan unit dilakukan setelah pembayaran lunas dengan menunjukkan tanda terima atau nomor tiket.`;

export const tenants = pgTable(
  "tenants",
  {
    id: id(),
    name: varchar("name", { length: 80 }).notNull(),
    phoneWa: varchar("phone_wa", { length: 20 }).notNull(),
    address: varchar("address", { length: 300 }),
    timezone: varchar("timezone", { length: 40 })
      .notNull()
      .default("Asia/Jakarta"),
    ticketPrefix: varchar("ticket_prefix", { length: 5 })
      .notNull()
      .default("SRV"),
    ticketSeq: integer("ticket_seq").notNull().default(0),
    invoiceSeq: integer("invoice_seq").notNull().default(0),
    defaultWarrantyDays: integer("default_warranty_days").notNull().default(30),
    serviceTerms: text("service_terms")
      .notNull()
      .default(DEFAULT_SERVICE_TERMS),
    printFormat: printFormat("print_format").notNull().default("thermal_58"),
    requireSignature: boolean("require_signature").notNull().default(true),
    techniciansCanClaim: boolean("technicians_can_claim")
      .notNull()
      .default(false),
    billingCode: smallint("billing_code").notNull(),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }).notNull(),
    activeUntil: timestamp("active_until", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    check(
      "tenants_timezone_check",
      sql`${table.timezone} IN ('Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura')`,
    ),
    check(
      "tenants_ticket_prefix_check",
      sql`${table.ticketPrefix} ~ '^[A-Z]{2,5}$'`,
    ),
    check(
      "tenants_default_warranty_days_check",
      sql`${table.defaultWarrantyDays} BETWEEN 0 AND 365`,
    ),
    check(
      "tenants_billing_code_check",
      sql`${table.billingCode} BETWEEN 1 AND 999`,
    ),
  ],
).enableRLS();
