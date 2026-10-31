import { Suspense } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { SessionRefresher } from "@/components/auth/session-refresher";
import { Logo } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { getTenantContext } from "@/server/auth/context";

function ContentSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-4">
      <span className="sr-only">Memuat data…</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

// Inside <Suspense> so the session read does not hold back the app chrome. The
// page only renders once the session is confirmed.
async function SessionGate({ children }: { children: React.ReactNode }) {
  await getTenantContext();
  return children;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionRefresher />
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
        <Logo />
        <LogoutButton />
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Suspense fallback={<ContentSkeleton />}>
          <SessionGate>{children}</SessionGate>
        </Suspense>
      </main>
    </>
  );
}
