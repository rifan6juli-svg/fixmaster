import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function NotFoundState({
  title = "Halaman tidak ditemukan",
  description = "Alamat ini tidak ada atau sudah dipindahkan.",
  href = "/dashboard",
  linkLabel = "Kembali ke dashboard",
}: {
  title?: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <EmptyState
      headingLevel={1}
      title={title}
      description={description}
      action={
        <Button asChild>
          <Link href={href}>{linkLabel}</Link>
        </Button>
      }
    />
  );
}

export function ErrorState({ retry }: { retry: () => void }) {
  return (
    <EmptyState
      headingLevel={1}
      title="Gagal memuat data"
      description="Halaman ini tidak berhasil dimuat. Coba lagi, atau tunggu beberapa menit kalau masih gagal."
      action={<Button onClick={retry}>Coba lagi</Button>}
    />
  );
}

/** Stands in for a screen built in a later IPD step, so the menu has no dead links. */
export function PagePlaceholder({
  title,
  homeHref = "/dashboard",
}: {
  title: string;
  /** Where to go next; null on a page that is already home. */
  homeHref?: string | null;
}) {
  return (
    <div className="grid gap-6">
      <h1 className="text-h1 font-semibold">{title}</h1>
      <EmptyState
        showMascot={false}
        title="Halaman ini sedang disiapkan"
        description="Fitur ini menyusul di pembaruan berikutnya."
        action={
          homeHref && (
            <Button asChild variant="secondary">
              <Link href={homeHref}>Kembali ke dashboard</Link>
            </Button>
          )
        }
      />
    </div>
  );
}
