/**
 * VELOURA — standalone storefront (single-page app, hash routing).
 * Pages swap with the View Transitions API; product cards morph into the product stage.
 */
import { products, byId, DEMO_NOTICE } from './data/products.js';
import { world, bag, on, emit, money } from './state.js';
import { icon, esc, img, drawer, toast, announce, flyToBag, initTilt, reduced } from './ui.js';
import { LOGO } from './logo.js';
import home from './views/home.js';
import collection from './views/collection.js';
import product from './views/product.js';
import finder from './views/finder.js';
import builder from './views/builder.js';
import { gifts, about, faq, contact, shipping, checkout, notFound } from './views/pages.js';

const root = document.documentElement;
root.dataset.world = world.current;
if (matchMedia('(prefers-reduced-motion: reduce)').matches) root.dataset.motion = 'reduced';

/* ------------------------------------------------------------ shell */
const NAV = [['noir', 'Noir'], ['rose', 'Rosé'], ['shop', 'Shop all'], ['finder', 'Scent finder'], ['build-a-set', 'Build a set'], ['gifts', 'Gifts']];
const switchHTML = () => `<div class="switch" role="group" aria-label="Choose your world"><span class="switch__thumb" aria-hidden="true"></span><button type="button" data-world-btn="noir" aria-pressed="false">Noir</button><button type="button" data-world-btn="rose" aria-pressed="false">Rosé</button></div>`;

document.getElementById('app').innerHTML = `
  <a class="skip" href="#view" data-skip>Skip to content</a>
  <header class="header" id="header">
    <div style="display:flex;align-items:center;gap:8px">
      <button class="icon-btn header__menu" type="button" data-open="menu" aria-label="Menu">${icon('menu')}</button>
      <nav class="header__nav" aria-label="Main">${NAV.slice(0, 4).map(([h, t]) => `<a href="#${h}" data-nav="${h}">${t}</a>`).join('')}</nav>
    </div>
    <a class="header__logo" href="#" aria-label="Veloura — home">${LOGO.wordmark}</a>
    <div class="header__right">
      ${switchHTML()}
      <button class="icon-btn hide-sm" type="button" data-open="search" aria-label="Search">${icon('search')}</button>
      <button class="icon-btn" type="button" data-open="bag" data-bag-btn aria-label="Bag">${icon('bag')}<span class="count" data-count></span></button>
    </div>
  </header>
  <main id="view" tabindex="-1"></main>
  <footer class="footer"><div class="wrap">
    <div class="footer__top">
      <div><span class="twinkle">${LOGO.stacked}</span><p class="muted" style="max-width:36ch">Iconic scents. Miniature luxury. A Canadian boutique of curated miniature fragrances.</p></div>
      <div><h2>Shop</h2><ul><li><a href="#noir">Veloura Noir</a></li><li><a href="#rose">Veloura Rosé</a></li><li><a href="#shop">All miniatures</a></li><li><a href="#build-a-set">Build a set</a></li><li><a href="#gifts">Gift sets</a></li></ul></div>
      <div><h2>Client care</h2><ul><li><a href="#finder">Scent finder</a></li><li><a href="#faq">FAQ</a></li><li><a href="#shipping">Shipping &amp; returns</a></li><li><a href="#contact">Contact</a></li><li><a href="#about">About</a></li></ul></div>
      <div><h2>The Veloura circle</h2><p class="muted" style="font-size:.9rem">New arrivals and private previews — sent sparingly.</p>
        <form class="news" id="news" novalidate><label class="visually-hidden" for="newsEmail">Email address</label><input class="input" id="newsEmail" type="email" placeholder="Your email" autocomplete="email" required><button class="btn btn--sm" type="submit">Join</button></form>
        <p class="form-msg" id="newsOut" role="status"></p></div>
    </div>
    <div class="footer__bottom"><span>© ${new Date().getFullYear()} Veloura. Prices in CAD.</span><span>${DEMO_NOTICE}</span></div>
  </div></footer>

  <nav class="tabbar" aria-label="Quick navigation">
    <a href="#" data-nav="">${icon('home')}Home</a>
    <a href="#noir" data-nav="noir"><span class="dot dot--noir" aria-hidden="true"></span>Noir</a>
    <a href="#rose" data-nav="rose"><span class="dot dot--rose" aria-hidden="true"></span>Rosé</a>
    <a href="#finder" data-nav="finder">${icon('sparkle')}Finder</a>
    <button type="button" data-open="bag" data-bag-btn>${icon('bag')}Bag<span class="count" data-count></span></button>
  </nav>

  <dialog class="drawer drawer--left" id="menu" aria-label="Menu"><div class="drawer__panel">
    <div class="drawer__head">${LOGO.wordmark}<button class="icon-btn" type="button" data-close aria-label="Close">${icon('close')}</button></div>
    <div class="drawer__body">
      <div class="menu-worlds"><a href="#noir">NOIR</a><a href="#rose">ROSÉ</a></div>
      <nav class="menu-links">${NAV.slice(2).concat([['about', 'About'], ['faq', 'FAQ'], ['contact', 'Contact']]).map(([h, t]) => `<a href="#${h}">${t} ${icon('arrow')}</a>`).join('')}</nav>
      <p class="eyebrow" style="margin-top:26px">Choose your world</p>${switchHTML()}
    </div></div></dialog>

  <dialog class="drawer drawer--top" id="search" aria-label="Search"><div class="drawer__panel"><div class="drawer__body wrap" style="max-width:820px">
    <div style="display:flex;justify-content:flex-end"><button class="icon-btn" type="button" data-close aria-label="Close">${icon('close')}</button></div>
    <div class="search-box"><label class="visually-hidden" for="searchInput">Search</label><input class="input" id="searchInput" type="search" placeholder="Search fragrances, notes, families…" autocomplete="off">${icon('search')}</div>
    <div class="search-results" id="searchResults" role="list"></div>
  </div></div></dialog>

  <dialog class="drawer" id="bag" aria-label="Your bag"><div class="drawer__panel" id="bagPanel"></div></dialog>
  <div class="visually-hidden" id="live" role="status" aria-live="polite"></div>`;

