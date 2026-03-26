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

### Build

Two-step build (no framework plugin — we dropped crxjs for reliability):
1. **`vite build`** — compiles the stylebook React app (`stylebook.html` → `dist/stylebook.html` + assets)
2. **`esbuild`** — bundles `background.ts` and `content.ts` as self-contained IIFEs into `dist/`

Static files (`manifest.json`, icons) live in `public/` and are copied to `dist/` by Vite.

### Three-part extension structure

**`src/background/index.ts`** — Service worker. Registers the "Extract styles from this page" context menu item. On click, tries to message the content script; if not present (page was open before install), injects it on demand via `chrome.scripting.executeScript`. Also handles `FETCH_STYLESHEETS` messages (fetching cross-origin CSS bypassing CORS), captures a page screenshot via `chrome.tabs.captureVisibleTab`, stores data in `chrome.storage.session`, and opens the stylebook tab.

**`src/content/index.ts`** — Injected into every page (via manifest) or on demand (via background). Listens for `EXTRACT_STYLES`, then:
1. Collects all CSS variable names from stylesheets (including `@layer`, `@container`) and inline `style` attributes
2. Resolves each variable via `getComputedStyle` on multiple context elements (handles vars scoped to specific selectors)
3. Falls back to raw values from CSS rules when `getComputedStyle` can't resolve
4. Builds color token references from `var()` chains (e.g. `--color-heading: var(--color-navy)`)
5. Samples DOM elements for computed colors, spacing, border-radius, shadows
6. Fetches cross-origin stylesheets via background, parses them, resolves remaining `var()` refs
7. Attaches base color var names (excluding token aliases) to colors, with priority sorting (intentional names before framework utilities like `--tw-*`)
8. Responds with the full `ExtractedStyles` object

**`src/stylebook/`** — React + Tailwind app served as `stylebook.html`. On mount reads from `chrome.storage.session`, re-injects Google Fonts, renders sections. Print CSS uses `@page { size: landscape }` with `break-before: page` per section.

### Key utilities

- **`src/utils/colorUtils.ts`** — CSS color parsing, RGB↔HSL, WCAG `contrastRatio()` and `ensureReadableOnWhite()`, `attachVarNamesToColors()` with priority sorting, `formatVarName()` (handles WP-style `--wp-preset--color--white` → "White"), `inferPalette()` for curated brand colors.
- **`src/utils/cssParser.ts`** — `collectCSSVars()` returns `{ resolved, tokenRefs }`. Walks all CSS grouping rules (including `@layer`). Scans inline `style` attributes. `resolveVarReferences()` for cross-origin var chains.

### Exporters

`src/stylebook/exporters/` — each generates a downloadable file from `ExtractedStyles`:
- **`jsonTokens.ts`** — W3C Design Tokens format (Style Dictionary / Figma Tokens compatible)
- **`cssVariables.ts`** — `:root {}` with organized custom properties
- **`tailwindConfig.ts`** — `theme.extend` snippet

### Shared types

All data shapes in `src/types/index.ts`. `ExtractedStyles` is the central type. `ColorToken` represents semantic var→var mappings.

### Landing page

`docs/` contains the GitHub Pages site (`index.html` landing page, `demo.html` live demo, `CNAME` for custom domain). Self-contained HTML files, no build step.

**Live site:** https://backtracedesign.duque.ai
**Repo:** https://github.com/fx2000/backtrace-design
