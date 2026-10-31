import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { PAGE_SIZE } from "@/lib/pagination";
import type {
  SaveCustomerInput,
  SearchCustomersInput,
} from "@/lib/validation/customers";
import type { TenantContext } from "@/server/auth/context";
import { getDb } from "@/server/db/client";
import { violatesConstraint } from "@/server/db/errors";
import { customers, tickets } from "@/server/db/schema";
import { AppError } from "@/server/errors";

const SEARCH_LIMIT = 10;

const LOOKS_LIKE_PHONE = /^[\d\s+().-]+$/;

function contains(text: string) {
  return `%${text.replace(/[\\%_]/g, "\\$&")}%`;
}

function matchesSearch(q: string) {
  const byName = ilike(customers.name, contains(q));
  // Stored as 62812..., so 0812-... matches from the digit after the 0.
  const digits = LOOKS_LIKE_PHONE.test(q)
    ? q.replace(/\D/g, "").replace(/^0/, "")
    : "";
  return digits
    ? or(byName, ilike(customers.phoneWa, contains(digits)))
    : byName;
}

export async function listCustomers(
  ctx: TenantContext,
  { q, page }: { q: string; page: number },
) {
  const db = getDb();
  const where = and(
    eq(customers.tenantId, ctx.tenantId),
    q ? matchesSearch(q) : undefined,
  );

  const [{ total }] = (await db
    .select({ total: count() })
    .from(customers)
    .where(where)) as [{ total: number }];

  // A page past the end, from an old link or a shorter search, shows the last one.
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);

  const items = await db
    .select({
      id: customers.id,
      name: customers.name,
      phoneWa: customers.phoneWa,
    })
    .from(customers)
    .where(where)
    .orderBy(asc(customers.name), asc(customers.id))
    .limit(PAGE_SIZE)
    .offset((currentPage - 1) * PAGE_SIZE);

  return { items, total, page: currentPage };
}

export type CustomerListItem = Awaited<
  ReturnType<typeof listCustomers>
>["items"][number];

/** The S-06 picker: PRD F-03, by name or number, at most 10 results. */
export async function searchCustomers(
  ctx: TenantContext,
  { q }: SearchCustomersInput,
) {
  return getDb()
    .select({
      id: customers.id,
      name: customers.name,
      phoneWa: customers.phoneWa,
    })
    .from(customers)
    .where(and(eq(customers.tenantId, ctx.tenantId), matchesSearch(q)))
    .orderBy(asc(customers.name), asc(customers.id))
    .limit(SEARCH_LIMIT);
}

/** Null for an id that is malformed or belongs to another shop. */
export async function getCustomer(ctx: TenantContext, id: string) {
  if (!z.uuid().safeParse(id).success) {
    return null;
  }

  const [customer] = await getDb()
    .select({
      id: customers.id,
      name: customers.name,
      phoneWa: customers.phoneWa,
      notes: customers.notes,
    })
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.tenantId, ctx.tenantId)));
  return customer ?? null;
}

export async function listCustomerTickets(
  ctx: TenantContext,
  customerId: string,
) {
  return getDb()
    .select({
      id: tickets.id,
      number: tickets.number,
      status: tickets.status,
      brand: tickets.brand,
      model: tickets.model,
      createdAt: tickets.createdAt,
    })
    .from(tickets)
    .where(
      and(
        eq(tickets.tenantId, ctx.tenantId),
        eq(tickets.customerId, customerId),
      ),
    )
    .orderBy(desc(tickets.createdAt));
}

export type CustomerTicket = Awaited<
  ReturnType<typeof listCustomerTickets>
>[number];

async function phoneTaken(ctx: TenantContext, phoneWa: string) {
  const [holder] = await getDb()
    .select({ name: customers.name })
    .from(customers)
    .where(
      and(eq(customers.tenantId, ctx.tenantId), eq(customers.phoneWa, phoneWa)),
    );
  const message = `Nomor ini milik ${holder?.name ?? "pelanggan lain"}`;
  return new AppError("PHONE_TAKEN", message, { phoneWa: message });
}

export async function saveCustomer(
  ctx: TenantContext,
  { id, name, phoneWa, notes }: SaveCustomerInput,
) {
  const db = getDb();
  const values = { name, phoneWa, notes: notes ?? null };

  try {
    if (!id) {
      const [{ customerId }] = (await db
        .insert(customers)
        .values({ ...values, tenantId: ctx.tenantId })
        .returning({ customerId: customers.id })) as [{ customerId: string }];
      return { customerId };
    }

    const updated = await db
      .update(customers)
      .set({ ...values, updatedAt: new Date() })
      .where(and(eq(customers.id, id), eq(customers.tenantId, ctx.tenantId)))
      .returning({ id: customers.id });
    if (updated.length === 0) {
      throw new AppError("NOT_FOUND", "Pelanggan tidak ditemukan");
    }
    return { customerId: id };
  } catch (error) {
    if (violatesConstraint(error, "customers_tenant_phone_unique")) {
      throw await phoneTaken(ctx, phoneWa);
    }
    throw error;
  }
}