const header = document.getElementById('header');
const view = document.getElementById('view');

function syncWorldUI() {
  document.querySelectorAll('[data-world-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.worldBtn === world.current)));
}
syncWorldUI();
on('world', syncWorldUI);

/* ------------------------------------------------------------ bag */
function renderBag() {
  const panel = document.getElementById('bagPanel');
  const n = bag.count();
  document.querySelectorAll('[data-count]').forEach((c) => {
    const prev = c.textContent; c.textContent = n || '';
    if (prev !== c.textContent && !reduced()) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
  });
  const headHTML = `<div class="drawer__head"><h2>Your bag${n ? ` <span class="muted">(${n})</span>` : ''}</h2><button class="icon-btn" type="button" data-close aria-label="Close">${icon('close')}</button></div>`;
  if (!n) {
    panel.innerHTML = `${headHTML}<div class="drawer__body bag-empty">${icon('bag')}<h3>Your bag is empty</h3><p class="muted">Discover iconic scents in their most irresistible sizes.</p><a class="btn" href="#noir">Veloura Noir</a><a class="btn btn--ghost" href="#rose">Veloura Rosé</a></div>`;
    return;
  }
  panel.innerHTML = `${headHTML}
    <div class="drawer__body"><ul class="lines">${bag.lines.map((l) => {
      const items = l.type === 'set' ? l.items.map(byId) : [byId(l.id)];
      return `<li class="line"><div class="line__media ${items.length === 1 ? 'single' : ''}">${items.slice(0, 4).map((p) => `<img src="${img(p)}" alt="">`).join('')}</div>
        <div style="display:grid">
          ${l.type === 'set' ? `<span class="line__name">Discovery set of ${l.size}</span><span class="line__sub">${items.map((p) => esc(p.name)).join(', ')}</span>` : `<a class="line__name" href="#product-${items[0].id}">${esc(items[0].name)}</a><span class="line__sub">${esc(items[0].concentration)} · ${esc(items[0].size)}</span>`}
          <div class="line__row"><div class="qty qty--sm"><button type="button" data-line="${esc(l.key)}" data-d="-1" aria-label="Decrease">${icon('minus')}</button><output>${l.qty}</output><button type="button" data-line="${esc(l.key)}" data-d="1" aria-label="Increase">${icon('plus')}</button></div><span class="price">${money(bag.linePrice(l) * l.qty)}</span></div>
          <button class="line__rm" type="button" data-rm="${esc(l.key)}">Remove</button>
        </div></li>`;
    }).join('')}</ul>
    <details style="margin-top:18px"><summary class="gift-toggle">${icon('gift')} Add a gift message</summary>
      <label class="visually-hidden" for="giftNote">Gift message</label><textarea class="textarea" id="giftNote" maxlength="300" style="margin-top:10px">${esc(bag.note)}</textarea></details>
    </div>
    <div class="drawer__foot"><div class="total"><span>Subtotal</span><span>${money(bag.subtotal())}</span></div><p class="muted" style="font-size:.8rem">Shipping and taxes calculated at checkout.</p><a class="btn btn--block" href="#checkout">${icon('lock')} Checkout</a></div>`;
}
on('bag', renderBag);
renderBag();

/* ------------------------------------------------------------ search */
const sInput = document.getElementById('searchInput');
sInput.addEventListener('input', () => {
  const q = sInput.value.trim().toLowerCase();
  const out = document.getElementById('searchResults');
  if (q.length < 2) { out.innerHTML = ''; return; }
  const hits = products.filter((p) => [p.name, p.family, p.house, p.world === 'noir' ? 'noir' : 'rose rosé', ...p.notes.top, ...p.notes.heart, ...p.notes.base].join(' ').toLowerCase().includes(q)).slice(0, 8);
  out.innerHTML = hits.length ? hits.map((p) => `<a class="search-hit" role="listitem" href="#product-${p.id}"><img src="${img(p)}" alt=""><span><small>${p.world === 'noir' ? 'Noir' : 'Rosé'} · ${esc(p.family)}</small>${esc(p.name)}<br><span class="muted price" style="font-size:.85rem">${money(p.price)}</span></span></a>`).join('')
    : `<p class="muted">No miniatures match “${esc(sInput.value)}”. Try a note such as vanilla, rose or cedar.</p>`;
});

/* ------------------------------------------------------------ global events */
document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open]');
  if (opener) { e.preventDefault(); drawer.open(opener.dataset.open, opener); if (opener.dataset.open === 'search') setTimeout(() => sInput.focus(), 60); return; }
  if (e.target.closest('[data-close]')) { drawer.close(e.target.closest('dialog')); return; }
  if (e.target.matches('dialog.drawer')) { drawer.close(e.target); return; }
  const wb = e.target.closest('[data-world-btn]');
  if (wb) { world.set(wb.dataset.worldBtn, wb); return; }
  const add = e.target.closest('[data-add]');
  if (add) {
    const p = byId(add.dataset.add); bag.addProduct(p.id);
    flyToBag(add.closest('.card')?.querySelector('img') || add, img(p));
    toast(`${p.name} added to your bag`); announce(`${p.name} added to your bag`);
    return;
  }
  const lineBtn = e.target.closest('[data-line]');
  if (lineBtn) { const l = bag.lines.find((x) => x.key === lineBtn.dataset.line); if (l) bag.setQty(l.key, l.qty + +lineBtn.dataset.d); return; }
  const rm = e.target.closest('[data-rm]');
  if (rm) { bag.setQty(rm.dataset.rm, 0); return; }
  const go = e.target.closest('[data-go-world]');
  if (go) pendingWorldOrigin = go;
  const pl = e.target.closest('[data-product-link]');
  if (pl) { const im = pl.closest('.card')?.querySelector('img'); if (im) { document.querySelectorAll('[style*="product-hero"]').forEach((x) => { x.style.viewTransitionName = ''; }); im.style.viewTransitionName = 'product-hero'; } }
  const a = e.target.closest('a[href^="#"]');
  if (a && a.closest('dialog')) { drawer.close(a.closest('dialog')); }
  if (e.target.closest('[data-skip]')) { e.preventDefault(); view.focus(); }
});
document.addEventListener('input', (e) => { if (e.target.id === 'giftNote') bag.setNote(e.target.value); });
document.querySelectorAll('dialog.drawer').forEach((d) => d.addEventListener('cancel', (e) => { e.preventDefault(); drawer.close(d); }));
document.getElementById('news').addEventListener('submit', (e) => {
  e.preventDefault();
  const em = document.getElementById('newsEmail'); const out = document.getElementById('newsOut');
  out.textContent = em.checkValidity() && em.value ? 'Sign-up is not connected to an email service yet, so nothing was saved.' : 'Please enter a valid email address.';
});

