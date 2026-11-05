import { products, SET_PRICES } from '../data/products.js';
import { bag, money, world } from '../state.js';
import { icon, esc, img, toast, announce } from '../ui.js';

const QUESTIONS = [
  { id: 'who', title: 'Who is this fragrance for?', multi: false, options: [
    { v: 'me-noir', t: 'Me — bold & magnetic', d: 'Woods, spice, leather, smoke' },
    { v: 'me-rose', t: 'Me — soft & radiant', d: 'Florals, fruits, vanilla, musk' },
    { v: 'gift-him', t: 'A gift for him', d: 'We\'ll lean towards Veloura Noir' },
    { v: 'gift-her', t: 'A gift for her', d: 'We\'ll lean towards Veloura Rosé' },
    { v: 'any', t: 'Surprise me', d: 'Search both worlds' },
  ] },
  { id: 'mood', title: 'Which mood feels most like you?', multi: false, options: [
    { v: 'fresh', t: 'Fresh & clean', d: 'Citrus, sea air, cotton' },
    { v: 'warm', t: 'Warm & cosy', d: 'Amber, vanilla, honey' },
    { v: 'mysterious', t: 'Mysterious', d: 'Incense, oud, dark woods' },
    { v: 'romantic', t: 'Romantic', d: 'Rose, peony, soft powder' },
    { v: 'playful', t: 'Playful', d: 'Juicy fruits, sweet notes' },
    { v: 'confident', t: 'Polished & confident', d: 'Crisp, structured, elegant' },
  ] },
  { id: 'time', title: 'When will you wear it most?', multi: false, options: [
    { v: 'day', t: 'Daytime', d: 'Work, brunch, everyday' },
    { v: 'night', t: 'Evenings', d: 'Dinners, dates, events' },
    { v: 'both', t: 'Day to night', d: 'One scent that does it all' },
  ] },
  { id: 'notes', title: 'Which notes draw you in?', hint: 'Choose up to two.', multi: 2, options: [
    { v: 'Fresh / Citrus', t: 'Citrus & sea', d: 'Bergamot, neroli, salt' },
    { v: 'Woody', t: 'Woods & smoke', d: 'Vetiver, cedar, incense' },
    { v: 'Floral', t: 'Flowers', d: 'Rose, jasmine, orange blossom' },
    { v: 'Gourmand', t: 'Vanilla & sweets', d: 'Praline, tonka, berries' },
    { v: 'Oriental / Amber', t: 'Spice & amber', d: 'Saffron, tobacco, resin' },
    { v: 'Powdery', t: 'Powder & iris', d: 'Soft, elegant, cosmetic' },
    { v: 'Musk', t: 'Clean musk', d: 'Skin, cotton, soft woods' },
    { v: 'Leather', t: 'Leather & suede', d: 'Smooth, warm, refined' },
    { v: 'Fruity', t: 'Fruits', d: 'Lychee, raspberry, pear' },
    { v: 'Aromatic', t: 'Herbs & spice', d: 'Lavender, pepper, sage' },
  ] },
  { id: 'intensity', title: 'How noticeable should it be?', multi: false, options: [
    { v: '1', t: 'Close to the skin', d: 'Discovered only up close' },
    { v: '3', t: 'Noticeable', d: 'Present without filling the room' },
    { v: '5', t: 'Leaves a trail', d: 'Memorable and long-lasting' },
  ] },
];

function score(a) {
  const pref = { 'me-noir': 'noir', 'gift-him': 'noir', 'me-rose': 'rose', 'gift-her': 'rose' }[a.who];
  const results = products.map((p) => {
    let s = 0; const why = [];
    if (!pref) s += 2; else if (p.world === pref) { s += 4; } else s -= 2;
    if (p.mood.includes(a.mood)) { s += 3; why.push(`${a.mood} mood`); }
    if (a.time && (p.time === a.time || p.time === 'both' || a.time === 'both')) { s += 2; why.push(p.time === 'both' ? 'wears day to night' : p.time === 'day' ? 'made for daytime' : 'an evening scent'); }
    if ((a.notes || []).includes(p.family)) { s += 4; why.unshift(`${p.family.toLowerCase()} family`); }
    const d = Math.abs(p.intensity - Number(a.intensity || 3));
    s += 2 - d; if (d <= 1) why.push(['', 'soft', 'soft', 'moderate', 'rich', 'intense'][p.intensity] + ' projection');
    return { p, s, why };
  }).sort((x, y) => y.s - x.s);
  const max = 15;
  return results.slice(0, 3).map((r) => ({ ...r, pct: Math.max(55, Math.min(98, Math.round((r.s / max) * 100))) }));
}

