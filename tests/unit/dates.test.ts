import { describe, expect, it } from "vitest";
import { daysUntil, formatDateTime } from "@/lib/dates";

describe("formatDateTime", () => {
  const moment = new Date("2026-10-30T07:05:00Z");

  it.each([
    ["Asia/Jakarta", "30 Okt 2026, 14.05"],
    ["Asia/Makassar", "30 Okt 2026, 15.05"],
    ["Asia/Jayapura", "30 Okt 2026, 16.05"],
  ])("shows the time in %s", (timezone, expected) => {
    expect(formatDateTime(moment, timezone)).toBe(expected);
  });

  it("uses the date in the shop's zone, past midnight", () => {
    expect(
      formatDateTime(new Date("2026-10-30T17:30:00Z"), "Asia/Jakarta"),
    ).toBe("31 Okt 2026, 00.30");
  });
});

describe("daysUntil", () => {
  const now = new Date("2026-10-30T12:00:00Z");

  it.each([
    ["2026-11-13T12:00:00Z", 14],
    ["2026-10-30T12:00:01Z", 1],
    ["2026-10-30T12:00:00Z", 0],
    ["2026-10-29T12:00:00Z", -1],
  ])("counts the days to %s", (date, expected) => {
    expect(daysUntil(new Date(date), now)).toBe(expected);
  });
});
