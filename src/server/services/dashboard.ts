import { eq } from "drizzle-orm";
import type { TenantContext } from "@/server/auth/context";
import { getDb } from "@/server/db/client";
import { tickets } from "@/server/db/schema";

/** False for a new shop, which S-04 greets with its first-time state. */
export async function shopHasTickets(ctx: TenantContext) {
  const rows = await getDb()
    .select({ id: tickets.id })
    .from(tickets)
    .where(eq(tickets.tenantId, ctx.tenantId))
    .limit(1);
  return rows.length > 0;
}
