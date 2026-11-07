/* Veloura — product page: variant selection, gallery sync, sticky add-to-bag. */
(() => {
  'use strict';
  const V = window.Veloura;

  const initProduct = (root) => {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = 'true';
    const sectionId = root.dataset.sectionId;
    const productUrl = root.dataset.productUrl;
    const picker = root.querySelector('[data-variant-picker]');
    const variantsEl = root.querySelector('[data-variants-json]');
    const variants = variantsEl ? JSON.parse(variantsEl.textContent) : [];
    let controller;

    /* Sticky bar ---------------------------------------------------- */
    const sticky = root.querySelector('[data-sticky-atc]');
    let stickyIO;
    const observeAtc = () => {
      if (!sticky || !('IntersectionObserver' in window)) return;
      if (stickyIO) stickyIO.disconnect();
      const atc = root.querySelector('[data-atc]');
      if (!atc) return;
      stickyIO = new IntersectionObserver(([entry]) => {
        const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        sticky.classList.toggle('is-visible', show);
        sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
        sticky.querySelectorAll('a, button').forEach((el) => { el.tabIndex = show ? 0 : -1; });
      });
      stickyIO.observe(atc);
    };
    observeAtc();

    /* Gallery: scroll to the variant's image ------------------------ */
    const showMedia = (mediaId) => {
      if (!mediaId) return;
      const item = root.querySelector(`[data-media-id="${mediaId}"]`);
      const list = root.querySelector('[data-gallery]');
      if (!item || !list) return;
      if (window.matchMedia('(min-width: 990px)').matches) {
        list.prepend(item);
      } else {
        list.scrollTo({ left: item.offsetLeft - list.offsetLeft, behavior: 'smooth' });
      }
    };

    /* Variant change ------------------------------------------------ */
    if (!picker) return;

    const selectedOptions = () => {
      const values = [];
      picker.querySelectorAll('fieldset').forEach((fs, i) => {
        const checked = fs.querySelector('input:checked');
        values[i] = checked ? checked.value : null;
      });
      return values;
    };

    const update = async () => {
      const opts = selectedOptions();
      opts.forEach((val, i) => {
        const label = picker.querySelector(`[data-option-value="${i}"]`);
        if (label) label.textContent = val;
      });
      const variant = variants.find((v) => v.options.every((o, i) => o === opts[i]));
      const atc = root.querySelector('[data-atc]');
      if (!variant) {
        if (atc) { atc.setAttribute('aria-disabled', 'true'); atc.textContent = V.strings.unavailable; }
        return;
      }
      const idInput = root.querySelector('[data-variant-id]');
      if (idInput) idInput.value = variant.id;
      showMedia(variant.media);
      const url = `${productUrl}?variant=${variant.id}`;
      history.replaceState({}, '', url);

      if (controller) controller.abort();
      controller = new AbortController();
      try {
        const res = await fetch(`${url}&section_id=${sectionId}`, { signal: controller.signal });
        const doc = V.parseHTML(await res.text());
        const fresh = doc.querySelector('[data-product-root]');
        if (!fresh) return;
        root.querySelectorAll('[data-variant-update]').forEach((el) => {
          const key = el.dataset.variantUpdate;
          const next = fresh.querySelector(`[data-variant-update="${key}"]`);
          if (next) el.innerHTML = next.innerHTML;
        });
        observeAtc();
        V.announce(`${opts.join(' / ')}`);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    };

    picker.addEventListener('change', update);
  };

  const initAll = () => document.querySelectorAll('[data-product-root]').forEach(initProduct);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
  document.addEventListener('shopify:section:load', initAll);
})();
