import { useState } from "react";
import type { ColorInfo } from "../../types";
import { formatVarName } from "../../utils/colorUtils";
import Section from "./Section";

interface Props {
  colors: ColorInfo[];
}

export default function AllColors({ colors }: Props) {
  const [expanded, setExpanded] = useState(false);
  if (!colors.length) return null;

  const visible = expanded ? colors : colors.slice(0, 48);

  return (
    <Section title="All Colors">
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {visible.map((c) => {
          const name =
            c.varNames.length > 0 ? formatVarName(c.varNames[0]) : null;

          return (
            <div key={c.hex} className="flex flex-col items-center gap-1.5">
              <div
                className="w-full aspect-square rounded-lg shadow-sm border border-black/10"
                style={{ backgroundColor: c.hex }}
              />
              <div className="text-center w-full">
                {name && (
                  <p className="text-[11px] font-medium text-gray-700 truncate">
                    {name}
                  </p>
                )}
                <p className="text-[10px] font-mono text-gray-500">
                  {c.hex.toUpperCase()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {colors.length > 48 && (
        <button
          className="mt-4 text-sm text-blue-600 hover:underline no-print"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Show less" : `Show all ${colors.length} colors`}
        </button>
      )}
    </Section>
  );
}
