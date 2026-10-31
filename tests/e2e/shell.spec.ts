import { expect, test, type Page } from "@playwright/test";
import postgres from "postgres";
import { e2eDatabaseUrl } from "../helpers/test-db";
import { signIn, useOwnIp } from "./helpers";

const OWNER = "owner@demo.test";
const ADMIN = "admin@demo.test";
const TECHNICIAN = "teknisi@demo.test";
const SUPER_ADMIN = "admin@fixmaster.test";

const ACCESS_DENIED = "Anda tidak punya akses ke halaman ini";

// docs/AFD.md section 2. Terima unit is a separate action, outside this list.
const MENUS = [
  {
    email: OWNER,
    menu: [
      "Dashboard",
      "Tiket",
      "Pelanggan",
      "Sparepart",
      "Laporan",
      "Pengaturan",
    ],
    bottomBar: ["Dashboard", "Tiket", "Terima unit"],
    sheet: ["Pelanggan", "Sparepart", "Laporan", "Pengaturan"],
  },
  {
    email: ADMIN,
    menu: ["Dashboard", "Tiket", "Pelanggan", "Sparepart"],
    bottomBar: ["Dashboard", "Tiket", "Terima unit"],
    sheet: ["Pelanggan", "Sparepart"],
  },
  {
    email: TECHNICIAN,
    menu: ["Dashboard", "Tiket", "Sparepart"],
    bottomBar: ["Dashboard", "Tiket"],
    sheet: ["Sparepart"],
  },
];

function mainNav(page: Page) {
  return page.getByRole("navigation", { name: "Navigasi utama" });
}

function toast(page: Page, text: string) {
  return page.getByRole("region", { name: /Notifikasi/ }).getByText(text);
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
}

test.beforeEach(async ({ page }) => {
  await useOwnIp(page);
});

