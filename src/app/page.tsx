import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-display font-semibold">Fixmaster</h1>
      <p className="max-w-prose text-text-muted">
        Manajemen servis untuk toko reparasi laptop, HP, dan perangkat
        elektronik.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/dashboard">Masuk</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/register">Daftarkan toko</Link>
        </Button>
      </div>
    </main>
  );
}
