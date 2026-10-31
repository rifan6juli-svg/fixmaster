import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAuth } from "./auth";

export type UserRole = "owner" | "admin" | "technician" | "super_admin";

export interface TenantContext {
  tenantId: string;
  userId: string;
  role: UserRole;
}

/** Null for guests, deactivated users, and super-admins (who have no tenant). */
export async function readTenantContext(
  requestHeaders: Headers,
): Promise<TenantContext | null> {
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  const user = session?.user;

  if (!user?.isActive || !user.tenantId) {
    return null;
  }
  return { tenantId: user.tenantId, userId: user.id, role: user.role };
}

/** The signed-in user's tenant, from the session only. Sends everyone else to login. */
export const getTenantContext = cache(async () => {
  const ctx = await readTenantContext(await headers());
  if (!ctx) {
    redirect("/login");
  }
  return ctx;
});
