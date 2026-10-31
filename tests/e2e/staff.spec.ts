import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  assignOwnIp,
  expectToast,
  fillLoginForm,
  signIn,
  toast,
} from "./helpers";

const OWNER = "owner@demo.test";
const TEMP_PASSWORD = "sementara-123";
const NEW_PASSWORD = "password-baru-789";

let emailCounter = 0;

function newStaffEmail(projectName: string) {
  emailCounter += 1;
  return `staf-${projectName}-${Date.now()}-${emailCounter}@demo.test`;
}

/** The staff member's table row on desktop, or card on a phone. */
function staffEntry(page: Page, email: string) {
  return page.locator("tr:visible, li:visible").filter({ hasText: email });
}

async function openOwnerStaffPage(page: Page) {
  await assignOwnIp(page);
  await signIn(page, OWNER);
  await page.goto("/settings/staff");
}

async function addStaff(page: Page, email: string, role = "Teknisi") {
  await page.getByRole("button", { name: "Tambah staf" }).click();
  const dialog = page.getByRole("dialog", { name: "Tambah staf" });
  await dialog.getByLabel("Nama").fill("Staf Uji");
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByLabel("Peran").selectOption({ label: role });
  await dialog.getByLabel("Password sementara").fill(TEMP_PASSWORD);
  await dialog.getByRole("button", { name: "Buat akun" }).click();
}

/** Reads the password off the dialog, as an owner does, then closes it. */
async function finishHandoff(page: Page, title: string) {
  const dialog = page.getByRole("dialog", { name: title });
  await expect(dialog.getByText(TEMP_PASSWORD)).toBeVisible();
  await dialog.getByRole("button", { name: "Selesai" }).click();
  await expect(dialog).toHaveCount(0);
}

/** A second browser for the staff member, beside the owner's. */
async function openStaffPage(browser: Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await assignOwnIp(page);
  return page;
}

async function changeTempPassword(page: Page) {
  await page.getByLabel("Password sementara").fill(TEMP_PASSWORD);
  await page.getByLabel("Password baru").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Simpan password" }).click();
}

test.describe("new staff", () => {
  test("must change the temporary password before using the app", async ({
    page,
    browser,
  }, testInfo) => {
    const email = newStaffEmail(testInfo.project.name);
    await openOwnerStaffPage(page);

    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
    await addStaff(page, email);
    const handoff = page.getByRole("dialog", { name: "Akun Staf Uji dibuat" });
    await handoff.getByRole("button", { name: "Salin" }).click();
    await expect(
      handoff.getByRole("button", { name: "Tersalin" }),
    ).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      TEMP_PASSWORD,
    );
    await finishHandoff(page, "Akun Staf Uji dibuat");
    await expect(staffEntry(page, email)).toContainText("Teknisi");

    const staffPage = await openStaffPage(browser);
    await signIn(staffPage, email, TEMP_PASSWORD);
    await expect(staffPage).toHaveURL("/change-password");

    await staffPage.goto("/dashboard");
    await expect(staffPage).toHaveURL("/change-password");

    await staffPage.getByLabel("Password sementara").fill(TEMP_PASSWORD);
    await staffPage.getByLabel("Password baru").fill(TEMP_PASSWORD);
    await staffPage.getByRole("button", { name: "Simpan password" }).click();
    await expect(
      staffPage.getByText("Password baru harus berbeda"),
    ).toBeVisible();

    await changeTempPassword(staffPage);
    await expect(staffPage).toHaveURL("/dashboard");
    await expect(toast(staffPage, "Password berhasil diganti")).toBeVisible();

    await staffPage.reload();
    await expect(staffPage).toHaveURL("/dashboard");

    await staffPage.context().close();
  });

  test("shows a taken email on its field and keeps the dialog", async ({
    page,
  }) => {
    await openOwnerStaffPage(page);

    await addStaff(page, "admin@demo.test");

    const dialog = page.getByRole("dialog", { name: "Tambah staf" });
    await expect(dialog.getByText("Email sudah terdaftar")).toBeVisible();
    await expect(dialog.getByLabel("Nama")).toHaveValue("Staf Uji");
  });
});

test.describe("the add staff dialog", () => {
  test("stays reachable on a short screen and survives a stray tap", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop");
    await page.setViewportSize({ width: 844, height: 390 });
    await openOwnerStaffPage(page);

    await page.getByRole("button", { name: "Tambah staf" }).click();
    const dialog = page.getByRole("dialog", { name: "Tambah staf" });
    await dialog.getByRole("button", { name: "Buat akun" }).click();

    await expect(dialog.getByText("Nama wajib diisi")).toBeVisible();
    await expect(dialog.getByLabel("Nama")).toBeFocused();
    const box = await dialog.boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(390);

    await dialog.getByLabel("Nama").fill("Masih Terisi");
    await page.mouse.click(4, 4);
    await expect(dialog.getByLabel("Nama")).toHaveValue("Masih Terisi");
  });
});

