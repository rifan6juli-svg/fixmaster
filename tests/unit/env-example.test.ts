import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Required variables from docs/TRD.md section 6.
const REQUIRED_ENV = [
  "DATABASE_URL",
  "DIRECT_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "APP_URL",
  "DEVICE_SECRET_KEY",
];

const declaredKeys = readFileSync(
  new URL("../../.env.example", import.meta.url),
  "utf8",
)
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line !== "" && !line.startsWith("#"))
  .map((line) => line.split("=")[0]);

describe(".env.example", () => {
  it.each(REQUIRED_ENV)("declares %s", (name) => {
    expect(declaredKeys).toContain(name);
  });
});
