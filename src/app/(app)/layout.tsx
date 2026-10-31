import { Suspense } from "react";

import { AppHeader } from "@/components/app-shell/app-header";
import { BottomBar } from "@/components/app-shell/bottom-bar";
import { Sidebar } from "@/components/app-shell/sidebar";
import {
  AppShellSkeleton,
  ContentSkeleton,
} from "@/components/app-shell/skeletons";
import { UserMenu } from "@/components/app-shell/user-menu";
import { SessionRefresher } from "@/components/auth/session-refresher";
import { getSessionUser, getTenantContext } from "@/server/auth/context";

// Inside <Suspense>, and the page only renders once the session is confirmed.
async function AppShell({ children }: { children: React.ReactNode }) {
  const { role } = await getTenantContext();
  const { name, email } = await getSessionUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <SessionRefresher />
      <AppHeader homeHref="/dashboard">
        <UserMenu name={name} email={email} role={role} />
      </AppHeader>
      <div className="flex flex-1">
        <Sidebar role={role} />
        <main className="min-w-0 flex-1 px-4 pt-6 pb-[calc(1.5rem+var(--fm-bottom-bar-height)+env(safe-area-inset-bottom))]">
          <div className="mx-auto max-w-7xl">
            <Suspense fallback={<ContentSkeleton />}>{children}</Suspense>
          </div>
        </main>
      </div>
      <BottomBar role={role} />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
