import type { SpacingToken } from "../../types";
import Section from "./Section";

interface Props {
  spacing: SpacingToken[];
  noPageBreak?: boolean;
}

export default function Spacing({ spacing, noPageBreak }: Props) {
  if (!spacing.length) return null;

  const max = Math.max(...spacing.map((s) => s.px));

  return (
    <Section title="Spacing & Grid" noPageBreak={noPageBreak}>
      <div className="space-y-3">
        {spacing.map((s) => (
          <div key={s.value} className="flex items-center gap-4">
            <span className="w-16 text-right text-sm font-mono text-gray-600 shrink-0">
              {s.value}
            </span>
            <div className="flex-1 bg-gray-100 rounded h-4 overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded"
                style={{ width: `${Math.min((s.px / max) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-16 shrink-0">
              {s.usageCount}× used
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
