import { hashPassword, verifyPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import type { UserRole } from "@/lib/user-role";
import type { ChangePasswordInput } from "@/lib/validation/auth";
import { getDb, type Transaction } from "@/server/db/client";
import { accounts, users } from "@/server/db/schema";
import { AppError } from "@/server/errors";

const EMAIL_PROVIDER = "credential";

interface NewUser {
  name: string;
  email: string;
  tenantId: string;
  role: UserRole;
  mustChangePassword: boolean;
  /** From hashPassword(), called before the transaction: it takes 100ms or more. */
  passwordHash: string;
}

/** Inserts a user and their email login (TRD section 5). */
export async function insertUserWithLogin(
  tx: Transaction,
  { passwordHash, ...user }: NewUser,
) {
  const [{ id }] = (await tx
    .insert(users)
    .values(user)
    .returning({ id: users.id })) as [{ id: string }];

  await tx.insert(accounts).values({
    userId: id,
    accountId: id,
    providerId: EMAIL_PROVIDER,
    password: passwordHash,
  });

  return id;
}

/** Runs an insert into users, turning a duplicate email into EMAIL_TAKEN. */
export async function rejectTakenEmail<T>(insert: () => Promise<T>) {
  try {
    return await insert();
  } catch (error) {
    const { cause } = error as { cause?: { constraint_name?: string } };
    if (cause?.constraint_name === "users_email_unique") {
      const message = "Email sudah terdaftar";
      throw new AppError("EMAIL_TAKEN", message, { email: message });
    }
    throw error;
  }
}

export async function replaceLoginPassword(
  tx: Transaction,
  userId: string,
  passwordHash: string,
) {
  await tx
    .update(accounts)
    .set({ password: passwordHash, updatedAt: new Date() })
    .where(
      and(eq(accounts.userId, userId), eq(accounts.providerId, EMAIL_PROVIDER)),
    );
}

/** userId comes from the session: super-admins change theirs too, without a tenant. */
export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
) {
  const db = getDb();
  const [account] = await db
    .select({ password: accounts.password })
    .from(accounts)
    .where(
      and(eq(accounts.userId, userId), eq(accounts.providerId, EMAIL_PROVIDER)),
    );

  const isCurrent =
    account?.password &&
    (await verifyPassword({
      hash: account.password,
      password: input.currentPassword,
    }));
  if (!isCurrent) {
    const message = "Password saat ini salah";
    throw new AppError("INVALID_PASSWORD", message, {
      currentPassword: message,
    });
  }

  const passwordHash = await hashPassword(input.newPassword);
  await db.transaction(async (tx) => {
    await replaceLoginPassword(tx, userId, passwordHash);
    await tx
      .update(users)
      .set({ mustChangePassword: false, updatedAt: new Date() })
      .where(eq(users.id, userId));
  });
}
