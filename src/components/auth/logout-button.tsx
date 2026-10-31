"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "./use-logout";

// For S-03, where a held user has no user menu to leave from.
export function LogoutButton() {
  const logout = useLogout();

  return (
    <Button variant="ghost" className="-ml-4" onClick={logout}>
      Keluar
    </Button>
  );
}
