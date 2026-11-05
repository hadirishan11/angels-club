# VELOURA — standalone site

A static single-page boutique, with no Shopify dependency.

- **Scroll story** (homepage): split Noir/Rosé hero → signature bottle → cap lift and mist → miniature-vs-full-size → discovery case unboxing.
- **3D:** procedural bottles (refractive glass with dispersion, dip tube, pump, brushed metal caps, embossed V monogram), animated satin/smoke backdrops, bloom on capable devices. Loaded lazily; static images are always shown first.
- **Shop:** Noir, Rosé and Shop-all pages with filters, sort and search. Product pages have an interactive 3D viewer.
- **Scent finder** (5 questions) and **Build a set** (3 or 5 minis in a 3D case).
- **Bag** stored in the browser. **Checkout stops before payment.** Connect Stripe Checkout, Shopify Buy Button or similar to take orders. Card details must never be collected on this site.
- **Demo catalogue:** `src/data/products.js` holds placeholder fragrances. Replace it with real products and photography.

```bash
npm install
npm run build        # outputs dist/ (deploy anywhere static: Netlify, Vercel, S3, Cloudflare Pages)
npm run serve        # http://localhost:8080
```

To re-render product images, run `node tools-render.mjs <dir>` (needs Playwright, with `.studio` served on :8802), then `python3 tools-images.py <dir> public/img`.
