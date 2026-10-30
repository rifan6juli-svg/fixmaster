import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Logo } from "@/components/brand/logo";
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
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
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
  ["danger-hover", "bg-danger-hover"],
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
  id,
  title,
  rule,
  children,
}: {
  id?: string;
  title: string;
  /** Usage rule from docs/DBD.md, shown so the kit documents how to use it. */
  rule: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-8 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-h2 font-semibold">{title}</h2>
        <p className="max-w-prose text-body-sm text-text-muted">{rule}</p>
      </div>
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

      <Section
        title="Warna"
        rule="Pakai nama token, bukan hex. Amber tidak pernah dipakai sebagai warna teks di latar terang."
      >
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

      <Section
        title="Tipografi"
        rule="IBM Plex Sans untuk UI; Plex Mono hanya untuk nomor tiket, nota, IMEI, SKU, dan readout."
      >
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

      <Section
        title="Button"
        rule="Satu tombol primary per area aksi. Danger hanya untuk aksi yang menghapus atau membatalkan, selalu dengan dialog konfirmasi."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button>Simpan tiket</Button>
          <Button variant="secondary">Batal</Button>
          <Button variant="ghost">Lainnya</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="danger">Hapus item</Button>
          <Button variant="secondary">Batal</Button>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-body-sm text-text-muted">
            State: nonaktif (redup) dan memproses (tetap penuh, dengan spinner).
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button disabled>Simpan tiket</Button>
            <Button loading>Menyimpan</Button>
          </div>
        </div>
      </Section>

      <Section
        title="Field & Input"
        rule="Setiap input punya label. Contoh format ditulis sebagai hint di bawah input, bukan placeholder. Nilai yang hanya dibaca memakai readOnly, bukan disabled."
      >
        <div className="grid max-w-md gap-4">
          <Field label="Nama pelanggan">
            {(control) => <Input {...control} autoComplete="name" />}
          </Field>
          <Field
            label="Nomor WA"
            hint="Contoh: 0812 3456 7890"
            error="Nomor WA tidak valid (contoh: 0812xxxxxxxx)"
          >
            {(control) => <Input {...control} type="tel" defaultValue="0812" />}
          </Field>
          <Field label="Uang muka (DP)" hint="Kosongkan jika tidak ada DP.">
            {(control) => <MoneyInput {...control} />}
          </Field>
          <Field label="Nomor tiket">
            {(control) => (
              <Input
                {...control}
                readOnly
                defaultValue="SRV-00042"
                className="bg-surface-sunken font-mono"
              />
            )}
          </Field>
        </div>
      </Section>

      <Section
        id="badge-status"
        title="Badge status tiket"
        rule="Selalu ikon + label + bentuk. Solid hanya untuk tiket yang sedang dikerjakan; garis putus-putus berarti menunggu pihak lain."
      >
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

      <Section
        title="Readout"
        rule="Hanya untuk nomor tiket, nota, dan nominal total/sisa. Bukan untuk teks biasa."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Readout>SRV-00042</Readout>
          <Readout size="lg">Rp 1.250.000</Readout>
        </div>
      </Section>

      <Section
        title="Card"
        rule="Kartu angka di dashboard bisa diklik dan membuka daftar yang sudah terfilter. Saat memuat, area diberi aria-busy dan teks untuk pembaca layar."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Card asChild interactive>
            <a href="#badge-status">
              <CardHeader>
                <CardTitle>Siap diambil &gt; 7 hari</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <p className="text-display font-semibold tabular-nums">3</p>
                <CardDescription>Ketuk untuk melihat tiketnya</CardDescription>
              </CardContent>
            </a>
          </Card>
          <Card aria-busy="true">
            <CardHeader>
              <CardTitle>Pendapatan hari ini</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <span className="sr-only">Memuat data…</span>
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-5 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section
        title="Dialog & Toast"
        rule="Dialog untuk form singkat dan konfirmasi; Enter menyimpan. Toast error tetap tampil sampai ditutup dan sebaiknya menawarkan langkah pemulihan."
      >
        <div className="flex flex-wrap gap-2">
          <DialogDemo />
          <ToastDemo />
        </div>
      </Section>

      <Section
        title="State kosong & maskot"
        rule="Maskot VOLT Probe hanya di state kosong dan halaman error, maksimal satu per layar, tidak di tabel, tombol, atau halaman cetak."
      >
        <EmptyState
          className="max-w-md"
          title="Belum ada tiket"
          description="Tiket muncul di sini setelah unit pertama diterima."
          action={<Button>Terima unit pertama</Button>}
        />
      </Section>
    </main>
  );
}
