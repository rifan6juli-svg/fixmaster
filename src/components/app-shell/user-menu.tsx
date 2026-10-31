"use client";

import { ChevronDown, CircleUser, KeyRound, LogOut } from "lucide-react";
import Link from "next/link";

import { useLogout } from "@/components/auth/use-logout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_ROLE_LABELS, type UserRole } from "@/lib/user-role";

interface UserMenuProps {
  name: string;
  email: string;
  role: UserRole;
}

export function UserMenu({ name, email, role }: UserMenuProps) {
  const logout = useLogout();

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
        <DropdownMenuItem asChild>
          <Link href="/change-password">
            <KeyRound strokeWidth={1.75} aria-hidden="true" />
            Ganti password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={logout}>
          <LogOut strokeWidth={1.75} aria-hidden="true" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
