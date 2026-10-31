import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AccessDeniedToast } from "@/components/app-shell/access-denied-toast";
import { ContentSkeleton } from "@/components/app-shell/skeletons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getTenantContext } from "@/server/auth/context";
import { shopHasTickets } from "@/server/services/dashboard";

export const metadata: Metadata = { title: "Dashboard | Fixmaster" };

async function DashboardContent() {
  const ctx = await getTenantContext();

  if (await shopHasTickets(ctx)) {
    return (
      <p className="text-text-muted">
        Ringkasan tiket dan stok akan tampil di sini.
      </p>
    );
  }

  if (ctx.role === "technician") {
    return (
      <EmptyState
        title="Belum ada tiket"
        description="Tiket yang ditugaskan kepada Anda akan muncul di sini."
      />
    );
  }

  return (
    <EmptyState
      title="Selamat datang di Fixmaster"
      description="Toko Anda sudah siap. Catat unit pertama yang masuk."
      action={
        <Button asChild size="lg">
          <Link href="/tickets/new">Terima unit pertama</Link>
        </Button>
      }
    />
  );
}

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <Suspense fallback={null}>
        <AccessDeniedToast />
      </Suspense>
      <h1 className="text-h1 font-semibold">Dashboard</h1>
      <Suspense fallback={<ContentSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
