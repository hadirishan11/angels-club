/** App state: world (Noir/Rosé), bag, and a tiny event bus. Persisted per browser. */
import { byId, SET_PRICES } from './data/products.js';

const listeners = {};
export const on = (ev, fn) => { (listeners[ev] ||= new Set()).add(fn); return () => listeners[ev].delete(fn); };
export const emit = (ev, data) => listeners[ev]?.forEach((fn) => fn(data));

const store = {
  get(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
};

/* ---------- world ---------- */
export const world = {
  current: store.get('veloura-world', 'noir') === 'rose' ? 'rose' : 'noir',
  set(w, origin) {
    if (w !== 'noir' && w !== 'rose' || w === this.current) return;
    const apply = () => {
      this.current = w;
      document.documentElement.dataset.world = w;
      store.set('veloura-world', w);
      emit('world', w);
    };
    const reduced = document.documentElement.dataset.motion === 'reduced';
    if (document.startViewTransition && !reduced) {
      if (origin) {
        const r = origin.getBoundingClientRect();
        document.documentElement.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
        document.documentElement.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
      }
      document.documentElement.dataset.vt = 'world';
      const t = document.startViewTransition(apply);
      t.finished.finally(() => { delete document.documentElement.dataset.vt; });
    } else apply();
  },
};

/* ---------- bag ---------- */
// line: { key, type: 'product' | 'set', id?, items?: [ids], size?: 3|5, qty }
export const bag = {
  lines: store.get('veloura-bag', []),
  save() { store.set('veloura-bag', this.lines); emit('bag', this); },
  count() { return this.lines.reduce((a, l) => a + l.qty, 0); },
  linePrice(l) { return l.type === 'set' ? SET_PRICES[l.size] : (byId(l.id)?.price || 0); },
  subtotal() { return this.lines.reduce((a, l) => a + this.linePrice(l) * l.qty, 0); },
  addProduct(id, qty = 1) {
    const key = `p:${id}`;
    const ex = this.lines.find((l) => l.key === key);
    if (ex) ex.qty += qty; else this.lines.push({ key, type: 'product', id, qty });
    this.save();
  },
  addSet(ids, size) {
    const key = `s:${size}:${ids.join(',')}`;
    const ex = this.lines.find((l) => l.key === key);
    if (ex) ex.qty += 1; else this.lines.push({ key, type: 'set', items: ids.slice(), size, qty: 1 });
    this.save();
  },
  setQty(key, qty) {
    const l = this.lines.find((x) => x.key === key);
    if (!l) return;
    if (qty <= 0) this.lines = this.lines.filter((x) => x.key !== key); else l.qty = Math.min(20, qty);
    this.save();
  },
  note: store.get('veloura-note', ''),
  setNote(n) { this.note = n; store.set('veloura-note', n); },
};

export const money = (cents) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);
