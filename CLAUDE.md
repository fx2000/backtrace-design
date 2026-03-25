# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build       # production build → dist/
npm run dev         # watch mode (rebuilds on change)
npm run typecheck   # TypeScript check without emitting
```

To load in Chrome: go to `chrome://extensions`, enable Developer Mode, click "Load unpacked", select the `dist/` folder. After each `npm run build`, click the refresh icon on the extension card.

## Architecture

BacktraceDesign is a Chrome Extension (Manifest V3) that extracts design tokens from any webpage and renders them as a React style book in a new tab.

### Three-part extension structure

**`src/background/index.ts`** — Service worker. Registers the "Extract styles from this page" context menu item. On click, it sends `EXTRACT_STYLES` to the active tab's content script and awaits the result. It also handles `FETCH_STYLESHEETS` messages from the content script, fetching cross-origin CSS files that would otherwise be blocked by CORS in the page context. Once extraction is complete, it stores the payload in `chrome.storage.session` and opens `stylebook.html` in a new tab.

**`src/content/index.ts`** — Injected into every page. Listens for `EXTRACT_STYLES`, then:
1. Samples up to ~1500 DOM elements and reads computed styles (colors, spacing, border-radius, shadows)
2. Parses accessible in-page `CSSStyleSheet` rules
3. Asks the background to fetch cross-origin stylesheets, then parses those too
4. Queries representative button/link/heading/text elements for component styles
5. Responds with a fully assembled `ExtractedStyles` object

**`src/stylebook/`** — React + Tailwind app served as `stylebook.html` (a web-accessible extension page). On mount, it reads `ExtractedStyles` from `chrome.storage.session`, re-injects any Google Fonts found, then renders section components.

### Data flow

```
Context menu click
  → background sends EXTRACT_STYLES to tab content script
  → content script: DOM traversal + accessible CSS parsing
  → content script → background: FETCH_STYLESHEETS [cross-origin URLs]
  → background fetches CSS, returns text to content script
  → content script assembles ExtractedStyles, responds to background
  → background: chrome.storage.session.set({ stylebookData })
  → background: chrome.tabs.create({ url: 'stylebook.html' })
  → stylebook React app reads session storage, renders
```

### Shared types

All shared data shapes live in `src/types/index.ts` — `ExtractedStyles` is the central type flowing from content → background → stylebook.

### Utilities

- **`src/utils/colorUtils.ts`** — CSS color parsing (rgb/hex/hsl), RGB↔HSL conversion, color accumulation map, and the `inferPalette()` function that clusters colors into named roles (Primary, Secondary, Accent, Neutral, Danger, Warning, Success).
- **`src/utils/cssParser.ts`** — Font name extraction from raw CSS text, CSS variable color parsing, Google Fonts detection from `<link>` tags, and font deduplication.

### PDF export

Triggered by `window.print()`. A `@media print` block in `src/stylebook/index.css` hides `.no-print` elements (toolbar, expand buttons) and sets `break-inside: avoid` on section cards.

### Build

Vite 5 + `@crxjs/vite-plugin@2.0.0-beta.26`. The `stylebook.html` is added as an explicit Rollup entry in `vite.config.ts` because crxjs does not automatically bundle HTML listed in `web_accessible_resources`. The `"type": "module"` field in `package.json` is required so Vite resolves the crxjs ESM build (the CJS build does not export `crx`).
