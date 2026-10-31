import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readTenantContext } from "@/server/auth/context";

// S-01 and S-02 are for guests. Render inside <Suspense>: it reads the request.
export async function RedirectIfSignedIn() {
  if (await readTenantContext(await headers())) {
    redirect("/dashboard");
  }
  return null;
}
