import { z } from "zod";

import { emailField, newPasswordField } from "./auth";

const tempPassword = newPasswordField("Password sementara");

export const createStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  email: emailField,
  role: z.enum(["admin", "technician"], "Pilih peran"),
  tempPassword,
});

export type CreateStaffForm = z.input<typeof createStaffSchema>;
export type CreateStaffInput = z.output<typeof createStaffSchema>;

export const setStaffActiveSchema = z.object({
  userId: z.uuid(),
  isActive: z.boolean(),
});

export type SetStaffActiveInput = z.output<typeof setStaffActiveSchema>;

export const resetStaffPasswordSchema = z.object({
  userId: z.uuid(),
  tempPassword,
});

export type ResetStaffPasswordInput = z.output<typeof resetStaffPasswordSchema>;
