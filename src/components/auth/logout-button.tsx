"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { toastError } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const { error } = await authClient.signOut();
      if (!error) {
        router.replace("/login");
        // Otherwise the Back button can show pages cached for this session.
        router.refresh();
        return;
      }
      toastError("Terjadi kesalahan, coba lagi.");
    } catch {
      toastError("Koneksi terputus, coba lagi");
    }
    setPending(false);
  }

  return (
    <Button variant="ghost" loading={pending} onClick={handleClick}>
      Keluar
    </Button>
  );
}
