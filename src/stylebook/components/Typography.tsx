import type { TypographyStyle } from "../../types";
import { ensureReadableOnWhite } from "../../utils/colorUtils";
import Section from "./Section";

interface Props {
  typography: TypographyStyle[];
}

export default function Typography({ typography }: Props) {
  if (!typography.length) return null;

  return (
    <Section title="Typography">
      <div className="space-y-6">
        {typography.map((t) => {
          const readable = ensureReadableOnWhite(t.color);
          return (
            <div key={t.element} className="flex gap-6 items-start border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <div className="w-24 shrink-0 pt-1">
                <span className="text-xs font-mono text-gray-600">{t.label}</span>
                <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                  <p>{t.fontSize}</p>
                  <p>w{t.fontWeight}</p>
                  <p>lh {t.lineHeight}</p>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="break-words"
                  style={{
                    fontFamily: t.fontFamily,
                    fontSize: t.fontSize,
                    fontWeight: t.fontWeight,
                    lineHeight: t.lineHeight,
                    letterSpacing: t.letterSpacing,
                    color: readable.color,
                    backgroundColor: readable.backgroundColor,
                    textTransform: t.textTransform as React.CSSProperties["textTransform"],
                    ...(readable.backgroundColor
                      ? { padding: "0.25em 0.5em", borderRadius: "0.375rem" }
                      : {}),
                  }}
                >
                  {t.sampleText}
                </p>
                {readable.backgroundColor && (
                  <p className="text-[10px] text-gray-500 mt-1 font-mono">
                    original color: {t.color}
                  </p>
                )}
              </div>

              <div className="w-48 shrink-0 hidden lg:block">
                <p className="text-xs font-mono text-gray-500 truncate">{t.fontFamily.split(",")[0]}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
