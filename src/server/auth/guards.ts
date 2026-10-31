import type { UserRole } from "@/lib/user-role";
import { AppError } from "@/server/errors";
import type { TenantContext } from "./context";

export function requireRole(ctx: TenantContext, roles: UserRole[]) {
  if (!roles.includes(ctx.role)) {
    throw new AppError("FORBIDDEN", "Anda tidak punya akses ke fitur ini");
  }
}
