import type { FontFamily } from "../types";

/** Extract @font-face and Google Fonts info from raw CSS text */
export function parseFontsFromCSS(cssText: string): string[] {
  const names: string[] = [];
  for (const match of cssText.matchAll(
    /font-family\s*:\s*["']?([^"',;{}]+)["']?/gi
  )) {
    const name = match[1].trim().replace(/['"]/g, "");
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

/**
 * Extract ALL CSS custom property declarations from raw CSS text.
 * Returns a Map of --var-name → raw value string (including var() references).
 * Used for cross-origin stylesheets that had to be fetched as text.
 */
export function extractAllCSSVarsFromText(cssText: string): Map<string, string> {
  const vars = new Map<string, string>();
  for (const match of cssText.matchAll(/--([\w-]+)\s*:\s*([^;{}]+)/g)) {
    const name = `--${match[1]}`;
    const value = match[2].trim();
    if (value) vars.set(name, value);
  }
  return vars;
}

/** Token reference: a CSS var whose raw value points to another var */
export interface VarTokenRef {
  varName: string;      // "--color-heading"
  referencedVar: string; // "--color-navy"
}

export interface CSSVarCollection {
  /** All vars → their browser-resolved computed values */
  resolved: Map<string, string>;
  /** Vars whose raw value is `var(--other)` — semantic token mappings */
  tokenRefs: VarTokenRef[];
}

/**
 * Collect ALL CSS custom property names + raw values from accessible stylesheets
 * AND inline style attributes, then resolve each to its computed value.
 *
 * Returns both the resolved map (for color matching) and the token reference
 * list (for building the Color Tokens section).
 */
export function collectCSSVars(): CSSVarCollection {
  // name → raw CSS value (may be "var(--other)" or a direct color)
  const rawEntries = new Map<string, string>();
  const inlineElements: Element[] = [];

  // 1. Collect from stylesheet rules
  for (const sheet of document.styleSheets) {
    try {
      collectVarEntriesFromRuleList(sheet.cssRules, rawEntries);
    } catch {
      // cross-origin — fetched separately by background
    }
  }

  // 2. Collect from inline style attributes (e.g. WP design tokens on wrapper divs)
  document.querySelectorAll("[style]").forEach((el) => {
    const htmlEl = el as HTMLElement;
    let found = false;
    for (let i = 0; i < htmlEl.style.length; i++) {
      const prop = htmlEl.style[i];
      if (prop.startsWith("--")) {
        if (!rawEntries.has(prop)) {
          rawEntries.set(prop, htmlEl.style.getPropertyValue(prop).trim());
        }
        found = true;
      }
    }
    if (found) inlineElements.push(el);
  });

  // 3. Resolve each variable using getComputedStyle (browser resolves all var() chains)
  const resolved = new Map<string, string>();
  const contextElements = [document.documentElement, document.body, ...inlineElements];

  for (const name of rawEntries.keys()) {
    for (const el of contextElements) {
      const value = getComputedStyle(el).getPropertyValue(name).trim();
      if (value) {
        resolved.set(name, value);
        break;
      }
    }
  }

  // 3b. Fallback: for vars that getComputedStyle couldn't resolve (e.g. defined
  // on a specific selector like .theme-class rather than :root/body), use the
  // raw value directly if it's a concrete value (not a var() reference).
  for (const [name, raw] of rawEntries) {
    if (!resolved.has(name) && raw && !raw.startsWith("var(")) {
      resolved.set(name, raw);
    }
  }

  // 4. Build token refs from entries whose raw value is var(--something)
  const tokenRefs: VarTokenRef[] = [];
  for (const [name, raw] of rawEntries) {
    const match = raw.match(/^var\(\s*(--.+?)\s*(?:,.*)?\)$/);
    if (match) {
      tokenRefs.push({ varName: name, referencedVar: match[1] });
    }
  }

  return { resolved, tokenRefs };
}

function collectVarEntriesFromRuleList(
  rules: CSSRuleList,
  entries: Map<string, string>
): void {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) {
      for (let i = 0; i < rule.style.length; i++) {
        const prop = rule.style[i];
        if (prop.startsWith("--") && !entries.has(prop)) {
          entries.set(prop, rule.style.getPropertyValue(prop).trim());
        }
      }
    } else if (
      rule instanceof CSSMediaRule ||
      rule instanceof CSSSupportsRule
    ) {
      collectVarEntriesFromRuleList(rule.cssRules, entries);
    }
  }
}

/**
 * Merge a text-extracted var map into an existing one.
 * Existing entries are not overwritten (browser-resolved values take precedence).
 */
export function mergeVarMaps(
  target: Map<string, string>,
  source: Map<string, string>
): void {
  for (const [k, v] of source) {
    if (!target.has(k)) target.set(k, v);
  }
}

/**
 * Resolve var() references in a var map using values already present in the map.
 * Call this after merging all sources so cross-references can be resolved.
 *
 *   --color-heading: var(--color-navy)
 *   --color-navy: #1a2b3c
 *   → --color-heading: #1a2b3c
 */
export function resolveVarReferences(vars: Map<string, string>): void {
  // Multiple passes to handle chained references (A → B → C)
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    for (const [name, value] of vars) {
      const match = value.match(/^var\(\s*(--.+?)\s*(?:,.*)?\)$/);
      if (match) {
        const referenced = vars.get(match[1]);
        if (referenced && !referenced.startsWith("var(")) {
          vars.set(name, referenced);
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
}

/** Parse Google Fonts URLs from <link> tags in document */
export function detectGoogleFonts(): FontFamily[] {
  const fonts: FontFamily[] = [];
  document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach((el) => {
    const href = (el as HTMLLinkElement).href;
    const familyParam = new URL(href).searchParams.get("family");
    if (!familyParam) return;
    for (const part of familyParam.split("|")) {
      const [rawName, weightPart] = part.split(":");
      const name = rawName.replace(/\+/g, " ");
      const weights = weightPart
        ? weightPart
            .replace(/wght@/, "")
            .split(";")
            .map((w) => parseInt(w))
            .filter(Boolean)
        : [400];
      fonts.push({ name, source: "google", weights, googleUrl: href });
    }
  });
  return fonts;
}

/** Merge font arrays, deduplicating by name */
export function mergeFonts(
  ...groups: (FontFamily | string)[][]
): FontFamily[] {
  const map = new Map<string, FontFamily>();

  for (const group of groups) {
    for (const item of group) {
      if (typeof item === "string") {
        const name = item.replace(/['"]/g, "").trim();
        if (!name || name === "inherit" || name === "initial") continue;
        const source = isSystemFont(name) ? "system" : "custom";
        if (!map.has(name)) map.set(name, { name, source, weights: [400] });
      } else {
        const existing = map.get(item.name);
        if (existing) {
          map.set(item.name, {
            ...existing,
            weights: [...new Set([...existing.weights, ...item.weights])],
            googleUrl: existing.googleUrl ?? item.googleUrl,
            source: item.source === "google" ? "google" : existing.source,
          });
        } else {
          map.set(item.name, item);
        }
      }
    }
  }

  return [...map.values()];
}

const SYSTEM_FONTS = new Set([
  "arial",
  "helvetica",
  "helvetica neue",
  "georgia",
  "times",
  "times new roman",
  "courier",
  "courier new",
  "verdana",
  "trebuchet ms",
  "tahoma",
  "impact",
  "comic sans ms",
  "palatino",
  "garamond",
  "bookman",
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "-apple-system",
  "blinkmacsystemfont",
  "segoe ui",
  "roboto",
  "oxygen",
  "ubuntu",
  "cantarell",
  "fira sans",
  "droid sans",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
]);

function isSystemFont(name: string): boolean {
  return SYSTEM_FONTS.has(name.toLowerCase());
}
