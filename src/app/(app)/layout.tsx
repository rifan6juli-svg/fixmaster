import { Suspense } from "react";

import { AppHeader } from "@/components/app-shell/app-header";
import { BottomBar } from "@/components/app-shell/bottom-bar";
import { Sidebar } from "@/components/app-shell/sidebar";
import {
  AppShellSkeleton,
  ContentSkeleton,
} from "@/components/app-shell/skeletons";
import { UrlToast } from "@/components/app-shell/url-toast";
import { UserMenu } from "@/components/app-shell/user-menu";
import { SessionRefresher } from "@/components/auth/session-refresher";
import { getSessionUser, getTenantContext } from "@/server/auth/context";
import { getShop } from "@/server/services/shops";

// Inside <Suspense>, and the page only renders once the session is confirmed.
async function AppShell({ children }: { children: React.ReactNode }) {
  const ctx = await getTenantContext();
  const { role } = ctx;
  const { name, email } = await getSessionUser();
  const shop = await getShop(ctx);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface-raised focus:px-4 focus:py-2 focus:shadow-raised"
      >
        Lewati ke konten
      </a>
      <SessionRefresher />
      <Suspense fallback={null}>
        <UrlToast />
      </Suspense>
      <AppHeader homeHref="/dashboard" shopName={shop.name}>
        <UserMenu name={name} email={email} role={role} shopName={shop.name} />
      </AppHeader>
      <div className="flex flex-1">
        <Sidebar role={role} />
        <main
          id="konten"
          tabIndex={-1}
          className="min-w-0 flex-1 px-4 pt-6 pb-[calc(1.5rem+var(--fm-bottom-bar-height)+env(safe-area-inset-bottom))]"
        >
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
