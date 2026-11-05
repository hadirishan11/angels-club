import { byId, SET_PRICES, DEMO_NOTICE } from '../data/products.js';
import { bag, money, world } from '../state.js';
import { icon, esc, img, toast, reveal } from '../ui.js';
import { LOGO } from '../logo.js';

const hero = (eyebrow, title, text = '') => `<section class="page-hero"><div class="wrap center">
  <span class="tone-light" style="display:block;width:84px;margin:0 auto 16px">${LOGO.mark}</span>
  <p class="eyebrow">${eyebrow}</p><h1 class="display" style="font-size:clamp(2rem,1.2rem + 3vw,4rem)">${title}</h1>${text ? `<p class="lede">${text}</p>` : ''}</div></section>`;

const GIFT_SETS = [
  { name: 'Noir Essentials', size: 3, items: ['vetiver-fume', 'oud-nocturne', 'cuir-ambre'], text: 'Three signatures from fresh to fearless.' },
  { name: 'Rosé Romance', size: 3, items: ['rose-velours', 'vanille-satin', 'pivoine-poudree'], text: 'Rose, vanilla and peony — love at first spray.' },
  { name: 'Day to Night', size: 5, items: ['bergamote-marine', 'litchi-rose', 'iris-gris', 'jasmin-lumiere', 'tabac-dore'], text: 'Five miniatures across both worlds, morning to midnight.' },
];

export const gifts = {
  title: 'Gift sets — Veloura',
  render() {
    return `${hero('The gifting experience', 'Gift sets', 'Curated discovery sets in our signature case, ready for a handwritten note.')}
    <section class="section"><div class="wrap">
      <div class="sets">${GIFT_SETS.map((s, i) => `<article class="set-card rv" style="--d:${i}">
        <div class="set-card__imgs">${s.items.slice(0, 3).map((id) => `<img src="${img(byId(id))}" alt="" loading="lazy">`).join('')}</div>
        <h2 style="font-size:1.2rem;margin:4px 0 0">${s.name}</h2>
        <p class="muted" style="margin:0">${s.text}</p>
        <p style="margin:0;font-size:.85rem">${s.items.map((id) => esc(byId(id).name)).join(' · ')}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="price">${money(SET_PRICES[s.size])} · ${s.size} minis</span><button class="btn btn--sm" type="button" data-set="${i}">Add to bag</button></div>
      </article>`).join('')}</div>
      <div class="tiles" style="margin-top:48px">
        <div class="tile rv">${icon('gift')}<h3>Signature case</h3><p class="muted">Black and champagne gold for Noir, blush and rose for Rosé.</p></div>
        <div class="tile rv" style="--d:1">${icon('sparkle')}<h3>A personal note</h3><p class="muted">Add a gift message in your bag. We'll handwrite it on a Veloura card.</p></div>
        <div class="tile rv" style="--d:2">${icon('bottle')}<h3>Build your own</h3><p class="muted">Prefer to choose? <a class="link" href="#build-a-set">Build a set of 3 or 5</a>.</p></div>
      </div>
    </div></section>`;
  },
  mount(root) {
    reveal(root);
    root.addEventListener('click', (e) => { const b = e.target.closest('[data-set]'); if (!b) return; const s = GIFT_SETS[+b.dataset.set]; bag.addSet(s.items, s.size); toast(`${s.name} added to your bag`); });
  },
};

export const about = {
  title: 'About — Veloura',
  render() {
    return `${hero('About Veloura', 'Iconic scents. Miniature luxury.')}
    <section class="section"><div class="wrap prose" style="margin-inline:auto">
      <p class="lede">Veloura is a Canadian boutique for people who love fragrance and want to explore it freely. We curate miniature editions of celebrated fragrances, so you can discover, travel with and gift the scents you love.</p>
      <h2>Two worlds, one house</h2>
      <p><strong>Veloura Noir</strong> gathers woods, spice, leather and smoke. <strong>Veloura Rosé</strong> celebrates florals, gourmands and luminous musks. Shop either, or both — one bag, one checkout.</p>
      <h2>Why miniatures</h2>
      <p>A miniature lets you live with a fragrance for days rather than seconds on a paper strip. It fits in a pocket, makes a thoughtful gift, and turns a single signature into a wardrobe of scents.</p>
      <h2>Our story</h2>
      <p>[Your founding story — who you are, why you started Veloura, and how you select each fragrance.]</p>
      <h2>Authenticity</h2>
      <p>[Describe how your products are sourced. Only state what you can verify.]</p>
    </div></section>`;
  },
};

const FAQ = [
  ['What sizes are your miniatures?', 'Each product lists its size and concentration — typically 5 ml to 10 ml.'],
  ['Are the miniatures original or decanted?', '[Explain clearly whether items are manufacturer miniatures, travel sprays or decants. This must match each listing.]'],
  ['How does the scent finder work?', 'Five questions about mood, moments, favourite notes and intensity. We score every fragrance against your answers and show the three closest matches, with the reasons.'],
  ['How do discovery sets work?', 'Choose three or five miniatures in Build a Set and they arrive together in a Veloura case at a set price.'],
  ['Where do you ship?', 'Across Canada. Fragrances contain alcohol and are regulated for transport, so some orders ship by ground. Rates appear at checkout.'],
  ['Can I return a fragrance?', 'Unopened items can be returned within [X] days. For hygiene reasons opened fragrances can only be returned if damaged or incorrect.'],
  ['Can I add a gift message?', 'Yes — add it in your bag before checkout.'],
];
export const faq = {
  title: 'FAQ — Veloura',
  render() {
    return `${hero('Client care', 'Questions & answers')}
    <section class="section"><div class="wrap" style="max-width:820px">
      ${FAQ.map(([q, a]) => `<details class="acc"><summary>${q} ${icon('plus')}</summary><div class="acc__body">${a}</div></details>`).join('')}
      <p class="center" style="margin-top:36px"><a class="btn btn--ghost" href="#contact">Contact us</a></p>
    </div></section>`;
  },
};

