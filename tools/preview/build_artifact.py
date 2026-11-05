"""Packages the LiquidJS preview (tools/preview/render.mjs output) as a multi-file
web artifact: rewrites asset paths to relative URLs, links pages together, and
injects a small simulated cart so add-to-bag and the cart drawer can be tried
without a Shopify store.

Usage: python3 tools/preview/build_artifact.py <preview_out_dir> <theme_dir> <demo_img_dir> <artifact_dir>
"""
import os, re, sys, shutil

src, theme, demo, dst = sys.argv[1:5]
os.makedirs(os.path.join(dst, 'assets'), exist_ok=True)
os.makedirs(os.path.join(dst, 'demo'), exist_ok=True)
for f in os.listdir(os.path.join(theme, 'assets')):
    shutil.copy(os.path.join(theme, 'assets', f), os.path.join(dst, 'assets', f))
for f in os.listdir(demo):
    shutil.copy(os.path.join(demo, f), os.path.join(dst, 'demo', f))

PAGES = {'index.html': 'index', 'collection-noir.html': 'collection', 'collection-rose.html': 'collection', 'product.html': 'product'}

MOCK = r"""
<script>
/* Preview-only: simulated Shopify cart + routes (the real theme uses Shopify's Cart API). */
(function () {
  var V = window.Veloura;
  V.routes = Object.assign(V.routes, { cart: '/cart', cartAdd: '/cart/add', cartChange: '/cart/change', cartUpdate: '/cart/update', productRecommendations: '/recommendations/products', noir: 'collection-noir.html', rose: 'collection-rose.html' });
  V.assets.three = new URL('assets/three.module.min.js', document.baseURI).href;
  V.assets.v3d = new URL('assets/veloura-3d.js', document.baseURI).href;
  V.settings.predictiveSearch = false;
  var items = [];
  try { items = JSON.parse(sessionStorage.getItem('vl-preview-cart') || '[]'); } catch (e) {}
  function save() { try { sessionStorage.setItem('vl-preview-cart', JSON.stringify(items)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(c) { return '$' + (c / 100).toFixed(2); }
  function count() { return items.reduce(function (a, i) { return a + i.quantity; }, 0); }
  function info(id) {
    var input = document.querySelector('input[name="id"][value="' + id + '"]');
    var scope = input && (input.closest('.card') || input.closest('[data-product]') || input.closest('.discovery__product'));
    scope = scope || document;
    var img = scope.querySelector('img');
    var title = scope.querySelector('.card__title, .product__title, .discovery__product-title');
    var vendor = scope.querySelector('.card__vendor, .product__vendor');
    var price = scope.querySelector('.price--sale') || scope.querySelector('.price');
    var cents = price ? Math.round(parseFloat(price.textContent.replace(/[^0-9.]/g, '').slice(0, 8)) * 100) : 0;
    return { id: id, title: title ? title.textContent.trim() : 'Fragrance', vendor: vendor ? vendor.textContent.trim() : '', image: img ? (img.currentSrc || img.src) : '', price: cents };
  }
  function drawer() {
    var n = count(), total = items.reduce(function (a, i) { return a + i.price * i.quantity; }, 0);
    var head = '<div class="drawer__head"><h2>Your bag' + (n ? ' <span class="muted">(' + n + ')</span>' : '') + '</h2><button class="icon-btn drawer__close" type="button" data-close-drawer aria-label="Close"><svg class="icon" width="24" height="24" aria-hidden="true"><use href="#i-close"></use></svg></button></div>';
    if (!n) return '<div class="drawer__panel" data-cart-drawer-inner>' + head + '<div class="drawer__body empty-state cart-drawer__empty"><p class="h3">Your bag is empty</p><p class="muted">Discover iconic scents in their most irresistible sizes.</p><div class="cart-drawer__worlds"><a class="btn btn--primary" href="collection-noir.html">Veloura Noir</a><a class="btn btn--outline" href="collection-rose.html">Veloura Rosé</a></div></div></div>';
    var lines = items.map(function (i, k) {
      return '<li class="cart-line" data-cart-line="' + (k + 1) + '" data-key="' + i.id + '"><span class="cart-line__media">' + (i.image ? '<img src="' + esc(i.image) + '" alt="">' : '') + '</span><div class="cart-line__info">' + (i.vendor ? '<span class="card__vendor">' + esc(i.vendor) + '</span>' : '') + '<span class="cart-line__title">' + esc(i.title) + '</span><div class="cart-line__row"><div class="qty qty--small"><button type="button" data-cart-qty-btn="minus" aria-label="Decrease quantity"><svg class="icon" width="24" height="24"><use href="#i-minus"></use></svg></button><input type="number" value="' + i.quantity + '" min="0" data-cart-qty aria-label="Quantity"><button type="button" data-cart-qty-btn="plus" aria-label="Increase quantity"><svg class="icon" width="24" height="24"><use href="#i-plus"></use></svg></button></div><div class="cart-line__price"><span>' + money(i.price * i.quantity) + '</span></div></div><a class="cart-line__remove link-underline" href="#" data-cart-remove>Remove</a></div></li>';
    }).join('');
    return '<div class="drawer__panel" data-cart-drawer-inner>' + head + '<div class="drawer__body"><ul class="cart-lines" role="list">' + lines + '</ul></div><div class="drawer__foot"><p class="cart-total__row cart-total__row--main"><span>Subtotal</span><span>' + money(total) + ' CAD</span></p><p class="muted cart-total__note">Preview only. On your store this button opens Shopify\'s secure checkout.</p><button class="btn btn--primary btn--full" type="button" aria-disabled="true">Secure checkout</button></div></div>';
  }
  function cartJSON() { return { item_count: count(), items: items.map(function (i) { return { key: String(i.id), quantity: i.quantity }; }) }; }
  function reply(obj) { return Promise.resolve(new Response(JSON.stringify(obj), { status: 200, headers: { 'Content-Type': 'application/json' } })); }
  var realFetch = window.fetch.bind(window);
  window.fetch = function (url, opts) {
    var u = String(url);
    var body = {}; try { body = JSON.parse((opts && opts.body) || '{}'); } catch (e) {}
    if (u.indexOf('/cart/add.js') === 0) {
      (body.items || []).forEach(function (it) {
        var ex = items.find(function (x) { return String(x.id) === String(it.id); });
        if (ex) ex.quantity += it.quantity || 1; else { var p = info(it.id); p.quantity = it.quantity || 1; items.push(p); }
      });
      save();
      return reply({ items: body.items, sections: { 'cart-drawer': drawer() } });
    }
    if (u.indexOf('/cart/change.js') === 0) {
      var i = items[body.line - 1];
      if (i) { if (body.quantity > 0) i.quantity = body.quantity; else items.splice(body.line - 1, 1); }
      save();
      var c = cartJSON(); c.sections = { 'cart-drawer': drawer() };
      return reply(c);
    }
    if (u.indexOf('/cart.js') === 0) return reply(cartJSON());
    if (u.indexOf('/cart/update.js') === 0) return reply(cartJSON());
    if (u.indexOf('/recommendations/products') === 0) {
      var rec = document.querySelector('[data-recommendations]');
      return Promise.resolve(new Response('<div>' + (rec ? rec.outerHTML : '') + '</div>', { status: 200 }));
    }
    return realFetch(url, opts);
  };
  document.addEventListener('DOMContentLoaded', function () {
    var inner = document.querySelector('[data-cart-drawer-inner]');
    if (inner && items.length) inner.outerHTML = drawer();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { var n = count(); el.textContent = n || ''; el.dataset.count = n; });
  });
  /* Remove links in the simulated drawer */
  document.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-cart-remove]');
    if (rm && rm.closest('[data-cart-drawer-inner]')) e.preventDefault();
  }, true);
})();
</script>
"""

