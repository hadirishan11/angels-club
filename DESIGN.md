# Moonlight Resto Lounge — Design System

Static site (`index.html`, `css/styles.css`, `js/main.js`). Open `index.html` directly or serve the folder
(`python3 -m http.server`). Built with the `ui-ux-pro-max` skill.

## Decisions (and why they differ from the raw generator output)
`--design-system "restaurant lounge nightlife upscale dining"` returned a bright red, light-mode,
"funnel" landing. That fits a daytime family restaurant, not a night lounge, so the system was composed
from the better-fitting matches in the same search run:

| Area | Choice | Source |
|------|--------|--------|
| Style | Dark Mode (OLED) — midnight blue, minimal glow, 7:1+ text contrast | `--domain style "luxury lounge bar dark elegant"` |
| Palette | "Dramatic dark + spotlight gold", shifted to midnight navy + champagne gold + moon silver | `--domain color` (Theater/Cinema) |
| Type | Cormorant (display) + Montserrat (body) — "Luxury Serif" | `--domain typography` |
| Layout | Hero-Centric: full-bleed hero → value strip → proof → primary CTA, sticky nav CTA | `--domain landing` |
| Motion | Standard (6/10): scroll reveal with stagger, honours `prefers-reduced-motion` | design dials |
| Density | Spacious (3/10) | design dials |

## Tokens
See `:root` in `css/styles.css` (primitives → semantic). Key semantic tokens:
`--color-bg #070A1F`, `--color-surface #0B1030`, `--color-fg #F2F0F7`, `--color-fg-muted #A8AEC8`,
`--color-accent #D4B26A`, `--color-on-accent #05071A`.

## Features
- FR (default, Bill 96 friendly) / EN toggle, remembered per visitor
- Sticky header, mobile menu, scrollspy, skip link, visible focus rings, 44px+ touch targets
- Menu tabs (WAI-ARIA tabs, arrow-key navigation)
- Reservation form: visible labels, on-blur inline validation, loading → success feedback,
  time slots from opening hours, 11+ guests auto-selects "Private event"
- Live "open now" indicator from the hours table
- SVG icon sprite (no emoji icons)

## Before launch — replace placeholders (search for `TODO`)
- Street address, phone `(450) 000-0000`, opening hours, map query
- Social links
- Gallery tiles (`.g-art-*`) → real WebP photos with `loading="lazy"` and alt text
- Menu items & prices
- Reservation submit → real booking backend (OpenTable, Libro, or a form endpoint)
