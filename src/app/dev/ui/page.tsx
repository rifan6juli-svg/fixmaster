import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { Mascot } from "@/components/brand/mascot";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Readout } from "@/components/ui/readout";
import { Skeleton } from "@/components/ui/skeleton";
import { TICKET_STATUSES } from "@/lib/ticket-status";

import { DialogDemo, ToastDemo } from "./interactive-demos";

export const metadata: Metadata = {
  title: "UI kit · Fixmaster",
  robots: { index: false },
};

// Literal class names so Tailwind generates them (docs/DBD.md section 2).
const COLOR_TOKENS = [
  ["background", "bg-background"],
  ["surface", "bg-surface"],
  ["surface-raised", "bg-surface-raised"],
  ["surface-sunken", "bg-surface-sunken"],
  ["border", "bg-border"],
  ["border-strong", "bg-border-strong"],
  ["text", "bg-text"],
  ["text-muted", "bg-text-muted"],
  ["primary", "bg-primary"],
  ["primary-hover", "bg-primary-hover"],
  ["on-primary", "bg-on-primary"],
  ["brand-text", "bg-brand-text"],
  ["accent", "bg-accent"],
  ["focus-ring", "bg-focus-ring"],
  ["readout-bg", "bg-readout-bg"],
  ["readout-text", "bg-readout-text"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["danger", "bg-danger"],
  ["on-danger", "bg-on-danger"],
] as const;

const TYPE_SCALE = [
  ["display", "text-display font-semibold"],
  ["h1", "text-h1 font-semibold"],
  ["h2", "text-h2 font-semibold"],
  ["h3", "text-h3 font-semibold"],
  ["body", "text-body"],
  ["body-sm", "text-body-sm"],
  ["caption", "text-caption font-medium"],
] as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h2 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function DevUiPage() {
  // Development-only kit (IPD step 2); production returns 404.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-2">
        <Logo />
        <h1 className="text-h1 font-semibold">UI kit</h1>
        <p className="text-body-sm text-text-muted">
          Token dan komponen dari docs/DBD.md. Mode terang/gelap mengikuti
          sistem.
        </p>
      </header>

      <Section title="Warna">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COLOR_TOKENS.map(([name, swatch]) => (
            <li key={name} className="flex items-center gap-2">
              <span
                className={`size-8 shrink-0 rounded-sm border border-border-strong ${swatch}`}
              />
              <code className="font-mono text-caption">{name}</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Tipografi">
        <div className="flex flex-col gap-2">
          {TYPE_SCALE.map(([name, className]) => (
            <p key={name} className={className}>
              {name}: Unit diterima, sedang dicek teknisi
            </p>
          ))}
          <p className="font-mono text-body-sm">
            mono: SRV-00042 · IMEI 356938035643809
          </p>
        </div>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Terima unit</Button>
          <Button variant="secondary">Batal</Button>
          <Button variant="ghost">Lainnya</Button>
          <Button variant="danger">Hapus item</Button>
          <Button size="lg">Simpan tiket</Button>
          <Button disabled>Nonaktif</Button>
          <Button loading>Menyimpan</Button>
        </div>
      </Section>

      <Section title="Input & Label">
        <div className="grid max-w-md gap-4">
          <div className="grid gap-2">
            <Label htmlFor="demo-name">Nama pelanggan</Label>
            <Input id="demo-name" placeholder="Budi Santoso" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="demo-phone">Nomor WA</Label>
            <Input
              id="demo-phone"
              type="tel"
              defaultValue="0812"
              aria-invalid="true"
              aria-describedby="demo-phone-error"
            />
            <p id="demo-phone-error" className="text-body-sm text-danger">
              Nomor WA tidak valid (contoh: 0812xxxxxxxx)
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="demo-disabled">Nomor tiket</Label>
            <Input id="demo-disabled" defaultValue="SRV-00042" disabled />
          </div>
        </div>
      </Section>

      <Section title="Badge status tiket">
        <div className="flex flex-wrap gap-2">
          {TICKET_STATUSES.map((status) => (
            <TicketStatusBadge key={status} status={status} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="warning">Stok menipis</Badge>
          <Badge tone="success">Aktif</Badge>
          <Badge tone="accent">Trial</Badge>
          <Badge tone="danger">Kedaluwarsa</Badge>
        </div>
      </Section>

      <Section title="Readout">
        <div className="flex flex-wrap items-center gap-3">
          <Readout>SRV-00042</Readout>
          <Readout size="lg">Rp 1.250.000</Readout>
        </div>
      </Section>

      <Section title="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Siap diambil</CardTitle>
              <CardDescription>Belum diambil lebih dari 7 hari</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-display font-semibold tabular-nums">3</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Memuat</CardTitle>
              <CardDescription>Skeleton saat data dimuat</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Dialog & Toast">
        <div className="flex flex-wrap gap-2">
          <DialogDemo />
          <ToastDemo />
        </div>
      </Section>

      <Section title="Maskot VOLT Probe">
        <div className="flex flex-wrap items-end gap-8">
          <Mascot variant="full" size={160} />
          <Mascot variant="face" size={64} />
        </div>
        <div className="chamfer flex max-w-md flex-col items-center gap-3 bg-surface-sunken p-6 text-center">
          <Mascot variant="full" size={120} animated={false} />
          <p className="text-h3 font-semibold">Belum ada tiket</p>
          <p className="text-body-sm text-text-muted">
            Contoh panel state kosong dengan chamfer.
          </p>
          <Button>Terima unit pertama</Button>
        </div>
      </Section>
    </main>
  );
}
