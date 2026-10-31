import { expect, type Page } from "@playwright/test";

export const PASSWORD = "password123";

function randomOctet() {
  return Math.floor(Math.random() * 254) + 1;
}

/** Sign-in is limited per IP, so tests must not share one. */
export async function assignOwnIp(page: Page) {
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `10.${randomOctet()}.${randomOctet()}.${randomOctet()}`,
  });
}

export async function fillLoginForm(
  page: Page,
  email: string,
  password: string,
) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
}

export function toast(page: Page, text: string) {
  return page.getByRole("region", { name: /Notifikasi/ }).getByText(text);
}

/**
 * Checks a toast and closes it. On a phone it covers the bottom of the list, and
 * its timer stops while the test's mouse rests on it, so a later click would hang.
 */
export async function expectToast(page: Page, text: string) {
  await expect(toast(page, text)).toBeVisible();
  await page.getByRole("button", { name: "Tutup notifikasi" }).first().click();
  await expect(toast(page, text)).toHaveCount(0);
}

export async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await fillLoginForm(page, email, password);
  await expect(page).not.toHaveURL(/\/login/);
}
