"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  changePasswordSchema,
  registerShopSchema,
} from "@/lib/validation/auth";
import { getAuth } from "@/server/auth/auth";
import { getSessionUser } from "@/server/auth/context";
import * as accounts from "@/server/services/accounts";
import * as shops from "@/server/services/shops";
import { parseInput, toActionResult } from "./result";

export async function registerShop(input: unknown) {
  return toActionResult(async () => {
    const shop = parseInput(registerShopSchema, input);

    await shops.registerShop(shop);

    await getAuth().api.signInEmail({
      body: { email: shop.email, password: shop.password },
      headers: await headers(),
    });

    redirect("/dashboard");
  });
}

export async function changePassword(input: unknown) {
  return toActionResult(async () => {
    const user = await getSessionUser();

    await accounts.changePassword(
      user.id,
      parseInput(changePasswordSchema, input),
    );

    return null;
  });
}
