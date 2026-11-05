/** Shared UI helpers: icons, product cards, toast, fly-to-bag, drawers, reveals, tilt. */
import { money } from './state.js';
import { buyable } from './data/products.js';

export const icon = (name, cls = '') => `<svg class="i i-${name} ${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const img = (p) => (p.photos ? p.photos[0] : `img/products/${p.id}.webp`);
export const priceText = (p) => (buyable(p) ? money(p.price) : 'Price to be confirmed');
export const cut = (p) => `img/cut/${p.id}.webp`;
export const reduced = () => document.documentElement.dataset.motion === 'reduced';

export function card(p, i = 0) {
  return `<article class="card rv" data-tilt style="--d:${i % 8}">
    <div class="card__media">
      <span class="card__world card__world--${p.world}">${p.world === 'noir' ? 'Noir' : 'Rosé'}</span>
      <img src="${img(p)}" alt="${esc(p.name)}${p.photos ? '' : ' — illustrative bottle'}" loading="lazy" decoding="async" width="800" height="1000" data-vt-img="${p.id}">
    </div>
    ${buyable(p) ? `<button class="card__add" type="button" data-add="${p.id}" aria-label="Add ${esc(p.name)} to bag">${icon('plus')}</button>` : ''}
    <div class="card__body">
      <span class="card__house">${esc(p.house)}</span>
      <h3 class="card__name"><a href="#product-${p.id}" data-product-link="${p.id}">${esc(p.name)}</a></h3>
      <span class="card__family">${esc(p.family)} · ${esc(p.concentration)}</span>
      <div class="card__meta"><span class="price">${priceText(p)}</span><span class="card__size">${esc(p.size)}</span></div>
    </div>
  </article>`;
}

let toastTimer;
export function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

export function announce(msg) {
  const live = document.getElementById('live'); if (!live) return;
  live.textContent = ''; requestAnimationFrame(() => { live.textContent = msg; });
}

export function flyToBag(fromEl, src) {
  if (reduced() || !fromEl) return;
  const target = [...document.querySelectorAll('[data-bag-btn]')].find((b) => b.offsetParent !== null);
  if (!target) return;
  const s = fromEl.getBoundingClientRect(), t = target.getBoundingClientRect();
  const f = document.createElement('div'); f.className = 'fly';
  f.innerHTML = `<img src="${src}" alt="">`;
  document.body.appendChild(f);
  const sx = s.left + s.width / 2 - 32, sy = s.top + s.height / 2 - 32, tx = t.left + t.width / 2 - 32, ty = t.top + t.height / 2 - 32;
  f.animate([
    { transform: `translate(${sx}px,${sy}px) scale(1.5)`, opacity: 0.95 },
    { transform: `translate(${(sx + tx) / 2}px,${Math.min(sy, ty) - 120}px) scale(0.9)`, offset: 0.55 },
    { transform: `translate(${tx}px,${ty}px) scale(0.25)`, opacity: 0.3 },
  ], { duration: 850, easing: 'cubic-bezier(.5,0,.3,1)' }).finished.then(() => f.remove(), () => f.remove());
  setTimeout(() => { target.classList.remove('receive'); void target.offsetWidth; target.classList.add('receive'); }, 700);
}

/* native <dialog> drawers with slide animation and focus return */
export const drawer = {
  open(id, trigger) {
    const d = document.getElementById(id); if (!d || d.open) return;
    d._trigger = trigger || document.activeElement;
    d.showModal(); document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('open')));
    d.dispatchEvent(new Event('drawer-open'));
  },
  close(d) {
    if (typeof d === 'string') d = document.getElementById(d);
    if (!d || !d.open) return;
    d.classList.remove('open');
    setTimeout(() => { d.close(); document.body.style.overflow = ''; d._trigger?.focus?.({ preventScroll: true }); }, reduced() ? 0 : 380);
  },
};

let io;
export function reveal(scope = document) {
  const els = scope.querySelectorAll('.rv:not(.in)');
  if (reduced() || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  io ||= new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
  els.forEach((e) => io.observe(e));
}

export function initTilt() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.addEventListener('pointermove', (e) => {
    if (reduced()) return;
    const c = e.target.closest?.('[data-tilt]'); if (!c) return;
    const r = c.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    c.classList.add('tilting');
    c.style.setProperty('--ry', `${(px - 0.5) * 8}deg`); c.style.setProperty('--rx', `${(0.5 - py) * 8}deg`);
    c.style.setProperty('--mx', `${px * 100}%`); c.style.setProperty('--my', `${py * 100}%`);
  }, { passive: true });
  document.addEventListener('pointerout', (e) => {
    const c = e.target.closest?.('[data-tilt]'); if (!c || c.contains(e.relatedTarget)) return;
    c.classList.remove('tilting'); c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg');
  });
}

export function rail(scope) {
  scope.querySelectorAll('[data-rail]').forEach((wrap) => {
    const track = wrap.querySelector('.rail');
    const prev = wrap.querySelector('[data-prev]'), next = wrap.querySelector('[data-next]');
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + 20;
    const upd = () => { if (prev) prev.disabled = track.scrollLeft < 4; if (next) next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 4; };
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduced() ? 'auto' : 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduced() ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', upd, { passive: true }); upd();
  });
}

let three3d;
export function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
export async function load3D() {
  if (!hasWebGL()) return null;
  three3d ||= import('./world3d.js').catch((e) => { console.warn('3D unavailable', e); return null; });
  return three3d;
}
