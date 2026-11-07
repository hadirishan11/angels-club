/*!
 * MAISON VELOURA — interaction layer.
 * Scroll-lit manifesto, count-ups, spotlight tiles, floating house preview,
 * hero cursor light and the end-of-page coda. All pointer work is rAF-throttled,
 * pointer effects only run on (hover: hover) devices, and everything respects reduced motion.
 */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const html = document.documentElement;
  const reduced = () =>
    html.dataset.motion === 'off' || html.dataset.motion === 'reduced' ||
    (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const finePointer = () => window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------------------------------------------------- scroll loop (one listener for all) */
  const scrollJobs = new Set();
  let ticking = false;
  const runScroll = () => { ticking = false; scrollJobs.forEach((fn) => fn()); };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });

  /* ---------------------------------------------------------- manifesto: words light up with scroll */
  function initManifesto(root) {
    if (root._m) return; root._m = true;
    const words = $$('.m-w', root);
    if (!words.length) return;
    if (reduced()) { words.forEach((w) => w.style.setProperty('--o', 1)); return; }
    const text = $('[data-m-words]', root);
    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) onScroll(); }, { rootMargin: '20% 0px' }).observe(text);
    scrollJobs.add(() => {
      if (!visible) return;
      const r = text.getBoundingClientRect();
      const vh = innerHeight;
      // progress 0 when the block's top hits 85% of the viewport, 1 when its bottom reaches 45%
      const start = vh * 0.85, end = vh * 0.45;
      const p = Math.min(1, Math.max(0, (start - r.top) / Math.max(1, (start - end) + r.height)));
      const lit = p * words.length * 1.15;
      for (let i = 0; i < words.length; i++) {
        const o = Math.min(1, Math.max(0.16, 0.16 + (lit - i) * 0.6));
        if (words[i]._o !== o) { words[i]._o = o; words[i].style.setProperty('--o', o.toFixed(3)); }
      }
    });
    onScroll();
  }

  /* ---------------------------------------------------------- count-up figures */
  function initCounts(scope) {
    $$('[data-m-count]', scope).forEach((el) => {
      if (el._m) return; el._m = true;
      const target = parseFloat(el.dataset.mCount) || 0;
      if (reduced() || target <= 1) { el.textContent = target; return; }
      el.textContent = '0';
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now(), dur = 1800;
        const step = (t) => {
          const k = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 4);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------- spotlight tiles */
  function initSpotlight(scope) {
    if (!finePointer()) return;
    $$('[data-m-spotlight]', scope).forEach((tile) => {
      if (tile._m) return; tile._m = true;
      const plinth = $('.m-tile__plinth', tile) || tile;
      let raf = 0, x = 0, y = 0;
      tile.addEventListener('pointermove', (e) => {
        const r = plinth.getBoundingClientRect();
        x = e.clientX - r.left; y = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(() => {
          raf = 0;
          plinth.style.setProperty('--mx', x + 'px');
          plinth.style.setProperty('--my', y + 'px');
        });
      }, { passive: true });
    });
  }

  /* ---------------------------------------------------------- houses: floating preview follows cursor */
  function initHouses(root) {
    if (root._m) return; root._m = true;
    if (!finePointer() || reduced()) return;
    const float = $('.m-houses__float', root);
    const img = $('img', float);
    if (!float || !img) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, active = false;
    const loop = () => {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      float.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${Math.max(-8, Math.min(8, (tx - cx) * 0.05))}deg)`;
      if (active || Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) raf = requestAnimationFrame(loop); else raf = 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    $$('[data-m-preview]', root).forEach((link) => {
      const src = link.dataset.mPreview;
      const pre = new Image(); // warm the cache on first hover intent
      link.addEventListener('pointerenter', (e) => {
        if (!pre.src) pre.src = src;
        img.src = src; active = true; float.classList.add('is-on');
        tx = e.clientX + 40; ty = e.clientY; if (!cx) { cx = tx; cy = ty; }
        kick();
      });
      link.addEventListener('pointerleave', () => { active = false; float.classList.remove('is-on'); kick(); });
    });
    root.addEventListener('pointermove', (e) => { tx = e.clientX + 40; ty = e.clientY; if (active) kick(); }, { passive: true });
  }

  /* ---------------------------------------------------------- hero cursor light */
  function initCursorLight() {
    const hero = $('[data-veloura-story] .vstory__sticky') || $('[data-dual-hero]');
    if (!hero || hero._m || !finePointer() || reduced()) return;
    hero._m = true;
    const light = document.createElement('div');
    light.className = 'm-cursor-light'; light.setAttribute('aria-hidden', 'true');
    hero.appendChild(light);
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, on = false;
    const loop = () => {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      light.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = on || Math.abs(tx - cx) + Math.abs(ty - cy) > 1 ? requestAnimationFrame(loop) : 0;
    };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      if (!on) { on = true; light.classList.add('is-on'); if (!cx) { cx = tx; cy = ty; } }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { on = false; light.classList.remove('is-on'); });
  }

  /* ---------------------------------------------------------- coda: the hidden detail */
  function initCoda(root) {
    if (root._m) return; root._m = true;
    if (reduced()) { root.classList.add('is-arrived'); return; }
    scrollJobs.add(() => {
      if (root.classList.contains('is-arrived')) return;
      const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 140;
      const r = root.getBoundingClientRect();
      if (atEnd && r.top < innerHeight) root.classList.add('is-arrived');
    });
  }

  /* ---------------------------------------------------------- marquee: pause off-screen */
  function initMarquee(row) {
    if (row._m) return; row._m = true;
    new IntersectionObserver(([e]) => {
      $$('.m-marquee__track', row).forEach((t) => { t.style.animationPlayState = e.isIntersecting ? '' : 'paused'; });
    }).observe(row);
  }

  function init(scope = document) {
    $$('[data-m-manifesto]', scope).forEach(initManifesto);
    initCounts(scope);
    initSpotlight(scope);
    $$('[data-m-houses]', scope).forEach(initHouses);
    $$('[data-m-coda]', scope).forEach(initCoda);
    $$('[data-m-marquee]', scope).forEach(initMarquee);
    initCursorLight();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init()); else init();
  document.addEventListener('shopify:section:load', (e) => init(e.target));
})();
