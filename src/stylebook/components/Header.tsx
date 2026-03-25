import type { ExtractedStyles, FontFamily } from "../../types";

interface Props {
  site: ExtractedStyles["site"];
  fonts: FontFamily[];
}

export default function Header({ site, fonts }: Props) {
  const date = new Date(site.extractedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const primaryFonts = fonts.slice(0, 4);

  return (
    <header className="card bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="flex gap-6">
        {/* Left: site info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-6">
            {site.favicon && (
              <img
                src={site.favicon}
                alt=""
                className="w-10 h-10 rounded-lg object-contain"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{site.title}</h1>
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {site.url}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600 border-t border-gray-200 pt-4">
            <span>Generated {date}</span>
            {primaryFonts.length > 0 && (
              <span>
                Fonts:{" "}
                {primaryFonts.map((f, i) => (
                  <span key={f.name}>
                    <strong className="text-gray-800">{f.name}</strong>
                    {f.source === "google" && (
                      <span className="ml-1 text-xs text-blue-500">(Google)</span>
                    )}
                    {i < primaryFonts.length - 1 ? ", " : ""}
                  </span>
                ))}
                {fonts.length > 4 && ` +${fonts.length - 4} more`}
              </span>
            )}
          </div>
        </div>

        {/* Right: page thumbnail */}
        {site.thumbnail && (
          <div className="shrink-0 hidden sm:block">
            <img
              src={site.thumbnail}
              alt={`Screenshot of ${site.title}`}
              className="w-48 h-auto rounded-xl border border-gray-200 shadow-sm object-cover object-top"
              style={{ maxHeight: "8rem" }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
