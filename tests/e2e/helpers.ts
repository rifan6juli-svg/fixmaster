import { expect, type Page } from "@playwright/test";

export const PASSWORD = "password123";

function randomOctet() {
  return Math.floor(Math.random() * 254) + 1;
}

/** Sign-in is limited per IP, so tests must not share one. */
export async function useOwnIp(page: Page) {
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
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
}

export async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await fillLoginForm(page, email, PASSWORD);
  await expect(page).not.toHaveURL(/\/login/);
}
