/*!
 * VELOURA storefront core (no dependencies).
 * - World manager (Noir / Rosé) with cinematic transition and persistence
 * - Header behaviour, drawers (menu, search, cart)
 * - Ajax cart (Shopify Cart API + Section Rendering API)
 * - Product form, variant picker, gallery, sticky add-to-cart
 * - Predictive search, product recommendations, carousels, facets
 * - Scroll reveals, card tilt, atmosphere particles, lazy 3D
 * Every feature degrades gracefully: without JS the store uses native forms and links.
 */
(() => {
  'use strict';

  const V = window.Veloura || { routes: {}, settings: {}, strings: {}, assets: {} };
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const motionOff = () => root.dataset.motion === 'off' || root.dataset.motion === 'reduced';
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------ utilities */
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  function announce(msg) {
    const live = $('#v-live');
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = msg; });
  }

  let toastTimer;
  function toast(msg, isError = false) {
    let el = $('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.toggle('toast--error', isError);
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3200);
  }

  async function fetchJSON(url, options = {}) {
    const res = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }, options));
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON */ }
    if (!res.ok) {
      const err = new Error((data && (data.description || data.message)) || V.strings.cartError || 'Error');
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function formatMoney(cents, format = V.settings.moneyFormat || '${{amount}}') {
    const value = (Number(cents) || 0) / 100;
    const fmt = (n, dec, thou = ',', decSep = '.') => {
      const [i, d] = n.toFixed(dec).split('.');
      return i.replace(/\B(?=(\d{3})+(?!\d))/g, thou) + (d ? decSep + d : '');
    };
    return format.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
      switch (key) {
        case 'amount_no_decimals': return fmt(value, 0);
        case 'amount_with_comma_separator': return fmt(value, 2, '.', ',');
        case 'amount_no_decimals_with_comma_separator': return fmt(value, 0, '.', ',');
        case 'amount_with_space_separator': return fmt(value, 2, ' ', ',');
        default: return fmt(value, 2);
      }
    });
  }

  /* ------------------------------------------------------------ world manager */
  const World = {
    get current() { return root.dataset.world === 'rose' ? 'rose' : 'noir'; },
    get forced() { return root.dataset.worldForced || ''; },

    save(world) {
      if (!V.settings.rememberWorld) return;
      try { localStorage.setItem('veloura-world', world); } catch (e) { /* storage unavailable */ }
    },

    sync() {
      const w = this.current;
      $$('[data-world-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.worldBtn === w)));
      const meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--c-bg').trim() || (w === 'rose' ? '#FAD5E2' : '#0B0B0D'));
    },

    /**
     * Switch world. On a page whose world is locked to a collection, navigate
     * to the counterpart collection instead; elsewhere switch in place.
     */
    set(world, origin) {
      if (world !== 'noir' && world !== 'rose') return;
      this.save(world);
      if (this.forced && this.forced !== world && root.dataset.template === 'collection') {
        const url = V.routes[world];
        if (url) { window.location.href = url; return; }
      }
      if (world === this.current) return;

      const apply = () => {
        root.dataset.world = world;
        this.sync();
        document.dispatchEvent(new CustomEvent('veloura:world', { detail: { world } }));
      };
      const canVT = typeof document.startViewTransition === 'function' && V.settings.worldTransition && !motionOff();
      if (canVT) {
        if (origin) {
          const r = origin.getBoundingClientRect();
          root.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
          root.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
        }
        document.startViewTransition(apply);
      } else {
        apply();
      }
      announce(world === 'rose' ? V.strings.worldRose : V.strings.worldNoir);
    },
  };
  V.World = World;

  function initWorldSwitches() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-world-btn]');
      if (!btn) return;
      e.preventDefault();
      World.set(btn.dataset.worldBtn, btn);
    });
    // Links into a world (menu tiles, tab bar) remember the choice before navigating
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-world-link]');
      if (link) World.save(link.dataset.worldLink);
    });
    World.sync();
    // Keep other tabs in sync
    window.addEventListener('storage', (e) => {
      if (e.key === 'veloura-world' && !World.forced && (e.newValue === 'noir' || e.newValue === 'rose')) {
        root.dataset.world = e.newValue; World.sync();
        document.dispatchEvent(new CustomEvent('veloura:world', { detail: { world: e.newValue } }));
      }
    });
  }

  /* ------------------------------------------------------------ header */
  function initHeader() {
    const wrap = $('.header-wrapper');
    if (!wrap) return;
    const overlay = wrap.classList.contains('header-wrapper--overlay');
    let lastY = window.scrollY;
    const setH = () => root.style.setProperty('--header-h', `${$('.header', wrap)?.offsetHeight || 72}px`);
    setH();
    window.addEventListener('resize', debounce(setH, 150));
    const onScroll = () => {
      const y = window.scrollY;
      wrap.classList.toggle('is-solid', !overlay || y > 40);
      if (wrap.dataset.sticky === 'smart') wrap.classList.toggle('is-hidden', y > lastY && y > 300 && !document.querySelector('.drawer[open]'));
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------ drawers (native <dialog>) */
  const Drawer = {
    open(id, trigger) {
      const d = document.getElementById(id);
      if (!d || d.open) return;
      d._trigger = trigger || document.activeElement;
      if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('is-open')));
      const focusTarget = d.querySelector('[autofocus]') || d.querySelector('.drawer__close');
      focusTarget?.focus({ preventScroll: true });
      d.dispatchEvent(new CustomEvent('drawer:open'));
    },
    close(d) {
      if (!d || !d.open) return;
      d.classList.remove('is-open');
      const done = () => {
        if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
        document.body.style.overflow = '';
        d._trigger?.focus?.({ preventScroll: true });
      };
      motionOff() ? done() : setTimeout(done, 380);
    },
  };
  V.Drawer = Drawer;

  function initDrawers() {
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-open-drawer]');
      if (opener) {
        if (opener.dataset.openDrawer === 'CartDrawer' && V.settings.cartType === 'page') return;
        e.preventDefault();
        Drawer.open(opener.dataset.openDrawer, opener);
        return;
      }
      const closer = e.target.closest('[data-close-drawer]');
      if (closer) { e.preventDefault(); Drawer.close(closer.closest('dialog')); return; }
      // click on backdrop
      if (e.target.matches('dialog.drawer')) Drawer.close(e.target);
    });
    $$('dialog.drawer').forEach((d) => d.addEventListener('cancel', (e) => { e.preventDefault(); Drawer.close(d); }));
  }

  /* ------------------------------------------------------------ cart */
  const Cart = {
    sections() {
      return ['cart-drawer', ...$$('[data-cart-section]').map((el) => el.dataset.cartSection)].filter((v, i, a) => a.indexOf(v) === i);
    },

    renderSections(sections) {
      if (!sections) return;
      Object.entries(sections).forEach(([id, html]) => {
        if (!html) return;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        if (id === 'cart-drawer') {
          const fresh = doc.querySelector('[data-cart-drawer-inner]');
          const current = $('[data-cart-drawer-inner]');
          if (fresh && current) current.replaceWith(fresh);
        } else {
          const target = document.getElementById(`shopify-section-${id}`);
          const fresh = doc.getElementById(`shopify-section-${id}`);
          if (target && fresh) target.innerHTML = fresh.innerHTML;
        }
      });
    },

    updateCount(count) {
      $$('[data-cart-count]').forEach((el) => {
        el.textContent = count > 0 ? count : '';
        el.dataset.count = count;
        if (!motionOff()) { el.classList.remove('is-bumping'); void el.offsetWidth; el.classList.add('is-bumping'); }
      });
      $$('[data-cart-icon]').forEach((el) => {
        el.setAttribute('aria-label', el.dataset.labelTemplate ? el.dataset.labelTemplate.replace('[count]', count) : el.getAttribute('aria-label'));
        if (!motionOff()) { el.classList.remove('is-receiving'); void el.offsetWidth; el.classList.add('is-receiving'); }
      });
    },

    async add(body, { source } = {}) {
      body.sections = this.sections().join(',');
      body.sections_url = window.location.pathname;
      const data = await fetchJSON(`${V.routes.cartAdd}.js`, { method: 'POST', body: JSON.stringify(body) });
      this.renderSections(data.sections);
      const cart = await fetchJSON(`${V.routes.cart}.js`);
      this.updateCount(cart.item_count);
      if (source) flyToCart(source);
      document.dispatchEvent(new CustomEvent('veloura:cart:added', { detail: { item: data, cart } }));
      return { data, cart };
    },

    async change(line, quantity) {
      const body = { line, quantity, sections: this.sections().join(','), sections_url: window.location.pathname };
      const data = await fetchJSON(`${V.routes.cartChange}.js`, { method: 'POST', body: JSON.stringify(body) });
      this.renderSections(data.sections);
      this.updateCount(data.item_count);
      return data;
    },

    async note(note) {
      return fetchJSON(`${V.routes.cartUpdate}.js`, { method: 'POST', body: JSON.stringify({ note }) });
    },
  };
  V.Cart = Cart;

  function flyToCart(sourceImg) {
    if (motionOff() || !sourceImg) return;
    const target = $$('[data-cart-icon]').find((el) => el.offsetParent !== null);
    if (!target) return;
    const s = sourceImg.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const fly = document.createElement('div');
    fly.className = 'fly-thumb';
    const src = sourceImg.currentSrc || sourceImg.src;
    if (src) { const img = new Image(); img.src = src; img.alt = ''; fly.appendChild(img); }
    document.body.appendChild(fly);
    const sx = s.left + s.width / 2 - 32, sy = s.top + s.height / 2 - 32;
    const tx = t.left + t.width / 2 - 32, ty = t.top + t.height / 2 - 32;
    fly.animate([
      { transform: `translate(${sx}px, ${sy}px) scale(1.4)`, opacity: 0.95 },
      { transform: `translate(${(sx + tx) / 2}px, ${Math.min(sy, ty) - 120}px) scale(0.9)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${tx}px, ${ty}px) scale(0.25)`, opacity: 0.2 },
    ], { duration: 850, easing: 'cubic-bezier(.5,0,.3,1)' }).finished.then(() => fly.remove()).catch(() => fly.remove());
  }

  function initCart() {
    // Quick add buttons (single-variant products) and product forms
    document.addEventListener('submit', async (e) => {
      const form = e.target.closest('form[data-product-form]');
      if (!form || V.settings.cartType === 'page') return;
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const errorBox = form.querySelector('[data-form-error]') || form.closest('[data-product]')?.querySelector('[data-form-error]');
      if (btn?.getAttribute('aria-disabled') === 'true') return;
      const fd = new FormData(form);
      const body = { items: [{ id: Number(fd.get('id')), quantity: Number(fd.get('quantity') || 1) }] };
      const props = {};
      for (const [k, v] of fd.entries()) { const m = k.match(/^properties\[(.+)\]$/); if (m && v) props[m[1]] = v; }
      if (Object.keys(props).length) body.items[0].properties = props;
      if (fd.get('selling_plan')) body.items[0].selling_plan = Number(fd.get('selling_plan'));
      btn?.classList.add('is-loading');
      btn?.setAttribute('aria-busy', 'true');
      if (errorBox) { errorBox.hidden = true; errorBox.textContent = ''; }
      try {
        const img = form.closest('[data-product], .card')?.querySelector('[data-fly-source], img');
        await Cart.add(body, { source: img });
        if (btn?.classList.contains('quick-add')) { btn.classList.remove('is-added'); void btn.offsetWidth; btn.classList.add('is-added'); }
        announce(V.strings.added);
        if (!form.hasAttribute('data-no-drawer')) Drawer.open('CartDrawer', btn);
        else toast(V.strings.added);
      } catch (err) {
        const msg = err.message || V.strings.cartError;
        if (errorBox) { errorBox.textContent = msg; errorBox.hidden = false; }
        toast(msg, true);
      } finally {
        btn?.classList.remove('is-loading');
        btn?.removeAttribute('aria-busy');
      }
    });

    // Cart drawer line updates
    const pending = new Map();
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cart-qty-btn]');
      if (btn) {
        const input = btn.closest('[data-cart-line]')?.querySelector('[data-cart-qty]');
        if (!input) return;
        const next = Math.max(0, Number(input.value) + (btn.dataset.cartQtyBtn === 'plus' ? 1 : -1));
        input.value = next;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
      const rm = e.target.closest('[data-cart-remove]');
      if (rm && rm.closest('[data-cart-drawer-inner]')) {
        e.preventDefault();
        const line = rm.closest('[data-cart-line]');
        updateLine(line, 0);
      }
    });
    document.addEventListener('change', (e) => {
      const input = e.target.closest('[data-cart-qty]');
      if (!input || !input.closest('[data-cart-drawer-inner]')) return;
      const line = input.closest('[data-cart-line]');
      clearTimeout(pending.get(line.dataset.cartLine));
      pending.set(line.dataset.cartLine, setTimeout(() => updateLine(line, Number(input.value)), 300));
    });
    async function updateLine(lineEl, qty) {
      const index = Number(lineEl.dataset.cartLine);
      lineEl.classList.add('is-updating');
      try {
        const res = await Cart.change(index, qty);
        // Inventory limit: Shopify silently caps quantities
        const item = res.items?.find((i) => i.key === lineEl.dataset.key);
        if (item && qty > item.quantity) toast(V.strings.quantityError.replace('[quantity]', item.quantity), true);
      } catch (err) {
        lineEl.classList.remove('is-updating');
        toast(err.message || V.strings.cartError, true);
      }
    }

    // Order / gift note
    document.addEventListener('change', debounce((e) => {
      const note = e.target.closest('[data-cart-note]');
      if (note) Cart.note(note.value).catch(() => toast(V.strings.cartError, true));
    }, 400));

    // Cart page: auto-submit quantity change (progressive enhancement)
    $$('form[data-cart-page-form]').forEach((form) => {
      form.addEventListener('change', debounce((e) => { if (e.target.matches('[name="updates[]"]')) form.requestSubmit ? form.requestSubmit() : form.submit(); }, 500));
    });
  }

  /* ------------------------------------------------------------ quantity inputs */
  function initQuantity() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-qty-btn]');
      if (!btn) return;
      const input = btn.parentElement.querySelector('input[type="number"]');
      if (!input) return;
      const min = Number(input.min || 1), max = input.max ? Number(input.max) : Infinity;
      const step = Number(input.step || 1);
      const v = Number(input.value || min) + (btn.dataset.qtyBtn === 'plus' ? step : -step);
      input.value = Math.min(max, Math.max(min, v));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  /* ------------------------------------------------------------ product page */
  function initProduct(scope = document) {
    $$('[data-product]', scope).forEach((product) => {
      if (product._init) return;
      product._init = true;
      const dataEl = product.querySelector('[data-product-json]');
      if (!dataEl) return;
      let data;
      try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
      const form = product.querySelector('form[data-product-form]');
      const idInput = form?.querySelector('input[name="id"]');
      const priceEl = product.querySelector('[data-price]');
      const stockEl = product.querySelector('[data-stock]');
      const buttons = $$('[data-add-button]', product).concat($$('[data-sticky-add]'));
      const optionInputs = $$('[data-option-index]', product);

      const currentOptions = () => {
        const opts = [];
        optionInputs.forEach((el) => {
          if ((el.type === 'radio' && el.checked) || el.tagName === 'SELECT') opts[Number(el.dataset.optionIndex)] = el.value;
        });
        return opts;
      };

      const update = () => {
        const opts = currentOptions();
        const variant = data.variants.find((v) => v.options.every((o, i) => o === opts[i]));
        // mark unavailable option values
        optionInputs.forEach((el) => {
          if (el.type !== 'radio') return;
          const i = Number(el.dataset.optionIndex);
          const test = opts.slice(); test[i] = el.value;
          const match = data.variants.find((v) => v.options.every((o, j) => o === test[j]));
          el.closest('.swatch')?.classList.toggle('is-unavailable', !match || !match.available);
        });
        $$('[data-selected-value]', product).forEach((s) => { s.textContent = opts[Number(s.dataset.selectedValue)] || ''; });
        buttons.forEach((b) => {
          const label = b.querySelector('[data-add-label]') || b;
          if (!variant) { b.setAttribute('aria-disabled', 'true'); b.disabled = true; label.textContent = V.strings.unavailable; }
          else if (!variant.available) { b.setAttribute('aria-disabled', 'true'); b.disabled = true; label.textContent = V.strings.soldOut; }
          else { b.removeAttribute('aria-disabled'); b.disabled = false; label.textContent = V.strings.addToCart; }
        });
        if (!variant) return;
        if (idInput) idInput.value = variant.id;
        if (priceEl) {
          priceEl.innerHTML = variant.compare_at_price > variant.price
            ? `<s>${formatMoney(variant.compare_at_price)}</s> <span class="price--sale">${formatMoney(variant.price)}</span>`
            : formatMoney(variant.price);
        }
        $$('[data-sticky-price]').forEach((el) => { el.textContent = formatMoney(variant.price); });
        if (stockEl) {
          stockEl.dataset.state = variant.available ? 'in' : 'out';
          stockEl.textContent = variant.available ? stockEl.dataset.inStock : stockEl.dataset.outStock;
        }
        if (variant.featured_media) {
          const slide = product.querySelector(`[data-media-id="${variant.featured_media.id}"]`);
          slide?.parentElement?.scrollTo({ left: slide.offsetLeft, behavior: motionOff() ? 'auto' : 'smooth' });
        }
        if (product.dataset.updateUrl !== 'false') {
          const url = new URL(window.location.href);
          url.searchParams.set('variant', variant.id);
          window.history.replaceState({}, '', url);
        }
      };
      optionInputs.forEach((el) => el.addEventListener('change', update));

      // Gallery
      const track = product.querySelector('[data-gallery-track]');
      if (track) {
        const thumbs = $$('[data-gallery-thumb]', product);
        const dots = $$('[data-gallery-dot]', product);
        thumbs.concat(dots).forEach((t) => t.addEventListener('click', () => {
          const slide = track.children[Number(t.dataset.index)];
          if (slide) track.scrollTo({ left: slide.offsetLeft, behavior: motionOff() ? 'auto' : 'smooth' });
        }));
        const onScroll = debounce(() => {
          const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
          thumbs.forEach((t, j) => t.setAttribute('aria-current', String(j === i)));
          dots.forEach((t, j) => t.setAttribute('aria-current', String(j === i)));
        }, 60);
        track.addEventListener('scroll', onScroll, { passive: true });
        track.addEventListener('keydown', (e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          e.preventDefault();
          track.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * track.clientWidth, behavior: motionOff() ? 'auto' : 'smooth' });
        });
      }

      // Sticky add-to-cart
      const sticky = $('[data-sticky-atc]');
      const mainBtn = product.querySelector('[data-add-button]');
      if (sticky && mainBtn && 'IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => {
          const below = e.boundingClientRect.top < 0;
          sticky.classList.toggle('is-visible', !e.isIntersecting && below);
          sticky.setAttribute('aria-hidden', String(e.isIntersecting || !below));
        }).observe(mainBtn);
        sticky.querySelector('[data-sticky-add]')?.addEventListener('click', () => form?.requestSubmit ? form.requestSubmit() : form?.submit());
      }
    });
  }

  /* ------------------------------------------------------------ recommendations */
  function initRecommendations() {
    $$('[data-recommendations]').forEach((el) => {
      const load = async () => {
        try {
          const url = `${V.routes.productRecommendations}?section_id=${el.dataset.sectionId}&product_id=${el.dataset.productId}&limit=${el.dataset.limit || 8}&intent=${el.dataset.intent || 'related'}`;
          const html = await (await fetch(url)).text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const fresh = doc.querySelector('[data-recommendations]');
          if (fresh && fresh.innerHTML.trim()) {
            el.innerHTML = fresh.innerHTML;
            el.classList.add('is-loaded');
            initDynamic(el);
          } else {
            el.closest('.shopify-section')?.setAttribute('hidden', '');
          }
        } catch (e) { el.closest('.shopify-section')?.setAttribute('hidden', ''); }
      };
      lazyOnce(el, load, '400px');
    });
  }

  /* ------------------------------------------------------------ predictive search */
  function initPredictiveSearch() {
    const input = $('[data-predictive-input]');
    const results = $('[data-predictive-results]');
    if (!input || !results || !V.settings.predictiveSearch) return;
    let controller;
    const run = debounce(async () => {
      const q = input.value.trim();
      if (q.length < 2) { results.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); return; }
      controller?.abort();
      controller = new AbortController();
      try {
        const url = `${V.routes.predictiveSearch}?q=${encodeURIComponent(q)}&section_id=predictive-search&resources[type]=product,collection,page&resources[limit]=6&resources[options][unavailable_products]=last`;
        const html = await (await fetch(url, { signal: controller.signal })).text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const inner = doc.querySelector('[data-predictive-inner]');
        results.innerHTML = inner ? inner.innerHTML : '';
        input.setAttribute('aria-expanded', 'true');
      } catch (e) { if (e.name !== 'AbortError') results.innerHTML = ''; }
    }, 220);
    input.addEventListener('input', run);
    input.addEventListener('keydown', (e) => {
      const items = $$('[data-predictive-item]', results);
      if (!items.length || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
      e.preventDefault();
      let i = items.findIndex((it) => it.getAttribute('aria-selected') === 'true');
      items.forEach((it) => it.setAttribute('aria-selected', 'false'));
      i = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
      items[i].setAttribute('aria-selected', 'true');
      items[i].focus();
    });
  }

  /* ------------------------------------------------------------ carousels */
  function initCarousels(scope = document) {
    $$('[data-carousel]', scope).forEach((c) => {
      if (c._init) return; c._init = true;
      const track = c.querySelector('.carousel__track');
      const prev = c.querySelector('[data-carousel-prev]') || c.closest('.shopify-section')?.querySelector('[data-carousel-prev]');
      const next = c.querySelector('[data-carousel-next]') || c.closest('.shopify-section')?.querySelector('[data-carousel-next]');
      const bar = c.querySelector('.carousel__progress');
      if (!track) return;
      const step = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + 20;
      const update = () => {
        const max = track.scrollWidth - track.clientWidth;
        if (prev) prev.disabled = track.scrollLeft <= 4;
        if (next) next.disabled = track.scrollLeft >= max - 4;
        if (bar) bar.style.setProperty('--progress', `${Math.max(12, (track.clientWidth / track.scrollWidth) * 100 + (max > 0 ? (track.scrollLeft / max) * (100 - (track.clientWidth / track.scrollWidth) * 100) : 0))}%`);
      };
      prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: motionOff() ? 'auto' : 'smooth' }));
      next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: motionOff() ? 'auto' : 'smooth' }));
      track.addEventListener('scroll', debounce(update, 30), { passive: true });
      window.addEventListener('resize', debounce(update, 150));
      update();
    });
  }

  /* ------------------------------------------------------------ facets / sort / localization */
  function initAutoSubmit() {
    $$('form[data-auto-submit]').forEach((form) => {
      const submit = debounce(() => {
        // drop empty price inputs so URLs stay clean
        $$('input[type="number"]', form).forEach((i) => { i.disabled = i.value === ''; });
        form.requestSubmit ? form.requestSubmit() : form.submit();
      }, 450);
      form.addEventListener('change', submit);
      form.addEventListener('input', (e) => { if (e.target.type === 'number') submit(); });
    });
  }

  /* ------------------------------------------------------------ reveal & split text */
  function splitHeading(el) {
    if (el._split) return; el._split = true;
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w, i) => `<span class="split-line" aria-hidden="true"><span style="--i:${i}">${w.replace(/</g, '&lt;')}</span></span>`).join(' ');
  }

  let revealObserver;
  function initReveal(scope = document) {
    $$('[data-split]', scope).forEach(splitHeading);
    const els = $$('[data-reveal], [data-split]', scope);
    if (!('IntersectionObserver' in window) || motionOff()) { els.forEach((el) => el.classList.add('is-revealed')); return; }
    revealObserver = revealObserver || new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-revealed'); revealObserver.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    // stagger children within a group
    $$('[data-reveal-group]', scope).forEach((g) => $$('[data-reveal]', g).forEach((el, i) => el.style.setProperty('--reveal-i', i % 8)));
    els.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------ parallax layers */
  function initParallax() {
    const layers = $$('[data-parallax]');
    if (!layers.length || motionOff()) return;
    let ticking = false;
    const run = () => {
      const vh = window.innerHeight;
      layers.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = Number(el.dataset.parallax) || 0.15;
        const offset = (r.top + r.height / 2 - vh / 2) * speed * -1;
        el.style.setProperty('--parallax', `${offset.toFixed(1)}px`);
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ------------------------------------------------------------ card tilt */
  function initTilt() {
    if (!V.settings.tilt || !finePointer || motionOff()) return;
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest?.('[data-tilt]');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', `${(px - 0.5) * 9}deg`);
      card.style.setProperty('--rx', `${(0.5 - py) * 9}deg`);
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    }, { passive: true });
    document.addEventListener('pointerout', (e) => {
      const card = e.target.closest?.('[data-tilt]');
      if (!card || card.contains(e.relatedTarget)) return;
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }

  /* ------------------------------------------------------------ atmosphere particles (2D canvas) */
  function initAtmosphere(scope = document) {
    if (!V.settings.particles || motionOff()) return;
    $$('[data-atmosphere]', scope).forEach((host) => {
      if (host._atmo) return; host._atmo = true;
      const canvas = document.createElement('canvas');
      canvas.className = 'atmo-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      host.prepend(canvas);
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      let w = 0, h = 0, parts = [], visible = false, raf = 0, boost = 0;
      const mode = () => (host.dataset.atmosphere === 'auto' ? World.current : host.dataset.atmosphere);
      const density = () => Math.round(Math.min(70, (w * h) / (window.innerWidth < 750 ? 26000 : 16000)));
      const spawn = (m, initial) => {
        if (m === 'noir') {
          // drifting smoke wisps + fine gold dust
          const dust = Math.random() < 0.75;
          return { m, dust, x: Math.random() * w, y: initial ? Math.random() * h : h + 20, r: dust ? Math.random() * 1.4 + 0.4 : Math.random() * 120 + 80, vx: (Math.random() - 0.5) * 0.15, vy: -(Math.random() * 0.25 + 0.05), a: dust ? Math.random() * 0.6 + 0.2 : Math.random() * 0.05 + 0.02, t: Math.random() * 6.28 };
        }
        // rosé: petals + sparkles
        const sparkle = Math.random() < 0.4;
        return { m, sparkle, x: Math.random() * w, y: initial ? Math.random() * h : -20, r: sparkle ? Math.random() * 2 + 1 : Math.random() * 6 + 5, vx: (Math.random() - 0.5) * 0.4, vy: Math.random() * 0.45 + 0.2, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.02, a: Math.random() * 0.5 + 0.35, t: Math.random() * 6.28 };
      };
      const reset = () => { parts = Array.from({ length: density() }, () => spawn(mode(), true)); };
      const resize = () => {
        const r = host.getBoundingClientRect();
        w = r.width; h = r.height;
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        reset();
      };
      const drawPetal = (p) => {
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = p.a;
        const g = ctx.createLinearGradient(-p.r, 0, p.r, 0);
        g.addColorStop(0, '#F05291'); g.addColorStop(1, '#FAD5E2');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, -p.r);
        ctx.bezierCurveTo(p.r, -p.r * 0.6, p.r * 0.8, p.r * 0.7, 0, p.r);
        ctx.bezierCurveTo(-p.r * 0.8, p.r * 0.7, -p.r, -p.r * 0.6, 0, -p.r);
        ctx.fill();
        ctx.restore();
      };
      const frame = () => {
        raf = 0;
        if (!visible || document.hidden) return;
        ctx.clearRect(0, 0, w, h);
        const speed = 1 + boost;
        boost *= 0.96;
        parts.forEach((p, i) => {
          p.t += 0.01;
          p.x += (p.vx + Math.sin(p.t) * 0.15) * speed;
          p.y += p.vy * speed;
          if (p.m === 'noir') {
            if (p.dust) {
              ctx.globalAlpha = p.a * (0.6 + Math.sin(p.t * 3) * 0.4);
              ctx.fillStyle = '#E8CF9E';
              ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
            } else {
              const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
              g.addColorStop(0, `rgba(169,170,172,${p.a})`); g.addColorStop(1, 'rgba(169,170,172,0)');
              ctx.globalAlpha = 1; ctx.fillStyle = g;
              ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
            }
            if (p.y < -p.r * 2) parts[i] = spawn('noir', false);
          } else {
            if (p.sparkle) {
              const s = p.r * (0.6 + Math.abs(Math.sin(p.t * 4)) * 0.8);
              ctx.globalAlpha = p.a;
              ctx.fillStyle = '#FFF0F5';
              ctx.beginPath();
              ctx.moveTo(p.x, p.y - s * 2); ctx.quadraticCurveTo(p.x, p.y, p.x + s * 2, p.y);
              ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + s * 2); ctx.quadraticCurveTo(p.x, p.y, p.x - s * 2, p.y);
              ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - s * 2); ctx.fill();
            } else { p.rot += p.vr * speed; drawPetal(p); }
            if (p.y > h + 20) parts[i] = spawn('rose', false);
          }
        });
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(frame);
      };
      new ResizeObserver(debounce(resize, 120)).observe(host);
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }).observe(host);
      document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame); });
      document.addEventListener('veloura:world', () => { if (host.dataset.atmosphere === 'auto') reset(); });
      host.addEventListener('pointerenter', () => { boost = 1.5; });
      resize();
    });
  }

  /* ------------------------------------------------------------ lazy helper */
  function lazyOnce(el, fn, margin = '200px') {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: margin });
    io.observe(el);
  }

  /* ------------------------------------------------------------ 3D (WebGL) */
  let webglOK = null;
  function hasWebGL() {
    if (webglOK !== null) return webglOK;
    try {
      const c = document.createElement('canvas');
      webglOK = !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl');
    } catch (e) { webglOK = false; }
    return webglOK;
  }
  let v3dModule;
  function init3D(scope = document) {
    if (!V.settings.enable3d || !hasWebGL() || !V.assets.v3d) return;
    $$('[data-v3d]', scope).forEach((el) => {
      if (el._v3d) return;
      // Some displays are desktop-only (two WebGL scenes side by side would be heavy on phones)
      if (el.dataset.v3dMinWidth && window.innerWidth < Number(el.dataset.v3dMinWidth)) return;
      el._v3d = true;
      lazyOnce(el, async () => {
        try {
          v3dModule = v3dModule || await import(V.assets.v3d);
          const mountIt = async () => {
            const worldAttr = el.dataset.v3dWorld || 'auto';
            const world = worldAttr === 'auto' ? World.current : worldAttr;
            let bottle;
            try { bottle = el.dataset.v3dBottle ? JSON.parse(el.dataset.v3dBottle) : undefined; } catch (e) { bottle = undefined; }
            if (bottle) Object.keys(bottle).forEach((k) => { if (bottle[k] === '' || bottle[k] == null) delete bottle[k]; });
            el._instance = await v3dModule.mount(el, {
              threeUrl: V.assets.three,
              scene: el.dataset.v3d || 'viewer',
              world,
              bottle,
              interactive: el.dataset.v3dInteractive !== 'false',
              reducedMotion: motionOff(),
              quality: el.dataset.v3dQuality || 'auto',
            });
          };
          await mountIt();
          if ((el.dataset.v3dWorld || 'auto') === 'auto') {
            document.addEventListener('veloura:world', async () => {
              el._instance?.destroy();
              el.classList.remove('is-3d-ready');
              await mountIt();
            });
          }
        } catch (err) {
          // Keep static fallback visible
          console.warn('[Veloura] 3D unavailable:', err);
        }
      }, '300px');
    });
  }

  /* ------------------------------------------------------------ dual-world hero */
  function initDualHero() {
    $$('[data-dual-hero]').forEach((hero) => {
      const panels = $$('[data-dual-panel]', hero);
      const setActive = (panel) => {
        hero.dataset.active = panel ? panel.dataset.dualPanel : '';
        panels.forEach((p) => { if (p === panel) p.setAttribute('data-hover-active', ''); else p.removeAttribute('data-hover-active'); });
      };
      panels.forEach((p) => {
        p.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') setActive(p); });
        p.addEventListener('focusin', () => setActive(p));
        p.addEventListener('pointermove', (e) => {
          if (motionOff() || e.pointerType === 'touch') return;
          const r = p.getBoundingClientRect();
          p.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
          p.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
        }, { passive: true });
      });
      hero.addEventListener('pointerleave', () => setActive(null));
      hero.addEventListener('focusout', (e) => { if (!hero.contains(e.relatedTarget)) setActive(null); });

      // Entering a world: save choice, play a short expansion, then navigate.
      hero.addEventListener('click', (e) => {
        const link = e.target.closest('[data-enter-world]');
        if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        const world = link.dataset.enterWorld;
        World.save(world);
        if (motionOff()) return;
        e.preventDefault();
        hero.dataset.entering = world;
        setTimeout(() => { window.location.href = link.href; }, 560);
      });
    });
    // Restore state when navigating back (bfcache)
    window.addEventListener('pageshow', () => $$('[data-dual-hero]').forEach((h) => { delete h.dataset.entering; }));
  }

  /* ------------------------------------------------------------ misc */
  function initLocalization() {
    $$('[data-localization-form] select').forEach((s) => s.addEventListener('change', () => s.form.submit()));
  }

  function initDetailsAnimations() {
    // close sibling FAQ items for accordion behaviour when data-accordion-single is set
    document.addEventListener('toggle', (e) => {
      const d = e.target;
      if (!(d instanceof HTMLDetailsElement) || !d.open) return;
      const group = d.closest('[data-accordion-single]');
      if (group) $$('details[open]', group).forEach((o) => { if (o !== d) o.open = false; });
    }, true);
  }

  // Re-init behaviours inside dynamically injected HTML (recommendations, section re-renders)
  function initDynamic(scope) {
    initReveal(scope);
    initCarousels(scope);
    initProduct(scope);
    init3D(scope);
    initAtmosphere(scope);
  }
  V.initDynamic = initDynamic;

  function init() {
    if ($('.tabbar')) document.body.classList.add('has-tabbar');
    initWorldSwitches();
    initHeader();
    initDrawers();
    initCart();
    initQuantity();
    initProduct();
    initRecommendations();
    initPredictiveSearch();
    initCarousels();
    initAutoSubmit();
    initReveal();
    initParallax();
    initTilt();
    initAtmosphere();
    initDualHero();
    init3D();
    initLocalization();
    initDetailsAnimations();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  // Theme editor support
  document.addEventListener('shopify:section:load', (e) => { initDynamic(e.target); initDualHero(); initPredictiveSearch(); });
})();
