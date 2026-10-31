import { describe, expect, it } from "vitest";
import {
  activeHref,
  bottomBarItemsFor,
  navItemsFor,
  receiveUnitFor,
} from "@/components/app-shell/nav-items";

const labels = (items: { label: string }[]) => items.map((item) => item.label);

describe("navItemsFor", () => {
  it("gives the owner every item", () => {
    expect(labels(navItemsFor("owner"))).toEqual([
      "Dashboard",
      "Tiket",
      "Pelanggan",
      "Sparepart",
      "Laporan",
      "Pengaturan",
    ]);
  });

  it("hides the owner items from an admin", () => {
    expect(labels(navItemsFor("admin"))).toEqual([
      "Dashboard",
      "Tiket",
      "Pelanggan",
      "Sparepart",
    ]);
  });

  it("hides customers from a technician", () => {
    expect(labels(navItemsFor("technician"))).toEqual([
      "Dashboard",
      "Tiket",
      "Sparepart",
    ]);
  });
});

describe("receiveUnitFor", () => {
  it.each(["owner", "admin"] as const)("offers it to %s", (role) => {
    expect(receiveUnitFor(role)?.href).toBe("/tickets/new");
  });

  it("does not offer it to a technician", () => {
    expect(receiveUnitFor("technician")).toBeNull();
  });
});

describe("bottomBarItemsFor", () => {
  it("keeps the two main items on the bar and the rest in the sheet", () => {
    const { bar, more } = bottomBarItemsFor("owner");

    expect(labels(bar)).toEqual(["Dashboard", "Tiket"]);
    expect(labels(more)).toEqual([
      "Pelanggan",
      "Sparepart",
      "Laporan",
      "Pengaturan",
    ]);
  });
});

describe("bottomBarItemsFor a technician", () => {
  it("skips the sheet when it would hold a single item", () => {
    const { bar, more } = bottomBarItemsFor("technician");

    expect(labels(bar)).toEqual(["Dashboard", "Tiket", "Sparepart"]);
    expect(more).toEqual([]);
  });
});

describe("activeHref", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/tickets", "/tickets"],
    ["/tickets/123", "/tickets"],
    ["/tickets/new", "/tickets/new"],
    ["/settings/staff", "/settings"],
    ["/parts/abc", "/parts"],
  ])("maps %s to %s", (pathname, href) => {
    expect(activeHref(pathname)).toBe(href);
  });

  it("does not match a path that only shares a prefix", () => {
    expect(activeHref("/ticketsomething")).toBeNull();
  });
});
