import { randomInt } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import type { RegisterShopInput } from "@/lib/validation/auth";
import { getDb } from "@/server/db/client";
import { accounts, tenants, users } from "@/server/db/schema";
import { AppError } from "@/server/errors";

const TRIAL_DAYS = 14;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function isEmailTaken(error: unknown) {
  const { cause } = error as { cause?: { constraint_name?: string } };
  return cause?.constraint_name === "users_email_unique";
}

/** Creates the tenant, its owner, and the owner's login in one transaction (AFD F-01). */
export async function registerShop(input: RegisterShopInput) {
  const password = await hashPassword(input.password);
  const now = new Date();

  try {
    return await getDb().transaction(async (tx) => {
      const [tenant] = await tx
        .insert(tenants)
        .values({
          name: input.shopName,
          phoneWa: input.phoneWa,
          billingCode: randomInt(1, 1000),
          trialEndsAt: new Date(now.getTime() + TRIAL_DAYS * DAY_IN_MS),
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: tenants.id });

      const [owner] = await tx
        .insert(users)
        .values({
          name: input.ownerName,
          email: input.email,
          tenantId: tenant!.id,
          role: "owner",
        })
        .returning({ id: users.id });

      await tx.insert(accounts).values({
        userId: owner!.id,
        accountId: owner!.id,
        providerId: "credential",
        password,
      });

      return { tenantId: tenant!.id, userId: owner!.id };
    });
  } catch (error) {
    if (isEmailTaken(error)) {
      const message = "Email sudah terdaftar";
      throw new AppError("EMAIL_TAKEN", message, { email: message });
    }
    throw error;
  }
}
