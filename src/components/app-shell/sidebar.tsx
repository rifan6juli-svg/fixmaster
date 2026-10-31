"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/user-role";
import { activeHref, navItemsFor, receiveUnitFor } from "./nav-items";

// One element for both layouts: a 64px icon rail from 640px and a 240px sidebar
// from 1024px (DBD section 4). Labels stay in the accessibility tree on the rail.
export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const active = activeHref(pathname);
  const receiveUnit = receiveUnitFor(role);

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-16 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-surface px-2 py-4 sm:flex lg:w-60 lg:px-3">
      {receiveUnit && (
        <Button asChild className="w-full px-0 lg:px-4">
          <Link href={receiveUnit.href} title={receiveUnit.label}>
            <receiveUnit.icon strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only lg:not-sr-only">{receiveUnit.label}</span>
          </Link>
        </Button>
      )}
      <nav aria-label="Navigasi utama">
        <ul className="grid gap-1">
          {navItemsFor(role).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                title={item.label}
                aria-current={item.href === active ? "page" : undefined}
                className="relative flex h-11 items-center justify-center gap-3 rounded-md text-body-sm font-medium text-text-muted transition-colors duration-150 before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-primary before:opacity-0 hover:bg-surface-sunken hover:text-text aria-[current=page]:bg-brand-text/12 aria-[current=page]:text-brand-text aria-[current=page]:before:opacity-100 lg:justify-start lg:px-3"
              >
                <item.icon
                  className="size-5 shrink-0"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="sr-only lg:not-sr-only">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
