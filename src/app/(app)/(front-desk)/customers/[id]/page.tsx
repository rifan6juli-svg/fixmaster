import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BackLink } from "@/components/app-shell/back-link";
import { ContentSkeleton } from "@/components/app-shell/skeletons";
import { CustomerPanel } from "@/components/customers/customer-panel";
import { CustomerTickets } from "@/components/customers/customer-tickets";
import { Card, CardContent } from "@/components/ui/card";
import { safeNextPath } from "@/lib/safe-next";
import { saveCustomer } from "@/server/actions/customers";
import { requirePageRole } from "@/server/auth/context";
import { getCustomer, listCustomerTickets } from "@/server/services/customers";
import { getShop } from "@/server/services/shops";

export const metadata: Metadata = { title: "Detail pelanggan | Fixmaster" };

async function CustomerContent({
  params,
  searchParams,
}: PageProps<"/customers/[id]">) {
  const ctx = await requirePageRole(["owner", "admin"]);
  const { id } = await params;
  const { back } = await searchParams;

  const customer = await getCustomer(ctx, id);
  if (!customer) {
    notFound();
  }

  const [tickets, shop] = await Promise.all([
    listCustomerTickets(ctx, customer.id),
    getShop(ctx),
  ]);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-1">
        <BackLink
          href={
            typeof back === "string"
              ? safeNextPath(back, "/customers")
              : "/customers"
          }
        >
          Pelanggan
        </BackLink>
        <h1 className="text-h1 font-semibold wrap-anywhere">{customer.name}</h1>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card>
          <CardContent>
            <CustomerPanel
              key={customer.id}
              customer={customer}
              action={saveCustomer}
            />
          </CardContent>
        </Card>
        <section className="grid grid-cols-1 gap-3">
          <h2 className="text-h2 font-semibold">Riwayat tiket</h2>
          <CustomerTickets tickets={tickets} timezone={shop.timezone} />
        </section>
      </div>
    </div>
  );
}

export default function CustomerPage(props: PageProps<"/customers/[id]">) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <CustomerContent {...props} />
    </Suspense>
  );
}