/* header state */
let lastY = 0;
function onScroll() {
  const y = scrollY;
  header.classList.toggle('is-solid', y > 40 || current?.key !== 'home');
  header.classList.toggle('is-hidden', y > lastY && y > 400 && !document.querySelector('dialog[open]'));
  lastY = y;
}
addEventListener('scroll', onScroll, { passive: true });

/* ------------------------------------------------------------ router */
let current = null; let cleanup = null; let pendingWorldOrigin = null;
function resolve(hash) {
  const h = hash.replace(/^#/, '');
  if (!h || h === 'top') return { key: 'home', v: home };
  if (h === 'noir' || h === 'rose') return { key: h, v: collection(h) };
  if (h === 'shop') return { key: 'shop', v: collection('all') };
  if (h.startsWith('product-')) { const v = product(h.slice(8)); return v.notFound ? { key: '404', v: notFound } : { key: h, v }; }
  const map = { finder, 'build-a-set': builder, gifts, about, faq, contact, shipping, checkout };
  return map[h] ? { key: h, v: map[h] } : { key: '404', v: notFound };
}

function applyWorldDirect(w) {
  if (!w || w === world.current) return;
  world.current = w; root.dataset.world = w;
  try { localStorage.setItem('veloura-world', JSON.stringify(w)); } catch (e) { /* ignore */ }
  syncWorldUI();
  setTimeout(() => emit('world', w), 0);
}

async function navigate(first = false) {
  const next = resolve(location.hash);
  if (current && next.key === current.key) return;
  const swap = () => {
    try { cleanup?.(); } catch (e) { /* ignore */ }
    cleanup = null;
    applyWorldDirect(next.v.world);
    view.innerHTML = next.v.render();
    document.title = next.v.title;
    current = next;
    scrollTo(0, 0);
    document.querySelectorAll('[data-nav]').forEach((a) => a.toggleAttribute('aria-current', a.dataset.nav === next.key || (a.dataset.nav === '' && next.key === 'home')));
    document.querySelectorAll('[data-nav]').forEach((a) => { if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'page'); });
    onScroll();
    const res = next.v.mount?.(view, { header });
    Promise.resolve(res).then((fn) => { if (current === next) cleanup = fn || null; else fn?.(); });
  };
  const dialogs = [...document.querySelectorAll('dialog[open]')];
  dialogs.forEach((d) => drawer.close(d));
  if (!first && document.startViewTransition && !reduced()) {
    const toWorld = next.v.world && next.v.world !== world.current;
    root.dataset.vt = toWorld ? 'world' : 'page';
    if (toWorld && pendingWorldOrigin) { const r = pendingWorldOrigin.getBoundingClientRect(); root.style.setProperty('--vt-x', `${r.left + r.width / 2}px`); root.style.setProperty('--vt-y', `${r.top + r.height / 2}px`); }
    pendingWorldOrigin = null;
    const t = document.startViewTransition(swap);
    t.finished.finally(() => { delete root.dataset.vt; document.querySelectorAll('img[style*="product-hero"]').forEach((x) => { x.style.viewTransitionName = ''; }); });
  } else swap();
  view.focus({ preventScroll: true });
}
addEventListener('hashchange', () => navigate());
initTilt();
navigate(true);
