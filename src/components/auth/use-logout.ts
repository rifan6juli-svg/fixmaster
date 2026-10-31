import { useRouter } from "next/navigation";

import { toastError } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";

export function useLogout() {
  const router = useRouter();

  return async function logout() {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toastError("Terjadi kesalahan, coba lagi.");
        return;
      }
      router.replace("/login");
      // Otherwise the Back button can show pages cached for this session.
      router.refresh();
    } catch {
      toastError("Koneksi terputus, coba lagi");
    }
  };
}
