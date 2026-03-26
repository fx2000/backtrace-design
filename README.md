# BacktraceDesign

A Chrome Extension that extracts the design language of any website and generates a style book in a new tab — fonts, color palette, typography scale, buttons, links, spacing, border radii, and shadows.

Useful for designers who want a quick, preliminary style reference from a live site without digging through DevTools or source files.

---

## How it works

1. Navigate to any website in Chrome
2. Right-click anywhere on the page
3. Select **"Extract styles from this page"**
4. A style book opens in a new tab instantly

The style book includes:

| Section | What you get |
|---|---|
| **Brand Palette** | Inferred primary, secondary, accent, neutral, and semantic colors |
| **All Colors** | Every unique color found on the page, with hex/rgb/hsl values |
| **Typography** | H1–H6, body, small, label — rendered in the actual site fonts |
| **Buttons** | All distinct button variants rendered with their real styles |
| **Links** | Link styles with color and decoration |
| **Spacing & Grid** | Most-used margin/padding/gap values, ranked by frequency |
| **Border Radius** | Unique radius values shown visually |
| **Shadows** | All `box-shadow` values found on the page |

Use **Export PDF** (top right) to save the style book via the browser's print dialog.

---

## Development

**Requirements:** Node.js 18+, Chrome

```bash
npm install
npm run build       # production build → dist/
npm run dev         # watch mode — rebuilds on file change
npm run typecheck   # TypeScript check without emitting
```

**Loading the extension in Chrome:**

1. Go to `chrome://extensions`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked** and select the `dist/` folder
4. After rebuilding, click the refresh icon on the extension card

---

## Tech stack

- **TypeScript** — end to end
- **React 18** — stylebook UI
- **Tailwind CSS** — stylebook styling
- **Vite 5** + **crxjs** — build tooling for Chrome extensions

---

## Project structure

```
src/
├── background/index.ts     # Service worker: context menu, stylesheet fetching, tab orchestration
├── content/index.ts        # Page-injected script: DOM traversal + style extraction
├── utils/
│   ├── colorUtils.ts       # Color parsing, RGB↔HSL, palette inference
│   └── cssParser.ts        # Font extraction, CSS variable parsing, Google Fonts detection
├── types/index.ts          # Shared TypeScript types (ExtractedStyles and friends)
└── stylebook/              # React app rendered in the new tab
    ├── App.tsx
    ├── components/
    │   ├── Header.tsx
    │   ├── ColorPalette.tsx
    │   ├── AllColors.tsx
    │   ├── Typography.tsx
    │   ├── Buttons.tsx
    │   ├── Links.tsx
    │   ├── Spacing.tsx
    │   ├── BorderRadius.tsx
    │   ├── Shadows.tsx
    │   └── ExportButton.tsx
    └── index.css
```

---

## Roadmap

- [ ] JSON design token export
- [ ] Figma-importable format
- [ ] Code snippet export (CSS variables, Tailwind config, etc.)
- [ ] More component types: form inputs, badges, cards
- [ ] Interactive stylebook (edit/override extracted values)
