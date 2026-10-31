import type { Metadata } from "next";

import { NotFoundState } from "@/components/app-shell/page-states";

export const metadata: Metadata = {
  title: "Pelanggan tidak ditemukan | Fixmaster",
};

export default function CustomerNotFound() {
  return (
    <NotFoundState
      title="Pelanggan tidak ditemukan"
      description="Pelanggan ini tidak ada di toko Anda."
      href="/customers"
      linkLabel="Lihat daftar pelanggan"
    />
  );
}
