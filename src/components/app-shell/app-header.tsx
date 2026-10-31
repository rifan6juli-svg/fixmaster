import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export function AppHeader({
  homeHref,
  children,
}: {
  homeHref: string;
  /** The user menu, or its placeholder while the session loads. */
  children: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <Link href={homeHref} aria-label="Fixmaster, ke halaman utama">
        <Logo />
      </Link>
      {children}
    </header>
  );
}
