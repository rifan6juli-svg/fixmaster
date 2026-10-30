import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/server/db/client";
import { customers, tenants, tickets, users } from "@/server/db/schema";
import { createTestDb } from "../helpers/test-db";

// Tables from docs/BSD.md section 3.
const TABLES = [
  "accounts",
  "customers",
  "parts",
  "payments",
  "rate_limits",
  "sessions",
  "stock_movements",
  "subscription_logs",
  "tenants",
  "ticket_events",
  "ticket_items",
  "tickets",
  "users",
  "verifications",
];

let db: Database;
let cleanup: () => Promise<void>;
let emailCounter = 0;

beforeAll(async () => {
  ({ db, cleanup } = await createTestDb());
});

afterAll(async () => {
  await cleanup();
});

async function insertTenant() {
  const [tenant] = await db
    .insert(tenants)
    .values({
      name: "Toko Uji",
      phoneWa: "6281234567890",
      billingCode: 123,
      trialEndsAt: new Date("2030-01-01T00:00:00Z"),
    })
    .returning();
  return tenant!;
}

function userValues(
  tenantId: string | null,
  role: "owner" | "admin" | "technician" | "super_admin",
) {
  emailCounter += 1;
  return {
    name: "Pengguna Uji",
    email: `user${emailCounter}@demo.test`,
    tenantId,
    role,
  };
}

async function insertTicketParents() {
  const tenant = await insertTenant();
  const [owner] = await db
    .insert(users)
    .values(userValues(tenant.id, "owner"))
    .returning();
  const [customer] = await db
    .insert(customers)
    .values({
      tenantId: tenant.id,
      name: "Pelanggan Uji",
      phoneWa: "6281111111111",
    })
    .returning();
  return { tenant, owner: owner!, customer: customer! };
}

function ticketValues(
  parents: Awaited<ReturnType<typeof insertTicketParents>>,
  number: string,
) {
  return {
    tenantId: parents.tenant.id,
    number,
    publicToken: `token-${number}`,
    customerId: parents.customer.id,
    deviceType: "laptop" as const,
    brand: "Asus",
    model: "X441",
    complaint: "Tidak menyala",
    termsAcceptedAt: new Date(),
    warrantyDays: 30,
    createdBy: parents.owner.id,
  };
}

async function violatedConstraint(query: PromiseLike<unknown>) {
  try {
    await query;
  } catch (error) {
    const { cause } = error as { cause?: { constraint_name?: string } };
    return cause?.constraint_name ?? null;
  }
  return null;
}

describe("schema", () => {
  it("creates every table", async () => {
    const rows = await db.execute<{ tablename: string }>(
      sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
    );
    expect(rows.map((row) => row.tablename)).toEqual(TABLES);
  });

  it("enables RLS on every public table", async () => {
    const rows = await db.execute<{ relname: string }>(sql`
      SELECT c.relname
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
    `);
    expect(rows).toEqual([]);
  });

  it.each(["anon", "authenticated"])(
    "returns no rows to %s even when it has a grant",
    async (role) => {
      await insertTicketParents();

      const counts = await db.transaction(async (tx) => {
        await tx.execute(
          sql`GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${sql.identifier(role)}`,
        );
        await tx.execute(sql`SET LOCAL ROLE ${sql.identifier(role)}`);

        const result: Record<string, number> = {};
        for (const table of TABLES) {
          const rows = await tx.execute(
            sql`SELECT 1 FROM ${sql.identifier(table)}`,
          );
          result[table] = rows.length;
        }
        return result;
      });

      expect(new Set(Object.values(counts))).toEqual(new Set([0]));
    },
  );

  it("lets the application role read rows protected by RLS", async () => {
    await insertTenant();
    const rows = await db.select().from(tenants);
    expect(rows.length).toBeGreaterThan(0);
  });

  it("stores rupiah bigint columns as numbers", async () => {
    const parents = await insertTicketParents();
    const [ticket] = await db
      .insert(tickets)
      .values({
        ...ticketValues(parents, "SRV-00090"),
        discountAmount: 1_250_000,
      })
      .returning();
    expect(ticket!.discountAmount).toBe(1_250_000);
  });
});

describe("tickets.lock_secret_enc", () => {
  it("rejects a secret when lock_type is none", async () => {
    const parents = await insertTicketParents();
    const constraint = await violatedConstraint(
      db.insert(tickets).values({
        ...ticketValues(parents, "SRV-00001"),
        lockType: "none",
        lockSecretEnc: "v1:iv:tag:ciphertext",
      }),
    );
    expect(constraint).toBe("tickets_lock_secret_check");
  });

  it("accepts a secret when the device is locked", async () => {
    const parents = await insertTicketParents();
    const constraint = await violatedConstraint(
      db.insert(tickets).values({
        ...ticketValues(parents, "SRV-00002"),
        lockType: "pin",
        lockSecretEnc: "v1:iv:tag:ciphertext",
      }),
    );
    expect(constraint).toBeNull();
  });
});

describe("users super_admin and tenant_id", () => {
  it("rejects a super_admin with a tenant", async () => {
    const tenant = await insertTenant();
    const constraint = await violatedConstraint(
      db.insert(users).values(userValues(tenant.id, "super_admin")),
    );
    expect(constraint).toBe("users_super_admin_tenant_check");
  });

  it("rejects a shop role without a tenant", async () => {
    const constraint = await violatedConstraint(
      db.insert(users).values(userValues(null, "technician")),
    );
    expect(constraint).toBe("users_super_admin_tenant_check");
  });

  it("accepts a super_admin without a tenant", async () => {
    const constraint = await violatedConstraint(
      db.insert(users).values(userValues(null, "super_admin")),
    );
    expect(constraint).toBeNull();
  });
});

describe("users owner per tenant", () => {
  it("rejects a second owner in the same tenant", async () => {
    const tenant = await insertTenant();
    await db.insert(users).values(userValues(tenant.id, "owner"));
    const constraint = await violatedConstraint(
      db.insert(users).values(userValues(tenant.id, "owner")),
    );
    expect(constraint).toBe("users_tenant_owner_unique");
  });

  it("allows one owner in each tenant and many staff", async () => {
    const first = await insertTenant();
    const second = await insertTenant();
    await db.insert(users).values(userValues(first.id, "owner"));

    const constraint = await violatedConstraint(
      db
        .insert(users)
        .values([
          userValues(second.id, "owner"),
          userValues(first.id, "admin"),
          userValues(first.id, "technician"),
        ]),
    );
    expect(constraint).toBeNull();
  });
});

describe("createTestDb", () => {
  it("refuses a hosted database", async () => {
    await expect(
      createTestDb("postgresql://postgres:pw@db.ref.supabase.co:5432/postgres"),
    ).rejects.toThrow("non-local");
  });
});
