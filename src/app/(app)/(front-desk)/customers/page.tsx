import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";

import { ContentSkeleton } from "@/components/app-shell/skeletons";
import { CustomerList } from "@/components/customers/customer-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Readout } from "@/components/ui/readout";
import { parsePage } from "@/lib/pagination";
import { requirePageRole } from "@/server/auth/context";
import { listCustomers } from "@/server/services/customers";

export const metadata: Metadata = { title: "Pelanggan | Fixmaster" };

function listHref(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/customers?${query}` : "/customers";
}

async function CustomersContent({
  searchParams,
}: {
  searchParams: PageProps<"/customers">["searchParams"];
}) {
  const ctx = await requirePageRole(["owner", "admin"]);
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const { items, total, page } = await listCustomers(ctx, {
    q,
    page: parsePage(params.page),
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1 font-semibold">Pelanggan</h1>
        {total > 0 && (
          <Readout className="uppercase">
            {total} {q ? "cocok" : "pelanggan"}
          </Readout>
        )}
      </div>

      <Form action="/customers" className="flex items-end gap-2">
        <Field label="Cari nama atau nomor WA" className="min-w-0 flex-1">
          {(control) => (
            <Input {...control} name="q" type="search" defaultValue={q} />
          )}
        </Field>
        <Button type="submit" variant="secondary">
          Cari
        </Button>
      </Form>

      {total > 0 ? (
        <>
          <CustomerList customers={items} listHref={listHref(q, page)} />
          <Pagination
            page={page}
            total={total}
            hrefFor={(target) => listHref(q, target)}
          />
        </>
      ) : q ? (
        <EmptyState
          showMascot={false}
          title="Tidak ada pelanggan yang cocok"
          action={
            <Button asChild variant="secondary">
              <Link href="/customers">Reset pencarian</Link>
            </Button>
          }
        />
      ) : (
        <EmptyState
          showMascot={false}
          title="Belum ada pelanggan"
          description="Pelanggan tercatat otomatis saat Anda menerima unit."
          action={
            <Button asChild>
              <Link href="/tickets/new">Terima unit</Link>
            </Button>
          }
        />
      )}
    </>
  );
}

export default function CustomersPage({
  searchParams,
}: PageProps<"/customers">) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Suspense fallback={<ContentSkeleton />}>
        <CustomersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
