import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export function AppHeader({
  homeHref,
  shopName,
  children,
}: {
  homeHref: string;
  /** Hidden on a phone, where the user menu shows it instead. */
  shopName?: string;
  /** The user menu, or its placeholder while the session loads. */
  children: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-surface px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={homeHref}
          aria-label="Fixmaster, ke halaman utama"
          className="inline-flex min-h-11 shrink-0 items-center"
        >
          <Logo />
        </Link>
        {shopName && (
          <span className="hidden truncate border-l border-border pl-3 text-body-sm text-text-muted sm:block">
            {shopName}
          </span>
        )}
      </div>
      {children}
    </header>
  );
}
