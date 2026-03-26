# BacktraceDesign

A Chrome Extension that extracts the design language of any website and generates a style book in a new tab — colors, design tokens, typography, buttons, links, spacing, border radii, and shadows.

Useful for designers who want a quick, preliminary style reference from a live site without digging through DevTools or source files.

**[Website](https://backtracedesign.duque.ai)** &middot; **[Live Demo](https://backtracedesign.duque.ai/demo.html)** &middot; **[Report a Bug](https://github.com/fx2000/backtrace-design/issues)**

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
| **All Colors** | Every unique color found on the page, named from CSS variables |
| **Color Tokens** | Semantic token mappings (e.g. "Heading" → Navy, "Link" → Rosewood) |
| **Typography** | H1–H6, body, small, label — rendered in the actual site fonts |
| **Buttons** | All distinct button variants rendered with their real styles |
| **Links** | Link styles with color and decoration |
| **Spacing & Grid** | Most-used margin/padding/gap values, ranked by frequency |
| **Border Radius** | Unique radius values shown visually |
| **Shadows** | All `box-shadow` values found on the page |

## Export formats

| Format | Description |
|---|---|
| **PDF** | Landscape print-ready style book, one section per page |
| **JSON Design Tokens** | W3C Design Tokens Community Group format, compatible with Style Dictionary and Figma Tokens |
| **CSS Variables** | Clean `:root {}` file with all tokens as custom properties |
| **Tailwind Config** | `theme.extend` snippet with colors, fonts, spacing, radii, and shadows |

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
- **Vite 5** + **esbuild** — build tooling

---

## Project structure

```
src/
├── background/index.ts     # Service worker: context menu, screenshot, tab orchestration
├── content/index.ts        # Page-injected script: DOM traversal + style extraction
├── utils/
│   ├── colorUtils.ts       # Color parsing, WCAG contrast, palette inference, var name formatting
│   └── cssParser.ts        # CSS variable collection, @layer support, font detection
├── types/index.ts          # Shared TypeScript types (ExtractedStyles and friends)
└── stylebook/
    ├── App.tsx
    ├── exporters/          # JSON Tokens, CSS Variables, Tailwind Config generators
    └── components/         # Header, ColorPalette, AllColors, ColorTokens, Typography, etc.
docs/
├── index.html              # Landing page (GitHub Pages)
├── demo.html               # Live stylebook demo with sample data
└── CNAME                   # Custom domain config
```

---

## Roadmap

- [x] Color palette extraction with CSS variable names
- [x] CSS variable and design token detection (`var()` chain resolution)
- [x] Multiple export formats (PDF, JSON Tokens, CSS, Tailwind)
- [x] WCAG contrast checking for typography previews
- [x] Page screenshot in the header
- [ ] Figma Variables import format
- [ ] More component types: form inputs, badges, cards
- [ ] Interactive stylebook (edit/override extracted values)
- [ ] Chrome Web Store listing

---

## Author

**Daniel Duque** — [duque.ai](https://duque.ai)

Contact: [backtracedesign@duque.ai](mailto:backtracedesign@duque.ai)

## License

[MIT](LICENSE)
