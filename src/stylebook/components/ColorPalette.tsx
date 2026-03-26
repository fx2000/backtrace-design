import type { CuratedColor } from "../../types";
import { parseColor, contrastRatio } from "../../utils/colorUtils";
import Section from "./Section";

interface Props {
  colors: CuratedColor[];
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

export default function ColorPalette({ colors }: Props) {
  if (!colors.length) return null;

  return (
    <Section title="Brand Palette">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {colors.map(({ role, name, color }) => (
          <div key={color.hex} className="flex flex-col gap-2">
            <div
              className="rounded-xl h-24 w-full shadow-inner flex items-end p-2"
              style={{ backgroundColor: color.hex }}
            >
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{ color: contrastText(color.hex) }}
              >
                {name}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{name}</p>

              {name !== role && (
                <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-gray-500 border border-gray-200 rounded px-1 py-0.5 mt-0.5">
                  {role}
                </span>
              )}

              <p className="text-xs font-mono text-gray-700 mt-1">{color.hex.toUpperCase()}</p>
              <p className="text-xs text-gray-500">{color.rgb}</p>
              <p className="text-xs text-gray-500">
                hsl({color.hsl[0]}, {color.hsl[1]}%, {color.hsl[2]}%)
              </p>

              {color.varNames.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {color.varNames.slice(0, 2).map((v) => (
                    <p key={v} className="text-[10px] font-mono text-blue-600 truncate" title={v}>
                      {v}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
