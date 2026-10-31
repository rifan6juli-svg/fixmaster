"use server";

import { refresh } from "next/cache";

import {
  saveCustomerSchema,
  searchCustomersSchema,
} from "@/lib/validation/customers";
import { getTenantContext } from "@/server/auth/context";
import { requireRole } from "@/server/auth/guards";
import * as customers from "@/server/services/customers";
import { parseInput, toActionResult } from "./result";

async function getFrontDeskContext() {
  const ctx = await getTenantContext();
  requireRole(ctx, ["owner", "admin"]);
  return ctx;
}

export async function searchCustomers(input: unknown) {
  return toActionResult(async () => {
    const ctx = await getFrontDeskContext();
    const items = await customers.searchCustomers(
      ctx,
      parseInput(searchCustomersSchema, input),
    );
    return { items };
  });
}

export async function saveCustomer(input: unknown) {
  return toActionResult(async () => {
    const ctx = await getFrontDeskContext();
    const result = await customers.saveCustomer(
      ctx,
      parseInput(saveCustomerSchema, input),
    );

    refresh();
    return result;
  });
}
