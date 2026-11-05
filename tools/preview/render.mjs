/**
 * VELOURA local preview renderer (development aid, not part of the Shopify theme).
 * Renders theme templates to static HTML with LiquidJS and mock Shopify data so the
 * design can be reviewed in a browser without a store. Shopify-only behaviour
 * (cart API, predictive search, checkout, filters) is NOT available in this preview.
 *
 * Usage: node tools/preview/render.mjs <themeDir> <outDir>
 * Requires: npm i liquidjs@10
 */
import { Liquid, Tag, Hash } from 'liquidjs';
import fs from 'node:fs';
import path from 'node:path';

const themeDir = path.resolve(process.argv[2] || 'veloura-theme');
const outDir = path.resolve(process.argv[3] || 'preview-out');
fs.mkdirSync(outDir, { recursive: true });

const read = (p) => fs.readFileSync(path.join(themeDir, p), 'utf8');
const locale = JSON.parse(read('locales/en.default.json'));
const settingsData = JSON.parse(read('config/settings_data.json'));
const settings = { ...settingsData.presets[settingsData.current] };

/* ---------- mock catalogue ---------- */
const demo = (n) => `/demo-content/product-images/demo-${n}.webp`;
const img = (src, alt = '') => ({ src, alt, width: 1600, height: 1600, media_type: 'image', preview_image: { src, alt } });
const mkProduct = (i, title, vendor, world, price, image, extra = {}) => ({
  id: 1000 + i, title, vendor, handle: title.toLowerCase().replace(/\W+/g, '-'), url: `#product-${i}`,
  tags: [world], available: true, price, price_min: price, compare_at_price: extra.compare || 0, price_varies: false,
  has_only_default_variant: true, featured_media: image ? img(image, title) : null, media: image ? [img(image, title)] : [],
  description: '<p>Placeholder description for preview purposes.</p>',
  options_with_values: [], variants: [], selected_or_first_available_variant: { id: 2000 + i, price, compare_at_price: extra.compare || 0, available: true, title: 'Default Title' },
  metafields: { veloura: { bottle_size: '10 ml', concentration: 'Eau de Parfum', fragrance_family: world === 'noir' ? 'Woody Aromatic' : 'Floral Fruity', top_notes: 'Bergamot, Pink Pepper', heart_notes: 'Lavender, Iris', base_notes: 'Ambergris, Cedar', bottle_shape: extra.shape || '' } },
});
const noirProducts = [
  mkProduct(1, 'Demo Noir Mini 01', 'House A', 'noir', 3400, demo('noir-01')),
  mkProduct(2, 'Demo Noir Mini 02', 'House B', 'noir', 2900, demo('noir-02')),
  mkProduct(3, 'Demo Noir Mini 03', 'House C', 'noir', 3800, demo('noir-03'), { compare: 4200 }),
  mkProduct(4, 'Demo Noir Mini 04', 'House D', 'noir', 3100, null),
];
const roseProducts = [
  mkProduct(5, 'Demo Rosé Mini 01', 'House E', 'rose', 3600, demo('rose-01')),
  mkProduct(6, 'Demo Rosé Mini 02', 'House F', 'rose', 3200, demo('rose-02')),
  mkProduct(7, 'Demo Rosé Mini 03', 'House G', 'rose', 2800, demo('rose-03')),
  mkProduct(8, 'Demo Rosé Mini 04', 'House H', 'rose', 3500, null, { shape: 'faceted' }),
];
const all = [...noirProducts, ...roseProducts];
const mkCollection = (handle, title, products) => ({ handle, title, url: `#collection-${handle}`, products, products_count: products.length, all_products_count: products.length, description: '<p>Preview collection.</p>', filters: [], sort_options: [{ value: 'best-selling', name: 'Best selling' }, { value: 'price-ascending', name: 'Price, low to high' }, { value: 'price-descending', name: 'Price, high to low' }, { value: 'created-descending', name: 'Date, new to old' }], sort_by: 'best-selling' });
const noir = mkCollection('noir', 'Veloura Noir', noirProducts);
const rose = mkCollection('rose', 'Veloura Rosé', roseProducts);
const bestsellers = mkCollection('best-sellers', 'Best sellers', [all[0], all[4], all[1], all[5], all[2], all[6], all[3], all[7]]);
Object.assign(settings, { noir_collection: noir, rose_collection: rose, discovery_collection: bestsellers });

