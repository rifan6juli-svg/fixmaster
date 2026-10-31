"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { UserRole } from "@/lib/user-role";
import { activeHref, navItemsFor, receiveUnitFor } from "./nav-items";

// One element for both layouts: an 88px rail with captions from 640px, because
// a shop tablet has no hover to reveal a title, and a 240px sidebar from 1024px.
export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const active = activeHref(pathname);
  const receiveUnit = receiveUnitFor(role);

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-22 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-surface px-2 py-4 sm:flex lg:w-60 lg:px-3">
      {receiveUnit && (
        // The amber tile, as on the bottom bar: the page keeps the one primary
        // button of its action area (DBD section 7).
        <Link
          href={receiveUnit.href}
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-md border border-border-strong bg-surface text-caption font-medium text-text transition-colors duration-150 hover:bg-surface-sunken lg:h-11 lg:min-h-0 lg:flex-row lg:justify-start lg:gap-2 lg:px-2 lg:text-body-sm"
        >
          <span className="rounded-sm bg-primary p-1 text-on-primary">
            <receiveUnit.icon
              className="size-4"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </span>
          {receiveUnit.label}
        </Link>
      )}
      <nav aria-label="Navigasi utama">
        <ul className="grid gap-1">
          {navItemsFor(role).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={item.href === active ? "page" : undefined}
                className="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-caption font-medium text-text-muted transition-colors duration-150 before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-primary before:opacity-0 hover:bg-surface-sunken hover:text-text aria-[current=page]:bg-brand-text/12 aria-[current=page]:text-brand-text aria-[current=page]:before:opacity-100 lg:h-11 lg:min-h-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-body-sm"
              >
                <item.icon
                  className="size-5 shrink-0"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
