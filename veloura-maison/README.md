# Maison Veloura — theme upgrade

Source for the **"Veloura Maison — preview"** theme on gssjes-pp.myshopify.com
(an unpublished copy of the live Veloura theme). Spec: [DESIGN.md](DESIGN.md).

Only files that changed from the live theme are here, at their theme paths under `theme/`.

| Area | Files |
|---|---|
| New luxury layer | `assets/veloura-maison.css`, `assets/veloura-maison.js` |
| New homepage sections | `sections/maison-marquee.liquid`, `maison-manifesto.liquid`, `maison-showcase.liquid`, `maison-houses.liquid`, `maison-coda.liquid` |
| Layout / tokens | `layout/theme.liquid` (fonts + new assets), `snippets/css-variables.liquid` (Bodoni Moda + Jost) |
| Settings / content | `config/settings_data.json` (Noir + rosé-champagne palette), `templates/index.json`, `sections/header-group.json`, `sections/footer-group.json` |
| Re-toned Rosé | `assets/veloura-*-rose.webp`, `assets/veloura-world3d.js`, `veloura-3d.js`, `veloura-v2.js`, `veloura-base.css`, `veloura-sections.css` (hot pink → rosé champagne) |
| Fix | `assets/veloura.js` — heading splitter keeps `<em>` italics |

Note: the minified `.js`/`.css` base files were taken from the store CDN (Shopify serves them minified).

## Publishing
Preview: `https://gssjes-pp.myshopify.com/?preview_theme_id=169676079193`
Publish from Shopify admin → Online Store → Themes → "Veloura Maison — preview" → Publish.
The previous theme stays in the library for instant rollback.
