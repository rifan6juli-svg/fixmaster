import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export function BackLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <Link
      href={href}
      className="-ml-1 inline-flex min-h-11 items-center gap-1 justify-self-start text-body-sm font-medium text-brand-text hover:underline"
    >
      <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
      {children}
    </Link>
  );
}