/* ---------- engine ---------- */
const engine = new Liquid({ root: [path.join(themeDir, 'snippets')], extname: '.liquid', strictFilters: false, strictVariables: false, jsTruthy: false, ownPropertyOnly: false });

const tr = (key, args = {}) => {
  let v = key.split('.').reduce((o, k) => (o ? o[k] : undefined), locale);
  if (v && typeof v === 'object') v = args.count === 1 ? v.one : v.other;
  if (typeof v !== 'string') return key;
  return v.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (args[k] ?? ''));
};
const money = (c) => `$${(Number(c || 0) / 100).toFixed(2)}`;
const asset = (n) => `/veloura-theme/assets/${n}`;
const f = {
  t: function (key, ...rest) { const args = {}; for (let i = 0; i < rest.length; i++) { const r = rest[i]; if (Array.isArray(r)) args[r[0]] = r[1]; } return tr(key, args); },
  asset_url: asset, money, money_with_currency: (c) => `${money(c)} CAD`, money_without_currency: (c) => (Number(c || 0) / 100).toFixed(2),
  json: (v) => JSON.stringify(v ?? null), stylesheet_tag: (u) => `<link rel="stylesheet" href="${u}">`, preload_tag: (u) => `<link rel="preload" href="${u}" as="font" crossorigin>`,
  image_url: (m) => (m && (m.src || m)) || '', image_tag: (u, ...rest) => { const a = {}; rest.forEach((r) => { if (Array.isArray(r)) a[r[0]] = r[1]; }); return `<img src="${u}" alt="${a.alt || ''}" class="${a.class || ''}" loading="${a.loading || 'lazy'}">`; },
  color_mix: (a, b, p) => mix(a, b, p), color_modify: (c, k, v) => rgba(c, v), color_lighten: (c) => c,
  font_face: () => '', handle: (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'), url_for_vendor: (v) => `#vendor-${v}`,
  metafield_text: (v) => v ?? '', payment_type_svg_tag: () => '', default_errors: () => '', time_tag: (d) => d, format_address: () => '', link_to: (t, u) => `<a href="${u}">${t}</a>`,
  url_encode: encodeURIComponent, shopify_asset_url: (u) => u, format_code: (c) => c, payment_button: () => '',
};
for (const [k, fn] of Object.entries(f)) engine.registerFilter(k, fn);
function hex(c) { c = String(c).replace('#', ''); return [0, 2, 4].map((i) => parseInt(c.substr(i, 2), 16)); }
function mix(a, b, p) { const A = hex(a), B = hex(b); const w = Number(p) / 100; return '#' + A.map((x, i) => Math.round(x * w + B[i] * (1 - w)).toString(16).padStart(2, '0')).join(''); }
function rgba(c, a) { const [r, g, b] = hex(c); return `rgba(${r}, ${g}, ${b}, ${a})`; }

// {% schema %} blocks are stripped before rendering (see renderSection)
// form: render inner content wrapped in <form>
engine.registerTag('form', class extends Tag {
  constructor(tagToken, remainTokens, liquid) {
    super(tagToken, remainTokens, liquid);
    this.args = tagToken.args; this.tpls = [];
    const stream = liquid.parser.parseStream(remainTokens);
    stream.on('tag:endform', () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error('form not closed'); });
    stream.start();
  }
  * render(ctx, emitter) { ctx.push({ form: { errors: null, posted_successfully: false } }); emitter.write('<form method="post">'); yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter); emitter.write('</form>'); ctx.pop(); }
});
engine.registerTag('paginate', class extends Tag {
  constructor(t, r, l) { super(t, r, l); this.tpls = []; const s = l.parser.parseStream(r); s.on('tag:endpaginate', () => s.stop()).on('template', (x) => this.tpls.push(x)); s.start(); }
  * render(ctx, em) { ctx.push({ paginate: { pages: 1, parts: [] } }); yield this.liquid.renderer.renderTemplates(this.tpls, ctx, em); ctx.pop(); }
});
for (const name of ['style', 'stylesheet', 'javascript']) {
  engine.registerTag(name, class extends Tag { constructor(t, r, l) { super(t, r, l); this.tpls = []; const s = l.parser.parseStream(r); s.on(`tag:end${name}`, () => s.stop()).on('template', (x) => this.tpls.push(x)); s.start(); } * render(ctx, em) { if (name === 'style') { em.write('<style>'); yield this.liquid.renderer.renderTemplates(this.tpls, ctx, em); em.write('</style>'); } } });
}
engine.registerTag('layout', class extends Tag { * render() {} });

