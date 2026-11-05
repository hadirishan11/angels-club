/*!
 * VELOURA v2 features for the Shopify theme:
 *  - Homepage scroll story (sections/veloura-story.liquid)
 *  - High-fidelity product bottle viewer (metafield veloura.bottle_json)
 *  - Scent finder quiz (sections/scent-finder.liquid)
 *  - Build-your-own discovery set (sections/set-builder.liquid)
 * Uses the cart/world/drawer helpers exposed by assets/veloura.js (window.Veloura).
 * The 3D engine (assets/veloura-world3d.js) is loaded only when needed and only with WebGL.
 */
(() => {
  'use strict';
  const V = window.Veloura || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = () => document.documentElement.dataset.motion === 'reduced' || document.documentElement.dataset.motion === 'off';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const currentWorld = () => (document.documentElement.dataset.world === 'rose' ? 'rose' : 'noir');
  const money = (cents) => {
    const fmt = (V.settings && V.settings.moneyFormat) || '${{amount}}';
    const v = (Number(cents) || 0) / 100;
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, (_, k) => (k.includes('no_decimals') ? Math.round(v).toLocaleString('en-CA') : v.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })));
  };

  let engine;
  function hasWebGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
  function load3D() {
    if (!V.settings?.enable3d || !hasWebGL() || !V.assets?.world3d) return Promise.resolve(null);
    engine ||= import(V.assets.world3d).catch((e) => { console.warn('[Veloura] 3D unavailable', e); return null; });
    return engine;
  }
  const parseJSON = (el) => { try { return JSON.parse(el.textContent); } catch (e) { return null; } };
  const DEFAULT_BOTTLE = {
    noir: { shape: 'column', cap: 'block', glass: '#5f646d', liquid: '#6b4a24', metal: 'gold', capColor: '#0d0d0f' },
    rose: { shape: 'crystal', cap: 'gem', glass: '#ffb6d3', liquid: '#e8327a', metal: 'rosegold', capColor: '#ff97c2' },
  };

  async function addItems(items, source, label) {
    if (!V.Cart) { window.location.href = '/cart'; return; }
    try {
      await V.Cart.add({ items }, { source });
      V.Drawer?.open('CartDrawer');
    } catch (e) {
      const t = document.createElement('div');
      t.className = 'toast toast--error is-visible'; t.setAttribute('role', 'status');
      t.textContent = e.message || V.strings?.cartError || 'Something went wrong.';
      document.body.appendChild(t); setTimeout(() => t.remove(), 3500);
    }
  }

  /* ============================================================ STORY */
  function initStory(story) {
    if (story._init) return; story._init = true;
    const CH = 4.3;
    const canvas = $('canvas', story);
    const chapters = $$('[data-ch]', story);
    const dots = $$('[data-dot]', story);
    const header = $('.header-wrapper');
    let api = null, p = 0;
    const update = () => {
      const r = story.getBoundingClientRect();
      const total = r.height - innerHeight;
      p = Math.max(0, Math.min(1, -r.top / Math.max(1, total))) * CH;
      chapters.forEach((c, i) => c.classList.toggle('on', i === 0 ? p < 0.42 : i === 4 ? p > 3.55 : Math.abs(p - i) < 0.42));
      const active = Math.min(4, Math.round(Math.min(p, 4)));
      dots.forEach((d, i) => d.classList.toggle('on', i === active));
      api?.setProgress(p);
    };
    addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    addEventListener('resize', update);
    update();
    story.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = story.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / innerHeight - 0.5;
      api?.setPointer(nx, ny);
      api?.setHover(p < 0.4 ? (nx < 0 ? -1 : 1) : 0);
    }, { passive: true });
    story.addEventListener('pointerleave', () => api?.setHover(0));
    $$('[data-side]', story).forEach((s) => s.addEventListener('focusin', () => api?.setHover(+s.dataset.side)));
    $$('[data-enter-world]', story).forEach((a) => a.addEventListener('click', () => { try { localStorage.setItem('veloura-world', a.dataset.enterWorld); } catch (e) { /* ignore */ } }));
    document.addEventListener('veloura:world', (e) => api?.setWorld(e.detail.world));
    if (header) header.classList.add('on-story');
    load3D().then((mod) => {
      if (!mod) return;
      try {
        api = mod.mountStory(canvas, { world: currentWorld(), reducedMotion: reduced() });
        api.setProgress(p);
        requestAnimationFrame(() => story.classList.add('has-3d'));
        new IntersectionObserver(([en]) => api.setVisible(en.isIntersecting)).observe(story);
      } catch (e) { console.warn('[Veloura] story 3D failed', e); }
    });
  }

  /* ============================================================ PRODUCT VIEWER */
  function initViewer(el) {
    if (el._init) return; el._init = true;
    const spec = parseJSON($('script[type="application/json"]', el)) || {};
    Object.keys(spec).forEach((k) => { if (spec[k] === '' || spec[k] == null) delete spec[k]; });
    const worldAttr = el.dataset.world;
    const world = worldAttr === 'noir' || worldAttr === 'rose' ? worldAttr : currentWorld();
    const capBtn = $('[data-cap-toggle]', el);
    const io = new IntersectionObserver(async ([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const mod = await load3D();
      if (!mod) { if (capBtn) capBtn.hidden = true; return; }
      try {
        const viewer = mod.mountViewer($('[data-stage]', el) || el, Object.assign({}, DEFAULT_BOTTLE[world], spec), world, { reducedMotion: reduced() });
        el.classList.add('is-3d-ready');
        capBtn?.addEventListener('click', () => { const on = viewer.toggleCap(); capBtn.setAttribute('aria-pressed', String(on)); });
      } catch (e) { console.warn('[Veloura] viewer failed', e); if (capBtn) capBtn.hidden = true; }
    }, { rootMargin: '200px' });
    io.observe(el);
  }

  /* ============================================================ SCENT FINDER */
  const QUESTIONS = [
    { id: 'who', title: 'Who is this fragrance for?', options: [
      ['me-noir', 'Me — bold & magnetic', 'Woods, spice, leather, smoke'], ['me-rose', 'Me — soft & radiant', 'Florals, fruits, vanilla, musk'],
      ['gift-him', 'A gift for him', 'We will lean towards Veloura Noir'], ['gift-her', 'A gift for her', 'We will lean towards Veloura Rosé'], ['any', 'Surprise me', 'Search both worlds']] },
    { id: 'mood', title: 'Which mood feels most like you?', options: [
      ['fresh', 'Fresh & clean', 'Citrus, sea air, cotton'], ['warm', 'Warm & cosy', 'Amber, vanilla, honey'], ['mysterious', 'Mysterious', 'Incense, oud, dark woods'],
      ['romantic', 'Romantic', 'Rose, peony, soft powder'], ['playful', 'Playful', 'Juicy fruits, sweet notes'], ['confident', 'Polished & confident', 'Crisp, structured, elegant']] },
    { id: 'time', title: 'When will you wear it most?', options: [['day', 'Daytime', 'Work, brunch, everyday'], ['night', 'Evenings', 'Dinners, dates, events'], ['both', 'Day to night', 'One scent that does it all']] },
    { id: 'notes', title: 'Which notes draw you in?', hint: 'Choose up to two.', multi: 2, options: [
      ['citrus fresh', 'Citrus & sea', 'Bergamot, neroli, salt'], ['woody', 'Woods & smoke', 'Vetiver, cedar, incense'], ['floral', 'Flowers', 'Rose, jasmine, orange blossom'],
      ['gourmand vanilla', 'Vanilla & sweets', 'Praline, tonka, berries'], ['amber oriental spicy', 'Spice & amber', 'Saffron, tobacco, resin'], ['powdery iris', 'Powder & iris', 'Soft, elegant'],
      ['musk', 'Clean musk', 'Skin, cotton'], ['leather', 'Leather & suede', 'Smooth, warm'], ['fruity', 'Fruits', 'Lychee, raspberry, pear'], ['aromatic', 'Herbs & spice', 'Lavender, pepper, sage']] },
    { id: 'intensity', title: 'How noticeable should it be?', options: [['1', 'Close to the skin', 'Discovered only up close'], ['3', 'Noticeable', 'Present without filling the room'], ['5', 'Leaves a trail', 'Memorable and long-lasting']] },
  ];
  function scoreProducts(list, a) {
    const pref = { 'me-noir': 'noir', 'gift-him': 'noir', 'me-rose': 'rose', 'gift-her': 'rose' }[a.who];
    return list.filter((p) => p.available).map((p) => {
      let s = 0; const why = [];
      if (!pref) s += 2; else if (p.world === pref) s += 4; else if (p.world) s -= 2;
      if (p.mood.includes(a.mood)) { s += 3; why.push(`${a.mood} mood`); }
      if (a.time && p.time && (p.time === a.time || p.time === 'both' || a.time === 'both')) { s += 2; why.push(p.time === 'both' ? 'wears day to night' : p.time === 'day' ? 'made for daytime' : 'an evening scent'); }
      const fam = (p.family + ' ' + p.notes).toLowerCase();
      (a.notes || []).forEach((n) => { if (n.split(' ').some((w) => fam.includes(w))) { s += 4; why.unshift(`${p.family ? p.family.toLowerCase() : 'note'} match`); } });
      if (p.intensity) { const d = Math.abs(p.intensity - Number(a.intensity || 3)); s += 2 - d; }
      return { p, s, why };
    }).sort((x, y) => y.s - x.s).slice(0, 3);
  }
  function initFinder(root) {
    if (root._init) return; root._init = true;
    const data = parseJSON($('[data-finder-products]', root)) || [];
    const box = $('[data-finder]', root);
    const a = {}; let step = 0;
    const progress = () => `<div class="quiz__progress" aria-hidden="true">${QUESTIONS.map((_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>`;
    const showQ = () => {
      const q = QUESTIONS[step];
      const sel = (v) => (q.multi ? (a[q.id] || []).includes(v) : a[q.id] === v);
      box.innerHTML = `${progress()}<div class="quiz__q"><p class="eyebrow">Question ${step + 1} of ${QUESTIONS.length}</p><h2 class="h1">${q.title}</h2>${q.hint ? `<p class="muted">${q.hint}</p>` : ''}
        <div class="options" role="group" aria-label="${esc(q.title)}">${q.options.map(([v, t, d]) => `<button class="option" type="button" data-v="${esc(v)}" aria-pressed="${sel(v)}"><strong>${esc(t)}</strong><span>${esc(d)}</span></button>`).join('')}</div>
        <div class="quiz__nav"><button class="btn btn--outline btn--small" type="button" data-back ${step === 0 ? 'disabled' : ''}>Back</button>${q.multi ? `<button class="btn btn--primary btn--small" type="button" data-next ${(a[q.id] || []).length ? '' : 'disabled'}>Next</button>` : ''}</div></div>`;
    };
    const showResults = () => {
      const res = scoreProducts(data, a);
      if (!res.length) { box.innerHTML = `<div class="quiz__q"><h2 class="h1">We're curating your matches</h2><p class="lede">Add products to the finder's collection (Theme editor → Scent finder) to see recommendations.</p><button class="btn btn--outline btn--small" data-restart type="button">Retake</button></div>`; return; }
      box.innerHTML = `<div class="quiz__q"><p class="eyebrow">Your matches</p><h2 class="h1">Three fragrances to try</h2><p class="lede">Based on your answers.</p>
        <div class="matches">${res.map((r) => `<div class="match">${r.p.image ? `<img src="${esc(r.p.image)}" alt="" loading="lazy" width="110" height="136">` : '<span></span>'}<div>
          <span class="match__world">${r.p.vendor ? esc(r.p.vendor) : ''}${r.p.world ? ` · ${r.p.world === 'noir' ? 'Noir' : 'Rosé'}` : ''}</span>
          <h3><a class="link-underline" href="${esc(r.p.url)}">${esc(r.p.title)}</a></h3>
          <p class="match__why">${r.why.length ? 'Why: ' + r.why.slice(0, 3).map(esc).join(' · ') : 'A balanced match for your answers'}</p>
          <div class="match__buy"><span class="price">${money(r.p.price)}</span><button class="btn btn--primary btn--small" type="button" data-add-one="${r.p.variant}">Add to bag</button></div></div></div>`).join('')}</div>
        <div class="quiz__all"><button class="btn btn--primary" type="button" data-add-all>Add all three to bag</button><button class="btn btn--outline btn--small" type="button" data-restart>Retake the quiz</button></div></div>`;
      box._res = res;
    };
    box.addEventListener('click', (e) => {
      const o = e.target.closest('.option');
      if (o) {
        const q = QUESTIONS[step];
        if (q.multi) { const cur = a[q.id] || []; a[q.id] = cur.includes(o.dataset.v) ? cur.filter((x) => x !== o.dataset.v) : cur.concat(o.dataset.v).slice(-q.multi); showQ(); return; }
        a[q.id] = o.dataset.v; o.setAttribute('aria-pressed', 'true');
        if (q.id === 'who') { const w = { 'me-noir': 'noir', 'gift-him': 'noir', 'me-rose': 'rose', 'gift-her': 'rose' }[o.dataset.v]; if (w && V.World) V.World.set(w, o); }
        setTimeout(() => { step++; step < QUESTIONS.length ? showQ() : showResults(); }, 220);
        return;
      }
      if (e.target.closest('[data-next]')) { step++; step < QUESTIONS.length ? showQ() : showResults(); }
      if (e.target.closest('[data-back]') && step > 0) { step--; showQ(); }
      if (e.target.closest('[data-restart]')) { Object.keys(a).forEach((k) => delete a[k]); step = 0; showQ(); }
      const one = e.target.closest('[data-add-one]');
      if (one) addItems([{ id: Number(one.dataset.addOne), quantity: 1 }], one.closest('.match')?.querySelector('img'));
      if (e.target.closest('[data-add-all]') && box._res) addItems(box._res.map((r) => ({ id: Number(r.p.variant), quantity: 1, properties: { 'Scent finder': 'Discovery trio' } })), null);
    });
    showQ();
  }

  /* ============================================================ SET BUILDER */
  function initBuilder(root) {
    if (root._init) return; root._init = true;
    const data = (parseJSON($('[data-builder-products]', root)) || []).filter((p) => p.available);
    const sizes = (root.dataset.sizes || '3,5').split(',').map(Number);
    let size = sizes[0], filter = '', picked = [], tray = null, mod = null;
    const trayEl = $('[data-tray]', root);
    const byId = (id) => data.find((p) => String(p.variant) === String(id));
    const drawPicks = () => {
      $('[data-picks]', root).innerHTML = data.filter((p) => !filter || p.world === filter).map((p) => {
        const on = picked.includes(String(p.variant));
        return `<button class="pick" type="button" data-pick="${p.variant}" aria-pressed="${on}" ${!on && picked.length >= size ? 'disabled' : ''}>
          ${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : '<span class="pick__ph"></span>'}<b>${esc(p.title)}</b><small>${esc(p.vendor || '')} · ${money(p.price)}</small></button>`;
      }).join('') || '<p class="muted">Add products to the builder\'s collection in the theme editor.</p>';
    };
    const drawSummary = () => {
      $('[data-slots]', root).innerHTML = Array.from({ length: size }, (_, i) => {
        const p = byId(picked[i]);
        return p ? `<span class="slot filled">${p.image ? `<img src="${esc(p.image)}" alt="">` : ''}${esc(p.title)}<button type="button" data-unpick="${p.variant}" aria-label="Remove ${esc(p.title)}">×</button></span>` : `<span class="slot">Slot ${i + 1}</span>`;
      }).join('');
      const full = picked.length === size;
      const total = picked.reduce((s, id) => s + (byId(id)?.price || 0), 0);
      $('[data-total]', root).textContent = picked.length ? money(total) : money(0);
      $('[data-sum-note]', root).textContent = full ? (root.dataset.discountNote || 'Your case is ready.') : `Choose ${size - picked.length} more`;
      $('[data-add-set]', root).disabled = !full;
      tray?.setItems(picked.map((id) => { const p = byId(id); return { id: String(p.variant), bottle: Object.assign({}, DEFAULT_BOTTLE[p.world || 'rose'], p.bottle || {}) }; }));
    };
    const remountTray = () => {
      tray?.dispose(); tray = null;
      if (!mod) return;
      try { trayEl.innerHTML = ''; tray = mod.mountTray(trayEl, currentWorld(), size); drawSummary(); } catch (e) { console.warn(e); }
    };
    root.addEventListener('click', (e) => {
      const pk = e.target.closest('[data-pick]');
      if (pk) { const id = pk.dataset.pick; picked = picked.includes(id) ? picked.filter((x) => x !== id) : picked.length < size ? picked.concat(id) : picked; drawPicks(); drawSummary(); return; }
      const up = e.target.closest('[data-unpick]');
      if (up) { picked = picked.filter((x) => x !== up.dataset.unpick); drawPicks(); drawSummary(); return; }
      const sz = e.target.closest('[data-size]');
      if (sz) { size = +sz.dataset.size; picked = picked.slice(0, size); $$('[data-size]', root).forEach((b) => b.setAttribute('aria-pressed', String(b === sz))); drawPicks(); remountTray(); drawSummary(); return; }
      const f = e.target.closest('[data-filter]');
      if (f) { filter = f.dataset.filter; $$('[data-filter]', root).forEach((b) => b.setAttribute('aria-pressed', String(b === f))); drawPicks(); }
      if (e.target.closest('[data-add-set]')) {
        const tag = `Set of ${size} · ${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        addItems(picked.map((id) => ({ id: Number(id), quantity: 1, properties: { 'Discovery set': tag } })), trayEl);
        picked = []; drawPicks(); drawSummary();
      }
    });
    document.addEventListener('veloura:world', () => remountTray());
    drawPicks(); drawSummary();
    load3D().then((m) => { mod = m; if (m) remountTray(); });
  }

  function init(scope = document) {
    $$('[data-veloura-story]', scope).forEach(initStory);
    $$('[data-v2-viewer]', scope).forEach(initViewer);
    $$('[data-scent-finder]', scope).forEach(initFinder);
    $$('[data-set-builder]', scope).forEach(initBuilder);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init()); else init();
  document.addEventListener('shopify:section:load', (e) => init(e.target));
})();
