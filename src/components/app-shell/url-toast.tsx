"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { toast, toastError } from "@/components/ui/sonner";

// Shows an outcome that arrived in the URL, after a redirect or a full page
// load, then clears it. Render inside <Suspense>: it reads the URL.
export function UrlToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const denied = searchParams.has("denied");
  const passwordChanged = searchParams.get("password") === "changed";

  React.useEffect(() => {
    if (!denied && !passwordChanged) {
      return;
    }
    if (denied) {
      toastError("Anda tidak punya akses ke halaman ini", {
        id: "access-denied",
      });
    } else {
      toast.success("Password berhasil diganti", { id: "password-changed" });
    }
    router.replace(pathname);
  }, [denied, passwordChanged, pathname, router]);

  return null;
}
