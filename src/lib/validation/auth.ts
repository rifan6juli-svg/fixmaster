import { z } from "zod";

import { normalizePhoneWa } from "@/lib/phone";

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(255, "Email maksimal 255 karakter")
  .pipe(z.email("Email tidak valid"));

/** A password being set, within the limits Better Auth accepts at sign-in. */
export function newPasswordField(label = "Password") {
  return z
    .string()
    .min(8, `${label} minimal 8 karakter`)
    .max(128, `${label} maksimal 128 karakter`);
}

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
  email: emailField,
  password: newPasswordField(),
});

export type RegisterShopForm = z.input<typeof registerShopSchema>;
export type RegisterShopInput = z.output<typeof registerShopSchema>;

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password wajib diisi"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: newPasswordField("Password baru"),
  })
  .refine((input) => input.newPassword !== input.currentPassword, {
    path: ["newPassword"],
    message: "Password baru harus berbeda dari password saat ini",
  });

export type ChangePasswordInput = z.output<typeof changePasswordSchema>;

/** First message per field, in the shape of ActionError.fields. */
export function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    fields[field] ??= issue.message;
  }
  return fields;
}
