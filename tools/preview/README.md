# Local design preview

`render.mjs` renders theme templates to static HTML with LiquidJS and mock data (demo products, empty cart) for visual QA without a Shopify store. Cart, search, filters and checkout need a real store — use `shopify theme dev --path veloura-theme` for that.

```bash
npm i liquidjs@10
node render.mjs ../../veloura-theme ./out     # then serve the repo root and open /<out>/index.html
```
