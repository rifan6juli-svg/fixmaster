import { z } from "zod";

import { normalizePhoneWa } from "@/lib/phone";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(255, "Email maksimal 255 karakter")
  .pipe(z.email("Email tidak valid"));

export const registerShopSchema = z.object({
  shopName: z
    .string()
    .trim()
    .min(3, "Nama toko minimal 3 karakter")
    .max(80, "Nama toko maksimal 80 karakter"),
  ownerName: z
    .string()
    .trim()
    .min(1, "Nama owner wajib diisi")
    .max(100, "Nama owner maksimal 100 karakter"),
  phoneWa: z
    .string()
    .refine(
      (value) => normalizePhoneWa(value) !== null,
      "Nomor WA tidak valid (contoh: 0812xxxxxxxx)",
    )
    .transform((value) => normalizePhoneWa(value)!),
  email,
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter"),
});

export type RegisterShopForm = z.input<typeof registerShopSchema>;
export type RegisterShopInput = z.output<typeof registerShopSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password wajib diisi"),
});

/** First message per field, in the shape of ActionError.fields. */
export function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    fields[field] ??= issue.message;
  }
  return fields;
}
