import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Guards the contrast claims in docs/DBD.md section 5 against token edits.
const css = readFileSync(
  new URL("../../src/styles/globals.css", import.meta.url),
  "utf8",
);
const [lightCss, darkCss] = css.split("@media (prefers-color-scheme: dark)");

function readTokens(block: string | undefined): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const [, name, hex] of (block ?? "").matchAll(
    /--fm-([a-z-]+):\s*(#[0-9a-f]{6})/g,
  )) {
    if (name && hex) tokens[name] = hex;
  }
  return tokens;
}

const light = readTokens(lightCss);
const dark = { ...light, ...readTokens(darkCss?.split("@theme")[0]) };

function channels(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function luminance(hex: string) {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}

// Tailwind `bg-x/12` is the token at 12% alpha, composited in sRGB.
function tint(hex: string, over: string, alpha = 0.12) {
  const fg = channels(hex);
  const bg = channels(over);
  return (
    "#" +
    fg
      .map((c, i) =>
        Math.round(c * alpha + bg[i]! * (1 - alpha))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

const BADGE_TONES = [
  "text-muted",
  "accent",
  "brand-text",
  "warning",
  "success",
  "danger",
];

describe.each([
  ["light", light],
  ["dark", dark],
] as const)("%s mode tokens", (_mode, t) => {
  const backgrounds = ["background", "surface"] as const;

  it.each(["text", "text-muted"])("%s is >= 4.5:1 on every surface", (fg) => {
    for (const bg of [...backgrounds, "surface-raised"]) {
      expect(contrast(t[fg]!, t[bg]!), `${fg} on ${bg}`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });

  it.each(BADGE_TONES)(
    "tinted %s badge text is >= 4.5:1 on background and surface",
    (tone) => {
      for (const bg of backgrounds) {
        const fill = tint(t[tone]!, t[bg]!);
        expect(
          contrast(t[tone]!, fill),
          `${tone} on 12% tint over ${bg}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it("solid in-progress badge (on-primary on primary) is >= 4.5:1", () => {
    expect(contrast(t["on-primary"]!, t.primary!)).toBeGreaterThanOrEqual(4.5);
  });

  it("readout text is >= 4.5:1 on readout background", () => {
    expect(
      contrast(t["readout-text"]!, t["readout-bg"]!),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
