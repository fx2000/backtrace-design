import type { BorderRadiusToken } from "../../types";
import { formatVarName } from "../../utils/colorUtils";
import Section from "./Section";

interface Props {
  borderRadius: BorderRadiusToken[];
}

export default function BorderRadius({ borderRadius }: Props) {
  if (!borderRadius.length) return null;

  return (
    <Section title="Border Radius">
      <div className="flex flex-wrap gap-6">
        {borderRadius.map((r) => (
          <div key={r.value} className="flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 bg-blue-100 border-2 border-blue-300"
              style={{ borderRadius: r.value }}
            />
            <div className="text-center">
              {r.varName && (
                <p className="text-xs font-semibold text-gray-700">
                  {formatVarName(r.varName)}
                </p>
              )}
              <p className="text-xs font-mono text-gray-600">{r.value}</p>
              {r.varName && (
                <p className="text-[10px] font-mono text-blue-600">{r.varName}</p>
              )}
              <p className="text-xs text-gray-500">{r.usageCount}× used</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
