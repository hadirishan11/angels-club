# Moonlight Resto Lounge — Design System

Static site (`index.html`, `css/styles.css`, `js/main.js`, `js/motion.js`; GSAP 3.13 vendored in `js/vendor/`). Open `index.html` directly or serve the folder
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

## Motion (`js/motion.js`, GSAP + ScrollTrigger + SplitText)
- Moon preloader (waxes new → full, once per session) then a choreographed hero intro: photo
  zoom-in, per-letter 3D headline, staggered lead/CTAs
- Hero: slow Ken Burns photo, gold-dust particle canvas (pauses off-screen), scroll parallax + fade
- Gold scroll-progress bar, hide-on-scroll-down header
- Marquee that speeds up / reverses with scroll velocity
- Word-by-word masked reveal on every section title; batched fade-ups
- Clip-path photo reveals, parallax columns (desktop), counting stats
- Signatures: pinned horizontal scroll with inner image parallax (desktop); swipe row on mobile
- Menu: photo cross-fades per tab, items re-stagger on tab change
- Night cards rise in; hover zoom on every photo
- Desktop only: gold cursor follower, magnetic buttons
- `prefers-reduced-motion` → everything static, no preloader; if GSAP fails to load the page is fully usable

## Photography
Free Unsplash photos, hotlinked via `https://unsplash.com/photos/<id>/download?w=…`. Every `.media`
box has a gradient fallback, so a photo that fails to load degrades gracefully. **Before launch, replace
with the restaurant's own photography** (or download these into `assets/img/` and self-host as WebP).
Dish names/descriptions were adjusted to match what each photo shows.

| Where | Unsplash id | Photographer / title |
|-------|-------------|----------------------|
| Hero, OG image | ORAV7_PAXAE | Aconitum — dimly lit interior |
| About | mLPNw6L5t5o | Roman — table lamp in dim restaurant (license: verify) |
| About, cocktails tab | Pq6omXyUpWA | Brett Wharton — cocktail in a coupe at the bar |
| Signature: filet | WmTK_QfDxlE | Jason Leung — sliced meat on black plate (license: verify) |
| Mains tab | M0lUxgLnlfk | Chad Montano — filet mignon |
| Signature: calamari | x_25LBUY-EI | sooji min — fried calamari |
| Signature: pasta / gallery | atTu7WJ_Vqk, 8K7mplvphAo | Stephanie Sarlos — shrimp pasta table |
| Signature: risotto | qIPRTMulc-g | Julien Pianetti — risotto |
| Signature: old fashioned | xk4upGT5SVY | Hybrid Storytellers — old fashioned |
| Starters tab | irpHVBQ8xfE | Ricardo IV Tamayo — charcuterie board |
| Desserts tab | ZToCBpyv3aA | Irene Kredenets — chocolate cake |
| Wine night / gallery | 5ka611SHxQo, ttq049c3V2w | KIM DAEYOUNG, Sandra Anguís — red wine pour |
| Jazz night | 1FlHdAg6Mzs | César Guadarrama Cantú — saxophone |
| DJ night | gyDoWOAFXCE | Sam van Bussel — DJ at turntables |
| Brunch | F-dK7nJWbgo | Diana Krotova — brunch table |
| Gallery | x337TitjvNE, b5pmyraaAtw | chanwei_snap — dim bar; bartender with shaker (license: verify) |
| Gallery | pceCMLJ1djQ, JaUzpKC2Gjc | velvet-seat restaurant; Deliberate Directions — event table |
| Private events | NDNh2Vx2c_w | Adrien Olichon — long tables, vaulted ceiling |

## Before launch — replace placeholders (search for `TODO`)
- Street address, phone `(450) 000-0000`, opening hours, map query
- Social links
- Stock photography → the restaurant's own photos (see Photography above)
- Menu items & prices
- Reservation submit → real booking backend (OpenTable, Libro, or a form endpoint)
