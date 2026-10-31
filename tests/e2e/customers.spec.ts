import { expect, test, type Page } from "@playwright/test";
import postgres from "postgres";
import { e2eDatabaseUrl } from "../helpers/test-db";
import { assignOwnIp, expectToast, signIn } from "./helpers";

const OWNER = "owner@demo.test";

test.beforeEach(async ({ page }) => {
  await assignOwnIp(page);
});

async function search(page: Page, q: string) {
  await page.getByRole("searchbox", { name: /Cari/ }).fill(q);
  await page.getByRole("button", { name: "Cari" }).click();
  await expect(page).toHaveURL(/q=/);
}

/** Opens S-11 by number, which stays the same when a test renames the customer. */
async function openCustomer(page: Page, phone: string) {
  await page.goto("/customers");
  await search(page, phone);
  await page
    .locator("tr:visible, li:visible")
    .filter({ hasText: phone })
    .getByRole("link")
    .click();
  await expect(page).toHaveURL(/\/customers\/[0-9a-f-]{36}/);
}

function count(page: Page) {
  return page.locator('[data-slot="readout"]');
}

async function seededCustomerId(name: string) {
  const sql = postgres(e2eDatabaseUrl(), { max: 1, onnotice: () => {} });
  try {
    const [customer] = await sql`select id from customers where name = ${name}`;
    return customer!.id as string;
  } finally {
    await sql.end();
  }
}

test.describe("S-10", () => {
  test("finds a customer by number, then resets the search", async ({
    page,
  }) => {
    await signIn(page, OWNER);
    await page.goto("/customers");
    await expect(count(page)).toHaveText("8 pelanggan");

    await search(page, "0813 0000 0003");
    await expect(count(page)).toHaveText("1 cocok");

    await search(page, "tidak ada yang bernama ini");
    await expect(
      page.getByText("Tidak ada pelanggan yang cocok"),
    ).toBeVisible();

    await page.getByRole("link", { name: "Reset pencarian" }).click();
    await expect(page).toHaveURL("/customers");
    await expect(count(page)).toHaveText("8 pelanggan");
  });

  test("returns from S-11 to the same search", async ({ page }) => {
    await signIn(page, OWNER);
    await openCustomer(page, "0813 0000 0003");

    await page
      .getByRole("main")
      .getByRole("link", { name: "Pelanggan", exact: true })
      .click();

    await expect(page).toHaveURL(/\/customers\?q=/);
    await expect(page.getByRole("searchbox", { name: /Cari/ })).toHaveValue(
      "0813 0000 0003",
    );
  });

  test("pages through more than 25 customers", async ({ page }) => {
    const sql = postgres(e2eDatabaseUrl(), { max: 1, onnotice: () => {} });
    const [shop] = await sql`select id from tenants where name = 'Toko Lain'`;
    for (let index = 1; index <= 30; index += 1) {
      await sql`
        insert into customers (tenant_id, name, phone_wa)
        values (
          ${shop!.id},
          ${`Pelanggan ${index}`},
          ${`62811000${String(index).padStart(4, "0")}`}
        )
        on conflict do nothing
      `;
    }
    await sql.end();

    await signIn(page, "owner@lain.test");
    await page.goto("/customers");

    await expect(page.getByText("1-25 dari 32")).toBeVisible();
    await page.getByRole("link", { name: "Berikutnya" }).click();

    await expect(page).toHaveURL("/customers?page=2");
    await expect(page.getByText("26-32 dari 32")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Berikutnya" }),
    ).toBeDisabled();

    await page.getByRole("link", { name: "Sebelumnya" }).click();
    await expect(page.getByText("1-25 dari 32")).toBeVisible();
  });

  test("shows the empty state to a new shop", async ({ page }, testInfo) => {
    await page.goto("/register");
    await page.getByLabel("Nama toko").fill("Toko Tanpa Pelanggan");
    await page.getByLabel("Nama pemilik toko").fill("Pemilik Baru");
    await page.getByLabel("Nomor WA toko").fill("0812-3456-7890");
    await page
      .getByLabel("Email")
      .fill(`kosong-${testInfo.project.name}-${Date.now()}@toko.test`);
    await page.getByLabel("Password", { exact: true }).fill("rahasia-123");
    await page.getByRole("button", { name: "Daftar & mulai trial" }).click();
    await expect(page).toHaveURL("/dashboard");

    await page.goto("/customers");

    await expect(page.getByText("Belum ada pelanggan")).toBeVisible();
  });
});

