"use server";

import { headers } from "next/headers";

import { fieldErrors, registerShopSchema } from "@/lib/validation/auth";
import { getAuth } from "@/server/auth/auth";
import { AppError } from "@/server/errors";
import { registerShop as createShop } from "@/server/services/shops";
import { toActionResult } from "./result";

export async function registerShop(input: unknown) {
  return toActionResult(async () => {
    const parsed = registerShopSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(
        "VALIDATION",
        "Periksa kembali isian Anda",
        fieldErrors(parsed.error),
      );
    }

    await createShop(parsed.data);

    const { email, password } = parsed.data;
    await getAuth().api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    return null;
  });
}
