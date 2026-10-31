"use server";

import { refresh } from "next/cache";

import {
  createStaffSchema,
  resetStaffPasswordSchema,
  setStaffActiveSchema,
} from "@/lib/validation/staff";
import { getTenantContext } from "@/server/auth/context";
import { requireRole } from "@/server/auth/guards";
import * as staff from "@/server/services/staff";
import { parseInput, toActionResult } from "./result";

async function getOwnerContext() {
  const ctx = await getTenantContext();
  requireRole(ctx, ["owner"]);
  return ctx;
}

export async function createStaff(input: unknown) {
  return toActionResult(async () => {
    const ctx = await getOwnerContext();
    const result = await staff.createStaff(
      ctx,
      parseInput(createStaffSchema, input),
    );

    refresh();
    return result;
  });
}

export async function setStaffActive(input: unknown) {
  return toActionResult(async () => {
    const ctx = await getOwnerContext();
    await staff.setStaffActive(ctx, parseInput(setStaffActiveSchema, input));

    refresh();
    return null;
  });
}

export async function resetStaffPassword(input: unknown) {
  return toActionResult(async () => {
    const ctx = await getOwnerContext();
    await staff.resetStaffPassword(
      ctx,
      parseInput(resetStaffPasswordSchema, input),
    );

    refresh();
    return null;
  });
}
