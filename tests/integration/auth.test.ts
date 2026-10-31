import { count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readTenantContext } from "@/server/auth/context";
import type { Database } from "@/server/db/client";
import { rateLimits, sessions, tenants, users } from "@/server/db/schema";
import { seedDatabase } from "../../scripts/seed-data";
import { callAuth, signIn, uniqueIp } from "../helpers/auth";
import { createTestDb } from "../helpers/test-db";

const PASSWORD = "password123";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

let db: Database;
let cleanup: () => Promise<void>;

beforeAll(async () => {
  ({ db, cleanup } = await createTestDb());
  await seedDatabase(db);
});

afterAll(async () => {
  await cleanup();
});

async function userByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user!;
}

async function sessionCount(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(sessions)
    .where(eq(sessions.userId, userId));
  return row!.value;
}

async function contextFor(cookie: string) {
  return readTenantContext(new Headers({ cookie }));
}

describe("sign-in", () => {
  it("signs in the seeded owner and reads the tenant from the session", async () => {
    const { response, cookie } = await signIn("owner@demo.test", PASSWORD);
    expect(response.status).toBe(200);

    const owner = await userByEmail("owner@demo.test");
    expect(await contextFor(cookie)).toEqual({
      tenantId: owner.tenantId,
      userId: owner.id,
      role: "owner",
    });
  });

  it("resolves users of two shops to their own tenants", async () => {
    const demo = await signIn("teknisi@demo.test", PASSWORD);
    const other = await signIn("teknisi@lain.test", PASSWORD);
    const shops = await db.select({ id: tenants.id }).from(tenants);

    const demoContext = await contextFor(demo.cookie);
    const otherContext = await contextFor(other.cookie);

    expect(demoContext!.tenantId).not.toBe(otherContext!.tenantId);
    expect(shops.map(({ id }) => id)).toEqual(
      expect.arrayContaining([demoContext!.tenantId, otherContext!.tenantId]),
    );
  });

  it("answers a wrong password and an unknown email the same way", async () => {
    const wrongPassword = await signIn("owner@demo.test", "salah-password");
    const unknownEmail = await signIn("tidak-ada@demo.test", "salah-password");

    expect(wrongPassword.response.status).toBe(401);
    expect(unknownEmail.response.status).toBe(401);
    expect(await wrongPassword.response.json()).toEqual(
      await unknownEmail.response.json(),
    );
  });

  it("rejects a deactivated user and opens no session", async () => {
    const user = await userByEmail("teknisi2@demo.test");
    await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, user.id));

    const { response, cookie } = await signIn("teknisi2@demo.test", PASSWORD);

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: "ACCOUNT_DISABLED" });
    expect(cookie).toBe("");
    expect(await sessionCount(user.id)).toBe(0);
  });

  it("does not reveal a deactivated account to a wrong password", async () => {
    const { response } = await signIn("teknisi2@demo.test", "salah-password");
    expect(response.status).toBe(401);
  });

  it("sets a session that lasts 7 days", async () => {
    const user = await userByEmail("admin@demo.test");
    await signIn("admin@demo.test", PASSWORD);

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id));
    const lifetime = session!.expiresAt.getTime() - Date.now();

    expect(lifetime).toBeGreaterThan(7 * DAY_IN_MS - 60_000);
    expect(lifetime).toBeLessThanOrEqual(7 * DAY_IN_MS);
  });
});

describe("tenant context", () => {
  it("is null for a guest", async () => {
    expect(await readTenantContext(new Headers())).toBeNull();
  });

  it("is null once a signed-in user is deactivated", async () => {
    const { cookie } = await signIn("owner@lain.test", PASSWORD);
    expect(await contextFor(cookie)).not.toBeNull();

    const user = await userByEmail("owner@lain.test");
    await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, user.id));

    expect(await contextFor(cookie)).toBeNull();
  });

  it("is null for a super-admin, who has no tenant", async () => {
    const { response, cookie } = await signIn("admin@fixmaster.test", PASSWORD);

    expect(response.status).toBe(200);
    expect(await contextFor(cookie)).toBeNull();
  });
});

describe("sign-out", () => {
  it("ends the session", async () => {
    const { cookie } = await signIn("teknisi@demo.test", PASSWORD);
    expect(await contextFor(cookie)).not.toBeNull();

    const response = await callAuth("/sign-out", {
      body: {},
      headers: { cookie },
    });

    expect(response.status).toBe(200);
    expect(await contextFor(cookie)).toBeNull();
  });
});

describe("closed endpoints", () => {
  it("does not allow self sign-up", async () => {
    const response = await callAuth("/sign-up/email", {
      body: {
        name: "Penyusup",
        email: "penyusup@demo.test",
        password: PASSWORD,
        role: "owner",
      },
    });

    expect(response.ok).toBe(false);
    const created = await db
      .select()
      .from(users)
      .where(eq(users.email, "penyusup@demo.test"));
    expect(created).toEqual([]);
  });

  it.each(["/update-user", "/change-password"])(
    "does not expose %s",
    async (path) => {
      const { cookie } = await signIn("admin@demo.test", PASSWORD);

      const response = await callAuth(path, {
        body: {
          name: "Nama Baru",
          currentPassword: PASSWORD,
          newPassword: "password-baru-123",
        },
        headers: { cookie },
      });

      expect(response.status).toBe(404);
    },
  );
});

describe("sign-in rate limit", () => {
  it("rejects the sixth attempt from one IP within a minute", async () => {
    const ip = uniqueIp();

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const { response } = await signIn("owner@demo.test", "salah", ip);
      expect(response.status).toBe(401);
    }

    const { response } = await signIn("owner@demo.test", PASSWORD, ip);
    expect(response.status).toBe(429);
  });

  it("keeps the count in the database and per IP", async () => {
    const ip = uniqueIp();
    await signIn("owner@demo.test", "salah", ip);

    const [row] = await db
      .select()
      .from(rateLimits)
      .where(eq(rateLimits.key, `${ip}|/sign-in/email`));
    expect(row!.count).toBe(1);

    const { response } = await signIn("owner@demo.test", PASSWORD, uniqueIp());
    expect(response.status).toBe(200);
  });
});
