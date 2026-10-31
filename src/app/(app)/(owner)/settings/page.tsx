import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/app-shell/page-states";

export const metadata: Metadata = { title: "Pengaturan | Fixmaster" };

export default function SettingsPage() {
  return <PagePlaceholder title="Pengaturan" />;
}
