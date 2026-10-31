import { count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/server/db/client";
import { accounts, tenants, users } from "@/server/db/schema";
import { registerShop } from "@/server/services/shops";
import { signIn } from "../helpers/auth";
import { createTestDb } from "../helpers/test-db";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

let db: Database;
let cleanup: () => Promise<void>;
let emailCounter = 0;

beforeAll(async () => {
  ({ db, cleanup } = await createTestDb());
});

afterAll(async () => {
  await cleanup();
});

function shopInput(email = `owner${(emailCounter += 1)}@toko.test`) {
  return {
    shopName: "Toko Maju",
    ownerName: "Budi",
    phoneWa: "6281234567890",
    email,
    password: "rahasia-123",
  };
}

async function tenantCount() {
  const [row] = await db.select({ value: count() }).from(tenants);
  return row!.value;
}

describe("registerShop", () => {
  it("creates one tenant and one owner with a 14-day trial", async () => {
    const before = await tenantCount();
    const input = shopInput();

    const { tenantId, userId } = await registerShop(input);

    expect(await tenantCount()).toBe(before + 1);
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    expect(tenant!.name).toBe(input.shopName);
    expect(tenant!.phoneWa).toBe(input.phoneWa);
    expect(tenant!.ticketPrefix).toBe("SRV");
    expect(tenant!.billingCode).toBeGreaterThanOrEqual(1);
    expect(tenant!.billingCode).toBeLessThanOrEqual(999);
    expect(tenant!.trialEndsAt.getTime() - tenant!.createdAt.getTime()).toBe(
      14 * DAY_IN_MS,
    );
    expect(tenant!.activeUntil).toBeNull();

    const staff = await db
      .select()
      .from(users)
      .where(eq(users.tenantId, tenantId));
    expect(staff).toHaveLength(1);
    expect(staff[0]).toMatchObject({
      id: userId,
      email: input.email,
      role: "owner",
      isActive: true,
      mustChangePassword: false,
    });
  });

  it("stores a hashed credential that can sign in", async () => {
    const input = shopInput();
    const { userId } = await registerShop(input);

    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
    expect(account).toMatchObject({
      providerId: "credential",
      accountId: userId,
    });
    expect(account!.password).not.toContain(input.password);

    const { response } = await signIn(input.email, input.password);
    expect(response.status).toBe(200);
  });

  it("rejects a taken email and creates nothing", async () => {
    const input = shopInput();
    await registerShop(input);
    const before = await tenantCount();

    await expect(registerShop(input)).rejects.toMatchObject({
      code: "EMAIL_TAKEN",
      fields: { email: "Email sudah terdaftar" },
    });

    expect(await tenantCount()).toBe(before);
  });

  it("lets only one of two simultaneous registrations take an email", async () => {
    const input = shopInput();
    const before = await tenantCount();

    const results = await Promise.allSettled([
      registerShop(input),
      registerShop(input),
    ]);

    expect(results.map((result) => result.status).sort()).toEqual([
      "fulfilled",
      "rejected",
    ]);
    expect(await tenantCount()).toBe(before + 1);
  });

  it("gives each shop its own tenant", async () => {
    const first = await registerShop(shopInput());
    const second = await registerShop(shopInput());

    expect(first.tenantId).not.toBe(second.tenantId);
  });
});
