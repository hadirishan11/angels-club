# VELOURA — Shopify Online Store 2.0 theme

**Iconic Scents. Miniature Luxury.**
One luxury brand, two shopping worlds — **VELOURA NOIR** (masculine) and **VELOURA ROSÉ** (feminine) — sharing one cart, one checkout and one customer account.

| | |
|---|---|
| Theme package | `dist/veloura-theme-v2.zip` (upload this to Shopify) |
| Theme source | `veloura-theme/` |
| Platform | Shopify Online Store 2.0 (JSON templates, section groups, app blocks) |
| Dependencies | None at runtime. Three.js r170 is bundled for optional 3D; no jQuery, no GSAP, no external CDNs |
| Languages | English (default) + French (`locales/fr.json`) |
| Currency | Uses the store currency (set CAD in Shopify) |
| Validation | Shopify Theme Check 3.31 — 0 errors, 0 warnings |

---

## What's new in v2
- **Scroll story (3D)** homepage section: split Noir/Rosé hero → signature bottle → cap lift & mist → miniature vs full size → discovery case unboxing.
- **High-fidelity 3D product viewer** driven by the JSON metafield `veloura.bottle_json` (studded, crystal, flask, pillar and column bottles; brand wordmark on the glass). Opens first in the product gallery.
- **Scent finder** (`page.scent-finder` template) and **Build a discovery set** (`page.build-a-set` template) using your real Shopify products and cart.
- **Born in Roma Donna Intense** ready to import: `shopify-import/`.

After uploading, create two pages, *Scent finder* (template `page.scent-finder`) and *Build a set* (template `page.build-a-set`), and add them to your menu.

## 1. Install

1. Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.
2. Select `dist/veloura-theme-v2.zip`. (The zip contains `layout/`, `templates/`, `sections/`, `snippets/`, `assets/`, `config/`, `locales/` at its root, as Shopify requires.)
3. Click **Customize** on the uploaded theme to configure it (steps below), then **Publish** once you're ready.

> Tip: keep your current theme published while you set up Veloura; preview with **Actions → Preview**.

## 2. First-time configuration (about 30 minutes)

### 2.1 Collections
Create these collections (Products → Collections), then assign them in **Customize → Theme settings → Brand & worlds**:

| Collection | Suggested handle | Theme template to assign | Notes |
|---|---|---|---|
| Veloura Noir | `noir` | `collection.noir` | Automated: *Product tag is equal to* `noir` |
| Veloura Rosé | `rose` | `collection.rose` | Automated: *Product tag is equal to* `rose` |
| All perfumes | `all` (built in) | default | Shopify provides `/collections/all` |
| Discovery sets | `discovery-sets` | `collection.sets` | |
| Gift sets | `gift-sets` | `collection.sets` | |
| Best sellers | `best-sellers` | default | Automated collection, sort **Best selling** — use it in the homepage *Best sellers* section |

**How the worlds work:** a page shows the Noir or Rosé theme when it is (a) a collection using the `collection.noir` / `collection.rose` template or set as the Noir/Rosé collection in theme settings, (b) a product tagged `noir` or `rose` (or with metafield `veloura.world`). Everywhere else the shopper's last choice is used, saved in their browser (`localStorage`, no cookies or tracking). The header switch changes the world in place; on a Noir/Rosé collection page it opens the counterpart collection.

### 2.2 Pages
Create pages (Online Store → Pages) and pick the matching **Theme template**:

| Page | Template | Content source |
|---|---|---|
| About Us | `page.about` | Edit in the theme editor (founding story placeholders in brackets) |
| Contact Us | `page.contact` | Contact form (native Shopify, emails go to your store email) |
| FAQ | `page.faq` | Questions are editable blocks; FAQ structured data is generated |
| Shipping Information | `page.shipping` | Editable blocks + page body |
| Order Tracking | `page.order-tracking` | Explains order-status emails and customer accounts |

Returns & Refunds, Privacy Policy, Terms of Service and the Shipping policy are **Shopify policies** (Settings → Policies) and appear automatically in the footer. Editable drafts are in `docs/policies/`.

### 2.3 Navigation
Online Store → Navigation:
- `main-menu`: Noir, Rosé, All perfumes, Discovery sets, Gift sets, About
- `footer`: FAQ, Shipping information, Order tracking, Contact

### 2.4 Product data (metafields)
Create the product metafield definitions in `docs/METAFIELDS.md` (Settings → Custom data → Products). They power the fragrance notes pyramid, size badges, specifications, filters and the optional 3D bottle viewer.

### 2.5 Filters and sorting
Install Shopify's free **Search & Discovery** app and enable filters: *Availability, Price, Vendor* (brand), *Product type*, variant option *Size*, and the metafields *Fragrance family* and *Bottle size*. The collection and search pages render whatever filters you enable (native Shopify storefront filtering). Sorting (price, best selling/popularity, newest, A–Z) is native.

### 2.6 Canada setup
See `docs/LAUNCH_CHECKLIST.md` — currency (CAD), markets, provincial taxes, shipping zones, French language, Shopify Payments, and the **dangerous-goods (alcohol-based perfume) carrier check**.

## 3. What's in the theme

