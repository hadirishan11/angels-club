/* Veloura — collection/search filtering, sorting and "load more" via the Section Rendering API. */
(() => {
  'use strict';
  const root = document.querySelector('[data-facets-root]');
  if (!root) return;
  const V = window.Veloura;
  const sectionId = root.dataset.sectionId;
  const cache = new Map();
  let controller;

  const cleanParams = (params) => {
    const out = new URLSearchParams();
    for (const [key, value] of params.entries()) {
      if (value !== '') out.append(key, value);
    }
    return out.toString();
  };

  const swap = (html) => {
    const doc = V.parseHTML(html);
    const focusedId = document.activeElement && document.activeElement.id;
    document.querySelectorAll('[data-facets-replace]').forEach((target) => {
      const key = target.dataset.facetsReplace;
      const fresh = doc.querySelector(`[data-facets-replace="${key}"]`);
      if (fresh) target.innerHTML = fresh.innerHTML;
    });
    const sort = doc.querySelector('[data-sort-select]');
    const current = document.querySelector('[data-sort-select]');
    if (sort && current) current.value = sort.value;
    V.initReveal(root);
    root.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    if (focusedId) {
      const el = document.getElementById(focusedId);
      if (el) el.focus({ preventScroll: true });
    }
  };

  const render = async (query, { push = true } = {}) => {
    const grid = root.querySelector('.collection-grid');
    if (grid) grid.classList.add('is-loading');
    const url = `${window.location.pathname}?${query}`;
    try {
      let html = cache.get(query);
      if (!html) {
        if (controller) controller.abort();
        controller = new AbortController();
        const res = await fetch(`${url}${query ? '&' : ''}section_id=${sectionId}`, { signal: controller.signal });
        html = await res.text();
        cache.set(query, html);
      }
      swap(html);
      if (push) history.pushState({ facets: query }, '', url);
    } catch (err) {
      if (err.name !== 'AbortError') window.location.href = url;
    } finally {
      const g = root.querySelector('.collection-grid');
      if (g) g.classList.remove('is-loading');
    }
  };

  const fromForm = () => {
    const form = document.getElementById('FacetsForm');
    if (!form) return '';
    const params = new URLSearchParams(new FormData(form));
    return cleanParams(params);
  };

  root.addEventListener('change', (e) => {
    if (e.target.matches('[data-sort-select]')) {
      const mirror = root.querySelector('[data-sort-mirror]');
      if (mirror) { mirror.value = e.target.value; render(fromForm()); }
      else {
        const params = new URLSearchParams(window.location.search);
        params.set('sort_by', e.target.value);
        params.delete('page');
        render(cleanParams(params));
      }
      return;
    }
    if (e.target.closest('#FacetsForm') && e.target.type !== 'number') render(fromForm());
  });

  root.addEventListener('input', V.debounce((e) => {
    if (e.target.closest('#FacetsForm') && e.target.type === 'number') render(fromForm());
  }, 600));

  root.addEventListener('submit', (e) => {
    if (!e.target.matches('#FacetsForm')) return;
    e.preventDefault();
    render(fromForm());
  });

  root.addEventListener('click', async (e) => {
    const link = e.target.closest('[data-facets-link], [data-facets-clear]');
    if (link) {
      e.preventDefault();
      render(new URL(link.href, window.location.origin).searchParams.toString());
      return;
    }
    const more = e.target.closest('[data-load-more]');
    if (!more) return;
    e.preventDefault();
    more.classList.add('is-loading');
    try {
      const nextUrl = new URL(more.href, window.location.origin);
      nextUrl.searchParams.set('section_id', sectionId);
      const res = await fetch(nextUrl.toString());
      const doc = V.parseHTML(await res.text());
      const list = root.querySelector('[data-product-grid]');
      const items = doc.querySelectorAll('[data-product-grid] > li');
      const firstNew = items[0];
      items.forEach((li) => list.appendChild(li));
      const pag = doc.querySelector('[data-facets-replace="pagination"]');
      const current = root.querySelector('[data-facets-replace="pagination"]');
      if (pag && current) current.innerHTML = pag.innerHTML;
      V.initReveal(root);
      const focusLink = firstNew && firstNew.querySelector('.card__title a');
      if (focusLink) focusLink.focus({ preventScroll: true });
    } catch (err) {
      window.location.href = more.href;
    }
  });

  window.addEventListener('popstate', (e) => {
    const query = e.state && typeof e.state.facets === 'string' ? e.state.facets : window.location.search.slice(1);
    render(query, { push: false });
  });
})();
