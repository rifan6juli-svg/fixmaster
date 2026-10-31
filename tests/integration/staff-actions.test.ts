import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { changePassword } from "@/server/actions/auth";
import {
  createStaff,
  resetStaffPassword,
  setStaffActive,
} from "@/server/actions/staff";
import type { Database } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { seedDatabase } from "../../scripts/seed-data";
import { signIn } from "../helpers/auth";
import { createTestDb } from "../helpers/test-db";

const request = vi.hoisted(() => ({ cookie: "" }));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ cookie: request.cookie }),
}));
vi.mock("next/cache", () => ({ refresh: vi.fn() }));

const PASSWORD = "password123";
const TEMP_PASSWORD = "sementara-123";

let db: Database;
let cleanup: () => Promise<void>;
let targetId: string;
let emailCounter = 0;

async function userByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user!;
}

async function actAs(email: string, password = PASSWORD) {
  ({ cookie: request.cookie } = await signIn(email, password));
}

function staffInput() {
  emailCounter += 1;
  return {
    name: "Staf Baru",
    email: `aksi${emailCounter}@demo.test`,
    role: "technician",
    tempPassword: TEMP_PASSWORD,
  };
}

beforeAll(async () => {
  ({ db, cleanup } = await createTestDb());
  await seedDatabase(db);
  targetId = (await userByEmail("teknisi2@demo.test")).id;
});

afterAll(async () => {
  await cleanup();
});

describe("staff actions", () => {
  it.each(["admin@demo.test", "teknisi@demo.test"])(
    "refuses %s, who is not the owner",
    async (email) => {
      await actAs(email);

      const results = [
        await createStaff(staffInput()),
        await setStaffActive({ userId: targetId, isActive: false }),
        await resetStaffPassword({
          userId: targetId,
          tempPassword: TEMP_PASSWORD,
        }),
      ];

      for (const result of results) {
        expect(result).toMatchObject({
          ok: false,
          error: { code: "FORBIDDEN" },
        });
      }
      expect((await userByEmail("teknisi2@demo.test")).isActive).toBe(true);
    },
  );

  it("sends a guest to login", async () => {
    request.cookie = "";

    await expect(createStaff(staffInput())).rejects.toMatchObject({
      digest: expect.stringContaining("/login"),
    });
  });

  it("creates staff on the session's tenant, whatever the input says", async () => {
    await actAs("owner@demo.test");
    const other = await userByEmail("owner@lain.test");
    const input = staffInput();

    const result = await createStaff({ ...input, tenantId: other.tenantId });

    expect(result.ok).toBe(true);
    const owner = await userByEmail("owner@demo.test");
    expect((await userByEmail(input.email)).tenantId).toBe(owner.tenantId);
  });

  it("reports invalid input per field", async () => {
    await actAs("owner@demo.test");

    const result = await createStaff({
      name: "",
      email: "bukan-email",
      role: "owner",
      tempPassword: "pendek",
    });

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "VALIDATION",
        fields: {
          name: "Nama wajib diisi",
          email: "Email tidak valid",
          role: "Pilih peran",
          tempPassword: "Password sementara minimal 8 karakter",
        },
      },
    });
  });
});

describe("the forced password change", () => {
  it("holds the user at S-03, then lets them through", async () => {
    await actAs("owner@demo.test");
    const input = staffInput();
    await createStaff(input);
    await actAs(input.email, TEMP_PASSWORD);

    // A Server Action cannot be used to get around the page guard.
    await expect(setStaffActive({})).rejects.toMatchObject({
      digest: expect.stringContaining("/change-password"),
    });

    const wrong = await changePassword({
      currentPassword: "bukan-password-ini",
      newPassword: "password-baru-789",
    });
    expect(wrong).toMatchObject({
      ok: false,
      error: { code: "INVALID_PASSWORD" },
    });

    const same = await changePassword({
      currentPassword: TEMP_PASSWORD,
      newPassword: TEMP_PASSWORD,
    });
    expect(same).toMatchObject({
      ok: false,
      error: { code: "VALIDATION" },
    });

    const changed = await changePassword({
      currentPassword: TEMP_PASSWORD,
      newPassword: "password-baru-789",
    });
    expect(changed.ok).toBe(true);

    // Past S-03 the same action reaches the role check.
    expect(await setStaffActive({})).toMatchObject({
      ok: false,
      error: { code: "FORBIDDEN" },
    });
  });
});
