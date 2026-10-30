import { describe, expect, it } from "vitest";

import { formatAmount, formatRupiah, parseRupiahInput } from "@/lib/money";

describe("formatRupiah", () => {
  it.each([
    [0, "Rp 0"],
    [500, "Rp 500"],
    [150000, "Rp 150.000"],
    [1250000, "Rp 1.250.000"],
  ])("%i -> %s", (amount, expected) => {
    expect(formatRupiah(amount)).toBe(expected);
  });

  it("formatAmount groups without the prefix", () => {
    expect(formatAmount(99123)).toBe("99.123");
  });
});

describe("parseRupiahInput", () => {
  it.each([
    ["150.000", 150000],
    ["Rp 1.250.000", 1250000],
    ["0012", 12],
    ["1,5", 15],
  ])("%s -> %i", (text, expected) => {
    expect(parseRupiahInput(text)).toBe(expected);
  });

  it.each(["", "Rp", "abc"])("%j -> null", (text) => {
    expect(parseRupiahInput(text)).toBeNull();
  });

  it("caps input at 15 digits so the value stays a safe integer", () => {
    const value = parseRupiahInput("9".repeat(20));
    expect(value).toBe(999_999_999_999_999);
    expect(Number.isSafeInteger(value)).toBe(true);
  });
});
