import { defineConfig, devices } from "@playwright/test";
import { e2eDatabaseUrl } from "./tests/helpers/test-db";

// Separate port so E2E runs do not collide with `pnpm dev` on 3000.
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/helpers/e2e-setup.ts",
  // Parallel Chromium saturates a 4-thread laptop until the server stalls for
  // 20s or more, which fails login tests at random (docs/IPD.md, step 4).
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  // Viewports from docs/TRD.md section 7.
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      DATABASE_URL: e2eDatabaseUrl(),
      BETTER_AUTH_URL: BASE_URL,
      APP_URL: BASE_URL,
    },
  },
});
