# DESIGN.md — Maison Veloura

Design spec for the Veloura Shopify theme upgrade (store: gssjes-pp.myshopify.com).
Built on top of the existing Veloura theme (Noir / Rosé "two worlds" architecture,
3D scroll story, scent finder, set builder). Everything below is implemented as an
override layer (`assets/veloura-maison.css`, `assets/veloura-maison.js`) plus new
`maison-*` sections, so the original theme stays intact underneath.

---

## 1. Visual Theme & Atmosphere

**One line:** a Parisian parfumerie at night — couture serif, champagne light, porcelain plinths.

- Keywords: *couture, hushed, editorial, tactile, candle-lit, collected.*
- Philosophy: fewer, larger, slower. Type does the luxury; ornament is a hairline.
- Two worlds, one house:
  - **Noir** — warm black lacquer, champagne gold, smoke.
  - **Rosé** — rosé champagne, porcelain blush, bordeaux ink (no neon pink).
- Texture: a 3% film grain over everything; marble textures kept but dimmed.

## 2. Color Palette & Roles

Theme settings drive the base tokens (`config/settings_data.json`):

| Token | Noir | Rosé | Role |
|---|---|---|---|
| bg | `#0A0908` (10,9,8) | blush `#F4E4DE` (244,228,222) | page background |
| surface | `#1C1A17` (28,26,23) | ivory `#FBF5F1` (251,245,241) | cards, drawers |
| text | `#F3EEE4` (243,238,228) | `#3A1C24` (58,28,36) | body copy |
| muted | `#A39E94` (163,158,148) | mix(ink, berry) | secondary text |
| accent | `#C6A676` (198,166,118) | berry `#6E2639` (110,38,57) | CTAs, eyebrows, rules |
| accent-2 | — | dusty rose `#B4566B` (180,86,107) | hover / gradients |
| baby | — | `#E7C1BE` (231,193,190) | soft fills |
| metal | — | rose-gold `#B98A6E` (185,138,110) | foil details |

Maison layer tokens (`:root`):

```css
--m-porcelain: #F1ECE4;  --m-porcelain-rgb: 241,236,228;  /* product plinths */
--m-champagne: #E9D3A8;  --m-champagne-rgb: 233,211,168;  /* foil highlight */
--m-gold-deep: #8C6A3F;  --m-gold-deep-rgb: 140,106,63;
--m-foil: linear-gradient(100deg,#8c6a3f 0%,#c6a676 28%,#f3e2bd 50%,#c6a676 72%,#8c6a3f 100%);
--m-hair: 1px solid rgba(var(--m-champagne-rgb), .22);
```

The 3D engine and rendered Rosé images were re-toned to the same rosé-champagne
palette (hot pinks `#F05291 / #E8327A / #FF97C2 …` → `#C46A7C / #A8455C / #E2AAB0 …`).

## 3. Typography Rules

```
@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..600;1,6..96,400..500&family=Jost:wght@300;400;500&display=swap');
--f-heading: 'Bodoni Moda', 'Didot', 'Bodoni 72', Georgia, serif;
--f-body:    'Jost', 'Futura', 'Helvetica Neue', Arial, sans-serif;
```

| Level | Font | Size | Weight | Tracking | Case |
|---|---|---|---|---|---|
| Display (`.m-display`) | Bodoni Moda | clamp(3rem, 1.6rem + 6vw, 8.5rem) | 400 | -0.02em | Sentence |
| H1 / `.h1` | Bodoni Moda | clamp(2.2rem, 1.4rem + 3vw, 4.4rem) | 400 | -0.01em | Sentence |
| H2 | Bodoni Moda | clamp(1.8rem, 1.2rem + 2vw, 3rem) | 400 | -0.005em | Sentence |
| H3 / card title | Bodoni Moda | 1.15–1.35rem | 400 | 0 | Sentence |
| Emphasis `<em>` in headings | Bodoni Moda Italic | inherit | 400 | 0 | — foil gradient |
| Eyebrow | Jost | .68rem | 500 | .38em | UPPER |
| Body | Jost | 15–17px | 300/400 | .01em | — line-height 1.75 |
| Button | Jost | .7rem | 500 | .3em | UPPER |

Banned: Cinzel for running headings (kept only in the SVG logo), Inter, Roboto, Arial as primary,
any font weight above 600 in serif.

## 4. Component Stylings

**Buttons** (`.btn`) — rectangular, 2px radius, hairline, foil sweep.
- default: `--btn-bg` accent/foil, `min-height: 52px`, padding `0 2.4em`.
- hover: foil position shifts 100%, `translateY(-2px)`, soft glow `0 18px 40px -18px var(--c-glow)`.
- active: `scale(.98)`.
- focus-visible: `outline: 1px solid var(--c-focus); outline-offset: 4px`.
- disabled: `opacity: .4; pointer-events: none`.
- `.btn--outline`: transparent, hairline accent border; hover fills accent at 8%.
- Shopify dynamic checkout ("Buy it now") restyled to the outline button — never the default blue.

