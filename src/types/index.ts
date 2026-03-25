export interface FontFamily {
  name: string;
  source: "system" | "google" | "custom";
  weights: number[];
  googleUrl?: string; // full Google Fonts stylesheet URL for re-injection
}

export interface TypographyStyle {
  element: string; // 'h1', 'h2', 'p', etc.
  label: string; // human-readable label
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  color: string;
  textTransform: string;
  sampleText: string; // actual text found on page, or fallback
}

export interface ColorInfo {
  hex: string;
  rgb: string; // "rgb(r, g, b)"
  hsl: [number, number, number]; // [h, s, l]
  usageCount: number;
  contexts: string[]; // 'text', 'background', 'border', 'stylesheet'
  varNames: string[]; // CSS custom property names that resolve to this color, e.g. ["--color-sand"]
}

export interface CuratedColor {
  role: string; // inferred semantic role: 'Primary', 'Secondary', 'Accent', 'Neutral', 'Success', 'Warning', 'Danger'
  name: string; // display name: from CSS var if available (e.g. "Beetroot"), otherwise same as role
  color: ColorInfo;
}

export interface ButtonStyle {
  sampleLabel: string;
  backgroundColor: string;
  color: string;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  boxShadow: string;
  textTransform: string;
}

export interface LinkStyle {
  color: string;
  textDecoration: string;
  fontWeight: string;
  fontSize: string;
  fontFamily: string;
  sampleText: string;
}

export interface SpacingToken {
  value: string; // e.g. "16px"
  px: number;
  usageCount: number;
}

export interface BorderRadiusToken {
  value: string; // e.g. "8px" or "50%"
  usageCount: number;
  varName?: string; // CSS variable name if found, e.g. "--radius-lg"
}

export interface ShadowToken {
  value: string;
  usageCount: number;
  varName?: string; // CSS variable name if found, e.g. "--shadow-card"
}

/** A semantic color token that maps a purpose to a base color */
export interface ColorToken {
  varName: string;       // "--color-heading"
  displayName: string;   // "Heading"
  referencesVar: string; // "--color-navy"
  referencesName: string; // "Navy"
  hex: string;           // resolved hex value
}

export interface ExtractedStyles {
  site: {
    title: string;
    url: string;
    favicon: string;
    thumbnail?: string; // data-URL screenshot of the visible tab
    extractedAt: string;
  };
  fonts: FontFamily[];
  typography: TypographyStyle[];
  colors: {
    curated: CuratedColor[];
    all: ColorInfo[];
  };
  colorTokens: ColorToken[];
  buttons: ButtonStyle[];
  links: LinkStyle[];
  spacing: SpacingToken[];
  borderRadius: BorderRadiusToken[];
  shadows: ShadowToken[];
}

// Message types for extension communication
export type Message =
  | { type: "EXTRACT_STYLES" }
  | { type: "FETCH_STYLESHEETS"; urls: string[] }
  | { type: "STYLES_EXTRACTED"; data: ExtractedStyles }
  | { type: "EXTRACTION_ERROR"; error: string };

export type MessageResponse =
  | { success: true; data: ExtractedStyles }
  | { success: false; error: string }
  | { sheets: Array<{ url: string; text: string | null }> };
