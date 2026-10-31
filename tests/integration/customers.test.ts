import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as actions from "@/server/actions/customers";
import type { TenantContext } from "@/server/auth/context";
import type { Database } from "@/server/db/client";
import { customers, users } from "@/server/db/schema";
import {
  getCustomer,
  listCustomers,
  listCustomerTickets,
  saveCustomer,
  searchCustomers,
} from "@/server/services/customers";
import { getShop, registerShop } from "@/server/services/shops";
import { seedDatabase } from "../../scripts/seed-data";
import { signIn } from "../helpers/auth";
import { createTestDb } from "../helpers/test-db";

const request = vi.hoisted(() => ({ cookie: "" }));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ cookie: request.cookie }),
}));
vi.mock("next/cache", () => ({ refresh: vi.fn() }));

let db: Database;
let cleanup: () => Promise<void>;
let demo: TenantContext;
let other: TenantContext;
let bigShop: TenantContext;

async function ownerContext(email: string): Promise<TenantContext> {
  const [owner] = await db.select().from(users).where(eq(users.email, email));
  return { tenantId: owner!.tenantId!, userId: owner!.id, role: "owner" };
}

async function customerByName(name: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.name, name));
  return customer!;
}

beforeAll(async () => {
  ({ db, cleanup } = await createTestDb());
  await seedDatabase(db);
  demo = await ownerContext("owner@demo.test");
  other = await ownerContext("owner@lain.test");

  // 30 customers, past one page of the list and past the picker's limit.
  const shop = await registerShop({
    shopName: "Toko Besar",
    ownerName: "Pemilik",
    phoneWa: "6281234567890",
    email: "besar@toko.test",
    password: "rahasia-123",
  });
  bigShop = { ...shop, role: "owner" };
  await db.insert(customers).values(
    Array.from({ length: 30 }, (_, index) => ({
      tenantId: shop.tenantId,
      name: `Pelanggan ${String(index + 1).padStart(2, "0")}`,
      phoneWa: `62811000${String(index + 1).padStart(4, "0")}`,
    })),
  );
});

afterAll(async () => {
  await cleanup();
});

describe("listCustomers", () => {
  it("lists only the shop's customers, by name", async () => {
    const { items, total } = await listCustomers(other, { q: "", page: 1 });

    expect(total).toBe(2);
    expect(items.map(({ name }) => name)).toEqual([
      "Fajar Ramadhan",
      "Lina Kusuma",
    ]);
  });

  it("finds a name whatever its case", async () => {
    const { items } = await listCustomers(demo, { q: "dewi", page: 1 });

    expect(items.map(({ name }) => name)).toEqual(["Dewi Lestari"]);
  });

  it.each(["0813 0000 0003", "0813-0000-0003", "+62 813 0000 0003", "0000003"])(
    "finds a number typed as %s",
    async (q) => {
      const { items } = await listCustomers(demo, { q, page: 1 });

      expect(items.map(({ name }) => name)).toEqual(["Rina Marlina"]);
    },
  );

  it("does not find another shop's customer", async () => {
    const { total } = await listCustomers(demo, { q: "Fajar", page: 1 });

    expect(total).toBe(0);
  });

  it.each(["%", "_", "\\"])("treats %s as plain text", async (q) => {
    const { total } = await listCustomers(demo, { q, page: 1 });

    expect(total).toBe(0);
  });

  it("splits a long list into pages of 25", async () => {
    const first = await listCustomers(bigShop, { q: "", page: 1 });
    const second = await listCustomers(bigShop, { q: "", page: 2 });

    expect(first).toMatchObject({ total: 30, page: 1 });
    expect(first.items).toHaveLength(25);
    expect(second.items.map(({ name }) => name)).toEqual([
      "Pelanggan 26",
      "Pelanggan 27",
      "Pelanggan 28",
      "Pelanggan 29",
      "Pelanggan 30",
    ]);
  });

  it("shows the last page for a page past the end", async () => {
    const { items, page } = await listCustomers(bigShop, { q: "", page: 9 });

    expect(page).toBe(2);
    expect(items).toHaveLength(5);
  });

  it("is an empty first page with no customers", async () => {
    const shop = await registerShop({
      shopName: "Toko Kosong",
      ownerName: "Pemilik",
      phoneWa: "6281234567890",
      email: "kosong@toko.test",
      password: "rahasia-123",
    });

    expect(
      await listCustomers({ ...shop, role: "owner" }, { q: "", page: 3 }),
    ).toEqual({ items: [], total: 0, page: 1 });
  });
});

describe("searchCustomers", () => {
  it("returns at most 10 results", async () => {
    const items = await searchCustomers(bigShop, { q: "Pelanggan" });

    expect(items).toHaveLength(10);
  });

  it("stays inside the shop", async () => {
    expect(await searchCustomers(other, { q: "Dewi" })).toEqual([]);
  });
});

