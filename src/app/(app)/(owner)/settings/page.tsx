import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Pengaturan | Fixmaster" };

const SECTIONS = [
  {
    href: "/settings/staff",
    title: "Staf",
    description: "Tambah akun, reset password, dan nonaktifkan staf.",
  },
  {
    href: "/settings/subscription",
    title: "Langganan",
    description: "Status, masa aktif, dan cara pembayaran.",
  },
];

// Links to S-15 and S-17 until the S-16 form arrives in IPD step 21.
export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-h1 font-semibold">Pengaturan</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {SECTIONS.map(({ href, title, description }) => (
          <li key={href}>
            <Card asChild interactive className="gap-1 px-4 py-4">
              <Link href={href}>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
