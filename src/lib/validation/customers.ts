import { z } from "zod";

import { phoneWaField } from "./auth";

export const saveCustomerSchema = z.object({
  id: z.uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  phoneWa: phoneWaField,
  notes: z
    .string()
    .trim()
    .max(500, "Catatan maksimal 500 karakter")
    .transform((notes) => notes || null)
    .optional(),
});

export type SaveCustomerForm = z.input<typeof saveCustomerSchema>;
export type SaveCustomerInput = z.output<typeof saveCustomerSchema>;

export const searchCustomersSchema = z.object({
  q: z.string().trim().min(3, "Ketik minimal 3 karakter"),
});

export type SearchCustomersInput = z.output<typeof searchCustomersSchema>;
