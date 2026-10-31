import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "@/lib/pagination";

interface PaginationProps {
  page: number;
  total: number;
  /** The URL of a page, keeping the list's other params. */
  hrefFor: (page: number) => string;
}

function PageButton({
  page,
  enabled,
  hrefFor,
  children,
}: {
  page: number;
  enabled: boolean;
  hrefFor: (page: number) => string;
  children: string;
}) {
  if (!enabled) {
    return (
      <Button variant="secondary" disabled>
        {children}
      </Button>
    );
  }
  return (
    <Button asChild variant="secondary">
      <Link href={hrefFor(page)}>{children}</Link>
    </Button>
  );
}

// "1-25 dari N" with Sebelumnya/Berikutnya, disabled at the ends (DBD section 3).
export function Pagination({ page, total, hrefFor }: PaginationProps) {
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);

  if (total <= PAGE_SIZE) {
    return null;
  }

  return (
    <nav
      aria-label="Halaman"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-body-sm text-text-muted">
        {first}-{last} dari {total}
      </p>
      <div className="flex gap-2">
        <PageButton page={page - 1} enabled={page > 1} hrefFor={hrefFor}>
          Sebelumnya
        </PageButton>
        <PageButton page={page + 1} enabled={last < total} hrefFor={hrefFor}>
          Berikutnya
        </PageButton>
      </div>
    </nav>
  );
}
