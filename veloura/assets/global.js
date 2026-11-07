/* Veloura — global behaviour. Vanilla JS, no dependencies. */
(() => {
  'use strict';

  const V = (window.Veloura = window.Veloura || {});
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  V.announce = (msg) => {
    const region = $('[data-live-region]');
    if (!region) return;
    region.textContent = '';
    window.setTimeout(() => { region.textContent = msg; }, 50);
  };

  V.debounce = (fn, wait = 300) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), wait); };
  };

  V.parseHTML = (html) => new DOMParser().parseFromString(html, 'text/html');

  /* ------------------------------------------------------------------ */
  /* Scroll reveal                                                        */
  /* ------------------------------------------------------------------ */
  V.initReveal = (ctx = document) => {
    const els = $$('.reveal:not(.is-visible)', ctx);
    if (!els.length) return;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach((el) => io.observe(el));
  };

  /* ------------------------------------------------------------------ */
  /* Drawers (menu, search, cart, filters) with focus trap               */
  /* ------------------------------------------------------------------ */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let activeDrawer = null;
  let lastTrigger = null;

  const overlay = () => $('[data-overlay]');

  V.openDrawer = (id, trigger) => {
    const drawer = document.getElementById(id);
    if (!drawer) return;
    if (activeDrawer && activeDrawer !== drawer) V.closeDrawer({ restoreFocus: false });
    lastTrigger = trigger || document.activeElement;
    activeDrawer = drawer;
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    const ov = overlay();
    if (ov) { ov.hidden = false; requestAnimationFrame(() => ov.classList.add('is-visible')); }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      drawer.classList.add('is-open');
      const focusTarget = $('[data-autofocus]', drawer) || $(FOCUSABLE, drawer);
      if (focusTarget) setTimeout(() => focusTarget.focus({ preventScroll: true }), 60);
    }));
    document.body.classList.add('is-locked');
    $$(`[aria-controls="${id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'true'));
    drawer.dispatchEvent(new CustomEvent('drawer:open', { bubbles: true }));
  };

  V.closeDrawer = ({ restoreFocus = true } = {}) => {
    if (!activeDrawer) return;
    const drawer = activeDrawer;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    $$(`[aria-controls="${drawer.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'false'));
    const ov = overlay();
    if (ov) { ov.classList.remove('is-visible'); setTimeout(() => { if (!activeDrawer) ov.hidden = true; }, 500); }
    document.body.classList.remove('is-locked');
    activeDrawer = null;
    if (restoreFocus && lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
  };

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-drawer-open]');
    if (opener) {
      if (opener.dataset.drawerOpen === 'CartDrawer' && V.cartType !== 'drawer') return;
      e.preventDefault();
      V.openDrawer(opener.dataset.drawerOpen, opener);
      return;
    }
    if (e.target.closest('[data-drawer-close]') || e.target.matches('[data-overlay]')) {
      e.preventDefault();
      V.closeDrawer();
      return;
    }
    // Click outside the open drawer (e.g. on the header, which sits above the overlay)
    if (activeDrawer && !activeDrawer.contains(e.target) && document.contains(e.target)) V.closeDrawer();
  });

  document.addEventListener('keydown', (e) => {
    if (!activeDrawer) return;
    if (e.key === 'Escape') { V.closeDrawer(); return; }
    if (e.key !== 'Tab') return;
    const items = $$(FOCUSABLE, activeDrawer).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* Close desktop dropdowns on outside click / Escape */
  document.addEventListener('click', (e) => {
    $$('.nav details[open]').forEach((d) => { if (!d.contains(e.target)) d.removeAttribute('open'); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    $$('.nav details[open]').forEach((d) => { d.removeAttribute('open'); $('summary', d).focus(); });
  });

  /* ------------------------------------------------------------------ */
  /* Header: transparent → solid, height variable                         */
  /* ------------------------------------------------------------------ */
  const initHeader = () => {
    const wrapper = $('[data-header]');
    if (!wrapper) return;
    const setOffset = () => document.documentElement.style.setProperty('--header-offset', `${wrapper.offsetHeight}px`);
    setOffset();
    window.addEventListener('resize', V.debounce(setOffset, 150));
    if (!wrapper.classList.contains('header-wrapper--transparent')) return;
    const onScroll = () => wrapper.classList.toggle('is-solid', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    wrapper.addEventListener('focusin', () => wrapper.classList.add('is-solid'));
    document.addEventListener('drawer:open', () => wrapper.classList.add('is-solid'));
  };

  /* ------------------------------------------------------------------ */
  /* Announcement rotator                                                 */
  /* ------------------------------------------------------------------ */
  const initAnnouncement = () => {
    $$('[data-announcement]').forEach((bar) => {
      const slides = $$('.announcement__slide', bar);
      if (slides.length < 2) { slides[0] && slides[0].classList.add('is-active'); return; }
      let i = 0;
      slides[0].classList.add('is-active');
      if (reducedMotion) return;
      let paused = false;
      bar.addEventListener('mouseenter', () => { paused = true; });
      bar.addEventListener('mouseleave', () => { paused = false; });
      bar.addEventListener('focusin', () => { paused = true; });
      bar.addEventListener('focusout', () => { paused = false; });
      setInterval(() => {
        if (paused) return;
        slides[i].classList.remove('is-active');
        i = (i + 1) % slides.length;
        slides[i].classList.add('is-active');
      }, Number(bar.dataset.speed || 5) * 1000);
    });
  };

  /* ------------------------------------------------------------------ */
  /* Predictive search                                                    */
  /* ------------------------------------------------------------------ */
  const initPredictiveSearch = () => {
    const root = $('[data-predictive-search]');
    if (!root) return;
    const input = $('input[type="search"]', root);
    const results = $('[data-predictive-results]', root);
    const defaults = $('[data-search-defaults]', root);
    let controller;

    const render = async (term) => {
      if (!term) { results.innerHTML = ''; results.hidden = true; if (defaults) defaults.hidden = false; return; }
      if (controller) controller.abort();
      controller = new AbortController();
      try {
        const url = `${V.routes.predictiveSearch}?q=${encodeURIComponent(term)}&section_id=predictive-search&resources[type]=product,collection,article,query&resources[limit]=4&resources[options][fields]=title,product_type,variants.title,vendor,tag`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(res.status);
        const html = await res.text();
        const doc = V.parseHTML(html);
        const content = $('[data-predictive-content]', doc);
        results.innerHTML = content ? content.innerHTML : '';
        results.hidden = false;
        if (defaults) defaults.hidden = true;
      } catch (err) {
        if (err.name !== 'AbortError') results.hidden = true;
      }
    };

    input.addEventListener('input', V.debounce(() => render(input.value.trim()), 280));
    $$('[data-search-term]', root).forEach((chip) => chip.addEventListener('click', () => {
      input.value = chip.dataset.searchTerm;
      input.focus();
      render(input.value);
    }));
  };

  /* ------------------------------------------------------------------ */
  /* Cart (AJAX + Section Rendering API)                                  */
  /* ------------------------------------------------------------------ */
  const cartSections = () => $$('[data-cart-section]').map((el) => el.dataset.cartSection);

  V.renderCartSections = (sections) => {
    if (!sections) return;
    Object.entries(sections).forEach(([id, html]) => {
      if (!html) return;
      const doc = V.parseHTML(html);
      $$(`[data-cart-section="${id}"]`).forEach((target) => {
        const fresh = $(`[data-cart-section="${id}"]`, doc);
        if (fresh) target.innerHTML = fresh.innerHTML;
      });
    });
    const countSource = $('[data-cart-count-source]');
    if (countSource) V.updateCartCount(Number(countSource.dataset.cartCountSource));
    V.initReveal();
  };

  V.updateCartCount = (count) => {
    $$('[data-cart-count]').forEach((el) => { el.textContent = count > 0 ? count : ''; });
    $$('[data-cart-link]').forEach((el) => {
      const label = el.dataset.labelTemplate;
      if (label) el.setAttribute('aria-label', label.replace('[count]', count));
    });
  };

  V.cartRequest = async (url, body) => {
    const sections = cartSections();
    const payload = body instanceof FormData ? body : JSON.stringify({ ...body, sections, sections_url: window.location.pathname });
    if (body instanceof FormData) {
      sections.forEach((s) => body.append('sections', s));
      body.append('sections_url', window.location.pathname);
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: body instanceof FormData ? { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: payload
    });
    const data = await res.json();
    if (!res.ok || data.status) {
      const message = data.description || data.message || V.strings.error;
      throw new Error(message);
    }
    return data;
  };

  V.addToCart = async (formData, button) => {
    if (button) { button.classList.add('is-loading'); button.setAttribute('aria-busy', 'true'); }
    try {
      const data = await V.cartRequest(`${V.routes.cartAdd}.js`, formData);
      if (V.cartType !== 'drawer') { window.location.href = V.routes.cart; return; }
      V.renderCartSections(data.sections);
      V.openDrawer('CartDrawer', button);
      V.announce(V.strings.added);
      document.dispatchEvent(new CustomEvent('cart:added', { detail: data }));
    } catch (err) {
      const form = button && button.closest('form');
      const msg = form && $('[data-form-error]', form);
      if (msg) { msg.textContent = err.message; msg.hidden = false; }
      else V.announce(err.message);
    } finally {
      if (button) { button.classList.remove('is-loading'); button.removeAttribute('aria-busy'); }
    }
  };

  V.changeLine = async (line, quantity) => {
    const item = $(`[data-cart-line="${line}"]`);
    $$(`[data-cart-line="${line}"]`).forEach((el) => el.classList.add('is-loading'));
    try {
      const data = await V.cartRequest(`${V.routes.cartChange}.js`, { line, quantity });
      V.renderCartSections(data.sections);
      V.announce(V.strings.cartUpdated || '');
    } catch (err) {
      if (item) item.classList.remove('is-loading');
      V.announce(err.message);
      const errEl = $('[data-cart-error]');
      if (errEl) { errEl.textContent = err.message; errEl.hidden = false; }
    }
  };

  // Product forms anywhere (product page, quick add, upsells)
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-product-form]');
    if (!form || V.cartType !== 'drawer') return;
    e.preventDefault();
    const button = $('[type="submit"]', form);
    if (button && button.getAttribute('aria-disabled') === 'true') return;
    const err = $('[data-form-error]', form);
    if (err) err.hidden = true;
    V.addToCart(new FormData(form), button);
  });

  // Quantity steppers (generic)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-qty-step]');
    if (!btn) return;
    e.preventDefault();
    const wrap = btn.closest('.qty');
    const input = $('input', wrap);
    const step = Number(btn.dataset.qtyStep);
    const min = Number(input.min || 0);
    const max = input.max ? Number(input.max) : Infinity;
    const next = Math.min(max, Math.max(min, Number(input.value || 0) + step));
    if (next === Number(input.value)) return;
    input.value = next;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // Cart line quantity / remove
  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-cart-qty]');
    if (!input) return;
    V.changeLine(Number(input.dataset.cartQty), Number(input.value));
  });
  document.addEventListener('click', (e) => {
    const remove = e.target.closest('[data-cart-remove]');
    if (!remove) return;
    e.preventDefault();
    V.changeLine(Number(remove.dataset.cartRemove), 0);
  });

  // Cart note (debounced)
  document.addEventListener('input', V.debounce((e) => {
    const note = e.target.closest('[data-cart-note]');
    if (!note) return;
    fetch(`${V.routes.cartUpdate}.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ note: note.value })
    });
  }, 500));

  // Refresh the cart drawer when the page is restored from bfcache
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted || !cartSections().length) return;
    fetch(`${window.location.pathname}?sections=${cartSections().join(',')}`)
      .then((r) => r.json())
      .then(V.renderCartSections)
      .catch(() => {});
  });

  /* Copy-to-clipboard for discount codes */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const done = () => {
      const original = btn.textContent;
      btn.textContent = btn.dataset.copiedLabel || 'Copied';
      V.announce(btn.textContent);
      setTimeout(() => { btn.textContent = original; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(btn.dataset.copy).then(done).catch(() => {});
    }
  });

  /* ------------------------------------------------------------------ */
  /* Lightweight scroller dots (product gallery etc.)                     */
  /* ------------------------------------------------------------------ */
  V.initScrollerDots = (ctx = document) => {
    $$('[data-scroller]', ctx).forEach((wrap) => {
      const list = $('[data-scroller-list]', wrap);
      const dots = $$('[data-scroller-dot]', wrap);
      if (!list || !dots.length || wrap.dataset.ready) return;
      wrap.dataset.ready = 'true';
      const items = Array.from(list.children);
      dots.forEach((dot, i) => dot.addEventListener('click', () => {
        list.scrollTo({ left: items[i].offsetLeft - list.offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
      }));
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = items.indexOf(entry.target);
          dots.forEach((d, i) => d.setAttribute('aria-current', i === idx ? 'true' : 'false'));
        });
      }, { root: list, threshold: 0.6 });
      items.forEach((it) => io.observe(it));
    });
  };

  /* ------------------------------------------------------------------ */
  /* Customer forms: keep success state visible after redirect           */
  /* ------------------------------------------------------------------ */
  const initFormScroll = () => {
    const posted = $('[data-form-status]');
    if (posted) posted.scrollIntoView({ block: 'center' });
  };

  /* ------------------------------------------------------------------ */
  /* Init + Theme editor hooks                                            */
  /* ------------------------------------------------------------------ */
  const init = () => {
    V.initReveal();
    initHeader();
    initAnnouncement();
    initPredictiveSearch();
    V.initScrollerDots();
    initFormScroll();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', (e) => {
      V.initReveal(e.target);
      V.initScrollerDots(e.target);
      $$('.reveal', e.target).forEach((el) => el.classList.add('is-visible'));
      if (e.target.querySelector('[data-header]')) initHeader();
      if (e.target.querySelector('[data-announcement]')) initAnnouncement();
    });
    document.addEventListener('shopify:section:select', (e) => {
      if (e.target.querySelector('#CartDrawer')) V.openDrawer('CartDrawer');
    });
    document.addEventListener('shopify:section:deselect', (e) => {
      if (e.target.querySelector('#CartDrawer')) V.closeDrawer({ restoreFocus: false });
    });
  }
})();