export default {
  title: 'Scent finder — Veloura',
  render() {
    return `<section class="quiz"><div class="wrap"><div class="quiz__card" id="quiz"></div></div></section>`;
  },
  mount(root) {
    const el = root.querySelector('#quiz');
    const a = {}; let step = 0;
    const progress = () => `<div class="quiz__progress" aria-hidden="true">${QUESTIONS.map((_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>`;
    const showQ = () => {
      const q = QUESTIONS[step];
      const sel = (v) => (q.multi ? (a[q.id] || []).includes(v) : a[q.id] === v);
      el.innerHTML = `${progress()}
        <div class="quiz__q">
          <p class="eyebrow">Question ${step + 1} of ${QUESTIONS.length}</p>
          <h1 style="font-size:clamp(1.6rem,1.1rem + 2vw,2.8rem)">${q.title}</h1>
          ${q.hint ? `<p class="muted">${q.hint}</p>` : ''}
          <div class="options" role="group" aria-label="${esc(q.title)}">
            ${q.options.map((o) => `<button class="option" type="button" data-v="${esc(o.v)}" aria-pressed="${sel(o.v)}"><strong>${esc(o.t)}</strong><span>${esc(o.d)}</span></button>`).join('')}
          </div>
          <div class="quiz__nav">
            <button class="btn btn--ghost btn--sm" type="button" data-back ${step === 0 ? 'disabled' : ''}>${icon('arrow', 'flip')} Back</button>
            ${q.multi ? `<button class="btn btn--sm" type="button" data-next ${(a[q.id] || []).length ? '' : 'disabled'}>Next ${icon('arrow')}</button>` : ''}
          </div>
        </div>`;
      el.querySelector('.option')?.focus({ preventScroll: true });
    };
    const showResults = () => {
      const res = score(a);
      const ids = res.map((r) => r.p.id);
      el.innerHTML = `<div class="quiz__q">
        <p class="eyebrow">Your matches</p>
        <h1 style="font-size:clamp(1.6rem,1.1rem + 2vw,2.8rem)">Three miniatures to try</h1>
        <p class="lede">Based on your answers. Try them side by side — the best way to find a signature.</p>
        <div style="display:grid;gap:12px;margin:24px 0">
          ${res.map((r) => `<div class="match">
            <img src="${img(r.p)}" alt="">
            <div>
              <span class="match__score">${r.pct}% match · ${r.p.world === 'noir' ? 'Noir' : 'Rosé'}</span>
              <h3><a class="link" href="#product-${r.p.id}">${esc(r.p.name)}</a></h3>
              <p class="match__why">Why: ${r.why.slice(0, 3).map(esc).join(' · ') || 'a balanced match'}</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="price">${money(r.p.price)}</span><button class="btn btn--sm" data-add-one="${r.p.id}" type="button">Add to bag</button></div>
            </div></div>`).join('')}
        </div>
        <div class="sum" style="color:inherit"><div><strong style="font-family:var(--f-display);letter-spacing:.12em;text-transform:uppercase">Take all three as a discovery set</strong><br><span class="muted">Presented in a Veloura case · ${money(SET_PRICES[3])} <s>${money(res.reduce((x, r) => x + r.p.price, 0))}</s></span></div>
          <button class="btn" type="button" id="takeSet">${icon('gift')} Add set to bag</button></div>
        <div class="quiz__nav"><button class="btn btn--ghost btn--sm" type="button" data-restart>Retake the quiz</button><a class="btn btn--ghost btn--sm" href="#build-a-set">Build your own set</a></div>
      </div>`;
      el.querySelector('#takeSet').addEventListener('click', () => { bag.addSet(ids, 3); toast('Discovery set added to your bag'); announce('Discovery set added to your bag'); });
    };
    el.addEventListener('click', (e) => {
      const o = e.target.closest('.option');
      if (o) {
        const q = QUESTIONS[step];
        if (q.multi) {
          const cur = a[q.id] || [];
          a[q.id] = cur.includes(o.dataset.v) ? cur.filter((x) => x !== o.dataset.v) : cur.concat(o.dataset.v).slice(-q.multi);
          showQ();
        } else {
          a[q.id] = o.dataset.v;
          if (q.id === 'who') { const w = { 'me-noir': 'noir', 'gift-him': 'noir', 'me-rose': 'rose', 'gift-her': 'rose' }[o.dataset.v]; if (w) world.set(w, o); }
          o.setAttribute('aria-pressed', 'true');
          setTimeout(() => { step++; step < QUESTIONS.length ? showQ() : showResults(); }, 220);
        }
        return;
      }
      if (e.target.closest('[data-next]')) { step++; step < QUESTIONS.length ? showQ() : showResults(); }
      if (e.target.closest('[data-back]') && step > 0) { step--; showQ(); }
      if (e.target.closest('[data-restart]')) { Object.keys(a).forEach((k) => delete a[k]); step = 0; showQ(); }
      const one = e.target.closest('[data-add-one]');
      if (one) { bag.addProduct(one.dataset.addOne); toast('Added to your bag'); }
    });
    showQ();
  },
};
