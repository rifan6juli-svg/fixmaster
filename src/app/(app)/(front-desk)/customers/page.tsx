import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/app-shell/page-states";

export const metadata: Metadata = { title: "Pelanggan | Fixmaster" };

export default function CustomersPage() {
  return <PagePlaceholder title="Pelanggan" />;
}
