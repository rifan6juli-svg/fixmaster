"use client";

import { ErrorState } from "@/components/app-shell/page-states";

// Keeps the menu on screen, so one failing page does not strand the user.
export default function AppError({ retry }: { retry: () => void }) {
  return <ErrorState retry={retry} />;
}
