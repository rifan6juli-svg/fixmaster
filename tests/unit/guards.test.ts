import { describe, expect, it } from "vitest";
import { requireRole } from "@/server/auth/guards";

const technician = {
  tenantId: "tenant-1",
  userId: "user-1",
  role: "technician" as const,
};

describe("requireRole", () => {
  it("passes for an allowed role", () => {
    expect(() =>
      requireRole(technician, ["owner", "technician"]),
    ).not.toThrow();
  });

  it("rejects any other role with FORBIDDEN", () => {
    expect(() => requireRole(technician, ["owner", "admin"])).toThrow(
      expect.objectContaining({ code: "FORBIDDEN" }),
    );
  });
});
