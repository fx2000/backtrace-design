import { useState } from "react";
import type { ColorToken } from "../../types";
import { parseColor, contrastRatio } from "../../utils/colorUtils";
import Section from "./Section";

interface Props {
  tokens: ColorToken[];
}

function contrastText(hex: string): string {
  const rgb = parseColor(hex);
  if (!rgb) return "#111827";
  const WHITE: [number, number, number] = [255, 255, 255];
  const BLACK: [number, number, number] = [17, 24, 39];
  return contrastRatio(WHITE, rgb) >= contrastRatio(BLACK, rgb)
    ? "#ffffff"
    : "#111827";
}

export default function ColorTokens({ tokens }: Props) {
  const [expanded, setExpanded] = useState(false);
  if (!tokens.length) return null;

  const visible = expanded ? tokens : tokens.slice(0, 24);

  return (
    <Section title="Color Tokens">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        {visible.map((t) => (
          <div
            key={t.varName}
            className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
          >
            {/* Color swatch */}
            <div
              className="w-8 h-8 rounded-md shrink-0 border border-black/10"
              style={{ backgroundColor: t.hex }}
            />

            {/* Token info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {t.displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                uses <span className="font-medium text-gray-700">{t.referencesName}</span>
                <span className="ml-2 font-mono text-gray-400">{t.hex.toUpperCase()}</span>
              </p>
            </div>

            {/* Inline preview pill */}
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: t.hex,
                color: contrastText(t.hex),
              }}
            >
              {t.referencesName}
            </span>
          </div>
        ))}
      </div>

      {tokens.length > 24 && (
        <button
          className="mt-4 text-sm text-blue-600 hover:underline no-print"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Show less" : `Show all ${tokens.length} tokens`}
        </button>
      )}
    </Section>
  );
}
