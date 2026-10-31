import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";

import type { ActionResult } from "@/lib/action-result";
import { logger } from "@/lib/logger";
import { fieldErrors } from "@/lib/validation/auth";
import { AppError } from "@/server/errors";

/** Validates an action's input; a failure becomes VALIDATION with per-field messages. */
export function parseInput<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): z.output<Schema> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new AppError(
      "VALIDATION",
      "Periksa kembali isian Anda",
      fieldErrors(parsed.error),
    );
  }
  return parsed.data;
}

/** Runs an action body and returns its outcome as an ActionResult (TRD section 4). */
export async function toActionResult<T>(
  run: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await run() };
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof AppError) {
      const { code, message, fields } = error;
      return { ok: false, error: { code, message, fields } };
    }

    logger.error("Unexpected action error", { error });
    return {
      ok: false,
      error: { code: "INTERNAL", message: "Terjadi kesalahan, coba lagi." },
    };
  }
}
