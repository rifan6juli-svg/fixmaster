import type { Metadata } from "next";

import { NotFoundState } from "@/components/app-shell/page-states";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan | Fixmaster",
};

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <NotFoundState />
    </main>
  );
}
