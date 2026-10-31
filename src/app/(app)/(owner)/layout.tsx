import { requirePageRole } from "@/server/auth/context";

// S-14, S-15, S-16, S-17: every page here is for the owner (PRD F-02).
export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole(["owner"]);
  return children;
}
