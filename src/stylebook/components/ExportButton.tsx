import { useState, useRef, useEffect } from "react";
import type { ExtractedStyles } from "../../types";
import { exportJSONTokens } from "../exporters/jsonTokens";
import { exportCSSVariables } from "../exporters/cssVariables";
import { exportTailwindConfig } from "../exporters/tailwindConfig";

interface Props {
  data: ExtractedStyles;
}

interface ExportOption {
  label: string;
  description: string;
  ext: string;
  mime: string;
  generate: (data: ExtractedStyles) => string;
}

const OPTIONS: ExportOption[] = [
  {
    label: "PDF",
    description: "Print-ready style book",
    ext: "pdf",
    mime: "",
    generate: () => "",
  },
  {
    label: "JSON Tokens",
    description: "W3C Design Tokens format",
    ext: "tokens.json",
    mime: "application/json",
    generate: exportJSONTokens,
  },
  {
    label: "CSS Variables",
    description: "Custom properties file",
    ext: "css",
    mime: "text/css",
    generate: exportCSSVariables,
  },
  {
    label: "Tailwind Config",
    description: "theme.extend snippet",
    ext: "tailwind.config.js",
    mime: "text/javascript",
    generate: exportTailwindConfig,
  },
];

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportButton({ data }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const siteName = data.site.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  function handleExport(option: ExportOption) {
    setOpen(false);
    if (option.ext === "pdf") {
      window.print();
      return;
    }
    const content = option.generate(data);
    downloadFile(content, `${siteName}-stylebook.${option.ext}`, option.mime);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg
                   hover:bg-gray-700 transition-colors shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50">
          {OPTIONS.map((option) => (
            <button
              key={option.ext}
              onClick={() => handleExport(option)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <span className="text-sm font-medium text-gray-900 block">
                {option.label}
              </span>
              <span className="text-xs text-gray-500">{option.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