async function renderSection(type, data, ctxBase, id) {
  const src = read(`sections/${type}.liquid`);
  const schemaMatch = src.match(/\{% schema %\}([\s\S]*?)\{% endschema %\}/);
  const schema = schemaMatch ? JSON.parse(schemaMatch[1]) : { settings: [] };
  const s = {}; (schema.settings || []).forEach((x) => { if (x.id && 'default' in x) s[x.id] = x.default; });
  Object.assign(s, data.settings || {});
  if (type === 'featured-products' && !s.collection) s.collection = bestsellers;
  const blocks = (data.block_order || []).map((bid) => {
    const b = data.blocks[bid]; const bs = (schema.blocks || []).find((x) => x.type === b.type) || {};
    const bset = {}; (bs.settings || []).forEach((x) => { if (x.id && 'default' in x) bset[x.id] = x.default; });
    return { id: bid, type: b.type, settings: { ...bset, ...(b.settings || {}) }, shopify_attributes: '' };
  });
  const html = await engine.parseAndRender(src.replace(/\{% schema %\}[\s\S]*?\{% endschema %\}/, ''), { ...ctxBase, section: { id, settings: s, blocks } }, { globals: ctxBase });
  return `<div id="shopify-section-${id}" class="shopify-section ${schema.class || ''}">${html}</div>`;
}
async function renderGroup(name, ctxBase) {
  const g = JSON.parse(read(`sections/${name}.json`));
  let out = '';
  for (const id of g.order) out += await renderSection(g.sections[id].type, g.sections[id], ctxBase, id);
  return out;
}

async function renderPage(templateName, extraCtx, outName) {
  const tpl = JSON.parse(read(`templates/${templateName}.json`));
  const [name, suffix] = templateName.split('.');
  const ctxBase = {
    settings, shop: { name: 'Veloura', vendors: ['House A', 'House B', 'House C', 'House D', 'House E', 'House F', 'House G', 'House H'], customer_accounts_enabled: true, policies: [], enabled_payment_types: [], money_format: '${{amount}}' },
    routes: { root_url: '#', cart_url: '#cart', all_products_collection_url: '#all', search_url: '#search', account_url: '#account', cart_add_url: '#', cart_change_url: '#', cart_update_url: '#', predictive_search_url: '#', product_recommendations_url: '#' },
    cart: { item_count: 0, items: [], currency: { iso_code: 'CAD' } }, request: { locale: { iso_code: 'en' }, page_type: name, origin: '' },
    template: { name, suffix: suffix || '' }, localization: { available_countries: [], available_languages: [] }, canonical_url: '#', page_title: 'Veloura',
    ...extraCtx,
  };
  let content = '';
  for (const id of tpl.order) content += await renderSection(tpl.sections[id].type, tpl.sections[id], ctxBase, id);
  let layout = read('layout/theme.liquid');
  layout = layout.replace("{% sections 'header-group' %}", await renderGroup('header-group', ctxBase))
    .replace("{% sections 'footer-group' %}", await renderGroup('footer-group', ctxBase))
    .replace("{% section 'cart-drawer' %}", await renderSection('cart-drawer', {}, ctxBase, 'cart-drawer'));
  const html = await engine.parseAndRender(layout, { ...ctxBase, content_for_layout: content, content_for_header: '' }, { globals: ctxBase });
  fs.writeFileSync(path.join(outDir, outName), html);
  console.log('wrote', outName);
}

await renderPage('index', {}, 'index.html');
await renderPage('collection.noir', { collection: noir }, 'collection-noir.html');
await renderPage('collection.rose', { collection: rose }, 'collection-rose.html');
const p = { ...noirProducts[0], media: [img(demo('noir-01'), 'Demo')], metafields: { veloura: { ...noirProducts[0].metafields.veloura, bottle_shape: 'square' } } };
await renderPage('product', { product: p, recommendations: { performed: true, products_count: 4, products: noirProducts } }, 'product.html');
await renderPage('page.faq', { page: { title: 'FAQ', content: '' } }, 'faq.html');
