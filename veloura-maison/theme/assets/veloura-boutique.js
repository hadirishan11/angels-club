/*!
 * MAISON VELOURA — the boutique. A first-person CSS 3D store.
 * Title card → doors open → camera glides inside → look around (drag / swipe / keys / wall buttons)
 * → pick a bottle off the shelf → spritz → add to bag. Respects reduced motion; no WebGL.
 */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const html = document.documentElement;
  const reduced = () => html.dataset.motion === 'off' || html.dataset.motion === 'reduced' ||
    (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const fine = () => window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } } };

  const VW = 1600, VH = 900;
  const ORDER = ['left', 'back', 'right'];

  function stations(portrait) {
    return portrait
      ? { outside: { x: 0, y: -60, z: 3000, yaw: 0, pitch: 0 }, back: { x: 0, y: 60, z: 380, yaw: 0, pitch: 0 },
          left: { x: 260, y: 60, z: 0, yaw: -90, pitch: 0 }, right: { x: -260, y: 60, z: 0, yaw: 90, pitch: 0 } }
      : { outside: { x: 0, y: -40, z: 2250, yaw: 0, pitch: 0 }, back: { x: 0, y: 0, z: 260, yaw: 0, pitch: 0 },
          left: { x: 120, y: 0, z: 0, yaw: -90, pitch: 0 }, right: { x: -120, y: 0, z: 0, yaw: 90, pitch: 0 } };
  }

  function init(root) {
    if (root._bq) return; root._bq = true;
    const stage = $('[data-bq-stage]', root);
    const viewport = $('[data-bq-viewport]', root);
    const world = $('[data-bq-world]', root);
    const hud = $('[data-bq-hud]', root);
    const hint = $('[data-bq-hint]', root);
    const insp = $('[data-bq-inspect]', root);
    const hand = $('[data-bq-hand]', insp);
    const inspImg = $('[data-bq-img]', insp);
    const bagBtn = $('[data-bq-bag]', root);
    const countEl = $('[data-bq-count]', root);
    const V = window.Veloura || {};
    // The dialog lives on <body> so no transformed theme ancestor can trap its position: fixed.
    insp.style.setProperty('--bq-ease', 'cubic-bezier(.22, .61, .36, 1)');
    document.body.appendChild(insp);

    // A plain grid if 3D transforms are unsupported.
    if (!(window.CSS && CSS.supports && CSS.supports('transform-style', 'preserve-3d'))) { root.classList.add('bq--flat'); hud.hidden = false; return; }
    // Side walls stay hidden until the doors open (avoids depth-sorting slivers over the shopfront).
    const sides = $$('.bq-wall--left, .bq-wall--right', world);
    const showSides = (on) => sides.forEach((el) => { el.style.visibility = on ? '' : 'hidden'; });
    showSides(false);

    let portrait = false, S = stations(false);
    const cam = { ...S.outside };          // animated camera
    const look = { yaw: 0, pitch: 0 };     // free-look offset (drag)
    const lookS = { yaw: 0, pitch: 0 };    // smoothed
    const par = { x: 0, y: 0 }, parS = { x: 0, y: 0 }; // pointer parallax
    let station = 'outside', tween = null, raf = 0, inside = false, through = false, visible = true;

    /* ---------------- fit the 1600×900 virtual screen to the stage ---------------- */
    function fit() {
      const r = stage.getBoundingClientRect();
      const wasPortrait = portrait;
      portrait = r.width < r.height * 0.9;
      const s = portrait ? r.width / 850 : Math.max(r.width / VW, r.height / VH);
      viewport.style.setProperty('--bq-s', s.toFixed(4));
      S = stations(portrait);
      if (wasPortrait !== portrait && !tween) Object.assign(cam, S[station]);
      kick();
    }

    /* ---------------- render loop (runs only while something moves) ---------------- */
    function frame(now) {
      raf = 0;
      let moving = false;
      if (tween) {
        const k = clamp((now - tween.t0) / tween.dur, 0, 1), e = tween.ease(k);
        for (const key in tween.to) cam[key] = lerp(tween.from[key], tween.to[key], e);
        if (k >= 1) { const done = tween.done; tween = null; done && done(); } else moving = true;
      }
      const tl = reduced() ? 1 : 0.12;
      lookS.yaw = lerp(lookS.yaw, look.yaw, tl); lookS.pitch = lerp(lookS.pitch, look.pitch, tl);
      parS.x = lerp(parS.x, par.x, 0.06); parS.y = lerp(parS.y, par.y, 0.06);
      if (Math.abs(lookS.yaw - look.yaw) > 0.01 || Math.abs(lookS.pitch - look.pitch) > 0.01 ||
          Math.abs(parS.x - par.x) > 0.001 || Math.abs(parS.y - par.y) > 0.001) moving = true;
      const yaw = cam.yaw + lookS.yaw + parS.x * 2.4;
      const pitch = cam.pitch + lookS.pitch - parS.y * 1.6;
      world.style.transform = `translateZ(900px) rotateX(${pitch.toFixed(3)}deg) rotateY(${yaw.toFixed(3)}deg) translate3d(${(-cam.x).toFixed(1)}px, ${(-cam.y).toFixed(1)}px, ${(-cam.z).toFixed(1)}px)`;
      // Crossing the threshold: a warm flash hides the façade passing the camera plane.
      if (!through && cam.z < 1010 && station !== 'outside') passThrough();
      if (moving && visible) kick();
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function moveTo(target, dur, ease = easeInOut) {
      return new Promise((done) => {
        if (reduced() || dur === 0) { Object.assign(cam, target); tween = null; kick(); done(); return; }
        tween = { from: { ...cam }, to: { ...target }, t0: performance.now(), dur, ease, done };
        kick();
      });
    }

    /* ---------------- the entrance ---------------- */
    function passThrough() {
      through = true;
      root.classList.add('is-through');
      const flash = document.createElement('div');
      flash.setAttribute('aria-hidden', 'true');
      flash.style.cssText = 'position:absolute;inset:0;z-index:5;pointer-events:none;background:radial-gradient(60% 60% at 50% 55%,rgba(255,236,200,.95),rgba(255,214,150,.35) 60%,rgba(0,0,0,0));opacity:0;transition:opacity .35s ease';
      stage.appendChild(flash);
      requestAnimationFrame(() => { flash.style.opacity = '1'; });
      setTimeout(() => { $$('.bq-facade, .bq-door, .bq-street', world).forEach((el) => { el.style.display = 'none'; }); flash.style.transition = 'opacity 1.1s ease'; flash.style.opacity = '0'; }, 330);
      setTimeout(() => flash.remove(), 1600);
    }
    async function enter(instant) {
      if (inside || root.classList.contains('is-entering')) return;
      root.classList.add('is-entering');
      store.set('veloura-bq-visited', '1');
      if (instant || reduced()) {
        root.classList.add('is-open');
        showSides(true);
        passThrough();
        Object.assign(cam, S.back); station = 'back'; kick();
      } else {
        setTimeout(() => { root.classList.add('is-open'); showSides(true); }, 250);
        station = 'back';
        await moveTo({ ...S.back, z: S.back.z + 520, y: S.back.y - 10 }, 3600, (t) => easeInOut(t));
        await moveTo(S.back, 1300, easeOut);
      }
      inside = true;
      bottles.forEach((b) => (b.tabIndex = 0));
      root.classList.remove('is-entering');
      root.classList.add('is-inside');
      hud.hidden = false;
      setCurrent('back');
      setTimeout(() => hint && hint.classList.add('is-faded'), 6500);
    }
    function setCurrent(w) {
      $$('[data-bq-go]', root).forEach((b) => b.setAttribute('aria-current', String(b.dataset.bqGo === w)));
    }
    function go(w) {
      if (!inside || !S[w] || w === station) return;
      station = w; look.yaw = 0; look.pitch = 0;
      setCurrent(w);
      moveTo(S[w], 1500);
    }
    function step(dir) { const i = ORDER.indexOf(station); const n = ORDER[clamp(i + dir, 0, ORDER.length - 1)]; go(n); }

    /* ---------------- free look: drag / swipe / pointer parallax ---------------- */
    let drag = null, moved = false;
    stage.addEventListener('pointerdown', (e) => {
      if (!inside || e.button > 0 || e.target.closest('.bq__hud, .bq-inspect, .bq__intro')) return;
      drag = { x: e.clientX, y: e.clientY, yaw: look.yaw, pitch: look.pitch, t: performance.now(), id: e.pointerId, type: e.pointerType };
      moved = false;
    });
    addEventListener('pointermove', (e) => {
      if (drag && e.pointerId === drag.id) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!moved && Math.hypot(dx, dy) > 6) {
          if (drag.type === 'touch' && Math.abs(dy) > Math.abs(dx)) { drag = null; return; } // let the page scroll
          moved = true; stage.classList.add('is-dragging');
          try { stage.setPointerCapture(drag.id); } catch (err) { /* ignore */ }
        }
        if (moved) {
          const k = portrait ? 0.16 : 0.08;
          look.yaw = clamp(drag.yaw + dx * k, -34, 34);
          look.pitch = drag.type === 'touch' ? 0 : clamp(drag.pitch - dy * 0.05, -9, 9);
          kick();
        }
      } else if (inside && fine() && !reduced()) {
        const r = stage.getBoundingClientRect();
        par.x = clamp((e.clientX - r.left) / r.width - 0.5, -0.5, 0.5);
        par.y = clamp((e.clientY - r.top) / r.height - 0.5, -0.5, 0.5);
        kick();
      }
    }, { passive: true });
    const endDrag = (e) => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const dx = e ? e.clientX - drag.x : 0, dt = performance.now() - drag.t;
      stage.classList.remove('is-dragging');
      if (moved && Math.abs(dx) > 90 && dt < 320) step(dx > 0 ? -1 : 1);   // a quick flick turns to the next wall
      else if (moved && Math.abs(look.yaw) > 30) step(look.yaw > 0 ? -1 : 1); // looking far enough turns too
      drag = null;
      setTimeout(() => { moved = false; }, 0);
    };
    addEventListener('pointerup', endDrag);
    addEventListener('pointercancel', endDrag);

    /* ---------------- keyboard ---------------- */
    root.addEventListener('keydown', (e) => {
      if (!insp.hidden) return;
      if (!inside && (e.key === 'Enter' || e.key === ' ') && e.target === stage) { e.preventDefault(); enter(); }
      if (!inside) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    });

    /* ---------------- pick a bottle off the shelf ---------------- */
    let current = null, lastFocus = null;
    const cache = {};
    async function details(handle) {
      if (cache[handle]) return cache[handle];
      try {
        const r = await fetch(`${(V.routes && V.routes.root) || '/'}products/${encodeURIComponent(handle)}.js`.replace('//products', '/products'));
        const p = await r.json();
        const d = document.createElement('div'); d.innerHTML = p.description || '';
        const notes = [];
        $$('li', d).forEach((li) => {
          const m = li.textContent.trim().match(/^(top|heart|middle|base)\s*(notes?)?\s*[:\-–]\s*(.+)$/i);
          if (m) notes.push([m[1].toLowerCase() === 'middle' ? 'Heart' : m[1][0].toUpperCase() + m[1].slice(1).toLowerCase(), m[3]]);
        });
        const para = $$('p', d).map((x) => x.textContent.trim()).find((t) => t.length > 40 && !/^(size|best for|note)/i.test(t) && !/decant|affiliat|endorse/i.test(t)) || '';
        return (cache[handle] = { notes, desc: para });
      } catch (e) { return (cache[handle] = { notes: [], desc: '' }); }
    }
    function rectOf(el) { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }
    function flyImage(src, from, to, dur, cls) {
      const im = new Image(); im.src = src; im.alt = ''; im.className = 'bq-fly' + (cls ? ' ' + cls : '');
      im.style.cssText = `left:${from.x}px;top:${from.y}px;width:${from.w}px;height:${from.h}px`;
      document.body.appendChild(im);
      if (reduced()) { im.remove(); return Promise.resolve(); }
      const sx = to.w / from.w, sy = to.h / from.h;
      const a = im.animate([
        { transform: 'translate(0,0) scale(1,1)', opacity: 1 },
        { transform: `translate(${(to.x - from.x).toFixed(1)}px, ${(to.y - from.y - Math.min(120, Math.abs(to.y - from.y) * 0.3)).toFixed(1)}px) scale(${(sx * 0.98).toFixed(3)}, ${(sy * 0.98).toFixed(3)})`, offset: 0.7 },
        { transform: `translate(${(to.x - from.x).toFixed(1)}px, ${(to.y - from.y).toFixed(1)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`, opacity: 1 }
      ], { duration: dur, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });
      return a.finished.then(() => im.remove(), () => im.remove());
    }
    function containRect(box, natW, natH) {
      const k = Math.min(box.w / natW, box.h / natH); const w = natW * k, h = natH * k;
      return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
    }

    async function pick(btn) {
      if (current) return;
      current = btn; lastFocus = btn;
      const d = btn.dataset, srcImg = $('.bq-bottle__img', btn);
      const big = d.img || (srcImg && srcImg.currentSrc) || '';
      $('[data-bq-vendor]', insp).textContent = d.vendor || '';
      $('[data-bq-title]', insp).textContent = d.title || '';
      $('[data-bq-price]', insp).innerHTML = d.price || '';
      $('[data-bq-compare]', insp).innerHTML = d.compare || '';
      $('[data-bq-link]', insp).href = d.url || '#';
      $('[data-bq-notes]', insp).innerHTML = '';
      $('[data-bq-desc]', insp).textContent = '';
      const whisper = $('[data-bq-whisper]', insp); whisper.textContent = ''; whisper.classList.remove('is-on');
      const add = $('[data-bq-add]', insp);
      add.disabled = d.available !== 'true';
      add.textContent = d.available === 'true' ? (V.strings && V.strings.addToCart) || 'Add to bag' : (V.strings && V.strings.soldOut) || 'Sold out';
      inspImg.classList.toggle('bq-inspect__img--flat', !btn.classList.contains('bq-bottle--cut'));
      inspImg.style.opacity = '0';
      inspImg.src = big;

      insp.hidden = false;
      requestAnimationFrame(() => insp.classList.add('is-open'));
      document.documentElement.style.overflow = 'hidden';
      try { await inspImg.decode(); } catch (e) { /* ignore */ }
      if (srcImg) {
        const from = rectOf(srcImg);
        const to = containRect(rectOf(hand), inspImg.naturalWidth || 600, inspImg.naturalHeight || 900);
        const fromC = containRect(from, inspImg.naturalWidth || 600, inspImg.naturalHeight || 900);
        btn.classList.add('is-taken');
        await flyImage(big, fromC, to, 850, inspImg.classList.contains('bq-inspect__img--flat') ? 'bq-inspect__img--flat' : '');
      }
      inspImg.style.opacity = '1';
      hand.classList.add('is-held');
      add.focus({ preventScroll: true });
      const info = await details(d.handle);
      if (current !== btn) return;
      $('[data-bq-notes]', insp).innerHTML = info.notes.map(([k, v]) => `<li><b>${esc(k)}</b><span>${esc(v)}</span></li>`).join('');
      $('[data-bq-desc]', insp).textContent = info.desc;
      insp._notes = info.notes;
    }
    async function putBack() {
      if (!current) return;
      const btn = current, srcImg = $('.bq-bottle__img', btn);
      hand.classList.remove('is-held');
      if (srcImg && !reduced()) {
        const from = containRect(rectOf(hand), inspImg.naturalWidth || 600, inspImg.naturalHeight || 900);
        const to = containRect(rectOf(srcImg), inspImg.naturalWidth || 600, inspImg.naturalHeight || 900);
        inspImg.style.opacity = '0';
        insp.classList.remove('is-open');
        await flyImage(inspImg.src, from, to, 700, inspImg.classList.contains('bq-inspect__img--flat') ? 'bq-inspect__img--flat' : '');
      }
      close(btn);
    }
    function close(btn) {
      insp.classList.remove('is-open');
      insp.hidden = true;
      document.documentElement.style.overflow = '';
      if (btn) btn.classList.remove('is-taken');
      current = null;
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }

    function spritz() {
      const mist = $('[data-bq-mist]', insp);
      const n = reduced() ? 0 : 22;
      for (let i = 0; i < n; i++) {
        const p = document.createElement('i');
        const ang = (-60 + Math.random() * 120) * Math.PI / 180, dist = 80 + Math.random() * 220;
        p.style.setProperty('--tx', `${Math.sin(ang) * dist}px`);
        p.style.setProperty('--ty', `${-Math.cos(ang) * dist * 0.7 - 20}px`);
        p.style.setProperty('--sz', `${18 + Math.random() * 46}px`);
        p.style.animationDelay = `${Math.random() * 0.18}s`;
        mist.appendChild(p);
        setTimeout(() => p.remove(), 2800);
      }
      const notes = insp._notes || [];
      const get = (k) => (notes.find((x) => x[0] === k) || [])[1];
      const top = get('Top'), heart = get('Heart'), base = get('Base');
      const w = $('[data-bq-whisper]', insp);
      w.textContent = top ? `${top} first${heart ? ` — then ${heart.toLowerCase()}` : ''}${base ? `, settling into ${base.toLowerCase()}.` : '.'}` : 'A first impression you will remember.';
      w.classList.remove('is-on'); void w.offsetWidth; w.classList.add('is-on');
    }

    async function addToBag() {
      if (!current) return;
      const btn = current, add = $('[data-bq-add]', insp);
      const id = Number(btn.dataset.variant);
      add.disabled = true; add.textContent = (V.strings && V.strings.adding) || 'Adding…';
      try {
        if (V.Cart && V.Cart.add) await V.Cart.add({ items: [{ id, quantity: 1, properties: { _source: 'Boutique' } }] }, { source: null });
        else {
          const r = await fetch(((V.routes && V.routes.cartAdd) || '/cart/add') + '.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items: [{ id, quantity: 1 }] }) });
          if (!r.ok) throw new Error((await r.json()).description || 'Could not add to bag');
        }
        // the bottle drops into the bag
        if (!reduced()) {
          const from = containRect(rectOf(hand), inspImg.naturalWidth || 600, inspImg.naturalHeight || 900);
          const b = rectOf(bagBtn);
          inspImg.style.opacity = '0';
          insp.classList.remove('is-open');
          await flyImage(inspImg.src, from, { x: b.x + b.w * 0.3, y: b.y + b.h * 0.2, w: b.w * 0.4, h: b.h * 0.6 }, 800, inspImg.classList.contains('bq-inspect__img--flat') ? 'bq-inspect__img--flat' : '');
        }
        close(btn);
        bagBtn.classList.remove('is-bump'); void bagBtn.offsetWidth; bagBtn.classList.add('is-bump');
        try { const c = await (await fetch(((V.routes && V.routes.cart) || '/cart') + '.js')).json(); countEl.textContent = c.item_count; } catch (e) { /* ignore */ }
        const live = document.getElementById('v-live'); if (live) live.textContent = `${btn.dataset.title} added to your bag`;
      } catch (e) {
        add.disabled = false; add.textContent = e.message || 'Try again';
      }
    }

    /* ---------------- wiring ---------------- */
    $('[data-bq-enter]', root).addEventListener('click', () => enter());
    stage.addEventListener('click', (e) => {
      if (moved) return;
      const b = e.target.closest('[data-bq-pick]');
      if (b && inside) { pick(b); return; }
      if (!inside && !e.target.closest('.bq__hud, .bq-inspect')) enter();
    });
    $$('[data-bq-go]', root).forEach((b) => b.addEventListener('click', () => go(b.dataset.bqGo)));
    $('[data-bq-putback]', insp).addEventListener('click', putBack);
    $('[data-bq-spritz]', insp).addEventListener('click', spritz);
    $('[data-bq-add]', insp).addEventListener('click', addToBag);
    insp.addEventListener('click', (e) => { if (e.target === insp) putBack(); });
    insp.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); putBack(); }
      if (e.key === 'Tab') { // keep focus inside the dialog
        const f = $$('button:not([disabled]), a[href]', insp); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    bagBtn.addEventListener('click', () => { if (V.Drawer && V.Drawer.open) V.Drawer.open('CartDrawer'); else location.href = (V.routes && V.routes.cart) || '/cart'; });
    $('[data-bq-exit]', root).addEventListener('click', () => {
      const next = root.closest('.shopify-section')?.nextElementSibling; (next || root).scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
    });
    // shelf bottles are reachable by keyboard only once inside
    const bottles = $$('[data-bq-pick]', root);
    const setTab = (on) => bottles.forEach((b) => (b.tabIndex = on ? 0 : -1));
    setTab(false);
    stage.tabIndex = 0;
    stage.setAttribute('role', 'application');
    stage.setAttribute('aria-roledescription', 'boutique');

    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }).observe(root);
    addEventListener('resize', fit, { passive: true });
    fit();
    kick();
    root.classList.add('is-ready');

    if (root.dataset.skipIntro === 'true' && store.get('veloura-bq-visited')) enter(true);
  }

  function boot(scope = document) { $$('[data-boutique]', scope).forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => boot()); else boot();
  document.addEventListener('shopify:section:load', (e) => boot(e.target));
})();
