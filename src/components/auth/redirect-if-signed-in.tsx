import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { homePath, readSessionUser } from "@/server/auth/context";

// S-01 and S-02 are for guests. Render inside <Suspense>: it reads the request.
export async function RedirectIfSignedIn() {
  const user = await readSessionUser(await headers());
  if (user) {
    redirect(homePath(user));
  }
  return null;
}
