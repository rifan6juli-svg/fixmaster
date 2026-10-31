import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/logger";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("logger.error", () => {
  it("writes the error's name and code, never its message", () => {
    const write = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
    const error = new Error("Failed query, params: budi@toko.test", {
      cause: { code: "23505" },
    });

    logger.error("Unexpected action error", { tenantId: "tenant-1", error });

    const line = String(write.mock.calls[0]?.[0]);
    expect(JSON.parse(line)).toEqual({
      level: "error",
      message: "Unexpected action error",
      tenantId: "tenant-1",
      error: { name: "Error", code: "23505" },
    });
    expect(line).not.toContain("budi@toko.test");
  });
});
