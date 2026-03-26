import type { ExtractedStyles, FontFamily } from "../../types";

interface Props {
  site: ExtractedStyles["site"];
  fonts: FontFamily[];
  stats: {
    colorCount: number;
    tokenCount: number;
    fontCount: number;
    buttonCount: number;
    typographyCount: number;
    shadowCount: number;
  };
}

function StatCard({ label, value }: { label: string; value: number }) {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center px-5 py-3">
      <span className="text-4xl font-bold text-gray-900">{value}</span>
      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}

export default function Header({ site, fonts, stats }: Props) {
  const date = new Date(site.extractedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const primaryFonts = fonts.filter((f) => f.source !== "system").slice(0, 6);

  return (
    <header className="hero-header card bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top bar — branding */}
      <div className="px-8 py-3 bg-gray-900 text-white flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold tracking-widest uppercase">
          BacktraceDesign
        </span>
        <span className="text-xs text-gray-400">Style Book</span>
      </div>

      {/* Main content — grows to fill */}
      <div className="p-10 flex gap-10 flex-1">
        {/* Left: site info + stats */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Title row */}
          <div className="flex items-center gap-5 mb-2">
            {site.favicon && (
              <img
                src={site.favicon}
                alt=""
                className="w-14 h-14 rounded-xl object-contain border border-gray-100"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            )}
            <div>
              <h1 className="text-5xl font-extrabold text-gray-900 leading-none tracking-tight">
                {site.title}
              </h1>
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="text-base text-blue-600 hover:underline break-all mt-1.5 inline-block"
              >
                {site.url}
              </a>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-1 mt-8 border border-gray-200 rounded-xl bg-gray-50 divide-x divide-gray-200 w-fit">
            <StatCard label="Colors" value={stats.colorCount} />
            <StatCard label="Tokens" value={stats.tokenCount} />
            <StatCard label="Fonts" value={stats.fontCount} />
            <StatCard label="Type Styles" value={stats.typographyCount} />
            <StatCard label="Buttons" value={stats.buttonCount} />
            <StatCard label="Shadows" value={stats.shadowCount} />
          </div>

          {/* Fonts list */}
          {primaryFonts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Typefaces
              </h3>
              <div className="flex flex-wrap gap-2">
                {primaryFonts.map((f) => (
                  <span
                    key={f.name}
                    className="inline-flex items-center gap-1.5 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full"
                  >
                    <span className="font-semibold">{f.name}</span>
                    {f.source === "google" && (
                      <span className="text-[10px] text-blue-500">Google</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer meta — pushed to bottom */}
          <div className="mt-auto pt-8 text-sm text-gray-400">
            Generated on {date}
          </div>
        </div>

        {/* Right: page thumbnail — grows with the card */}
        {site.thumbnail && (
          <div className="shrink-0 hidden sm:flex flex-col items-end">
            <img
              src={site.thumbnail}
              alt={`Screenshot of ${site.title}`}
              className="w-80 flex-1 rounded-xl border border-gray-200 shadow-md object-cover object-top"
            />
            <span className="text-[10px] text-gray-400 mt-2">Page screenshot</span>
          </div>
        )}
      </div>
    </header>
  );
}