**Homepage (all sections editable and re-orderable in the theme editor):**
1. Header — transparent over the hero, solid on scroll, world switch, search, account, cart
2. Dual-world hero — split Noir / Rosé panels, hover expansion, live WebGL podiums (desktop), particles, cinematic "enter world" transition; stacked on mobile
3. Discover Veloura — editorial copy + interactive 3D bottle (drag / swipe / arrow keys)
4. Shop by collection — large tilting Noir and Rosé cards
5. Best sellers — swipeable carousel of real products
6. Miniature luxury — editorial "why minis" with parallax artwork
7. Discovery sets — showcase band + set products (+ optional featured set with Add to bag)
8. Shop by brand — generated from `shop.vendors` (brands of products in the store)
9. Gifting experience — Noir and Rosé packaging
10. Newsletter — native Shopify customer form (tags `newsletter`)
11. Footer — menus, policies, social links, payment icons, country/currency and language selectors

**Commerce:** Ajax cart drawer (Shopify Cart API + Section Rendering API) with quantity editing, gift note, free-shipping progress (optional), animated add-to-bag (flying thumbnail, cart bump), error messages; cart page; native checkout and dynamic checkout buttons; predictive search; product recommendations; native filters/sorting; customer accounts (classic and new customer accounts both work through `routes.account_url`); gift card page; password page.

**Product page:** media gallery (images, Shopify 3D models, video) with swipe on mobile and thumbnails on desktop; optional procedural 3D bottle slide; variant picker; quantity; add to bag; dynamic checkout; availability (in stock / unavailable, no fabricated counts); fragrance notes pyramid; specifications; collapsible tabs; sticky add-to-bag bar on mobile; Product JSON-LD.

## 4. 3D, animation and performance

- **No 3D on first paint.** Every 3D element sits on top of a static image or SVG. `assets/veloura-3d.js` and Three.js load with a dynamic `import()` only when a 3D element nears the viewport, WebGL is available, and *Theme settings → Animation & 3D → Enable interactive 3D* is on.
- Adaptive quality: phones and low-memory devices get lower pixel ratio and cheaper (non-transmission) glass; rendering pauses off-screen and in background tabs.
- The homepage hero uses live WebGL only on screens ≥ 990 px; phones get the pre-rendered images with CSS parallax.
- `prefers-reduced-motion` and *Animation level: Off* disable particles, parallax, reveal motion and auto-rotation; the store remains fully usable.
- Without JavaScript: navigation, forms, cart page, checkout, search, filters and sorting all work through native Shopify forms and links.
- World transitions use the View Transitions API (circular reveal from the switch) with a registered-CSS-property colour cross-fade fallback. They never block interaction.

The 3D bottles are **generic, label-free illustrations** of the Veloura brand. They are not representations of any designer product. To show a real product in 3D, upload a GLB model to the product's media; the gallery renders it with Shopify's native model viewer.

## 5. Accessibility & SEO

Semantic landmarks, skip link, visible focus states, keyboard support (drawers use native `<dialog>` with focus return; gallery and 3D viewer respond to arrow keys), ARIA live announcements for cart and world changes, colour contrast checked on both worlds (body text on Rosé uses `#4A0A26`). SEO: per-page titles and descriptions, canonical URLs, Open Graph/Twitter tags, Organization, Product, Article and FAQ structured data.

## 6. Repository layout

```
veloura-theme/        Shopify theme source (zip this folder's contents)
dist/                 veloura-theme.zip (+ complete package zip)
docs/                 Asset inventory, metafields, launch checklist, policy drafts
brand-assets/         Your logo kit (SVG, transparent PNG, social icons)
demo-content/         Sample product CSV + generic demo bottle photos (for testing only)
tools/render/         Offline studio that renders the theme's 3D artwork (Three.js + Playwright)
tools/preview/        Local Liquid preview renderer used for design QA
tools/build_logo_snippet.py  Regenerates snippets/logo.liquid from the logo kit SVG
```

## 7. Customising

- **Colours, fonts, animation, cart, mobile options:** Customize → Theme settings.
- **Logo:** the vector logo is built in (`snippets/logo.liquid`) and recolours per world. You can also upload an image logo in Theme settings → Brand & worlds.
- **Hero / section artwork:** most sections have an optional image picker that replaces the built-in rendered artwork. Replace it with real photography once you have it.
- **Rebuild the zip after editing source:** from the repo root, `cd veloura-theme && zip -r ../dist/veloura-theme.zip . -x '.*'`.
- For live development with a store, use Shopify CLI: `shopify theme dev --path veloura-theme`.

## 8. Things that need a third party or your input

| Feature | Status |
|---|---|
| Guest order lookup by order number (no sign-in) | Not native to Shopify. The Order Tracking page explains email links and accounts; add a tracking app if you want a lookup form |
| Product reviews / ratings | Not included (no fabricated ratings). Add a reviews app; its app block can be placed in the product information section |
| Complementary product recommendations | Configure in the Search & Discovery app; set the section type to *Complementary* |
| Real product photography and data | **Required before launch** — see `docs/ASSET_INVENTORY.md` |
| Designer brand logos in *Shop by brand* | Only add logos you are licensed to use; otherwise names are shown in Cinzel |

---
Fonts: Cinzel and Montserrat are bundled under the SIL Open Font License 1.1. Three.js is MIT licensed.
