import { byId, products, DEMO_NOTICE, isDemo, buyable } from '../data/products.js';
import { bag, money } from '../state.js';
import { card, icon, esc, img, priceText, reveal, rail, load3D, reduced, flyToBag, toast, announce } from '../ui.js';

const meter = (n) => `<span class="meter" aria-label="Intensity ${n} of 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;

export default (id) => {
  const p = byId(id);
  return {
    title: p ? `${p.name} — Veloura` : 'Not found',
    world: p?.world,
    notFound: !p,
    render() {
      const related = products.filter((x) => x.id !== p.id && x.world === p.world).sort((a, b) => (b.family === p.family) - (a.family === p.family)).slice(0, 6);
      return `
      <section class="product section--tight" data-product="${p.id}">
        <div class="wrap product__grid">
          <div class="product__stage">
            <div class="viewer" tabindex="0" role="img" aria-label="${esc(p.name)}: interactive 3D bottle. Drag, swipe or use the arrow keys to rotate." style="view-transition-name: product-hero">
              <img src="${img(p)}" alt="${esc(p.name)}${p.photos ? '' : ' — illustrative bottle'}" width="800" height="1000">
              ${p.photos ? `<img class="viewer__photo" id="photo" alt="" hidden>` : ''}
              <div class="viewer__tools">
                <span class="pill">${icon('rotate')} Drag to rotate</span>
                <button class="pill" type="button" id="capBtn" aria-pressed="false">${icon('sparkle')} Lift the cap</button>
              </div>
            </div>
            ${p.photos ? `<div class="viewer-tabs" role="tablist" aria-label="Product views">
              <button type="button" role="tab" class="viewer-tab" data-view="3d" aria-selected="true">${icon('rotate')}<span>3D</span></button>
              ${p.photos.map((ph, i) => `<button type="button" role="tab" class="viewer-tab" data-view="${i}" aria-selected="false"><img src="${ph}" alt="Photo ${i + 1}"></button>`).join('')}
            </div>` : ''}
          </div>
          <div class="product__info">
            <span class="product__house">${esc(p.house)} · ${p.world === 'noir' ? 'Veloura Noir' : 'Veloura Rosé'}</span>
            <h1 class="product__name">${esc(p.name)}</h1>
            <p class="product__sub">${esc(p.concentration)} · ${esc(p.size)}${p.format ? ` · ${esc(p.format)}` : ' miniature'}</p>
            <div class="product__price price">${priceText(p)}</div>
            <p class="muted" style="margin:0">${esc(p.description)}</p>
            <div class="buy-row">
              <div class="qty"><button type="button" data-q="-1" aria-label="Decrease quantity">${icon('minus')}</button><output id="qty" aria-live="polite">1</output><button type="button" data-q="1" aria-label="Increase quantity">${icon('plus')}</button></div>
              <button class="btn" type="button" id="addBtn" ${buyable(p) ? '' : 'disabled aria-disabled="true"'}>${icon('bag')} ${buyable(p) ? 'Add to bag' : 'Coming soon'}</button>
            </div>
            ${buyable(p) ? `<a class="btn btn--ghost" href="#build-a-set" id="toSet">${icon('gift')} Add to a discovery set</a>` : ''}
            <div class="notes">
              <h2>${p.keyNotes ? 'Key notes' : 'Fragrance notes'}</h2>
              ${p.keyNotes ? `<div class="key-notes">${p.keyNotes.map((n) => `<span>${esc(n)}</span>`).join('')}</div>` : `
              <div class="tier"><span>Top</span><span>${p.notes.top.map(esc).join(', ')}</span></div>
              <div class="tier"><span>Heart</span><span>${p.notes.heart.map(esc).join(', ')}</span></div>
              <div class="tier"><span>Base</span><span>${p.notes.base.map(esc).join(', ')}</span></div>`}
            </div>
            <dl class="facts">
              <div><dt>Family</dt><dd>${esc(p.family)}</dd></div>
              <div><dt>Intensity</dt><dd>${meter(p.intensity)}</dd></div>
              <div><dt>Best worn</dt><dd>${p.time === 'both' ? 'Day & evening' : p.time === 'day' ? 'Daytime' : 'Evening'}</dd></div>
              <div><dt>Seasons</dt><dd style="text-transform:capitalize">${p.season.join(', ')}</dd></div>
            </dl>
            <div>
              <details class="acc"><summary>About our miniatures ${icon('plus')}</summary><div class="acc__body">Each miniature is presented as described above (size and concentration). Miniatures may differ in packaging from full-size editions. [Describe whether items are manufacturer minis, travel sprays or decants.]</div></details>
              <details class="acc"><summary>Shipping ${icon('plus')}</summary><div class="acc__body">Shipping across Canada. Fragrances contain alcohol and ship by ground where carriers require it. Rates and delivery times are shown at checkout.</div></details>
              <details class="acc"><summary>Returns ${icon('plus')}</summary><div class="acc__body">Unopened items can be returned within [X] days. For hygiene reasons opened fragrances can't be returned unless damaged.</div></details>
            </div>
            <p class="demo-note">${isDemo(p) ? `${DEMO_NOTICE} The 3D bottle is an illustration, not a photo of the product.` : 'The 3D view is a model of the bottle shape; brand markings appear in the photos.'}</p>
          </div>
        </div>
      </section>
      <section class="section section--tight">
        <div class="wrap" data-rail>
          <div class="section-head"><h2>You may also love</h2><div class="rail-ctrl"><button class="round-btn" data-prev aria-label="Previous">${icon('arrow', 'flip')}</button><button class="round-btn" data-next aria-label="Next">${icon('arrow')}</button></div></div>
          <div class="rail">${related.map((r, i) => card(r, i)).join('')}</div>
        </div>
      </section>
      <div class="sticky-buy" id="stickyBuy" aria-hidden="true"><div><b>${esc(p.name)}</b><span class="price muted">${priceText(p)}</span></div>${buyable(p) ? `<button class="btn btn--sm" type="button" data-add="${p.id}">Add to bag</button>` : ''}</div>`;
    },
    async mount(root) {
      reveal(root); rail(root);
      let qty = 1;
      const qEl = root.querySelector('#qty');
      root.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => { qty = Math.max(1, Math.min(10, qty + +b.dataset.q)); qEl.textContent = qty; }));
      const add = root.querySelector('#addBtn');
      add.addEventListener('click', () => {
        if (!buyable(p)) return;
        bag.addProduct(p.id, qty);
        flyToBag(root.querySelector('.viewer'), img(p));
        toast(`${p.name} added to your bag`); announce(`${p.name} added to your bag`);
      });
      root.querySelector('#toSet')?.addEventListener('click', () => { try { sessionStorage.setItem('veloura-preselect', p.id); } catch (e) { /* ignore */ } });
      const sticky = root.querySelector('#stickyBuy');
      const io = new IntersectionObserver(([e]) => { const show = !e.isIntersecting && e.boundingClientRect.top < 0; sticky.classList.toggle('show', show); sticky.setAttribute('aria-hidden', String(!show)); });
      io.observe(add);

      const viewerEl = root.querySelector('.viewer');
      let viewer = null, alive = true;
      const capBtn = root.querySelector('#capBtn');
      capBtn.addEventListener('click', () => { if (!viewer) return; const on = viewer.toggleCap(); capBtn.setAttribute('aria-pressed', String(on)); capBtn.lastChild.textContent = on ? ' Replace the cap' : ' Lift the cap'; });
      const mod = await load3D();
      if (mod && alive) {
        try { viewer = mod.mountViewer(viewerEl, p.bottle, p.world, { reducedMotion: reduced() }); } catch (e) { console.warn(e); }
      }
      if (!viewer) capBtn.hidden = true;
      // photo / 3D switcher
      const photo = root.querySelector('#photo');
      root.querySelectorAll('[data-view]').forEach((t) => t.addEventListener('click', () => {
        root.querySelectorAll('[data-view]').forEach((x) => x.setAttribute('aria-selected', String(x === t)));
        const v = t.dataset.view;
        if (v === '3d') { photo.hidden = true; } else { photo.src = p.photos[+v]; photo.alt = `${p.name} — photo ${+v + 1}`; photo.hidden = false; }
        viewerEl.querySelector('.viewer__tools').hidden = v !== '3d';
      }));
      return () => { alive = false; io.disconnect(); viewer?.dispose(); };
    },
  };
};