test.describe("long text", () => {
  test("stays inside a phone screen", async ({ page }, testInfo) => {
    const email = `panjang-${testInfo.project.name}-${Date.now()}@toko.test`;
    await page.goto("/register");
    await page.getByLabel("Nama toko").fill("Toko Nama Panjang");
    await page.getByLabel("Nama pemilik toko").fill("Pemilik Baru");
    await page.getByLabel("Nomor WA toko").fill("0812-3456-7890");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("rahasia-123");
    await page.getByRole("button", { name: "Daftar & mulai trial" }).click();
    await expect(page).toHaveURL("/dashboard");

    // The validation limits: 100 characters for a name, unbroken here.
    const longName = "Hadiningrat".repeat(10).slice(0, 100);
    const sql = postgres(e2eDatabaseUrl(), { max: 1, onnotice: () => {} });
    const [owner] =
      await sql`select tenant_id from users where email = ${email}`;
    await sql`
      insert into customers (tenant_id, name, phone_wa)
      values (${owner!.tenant_id}, ${longName}, '6281300000050')
    `;
    await sql`
      insert into users (name, email, tenant_id, role)
      values (
        ${longName},
        ${`staf-${"panjang".repeat(4)}-${email}`},
        ${owner!.tenant_id},
        'technician'
      )
    `;
    await sql.end();

    for (const path of ["/customers", "/settings/staff"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    }
    await expect(
      page.getByRole("button", { name: "Tambah staf" }),
    ).toBeInViewport();
  });
});

test.describe("S-11", () => {
  test("edits a seeded customer", async ({ page }, testInfo) => {
    const name = `Putri Ayu ${testInfo.project.name}`;
    await signIn(page, OWNER);
    await openCustomer(page, "0813 0000 0007");

    await page.getByRole("button", { name: "Ubah" }).click();
    await page.getByLabel("Nama", { exact: true }).fill(name);
    await page.getByLabel("Catatan").fill("Pelanggan tetap");
    await page.getByRole("button", { name: "Simpan" }).click();

    await expectToast(page, "Data pelanggan tersimpan");
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.getByText("Pelanggan tetap")).toBeVisible();
  });

  test("shows the ticket history", async ({ page }) => {
    await signIn(page, OWNER);
    await openCustomer(page, "0813 0000 0002");

    const history = page.locator("section");
    await expect(
      history.getByText("SRV-00002").locator("visible=true"),
    ).toBeVisible();
    await expect(
      history.getByText("SRV-00010").locator("visible=true"),
    ).toBeVisible();
    await expect(
      history.getByText("Sudah diambil").locator("visible=true"),
    ).toBeVisible();
  });

  test("names the holder of a taken number", async ({ page }) => {
    await signIn(page, OWNER);
    await openCustomer(page, "0813 0000 0008");

    await page.getByRole("button", { name: "Ubah" }).click();
    await page.getByLabel("Nomor WA", { exact: true }).fill("0813 0000 0001");
    await page.getByRole("button", { name: "Simpan" }).click();

    await expect(page.getByText("Nomor ini milik Dewi Lestari")).toBeVisible();
    await expect(page.getByLabel("Nomor WA", { exact: true })).toHaveValue(
      "0813 0000 0001",
    );
  });

  test("rejects an invalid number on its field", async ({ page }) => {
    await signIn(page, OWNER);
    await openCustomer(page, "0813 0000 0008");

    await page.getByRole("button", { name: "Ubah" }).click();
    await page.getByLabel("Nomor WA", { exact: true }).fill("12345");
    await page.getByRole("button", { name: "Simpan" }).click();

    await expect(
      page.getByText("Nomor WA tidak valid (contoh: 0812xxxxxxxx)"),
    ).toBeVisible();
  });

  test("hides another shop's customer behind a 404", async ({ page }) => {
    const id = await seededCustomerId("Rina Marlina");
    await signIn(page, "owner@lain.test");

    await page.goto(`/customers/${id}`);

    await expect(
      page.getByRole("heading", { name: "Pelanggan tidak ditemukan" }),
    ).toBeVisible();
    await expect(page.getByText("Rina Marlina")).toHaveCount(0);

    await page.getByRole("link", { name: "Lihat daftar pelanggan" }).click();
    await expect(page).toHaveURL("/customers");
  });

  test("keeps a technician out", async ({ page }) => {
    const id = await seededCustomerId("Rina Marlina");
    await signIn(page, "teknisi@demo.test");

    await page.goto(`/customers/${id}`);

    await expect(page).toHaveURL("/dashboard");
  });
});
