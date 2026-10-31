import { count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readTenantContext, type TenantContext } from "@/server/auth/context";
import type { Database } from "@/server/db/client";
import { sessions, users } from "@/server/db/schema";
import { changePassword } from "@/server/services/accounts";
import {
  createStaff,
  listStaff,
  resetStaffPassword,
  setStaffActive,
} from "@/server/services/staff";
import { seedDatabase } from "../../scripts/seed-data";
import { signIn } from "../helpers/auth";
import { createTestDb } from "../helpers/test-db";

const TEMP_PASSWORD = "sementara-123";

let db: Database;
let cleanup: () => Promise<void>;
let demoOwner: TenantContext;
let otherOwner: TenantContext;
let emailCounter = 0;

async function userByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user!;
}

async function ownerContext(email: string): Promise<TenantContext> {
  const owner = await userByEmail(email);
  return { tenantId: owner.tenantId!, userId: owner.id, role: "owner" };
}

async function sessionCount(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(sessions)
    .where(eq(sessions.userId, userId));
  return row!.value;
}

function staffInput(email = `staf${(emailCounter += 1)}@demo.test`) {
  return {
    name: "Staf Baru",
    email,
    role: "technician" as const,
    tempPassword: TEMP_PASSWORD,
  };
}

/** A staff member of the demo shop who can sign in, past the forced change. */
async function addActiveStaff() {
  const input = staffInput();
  const { userId } = await createStaff(demoOwner, input);
  await db
    .update(users)
    .set({ mustChangePassword: false })
    .where(eq(users.id, userId));
  return { ...input, userId };
}

beforeAll(async () => {
  ({ db, cleanup } = await createTestDb());
  await seedDatabase(db);
  demoOwner = await ownerContext("owner@demo.test");
  otherOwner = await ownerContext("owner@lain.test");
});

afterAll(async () => {
  await cleanup();
});

describe("listStaff", () => {
  it("lists only the shop's accounts, owner first", async () => {
    const staff = await listStaff(otherOwner);

    expect(staff.map(({ email }) => email)).toEqual([
      "owner@lain.test",
      "teknisi@lain.test",
    ]);
  });
});

describe("createStaff", () => {
  it("creates a login on the owner's tenant with a forced password change", async () => {
    const input = staffInput();

    const { userId } = await createStaff(demoOwner, input);

    expect(await userByEmail(input.email)).toMatchObject({
      id: userId,
      tenantId: demoOwner.tenantId,
      role: "technician",
      isActive: true,
      mustChangePassword: true,
    });
    const { response } = await signIn(input.email, TEMP_PASSWORD);
    expect(response.status).toBe(200);
  });

  it("rejects an email taken in the same shop", async () => {
    await expect(
      createStaff(demoOwner, staffInput("admin@demo.test")),
    ).rejects.toMatchObject({
      code: "EMAIL_TAKEN",
      fields: { email: "Email sudah terdaftar" },
    });
  });

  it("rejects an email taken in another shop", async () => {
    await expect(
      createStaff(demoOwner, staffInput("owner@lain.test")),
    ).rejects.toMatchObject({ code: "EMAIL_TAKEN" });
  });
});

describe("setStaffActive", () => {
  it("revokes every session of a deactivated staff member", async () => {
    const staff = await addActiveStaff();
    const first = await signIn(staff.email, TEMP_PASSWORD);
    await signIn(staff.email, TEMP_PASSWORD);
    expect(await sessionCount(staff.userId)).toBe(2);

    await setStaffActive(demoOwner, { userId: staff.userId, isActive: false });

    expect(await sessionCount(staff.userId)).toBe(0);
    expect(
      await readTenantContext(new Headers({ cookie: first.cookie })),
    ).toBeNull();
    const { response } = await signIn(staff.email, TEMP_PASSWORD);
    expect(response.status).toBe(403);
  });

  it("lets a reactivated staff member sign in again", async () => {
    const staff = await addActiveStaff();
    await setStaffActive(demoOwner, { userId: staff.userId, isActive: false });

    await setStaffActive(demoOwner, { userId: staff.userId, isActive: true });

    const { response } = await signIn(staff.email, TEMP_PASSWORD);
    expect(response.status).toBe(200);
  });

  it("refuses to deactivate the owner's own account", async () => {
    await expect(
      setStaffActive(demoOwner, { userId: demoOwner.userId, isActive: false }),
    ).rejects.toMatchObject({ code: "CANNOT_DEACTIVATE_SELF" });

    expect((await userByEmail("owner@demo.test")).isActive).toBe(true);
  });

  it("answers NOT_FOUND for another shop's staff and changes nothing", async () => {
    const staff = await addActiveStaff();

    await expect(
      setStaffActive(otherOwner, { userId: staff.userId, isActive: false }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect((await userByEmail(staff.email)).isActive).toBe(true);
  });
});

describe("resetStaffPassword", () => {
  it("replaces the password, forces a change, and revokes sessions", async () => {
    const staff = await addActiveStaff();
    await signIn(staff.email, TEMP_PASSWORD);

    await resetStaffPassword(demoOwner, {
      userId: staff.userId,
      tempPassword: "sementara-baru-456",
    });

    expect(await sessionCount(staff.userId)).toBe(0);
    expect((await userByEmail(staff.email)).mustChangePassword).toBe(true);

    const oldLogin = await signIn(staff.email, TEMP_PASSWORD);
    expect(oldLogin.response.status).toBe(401);
    const newLogin = await signIn(staff.email, "sementara-baru-456");
    expect(newLogin.response.status).toBe(200);
  });

  it("answers NOT_FOUND for another shop's staff and changes nothing", async () => {
    const staff = await addActiveStaff();

    await expect(
      resetStaffPassword(otherOwner, {
        userId: staff.userId,
        tempPassword: "sementara-baru-456",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    const { response } = await signIn(staff.email, TEMP_PASSWORD);
    expect(response.status).toBe(200);
  });

  it("does not touch the owner's row", async () => {
    await expect(
      resetStaffPassword(demoOwner, {
        userId: demoOwner.userId,
        tempPassword: "sementara-baru-456",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("changePassword", () => {
  it("replaces the password and clears the forced change", async () => {
    const input = staffInput();
    const { userId } = await createStaff(demoOwner, input);

    await changePassword(userId, {
      currentPassword: TEMP_PASSWORD,
      newPassword: "password-baru-789",
    });

    expect((await userByEmail(input.email)).mustChangePassword).toBe(false);
    const oldLogin = await signIn(input.email, TEMP_PASSWORD);
    expect(oldLogin.response.status).toBe(401);
    const newLogin = await signIn(input.email, "password-baru-789");
    expect(newLogin.response.status).toBe(200);
  });

  it("rejects a wrong current password and changes nothing", async () => {
    const input = staffInput();
    const { userId } = await createStaff(demoOwner, input);

    await expect(
      changePassword(userId, {
        currentPassword: "bukan-password-ini",
        newPassword: "password-baru-789",
      }),
    ).rejects.toMatchObject({
      code: "INVALID_PASSWORD",
      fields: { currentPassword: "Password saat ini salah" },
    });

    expect((await userByEmail(input.email)).mustChangePassword).toBe(true);
  });
});
