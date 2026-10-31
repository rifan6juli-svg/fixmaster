import { describe, expect, it } from "vitest";
import { parsePage } from "@/lib/pagination";

describe("parsePage", () => {
  it("reads a page number", () => {
    expect(parsePage("3")).toBe(3);
  });

  it.each([[undefined], [""], ["0"], ["-1"], ["2.5"], ["abc"], [["2", "3"]]])(
    "falls back to the first page for %j",
    (value) => {
      expect(parsePage(value)).toBe(1);
    },
  );
});
