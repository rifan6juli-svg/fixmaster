import { expect, test } from "@playwright/test";

type ManifestIcon = { src: string; sizes: string; purpose: string };

test("manifest lists Fixmaster with 2 any + 2 maskable icons that load", async ({
  request,
}) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);

  const manifest = (await response.json()) as {
    name: string;
    short_name: string;
    icons: ManifestIcon[];
  };
  expect(manifest.name).toBe("Fixmaster");
  expect(manifest.short_name).toBe("Fixmaster");
  expect(manifest.icons).toHaveLength(4);
  expect(manifest.icons.filter((icon) => icon.purpose === "any")).toHaveLength(
    2,
  );
  expect(
    manifest.icons.filter((icon) => icon.purpose === "maskable"),
  ).toHaveLength(2);

  for (const icon of manifest.icons) {
    const image = await request.get(icon.src);
    expect(image.ok(), icon.src).toBe(true);
    expect(image.headers()["content-type"]).toBe("image/png");
  }
});

test("head links the manifest, SVG favicon, and apple touch icon", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/manifest.webmanifest",
  );
  await expect(
    page.locator('link[rel="icon"][type="image/svg+xml"]'),
  ).toHaveAttribute("href", "/favicon.svg");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    "href",
    "/apple-touch-icon.png",
  );
});

test("/dev/ui is not available in production", async ({ page }) => {
  const response = await page.goto("/dev/ui");
  expect(response?.status()).toBe(404);
});