export const contact = {
  title: 'Contact — Veloura',
  render() {
    return `${hero('Client care', 'Contact us', 'Questions about a fragrance, an order or a gift? We reply within [X] business days.')}
    <section class="section"><div class="wrap" style="max-width:720px">
      <form class="panel" id="contactForm" novalidate>
        <div class="field"><label for="cName">Name</label><input class="input" id="cName" autocomplete="name"></div>
        <div class="field"><label for="cEmail">Email</label><input class="input" id="cEmail" type="email" autocomplete="email" required></div>
        <div class="field"><label for="cMsg">Message</label><textarea class="textarea" id="cMsg" required></textarea></div>
        <button class="btn btn--block" type="submit">Send message</button>
        <p class="form-msg" id="cOut" role="status"></p>
      </form>
      <p class="muted center" style="margin-top:18px">Prefer email? Write to <strong>hello@[your-domain].ca</strong></p>
    </div></section>`;
  },
  mount(root) {
    root.querySelector('#contactForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = root.querySelector('#cEmail');
      const out = root.querySelector('#cOut');
      if (!email.checkValidity() || !root.querySelector('#cMsg').value.trim()) { out.textContent = 'Please add your email address and a message.'; return; }
      out.textContent = 'This form is not connected to an inbox yet, so your message was not sent. Please email us directly for now.';
    });
  },
};

export const shipping = {
  title: 'Shipping & returns — Veloura',
  render() {
    return `${hero('Client care', 'Shipping & returns')}
    <section class="section"><div class="wrap prose" style="margin-inline:auto">
      <h2>Shipping</h2><p>We ship across Canada. Orders are prepared within [X] business days; most arrive within [X–Y] business days after dispatch.</p>
      <p>Perfumes contain alcohol and are regulated as dangerous goods for transport. We ship in line with carrier rules, which can mean ground-only service and longer times to some regions.</p>
      <h2>Taxes</h2><p>GST/HST, PST or QST is calculated at checkout based on your province.</p>
      <h2>Returns</h2><p>Unopened items can be returned within [X] days of delivery. For hygiene reasons, opened fragrances can only be returned if they arrived damaged or incorrect.</p>
      <p class="demo-note">Template text — replace the bracketed details and have your policies reviewed before launch.</p>
    </div></section>`;
  },
};

export const checkout = {
  title: 'Checkout — Veloura',
  render() {
    const lines = bag.lines;
    if (!lines.length) return `${hero('Checkout', 'Your bag is empty')}<section class="section"><div class="wrap center"><a class="btn" href="#shop">Discover miniatures</a></div></section>`;
    return `<section class="checkout section--tight"><div class="wrap">
      <p class="eyebrow">Checkout</p><h1>Review your order</h1>
      <div class="checkout__grid">
        <div class="panel">
          <ul class="lines">${lines.map((l) => {
            const items = l.type === 'set' ? l.items.map(byId) : [byId(l.id)];
            return `<li class="line"><div class="line__media ${items.length === 1 ? 'single' : ''}">${items.slice(0, 4).map((p) => `<img src="${img(p)}" alt="">`).join('')}</div>
              <div><span class="line__name">${l.type === 'set' ? `Discovery set of ${l.size}` : esc(items[0].name)}</span>
              <div class="line__sub">${l.type === 'set' ? items.map((p) => esc(p.name)).join(', ') : `${esc(items[0].concentration)} · ${esc(items[0].size)}`}</div>
              <div class="line__row"><span class="muted">Qty ${l.qty}</span><span class="price">${money(bag.linePrice(l) * l.qty)}</span></div></div></li>`;
          }).join('')}</ul>
          ${bag.note ? `<p class="muted" style="margin-top:14px">Gift note: “${esc(bag.note)}”</p>` : ''}
        </div>
        <aside class="panel">
          <div class="total"><span>Subtotal</span><span>${money(bag.subtotal())}</span></div>
          <p class="muted" style="font-size:.82rem">Shipping and taxes are calculated after your address is entered.</p>
          <div class="notice" role="note">${icon('lock')}<div><strong>Payments are not connected yet.</strong><br><span class="muted" style="font-size:.86rem">This preview stops before payment. To take orders, connect a secure payment provider (for example Stripe Checkout or Shopify) — card details are then entered on the provider's own secure page, never on this site.</span></div></div>
          <button class="btn btn--block" type="button" aria-disabled="true" style="margin-top:16px">${icon('lock')} Continue to secure payment</button>
          <a class="btn btn--ghost btn--block" href="#shop" style="margin-top:10px">Continue shopping</a>
        </aside>
      </div>
    </div></section>`;
  },
};

export const notFound = {
  title: 'Not found — Veloura',
  render() { return `${hero('404', 'This page has evaporated', 'Like the last note of a fragrance.')}<section class="section"><div class="wrap center"><a class="btn" href="#">Return home</a></div></section>`; },
};

export const DEMO = DEMO_NOTICE;
