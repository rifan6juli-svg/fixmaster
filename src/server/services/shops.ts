import { randomInt } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import type { RegisterShopInput } from "@/lib/validation/auth";
import type { TenantContext } from "@/server/auth/context";
import { getDb } from "@/server/db/client";
import { tenants } from "@/server/db/schema";
import { insertUserWithLogin, rejectTakenEmail } from "./accounts";

const TRIAL_DAYS = 14;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** Times are stored in UTC and shown in the shop's zone (BSD section 2). */
export async function getShop(ctx: TenantContext) {
  const [shop] = await getDb()
    .select({
      name: tenants.name,
      timezone: tenants.timezone,
      trialEndsAt: tenants.trialEndsAt,
      activeUntil: tenants.activeUntil,
    })
    .from(tenants)
    .where(eq(tenants.id, ctx.tenantId));
  return shop!;
}

/** Creates the tenant, its owner, and the owner's login in one transaction (AFD F-01). */
export async function registerShop(input: RegisterShopInput) {
  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  return rejectTakenEmail(() =>
    getDb().transaction(async (tx) => {
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

      const userId = await insertUserWithLogin(tx, {
        name: input.ownerName,
        email: input.email,
        tenantId: tenant!.id,
        role: "owner",
        mustChangePassword: false,
        passwordHash,
      });

      return { tenantId: tenant!.id, userId };
    }),
  );
}
