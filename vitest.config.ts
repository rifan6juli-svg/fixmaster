import path from "node:path";
import { defineConfig } from "vitest/config";

const resolve = {
  alias: { "@": path.resolve(import.meta.dirname, "src") },
};

export default defineConfig({
  test: {
    projects: [
      {
        resolve,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        resolve,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
          globalSetup: ["tests/helpers/global-setup.ts"],
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
