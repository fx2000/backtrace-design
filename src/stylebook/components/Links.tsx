import type { LinkStyle } from "../../types";
import { ensureReadableOnWhite } from "../../utils/colorUtils";
import Section from "./Section";

interface Props {
  links: LinkStyle[];
}

export default function Links({ links }: Props) {
  if (!links.length) return null;

  return (
    <Section title="Links">
      <div className="space-y-4">
        {links.map((l, i) => {
          const readable = ensureReadableOnWhite(l.color);
          return (
            <div key={i} className="flex items-center gap-6">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: readable.color,
                  backgroundColor: readable.backgroundColor,
                  textDecoration: l.textDecoration,
                  fontWeight: l.fontWeight,
                  fontSize: l.fontSize,
                  fontFamily: l.fontFamily,
                  ...(readable.backgroundColor
                    ? { padding: "0.125em 0.375em", borderRadius: "0.25rem" }
                    : {}),
                }}
              >
                {l.sampleText}
              </a>
              <div className="flex gap-4 text-xs font-mono text-gray-500 ml-auto">
                <span>{l.color}</span>
                <span>{l.textDecoration}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
