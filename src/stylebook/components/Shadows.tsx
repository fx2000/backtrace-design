import type { ShadowToken } from "../../types";
import { formatVarName } from "../../utils/colorUtils";
import Section from "./Section";

interface Props {
  shadows: ShadowToken[];
}

export default function Shadows({ shadows }: Props) {
  if (!shadows.length) return null;

  return (
    <Section title="Shadows">
      <div className="flex flex-wrap gap-8">
        {shadows.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div
              className="w-20 h-20 bg-white rounded-xl"
              style={{ boxShadow: s.value }}
            />
            <div className="text-center max-w-[140px]">
              {s.varName && (
                <p className="text-xs font-semibold text-gray-700 mb-0.5">
                  {formatVarName(s.varName)}
                </p>
              )}
              {s.varName && (
                <p className="text-[10px] font-mono text-blue-600 mb-1">{s.varName}</p>
              )}
              <p className="text-xs font-mono text-gray-500 break-all leading-relaxed">
                {s.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{s.usageCount}× used</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
