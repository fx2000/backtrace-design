import type {
  ExtractedStyles,
  ButtonStyle,
  LinkStyle,
  SpacingToken,
  BorderRadiusToken,
  ShadowToken,
  TypographyStyle,
  FontFamily,
  ColorInfo,
} from "../types";
import {
  accumulateColor,
  extractColorsFromCSS,
  attachVarNamesToColors,
  inferPalette,
  parseColor,
  rgbToHex,
  formatVarName,
} from "../utils/colorUtils";
import {
  parseFontsFromCSS,
  collectCSSVars,
  extractAllCSSVarsFromText,
  mergeVarMaps,
  resolveVarReferences,
  detectGoogleFonts,
  mergeFonts,
} from "../utils/cssParser";
import type { ColorToken } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function px(val: string): number {
  return parseFloat(val) || 0;
}

function isVisible(el: Element): boolean {
  const s = window.getComputedStyle(el as HTMLElement);
  return s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0";
}

function sampleElements(max = 1500): Element[] {
  const all = document.querySelectorAll("*");
  const step = Math.max(1, Math.ceil(all.length / max));
  const result: Element[] = [];
  for (let i = 0; i < all.length; i += step) result.push(all[i]);
  return result;
}

// ─── Site Info ────────────────────────────────────────────────────────────────

function extractSiteInfo() {
  const favicon =
    (document.querySelector('link[rel~="icon"]') as HTMLLinkElement)?.href ??
    new URL("/favicon.ico", location.href).href;
  return {
    title: document.title || location.hostname,
    url: location.href,
    favicon,
    extractedAt: new Date().toISOString(),
  };
}

// ─── Typography ───────────────────────────────────────────────────────────────

function extractTypography(): TypographyStyle[] {
  const styles: TypographyStyle[] = [];
  const targets = [
    { selector: "h1", label: "Heading 1" },
    { selector: "h2", label: "Heading 2" },
    { selector: "h3", label: "Heading 3" },
    { selector: "h4", label: "Heading 4" },
    { selector: "h5", label: "Heading 5" },
    { selector: "h6", label: "Heading 6" },
    { selector: "p", label: "Body" },
    { selector: "small", label: "Small" },
    { selector: "label", label: "Label" },
    { selector: "caption", label: "Caption" },
  ];

  for (const { selector, label } of targets) {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) continue;
    const s = window.getComputedStyle(el);
    styles.push({
      element: selector,
      label,
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      color: s.color,
      textTransform: s.textTransform,
      sampleText: el.innerText?.trim().slice(0, 120) || label + " sample text",
    });
  }

  return styles;
}

// ─── Fonts ────────────────────────────────────────────────────────────────────

