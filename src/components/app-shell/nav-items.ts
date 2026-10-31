import {
  ChartColumn,
  Cpu,
  LayoutDashboard,
  type LucideIcon,
  PackagePlus,
  Settings,
  Ticket,
  Users,
} from "lucide-react";

import type { UserRole } from "@/lib/user-role";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const SHOP_STAFF: UserRole[] = ["owner", "admin", "technician"];
const FRONT_DESK: UserRole[] = ["owner", "admin"];
const OWNER: UserRole[] = ["owner"];

// docs/AFD.md sections 1 and 2.
const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: SHOP_STAFF,
  },
  { href: "/tickets", label: "Tiket", icon: Ticket, roles: SHOP_STAFF },
  { href: "/customers", label: "Pelanggan", icon: Users, roles: FRONT_DESK },
  { href: "/parts", label: "Sparepart", icon: Cpu, roles: SHOP_STAFF },
  { href: "/reports", label: "Laporan", icon: ChartColumn, roles: OWNER },
  { href: "/settings", label: "Pengaturan", icon: Settings, roles: OWNER },
];

const RECEIVE_UNIT: NavItem = {
  href: "/tickets/new",
  label: "Terima unit",
  icon: PackagePlus,
  roles: FRONT_DESK,
};

// Always on the mobile bottom bar; everything else sits behind "Lainnya".
const BOTTOM_BAR_HREFS = new Set(["/dashboard", "/tickets"]);

export function navItemsFor(role: UserRole) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/** The main action, or null for roles that cannot take in a unit. */
export function receiveUnitFor(role: UserRole) {
  return RECEIVE_UNIT.roles.includes(role) ? RECEIVE_UNIT : null;
}

export function bottomBarItemsFor(role: UserRole) {
  const items = navItemsFor(role);
  const more = items.filter((item) => !BOTTOM_BAR_HREFS.has(item.href));

  // A sheet holding one item only adds a tap: the technician's Sparepart.
  return more.length > 1
    ? { bar: items.filter((item) => BOTTOM_BAR_HREFS.has(item.href)), more }
    : { bar: items, more: [] };
}

/** The most specific href for a path, so /tickets/new is not also "Tiket". */
export function activeHref(pathname: string) {
  const matches = [...NAV_ITEMS, RECEIVE_UNIT]
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`));
  return matches.sort((a, b) => b.length - a.length)[0] ?? null;
}
