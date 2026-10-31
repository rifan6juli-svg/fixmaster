import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function NotFoundState() {
  return (
    <EmptyState
      title="Halaman tidak ditemukan"
      description="Alamat ini tidak ada atau sudah dipindahkan."
      action={
        <Button asChild>
          <Link href="/dashboard">Kembali ke dashboard</Link>
        </Button>
      }
    />
  );
}

export function ErrorState({ retry }: { retry: () => void }) {
  return (
    <EmptyState
      title="Gagal memuat data"
      description="Periksa koneksi Anda, lalu coba lagi."
      action={<Button onClick={retry}>Coba lagi</Button>}
    />
  );
}

/** Stands in for a screen built in a later IPD step, so the menu has no dead links. */
export function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="grid gap-6">
      <h1 className="text-h1 font-semibold">{title}</h1>
      <EmptyState showMascot={false} title="Halaman ini sedang disiapkan" />
    </div>
  );
}
