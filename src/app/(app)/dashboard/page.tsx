import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ContentSkeleton } from "@/components/app-shell/skeletons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Readout } from "@/components/ui/readout";
import { daysUntil } from "@/lib/dates";
import { getTenantContext } from "@/server/auth/context";
import { shopHasTickets } from "@/server/services/dashboard";
import { getShop } from "@/server/services/shops";

export const metadata: Metadata = { title: "Dashboard | Fixmaster" };

async function DashboardContent() {
  const ctx = await getTenantContext();
  const [hasTickets, shop] = await Promise.all([
    shopHasTickets(ctx),
    getShop(ctx),
  ]);

  // Trial days are the owner's concern, and S-17 is owner-only (AFD section 1).
  const trialDays =
    ctx.role === "owner" && !shop.activeUntil ? daysUntil(shop.trialEndsAt) : 0;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1 font-semibold">Dashboard</h1>
        {trialDays > 0 && (
          <Readout className="uppercase">Trial {trialDays} hari</Readout>
        )}
      </div>
      {hasTickets ? (
        <EmptyState
          showMascot={false}
          title="Ringkasan tiket dan stok"
          description="Angka tiket, pendapatan, dan stok menipis akan tampil di sini."
        />
      ) : ctx.role === "technician" ? (
        <EmptyState
          title="Belum ada tiket"
          description="Tiket yang ditugaskan kepada Anda akan muncul di sini."
        />
      ) : (
        <EmptyState
          size="hero"
          title={`Selamat datang, ${shop.name}`}
          description="Toko Anda sudah siap. Catat unit pertama yang masuk."
          action={
            <Button asChild size="lg">
              <Link href="/tickets/new">Terima unit pertama</Link>
            </Button>
          }
        />
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Suspense fallback={<ContentSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