describe("getCustomer", () => {
  it("reads the shop's own customer", async () => {
    const { id } = await customerByName("Dewi Lestari");

    expect(await getCustomer(demo, id)).toMatchObject({
      name: "Dewi Lestari",
      phoneWa: "6281300000001",
    });
  });

  it("is null for another shop's customer", async () => {
    const { id } = await customerByName("Dewi Lestari");

    expect(await getCustomer(other, id)).toBeNull();
  });

  it("is null for a malformed id", async () => {
    expect(await getCustomer(demo, "bukan-uuid")).toBeNull();
  });
});

describe("listCustomerTickets", () => {
  it("lists the customer's tickets, newest first", async () => {
    const { id } = await customerByName("Agus Setiawan");

    const tickets = await listCustomerTickets(demo, id);

    expect(tickets.map(({ number }) => number)).toEqual([
      "SRV-00002",
      "SRV-00010",
    ]);
  });

  it("is empty through another shop's context", async () => {
    const { id } = await customerByName("Agus Setiawan");

    expect(await listCustomerTickets(other, id)).toEqual([]);
  });
});

describe("getShop", () => {
  it("reads the session's shop", async () => {
    expect(await getShop(demo)).toMatchObject({
      name: "Toko Demo Servis",
      timezone: "Asia/Jakarta",
    });
    expect((await getShop(other)).name).toBe("Toko Lain");
  });
});

describe("saveCustomer", () => {
  it("creates a customer on the shop", async () => {
    const { customerId } = await saveCustomer(other, {
      name: "Pelanggan Baru",
      phoneWa: "6281300000099",
      notes: null,
    });

    expect(await getCustomer(other, customerId)).toMatchObject({
      name: "Pelanggan Baru",
      notes: null,
    });
  });

  it("updates a customer", async () => {
    const { id } = await customerByName("Hendra Gunawan");

    await saveCustomer(demo, {
      id,
      name: "Hendra G.",
      phoneWa: "6281300000066",
      notes: "Pelanggan lama",
    });

    expect(await getCustomer(demo, id)).toEqual({
      id,
      name: "Hendra G.",
      phoneWa: "6281300000066",
      notes: "Pelanggan lama",
    });
  });

  it("rejects a number already used in the shop, naming its holder", async () => {
    const { id } = await customerByName("Joko Susilo");

    await expect(
      saveCustomer(demo, { id, name: "Joko Susilo", phoneWa: "6281300000001" }),
    ).rejects.toMatchObject({
      code: "PHONE_TAKEN",
      fields: { phoneWa: "Nomor ini milik Dewi Lestari" },
    });
  });

  it("rejects the same number on a new customer", async () => {
    await expect(
      saveCustomer(demo, { name: "Baru", phoneWa: "6281300000001" }),
    ).rejects.toMatchObject({ code: "PHONE_TAKEN" });
  });

  it("allows a number used by another shop", async () => {
    await expect(
      saveCustomer(bigShop, { name: "Dewi", phoneWa: "6281300000001" }),
    ).resolves.toMatchObject({ customerId: expect.any(String) });
  });

  it("answers NOT_FOUND for another shop's customer and changes nothing", async () => {
    const { id } = await customerByName("Maya Anggraini");

    await expect(
      saveCustomer(other, { id, name: "Dibajak", phoneWa: "6281300000077" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect((await customerByName("Maya Anggraini")).phoneWa).toBe(
      "6281300000005",
    );
  });
});

describe("customer actions", () => {
  async function actAs(email: string) {
    ({ cookie: request.cookie } = await signIn(email, "password123"));
  }

  it("refuses a technician", async () => {
    await actAs("teknisi@demo.test");
    const denied = { ok: false, error: { code: "FORBIDDEN" } };

    expect(await actions.searchCustomers({ q: "Dewi" })).toMatchObject(denied);
    expect(
      await actions.saveCustomer({ name: "Baru", phoneWa: "081300000098" }),
    ).toMatchObject(denied);
  });

  it("lets an admin search", async () => {
    await actAs("admin@demo.test");

    const result = await actions.searchCustomers({ q: "Dewi" });

    expect(result).toMatchObject({
      ok: true,
      data: { items: [{ name: "Dewi Lestari" }] },
    });
  });

  it("needs 3 characters to search", async () => {
    await actAs("admin@demo.test");

    expect(await actions.searchCustomers({ q: "de" })).toMatchObject({
      ok: false,
      error: {
        code: "VALIDATION",
        fields: { q: "Ketik minimal 3 karakter" },
      },
    });
  });

  it("saves on the session's shop, whatever the input says", async () => {
    await actAs("admin@demo.test");

    const result = await actions.saveCustomer({
      name: "Lewat Aksi",
      phoneWa: "0813-0000-0097",
      tenantId: other.tenantId,
    });

    expect(result.ok).toBe(true);
    const saved = await customerByName("Lewat Aksi");
    expect(saved).toMatchObject({
      tenantId: demo.tenantId,
      phoneWa: "6281300000097",
    });
  });
});
