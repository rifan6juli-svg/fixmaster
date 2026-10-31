import { unstable_rethrow } from "next/navigation";

import type { ActionResult } from "@/lib/action-result";
import { logger } from "@/lib/logger";
import { AppError } from "@/server/errors";

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
