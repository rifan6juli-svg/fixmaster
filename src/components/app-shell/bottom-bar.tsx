"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { UserRole } from "@/lib/user-role";
import {
  activeHref,
  bottomBarItemsFor,
  receiveUnitFor,
  type NavItem,
} from "./nav-items";

const BAR_ITEM_CLASS =
  "relative flex h-full w-full flex-col items-center justify-center gap-0.5 text-caption font-medium text-text-muted before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:rounded-full before:bg-primary before:opacity-0 aria-[current=page]:text-brand-text aria-[current=page]:before:opacity-100 data-[active=true]:text-brand-text data-[active=true]:before:opacity-100";

function BarLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={BAR_ITEM_CLASS}
    >
      <item.icon
        className="my-0.5 size-5"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      {item.label}
    </Link>
  );
}

// The main action keeps the primary color here too, on the icon only so it does
// not compete with the page's own primary button (DBD section 7).
function ReceiveUnitLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={BAR_ITEM_CLASS}
    >
      <span className="rounded-md bg-primary px-3 py-0.5 text-on-primary">
        <item.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      {item.label}
    </Link>
  );
}

export function BottomBar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const active = activeHref(pathname);
  const { bar, more } = bottomBarItemsFor(role);
  const receiveUnit = receiveUnitFor(role);

  return (
    <nav
      aria-label="Navigasi utama"
      data-slot="bottom-bar"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <ul className="flex h-14">
        {bar.map((item) => (
          <li key={item.href} className="flex-1">
            <BarLink item={item} active={item.href === active} />
          </li>
        ))}
        {receiveUnit && (
          <li className="flex-1">
            <ReceiveUnitLink
              item={receiveUnit}
              active={receiveUnit.href === active}
            />
          </li>
        )}
        <li className="flex-1">
          <Sheet>
            <SheetTrigger
              className={BAR_ITEM_CLASS}
              data-active={more.some((item) => item.href === active)}
            >
              <Ellipsis
                className="my-0.5 size-5"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              Lainnya
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="flex h-11 items-center">
                Lainnya
              </SheetTitle>
              <ul className="grid gap-1">
                {more.map((item) => (
                  <li key={item.href}>
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        aria-current={item.href === active ? "page" : undefined}
                        className="flex h-11 items-center gap-3 rounded-md px-3 text-body font-medium text-text hover:bg-surface-sunken aria-[current=page]:bg-brand-text/12 aria-[current=page]:text-brand-text"
                      >
                        <item.icon
                          className="size-5 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        {item.label}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
