import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { UserRole } from "@/lib/user-role";
import { getAuth } from "./auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  mustChangePassword: boolean;
}

export interface TenantContext {
  tenantId: string;
  userId: string;
  role: UserRole;
}

/** Null for guests and deactivated users. */
export async function readSessionUser(
  requestHeaders: Headers,
): Promise<SessionUser | null> {
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  const user = session?.user;

  if (!user?.isActive) {
    return null;
  }
  const { id, name, email, role, mustChangePassword } = user;
  return {
    id,
    name,
    email,
    role,
    tenantId: user.tenantId ?? null,
    mustChangePassword,
  };
}

/** Null when there is no active user, or the user has no tenant (super-admin). */
export async function readTenantContext(
  requestHeaders: Headers,
): Promise<TenantContext | null> {
  const user = await readSessionUser(requestHeaders);
  if (!user?.tenantId) {
    return null;
  }
  return { tenantId: user.tenantId, userId: user.id, role: user.role };
}

export function homePath(user: SessionUser) {
  return user.tenantId ? "/dashboard" : "/admin";
}

/** The signed-in user, for S-03 itself. Sends everyone else to login. */
export const getSessionUser = cache(async () => {
  const user = await readSessionUser(await headers());
  if (!user) {
    redirect("/login");
  }
  return user;
});

/** Holds a user with a temporary password at S-03 (PRD F-02). */
const getClearedUser = cache(async () => {
  const user = await getSessionUser();
  if (user.mustChangePassword) {
    redirect("/change-password");
  }
  return user;
});

/** The signed-in user's tenant, from the session only. Super-admins go to their panel. */
export const getTenantContext = cache(async (): Promise<TenantContext> => {
  const user = await getClearedUser();
  if (!user.tenantId) {
    redirect("/admin");
  }
  return { tenantId: user.tenantId, userId: user.id, role: user.role };
});

const ACCESS_DENIED_PATH = "/dashboard?denied=1";

/** For pages: other roles go to S-04 with the message from AFD section 5. */
export async function requirePageRole(roles: UserRole[]) {
  const ctx = await getTenantContext();
  if (!roles.includes(ctx.role)) {
    redirect(ACCESS_DENIED_PATH);
  }
  return ctx;
}

export async function requireSuperAdmin() {
  const user = await getClearedUser();
  if (user.role !== "super_admin") {
    redirect(ACCESS_DENIED_PATH);
  }
  return user;
}
