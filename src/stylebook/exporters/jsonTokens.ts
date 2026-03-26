import type { ExtractedStyles } from "../../types";
import { formatVarName } from "../../utils/colorUtils";

/**
 * Export as W3C Design Tokens Community Group format (compatible with
 * Style Dictionary, Figma Tokens plugin, and most token pipelines).
 */
export function exportJSONTokens(data: ExtractedStyles): string {
  const tokens: Record<string, unknown> = {
    $description: `Design tokens extracted from ${data.site.title} (${data.site.url})`,
    $metadata: {
      source: data.site.url,
      extractedAt: data.site.extractedAt,
      generator: "BacktraceDesign",
    },

    color: buildColorTokens(data),
    typography: buildTypographyTokens(data),
    spacing: buildSpacingTokens(data),
    borderRadius: buildBorderRadiusTokens(data),
    shadow: buildShadowTokens(data),
  };

  return JSON.stringify(tokens, null, 2);
}

function buildColorTokens(data: ExtractedStyles) {
  const colors: Record<string, unknown> = {};

  // Base colors
  for (const c of data.colors.all) {
    const name = c.varNames.length > 0
      ? formatVarName(c.varNames[0])
      : c.hex.replace("#", "");
    const key = slugify(name);
    colors[key] = {
      $type: "color",
      $value: c.hex,
      ...(c.varNames.length > 0 && { $extensions: { cssVar: c.varNames[0] } }),
    };
  }

  // Semantic tokens (aliases)
  if (data.colorTokens.length > 0) {
    const semantic: Record<string, unknown> = {};
    for (const t of data.colorTokens) {
      const key = slugify(t.displayName);
      semantic[key] = {
        $type: "color",
        $value: `{color.${slugify(t.referencesName)}}`,
        $description: `${t.displayName} — uses ${t.referencesName}`,
        $extensions: { cssVar: t.varName, references: t.referencesVar },
      };
    }
    colors.$semantic = semantic;
  }

  return colors;
}

function buildTypographyTokens(data: ExtractedStyles) {
  const typo: Record<string, unknown> = {};
  for (const t of data.typography) {
    const key = slugify(t.label);
    typo[key] = {
      $type: "typography",
      $value: {
        fontFamily: t.fontFamily.split(",")[0].trim().replace(/['"]/g, ""),
        fontSize: t.fontSize,
        fontWeight: t.fontWeight,
        lineHeight: t.lineHeight,
        letterSpacing: t.letterSpacing,
        textTransform: t.textTransform,
      },
    };
  }
  return typo;
}

function buildSpacingTokens(data: ExtractedStyles) {
  const spacing: Record<string, unknown> = {};
  for (const s of data.spacing) {
    const key = Number.isInteger(s.px) ? String(s.px) : String(s.px).replace(".", "-");
    spacing[`space-${key}`] = {
      $type: "dimension",
      $value: s.value,
    };
  }
  return spacing;
}

function buildBorderRadiusTokens(data: ExtractedStyles) {
  const radii: Record<string, unknown> = {};
  for (const r of data.borderRadius) {
    const key = r.varName ? slugify(formatVarName(r.varName)) : `radius-${r.value.replace(/\s/g, "-")}`;
    radii[key] = {
      $type: "dimension",
      $value: r.value,
      ...(r.varName && { $extensions: { cssVar: r.varName } }),
    };
  }
  return radii;
}

function buildShadowTokens(data: ExtractedStyles) {
  const shadows: Record<string, unknown> = {};
  for (let i = 0; i < data.shadows.length; i++) {
    const s = data.shadows[i];
    const key = s.varName ? slugify(formatVarName(s.varName)) : `shadow-${i + 1}`;
    shadows[key] = {
      $type: "shadow",
      $value: s.value,
      ...(s.varName && { $extensions: { cssVar: s.varName } }),
    };
  }
  return shadows;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
