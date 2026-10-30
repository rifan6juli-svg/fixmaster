import { expect, test } from "@playwright/test";

test("home page renders in Indonesian with the product name", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Fixmaster");
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
  await expect(
    page.getByRole("heading", { level: 1, name: "Fixmaster" }),
  ).toBeVisible();
});
