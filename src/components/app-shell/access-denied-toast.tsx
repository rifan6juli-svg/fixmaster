"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { toastError } from "@/components/ui/sonner";

// requirePageRole() redirects to /dashboard?denied=1. Render inside <Suspense>:
// it reads the URL.
export function AccessDeniedToast() {
  const denied = useSearchParams().has("denied");
  const router = useRouter();

  React.useEffect(() => {
    if (denied) {
      toastError("Anda tidak punya akses ke halaman ini", {
        id: "access-denied",
      });
      router.replace("/dashboard");
    }
  }, [denied, router]);

  return null;
}
