import { Skeleton } from "@/components/ui/skeleton";
import { AppHeader } from "./app-header";

export function ContentSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-4">
      <span className="sr-only">Memuat data…</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

/** The static shell: the menu depends on the role, known only from the session. */
export function AppShellSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader homeHref="/dashboard">
        <Skeleton className="h-8 w-28" />
      </AppHeader>
      <div className="flex flex-1">
        <div className="hidden w-22 shrink-0 flex-col gap-2 border-r border-border bg-surface px-2 py-4 sm:flex lg:w-60 lg:px-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="min-w-0 flex-1 px-4 py-6">
          <ContentSkeleton />
        </div>
      </div>
    </div>
  );
}
