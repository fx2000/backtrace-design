import type { ButtonStyle } from "../../types";
import Section from "./Section";

interface Props {
  buttons: ButtonStyle[];
}

export default function Buttons({ buttons }: Props) {
  if (!buttons.length) return null;

  return (
    <Section title="Buttons">
      <div className="flex flex-wrap gap-4">
        {buttons.map((b, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <button
              style={{
                backgroundColor: b.backgroundColor,
                color: b.color,
                borderColor: b.borderColor,
                borderWidth: b.borderWidth,
                borderStyle: "solid",
                borderRadius: b.borderRadius,
                paddingTop: b.paddingTop,
                paddingRight: b.paddingRight,
                paddingBottom: b.paddingBottom,
                paddingLeft: b.paddingLeft,
                fontSize: b.fontSize,
                fontWeight: b.fontWeight,
                fontFamily: b.fontFamily,
                boxShadow: b.boxShadow,
                textTransform: b.textTransform as React.CSSProperties["textTransform"],
                cursor: "default",
              }}
            >
              {b.sampleLabel}
            </button>
            <div className="text-center text-xs text-gray-500 space-y-0.5">
              <p className="font-mono">{b.borderRadius}</p>
              <p>{b.fontSize} / w{b.fontWeight}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
