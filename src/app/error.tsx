"use client";

import { ErrorState } from "@/components/app-shell/page-states";

export default function RootError({ retry }: { retry: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <ErrorState retry={retry} />
    </main>
  );
}
