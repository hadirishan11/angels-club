# Angels Club — Designer Mini Perfume Store

An online storefront for designer mini perfumes (5 ml, 7.5 ml and 10 ml).
It's plain HTML, CSS and JavaScript with no build step, no framework and no server. You can host it anywhere for free.

## Features

- **Home page**: hero, category tiles (For Her, For Him, Unisex), bestsellers, new and limited, brand strip, how it works, reviews
- **Shop**: search, filters (category, scent family, brand, max price, in stock), sorting and shareable filter URLs
- **Product pages**: size picker with per-size prices, quantity, stock warnings, top/heart/base notes, related products
- **Discovery Box builder**: pick 3, 5 or 8 minis and get 10%, 15% or 20% off automatically
- **Cart**: slide-out bag, full cart page, free-shipping progress bar, promo codes (`ANGEL10`, `WELCOME15`)
- **Checkout**: contact and shipping form with validation, standard or express delivery, gift option, order confirmation
- **Wishlist**, brands directory, About, FAQ, Shipping & Returns and Contact pages
- Mobile-friendly and keyboard-accessible. The cart, wishlist and orders are saved in the visitor's browser.

## Run it locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

(You can also just double-click `index.html`.)

## Customize

Almost everything lives in **`assets/js/products.js`**:

| What | Where |
|---|---|
| Store name, email, social links | `STORE` at the top |
| Free-shipping threshold, shipping prices | `STORE.freeShippingThreshold`, `STORE.shipping` |
| Promo codes | `STORE.promoCodes` (code → discount, e.g. `0.10` = 10%) |
| Sizes and their price multipliers | `STORE.sizes` |
| Discovery box tiers | `STORE.boxes` |
| Products | the `PRODUCTS` list: copy one entry and edit it |

**Product photos:** by default each product shows a drawn bottle in its own colors. To use real photos, put them in `assets/img/` and add `image: "assets/img/your-photo.jpg"` to the product. Use your own photos or ones you're licensed to use.

**Placeholder text to replace before launch:** the email and social links in `STORE`, the three sample reviews on the home page (`app.js`, marked "Sample review, edit me"), and the policy wording on the FAQ and Shipping pages. Make sure it matches how you actually source and ship your products.

## Taking real payments

Checkout currently runs in **demo mode**: orders are saved only in the visitor's browser and no payment is taken. Before you start selling, connect a payment provider. Some options:

1. **Stripe Payment Links / Checkout**: the easiest option. Create the products in Stripe, then change `placeOrder()` in `assets/js/app.js` to send the customer to a Stripe Checkout session. For a dynamic cart this needs a small serverless function (Netlify or Vercel functions work well).
2. **Shopify Buy Button / Storefront API**: Shopify handles inventory, payments, taxes and order emails, and this site stays as your custom front end.
3. **Snipcart**: drop-in cart and checkout for static sites, configured with HTML attributes.

## Deploy (free)

- **GitHub Pages**: repo Settings → Pages → deploy from branch → select the branch and `/ (root)`.
- **Netlify / Vercel**: import the repo. There's no build command and the publish directory is the repo root.

## Notes

Brand names describe the genuine products being sold. The site doesn't use any brand logos. Only sell authentic products you're allowed to resell.