test.describe("menu per role", () => {
  for (const { email, menu, bottomBar, sheet } of MENUS) {
    test(`${email} sees the items for their role`, async ({
      page,
    }, testInfo) => {
      await signIn(page, email);

      if (testInfo.project.name === "desktop") {
        await expect(mainNav(page).getByRole("link")).toHaveText(menu);
        await expect(
          page.getByRole("link", { name: "Terima unit" }),
        ).toHaveCount(email === TECHNICIAN ? 0 : 1);
        return;
      }

      await expect(mainNav(page).getByRole("link")).toHaveText(bottomBar);
      await mainNav(page).getByRole("button", { name: "Lainnya" }).click();
      await expect(
        page.getByRole("dialog", { name: "Lainnya" }).getByRole("link"),
      ).toHaveText(sheet);
    });
  }

  test("collapses to a labelled icon rail on a tablet", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop");
    await page.setViewportSize({ width: 768, height: 1024 });
    await signIn(page, OWNER);

    await expect(page.getByRole("complementary")).toHaveCSS("width", "64px");
    await expect(
      mainNav(page).getByRole("link", { name: "Tiket" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Terima unit" })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("marks the current page", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop");
    await signIn(page, OWNER);

    await mainNav(page).getByRole("link", { name: "Tiket" }).click();

    await expect(page).toHaveURL("/tickets");
    await expect(
      mainNav(page).getByRole("link", { name: "Tiket" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      mainNav(page).getByRole("link", { name: "Dashboard" }),
    ).not.toHaveAttribute("aria-current");
  });

  test("closes the Lainnya sheet after choosing an item", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile");
    await signIn(page, OWNER);

    await mainNav(page).getByRole("button", { name: "Lainnya" }).click();
    await page
      .getByRole("dialog", { name: "Lainnya" })
      .getByRole("link", { name: "Sparepart" })
      .click();

    await expect(page).toHaveURL("/parts");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("shows who is signed in", async ({ page }) => {
    await signIn(page, ADMIN);

    await page.getByRole("button", { name: "Menu pengguna" }).click();

    const menu = page.getByRole("menu");
    await expect(menu.getByText("Sari Wulandari")).toBeVisible();
    await expect(menu.getByText("admin@demo.test")).toBeVisible();
    await expect(menu.getByText("Admin/Kasir")).toBeVisible();
  });
});

test.describe("page access", () => {
  test("sends a technician from /reports to the dashboard with a message", async ({
    page,
  }) => {
    await signIn(page, TECHNICIAN);

    await page.goto("/reports");

    await expect(page).toHaveURL("/dashboard");
    await expect(toast(page, ACCESS_DENIED)).toBeVisible();
    await expect(page.getByRole("alert").first()).toHaveText(ACCESS_DENIED);
  });

  test("keeps a technician out of every owner and front-desk page", async ({
    page,
  }) => {
    await signIn(page, TECHNICIAN);

    for (const path of [
      "/settings",
      "/settings/staff",
      "/settings/subscription",
      "/customers",
      "/tickets/new",
      "/admin",
    ]) {
      await page.goto(path);
      await expect(page).toHaveURL("/dashboard");
    }
  });

  test("keeps an admin out of the owner pages only", async ({ page }) => {
    await signIn(page, ADMIN);

    await page.goto("/customers");
    await expect(
      page.getByRole("heading", { level: 1, name: "Pelanggan" }),
    ).toBeVisible();

    await page.goto("/settings/staff");
    await expect(page).toHaveURL("/dashboard");
    await expect(toast(page, ACCESS_DENIED)).toBeVisible();
  });

  test("lets the owner open the owner pages", async ({ page }) => {
    await signIn(page, OWNER);

    await page.goto("/reports");

    await expect(page).toHaveURL("/reports");
    await expect(
      page.getByRole("heading", { level: 1, name: "Laporan" }),
    ).toBeVisible();
  });

  test("keeps the toast above the bottom bar", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile");
    await signIn(page, TECHNICIAN);

    await page.goto("/reports");
    const message = toast(page, ACCESS_DENIED);
    await expect(message).toBeVisible();

    const toastBox = await message.boundingBox();
    const barBox = await mainNav(page).boundingBox();
    expect(toastBox!.y + toastBox!.height).toBeLessThanOrEqual(barBox!.y);
  });
});

test.describe("super-admin", () => {
  test("goes to /admin and stays out of the shop pages", async ({ page }) => {
    await signIn(page, SUPER_ADMIN);

    await expect(page).toHaveURL("/admin");
    await expect(
      page.getByRole("heading", { level: 1, name: "Daftar toko" }),
    ).toBeVisible();

    await page.goto("/dashboard");
    await expect(page).toHaveURL("/admin");

    await page.goto("/login");
    await expect(page).toHaveURL("/admin");
  });
});

test.describe("dashboard", () => {
  test("skips the first-time state once the shop has tickets", async ({
    page,
  }) => {
    await signIn(page, OWNER);

    await expect(
      page.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("Ringkasan tiket dan stok")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Terima unit pertama" }),
    ).toHaveCount(0);
  });
});

test.describe("error pages", () => {
  test("shows the mascot on a 404", async ({ page }) => {
    const response = await page.goto("/halaman-yang-tidak-ada");

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Halaman tidak ditemukan" }),
    ).toBeVisible();
    await expect(page.locator('[data-slot="empty-state"] svg')).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("keeps the menu when a page fails, and retries", async ({ page }) => {
    await signIn(page, OWNER);
    const sql = postgres(e2eDatabaseUrl(), { max: 1, onnotice: () => {} });

    await sql`ALTER TABLE tickets RENAME TO tickets_hidden`;
    try {
      await page.reload();

      await expect(
        page.getByRole("heading", { name: "Gagal memuat data" }),
      ).toBeVisible();
      await expect(page.locator('[data-slot="empty-state"] svg')).toBeVisible();
      await expect(mainNav(page)).toBeVisible();
    } finally {
      await sql`ALTER TABLE tickets_hidden RENAME TO tickets`;
      await sql.end();
    }

    await page.getByRole("button", { name: "Coba lagi" }).click();
    await expect(page.getByText("Ringkasan tiket dan stok")).toBeVisible();
  });
});

test.describe("layout", () => {
  test("has no horizontal scroll", async ({ page }) => {
    await signIn(page, OWNER);
    await expectNoHorizontalScroll(page);

    for (const path of ["/tickets", "/reports"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoHorizontalScroll(page);
    }
  });
});
