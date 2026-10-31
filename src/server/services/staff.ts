import { hashPassword } from "better-auth/crypto";
import { and, asc, eq, ne } from "drizzle-orm";
import type {
  CreateStaffInput,
  ResetStaffPasswordInput,
  SetStaffActiveInput,
} from "@/lib/validation/staff";
import type { TenantContext } from "@/server/auth/context";
import { getDb } from "@/server/db/client";
import { sessions, users } from "@/server/db/schema";
import { AppError } from "@/server/errors";
import {
  insertUserWithLogin,
  rejectTakenEmail,
  replaceLoginPassword,
} from "./accounts";

function staffNotFound() {
  return new AppError("NOT_FOUND", "Staf tidak ditemukan");
}

/** The shop's accounts, owner first (the enum's order). */
export async function listStaff(ctx: TenantContext) {
  return getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.tenantId, ctx.tenantId))
    .orderBy(asc(users.role), asc(users.name));
}

export type StaffMember = Awaited<ReturnType<typeof listStaff>>[number];

export async function createStaff(ctx: TenantContext, input: CreateStaffInput) {
  const passwordHash = await hashPassword(input.tempPassword);

  const userId = await rejectTakenEmail(() =>
    getDb().transaction((tx) =>
      insertUserWithLogin(tx, {
        name: input.name,
        email: input.email,
        tenantId: ctx.tenantId,
        role: input.role,
        mustChangePassword: true,
        passwordHash,
      }),
    ),
  );

  return { userId };
}

export async function setStaffActive(
  ctx: TenantContext,
  { userId, isActive }: SetStaffActiveInput,
) {
  if (userId === ctx.userId && !isActive) {
    throw new AppError(
      "CANNOT_DEACTIVATE_SELF",
      "Anda tidak bisa menonaktifkan akun sendiri",
    );
  }

  await getDb().transaction(async (tx) => {
    const updated = await tx
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(and(eq(users.id, userId), eq(users.tenantId, ctx.tenantId)))
      .returning({ id: users.id });
    if (updated.length === 0) {
      throw staffNotFound();
    }

    if (!isActive) {
      await tx.delete(sessions).where(eq(sessions.userId, userId));
    }
  });
}

/** The owner's own password is not reset here: S-15 offers no action on that row. */
export async function resetStaffPassword(
  ctx: TenantContext,
  { userId, tempPassword }: ResetStaffPasswordInput,
) {
  const passwordHash = await hashPassword(tempPassword);

  await getDb().transaction(async (tx) => {
    const updated = await tx
      .update(users)
      .set({ mustChangePassword: true, updatedAt: new Date() })
      .where(
        and(
          eq(users.id, userId),
          eq(users.tenantId, ctx.tenantId),
          ne(users.role, "owner"),
        ),
      )
      .returning({ id: users.id });
    if (updated.length === 0) {
      throw staffNotFound();
    }

    await replaceLoginPassword(tx, userId, passwordHash);
    await tx.delete(sessions).where(eq(sessions.userId, userId));
  });
}
