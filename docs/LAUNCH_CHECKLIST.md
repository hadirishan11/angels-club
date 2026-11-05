# Launch checklist — VELOURA (Canada)

Tick each item before publishing. Items marked **⚠ You provide** require information or decisions only you can make.

## Business & legal
- [ ] **⚠ You provide** Legal business name, address, GST/HST number (and QST if registered in Québec) — Settings → Store details, Settings → Taxes
- [ ] **⚠ You provide** Confirm trademark / domain rights to "VELOURA" (also noted in the logo kit)
- [ ] **⚠ You provide** Confirm your right to resell each designer brand and how products are sourced (authorised distributor, grey market, decants). Product copy and the FAQ must state this accurately
- [ ] **⚠ You provide** If you decant (rebottle) fragrances, confirm labelling requirements (e.g. Cosmetic Notification to Health Canada, ingredient labelling, bilingual labels) with a qualified advisor
- [ ] Do not use designer logos, bottle photography or brand names in ways that imply endorsement. Use photography you own or are licensed to use

## Store settings
- [ ] Settings → Store details → Store currency **Canadian dollar (CAD)**; money format shows `$` / `CAD`
- [ ] Settings → Markets → Canada as primary market (add others later)
- [ ] Settings → Languages → add and **publish French**; review `locales/fr.json` storefront strings and translate product/page content (Shopify Translate & Adapt app)
- [ ] Settings → Taxes and duties → Canada: collect GST/HST/PST/QST as registered; Shopify calculates provincial rates at checkout
- [ ] Settings → Payments → Shopify Payments (enable Shop Pay, Apple Pay, Google Pay as desired). Test with Bogus Gateway / test mode
- [ ] Settings → Checkout → customer contact method, marketing consent (CASL-compliant opt-in wording), order notes on
- [ ] Settings → Customer accounts → choose new or classic accounts (theme supports both)
- [ ] Settings → Notifications → brand the order confirmation / shipping emails (logo from `brand-assets/`)

## Shipping — perfume is regulated ⚠
- [ ] **⚠ Verify with your carriers** (Canada Post, Purolator, UPS, FedEx…) how they classify alcohol-based perfume. Perfumes are generally **flammable liquids (UN1266, Class 3)**; small quantities may ship as *Limited Quantity* by **ground only**, often with packaging, marking and documentation rules, and air shipment may be restricted or prohibited. Remote and northern destinations may only be served by air
- [ ] Configure shipping zones and rates (Settings → Shipping and delivery) to match what carriers will actually accept — e.g. ground-only services, excluded regions
- [ ] If you show the free-shipping progress bar (Theme settings → Cart), set a matching free-shipping rate in Shopify
- [ ] **⚠ You provide** Processing times and delivery estimates for the Shipping Information page and shipping policy

## Policies (Settings → Policies)
Drafts are in `docs/policies/`. They are templates, not legal advice — have them reviewed.
- [ ] Refund / return policy (hygiene rules for opened fragrance, damaged items, timelines)
- [ ] Privacy policy (PIPEDA; Québec Law 25 if selling to Québec — name a person responsible for personal information)
- [ ] Terms of service
- [ ] Shipping policy
- [ ] Contact information

## Catalogue
- [ ] Create metafield definitions — `docs/METAFIELDS.md`
- [ ] Create collections and assign templates — README §2.1
- [ ] Tag products `noir` or `rose` (unisex products can be tagged with both; the first matching tag decides the product page world, or set `veloura.world`)
- [ ] **⚠ You provide** Real product photography (see `docs/ASSET_INVENTORY.md`), accurate titles, sizes, concentrations, notes, prices in CAD, inventory, SKUs, weights (needed for shipping rates)
- [ ] Delete or keep as draft any demo products imported from `demo-content/`
- [ ] Search & Discovery app: filters configured; optional product recommendations

## Theme
- [ ] Theme settings → Brand & worlds: Noir, Rosé, Discovery and Gift collections selected
- [ ] Homepage *Best sellers* section → choose the Best sellers collection
- [ ] Social links, share image (1200×628), favicon (optional — defaults to the V monogram)
- [ ] Replace built-in rendered artwork with real packaging/product photography where available (each section has an image picker)
- [ ] Newsletter consent wording reviewed (CASL)
- [ ] Test on iPhone Safari, Android Chrome, desktop Chrome/Safari/Firefox; test with "Reduce motion" turned on
- [ ] Place test orders (Noir product, Rosé product, mixed cart, discount code, French storefront)

## Information checklist to finalise copy
- Founding story and brand voice for About Us
- Support email, phone (optional), response time
- Sourcing / authenticity statement you can stand behind
- Miniature types sold (manufacturer minis, travel sprays, decants)
- Processing time, delivery estimates, carriers, regions served
- Return window, conditions, who pays return shipping
- Privacy contact person and data practices
