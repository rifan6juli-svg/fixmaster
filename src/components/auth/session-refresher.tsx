"use client";

import * as React from "react";

import { authClient } from "@/lib/auth-client";

// A page render cannot write cookies, so the 7-day session is only extended by
// a request to Better Auth (TRD section 5).
export function SessionRefresher() {
  React.useEffect(() => {
    void authClient.getSession();
  }, []);

  return null;
}