function extractFontsFromDOM(): string[] {
  const names = new Set<string>();
  for (const el of sampleElements(800)) {
    const ff = window.getComputedStyle(el as HTMLElement).fontFamily;
    ff.split(",").forEach((f) => names.add(f.trim().replace(/['"]/g, "")));
  }
  return [...names].filter(Boolean);
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const COLOR_PROPS = [
  { prop: "color", ctx: "text" },
  { prop: "backgroundColor", ctx: "background" },
  { prop: "borderColor", ctx: "border" },
  { prop: "outlineColor", ctx: "border" },
  { prop: "textDecorationColor", ctx: "text" },
];

function extractColorsFromDOM(acc: Map<string, ColorInfo>): void {
  for (const el of sampleElements()) {
    if (!isVisible(el)) continue;
    const s = window.getComputedStyle(el as HTMLElement);
    for (const { prop, ctx } of COLOR_PROPS) {
      accumulateColor(s.getPropertyValue(prop), ctx, acc);
    }
  }
}

function extractColorsFromStylesheets(acc: Map<string, ColorInfo>): void {
  for (const sheet of document.styleSheets) {
    try {
      const rules = sheet.cssRules;
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule || rule instanceof CSSMediaRule) {
          extractColorsFromCSS(rule.cssText, acc);
        }
      }
    } catch {
      // cross-origin — handled separately
    }
  }
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

function extractButtons(): ButtonStyle[] {
  const selectors = [
    "button",
    '[role="button"]',
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="reset"]',
    "a.btn",
    "[class*='btn']",
    "[class*='button']",
  ];

  const buttons: ButtonStyle[] = [];
  const seen = new Set<string>();

  for (const sel of selectors) {
    try {
      document.querySelectorAll(sel).forEach((el) => {
        if (!isVisible(el)) return;
        const s = window.getComputedStyle(el as HTMLElement);
        const key = `${s.backgroundColor}|${s.color}|${s.borderColor}`;
        if (seen.has(key)) return;
        seen.add(key);
        buttons.push({
          sampleLabel:
            (el as HTMLElement).innerText?.trim().slice(0, 30) || "Button",
          backgroundColor: s.backgroundColor,
          color: s.color,
          borderColor: s.borderColor,
          borderWidth: s.borderWidth,
          borderRadius: s.borderRadius,
          paddingTop: s.paddingTop,
          paddingRight: s.paddingRight,
          paddingBottom: s.paddingBottom,
          paddingLeft: s.paddingLeft,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          fontFamily: s.fontFamily,
          boxShadow: s.boxShadow,
          textTransform: s.textTransform,
        });
      });
    } catch {
      // ignore invalid selectors
    }
  }

  return buttons.slice(0, 12);
}

// ─── Links ────────────────────────────────────────────────────────────────────

function extractLinks(): LinkStyle[] {
  const links: LinkStyle[] = [];
  const seen = new Set<string>();

  document.querySelectorAll("a").forEach((el) => {
    if (!isVisible(el) || !el.href) return;
    const s = window.getComputedStyle(el as HTMLElement);
    const key = `${s.color}|${s.textDecoration}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({
      color: s.color,
      textDecoration: s.textDecoration,
      fontWeight: s.fontWeight,
      fontSize: s.fontSize,
      fontFamily: s.fontFamily,
      sampleText: el.innerText?.trim().slice(0, 60) || "Example link",
    });
  });

  return links.slice(0, 6);
}

// ─── Spacing ─────────────────────────────────────────────────────────────────

function extractSpacing(): SpacingToken[] {
  const spacingMap = new Map<number, SpacingToken>();
  const SPACING_PROPS = ["marginTop", "marginBottom", "paddingTop", "paddingBottom", "gap"];

  for (const el of sampleElements(600)) {
    const s = window.getComputedStyle(el as HTMLElement);
    for (const prop of SPACING_PROPS) {
      const val = s.getPropertyValue(prop);
      const n = px(val);
      if (n > 0 && n <= 200) {
        const existing = spacingMap.get(n);
        spacingMap.set(n, {
          value: `${n}px`,
          px: n,
          usageCount: (existing?.usageCount ?? 0) + 1,
        });
      }
    }
  }

  return [...spacingMap.values()]
    .sort((a, b) => a.px - b.px)
    .filter((t) => t.usageCount >= 3)
    .slice(0, 16);
}

// ─── Border Radius ───────────────────────────────────────────────────────────

function extractBorderRadius(): BorderRadiusToken[] {
  const map = new Map<string, BorderRadiusToken>();

  for (const el of sampleElements(600)) {
    const s = window.getComputedStyle(el as HTMLElement);
    const val = s.borderRadius;
    if (!val || val === "0px") continue;
    const existing = map.get(val);
    map.set(val, {
      value: val,
      usageCount: (existing?.usageCount ?? 0) + 1,
    });
  }

  return [...map.values()]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);
}

// ─── Shadows ─────────────────────────────────────────────────────────────────

function extractShadows(): ShadowToken[] {
  const map = new Map<string, ShadowToken>();

  for (const el of sampleElements(600)) {
    const s = window.getComputedStyle(el as HTMLElement);
    const val = s.boxShadow;
    if (!val || val === "none") continue;
    const existing = map.get(val);
    map.set(val, {
      value: val,
      usageCount: (existing?.usageCount ?? 0) + 1,
    });
  }

  return [...map.values()]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 8);
}

// ─── Cross-origin stylesheets ────────────────────────────────────────────────

function getCrossOriginStylesheetUrls(): string[] {
  const urls: string[] = [];
  for (const sheet of document.styleSheets) {
    if (!sheet.href) continue;
    try {
      void sheet.cssRules; // throws if cross-origin
    } catch {
      urls.push(sheet.href);
    }
  }
  return urls;
}

// ─── Var-name attachment for shadows and border radii ────────────────────────

/**
 * Browsers reorder box-shadow components: CSS `0 2px 4px rgba(0,0,0,.1)`
 * becomes `rgba(0, 0, 0, 0.1) 0px 2px 4px 0px` in computed style.
 * We extract just the pixel offset values (x, y, blur) as a signature.
 */
function shadowSignature(value: string): string {
  // Remove color function content so its numbers don't pollute the signature
  const noColor = value.replace(/(?:rgba?|hsla?|color)\([^)]*\)/gi, "");
  const nums = noColor.match(/-?[\d.]+(?=px)/g) ?? [];
  return nums.slice(0, 3).join(",");
}

function attachVarNamesToShadows(
  shadows: ShadowToken[],
  varMap: Map<string, string>
): void {
  for (const shadow of shadows) {
    if (shadow.varName) continue;
    const computedSig = shadowSignature(shadow.value);
    if (!computedSig) continue;

    for (const [varName, varValue] of varMap) {
      if (!/shadow/i.test(varName)) continue;
      if (shadowSignature(varValue) === computedSig) {
        shadow.varName = varName;
        break;
      }
    }
  }
}

function attachVarNamesToRadii(
  radii: BorderRadiusToken[],
  varMap: Map<string, string>
): void {
  for (const token of radii) {
    if (token.varName) continue;
    const normalizedComputed = token.value.replace(/\s+/g, "");

    for (const [varName, varValue] of varMap) {
      if (!/radius|rounded/i.test(varName)) continue;
      // Normalize and compare — also convert rem to px assuming 16px root
      const normalized = varValue
        .replace(/\s+/g, "")
        .replace(/([\d.]+)rem/g, (_, n) => `${Math.round(parseFloat(n) * 16)}px`);

      if (normalized === normalizedComputed) {
        token.varName = varName;
        break;
      }
    }
  }
}

// ─── Main extraction ─────────────────────────────────────────────────────────

async function extractStyles(): Promise<ExtractedStyles> {
  const colorAcc = new Map<string, ColorInfo>();

  // Collect CSS variables (resolved values + token references)
  const { resolved: varMap, tokenRefs } = collectCSSVars();

  // DOM-level extraction
  extractColorsFromDOM(colorAcc);
  extractColorsFromStylesheets(colorAcc);

  const domFontNames = extractFontsFromDOM();
  const googleFonts = detectGoogleFonts();
  const typography = extractTypography();
  const buttons = extractButtons();
  const links = extractLinks();
  const spacing = extractSpacing();
  const borderRadius = extractBorderRadius();
  const shadows = extractShadows();

  // Fetch cross-origin stylesheets via background (bypasses CORS)
  const crossOriginUrls = getCrossOriginStylesheetUrls();
  if (crossOriginUrls.length > 0) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "FETCH_STYLESHEETS",
        urls: crossOriginUrls,
      });
      if (response?.sheets) {
        for (const { text } of response.sheets as Array<{ url: string; text: string | null }>) {
          if (text) {
            extractColorsFromCSS(text, colorAcc);
            mergeVarMaps(varMap, extractAllCSSVarsFromText(text));
            const fontNames = parseFontsFromCSS(text);
            for (const name of fontNames) domFontNames.push(name);
          }
        }
      }
    } catch {
      // background fetch failed — continue with what we have
    }
  }

  // Resolve any remaining var() references in cross-origin vars
  resolveVarReferences(varMap);

  // Build a set of token var names (semantic aliases like --color-heading)
  // so we can exclude them from ColorInfo.varNames (which should only have base names)
  const tokenVarNames = new Set(tokenRefs.map((t) => t.varName));

  // Attach only base color var names (not token aliases) to color entries
  attachVarNamesToColors(colorAcc, varMap, tokenVarNames);
  attachVarNamesToShadows(shadows, varMap);
  attachVarNamesToRadii(borderRadius, varMap);

  // Build color tokens from var references (--color-heading: var(--color-navy))
  const colorTokens: ColorToken[] = [];
  for (const { varName, referencedVar } of tokenRefs) {
    const resolvedValue = varMap.get(varName);
    if (!resolvedValue) continue;
    const rgb = parseColor(resolvedValue);
    if (!rgb) continue;
    colorTokens.push({
      varName,
      displayName: formatVarName(varName),
      referencesVar: referencedVar,
      referencesName: formatVarName(referencedVar),
      hex: rgbToHex(...rgb),
    });
  }

  // Assemble colors
  const allColors = [...colorAcc.values()]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 200);

  const curated = inferPalette(allColors);

  // Assemble fonts
  const fonts: FontFamily[] = mergeFonts(
    googleFonts,
    domFontNames.map((n) => n)
  );

  return {
    site: extractSiteInfo(),
    fonts,
    typography,
    colors: { curated, all: allColors },
    colorTokens,
    buttons,
    links,
    spacing,
    borderRadius,
    shadows,
  };
}

// ─── Message listener (guarded against duplicate registration) ────────────────

const _win = self as unknown as { __backtraceDesignLoaded?: boolean };
if (!_win.__backtraceDesignLoaded) {
  _win.__backtraceDesignLoaded = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "EXTRACT_STYLES") {
      extractStyles()
        .then((data) => sendResponse({ success: true, data }))
        .catch((err) =>
          sendResponse({ success: false, error: String(err) })
        );
      return true; // keep channel open for async response
    }
  });
}
