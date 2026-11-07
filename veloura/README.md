# Veloura — Shopify theme (Online Store 2.0)

A quiet, editorial theme for a luxury decant boutique. Liquid + JSON templates, vanilla JS (~27 KB unminified across three files), no frameworks, no external requests except Shopify's own CDN.

---

## 1. Preview locally with Shopify CLI

Requirements: Node 18+ and a Shopify store (or a free [development store](https://shopify.dev/docs/storefronts/themes/tools/development-stores) from a Partner account).

```bash
npm install -g @shopify/cli@latest      # once
cd veloura
shopify theme dev --store your-store.myshopify.com
```

- Log in when the browser opens. The CLI prints a local URL (`http://127.0.0.1:9292`) with hot reload, plus a link to the theme editor.
- `shopify theme dev` creates a temporary *development theme*. It never touches your live theme.
- Run `shopify theme check` before every push. It currently reports **0 offenses**.

## 2. Push it to your store

```bash
cd veloura
shopify theme push --unpublished --store your-store.myshopify.com   # uploads as a new, unpublished theme
```

Then go to **Online Store → Themes**, click **Customize** on "Veloura" to fill in content, and **Publish** when ready.

Later updates:

```bash
shopify theme push --theme <THEME_ID>          # update an existing theme (ID from `shopify theme list`)
shopify theme pull --theme <THEME_ID>          # bring editor changes (templates/*.json, settings_data.json) back into git first
```

> Editor changes are saved in `templates/*.json` and `config/settings_data.json` on Shopify. Always `pull` before you `push`, or you will overwrite them.

Alternative: connect the repo through **Online Store → Themes → Add theme → Connect from GitHub** (set the theme root to `veloura/`, or move these files to the repo root).

---

## 3. File structure

```
veloura/
├─ layout/       theme.liquid, password.liquid
├─ templates/    index, collection, product, cart, search, 404, list-collections, blog, article,
│                page, page.about, page.faq, page.shipping, page.contact, password (all JSON)
├─ sections/     header-group.json, footer-group.json + 30 sections
├─ snippets/     product-card, price, product-badges, rating, image, icon, breadcrumbs, facets,
│                cart-line, free-shipping, cart-upsell, notify-form, meter, meta-tags, structured-data…
├─ assets/       base.css (design system), global.js, product.js, facets.js
├─ config/       settings_schema.json, settings_data.json
└─ locales/      en.default.json (all storefront text, editable in Admin → Online Store → Languages)
```

### Design system (Theme settings → Colors / Typography)
| Token | Default | Use |
|---|---|---|
| Ink | `#0E0E0E` | Text, dark sections, primary buttons |
| Ivory | `#F4EFE6` | Page background |
| Stone | `#DCD5CA` / `#6B655D` | Quiet panels / muted text (5:1 contrast) |
| Champagne | `#B8A07E` | Hairlines, small labels, focus, stars. Used sparingly |

Headings: **Cormorant** (Shopify's font library version of Cormorant Garamond). Body/UI: **Jost**. Both are served from Shopify's CDN and preloaded. Every section has a **color scheme** (Ivory / Ink / Stone) and spacing controls.

---

## 4. Metafields to create

**Settings → Custom data → Products → Add definition**. Namespace and key must match exactly. For the `list` types, choose "List of values".

| Name | Namespace.key | Type | Used for |
|---|---|---|---|
| Tagline | `veloura.tagline` | Single line text | Italic line under the product name |
| Top notes | `veloura.notes_top` | List · single line text | Pyramid, card notes, structured data |
| Heart notes | `veloura.notes_heart` | List · single line text | Pyramid |
| Base notes | `veloura.notes_base` | List · single line text | Pyramid |
| Longevity | `veloura.longevity` | Integer (min 1, max 5) | Meter: Fleeting → Enduring |
| Sillage | `veloura.sillage` | Integer (min 1, max 5) | Meter: Skin scent → Room-filling |
| Season | `veloura.season` | List · single line text (choices: Spring, Summer, Autumn, Winter) | Profile + **filter** |
| Occasion | `veloura.occasion` | List · single line text | Profile |
| Scent family | `veloura.scent_family` | List · single line text (choices: Woody, Amber, Fresh, Floral, Gourmand, Citrus) | Profile + **filter** |
| Concentration | `veloura.concentration` | Single line text | e.g. Eau de Parfum |
| Perfumer | `veloura.perfumer` | Single line text | Profile |
| Year | `veloura.year` | Integer | Profile |
| Volume (ml) | `veloura.volume_ml` | Integer | Price per ml (defaults to 10) |
| Limited batch | `veloura.limited_batch` | True/false | "Limited batch" badge (or tag the product `limited`) |
| Pairs well with | `veloura.pairs_with` | List · product reference | "Pairs well with" section |

Collections (**Settings → Custom data → Collections**):

| Name | Namespace.key | Type | Used for |
|---|---|---|---|
| SEO content | `veloura.seo_content` | Rich text | Long text under the grid (page 1 only) |
| Banner image | `veloura.banner_image` | File (image) | Optional collection hero |

**Faster option:** create all the product definitions at once. Install the free *Shopify GraphiQL App*, choose the Admin API, and run [`metafield-definitions.graphql`](./metafield-definitions.graphql).

Reviews: install a review app that writes Shopify's standard `reviews.rating` / `reviews.rating_count` metafields (Judge.me, Okendo, Yotpo, Shopify Product Reviews…). Stars then appear on cards, the product page and in Google results via the structured data. Add the app's review widget with the **Apps** section on the product template.

---

## 5. Shopify admin configuration

1. **Fragrance house = Vendor.** Put the house name (e.g. the brand) in the product's *Vendor* field. It shows above the name, links to all products by that house, feeds structured data, and becomes the "House" filter.
2. **Search & Discovery app** (free, by Shopify) → Filters → add: *Availability*, *Price*, *Vendor* (rename to "House"), *Scent family* and *Season* metafields, and optionally *Tag*. Under *Product recommendations* you can set hand-picked complementary products.
3. **Collections:** create automated collections:
   - `Noir` (tag = `noir`), `Rosé` (tag = `rose`)
   - one per family: `Woody`, `Amber`, `Fresh`, `Floral`, `Gourmand`, `Citrus` (tag or metafield condition)
   - `Discovery` (the discovery set), plus `All` exists by default.
4. **Navigation:**
   - `main-menu`: Noir, Rosé, Families (dropdown with the 6 families), Discovery Set, Atelier (About)
   - `footer`: About / Authenticity, FAQ, Shipping & Returns, Contact, Journal, Privacy policy, Terms
   - A menu for the collection quick links (Noir, Rosé, families) → *Collection banner → Quick links menu*
5. **Pages:** create pages and assign the template under *Theme template*:
   - About (`page.about`), FAQ (`page.faq`), Shipping & Returns (`page.shipping`), Contact (`page.contact`)
6. **Policies:** Settings → Policies (refund, privacy, terms, shipping). The product page links to the shipping policy automatically.
7. **Shipping:** set a free-shipping rate for orders ≥ $40 so it matches the cart progress bar (*Theme settings → Cart*).
8. **Customer emails:** Private List signups become customers tagged `newsletter, private-list`. Create a segment in *Customers* and send drop announcements with Shopify Email. Notify-me requests arrive as contact-form emails tagged `notify-me` and the product handle.
9. **Markets / currency:** the free-shipping threshold is in your store's base currency.
10. **Customer accounts:** the theme uses Shopify's new customer accounts (Settings → Customer accounts). No legacy account templates are needed.

### Sample products
`../sample-data/products.csv` has 8 fictional placeholder fragrances plus a Discovery Set, created as **drafts**, with tags for Noir/Rosé, families, seasons, `new` and `limited`. Import via *Products → Import*. Delete them before launch.

---

## 6. SEO built in
- One `<h1>` per page (hero on home, product name, collection title, page title). The logo is not an `h1`.
- Canonical URLs, Open Graph and Twitter tags, `og:image` fallback (*Theme settings → Search & SEO*).
- JSON-LD: Organization + WebSite with sitelinks search (home), Product with offers, GTIN/SKU, brand and aggregate rating (product), BreadcrumbList (product, collection, page, blog, article), FAQPage (FAQ section), Article (journal).
- Filtered and tagged collection URLs, cart and search are `noindex, follow`, so no thin duplicate pages are indexed.
- Pagination stays as crawlable links even with "Load more".
- Long-form collection copy via the `veloura.seo_content` metafield, shown below the grid.
- A Journal (blog) template with "Shop the story" products. Write buying guides there ("best amber fragrances for winter", "what is a perfume decant").
- Semantic HTML, descriptive alt text fallbacks, fast LCP (hero preloaded at high priority, everything else lazy).

## 7. Conversion features
- Price inside the add-to-bag button, price per ml, express checkout (Shop Pay / Apple Pay) on the product page and cart.
- Sticky add-to-bag bar on mobile and desktop once the main button scrolls away.
- Inventory-driven "Few remaining" / "Only 3 left in this batch" (threshold in *Theme settings → Scarcity labels*), plus "Limited batch".
- Slide-out cart with free-shipping progress, discovery-set upsell, gift note, and reassurance line.
- Quick add on product cards (single-variant products), predictive search with popular searches.
- Reassurance bar and perks next to the buy button (authenticity, glass atomiser, shipping, gift packaging).
- Notify-me on sold-out variants and the Private List capture in the hero flow, footer and password page.

## 8. Performance & accessibility
- Responsive `srcset` images, lazy-loaded below the fold, `fetchpriority="high"` on the LCP image.
- Deferred scripts; product and filter JS load only on those pages; recommendations load when scrolled near.
- Skip link, focus-trapped drawers (Esc to close), visible focus rings, `aria-live` cart updates, labelled forms, AA contrast, `prefers-reduced-motion` respected.
