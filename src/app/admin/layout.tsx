import { Suspense } from "react";

import { AppHeader } from "@/components/app-shell/app-header";
import { AppShellSkeleton } from "@/components/app-shell/skeletons";
import { UserMenu } from "@/components/app-shell/user-menu";
import { SessionRefresher } from "@/components/auth/session-refresher";
import { requireSuperAdmin } from "@/server/auth/context";

async function AdminShell({ children }: { children: React.ReactNode }) {
  const { name, email, role } = await requireSuperAdmin();

  return (
    <div className="flex min-h-dvh flex-col">
      <SessionRefresher />
      <AppHeader homeHref="/admin">
        <UserMenu name={name} email={email} role={role} />
      </AppHeader>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
