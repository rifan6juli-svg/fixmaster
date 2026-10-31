import { and, eq, sql, sum } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/server/db/client";
import {
  customers,
  parts,
  payments,
  stockMovements,
  tenants,
  ticketEvents,
  ticketItems,
  tickets,
  users,
} from "@/server/db/schema";
import { TICKET_STATUSES } from "@/lib/ticket-status";
import { seedDatabase } from "../../scripts/seed-data";
import { signIn } from "../helpers/auth";
import { createTestDb } from "../helpers/test-db";

let db: Database;
let cleanup: () => Promise<void>;
let demoId: string;
let otherId: string;

beforeAll(async () => {
  ({ db, cleanup } = await createTestDb());
  await seedDatabase(db);

  const shops = await db.select().from(tenants);
  demoId = shops.find(({ name }) => name === "Toko Demo Servis")!.id;
  otherId = shops.find(({ name }) => name === "Toko Lain")!.id;
});

afterAll(async () => {
  await cleanup();
});

describe("seed data", () => {
  it("creates the demo shop on an active trial", async () => {
    const [demo] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, demoId));

    expect(demo).toMatchObject({
      ticketPrefix: "SRV",
      ticketSeq: 12,
      invoiceSeq: 3,
      requireSignature: true,
      techniciansCanClaim: false,
      activeUntil: null,
    });
    expect(demo!.trialEndsAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("creates the staff from BSD section 7", async () => {
    const rows = await db
      .select({
        email: users.email,
        tenantId: users.tenantId,
        role: users.role,
      })
      .from(users);

    expect(rows).toHaveLength(7);
    expect(rows).toEqual(
      expect.arrayContaining([
        { email: "owner@demo.test", tenantId: demoId, role: "owner" },
        { email: "admin@demo.test", tenantId: demoId, role: "admin" },
        { email: "teknisi@demo.test", tenantId: demoId, role: "technician" },
        { email: "teknisi2@demo.test", tenantId: demoId, role: "technician" },
        { email: "owner@lain.test", tenantId: otherId, role: "owner" },
        { email: "teknisi@lain.test", tenantId: otherId, role: "technician" },
        { email: "admin@fixmaster.test", tenantId: null, role: "super_admin" },
      ]),
    );
  });

  it("covers every ticket status in 12 demo tickets", async () => {
    const rows = await db
      .select({ status: tickets.status })
      .from(tickets)
      .where(eq(tickets.tenantId, demoId));

    expect(rows).toHaveLength(12);
    expect(new Set(rows.map(({ status }) => status))).toEqual(
      new Set(TICKET_STATUSES),
    );
  });

  it("creates 8 customers and 10 parts, 2 of them under minimum stock", async () => {
    const demoCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.tenantId, demoId));
    const demoParts = await db
      .select()
      .from(parts)
      .where(eq(parts.tenantId, demoId));

    expect(demoCustomers).toHaveLength(8);
    expect(demoParts).toHaveLength(10);
    expect(
      demoParts.filter(({ stock, minStock }) => stock < minStock),
    ).toHaveLength(2);
  });

  it("keeps each part's stock equal to the sum of its movements", async () => {
    const rows = await db
      .select({
        stock: parts.stock,
        moved: sum(stockMovements.qtyChange).mapWith(Number),
      })
      .from(parts)
      .leftJoin(stockMovements, eq(stockMovements.partId, parts.id))
      .groupBy(parts.id);

    for (const { stock, moved } of rows) {
      expect(stock).toBe(moved);
    }
  });

  it("settles every picked-up ticket", async () => {
    const pickedUp = await db
      .select({ id: tickets.id, discount: tickets.discountAmount })
      .from(tickets)
      .where(
        and(eq(tickets.tenantId, demoId), eq(tickets.status, "picked_up")),
      );

    expect(pickedUp).toHaveLength(2);
    for (const { id, discount } of pickedUp) {
      const [{ subtotal }] = (await db
        .select({
          subtotal: sum(
            sql`${ticketItems.qty} * ${ticketItems.unitPrice}`,
          ).mapWith(Number),
        })
        .from(ticketItems)
        .where(eq(ticketItems.ticketId, id))) as [{ subtotal: number }];
      const [{ paid }] = (await db
        .select({ paid: sum(payments.amount).mapWith(Number) })
        .from(payments)
        .where(eq(payments.ticketId, id))) as [{ paid: number }];

      expect(paid).toBe(subtotal - discount);
    }
  });

  it("records the customer as the actor of an approval via link", async () => {
    const rows = await db
      .select({
        actorId: ticketEvents.actorId,
        via: tickets.estimateApprovalVia,
      })
      .from(ticketEvents)
      .innerJoin(tickets, eq(tickets.id, ticketEvents.ticketId))
      .where(eq(ticketEvents.type, "estimate_approved"));

    expect(rows.length).toBeGreaterThan(0);
    for (const { actorId, via } of rows) {
      expect(actorId === null).toBe(via === "link");
    }
  });

  it("gives the second shop the opposite settings and 2 tickets", async () => {
    const [other] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, otherId));
    const otherTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.tenantId, otherId));

    expect(other).toMatchObject({
      requireSignature: false,
      techniciansCanClaim: true,
    });
    expect(otherTickets).toHaveLength(2);
  });

  it("leaves a database with data untouched", async () => {
    expect(await seedDatabase(db)).toBe(false);
  });

  it("lets the seeded owner sign in", async () => {
    const { response } = await signIn("owner@demo.test", "password123");
    expect(response.status).toBe(200);
  });
});