def rewrite(html, page):
    html = html.replace('/veloura-theme/assets/', 'assets/').replace('/demo-content/product-images/', 'demo/')
    # texture custom properties are consumed inside assets/*.css, so they resolve relative to that folder
    html = html.replace('url(assets/veloura-texture', 'url(../assets/veloura-texture')
    links = {'#collection-noir': 'collection-noir.html', '#collection-rose': 'collection-rose.html', '#all': 'collection-noir.html',
             '#vendor-': 'collection-noir.html#', '#cart': '#', '#account': '#', '#search': '#'}
    html = re.sub(r'href="#product-\d+"', 'href="product.html"', html)
    for a, b in links.items():
        html = html.replace(f'href="{a}"', f'href="{b}"')
    html = re.sub(r'href="#vendor-[^"]*"', 'href="collection-noir.html"', html)
    root = './' if page != 'index.html' else '#'
    html = html.replace('href="#" class="header__logo"', f'href="{"./" if page != "index.html" else "#top"}" class="header__logo"')
    html = re.sub(r'(<a href=")#("[^>]*>\s*<svg class="icon icon--home)', r'\1./\2', html)
    # inject mock right after the window.Veloura config script
    marker = '<script src="assets/veloura.js" defer></script>'
    assert marker in html, page
    html = html.replace(marker, MOCK + marker)
    return html

for name, kind in PAGES.items():
    html = open(os.path.join(src, name), encoding='utf-8').read()
    html = rewrite(html, name)
    if name == 'index.html':
        # The artifact host wraps the main page in its own document skeleton:
        # keep head + body contents and re-apply the <html>/<body> attributes by script.
        m = re.search(r'<html([^>]*)>', html)
        attrs = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
        head = re.search(r'<head>([\s\S]*?)</head>', html).group(1)
        body_m = re.search(r'<body([^>]*)>([\s\S]*?)</body>', html)
        body_cls = re.search(r'class="([^"]*)"', body_m.group(1)).group(1)
        head = re.sub(r'<meta charset[^>]*>|<meta name="viewport"[^>]*>|<meta http-equiv[^>]*>', '', head)
        head = re.sub(r'<title>[\s\S]*?</title>', '', head)
        boot = '<script>(function(){var d=document.documentElement;' + ''.join(
            f'd.setAttribute({k!r},{v!r});' for k, v in attrs.items() if k not in ('class', 'lang')) + \
            "d.lang='en';d.className='js';document.addEventListener('DOMContentLoaded',function(){document.body.className=" + repr(body_cls) + "+' has-tabbar';document.body.id='top';});})();</script>"
        out = '<title>Veloura Storefront</title>\n' + boot + head + '\n' + body_m.group(2)
        open(os.path.join(dst, 'index.html'), 'w', encoding='utf-8').write(out)
    else:
        open(os.path.join(dst, name), 'w', encoding='utf-8').write(html)
    print('built', name)
