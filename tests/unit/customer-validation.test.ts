import { describe, expect, it } from "vitest";
import { fieldErrors } from "@/lib/validation/auth";
import {
  saveCustomerSchema,
  searchCustomersSchema,
} from "@/lib/validation/customers";

describe("saveCustomerSchema", () => {
  it("trims the name, normalizes the number, and empties blank notes", () => {
    expect(
      saveCustomerSchema.parse({
        name: "  Dewi  ",
        phoneWa: "0812-3456-7890",
        notes: "   ",
      }),
    ).toEqual({ name: "Dewi", phoneWa: "6281234567890", notes: null });
  });

  it("reports each invalid field", () => {
    const result = saveCustomerSchema.safeParse({
      name: "",
      phoneWa: "123",
      notes: "x".repeat(501),
    });

    expect(fieldErrors(result.error!)).toEqual({
      name: "Nama wajib diisi",
      phoneWa: "Nomor WA tidak valid (contoh: 0812xxxxxxxx)",
      notes: "Catatan maksimal 500 karakter",
    });
  });
});

describe("searchCustomersSchema", () => {
  it("needs at least 3 characters after trimming", () => {
    const result = searchCustomersSchema.safeParse({ q: " ab " });

    expect(fieldErrors(result.error!)).toEqual({
      q: "Ketik minimal 3 karakter",
    });
  });
});
