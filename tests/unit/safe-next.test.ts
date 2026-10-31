import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/safe-next";

describe("safeNextPath", () => {
  it.each([
    ["/tickets", "/tickets"],
    ["/tickets/new?customer=1#form", "/tickets/new?customer=1#form"],
  ])("keeps the internal path %s", (next, expected) => {
    expect(safeNextPath(next)).toBe(expected);
  });

  it.each([
    null,
    "",
    "tickets",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\t/evil.example",
    "javascript:alert(1)",
  ])("falls back to the dashboard for %j", (next) => {
    expect(safeNextPath(next)).toBe("/dashboard");
  });
});
