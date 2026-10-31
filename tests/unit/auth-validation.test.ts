import { describe, expect, it } from "vitest";
import {
  fieldErrors,
  loginSchema,
  registerShopSchema,
} from "@/lib/validation/auth";

const valid = {
  shopName: "  Toko Maju  ",
  ownerName: "Budi",
  phoneWa: "0812-3456-7890",
  email: " Budi@Toko.TEST ",
  password: "rahasia-123",
};

function errorsFor(input: Record<string, string>) {
  const result = registerShopSchema.safeParse({ ...valid, ...input });
  return result.success ? {} : fieldErrors(result.error);
}

describe("registerShopSchema", () => {
  it("trims, lowercases the email, and normalizes the phone", () => {
    expect(registerShopSchema.parse(valid)).toEqual({
      ...valid,
      shopName: "Toko Maju",
      phoneWa: "6281234567890",
      email: "budi@toko.test",
    });
  });

  it("accepts a shop name of 3 and of 80 characters", () => {
    expect(errorsFor({ shopName: "abc" })).toEqual({});
    expect(errorsFor({ shopName: "a".repeat(80) })).toEqual({});
  });

  it.each([
    ["shopName", "ab", "Nama toko minimal 3 karakter"],
    ["shopName", "a".repeat(81), "Nama toko maksimal 80 karakter"],
    ["ownerName", "   ", "Nama owner wajib diisi"],
    ["phoneWa", "12345", "Nomor WA tidak valid (contoh: 0812xxxxxxxx)"],
    ["email", "bukan-email", "Email tidak valid"],
    ["password", "1234567", "Password minimal 8 karakter"],
  ])("reports %s = %j", (field, value, message) => {
    expect(errorsFor({ [field]: value })).toEqual({ [field]: message });
  });
});

describe("loginSchema", () => {
  it("reports both empty fields", () => {
    const result = loginSchema.safeParse({ email: "", password: "" });
    expect(fieldErrors(result.error!)).toEqual({
      email: "Email tidak valid",
      password: "Password wajib diisi",
    });
  });
});
