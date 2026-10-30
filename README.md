# Prestige Vault

Storefront for Prestige Vault luxury shadow-box frames. Plain HTML/CSS/JS — no build step.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page |
| `assets/config.js` | **Edit this** — products, prices, email, socials, FAQ, Stripe links |
| `assets/styles.css` | Look and feel (colors at the top) |
| `assets/art.js` | Illustrated frame renders, used until you have real photos |
| `assets/app.js` | Cart, product popup, checkout |
| `brand/` | Logo files |

## Before you launch

1. In `assets/config.js`, set your real `email`, `instagram`, `tiktok`, and check prices,
   shipping times, frame size and return policy match what your supplier gives you.
2. **Payments.** By default, Checkout opens an email with the order so you can confirm and
   invoice it. To take card payments, create a Stripe Payment Link for each product
   (Stripe Dashboard → Payment Links; add a custom field for "Name to engrave" on The Legacy)
   and paste it into that product's `stripeLink`.
3. **Photos.** Swap the illustrations for real product photos when you have them.

## Put it online (free)

GitHub Pages: repo **Settings → Pages → Deploy from a branch → `master` / root**.
Your site will be at `https://<your-username>.github.io/angels-club/`, and you can connect
your own domain on the same page.
