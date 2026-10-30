import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps a DBD font size next to a DBD text color", () => {
    expect(cn("text-body-sm", "text-text-muted")).toBe(
      "text-body-sm text-text-muted",
    );
  });

  it("lets a later DBD font size override an earlier one", () => {
    expect(cn("text-body text-text", "text-h2")).toBe("text-text text-h2");
  });

  it("lets a later text color override an earlier one", () => {
    expect(cn("text-text", "text-danger")).toBe("text-danger");
  });
});
