import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Fixmaster" };

export default function DashboardPage() {
  return (
    <div className="grid gap-2">
      <h1 className="text-h1 font-semibold">Dashboard</h1>
      <p className="text-text-muted">Selamat datang di Fixmaster.</p>
    </div>
  );
}