**Cards** (`.card`) — porcelain plinth media (`--m-porcelain`, `mix-blend-mode: multiply`
on product photos so white studio backgrounds melt into the plinth), no outer border,
vendor in italic serif, title in serif, price in Jost.
- hover: image `scale(1.04)`, spotlight radial follows cursor (`--mx/--my`), quick-add rises.
- focus-within: hairline accent ring.

**Header** — transparent on hero, hairline bottom border on scroll, logo centred.

**Links** — underline grows from left (`background-size` 0→100%).

**Tags / notes pills** — hairline, Jost .7rem uppercase .2em.

## 5. Layout Principles

- Container 1320px, gutters `clamp(16px, 4vw, 56px)`.
- Spacing scale (px): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 72 · 112 · 160.
- Section rhythm: `padding-block: clamp(72px, 10vw, 160px)`.
- Editorial asymmetry: 7/5 and 5/7 splits; bento showcase on a 12-col grid.

## 6. Depth & Elevation

| Level | Use | Shadow |
|---|---|---|
| 0 | flat sections | none |
| 1 | cards | `0 1px 0 rgba(255,255,255,.04) inset` |
| 2 | hover cards / drawers | `0 30px 60px -30px rgba(0,0,0,.7)` |
| 3 | floating house preview | `0 40px 80px -20px rgba(0,0,0,.6)` |

## 7. Animation & Interaction — Level L3 (sensible budget)

Kept from original: WebGL scroll story (single WebGL scene, paused off-screen).

Signature moments (homepage):
1. **Hero** — existing 3D split story, re-typeset; cursor-follow champagne light.
2. **First scroll** — *Maison marquee*: giant italic house names drifting, CSS-only transform loop.
3. **Manifesto** — scroll-lit words (each word goes 18% → 100% opacity with scroll progress) + count-up figures.
4. **Showcase** — bento product grid with spotlight cards.
5. **Houses index** — editorial list; hover shows a floating bottle image that follows the cursor (rAF-throttled).
6. **Coda (the hidden detail)** — scrolling to the very end reveals *"You've reached the base notes — the part that lingers longest."*

Timing: `--ease-lux: cubic-bezier(.22,.61,.36,1)`; reveals 900–1100ms; hovers 400ms.

Reduced motion (`prefers-reduced-motion: reduce` or theme `motion=off/reduced`):
marquee stops, manifesto words fully lit, no cursor followers, count-ups jump to final value.

## 8. Do's and Don'ts

Do
1. Use italic serif `<em>` for one emotional word per heading.
2. Keep one accent per world (champagne / bordeaux).
3. Put every product image on the porcelain plinth.
4. Leave generous air — at least 72px between section blocks.
5. Use real vendor names (Dior, Chanel…) set in type — never unlicensed logos.

Don't
1. Don't use neon/hot pink or saturated magenta anywhere.
2. Don't show placeholder products, "My Store" or `[your-domain]` text.
3. Don't use the default blue Shopify checkout button.
4. Don't animate `filter: blur()` on moving elements.
5. Don't add a second WebGL scene to the homepage.
6. Don't set long headings in uppercase serif.
7. Don't use emoji or stock icons outside the existing SVG icon set.
8. Don't hard-code colours in sections — always tokens.

## 9. Responsive Behavior

| Breakpoint | Behaviour |
|---|---|
| ≥ 1200px | full bento (4 cols), houses list with floating preview |
| 750–1199px | bento 2 cols, marquee 70% size |
| < 750px | single column, marquee 50%, houses list shows inline thumbnails, no cursor effects |

Touch targets ≥ 44×44px. No horizontal overflow at 360px. Cursor effects only under `(hover: hover)`.

## 10. The Boutique (first-person homepage opener)

`sections/maison-boutique.liquid` + `assets/veloura-boutique.{css,js}` — a CSS 3D store (no WebGL, so
product photography stays sharp).

- **Entrance:** letterboxed night shopfront → doors swing open → camera glides through (a warm light flash
  masks the threshold) → bars retract, HUD fades in. Returning visitors skip straight inside.
- **Room:** left wall = Noir, ahead = all products, right wall = Rosé (each a collection setting). Bottles stand
  in lit porcelain alcoves with brass plaques; uses the `veloura.cutout` metafield image when present.
- **Navigation:** drag / swipe to look (±34°), quick flick or far look turns to the next wall, ←/→ keys,
  wall buttons. Pointer parallax on desktop.
- **Pick up:** FLIP flight from the shelf into the hand; notes parsed from the product description
  (Top/Heart/Base list items); "Try a spritz" mist + a sentence built from the notes; Add to bag flies the
  bottle into the bag HUD (real cart add); Put it back returns it to the shelf. Esc / backdrop click closes.
- **A11y:** every bottle is a real `<button>` with a label; dialog traps focus and restores it; reduced motion
  removes the dolly, mist and sway; without 3D support or JS the shelves render as a normal grid.
