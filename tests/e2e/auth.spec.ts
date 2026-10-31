import { expect, test, type Page } from "@playwright/test";
import { fillLoginForm, PASSWORD, assignOwnIp } from "./helpers";

test.beforeEach(async ({ page }) => {
  await assignOwnIp(page);
});

async function fillRegisterForm(page: Page, email: string) {
  await page.getByLabel("Nama toko").fill("Toko Uji Coba");
  await page.getByLabel("Nama pemilik toko").fill("Pemilik Uji");
  await page.getByLabel("Nomor WA toko").fill("0812-3456-7890");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("rahasia-123");
}

test.describe("registration", () => {
  test("creates a shop and lands on the dashboard", async ({
    page,
  }, testInfo) => {
    const email = `baru-${testInfo.project.name}-${Date.now()}@toko.test`;

    await page.goto("/register");
    await fillRegisterForm(page, email);
    await page.getByRole("button", { name: "Daftar & mulai trial" }).click();

    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeVisible();

    // AFD F-01: a new shop lands on the first-time state.
    await expect(page.locator('[data-slot="empty-state"] svg')).toBeVisible();
    await page.getByRole("link", { name: "Terima unit pertama" }).click();
    await expect(page).toHaveURL("/tickets/new");
  });

  test("shows a taken email on its field and keeps the form", async ({
    page,
  }) => {
    await page.goto("/register");
    await fillRegisterForm(page, "owner@demo.test");
    await page.getByRole("button", { name: "Daftar & mulai trial" }).click();

    await expect(page.getByText("Email sudah terdaftar")).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.getByLabel("Nama toko")).toHaveValue("Toko Uji Coba");
  });

  test("shows errors per field and focuses the first", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "Daftar & mulai trial" }).click();

    await expect(page.getByText("Nama toko minimal 3 karakter")).toBeVisible();
    await expect(page.getByText("Nama pemilik toko wajib diisi")).toBeVisible();
    await expect(page.getByText("Nomor WA wajib diisi")).toBeVisible();
    await expect(page.getByText("Email wajib diisi")).toBeVisible();
    await expect(page.getByText("Password minimal 8 karakter")).toBeVisible();
    await expect(page.getByLabel("Nama toko")).toBeFocused();
  });
});

test.describe("route guard", () => {
  test("sends a guest from /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL("/login?next=%2Fdashboard");
    await expect(
      page.getByRole("heading", { level: 1, name: "Masuk" }),
    ).toBeVisible();
  });

  test("does not trust a session cookie it cannot find", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([
      {
        name: "better-auth.session_token",
        value: "forged.token",
        url: baseURL,
      },
    ]);

    await page.goto("/dashboard");

    await expect(page).toHaveURL("/login");
    await expect(
      page.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toHaveCount(0);
  });
});

test.describe("login", () => {
  test("shows the F-01 message for a wrong password", async ({ page }) => {
    await page.goto("/login");
    await fillLoginForm(page, "owner@demo.test", "password-salah");

    await expect(page.getByRole("alert").first()).toHaveText(
      "Email atau password salah",
    );
    await expect(page).toHaveURL("/login");
    await expect(page.getByLabel("Email")).toHaveValue("owner@demo.test");
  });

  test("returns to next after signing in", async ({ page }) => {
    await page.goto("/login?next=/dashboard%3Ffrom%3Dtest");
    await fillLoginForm(page, "owner@demo.test", PASSWORD);

    await expect(page).toHaveURL("/dashboard?from=test");
  });

  test("ignores a next that leaves the site", async ({ page }) => {
    await page.goto("/login?next=//evil.example");
    await fillLoginForm(page, "admin@demo.test", PASSWORD);

    await expect(page).toHaveURL("/dashboard");
  });

  test("blocks the sixth attempt from one IP", async ({ page }) => {
    await page.goto("/login");

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = page.waitForResponse("**/api/auth/sign-in/email");
      await fillLoginForm(page, "owner@demo.test", "password-salah");
      expect((await response).status()).toBe(401);
    }
    await fillLoginForm(page, "owner@demo.test", PASSWORD);

    await expect(page.getByRole("alert").first()).toHaveText(
      "Terlalu banyak percobaan, coba lagi dalam 1 menit",
    );
  });

  test("keeps the form when the connection drops", async ({ page }) => {
    await page.goto("/login");
    await page.route("**/api/auth/sign-in/email", (route) => route.abort());

    await fillLoginForm(page, "owner@demo.test", PASSWORD);

    await expect(
      page
        .getByRole("region", { name: /Notifikasi/ })
        .getByText("Koneksi terputus, coba lagi"),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue("owner@demo.test");
    await expect(page.getByRole("button", { name: "Masuk" })).toBeEnabled();
  });
});

test.describe("before hydration", () => {
  test("holds a submit, then signs in, with no password in the URL", async ({
    page,
  }) => {
    const urls: string[] = [];
    page.on("framenavigated", (frame) => urls.push(frame.url()));

    let hydrate = () => {};
    const hydrated = new Promise<void>((resolve) => {
      hydrate = resolve;
    });
    await page.route("**/_next/static/**/*.js", async (route) => {
      await hydrated;
      await route.continue();
    });

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await fillLoginForm(page, "owner@demo.test", PASSWORD);
    hydrate();

    await expect(page).toHaveURL("/dashboard");
    expect(urls.join(" ")).not.toContain(PASSWORD);
  });
});

test.describe("signed-in session", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await fillLoginForm(page, "teknisi@demo.test", PASSWORD);
    await expect(page).toHaveURL("/dashboard");
  });

  test("skips the guest pages", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL("/dashboard");

    await page.goto("/register");
    await expect(page).toHaveURL("/dashboard");
  });

  test("asks Better Auth to extend the session on load", async ({ page }) => {
    const refreshed = page.waitForResponse("**/api/auth/get-session");
    await page.reload();

    expect((await refreshed).status()).toBe(200);
  });

  test("logs out, and Back does not reopen the app", async ({ page }) => {
    await page.goto("/dashboard?from=history");

    await page.getByRole("button", { name: "Menu pengguna" }).click();
    await page.getByRole("menuitem", { name: "Keluar" }).click();
    await expect(page).toHaveURL("/login");

    await page.goBack();
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toHaveCount(0);

    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login?next=%2Fdashboard");
  });
});
