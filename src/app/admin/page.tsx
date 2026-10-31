import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/app-shell/page-states";

export const metadata: Metadata = { title: "Daftar toko | Fixmaster" };

export default function AdminPage() {
  return <PagePlaceholder title="Daftar toko" homeHref={null} />;
}
