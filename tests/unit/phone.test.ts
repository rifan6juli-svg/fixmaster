import { describe, expect, it } from "vitest";
import { formatPhoneWa, normalizePhoneWa } from "@/lib/phone";

describe("normalizePhoneWa", () => {
  it.each([
    ["0812-3456-7890", "6281234567890"],
    ["+62 812 3456 7890", "6281234567890"],
    ["6281234567890", "6281234567890"],
    ["812345678", "62812345678"],
    ["0812.3456.7890", "6281234567890"],
    ["(0812) 3456 7890", "6281234567890"],
    ["021-555-1234", "62215551234"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizePhoneWa(input)).toBe(expected);
  });

  it.each(["", "abc", "12345", "0812", "62081234567890", "081234567890123456"])(
    "rejects %j",
    (input) => {
      expect(normalizePhoneWa(input)).toBeNull();
    },
  );
});

describe("formatPhoneWa", () => {
  it.each([
    ["6281234567890", "0812 3456 7890"],
    ["62812345678", "0812 3456 78"],
    ["62215551234", "0215 5512 34"],
  ])("formats %s", (phone, expected) => {
    expect(formatPhoneWa(phone)).toBe(expected);
  });

  it("gives back a number normalizePhoneWa accepts", () => {
    expect(normalizePhoneWa(formatPhoneWa("6281234567890"))).toBe(
      "6281234567890",
    );
  });
});
