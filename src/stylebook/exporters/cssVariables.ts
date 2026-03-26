import type { ExtractedStyles } from "../../types";
import { formatVarName } from "../../utils/colorUtils";

/**
 * Export a clean .css file with all extracted tokens as CSS custom properties.
 */
export function exportCSSVariables(data: ExtractedStyles): string {
  const lines: string[] = [
    `/* ═══════════════════════════════════════════════════════════════`,
    `   Design Tokens — ${data.site.title}`,
    `   Source: ${data.site.url}`,
    `   Extracted: ${new Date(data.site.extractedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    `   Generator: BacktraceDesign`,
    `   ═══════════════════════════════════════════════════════════════ */`,
    ``,
    `:root {`,
  ];

  // ── Colors ──
  lines.push(`  /* ── Colors ─────────────────────────────────── */`);
  for (const c of data.colors.all) {
    const name = c.varNames.length > 0
      ? c.varNames[0]
      : `--color-${c.hex.replace("#", "")}`;
    const comment = c.varNames.length > 0
      ? formatVarName(c.varNames[0])
      : "";
    lines.push(`  ${name}: ${c.hex};${comment ? ` /* ${comment} */` : ""}`);
  }
  lines.push(``);

  // ── Semantic color tokens ──
  if (data.colorTokens.length > 0) {
    lines.push(`  /* ── Semantic Color Tokens ──────────────────── */`);
    for (const t of data.colorTokens) {
      lines.push(`  ${t.varName}: var(${t.referencesVar}); /* ${t.displayName} → ${t.referencesName} */`);
    }
    lines.push(``);
  }

  // ── Typography ──
  if (data.typography.length > 0) {
    lines.push(`  /* ── Typography ────────────────────────────── */`);
    for (const t of data.typography) {
      const prefix = `--font-${t.element}`;
      const family = t.fontFamily.split(",")[0].trim().replace(/['"]/g, "");
      lines.push(`  ${prefix}-family: ${family};`);
      lines.push(`  ${prefix}-size: ${t.fontSize};`);
      lines.push(`  ${prefix}-weight: ${t.fontWeight};`);
      lines.push(`  ${prefix}-line-height: ${t.lineHeight};`);
      if (t.letterSpacing && t.letterSpacing !== "normal") {
        lines.push(`  ${prefix}-letter-spacing: ${t.letterSpacing};`);
      }
      lines.push(``);
    }
  }

  // ── Spacing ──
  if (data.spacing.length > 0) {
    lines.push(`  /* ── Spacing ──────────────────────────────── */`);
    for (const s of data.spacing) {
      const key = Number.isInteger(s.px) ? String(s.px) : String(s.px).replace(".", "-");
      lines.push(`  --space-${key}: ${s.value};`);
    }
    lines.push(``);
  }

  // ── Border Radius ──
  if (data.borderRadius.length > 0) {
    lines.push(`  /* ── Border Radius ────────────────────────── */`);
    for (let i = 0; i < data.borderRadius.length; i++) {
      const r = data.borderRadius[i];
      const name = r.varName ?? `--radius-${i + 1}`;
      lines.push(`  ${name}: ${r.value};`);
    }
    lines.push(``);
  }

  // ── Shadows ──
  if (data.shadows.length > 0) {
    lines.push(`  /* ── Shadows ──────────────────────────────── */`);
    for (let i = 0; i < data.shadows.length; i++) {
      const s = data.shadows[i];
      const name = s.varName ?? `--shadow-${i + 1}`;
      lines.push(`  ${name}: ${s.value};`);
    }
    lines.push(``);
  }

  lines.push(`}`);
  return lines.join("\n");
}
