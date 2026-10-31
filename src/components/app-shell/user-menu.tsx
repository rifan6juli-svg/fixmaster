"use client";

import { ChevronDown, CircleUser, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toastError } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";
import { USER_ROLE_LABELS, type UserRole } from "@/lib/user-role";

interface UserMenuProps {
  name: string;
  email: string;
  role: UserRole;
}

export function UserMenu({ name, email, role }: UserMenuProps) {
  const router = useRouter();

  async function logout() {
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
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="Menu pengguna" className="px-2">
          <CircleUser strokeWidth={1.75} aria-hidden="true" />
          <span className="hidden max-w-40 truncate sm:inline">{name}</span>
          <ChevronDown
            className="size-4"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-[calc(100vw-2rem)]">
        <DropdownMenuLabel>
          <p className="truncate font-semibold">{name}</p>
          <p className="truncate text-text-muted">{email}</p>
          <p className="text-text-muted">{USER_ROLE_LABELS[role]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout}>
          <LogOut strokeWidth={1.75} aria-hidden="true" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
