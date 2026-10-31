import { unstable_rethrow } from "next/navigation";

import { toastError } from "@/components/ui/sonner";
import type { ActionResult } from "@/lib/action-result";

/**
 * Calls a Server Action from the client. A failure with no field to point at
 * becomes a toast, so callers only handle `ok` and `error.fields`.
 */
export async function callAction<T>(
  action: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    const result = await action();
    if (!result.ok && !result.error.fields) {
      toastError(result.error.message);
    }
    return result;
  } catch (error) {
    // An action that redirects, e.g. on an expired session, rejects here.
    unstable_rethrow(error);

    const message = "Koneksi terputus, coba lagi";
    toastError(message);
    return { ok: false, error: { code: "NETWORK", message } };
  }
}
