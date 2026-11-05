import { products as allProducts, byId, SET_PRICES, buyable } from '../data/products.js';
const products = allProducts.filter(buyable);
import { bag, money, world, on } from '../state.js';
import { icon, esc, img, load3D, toast, announce, flyToBag } from '../ui.js';

export default {
  title: 'Build a discovery set — Veloura',
  render() {
    return `<section class="builder section--tight"><div class="wrap">
      <div style="margin-bottom:24px"><p class="eyebrow">Discovery sets</p><h1>Build your own set</h1>
        <p class="lede">Choose three or five miniatures. We'll present them in a signature Veloura case — ${money(SET_PRICES[3])} for three, ${money(SET_PRICES[5])} for five.</p></div>
      <div class="builder__grid">
        <div class="builder__tray">
          <div class="tray" id="tray" aria-label="Your discovery case"></div>
          <div class="tray__slots" id="slots"></div>
          <div class="sum">
            <div><div class="sum__price" id="price"></div><span class="muted" id="sumNote"></span></div>
            <button class="btn" type="button" id="addSet" disabled>${icon('gift')} Add set to bag</button>
          </div>
        </div>
        <div>
          <div class="toolbar" style="margin-bottom:16px">
            <div class="toolbar__chips" role="group" aria-label="Set size"><button class="chip" data-size="3" aria-pressed="true">Set of 3</button><button class="chip" data-size="5" aria-pressed="false">Set of 5</button></div>
            <div class="toolbar__chips" role="group" aria-label="World"><button class="chip" data-f="" aria-pressed="true">All</button><button class="chip" data-f="noir" aria-pressed="false">Noir</button><button class="chip" data-f="rose" aria-pressed="false">Rosé</button></div>
          </div>
          <div class="pick-list" id="picks"></div>
        </div>
      </div>
    </div></section>`;
  },
  async mount(root) {
    let size = 3, filter = '', picked = [];
    try { const pre = sessionStorage.getItem('veloura-preselect'); if (pre && byId(pre)) picked = [pre]; sessionStorage.removeItem('veloura-preselect'); } catch (e) { /* ignore */ }
    const trayEl = root.querySelector('#tray');
    let tray = null, mod = null, alive = true;

    const drawPicks = () => {
      const list = products.filter((p) => !filter || p.world === filter);
      root.querySelector('#picks').innerHTML = list.map((p) => {
        const on = picked.includes(p.id);
        return `<button class="pick" type="button" data-pick="${p.id}" aria-pressed="${on}" ${!on && picked.length >= size ? 'disabled' : ''}>
          <img src="${img(p)}" alt="" loading="lazy"><b>${esc(p.name)}</b><small>${esc(p.family)} · ${p.world === 'noir' ? 'Noir' : 'Rosé'}</small></button>`;
      }).join('');
    };
    const drawSummary = () => {
      root.querySelector('#slots').innerHTML = Array.from({ length: size }, (_, i) => {
        const p = byId(picked[i]);
        return p ? `<span class="slot filled"><img src="${img(p)}" alt="">${esc(p.name)}<button type="button" data-unpick="${p.id}" aria-label="Remove ${esc(p.name)}">${icon('close')}</button></span>` : `<span class="slot">Slot ${i + 1}</span>`;
      }).join('');
      const full = picked.length === size;
      const sum = picked.reduce((a, id) => a + byId(id).price, 0);
      root.querySelector('#price').innerHTML = `${money(SET_PRICES[size])}${full && sum > SET_PRICES[size] ? `<s>${money(sum)}</s>` : ''}`;
      root.querySelector('#sumNote').textContent = full ? 'Your case is ready.' : `Choose ${size - picked.length} more`;
      root.querySelector('#addSet').disabled = !full;
      tray?.setItems(picked.map(byId));
    };
    const remountTray = async () => {
      tray?.dispose(); tray = null;
      if (!mod) return;
      try { tray = mod.mountTray(trayEl, world.current, size); tray.setItems(picked.map(byId)); } catch (e) { console.warn(e); }
    };

    root.addEventListener('click', (e) => {
      const pk = e.target.closest('[data-pick]');
      if (pk) { const id = pk.dataset.pick; picked = picked.includes(id) ? picked.filter((x) => x !== id) : picked.length < size ? picked.concat(id) : picked; drawPicks(); drawSummary(); return; }
      const up = e.target.closest('[data-unpick]');
      if (up) { picked = picked.filter((x) => x !== up.dataset.unpick); drawPicks(); drawSummary(); return; }
      const sz = e.target.closest('[data-size]');
      if (sz) { size = +sz.dataset.size; picked = picked.slice(0, size); root.querySelectorAll('[data-size]').forEach((b) => b.setAttribute('aria-pressed', String(b === sz))); drawPicks(); drawSummary(); remountTray(); return; }
      const f = e.target.closest('[data-f]');
      if (f) { filter = f.dataset.f; root.querySelectorAll('[data-f]').forEach((b) => b.setAttribute('aria-pressed', String(b === f))); drawPicks(); }
    });
    root.querySelector('#addSet').addEventListener('click', () => {
      bag.addSet(picked, size);
      flyToBag(trayEl, img(byId(picked[0])));
      toast(`Set of ${size} added to your bag`); announce(`Set of ${size} added to your bag`);
      picked = []; drawPicks(); drawSummary();
    });
    const off = on('world', () => remountTray());
    drawPicks(); drawSummary();
    mod = await load3D();
    if (alive) await remountTray();
    if (!tray) trayEl.innerHTML = `<img src="img/case-${world.current}.webp" alt="" style="width:100%;height:100%;object-fit:contain;padding:6%">`;
    return () => { alive = false; off(); tray?.dispose(); };
  },
};