test.describe("managing staff", () => {
  test("offers no actions on the owner's row", async ({ page }) => {
    await openOwnerStaffPage(page);

    await expect(staffEntry(page, OWNER)).toContainText("Aktif");
    await expect(staffEntry(page, OWNER).getByRole("button")).toHaveCount(0);
  });

  test("deactivating ends the session, and activating restores login", async ({
    page,
    browser,
  }, testInfo) => {
    const email = newStaffEmail(testInfo.project.name);
    await openOwnerStaffPage(page);
    await addStaff(page, email);
    await finishHandoff(page, "Akun Staf Uji dibuat");

    const staffPage = await openStaffPage(browser);
    await signIn(staffPage, email, TEMP_PASSWORD);
    await changeTempPassword(staffPage);
    await expect(staffPage).toHaveURL("/dashboard");

    await staffEntry(page, email)
      .getByRole("button", { name: /^Nonaktifkan/ })
      .click();
    await page
      .getByRole("dialog", { name: /^Nonaktifkan/ })
      .getByRole("button", { name: "Nonaktifkan" })
      .click();
    await expectToast(page, "Staf Uji dinonaktifkan");
    await expect(
      staffEntry(page, email).getByRole("button", { name: /^Aktifkan/ }),
    ).toBeVisible();

    await staffPage.reload();
    await expect(staffPage).toHaveURL("/login");

    await fillLoginForm(staffPage, email, NEW_PASSWORD);
    await expect(staffPage.getByRole("alert").first()).toHaveText(
      "Akun Anda dinonaktifkan. Hubungi pemilik toko.",
    );

    await staffEntry(page, email)
      .getByRole("button", { name: /^Aktifkan/ })
      .click();
    await expect(toast(page, "Staf Uji diaktifkan")).toBeVisible();

    await signIn(staffPage, email, NEW_PASSWORD);
    await expect(staffPage).toHaveURL("/dashboard");

    await staffPage.context().close();
  });

  test("resetting a password signs the staff member out and forces a change", async ({
    page,
    browser,
  }, testInfo) => {
    const email = newStaffEmail(testInfo.project.name);
    await openOwnerStaffPage(page);
    await addStaff(page, email);
    await finishHandoff(page, "Akun Staf Uji dibuat");

    const staffPage = await openStaffPage(browser);
    await signIn(staffPage, email, TEMP_PASSWORD);
    await changeTempPassword(staffPage);
    await expect(staffPage).toHaveURL("/dashboard");

    await staffEntry(page, email)
      .getByRole("button", { name: /^Reset password/ })
      .click();
    const dialog = page.getByRole("dialog", { name: /^Reset password/ });
    await dialog.getByLabel("Password sementara").fill(TEMP_PASSWORD);
    await dialog.getByRole("button", { name: "Reset password" }).click();
    await finishHandoff(page, "Password Staf Uji direset");

    await staffPage.reload();
    await expect(staffPage).toHaveURL("/login");

    await signIn(staffPage, email, TEMP_PASSWORD);
    await expect(staffPage).toHaveURL("/change-password");

    await staffPage.context().close();
  });

  test("reaches the staff page from Pengaturan", async ({ page }) => {
    await assignOwnIp(page);
    await signIn(page, OWNER);
    await page.goto("/settings");

    await page.getByRole("link", { name: /^Staf/ }).click();

    await expect(page).toHaveURL("/settings/staff");
    await expect(
      page.getByRole("heading", { level: 1, name: "Staf" }),
    ).toBeVisible();
  });
});

test.describe("a new shop", () => {
  test("shows the empty state and can add its first staff member", async ({
    page,
  }, testInfo) => {
    await assignOwnIp(page);
    await page.goto("/register");
    await page.getByLabel("Nama toko").fill("Toko Tanpa Staf");
    await page.getByLabel("Nama pemilik toko").fill("Pemilik Baru");
    await page.getByLabel("Nomor WA toko").fill("0812-3456-7890");
    await page.getByLabel("Email").fill(newStaffEmail(testInfo.project.name));
    await page.getByLabel("Password", { exact: true }).fill(TEMP_PASSWORD);
    await page.getByRole("button", { name: "Daftar & mulai trial" }).click();
    await expect(page).toHaveURL("/dashboard");

    await page.goto("/settings/staff");
    await expect(page.getByText("Belum ada staf")).toBeVisible();

    await addStaff(page, newStaffEmail(testInfo.project.name), "Admin/Kasir");
    await finishHandoff(page, "Akun Staf Uji dibuat");

    await expect(page.getByText("Belum ada staf")).toHaveCount(0);
    await expect(
      page.locator("tr:visible, li:visible").filter({ hasText: "Admin/Kasir" }),
    ).toBeVisible();
  });
});

test.describe("change password from the user menu", () => {
  test("is optional and offers a way back", async ({ page }) => {
    await assignOwnIp(page);
    await signIn(page, "teknisi@demo.test");

    await page.getByRole("button", { name: "Menu pengguna" }).click();
    await page.getByRole("menuitem", { name: "Ganti password" }).click();

    await expect(page).toHaveURL("/change-password");
    await expect(page.getByLabel("Password saat ini")).toBeVisible();

    await page.getByRole("link", { name: "Kembali" }).click();
    await expect(page).toHaveURL("/dashboard");
  });
});
