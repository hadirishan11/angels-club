import { byId, products, DEMO_NOTICE } from '../data/products.js';
import { bag, money } from '../state.js';
import { card, icon, esc, img, reveal, rail, load3D, reduced, flyToBag, toast, announce } from '../ui.js';

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
              <img src="${img(p)}" alt="${esc(p.name)} — illustrative bottle" width="800" height="1000">
              <div class="viewer__tools">
                <span class="pill">${icon('rotate')} Drag to rotate</span>
                <button class="pill" type="button" id="capBtn" aria-pressed="false">${icon('sparkle')} Lift the cap</button>
              </div>
            </div>
          </div>
          <div class="product__info">
            <span class="product__house">${esc(p.house)} · ${p.world === 'noir' ? 'Veloura Noir' : 'Veloura Rosé'}</span>
            <h1 class="product__name">${esc(p.name)}</h1>
            <p class="product__sub">${esc(p.concentration)} · ${esc(p.size)} miniature</p>
            <div class="product__price price">${money(p.price)}</div>
            <p class="muted" style="margin:0">${esc(p.description)}</p>
            <div class="buy-row">
              <div class="qty"><button type="button" data-q="-1" aria-label="Decrease quantity">${icon('minus')}</button><output id="qty" aria-live="polite">1</output><button type="button" data-q="1" aria-label="Increase quantity">${icon('plus')}</button></div>
              <button class="btn" type="button" id="addBtn">${icon('bag')} Add to bag</button>
            </div>
            <a class="btn btn--ghost" href="#build-a-set" id="toSet">${icon('gift')} Add to a discovery set</a>
            <div class="notes">
              <h2>Fragrance notes</h2>
              <div class="tier"><span>Top</span><span>${p.notes.top.map(esc).join(', ')}</span></div>
              <div class="tier"><span>Heart</span><span>${p.notes.heart.map(esc).join(', ')}</span></div>
              <div class="tier"><span>Base</span><span>${p.notes.base.map(esc).join(', ')}</span></div>
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
            <p class="demo-note">${DEMO_NOTICE} The 3D bottle is an illustration, not a photo of the product.</p>
          </div>
        </div>
      </section>
      <section class="section section--tight">
        <div class="wrap" data-rail>
          <div class="section-head"><h2>You may also love</h2><div class="rail-ctrl"><button class="round-btn" data-prev aria-label="Previous">${icon('arrow', 'flip')}</button><button class="round-btn" data-next aria-label="Next">${icon('arrow')}</button></div></div>
          <div class="rail">${related.map((r, i) => card(r, i)).join('')}</div>
        </div>
      </section>
      <div class="sticky-buy" id="stickyBuy" aria-hidden="true"><div><b>${esc(p.name)}</b><span class="price muted">${money(p.price)}</span></div><button class="btn btn--sm" type="button" data-add="${p.id}">Add to bag</button></div>`;
    },
    async mount(root) {
      reveal(root); rail(root);
      let qty = 1;
      const qEl = root.querySelector('#qty');
      root.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => { qty = Math.max(1, Math.min(10, qty + +b.dataset.q)); qEl.textContent = qty; }));
      const add = root.querySelector('#addBtn');
      add.addEventListener('click', () => {
        bag.addProduct(p.id, qty);
        flyToBag(root.querySelector('.viewer'), img(p));
        toast(`${p.name} added to your bag`); announce(`${p.name} added to your bag`);
      });
      root.querySelector('#toSet').addEventListener('click', () => { try { sessionStorage.setItem('veloura-preselect', p.id); } catch (e) { /* ignore */ } });
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
      return () => { alive = false; io.disconnect(); viewer?.dispose(); };
    },
  };
};
