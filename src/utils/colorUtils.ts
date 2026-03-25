import type { ColorInfo, CuratedColor } from "../types";

/** Parse any CSS color string into [r, g, b] (0-255) or null */
export function parseColor(css: string): [number, number, number] | null {
  const s = css.trim().toLowerCase();

  // rgba / rgb
  const rgbaMatch = s.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)$/
  );
  if (rgbaMatch) {
    return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
  }

  // hex #rrggbb or #rgb
  const hex6 = s.match(/^#([0-9a-f]{6})$/);
  if (hex6) {
    const v = parseInt(hex6[1], 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  const hex3 = s.match(/^#([0-9a-f]{3})$/);
  if (hex3) {
    const [r, g, b] = hex3[1].split("").map((c) => parseInt(c + c, 16));
    return [r, g, b];
  }

  // hsl / hsla
  const hslMatch = s.match(
    /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*[\d.]+)?\s*\)$/
  );
  if (hslMatch) {
    return hslToRgb(parseFloat(hslMatch[1]), parseFloat(hslMatch[2]), parseFloat(hslMatch[3]));
  }

  return null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.round(x).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

/** Build a ColorInfo record from raw RGB */
export function makeColorInfo(
  r: number,
  g: number,
  b: number,
  context: string,
  existing?: ColorInfo
): ColorInfo {
  const hex = rgbToHex(r, g, b);
  const hsl = rgbToHsl(r, g, b);
  if (existing) {
    return {
      ...existing,
      usageCount: existing.usageCount + 1,
      contexts: existing.contexts.includes(context)
        ? existing.contexts
        : [...existing.contexts, context],
    };
  }
  return {
    hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl,
    usageCount: 1,
    contexts: [context],
    varNames: [],
  };
}

function isTransparent(css: string): boolean {
  const s = css.trim().toLowerCase();
  if (s === "transparent" || s === "rgba(0, 0, 0, 0)") return true;
  const rgbaMatch = s.match(/^rgba\([\d\s,]+,\s*([\d.]+)\s*\)$/);
  if (rgbaMatch && parseFloat(rgbaMatch[1]) === 0) return true;
  return false;
}

/** Add a CSS color string to the accumulator map (keyed by hex) */
export function accumulateColor(
  css: string,
  context: string,
  acc: Map<string, ColorInfo>
): void {
  if (!css || isTransparent(css)) return;
  const rgb = parseColor(css);
  if (!rgb) return;
  const hex = rgbToHex(...rgb);
  acc.set(hex, makeColorInfo(rgb[0], rgb[1], rgb[2], context, acc.get(hex)));
}

/** Parse all color-like values from a raw CSS text block */
export function extractColorsFromCSS(
  cssText: string,
  acc: Map<string, ColorInfo>
): void {
  // hex colors
  for (const match of cssText.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
    accumulateColor(match[0], "stylesheet", acc);
  }
  // rgb/rgba/hsl/hsla
  for (const match of cssText.matchAll(/(?:rgba?|hsla?)\([^)]+\)/g)) {
    accumulateColor(match[0], "stylesheet", acc);
  }
}

/**
 * Attach CSS variable names to matching entries in the color accumulator.
 * Call this after all colors have been collected.
 * varMap is a Map of --var-name → resolved CSS value.
 * tokenVarNames is the set of var names that are semantic tokens (var() references) —
 * these are excluded so that ColorInfo.varNames only contains base color names
 * (e.g. "--color-rosewood") and not token aliases (e.g. "--color-heading").
 */
export function attachVarNamesToColors(
  colorAcc: Map<string, ColorInfo>,
  varMap: Map<string, string>,
  tokenVarNames?: Set<string>
): void {
  for (const [varName, rawValue] of varMap) {
    if (tokenVarNames?.has(varName)) continue;
    const rgb = parseColor(rawValue.trim());
    if (!rgb) continue;
    const hex = rgbToHex(...rgb);
    const existing = colorAcc.get(hex);
    if (existing && !existing.varNames.includes(varName)) {
      existing.varNames.push(varName);
    }
  }
}

// ─── Var name formatting ──────────────────────────────────────────────────────

// Common prefixes that don't add meaning to the display name
const STRIP_PREFIXES = [
  "color", "colour", "clr", "col",
  "bg", "background",
  "fg", "foreground", "text",
  "shadow", "box-shadow",
  "radius", "rounded", "border-radius",
  "font", "typeface",
  "spacing", "space", "gap",
  "brand", "theme",
];

/**
 * Convert a CSS variable name to a human-readable display name.
 *
 * Smart stripping: if the name contains a well-known category separator like
 * "color--", "shadow--", "font--", strip everything up to and including
 * the LAST occurrence. This handles library prefixes cleanly:
 *   "--wp-preset--color--white"  → "White"
 *   "--wp-preset--font-size--large" → "Large"
 *   "--color-sand"               → "Sand"
 *   "--shadow-card-hover"        → "Card Hover"
 */
export function formatVarName(varName: string): string {
  // Remove -- prefix
  let name = varName.replace(/^--/, "");

  // Step 1: if the name uses double-dash separators (e.g. WordPress "preset--color--white"),
  // find the last known category keyword followed by -- and take everything after it.
  const categoryPattern = /(?:color|colour|clr|shadow|font-size|font|radius|rounded|spacing|gap)--/gi;
  let lastCategoryEnd = -1;
  let match: RegExpExecArray | null;
  while ((match = categoryPattern.exec(name)) !== null) {
    lastCategoryEnd = match.index + match[0].length;
  }
  if (lastCategoryEnd > 0) {
    name = name.slice(lastCategoryEnd);
  } else {
    // Step 2: fall back to stripping a single-dash prefix ("color-sand" → "sand")
    for (const prefix of STRIP_PREFIXES) {
      const pat = new RegExp(`^${prefix}[-_]`);
      if (pat.test(name)) {
        name = name.replace(pat, "");
        break;
      }
    }
  }

  // Convert kebab/snake to Title Case words
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ─── Contrast utilities ───────────────────────────────────────────────────────

/** Relative luminance per WCAG 2.x (0 = black, 1 = white) */
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** WCAG contrast ratio between two colors (1 – 21) */
export function contrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const l1 = relativeLuminance(...rgb1);
  const l2 = relativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Given a foreground color (as CSS string), return an object with
 * the foreground color and a background that guarantees readable contrast
 * on our white (#ffffff) stylebook background.
 *
 * Returns { color, backgroundColor } — backgroundColor is undefined when
 * the text already has sufficient contrast against white.
 */
export function ensureReadableOnWhite(cssFg: string): {
  color: string;
  backgroundColor?: string;
} {
  const rgb = parseColor(cssFg);
  if (!rgb) return { color: cssFg };

  const WHITE: [number, number, number] = [255, 255, 255];
  const ratio = contrastRatio(rgb, WHITE);

  // WCAG AA large text = 3:1, normal text = 4.5:1. Use 3 as threshold
  // since headings are large.
  if (ratio >= 3) return { color: cssFg };

  // Not enough contrast on white — render with the original color as background
  // and pick white or dark text on top of it.
  const BLACK: [number, number, number] = [17, 24, 39]; // gray-900
  const onLight = contrastRatio(BLACK, rgb);
  const onDark = contrastRatio(WHITE, rgb);
  const textOnSwatch = onLight >= onDark ? "#111827" : "#ffffff";

  return {
    color: textOnSwatch,
    backgroundColor: cssFg,
  };
}

// ─── Palette Inference ────────────────────────────────────────────────────────

const SEMANTIC_HUES: Array<{ role: string; hueMin: number; hueMax: number }> = [
  { role: "Danger", hueMin: 0, hueMax: 15 },
  { role: "Warning", hueMin: 30, hueMax: 55 },
  { role: "Success", hueMin: 100, hueMax: 165 },
];

function bestVarName(color: ColorInfo): string | null {
  if (!color.varNames.length) return null;
  // Prefer vars that look like color names (contain "color", "clr", "brand", or no structural prefix)
  const preferred = color.varNames.find((v) =>
    /--(?:color|clr|brand|palette|theme)-/.test(v)
  );
  return preferred ?? color.varNames[0];
}

export function inferPalette(colors: ColorInfo[]): CuratedColor[] {
  const chromatic = colors.filter(
    (c) => c.hsl[1] >= 15 && c.hsl[2] >= 5 && c.hsl[2] <= 95
  );
  const neutrals = colors.filter(
    (c) => c.hsl[1] < 15 && c.hsl[2] >= 5 && c.hsl[2] <= 95
  );

  const palette: CuratedColor[] = [];
  const usedHexes = new Set<string>();

  const makeEntry = (role: string, color: ColorInfo): CuratedColor => {
    const varName = bestVarName(color);
    const name = varName ? formatVarName(varName) : role;
    return { role, name, color };
  };

  // Neutrals: pick the most-used neutral
  if (neutrals.length) {
    const top = neutrals.sort((a, b) => b.usageCount - a.usageCount)[0];
    palette.push(makeEntry("Neutral", top));
    usedHexes.add(top.hex);
  }

  // Semantic colors: check if any chromatic color falls in semantic hue ranges
  for (const sem of SEMANTIC_HUES) {
    const matches = chromatic.filter(
      (c) =>
        !usedHexes.has(c.hex) &&
        c.hsl[0] >= sem.hueMin &&
        c.hsl[0] <= sem.hueMax
    );
    if (matches.length) {
      const best = matches.sort((a, b) => b.usageCount - a.usageCount)[0];
      palette.push(makeEntry(sem.role, best));
      usedHexes.add(best.hex);
    }
  }

  // Primary / Secondary / Accent: cluster remaining by hue buckets
  const remaining = chromatic.filter((c) => !usedHexes.has(c.hex));
  const buckets = new Map<number, ColorInfo[]>();
  for (const c of remaining) {
    const bucket = Math.floor(c.hsl[0] / 30) * 30;
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket)!.push(c);
  }

  const bucketsSorted = [...buckets.entries()]
    .map(([hue, cols]) => ({
      hue,
      representative: cols.sort((a, b) => b.usageCount - a.usageCount)[0],
      totalUsage: cols.reduce((s, c) => s + c.usageCount, 0),
    }))
    .sort((a, b) => b.totalUsage - a.totalUsage);

  const roles = ["Primary", "Secondary", "Accent"];
  for (let i = 0; i < Math.min(bucketsSorted.length, roles.length); i++) {
    const { representative } = bucketsSorted[i];
    if (!usedHexes.has(representative.hex)) {
      palette.push(makeEntry(roles[i], representative));
      usedHexes.add(representative.hex);
    }
  }

  return palette;
}
