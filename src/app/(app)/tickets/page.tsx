import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/app-shell/page-states";

export const metadata: Metadata = { title: "Tiket | Fixmaster" };

export default function TicketsPage() {
  return <PagePlaceholder title="Tiket" />;
}
