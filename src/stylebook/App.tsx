import { useEffect, useState } from "react";
import type { ExtractedStyles, FontFamily } from "../types";
import Header from "./components/Header";
import ColorPalette from "./components/ColorPalette";
import AllColors from "./components/AllColors";
import ColorTokens from "./components/ColorTokens";
import Typography from "./components/Typography";
import Buttons from "./components/Buttons";
import Links from "./components/Links";
import Spacing from "./components/Spacing";
import BorderRadius from "./components/BorderRadius";
import Shadows from "./components/Shadows";
import ExportButton from "./components/ExportButton";

export default function App() {
  const [data, setData] = useState<ExtractedStyles | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.session
      .get("stylebookData")
      .then((result) => {
        if (result.stylebookData) {
          setData(result.stylebookData as ExtractedStyles);
          injectGoogleFonts(result.stylebookData.fonts);
        } else {
          setError("No style data found. Right-click a page and choose 'Extract styles from this page'.");
        }
      })
      .catch(() => {
        setError("Failed to load style data.");
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg animate-pulse">Loading style book…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <div className="flex items-start justify-between no-print">
        <div />
        <ExportButton />
      </div>

      <Header site={data.site} fonts={data.fonts} />

      <ColorPalette colors={data.colors.curated} />
      <AllColors colors={data.colors.all} />
      <ColorTokens tokens={data.colorTokens} />
      <Typography typography={data.typography} />
      <Buttons buttons={data.buttons} />
      <Links links={data.links} />
      <Spacing spacing={data.spacing} />
      <BorderRadius borderRadius={data.borderRadius} />
      <Shadows shadows={data.shadows} />
    </div>
  );
}

function injectGoogleFonts(fonts: FontFamily[]) {
  const googleUrls = new Set(
    fonts.filter((f) => f.source === "google" && f.googleUrl).map((f) => f.googleUrl!)
  );
  for (const url of googleUrls) {
    if (!document.querySelector(`link[href="${url}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    }
  }
}
