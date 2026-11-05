/* =========================================================
   Angels Club — storefront app (no build step, no framework)
   Hash routes: #/  #/shop  #/product/:id  #/box  #/cart
                #/checkout  #/order/:id  #/wishlist  #/brands
                #/about  #/faq  #/shipping  #/contact
   ========================================================= */
(() => {
  "use strict";

  /* ---------------- Utilities ---------------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = new Intl.NumberFormat(STORE.locale, { style: "currency", currency: STORE.currency });
  const money = (n) => fmt.format(Math.round(n * 100) / 100);
  const round2 = (n) => Math.round(n * 100) / 100;

  const storage = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ } },
  };

  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort();
  const FAMILIES = [...new Set(PRODUCTS.map((p) => p.family))].sort();
  const GENDERS = [["women", "For Her"], ["men", "For Him"], ["unisex", "Unisex"]];
  const MAX_PRICE = Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)) / 5) * 5;

  // 5 ml = base price; larger sizes are rounded to the nearest whole amount
  const priceFor = (p, ml = 5) => {
    const s = STORE.sizes.find((x) => x.ml === ml) || STORE.sizes[0];
    return s.mult === 1 ? p.price : Math.round(p.price * s.mult);
  };

  function tint(hex, amt) {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const m = (c) => Math.round(c + (255 - c) * amt);
    return `rgb(${m(r)},${m(g)},${m(b)})`;
  }
  function isDark(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (r * 299 + g * 587 + b * 114) / 1000 < 110;
  }

  /* ---------------- Bottle illustration ---------------- */
  const SHORT = {
    "Yves Saint Laurent": "YSL", "Salvatore Ferragamo": "FERRAGAMO", "Carolina Herrera": "HERRERA",
    "Maison Margiela": "MARGIELA", "Jean Paul Gaultier": "GAULTIER", "Giorgio Armani": "ARMANI",
    "Tiffany & Co.": "TIFFANY", "Clean Reserve": "CLEAN", "Viktor&Rolf": "V&R", "Marc Jacobs": "MARC JACOBS",
  };
  let svgUid = 0;
  function bottle(p, cls = "") {
    if (p.image) return `<img src="${esc(p.image)}" alt="${esc(p.brand + " " + p.name)}" loading="lazy" class="${cls}">`;
    const id = "g" + ++svgUid;
    const c = p.color, cap = p.cap;
    const dark = isDark(c);
    const S = {
      square: { body: `<rect x="18" y="56" width="84" height="98" rx="9"/>`, neck: [50, 46, 20, 12], cap: `<rect x="36" y="12" width="48" height="36" rx="4"/>`, label: [32, 86, 56, 38] },
      tall:   { body: `<rect x="30" y="44" width="60" height="112" rx="7"/>`, neck: [52, 34, 16, 12], cap: `<rect x="42" y="4" width="36" height="32" rx="4"/>`, label: [38, 84, 44, 40] },
      round:  { body: `<ellipse cx="60" cy="108" rx="50" ry="48"/>`, neck: [51, 50, 18, 12], cap: `<rect x="40" y="16" width="40" height="36" rx="8"/>`, label: [36, 96, 48, 30] },
      wide:   { body: `<rect x="6" y="66" width="108" height="88" rx="16"/>`, neck: [50, 56, 20, 12], cap: `<rect x="38" y="24" width="44" height="34" rx="5"/>`, label: [30, 92, 60, 36] },
      slim:   { body: `<path d="M40 58 h40 q10 0 12 12 l8 74 q1 10 -10 10 h-60 q-11 0 -10 -10 l8 -74 q2 -12 12 -12z"/>`, neck: [52, 48, 16, 12], cap: `<rect x="46" y="2" width="28" height="48" rx="12"/>`, label: [38, 92, 44, 34] },
    }[p.shape] || null;
    const g = S || { body: `<rect x="18" y="56" width="84" height="98" rx="9"/>`, neck: [50, 46, 20, 12], cap: `<rect x="36" y="12" width="48" height="36" rx="4"/>`, label: [32, 86, 56, 38] };
    const [nx, ny, nw, nh] = g.neck;
    const [lx, ly, lw, lh] = g.label;
    const brand = esc(SHORT[p.brand] || p.brand.toUpperCase());
    const name = esc(p.name.length > 16 ? p.name.slice(0, 15) + "…" : p.name);
    const labelFill = dark ? "#f6efe6" : "#ffffff";
    return `<svg class="bottle ${cls}" viewBox="0 0 120 160" role="img" aria-label="${esc(p.brand + " " + p.name)} mini bottle">
      <defs>
        <linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${tint(c, dark ? 0.25 : 0.35)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${tint(c, dark ? 0.05 : 0)}"/>
        </linearGradient>
        <linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${tint(cap, 0.35)}"/><stop offset=".5" stop-color="${cap}"/><stop offset="1" stop-color="${tint(cap, 0.15)}"/>
        </linearGradient>
      </defs>
      <rect x="${nx}" y="${ny}" width="${nw}" height="${nh}" fill="#d9c7a0"/>
      <g fill="url(#${id}c)" stroke="rgba(0,0,0,.12)" stroke-width="1">${g.cap}</g>
      <g fill="url(#${id}l)" stroke="rgba(0,0,0,.14)" stroke-width="1.2">${g.body}</g>
      <rect x="${lx - 8}" y="${ly - 22}" width="6" height="${lh + 40}" rx="3" fill="#fff" opacity=".28"/>
      <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="2" fill="${labelFill}" opacity=".94"/>
      <text x="60" y="${ly + lh * 0.45}" text-anchor="middle" font-family="Cormorant Garamond, serif" font-weight="700" font-size="${brand.length > 9 ? 6.5 : 8.5}" letter-spacing=".6" fill="#1b1418">${brand}</text>
      <text x="60" y="${ly + lh * 0.75}" text-anchor="middle" font-family="Jost, sans-serif" font-size="4.6" fill="#6b5d63">${name}</text>
    </svg>`;
  }
  const mediaBg = (p) => `background: radial-gradient(circle at 50% 45%, #fff 0%, ${tint(p.color, isDark(p.color) ? 0.86 : 0.7)} 100%)`;

  /* ---------------- State ---------------- */
  const state = {
    cart: storage.get("ac_cart", []),
    wish: storage.get("ac_wish", []),
    orders: storage.get("ac_orders", []),
    promo: storage.get("ac_promo", null),
  };
  const save = () => {
    storage.set("ac_cart", state.cart);
    storage.set("ac_wish", state.wish);
    storage.set("ac_orders", state.orders);
    storage.set("ac_promo", state.promo);
  };

  /* ---------------- Cart logic ---------------- */
  const boxTier = (count) => STORE.boxes.find((b) => b.count === count) || STORE.boxes[0];
  function linePrice(item) {
    if (item.type === "box") {
      const sum = item.picks.reduce((s, id) => s + (byId[id] ? priceFor(byId[id], 5) : 0), 0);
      return round2(sum * (1 - boxTier(item.picks.length).discount));
    }
    const p = byId[item.id];
    return p ? priceFor(p, item.ml) : 0;
  }
  function cartTotals(shipMethod = "standard") {
    const items = state.cart.filter((i) => i.type === "box" || byId[i.id]);
    const subtotal = round2(items.reduce((s, i) => s + linePrice(i) * i.qty, 0));
    const count = items.reduce((s, i) => s + i.qty, 0);
    const rate = state.promo && STORE.promoCodes[state.promo] ? STORE.promoCodes[state.promo] : 0;
    const discount = round2(subtotal * rate);
    const afterDiscount = subtotal - discount;
    let shipping = 0;
    if (count > 0) {
      if (shipMethod === "express") shipping = STORE.shipping.express;
      else shipping = afterDiscount >= STORE.freeShippingThreshold ? 0 : STORE.shipping.standard;
    }
    return { items, subtotal, discount, shipping, total: round2(afterDiscount + shipping), count, rate };
  }
  function stockFor(id) { return byId[id] ? byId[id].stock : 0; }
  function qtyInCart(id) { return state.cart.filter((i) => i.type !== "box" && i.id === id).reduce((s, i) => s + i.qty, 0); }

  function addToCart(id, ml = 5, qty = 1) {
    const p = byId[id];
    if (!p || p.stock <= 0) return toast("Sorry, this one is sold out.");
    const available = p.stock - qtyInCart(id);
    if (available <= 0) return toast(`Only ${p.stock} available — they're all in your bag.`);
    qty = Math.min(qty, available);
    const key = `${id}|${ml}`;
    const existing = state.cart.find((i) => i.key === key);
    if (existing) existing.qty += qty; else state.cart.push({ key, type: "single", id, ml, qty });
    save(); updateBadges(); renderDrawer(); openCart();
  }
  function addBox(picks) {
    state.cart.push({ key: "box-" + Date.now(), type: "box", picks: [...picks], qty: 1 });
    save(); updateBadges(); renderDrawer(); openCart();
  }
  function setQty(key, qty) {
    const item = state.cart.find((i) => i.key === key);
    if (!item) return;
    if (qty <= 0) state.cart = state.cart.filter((i) => i.key !== key);
    else {
      if (item.type !== "box") {
        const others = qtyInCart(item.id) - item.qty;
        const max = stockFor(item.id) - others;
        if (qty > max) { toast(`Only ${stockFor(item.id)} in stock.`); qty = max; }
      }
      item.qty = Math.max(1, qty);
    }
    save(); updateBadges(); renderDrawer();
    if (currentPath().startsWith("/cart") || currentPath().startsWith("/checkout")) render();
  }
  function toggleWish(id) {
    const on = state.wish.includes(id);
    state.wish = on ? state.wish.filter((x) => x !== id) : [...state.wish, id];
    save(); updateBadges();
    $$(`[data-action="wish"][data-id="${id}"]`).forEach((b) => { b.classList.toggle("on", !on); b.setAttribute("aria-pressed", String(!on)); });
    toast(on ? "Removed from wishlist" : "Saved to wishlist ♡");
    if (currentPath() === "/wishlist") render();
  }

  /* ---------------- UI helpers ---------------- */
  let toastTimer;
  function toast(msg) {
    const t = $(".toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
  }
  function updateBadges() {
    const { count } = cartTotals();
    const cc = $("[data-cart-count]"); cc.textContent = count; cc.hidden = count === 0;
    const wc = $("[data-wish-count]"); wc.textContent = state.wish.length; wc.hidden = state.wish.length === 0;
  }
  function openCart() {
    $("#cart-drawer").classList.add("open"); $("#cart-drawer").setAttribute("aria-hidden", "false");
    $(".drawer-overlay").hidden = false; document.body.style.overflow = "hidden";
  }
  function closeCart() {
    $("#cart-drawer").classList.remove("open"); $("#cart-drawer").setAttribute("aria-hidden", "true");
    $(".drawer-overlay").hidden = true; document.body.style.overflow = "";
  }
  const stars = (r) => "★★★★★".slice(0, Math.round(r)) + "☆☆☆☆☆".slice(0, 5 - Math.round(r));
  const heart = `<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>`;

  function card(p) {
    const tag = p.stock <= 0 ? ["soldout", "Sold out"] : p.tags.includes("new") ? ["new", "New"] : p.tags.includes("limited") ? ["limited", "Limited"] : p.tags.includes("bestseller") ? ["bestseller", "Bestseller"] : null;
    const wished = state.wish.includes(p.id);
    return `<article class="card">
      ${tag ? `<span class="tag tag-${tag[0]}">${tag[1]}</span>` : ""}
      <button class="icon-btn wish-btn ${wished ? "on" : ""}" data-action="wish" data-id="${p.id}" aria-pressed="${wished}" aria-label="Save ${esc(p.name)} to wishlist">${heart}</button>
      <a href="#/product/${p.id}" class="card-media" style="${mediaBg(p)}">${bottle(p)}</a>
      <div class="card-body">
        <span class="card-brand">${esc(p.brand)}</span>
        <a href="#/product/${p.id}" class="card-name">${esc(p.name)}</a>
        <span class="card-meta"><span class="stars" aria-label="Rated ${p.rating} out of 5">${stars(p.rating)}</span> ${p.reviews} · ${esc(p.family)}</span>
        <div class="card-foot">
          <span class="price"><small>from</small> ${money(priceFor(p, 5))}</span>
          <button class="card-add" data-action="quick-add" data-id="${p.id}" ${p.stock <= 0 ? "disabled" : ""} aria-label="Add ${esc(p.name)} 5 ml to bag">+</button>
        </div>
      </div>
    </article>`;
  }

  /* ---------------- Router ---------------- */
  function parseHash() {
    const raw = location.hash.slice(1) || "/";
    const [path, qs] = raw.split("?");
    return { path: path || "/", params: new URLSearchParams(qs || "") };
  }
  const currentPath = () => parseHash().path;
  let lastPath = null;

  function render() {
    const { path, params } = parseHash();
    const app = $("#app");
    const seg = path.split("/").filter(Boolean);
    let view;
    switch (seg[0]) {
      case undefined: view = viewHome(); break;
      case "shop": view = viewShop(params); break;
      case "product": view = viewProduct(seg[1]); break;
      case "box": view = viewBox(); break;
      case "cart": view = viewCart(); break;
      case "checkout": view = viewCheckout(); break;
      case "order": view = viewOrder(seg[1]); break;
      case "wishlist": view = viewWishlist(); break;
      case "brands": view = viewBrands(); break;
      case "about": view = viewAbout(); break;
      case "faq": view = viewFaq(); break;
      case "shipping": view = viewShipping(); break;
      case "contact": view = viewContact(); break;
      default: view = viewNotFound();
    }
    app.innerHTML = view.html;
    document.title = view.title ? `${view.title} — ${STORE.name}` : `${STORE.name} — Designer Mini Perfumes`;
    if (view.after) view.after();
    // nav active state
    $$(".main-nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === location.hash));
    // close mobile menu
    $(".mobile-nav").hidden = true; $(".menu-toggle").setAttribute("aria-expanded", "false");
    if (path !== lastPath) window.scrollTo(0, 0);
    lastPath = path;
  }

  /* ---------------- Views ---------------- */
  function viewHome() {
    const pick = (ids) => ids.map((id) => byId[id]).filter(Boolean);
    const heroBottles = pick(["chanel-coco-mademoiselle", "tf-lost-cherry", "dior-sauvage", "ch-good-girl", "ysl-libre"]);
    const best = PRODUCTS.filter((p) => p.tags.includes("bestseller")).slice(0, 8);
    const fresh = PRODUCTS.filter((p) => p.tags.includes("new") || p.tags.includes("limited")).slice(0, 4);
    const featuredBrands = ["Chanel", "Dior", "Tom Ford", "Yves Saint Laurent", "Gucci", "Prada", "Valentino", "Carolina Herrera", "Creed", "Viktor&Rolf"];
    const catArt = (ids) => pick(ids).map((p) => bottle(p)).join("");
    const minBox = STORE.boxes[0];
    return {
      title: "",
      html: `
      <section class="hero">
        <div class="container hero-grid">
          <div>
            <span class="eyebrow">Designer minis · 5 ml – 10 ml</span>
            <h1>Find your signature scent, <em>one mini</em> at a time.</h1>
            <p class="lead">Chanel, Dior, Tom Ford, YSL and more, in travel-size minis. Try the fragrances you've been curious about before you buy a full bottle.</p>
            <div class="hero-cta">
              <a href="#/shop" class="btn btn-dark">Shop all minis</a>
              <a href="#/box" class="btn btn-outline">Build a discovery box</a>
            </div>
            <div class="hero-stats">
              <div><strong>${PRODUCTS.length}+</strong><span>Designer scents</span></div>
              <div><strong>${BRANDS.length}</strong><span>Luxury houses</span></div>
              <div><strong>4.8★</strong><span>Average rating</span></div>
            </div>
          </div>
          <div class="hero-art" aria-hidden="true">
            ${heroBottles.map((p, i) => bottle(p, "b" + (i + 1))).join("")}
          </div>
        </div>
      </section>

      <section class="trust">
        <div class="container trust-grid">
          <div class="trust-item"><span class="ico">✦</span><div><strong>Genuine designer minis</strong><span>From trusted suppliers</span></div></div>
          <div class="trust-item"><span class="ico">⛟</span><div><strong>Free shipping</strong><span>On orders over ${money(STORE.freeShippingThreshold)}</span></div></div>
          <div class="trust-item"><span class="ico">❀</span><div><strong>Gift-ready packaging</strong><span>Every order, every time</span></div></div>
          <div class="trust-item"><span class="ico">↺</span><div><strong>Easy returns</strong><span>On unopened items</span></div></div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head"><div><span class="eyebrow">Shop by category</span><h2>Something for everyone</h2></div></div>
          <div class="cat-grid">
            <a href="#/shop?gender=women" class="cat-tile cat-her"><div class="cat-art">${catArt(["dior-miss-dior", "chanel-coco-mademoiselle", "valentino-born-in-roma"])}</div><h3>For Her</h3><p>Florals, gourmands &amp; icons</p></a>
            <a href="#/shop?gender=men" class="cat-tile cat-him"><div class="cat-art">${catArt(["chanel-bleu-edp", "dior-sauvage", "vr-spicebomb-extreme"])}</div><h3>For Him</h3><p>Fresh, woody &amp; magnetic</p></a>
            <a href="#/shop?gender=unisex" class="cat-tile cat-uni"><div class="cat-art">${catArt(["tf-soleil-blanc", "tf-tobacco-vanille", "mm-by-the-fireplace"])}</div><h3>Unisex</h3><p>Niche &amp; boundary-free</p></a>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0">
        <div class="container">
          <div class="section-head"><div><span class="eyebrow">Most loved</span><h2>Bestsellers</h2></div><a href="#/shop?tag=bestseller" class="link-arrow">View all →</a></div>
          <div class="grid">${best.map(card).join("")}</div>
        </div>
      </section>

      <section class="section" style="padding-top:0">
        <div class="container">
          <div class="promo">
            <div class="promo-copy">
              <span class="eyebrow" style="color:var(--gold-light)">Discovery box</span>
              <h2>Can't choose? Build your own box.</h2>
              <p>Pick any ${STORE.boxes.map((b) => b.count).join(", ").replace(/, (\d+)$/, " or $1")} minis from the collection. The more you pick, the more you save.</p>
              <div class="promo-tiers">
                ${STORE.boxes.map((b) => `<div><strong>${b.count}</strong><span>minis · ${Math.round(b.discount * 100)}% off</span></div>`).join("")}
              </div>
              <a href="#/box" class="btn btn-gold">Start building</a>
            </div>
            <div class="promo-art" aria-hidden="true">${catArt(["ysl-black-opium", "tf-lost-cherry", "ch-good-girl", "chanel-no5-edp", "burberry-goddess"])}</div>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0">
        <div class="container">
          <div class="section-head"><div><span class="eyebrow">Just landed</span><h2>New &amp; limited</h2></div><a href="#/shop?tag=new" class="link-arrow">Shop new →</a></div>
          <div class="grid">${fresh.map(card).join("")}</div>
        </div>
      </section>

      <section class="section" style="background:#fff;border-block:1px solid var(--line)">
        <div class="container center">
          <span class="eyebrow">The houses</span><h2>Shop by brand</h2>
          <div class="brand-strip" style="margin-top:24px">
            ${featuredBrands.filter((b) => BRANDS.includes(b)).map((b) => `<a class="brand-chip" href="#/shop?brand=${encodeURIComponent(b)}">${esc(b)}</a>`).join("")}
            <a class="brand-chip" href="#/brands">All brands →</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head"><div><span class="eyebrow">Why minis?</span><h2>How the club works</h2></div></div>
          <div class="steps">
            <div class="step"><h3>Discover</h3><p>Browse ${PRODUCTS.length}+ designer fragrances and filter by scent family, brand or price.</p></div>
            <div class="step"><h3>Try</h3><p>Wear a mini for a week or two. It's the best way to see how a scent works on your skin before buying a full bottle.</p></div>
            <div class="step"><h3>Fall in love</h3><p>Keep your favorites in your bag for touch-ups, or build a wardrobe of scents for every mood.</p></div>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0">
        <div class="container">
          <div class="section-head"><div><span class="eyebrow">Kind words</span><h2>From the club</h2></div></div>
          <div class="reviews">
            <div class="review"><span class="stars">★★★★★</span><blockquote>"I tried six scents before choosing my new signature. No more blind-buying full bottles!"</blockquote><cite>— Sample review, edit me</cite></div>
            <div class="review"><span class="stars">★★★★★</span><blockquote>"The discovery box was the perfect birthday gift. Beautifully packaged."</blockquote><cite>— Sample review, edit me</cite></div>
            <div class="review"><span class="stars">★★★★★</span><blockquote>"Perfect size for my handbag and for travel. Fast shipping too."</blockquote><cite>— Sample review, edit me</cite></div>
          </div>
        </div>
      </section>`,
    };
  }

  /* ----- Shop ----- */
  function readFilters(params) {
    return {
      q: params.get("q") || "",
      gender: (params.get("gender") || "").split(",").filter(Boolean),
      brand: (params.get("brand") || "").split(",").filter(Boolean),
      family: (params.get("family") || "").split(",").filter(Boolean),
      tag: params.get("tag") || "",
      max: Number(params.get("max")) || MAX_PRICE,
      sort: params.get("sort") || "featured",
      instock: params.get("instock") === "1",
    };
  }
  function applyFilters(f) {
    const q = f.q.trim().toLowerCase();
    let list = PRODUCTS.filter((p) =>
      (!q || [p.name, p.brand, p.family, ...p.notes.top, ...p.notes.heart, ...p.notes.base].join(" ").toLowerCase().includes(q)) &&
      (!f.gender.length || f.gender.includes(p.gender)) &&
      (!f.brand.length || f.brand.includes(p.brand)) &&
      (!f.family.length || f.family.includes(p.family)) &&
      (!f.tag || p.tags.includes(f.tag)) &&
      (!f.instock || p.stock > 0) &&
      p.price <= f.max
    );
    const sorters = {
      featured: (a, b) => (b.tags.includes("bestseller") - a.tags.includes("bestseller")) || b.reviews - a.reviews,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return list.sort(sorters[f.sort] || sorters.featured);
  }
  function filtersToQuery(f) {
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.gender.length) p.set("gender", f.gender.join(","));
    if (f.brand.length) p.set("brand", f.brand.join(","));
    if (f.family.length) p.set("family", f.family.join(","));
    if (f.tag) p.set("tag", f.tag);
    if (f.max < MAX_PRICE) p.set("max", f.max);
    if (f.sort !== "featured") p.set("sort", f.sort);
    if (f.instock) p.set("instock", "1");
    const s = p.toString();
    return "#/shop" + (s ? "?" + s : "");
  }
  function shopTitle(f) {
    if (f.q) return `Results for “${esc(f.q)}”`;
    if (f.brand.length === 1 && !f.gender.length) return esc(f.brand[0]);
    if (f.gender.length === 1) return { women: "For Her", men: "For Him", unisex: "Unisex" }[f.gender[0]];
    if (f.tag === "new") return "New Arrivals";
    if (f.tag === "bestseller") return "Bestsellers";
    return "All Mini Perfumes";
  }

  function viewShop(params) {
    const f = readFilters(params);
    const count = (key, val) => PRODUCTS.filter((p) => p[key] === val).length;
    const checks = (name, list, sel, labelFn = (x) => x, key = name) =>
      list.map((v) => `<label class="check"><input type="checkbox" name="${name}" value="${esc(v)}" ${sel.includes(v) ? "checked" : ""}> ${esc(labelFn(v))}<span class="count">${count(key, v)}</span></label>`).join("");
    return {
      title: shopTitle(f).replace(/&[^;]+;/g, ""),
      html: `
      <section class="page-head">
        <div class="container">
          <div class="crumbs"><a href="#/">Home</a> / Shop</div>
          <h1 data-shop-title>${shopTitle(f)}</h1>
          <p class="muted">Authentic designer minis in 5 ml, 7.5 ml and 10 ml.</p>
        </div>
      </section>
      <section class="container section-sm">
        <div class="shop-layout">
          <form class="filters" data-form="filters" aria-label="Filters">
            <h4>Search</h4>
            <input class="input" type="search" name="q" value="${esc(f.q)}" placeholder="Name, brand or note…">
            <h4>Category</h4>
            ${checks("gender", GENDERS.map((g) => g[0]), f.gender, (v) => GENDERS.find((g) => g[0] === v)[1])}
            <h4>Scent family</h4>
            ${checks("family", FAMILIES, f.family)}
            <h4>Brand</h4>
            ${checks("brand", BRANDS, f.brand)}
            <h4>Max price (5 ml)</h4>
            <input type="range" name="max" min="10" max="${MAX_PRICE}" step="1" value="${f.max}" aria-label="Maximum price">
            <div class="range-row"><span>${money(10)}</span><span data-max-label>${money(f.max)}</span></div>
            <h4>Availability</h4>
            <label class="check"><input type="checkbox" name="instock" value="1" ${f.instock ? "checked" : ""}> In stock only</label>
            <input type="hidden" name="tag" value="${esc(f.tag)}">
            <button type="button" class="btn btn-outline btn-block" style="margin-top:18px" data-action="clear-filters">Clear all</button>
          </form>
          <div>
            <div class="shop-toolbar">
              <button type="button" class="btn btn-outline filter-toggle" data-action="toggle-filters">Filters</button>
              <span class="count-label" data-count-label></span>
              <select class="select" name="sort" form="" data-sort aria-label="Sort products">
                ${[["featured", "Featured"], ["rating", "Top rated"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["name", "Name A–Z"]].map(([v, l]) => `<option value="${v}" ${f.sort === v ? "selected" : ""}>${l}</option>`).join("")}
              </select>
            </div>
            <div class="chips" data-chips></div>
            <div data-results></div>
          </div>
        </div>
      </section>`,
      after: () => renderShopResults(f),
    };
  }
  function currentShopFilters() {
    const form = $('[data-form="filters"]');
    const fd = new FormData(form);
    return {
      q: (fd.get("q") || "").toString(),
      gender: fd.getAll("gender"), brand: fd.getAll("brand"), family: fd.getAll("family"),
      tag: (fd.get("tag") || "").toString(),
      max: Number(fd.get("max")) || MAX_PRICE,
      sort: $("[data-sort]").value,
      instock: fd.get("instock") === "1",
    };
  }
  function renderShopResults(f) {
    const list = applyFilters(f);
    $("[data-count-label]").textContent = `${list.length} ${list.length === 1 ? "fragrance" : "fragrances"}`;
    $("[data-max-label]").textContent = money(f.max);
    const chips = [
      ...f.gender.map((v) => ["gender", v, GENDERS.find((g) => g[0] === v)?.[1] || v]),
      ...f.family.map((v) => ["family", v, v]),
      ...f.brand.map((v) => ["brand", v, v]),
      ...(f.tag ? [["tag", f.tag, f.tag === "new" ? "New" : f.tag === "bestseller" ? "Bestsellers" : f.tag]] : []),
      ...(f.q ? [["q", f.q, `“${f.q}”`]] : []),
    ];
    $("[data-chips]").innerHTML = chips.map(([k, v, l]) => `<span class="chip">${esc(l)} <button type="button" data-action="remove-chip" data-k="${k}" data-v="${esc(v)}" aria-label="Remove filter ${esc(l)}">✕</button></span>`).join("");
    $("[data-results]").innerHTML = list.length
      ? `<div class="grid">${list.map(card).join("")}</div>`
      : `<div class="empty"><div class="big">No perfumes match</div><p class="muted">Try removing a filter or searching for something else.</p><button class="btn btn-dark" data-action="clear-filters">Clear filters</button></div>`;
    $("[data-shop-title]").innerHTML = shopTitle(f);
    history.replaceState(null, "", filtersToQuery(f));
  }

  /* ----- Product ----- */
  function viewProduct(id) {
    const p = byId[id];
    if (!p) return viewNotFound();
    const related = PRODUCTS.filter((x) => x.id !== p.id && (x.brand === p.brand || x.family === p.family) && x.gender === p.gender)
      .concat(PRODUCTS.filter((x) => x.id !== p.id && x.gender === p.gender))
      .filter((x, i, arr) => arr.indexOf(x) === i).slice(0, 4);
    const wished = state.wish.includes(p.id);
    const gLabel = GENDERS.find((g) => g[0] === p.gender)[1];
    const stockNote = p.stock <= 0 ? `<p class="stock-note low">Sold out. Check back soon!</p>`
      : p.stock <= 8 ? `<p class="stock-note low">Only ${p.stock} left in stock</p>`
      : `<p class="stock-note ok">● In stock, ready to ship</p>`;
    return {
      title: `${p.brand} ${p.name} Mini`,
      html: `
      <div class="container">
        <div class="crumbs" style="margin-top:24px"><a href="#/">Home</a> / <a href="#/shop?gender=${p.gender}">${gLabel}</a> / <a href="#/shop?brand=${encodeURIComponent(p.brand)}">${esc(p.brand)}</a> / ${esc(p.name)}</div>
        <div class="pdp" data-pdp="${p.id}">
          <div class="pdp-media" style="${mediaBg(p)}">${bottle(p)}</div>
          <div>
            <a class="pdp-brand" href="#/shop?brand=${encodeURIComponent(p.brand)}">${esc(p.brand)}</a>
            <h1>${esc(p.name)}</h1>
            <div class="meta-row"><span><span class="stars">${stars(p.rating)}</span> ${p.rating} (${p.reviews} reviews)</span><span>·</span><span>${esc(p.conc)}</span><span>·</span><span>${esc(p.family)}</span><span>·</span><span>${gLabel}</span></div>
            <div class="price-big" data-price>${money(priceFor(p, 5))}</div>
            <p class="muted" style="font-size:.85rem">Tax included where applicable. Shipping calculated at checkout.</p>
            <p>${esc(p.desc)}</p>

            <span class="option-label">Size</span>
            <div class="sizes" role="radiogroup" aria-label="Size">
              ${STORE.sizes.map((s, i) => `<button type="button" class="size-btn ${i === 0 ? "active" : ""}" role="radio" aria-checked="${i === 0}" data-action="pick-size" data-ml="${s.ml}"><strong>${s.ml} ml</strong><span>${money(priceFor(p, s.ml))}</span></button>`).join("")}
            </div>

            <div class="buy-row">
              <div class="qty" aria-label="Quantity">
                <button type="button" data-action="pdp-qty" data-d="-1" aria-label="Decrease quantity">−</button>
                <span data-qty>1</span>
                <button type="button" data-action="pdp-qty" data-d="1" aria-label="Increase quantity">+</button>
              </div>
              <button class="btn btn-dark" data-action="pdp-add" data-id="${p.id}" ${p.stock <= 0 ? "disabled" : ""}>${p.stock <= 0 ? "Sold out" : "Add to bag"}</button>
              <button class="icon-btn wish-btn ${wished ? "on" : ""}" style="position:static;width:50px;height:50px;border:1px solid var(--line);background:#fff" data-action="wish" data-id="${p.id}" aria-pressed="${wished}" aria-label="Save to wishlist">${heart}</button>
            </div>
            ${stockNote}

            <span class="option-label">Fragrance notes</span>
            <div class="notes">
              <div class="note-col"><h5>Top</h5><p>${p.notes.top.map(esc).join(", ")}</p></div>
              <div class="note-col"><h5>Heart</h5><p>${p.notes.heart.map(esc).join(", ")}</p></div>
              <div class="note-col"><h5>Base</h5><p>${p.notes.base.map(esc).join(", ")}</p></div>
            </div>

            <ul class="perks">
              <li>Free shipping on orders over ${money(STORE.freeShippingThreshold)}</li>
              <li>Add it to a <a href="#/box" style="text-decoration:underline">discovery box</a> and save up to ${Math.round(Math.max(...STORE.boxes.map((b) => b.discount)) * 100)}%</li>
              <li>Gift-ready packaging included</li>
            </ul>

            <div style="margin-top:26px">
              <details class="acc"><summary>How to wear it</summary><p>Spray or dab onto pulse points (wrists, neck, behind the ears). Let it dry naturally, without rubbing. A 5 ml mini gives you roughly 60–80 sprays, enough to wear it for 3–4 weeks.</p></details>
              <details class="acc"><summary>Shipping &amp; returns</summary><p>Orders ship within 1–2 business days. Unopened items can be returned within 14 days. <a href="#/shipping" style="text-decoration:underline">Full policy</a>.</p></details>
              <details class="acc"><summary>Authenticity</summary><p>Every mini we sell is a genuine designer product. <a href="#/faq" style="text-decoration:underline">Read more</a>.</p></details>
            </div>
          </div>
        </div>
      </div>
      ${related.length ? `<section class="section" style="padding-top:0"><div class="container"><div class="section-head"><h2>You may also love</h2></div><div class="grid">${related.map(card).join("")}</div></div></section>` : ""}`,
    };
  }

  /* ----- Discovery box ----- */
  const boxState = { count: STORE.boxes[1] ? STORE.boxes[1].count : STORE.boxes[0].count, picks: [], gender: "" };
  function viewBox() {
    return {
      title: "Build Your Discovery Box",
      html: `
      <section class="page-head">
        <div class="container">
          <div class="crumbs"><a href="#/">Home</a> / Discovery Box</div>
          <h1>Build your discovery box</h1>
          <p class="muted">Choose a box size, then pick your 5 ml minis. Your discount is applied automatically.</p>
        </div>
      </section>
      <section class="container section-sm">
        <div class="box-layout">
          <div>
            <div class="box-sizes" role="radiogroup" aria-label="Box size">
              ${STORE.boxes.map((b) => `<button type="button" class="box-size" role="radio" data-action="box-size" data-count="${b.count}"><strong>${b.count} minis</strong><span>Save ${Math.round(b.discount * 100)}%</span></button>`).join("")}
            </div>
            <div class="shop-toolbar">
              <span class="option-label" style="margin:0">Choose your scents</span>
              <select class="select" data-box-gender aria-label="Filter by category">
                <option value="">All categories</option>
                ${GENDERS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}
              </select>
            </div>
            <div class="pick-grid" data-picks></div>
          </div>
          <aside class="summary" data-box-summary></aside>
        </div>
      </section>`,
      after: () => { $("[data-box-gender]").value = boxState.gender; renderBox(); },
    };
  }
  function renderBox() {
    const tier = boxTier(boxState.count);
    boxState.picks = boxState.picks.slice(0, boxState.count);
    $$(".box-size").forEach((b) => { const on = Number(b.dataset.count) === boxState.count; b.classList.toggle("active", on); b.setAttribute("aria-checked", on); });
    const full = boxState.picks.length >= boxState.count;
    const list = PRODUCTS.filter((p) => p.stock > 0 && (!boxState.gender || p.gender === boxState.gender));
    $("[data-picks]").innerHTML = list.map((p) => {
      const on = boxState.picks.includes(p.id);
      return `<button type="button" class="pick ${on ? "on" : ""}" data-action="box-pick" data-id="${p.id}" aria-pressed="${on}" ${!on && full ? "disabled" : ""}>
        <div class="pick-media" style="${mediaBg(p)}">${bottle(p)}</div>
        <span class="card-brand">${esc(p.brand)}</span>
        <div class="card-name">${esc(p.name)}</div>
        <span class="card-meta">${money(priceFor(p, 5))}</span>
      </button>`;
    }).join("");
    const sum = boxState.picks.reduce((s, id) => s + priceFor(byId[id], 5), 0);
    const save = round2(sum * tier.discount);
    const slots = Array.from({ length: boxState.count }, (_, i) => {
      const p = byId[boxState.picks[i]];
      return `<div class="slot">${p ? bottle(p) + `<button type="button" data-action="box-pick" data-id="${p.id}" aria-label="Remove ${esc(p.name)}">✕</button>` : `<span class="muted" style="font-size:.8rem">${i + 1}</span>`}</div>`;
    }).join("");
    $("[data-box-summary]").innerHTML = `
      <h3>Your box</h3>
      <p class="muted" style="font-size:.88rem">${boxState.picks.length} of ${boxState.count} selected</p>
      <div class="slots">${slots}</div>
      <div class="sum-row"><span>Minis value</span><span>${money(sum)}</span></div>
      <div class="sum-row"><span>Box discount (${Math.round(tier.discount * 100)}%)</span><span class="save">−${money(save)}</span></div>
      <div class="sum-row total"><span>Box price</span><span>${money(sum - save)}</span></div>
      <button class="btn btn-dark btn-block" style="margin-top:14px" data-action="box-add" ${full ? "" : "disabled"}>${full ? "Add box to bag" : `Pick ${boxState.count - boxState.picks.length} more`}</button>`;
  }

  /* ----- Cart ----- */
  function lineHTML(item, compact = false) {
    const price = linePrice(item);
    if (item.type === "box") {
      const picks = item.picks.map((id) => byId[id]).filter(Boolean);
      const media = picks[0] ? `<div class="line-media" style="${mediaBg(picks[0])}">${bottle(picks[0])}</div>` : `<div class="line-media"></div>`;
      return `<div class="line">${media}
        <div><div class="line-name">Discovery Box · ${picks.length} minis</div>
        <div class="box-picks">${picks.map((p) => esc(p.brand + " " + p.name)).join(" · ")}</div>
        <div class="line-actions">${qtyControl(item)}<button class="link-btn" data-action="remove" data-key="${item.key}">Remove</button></div></div>
        <div class="line-price">${money(price * item.qty)}</div></div>`;
    }
    const p = byId[item.id];
    return `<div class="line">
      <a href="#/product/${p.id}" class="line-media" style="${mediaBg(p)}">${bottle(p)}</a>
      <div><span class="card-brand">${esc(p.brand)}</span><a href="#/product/${p.id}" class="line-name" style="display:block">${esc(p.name)}</a>
      <div class="line-sub">${item.ml} ml · ${money(price)} each</div>
      <div class="line-actions">${qtyControl(item)}<button class="link-btn" data-action="remove" data-key="${item.key}">Remove</button></div></div>
      <div class="line-price">${money(price * item.qty)}</div></div>`;
  }
  const qtyControl = (item) => `<div class="qty sm"><button type="button" data-action="qty" data-key="${item.key}" data-d="-1" aria-label="Decrease">−</button><span>${item.qty}</span><button type="button" data-action="qty" data-key="${item.key}" data-d="1" aria-label="Increase">+</button></div>`;
  function shipProgress(t) {
    const left = STORE.freeShippingThreshold - (t.subtotal - t.discount);
    const pct = Math.min(100, ((t.subtotal - t.discount) / STORE.freeShippingThreshold) * 100);
    return `<div class="ship-progress">${left > 0 ? `You're <strong>${money(left)}</strong> away from free shipping` : `🎉 You've unlocked <strong>free shipping</strong>`}<div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }
  function totalsHTML(t, opts = {}) {
    return `
      <div class="sum-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
      ${t.discount ? `<div class="sum-row"><span>Discount (${state.promo})</span><span class="save">−${money(t.discount)}</span></div>` : ""}
      <div class="sum-row"><span>Shipping</span><span>${opts.shipEstimate ? (t.shipping ? money(t.shipping) : "Free") : t.shipping ? money(t.shipping) : "Free"}</span></div>
      <div class="sum-row total"><span>Total</span><span>${money(t.total)}</span></div>`;
  }
  function promoForm() {
    return state.promo
      ? `<div class="chip" style="margin:12px 0">Code <strong>${esc(state.promo)}</strong> applied <button data-action="remove-promo" aria-label="Remove code">✕</button></div>`
      : `<div class="promo-form"><input class="input" data-promo-input placeholder="Promo code" aria-label="Promo code"><button type="button" class="btn btn-outline" style="padding:10px 18px" data-action="apply-promo">Apply</button></div>`;
  }

  function renderDrawer() {
    const t = cartTotals();
    const body = $("[data-drawer-body]"), foot = $("[data-drawer-foot]");
    if (!t.items.length) {
      body.innerHTML = `<div class="empty" style="margin-top:20px;border:0;background:none"><div class="big">Your bag is empty</div><p class="muted">Let's find you something lovely.</p></div>`;
      foot.innerHTML = `<a href="#/shop" class="btn btn-dark btn-block" data-action="close-cart">Shop minis</a>`;
      return;
    }
    body.innerHTML = `<div style="padding-top:16px">${shipProgress(t)}</div>` + t.items.map((i) => lineHTML(i, true)).join("");
    foot.innerHTML = `<div class="sum-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
      ${t.discount ? `<div class="sum-row"><span>Discount</span><span class="save">−${money(t.discount)}</span></div>` : ""}
      <a href="#/checkout" class="btn btn-dark btn-block" data-action="close-cart">Checkout</a>
      <a href="#/cart" class="btn btn-outline btn-block" data-action="close-cart">View bag</a>`;
  }

  function viewCart() {
    const t = cartTotals();
    if (!t.items.length) {
      return { title: "Your Bag", html: `<div class="container section"><div class="empty"><div class="big">Your bag is empty</div><p class="muted">Explore the collection and find your next favorite.</p><a href="#/shop" class="btn btn-dark">Shop minis</a></div></div>` };
    }
    return {
      title: "Your Bag",
      html: `<div class="container">
        <div class="crumbs" style="margin-top:24px"><a href="#/">Home</a> / Bag</div>
        <h1 style="margin-top:8px">Your bag</h1>
        <div class="cart-layout" style="padding-top:8px">
          <div>${t.items.map((i) => lineHTML(i)).join("")}
            <a href="#/shop" class="link-arrow" style="display:inline-block;margin-top:20px">← Continue shopping</a></div>
          <aside class="summary">
            <h3>Order summary</h3>
            ${shipProgress(t)}
            ${totalsHTML(t)}
            ${promoForm()}
            <a href="#/checkout" class="btn btn-dark btn-block">Checkout</a>
            <p class="muted center" style="font-size:.8rem;margin:12px 0 0">Secure checkout · Gift-ready packaging</p>
          </aside>
        </div></div>`,
    };
  }

  /* ----- Checkout ----- */
  let shipMethod = "standard";
  function viewCheckout() {
    const t = cartTotals(shipMethod);
    if (!t.items.length) return viewCart();
    const freeStd = t.subtotal - t.discount >= STORE.freeShippingThreshold;
    return {
      title: "Checkout",
      html: `<div class="container">
        <div class="crumbs" style="margin-top:24px"><a href="#/">Home</a> / <a href="#/cart">Bag</a> / Checkout</div>
        <h1 style="margin-top:8px">Checkout</h1>
        <form class="cart-layout" style="padding-top:8px" data-form="checkout" novalidate>
          <div>
            <div class="fieldset">
              <h3>Contact</h3>
              <div class="form-grid">
                <div class="field full"><label for="co-email">Email</label><input class="input" id="co-email" name="email" type="email" required autocomplete="email"></div>
                <div class="field full"><label for="co-phone">Phone (for delivery updates)</label><input class="input" id="co-phone" name="phone" type="tel" autocomplete="tel"></div>
              </div>
            </div>
            <div class="fieldset">
              <h3>Shipping address</h3>
              <div class="form-grid">
                <div class="field"><label for="co-first">First name</label><input class="input" id="co-first" name="first" required autocomplete="given-name"></div>
                <div class="field"><label for="co-last">Last name</label><input class="input" id="co-last" name="last" required autocomplete="family-name"></div>
                <div class="field full"><label for="co-addr">Address</label><input class="input" id="co-addr" name="address" required autocomplete="address-line1"></div>
                <div class="field full"><label for="co-addr2">Apartment, suite (optional)</label><input class="input" id="co-addr2" name="address2" autocomplete="address-line2"></div>
                <div class="field"><label for="co-city">City</label><input class="input" id="co-city" name="city" required autocomplete="address-level2"></div>
                <div class="field"><label for="co-zip">ZIP / Postal code</label><input class="input" id="co-zip" name="zip" required autocomplete="postal-code"></div>
                <div class="field full"><label for="co-country">Country</label>
                  <select class="select" id="co-country" name="country" required autocomplete="country-name">
                    ${["United States", "Canada", "United Kingdom", "Australia", "United Arab Emirates", "Other"].map((c) => `<option>${c}</option>`).join("")}
                  </select></div>
                <div class="field full"><label class="check"><input type="checkbox" name="gift"> This is a gift. Hide prices on the packing slip.</label></div>
              </div>
            </div>
            <div class="fieldset">
              <h3>Delivery</h3>
              <label class="radio-card"><input type="radio" name="ship" value="standard" ${shipMethod === "standard" ? "checked" : ""}> <div>Standard<small>3–6 business days</small></div><span class="rc-price">${freeStd ? "Free" : money(STORE.shipping.standard)}</span></label>
              <label class="radio-card"><input type="radio" name="ship" value="express" ${shipMethod === "express" ? "checked" : ""}> <div>Express<small>1–2 business days</small></div><span class="rc-price">${money(STORE.shipping.express)}</span></label>
            </div>
            <div class="fieldset">
              <h3>Payment</h3>
              <label class="radio-card"><input type="radio" name="pay" value="card" checked> <div>Credit / debit card<small>Visa, Mastercard, Amex, Apple Pay, Google Pay</small></div></label>
              <label class="radio-card"><input type="radio" name="pay" value="paypal"> <div>PayPal</div></label>
              <p class="notice">Demo mode: online payments aren't connected yet, so no money is taken. Placing an order saves it in this browser so you can test the whole flow. See README.md for how to connect Stripe, PayPal or Shopify.</p>
            </div>
            <p class="notice" data-co-error hidden style="background:#fdeeee;border-color:#f2c9c9;color:var(--danger)"></p>
          </div>
          <aside class="summary">
            <h3>Order summary</h3>
            ${t.items.map((i) => {
              const p = i.type === "box" ? byId[i.picks[0]] : byId[i.id];
              const name = i.type === "box" ? `Discovery Box · ${i.picks.length} minis` : `${p.brand} ${p.name}`;
              const sub = i.type === "box" ? "5 ml each" : `${i.ml} ml`;
              return `<div class="mini-line"><div class="line-media" style="${mediaBg(p)}">${bottle(p)}<span class="q">${i.qty}</span></div><div><div style="font-size:.9rem;line-height:1.3">${esc(name)}</div><div class="line-sub">${sub}</div></div><div style="font-size:.9rem">${money(linePrice(i) * i.qty)}</div></div>`;
            }).join("")}
            <div style="border-top:1px solid var(--line);margin-top:8px;padding-top:8px">${totalsHTML(t)}</div>
            ${promoForm()}
            <button class="btn btn-dark btn-block" type="submit">Place order · ${money(t.total)}</button>
          </aside>
        </form></div>`,
    };
  }
  function placeOrder(form) {
    const err = $("[data-co-error]");
    const invalid = $$("[required]", form).filter((el) => !el.checkValidity());
    $$(".input, .select", form).forEach((el) => (el.style.borderColor = ""));
    if (invalid.length) {
      invalid.forEach((el) => (el.style.borderColor = "var(--danger)"));
      err.textContent = "Please fill in the highlighted fields.";
      err.hidden = false; invalid[0].focus();
      return;
    }
    const fd = Object.fromEntries(new FormData(form));
    const t = cartTotals(shipMethod);
    const id = "AC" + Date.now().toString(36).toUpperCase().slice(-6);
    const order = {
      id, date: new Date().toISOString(), customer: fd, ship: shipMethod, promo: state.promo,
      items: t.items.map((i) => ({ ...i, price: linePrice(i), label: i.type === "box" ? `Discovery Box · ${i.picks.length} minis` : `${byId[i.id].brand} ${byId[i.id].name} · ${i.ml} ml` })),
      totals: { subtotal: t.subtotal, discount: t.discount, shipping: t.shipping, total: t.total },
    };
    state.orders.unshift(order);
    state.cart = []; state.promo = null; shipMethod = "standard";
    save(); updateBadges(); renderDrawer();
    location.hash = "#/order/" + id;
  }
  function viewOrder(id) {
    const o = state.orders.find((x) => x.id === id);
    if (!o) return viewNotFound();
    return {
      title: "Order confirmed",
      html: `<div class="container"><div class="confirm">
        <div class="tick">✓</div>
        <span class="eyebrow">Order ${esc(o.id)}</span>
        <h1>Thank you, ${esc(o.customer.first)}!</h1>
        <p class="muted">We've received your order and will email a confirmation to <strong>${esc(o.customer.email)}</strong>.</p>
        <div class="summary" style="text-align:left;margin:28px 0;position:static">
          ${o.items.map((i) => `<div class="sum-row"><span>${i.qty} × ${esc(i.label)}</span><span>${money(i.price * i.qty)}</span></div>`).join("")}
          <div style="border-top:1px solid var(--line);margin-top:8px;padding-top:8px">
            <div class="sum-row"><span>Subtotal</span><span>${money(o.totals.subtotal)}</span></div>
            ${o.totals.discount ? `<div class="sum-row"><span>Discount</span><span class="save">−${money(o.totals.discount)}</span></div>` : ""}
            <div class="sum-row"><span>Shipping (${o.ship})</span><span>${o.totals.shipping ? money(o.totals.shipping) : "Free"}</span></div>
            <div class="sum-row total"><span>Total</span><span>${money(o.totals.total)}</span></div>
          </div>
          <p class="muted" style="font-size:.85rem;margin:14px 0 0">Shipping to: ${esc([o.customer.address, o.customer.address2, o.customer.city, o.customer.zip, o.customer.country].filter(Boolean).join(", "))}</p>
        </div>
        <a href="#/shop" class="btn btn-dark">Continue shopping</a>
      </div></div>`,
    };
  }

  /* ----- Wishlist / brands / content ----- */
  function viewWishlist() {
    const list = state.wish.map((id) => byId[id]).filter(Boolean);
    return {
      title: "Wishlist",
      html: `<section class="page-head"><div class="container"><div class="crumbs"><a href="#/">Home</a> / Wishlist</div><h1>Your wishlist</h1></div></section>
      <section class="container section-sm">${list.length ? `<div class="grid">${list.map(card).join("")}</div>` : `<div class="empty"><div class="big">Nothing saved yet</div><p class="muted">Tap the ♡ on any perfume to save it here.</p><a href="#/shop" class="btn btn-dark">Browse perfumes</a></div>`}</section>`,
    };
  }
  function viewBrands() {
    return {
      title: "Brands",
      html: `<section class="page-head"><div class="container"><div class="crumbs"><a href="#/">Home</a> / Brands</div><h1>Our fragrance houses</h1><p class="muted">${BRANDS.length} designer and niche houses, all in mini sizes.</p></div></section>
      <section class="container section-sm"><div class="brand-grid">
        ${BRANDS.map((b) => { const n = PRODUCTS.filter((p) => p.brand === b).length; return `<a class="brand-card" href="#/shop?brand=${encodeURIComponent(b)}"><strong>${esc(b)}</strong><span>${n} ${n === 1 ? "fragrance" : "fragrances"}</span></a>`; }).join("")}
      </div></section>`,
    };
  }
  const page = (title, crumb, body) => ({
    title,
    html: `<section class="page-head"><div class="container"><div class="crumbs"><a href="#/">Home</a> / ${crumb}</div><h1>${title}</h1></div></section><section class="container section-sm"><div class="prose">${body}</div></section>`,
  });
  function viewAbout() {
    return page("Our story", "About", `
      <p>Angels Club started with a simple frustration: buying a full bottle of designer perfume you've only smelled on a paper strip is a gamble. Fragrance changes on skin and over the hours, and a full bottle is a big commitment.</p>
      <p>So we built a store full of <strong>designer minis</strong>. These are the small 5–10 ml bottles the big houses make, so you can wear a scent for real and find the one you love.</p>
      <h2>What we believe</h2>
      <ul><li><strong>Authentic only.</strong> We sell genuine designer products, never imitations.</li>
      <li><strong>Discovery over commitment.</strong> Try five scents for the price of half a bottle.</li>
      <li><strong>Every order feels like a gift.</strong> Each one is wrapped with care.</li></ul>
      <p><a href="#/shop" class="btn btn-dark">Start discovering</a></p>`);
  }
  function viewFaq() {
    const qa = [
      ["Are your perfumes authentic?", "Yes. We only sell genuine designer minis sourced from trusted suppliers. We never sell copies, dupes or 'inspired by' fragrances."],
      ["What's the difference between a mini and a sample?", "Minis are small versions of the original bottle made by the fragrance house, usually 5–10 ml. A 5 ml mini gives you about 60–80 sprays, enough to wear a scent for several weeks."],
      ["Do all minis have a spray?", "Most do, but some designer minis are 'splash' (dab-on) bottles. That's the original design from the brand."],
      ["How does the Discovery Box work?", `Choose a box size (${STORE.boxes.map((b) => b.count).join(", ")} minis), pick your scents, and the discount is applied automatically: up to ${Math.round(Math.max(...STORE.boxes.map((b) => b.discount)) * 100)}% off.`],
      ["How long does shipping take?", `Orders ship within 1–2 business days. Standard delivery takes 3–6 business days (free over ${money(STORE.freeShippingThreshold)}), and express takes 1–2 business days.`],
      ["Can I return a perfume?", "For hygiene reasons we can only accept returns of unopened, sealed items within 14 days of delivery. If anything arrives damaged, contact us and we'll make it right."],
      ["Do you offer gift wrapping?", "Every order is packed gift-ready. At checkout you can mark the order as a gift to hide prices on the packing slip."],
    ];
    return page("Frequently asked questions", "FAQ", `<div class="faq">${qa.map(([q, a]) => `<details class="acc"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
      <p style="margin-top:24px">Still have questions? <a href="#/contact" style="text-decoration:underline">Contact us</a>.</p>`);
  }
  function viewShipping() {
    return page("Shipping & returns", "Shipping &amp; Returns", `
      <h2>Shipping</h2>
      <ul><li><strong>Standard (3–6 business days):</strong> ${money(STORE.shipping.standard)}, free on orders over ${money(STORE.freeShippingThreshold)}</li>
      <li><strong>Express (1–2 business days):</strong> ${money(STORE.shipping.express)}</li>
      <li>Orders placed before 2 pm ship the same or next business day.</li>
      <li>You'll receive a tracking number by email as soon as your order ships.</li></ul>
      <h2>Returns</h2>
      <p>Because fragrances are personal-care items, we can only accept returns of <strong>unopened, sealed</strong> products within 14 days of delivery. Email us with your order number to start a return.</p>
      <h2>Damaged items</h2>
      <p>Perfume is fragile. If anything arrives broken or leaking, send us a photo within 48 hours and we'll replace it free of charge.</p>`);
  }
  function viewContact() {
    return {
      title: "Contact us",
      html: `<section class="page-head"><div class="container"><div class="crumbs"><a href="#/">Home</a> / Contact</div><h1>Contact us</h1></div></section>
      <section class="container section-sm"><div class="contact-grid">
        <div class="prose">
          <p>Questions about a scent, an order or a gift? We'd love to help you find your perfect match.</p>
          <p><strong>Email</strong><br><a href="mailto:${esc(STORE.email)}" style="text-decoration:underline">${esc(STORE.email)}</a></p>
          <p><strong>Hours</strong><br>Monday – Friday, 9 am – 6 pm</p>
          <p><strong>Social</strong><br>DM us on <a href="${esc(STORE.instagram)}" target="_blank" rel="noopener" style="text-decoration:underline">Instagram</a> or <a href="${esc(STORE.tiktok)}" target="_blank" rel="noopener" style="text-decoration:underline">TikTok</a></p>
        </div>
        <form class="fieldset" data-form="contact">
          <div class="form-grid">
            <div class="field"><label for="ct-name">Name</label><input class="input" id="ct-name" name="name" required></div>
            <div class="field"><label for="ct-email">Email</label><input class="input" id="ct-email" type="email" name="email" required></div>
            <div class="field full"><label for="ct-order">Order number (optional)</label><input class="input" id="ct-order" name="order"></div>
            <div class="field full"><label for="ct-msg">Message</label><textarea class="textarea" id="ct-msg" name="message" rows="6" required></textarea></div>
          </div>
          <button class="btn btn-dark" style="margin-top:16px">Send message</button>
        </form>
      </div></section>`,
    };
  }
  function viewNotFound() {
    return { title: "Not found", html: `<div class="container section"><div class="empty"><div class="big">We couldn't find that page</div><p class="muted">It may have moved, or the scent has sold out.</p><a href="#/shop" class="btn btn-dark">Shop all minis</a></div></div>` };
  }

  /* ---------------- Events ---------------- */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const a = el.dataset.action;
    switch (a) {
      case "open-cart": renderDrawer(); openCart(); break;
      case "close-cart": closeCart(); break;
      case "toggle-menu": {
        const nav = $(".mobile-nav"); nav.hidden = !nav.hidden; el.setAttribute("aria-expanded", String(!nav.hidden)); break;
      }
      case "quick-add": e.preventDefault(); addToCart(el.dataset.id, 5, 1); break;
      case "wish": e.preventDefault(); toggleWish(el.dataset.id); break;
      case "qty": { const it = state.cart.find((i) => i.key === el.dataset.key); if (it) setQty(it.key, it.qty + Number(el.dataset.d)); break; }
      case "remove": setQty(el.dataset.key, 0); break;
      case "pick-size": {
        $$(".size-btn").forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-checked", "false"); });
        el.classList.add("active"); el.setAttribute("aria-checked", "true");
        const p = byId[$("[data-pdp]").dataset.pdp];
        $("[data-price]").textContent = money(priceFor(p, Number(el.dataset.ml)));
        break;
      }
      case "pdp-qty": {
        const q = $("[data-qty]"); const p = byId[$("[data-pdp]").dataset.pdp];
        q.textContent = Math.max(1, Math.min(Math.max(1, p.stock), Number(q.textContent) + Number(el.dataset.d)));
        break;
      }
      case "pdp-add": {
        const ml = Number($(".size-btn.active").dataset.ml);
        addToCart(el.dataset.id, ml, Number($("[data-qty]").textContent));
        break;
      }
      case "toggle-filters": $(".filters").classList.toggle("open"); break;
      case "clear-filters": location.hash = "#/shop"; lastPath = null; render(); break;
      case "remove-chip": {
        const form = $('[data-form="filters"]'); const { k, v } = el.dataset;
        if (k === "q" || k === "tag") form.elements[k].value = "";
        else $$(`input[name="${k}"]`, form).forEach((i) => { if (i.value === v) i.checked = false; });
        renderShopResults(currentShopFilters());
        break;
      }
      case "box-size": boxState.count = Number(el.dataset.count); renderBox(); break;
      case "box-pick": {
        const id = el.dataset.id;
        boxState.picks = boxState.picks.includes(id) ? boxState.picks.filter((x) => x !== id) : boxState.picks.length < boxState.count ? [...boxState.picks, id] : boxState.picks;
        renderBox(); break;
      }
      case "box-add":
        if (boxState.picks.length === boxState.count) { addBox(boxState.picks); boxState.picks = []; renderBox(); }
        break;
      case "apply-promo": applyPromo($("[data-promo-input]").value); break;
      case "remove-promo": state.promo = null; save(); rerenderKeepingForm(); renderDrawer(); break;
    }
  });

  let filterTimer;
  document.addEventListener("input", (e) => {
    if (e.target.closest('[data-form="filters"]') || e.target.matches("[data-sort]")) {
      clearTimeout(filterTimer);
      filterTimer = setTimeout(() => renderShopResults(currentShopFilters()), e.target.type === "search" ? 200 : 0);
    }
    if (e.target.matches("[data-box-gender]")) { boxState.gender = e.target.value; renderBox(); }
  });
  document.addEventListener("change", (e) => {
    if (e.target.name === "ship" && e.target.closest('[data-form="checkout"]')) {
      shipMethod = e.target.value;
      rerenderKeepingForm();
    }
  });
  document.addEventListener("submit", (e) => {
    const form = e.target.closest("[data-form]");
    if (!form) return;
    const kind = form.dataset.form;
    if (kind === "filters") { e.preventDefault(); return; }
    e.preventDefault();
    if (kind === "search") {
      const q = form.elements.q.value.trim();
      location.hash = "#/shop" + (q ? "?q=" + encodeURIComponent(q) : "");
      if (currentPath() === "/shop") { lastPath = "/shop"; render(); }
      form.reset();
    } else if (kind === "checkout") {
      placeOrder(form);
    } else if (kind === "newsletter") {
      toast("Welcome to the club! ✦"); form.reset();
    } else if (kind === "contact") {
      if (!form.checkValidity()) { form.reportValidity(); return; }
      form.innerHTML = `<div class="center" style="padding:30px 0"><div class="confirm" style="padding:0"><div class="tick">✓</div></div><h3>Message sent</h3><p class="muted">Thanks for reaching out. We'll reply within one business day.</p></div>`;
    }
  });
  function applyPromo(raw) {
    const code = String(raw || "").trim().toUpperCase();
    if (!STORE.promoCodes[code]) return toast("That code isn't valid.");
    state.promo = code; save();
    toast(`Code ${code} applied: ${Math.round(STORE.promoCodes[code] * 100)}% off`);
    rerenderKeepingForm(); renderDrawer();
  }
  // Re-render the current view without losing what the customer typed (checkout form)
  function rerenderKeepingForm() {
    const form = $('[data-form="checkout"]');
    const saved = form ? $$("input, select, textarea", form).filter((el) => el.name && el.type !== "radio").map((el) => [el.name, el.type === "checkbox" ? el.checked : el.value]) : [];
    const y = window.scrollY;
    render();
    const nf = $('[data-form="checkout"]');
    if (nf) saved.forEach(([n, v]) => { const el = nf.elements[n]; if (el && !(el instanceof RadioNodeList)) { if (el.type === "checkbox") el.checked = v; else el.value = v; } });
    window.scrollTo(0, y);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
    if (e.key === "Enter" && e.target.matches("[data-promo-input]")) { e.preventDefault(); applyPromo(e.target.value); }
  });
  window.addEventListener("hashchange", render);

  /* ---------------- Init ---------------- */
  $("[data-free-ship]").textContent = money(STORE.freeShippingThreshold);
  $("[data-year]").textContent = new Date().getFullYear();
  $$("[data-social]").forEach((a) => (a.href = STORE[a.dataset.social] || "#"));
  // drop stale cart entries for products that no longer exist
  state.cart = state.cart.filter((i) => (i.type === "box" ? i.picks.every((id) => byId[id]) : byId[i.id]));
  updateBadges(); renderDrawer(); render();
})();
