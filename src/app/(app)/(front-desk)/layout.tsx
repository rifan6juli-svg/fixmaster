import { requirePageRole } from "@/server/auth/context";

// S-06, S-10, S-11: every page here is for owners and admins (AFD section 1).
export default async function FrontDeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageRole(["owner", "admin"]);
  return children;
}
