import { products, byWorld, FAMILIES, allNotes } from '../data/products.js';
import { card, icon, cut, esc, reveal } from '../ui.js';

const COPY = {
  noir: { eyebrow: 'Veloura Noir', title: 'The Art of Presence', text: 'Iconic fragrances. Bold impressions. Luxury in every detail. Woods, spice, leather and smoke — in miniature.' },
  rose: { eyebrow: 'Veloura Rosé', title: 'A Little Luxury, A Lot of Love', text: 'Fall in love with iconic fragrances in their most irresistible sizes. Florals, gourmands and luminous musks.' },
  all: { eyebrow: 'The boutique', title: 'All miniatures', text: 'Every Veloura miniature in one place. Filter by fragrance family, moment and intensity.' },
};

export default (scope) => ({
  title: scope === 'noir' ? 'Veloura Noir' : scope === 'rose' ? 'Veloura Rosé' : 'Shop all miniatures',
  world: scope === 'all' ? null : scope,
  render() {
    const c = COPY[scope];
    const list = scope === 'all' ? products : byWorld(scope);
    const fams = FAMILIES.filter((f) => list.some((p) => p.family === f));
    const art = (scope === 'all' ? [products[0], products[8], products[1]] : list.slice(0, 3));
    return `
    <section class="page-hero">
      <div class="wrap page-hero__grid">
        <div>
          <p class="eyebrow">${c.eyebrow}</p>
          <h1 class="display" style="font-size:clamp(2.2rem,1.2rem + 3.6vw,4.8rem)">${c.title}</h1>
          <p class="lede">${c.text}</p>
        </div>
        <div class="page-hero__art" aria-hidden="true">${art.map((p) => `<img src="${cut(p)}" alt="" loading="eager">`).join('')}</div>
      </div>
    </section>
    <section class="section section--tight">
      <div class="wrap">
        <div class="toolbar">
          <div class="toolbar__chips" role="group" aria-label="Fragrance family">
            <button class="chip" data-fam="" aria-pressed="true">All</button>
            ${fams.map((f) => `<button class="chip" data-fam="${esc(f)}" aria-pressed="false">${esc(f)}</button>`).join('')}
          </div>
          <div class="toolbar__right">
            ${scope === 'all' ? `<div class="toolbar__chips" role="group" aria-label="World"><button class="chip" data-wf="" aria-pressed="true">Both</button><button class="chip" data-wf="noir" aria-pressed="false">Noir</button><button class="chip" data-wf="rose" aria-pressed="false">Rosé</button></div>` : ''}
            <label class="visually-hidden" for="when">Moment</label>
            <select class="select" id="when"><option value="">Any moment</option><option value="day">Daytime</option><option value="night">Evening</option></select>
            <label class="visually-hidden" for="sort">Sort</label>
            <select class="select" id="sort"><option value="featured">Featured</option><option value="price-asc">Price, low to high</option><option value="price-desc">Price, high to low</option><option value="intensity">Most intense</option><option value="name">A–Z</option></select>
            <label class="visually-hidden" for="q">Search</label>
            <input class="input" id="q" type="search" placeholder="Search notes, names…">
          </div>
        </div>
        <p class="muted" id="count" role="status" style="font-size:.82rem;letter-spacing:.1em"></p>
        <div class="grid cols-4" id="grid"></div>
        <div class="empty" id="empty" hidden>
          ${icon('bottle')}<p class="lede" style="margin:12px auto">No miniatures match these filters.</p>
          <button class="btn btn--ghost btn--sm" id="clear">Clear filters</button>
        </div>
      </div>
    </section>`;
  },
  mount(root) {
    const base = scope === 'all' ? products : byWorld(scope);
    const st = { fam: '', wf: '', when: '', sort: 'featured', q: '' };
    const grid = root.querySelector('#grid'), count = root.querySelector('#count'), empty = root.querySelector('#empty');
    const draw = () => {
      const q = st.q.trim().toLowerCase();
      let list = base.filter((p) => (!st.fam || p.family === st.fam) && (!st.wf || p.world === st.wf)
        && (!st.when || p.time === st.when || p.time === 'both')
        && (!q || [p.name, p.family, p.house, ...allNotes(p)].join(' ').toLowerCase().includes(q)));
      const pv = (p, d) => (typeof p.price === 'number' ? p.price : d);
      const sorts = { 'price-asc': (a, b) => pv(a, 1e9) - pv(b, 1e9), 'price-desc': (a, b) => pv(b, -1) - pv(a, -1), intensity: (a, b) => b.intensity - a.intensity, name: (a, b) => a.name.localeCompare(b.name) };
      if (sorts[st.sort]) list = list.slice().sort(sorts[st.sort]);
      grid.innerHTML = list.map((p, i) => card(p, i)).join('');
      count.textContent = `${list.length} ${list.length === 1 ? 'miniature' : 'miniatures'}`;
      empty.hidden = list.length > 0;
      reveal(grid);
    };
    root.addEventListener('click', (e) => {
      const f = e.target.closest('[data-fam]');
      if (f) { st.fam = f.dataset.fam; root.querySelectorAll('[data-fam]').forEach((b) => b.setAttribute('aria-pressed', String(b === f))); draw(); }
      const w = e.target.closest('[data-wf]');
      if (w) { st.wf = w.dataset.wf; root.querySelectorAll('[data-wf]').forEach((b) => b.setAttribute('aria-pressed', String(b === w))); draw(); }
      if (e.target.closest('#clear')) {
        Object.assign(st, { fam: '', wf: '', when: '', q: '' });
        root.querySelector('#q').value = ''; root.querySelector('#when').value = '';
        root.querySelectorAll('[data-fam],[data-wf]').forEach((b) => b.setAttribute('aria-pressed', String(!b.dataset.fam && !b.dataset.wf)));
        draw();
      }
    });
    root.querySelector('#sort').addEventListener('change', (e) => { st.sort = e.target.value; draw(); });
    root.querySelector('#when').addEventListener('change', (e) => { st.when = e.target.value; draw(); });
    root.querySelector('#q').addEventListener('input', (e) => { st.q = e.target.value; draw(); });
    draw();
  },
});
