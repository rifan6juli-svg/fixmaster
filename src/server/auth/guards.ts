import { AppError } from "@/server/errors";
import type { TenantContext, UserRole } from "./context";

export function requireRole(ctx: TenantContext, roles: UserRole[]) {
  if (!roles.includes(ctx.role)) {
    throw new AppError("FORBIDDEN", "Anda tidak punya akses ke fitur ini");
  }
}
