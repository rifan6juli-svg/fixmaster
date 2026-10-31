import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TenantContext } from "@/server/auth/context";
import type { Database } from "@/server/db/client";
import { tenants, users } from "@/server/db/schema";
import { shopHasTickets } from "@/server/services/dashboard";
import { registerShop } from "@/server/services/shops";
import { seedDatabase } from "../../scripts/seed-data";
import { createTestDb } from "../helpers/test-db";

let db: Database;
let cleanup: () => Promise<void>;

beforeAll(async () => {
  ({ db, cleanup } = await createTestDb());
  await seedDatabase(db);
});

afterAll(async () => {
  await cleanup();
});

async function seededOwnerContext(): Promise<TenantContext> {
  const [owner] = await db
    .select()
    .from(users)
    .where(eq(users.email, "owner@demo.test"));
  return { tenantId: owner!.tenantId!, userId: owner!.id, role: "owner" };
}

describe("shopHasTickets", () => {
  it("is true for a shop with tickets", async () => {
    expect(await shopHasTickets(await seededOwnerContext())).toBe(true);
  });

  it("does not count another shop's tickets", async () => {
    const shop = await registerShop({
      shopName: "Toko Baru",
      ownerName: "Pemilik",
      phoneWa: "6281234567890",
      email: "baru@toko.test",
      password: "rahasia-123",
    });

    expect(
      await shopHasTickets({
        tenantId: shop.tenantId,
        userId: shop.userId,
        role: "owner",
      }),
    ).toBe(false);

    const shops = await db.select({ id: tenants.id }).from(tenants);
    expect(shops.length).toBeGreaterThan(1);
  });
});
