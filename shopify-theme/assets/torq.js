/* TORQ theme script. Runs after three.js and GSAP (all loaded with defer). */
(() => {
  const $ = id => document.getElementById(id);
  const T = window.TORQ || { routes: { cart: "/cart", cartAdd: "/cart/add", cartChange: "/cart/change", allProducts: "/collections/all" } };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flatCan = '<svg viewBox="0 0 200 400" aria-hidden="true"><use href="#can-flat"/></svg>';
  const img = (src, alt) => src ? `<img src="${src}" alt="${alt}">` : flatCan;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtMoney = cents => { try { return new Intl.NumberFormat(T.locale || undefined, { style: "currency", currency: T.currency || "USD" }).format(cents / 100); } catch (e) { return "$" + (cents / 100).toFixed(2); } };
  const handleize = s => String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  /* ---------- Flavors ---------- */
  const FLAVORS = [
    { id: "blood", name: "Blood orange + yuzu", short: "Blood Orange", tag: "The original",
      vars: { orange: "#FF4A14", "orange-2": "#FF7A3D", yuzu: "#F7DC1E", blood: "#240703", "blood-2": "#36100A", "blood-3": "#4A1A12", ink: "#1C0502", "ink-soft": "#5A1F10", "peel-soft": "#E3C3B3", "hero-hi": "#FF8A4C", "hero-lo": "#C92A06", "alt-hi": "#FFF07A", "alt2-hi": "#6A2316" },
      label: { top: "#FF5A1E", bot: "#F23D0A", band: "#F7DC1E", ink: "#1C0502" },
      fruits: ["blood", "yuzu", "leaf"], taste: [8, 7, 4, 3], tasteTitle: "Tart first. Sweet last.",
      notes: ["Yuzu peel", "Blood orange", "Pink grapefruit", "White tea", "Dry finish"],
      desc: "Tart, bright and lightly sparkling.", juiceTitle: "Yuzu + blood orange",
      juice: "Kōchi yuzu and Sicilian blood orange. Tart, floral, a little bitter at the finish.",
      ingr: "yuzu juice concentrate, blood orange juice concentrate" },
    { id: "hibiscus", name: "Hibiscus + raspberry", short: "Hibiscus", tag: "New",
      vars: { orange: "#FF3D8B", "orange-2": "#FF7AB0", yuzu: "#FFC2DA", blood: "#25040F", "blood-2": "#3A0A1C", "blood-3": "#541529", ink: "#22020D", "ink-soft": "#6B1033", "peel-soft": "#EBC1D0", "hero-hi": "#FF8CBC", "hero-lo": "#C2125A", "alt-hi": "#FFE6F0", "alt2-hi": "#6B1838" },
      label: { top: "#FF4D94", bot: "#E8236F", band: "#FFC2DA", ink: "#22020D" },
      fruits: ["hibiscus", "raspberry", "leaf"], taste: [7, 7, 2, 5], tasteTitle: "Juicy first. Floral last.",
      notes: ["Raspberry", "Hibiscus tea", "Rose hip", "Red currant", "Juicy finish"],
      desc: "Juicy, floral and a little tart.", juiceTitle: "Hibiscus + raspberry",
      juice: "Raspberry juice and cold-steeped Egyptian hibiscus. Bright berry up front, floral tea at the finish.",
      ingr: "raspberry juice concentrate, hibiscus flower extract" },
    { id: "lime", name: "Lime + matcha", short: "Lime Matcha", tag: "New",
      vars: { orange: "#45D96A", "orange-2": "#7FEA95", yuzu: "#E6FF6B", blood: "#04170B", "blood-2": "#0A2715", "blood-3": "#173B21", ink: "#04190C", "ink-soft": "#165A2A", "peel-soft": "#BFE3C6", "hero-hi": "#8CF2A3", "hero-lo": "#179A3B", "alt-hi": "#F4FFC2", "alt2-hi": "#134D27" },
      label: { top: "#52E173", bot: "#22B84A", band: "#E6FF6B", ink: "#04190C" },
      fruits: ["lime", "leaf", "lime"], taste: [9, 8, 3, 2], tasteTitle: "Zesty first. Grassy last.",
      notes: ["Key lime", "Ceremonial matcha", "Cucumber", "Mint", "Grassy finish"],
      desc: "Zesty, grassy and very crisp.", juiceTitle: "Lime + matcha",
      juice: "Mexican key lime and stone-ground Uji matcha. Sharp citrus with a smooth, green finish.",
      ingr: "lime juice concentrate, matcha green tea powder" },
    { id: "currant", name: "Blackcurrant + violet", short: "Blackcurrant", tag: "Limited",
      vars: { orange: "#A980FF", "orange-2": "#C6A8FF", yuzu: "#F3B6FF", blood: "#120826", "blood-2": "#1F1140", "blood-3": "#2F1C58", ink: "#0E0420", "ink-soft": "#3D2373", "peel-soft": "#CFC2EA", "hero-hi": "#CDB4FF", "hero-lo": "#6A3FD6", "alt-hi": "#FBE3FF", "alt2-hi": "#2F1C58" },
      label: { top: "#B08AFF", bot: "#8458F0", band: "#F3B6FF", ink: "#0E0420" },
      fruits: ["currant", "violet", "leaf"], taste: [6, 6, 3, 5], tasteTitle: "Dark fruit. Soft floral.",
      notes: ["Blackcurrant", "Violet", "Blueberry", "Black tea", "Jammy finish"],
      desc: "Dark, jammy and softly floral.", juiceTitle: "Blackcurrant + violet",
      juice: "British blackcurrant and a drop of violet. Deep berry, gentle perfume, dry finish.",
      ingr: "blackcurrant juice concentrate, violet flower extract" },
    { id: "pineapple", name: "Pineapple + chili", short: "Pineapple Chili", tag: "New · spicy",
      vars: { orange: "#FFC21A", "orange-2": "#FFD866", yuzu: "#FF5A36", blood: "#1F1000", "blood-2": "#301A04", "blood-3": "#4A2B0B", ink: "#1F0D00", "ink-soft": "#6B4300", "peel-soft": "#EBD7B5", "hero-hi": "#FFE07A", "hero-lo": "#E08A00", "alt-hi": "#FFB7A3", "alt2-hi": "#4A2B0B" },
      label: { top: "#FFCB2E", bot: "#F5AE00", band: "#FF5A36", ink: "#1F0D00" },
      fruits: ["pineapple", "chili", "leaf"], taste: [6, 7, 1, 6], tasteTitle: "Sweet first. Heat last.",
      notes: ["Roasted pineapple", "Chili heat", "Lime zest", "Agave", "Warm finish"],
      desc: "Tropical, juicy, with a slow chili kick.", juiceTitle: "Pineapple + chili",
      juice: "Golden pineapple with a pinch of árbol chili. Sweet up front, gentle heat that builds.",
      ingr: "pineapple juice concentrate, chili pepper extract" }
  ];
  const byId = id => FLAVORS.find(f => f.id === id) || FLAVORS[0];
  // Match a Shopify option value such as "Lime + Matcha" to a flavor palette
  const KEYS = { blood: ["blood", "orange", "yuzu"], hibiscus: ["hibiscus", "raspberry"], lime: ["lime", "matcha"], currant: ["currant", "violet"], pineapple: ["pineapple", "chili", "chilli"] };
  const flavorForValue = v => { const h = handleize(v); return FLAVORS.find(f => KEYS[f.id].some(k => h.includes(k))) || null; };
  let flavor = FLAVORS[0];
  try { flavor = byId(localStorage.getItem("torq-flavor")); } catch (e) {}

  // Fruit illustrations, one or two per flavor, built as SVG symbols
  // Fruit illustrations, one or two per flavor, built as SVG symbols
  (() => {
    const segs = (a, b) => [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const t0 = i * Math.PI / 4 - Math.PI / 2, t1 = t0 + Math.PI / 4; const p = t => `${(100 + 80 * Math.cos(t)).toFixed(1)} ${(100 + 80 * Math.sin(t)).toFixed(1)}`; return `<path d="M100 100 L${p(t0)} A80 80 0 0 1 ${p(t1)} Z" fill="${i % 2 ? b : a}"/>`; }).join("");
    const citrus = (id, rind, pith, a, b) => `<symbol id="fr-${id}" viewBox="0 0 200 200"><circle cx="100" cy="100" r="98" fill="${rind}"/><circle cx="100" cy="100" r="88" fill="${pith}"/>${segs(a, b)}<g stroke="${pith}" stroke-width="5"><path d="M100 18V182M18 100H182M42 42L158 158M158 42L42 158"/></g><circle cx="100" cy="100" r="9" fill="${pith}"/></symbol>`;
    const petals = (id, petal, deep, center) => `<symbol id="fr-${id}" viewBox="0 0 200 200">${[0, 72, 144, 216, 288].map(r => `<ellipse cx="100" cy="52" rx="38" ry="52" fill="${petal}" transform="rotate(${r} 100 100)"/><ellipse cx="100" cy="70" rx="14" ry="34" fill="${deep}" opacity=".35" transform="rotate(${r} 100 100)"/>`).join("")}<circle cx="100" cy="100" r="24" fill="${deep}"/><circle cx="100" cy="100" r="10" fill="${center}"/></symbol>`;
    const rasp = `<symbol id="fr-raspberry" viewBox="0 0 200 200"><path d="M70 40 L100 58 L130 40 L118 66 L82 66 Z" fill="#3E7A2C"/>${[[100,80],[78,92],[122,92],[64,116],[100,108],[136,116],[78,134],[122,134],[100,140],[90,160],[110,160]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="21" fill="#D61F4A"/><circle cx="${x - 6}" cy="${y - 7}" r="6" fill="#FF7A9A"/>`).join("")}</symbol>`;
    const currant = `<symbol id="fr-currant" viewBox="0 0 200 200"><path d="M100 20 C104 50 90 70 66 92 M100 20 C110 60 130 80 140 96 M100 20 C100 70 100 100 104 126" stroke="#3E7A2C" stroke-width="5" fill="none"/>${[[64,110,34],[140,112,30],[104,146,38]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B0F52"/><circle cx="${x - r * .35}" cy="${y - r * .35}" r="${r * .3}" fill="#8C6BD9"/>`).join("")}</symbol>`;
    const pine = `<symbol id="fr-pineapple" viewBox="0 0 200 200"><circle cx="100" cy="100" r="98" fill="#B57A00"/><circle cx="100" cy="100" r="86" fill="#FFD23F"/>${Array.from({ length: 16 }, (_, i) => `<path d="M100 100 L${(100 + 84 * Math.cos(i * Math.PI / 8)).toFixed(1)} ${(100 + 84 * Math.sin(i * Math.PI / 8)).toFixed(1)}" stroke="#F5B400" stroke-width="4"/>`).join("")}${Array.from({ length: 16 }, (_, i) => `<circle cx="${(100 + 92 * Math.cos(i * Math.PI / 8)).toFixed(1)}" cy="${(100 + 92 * Math.sin(i * Math.PI / 8)).toFixed(1)}" r="4" fill="#5A3A00"/>`).join("")}<circle cx="100" cy="100" r="26" fill="#FFF0B0"/></symbol>`;
    const chili = `<symbol id="fr-chili" viewBox="0 0 200 200"><path d="M150 40 C120 40 120 60 110 80 C95 112 70 140 30 168 C80 172 132 140 150 92 C158 70 162 54 150 40 Z" fill="#E5251B"/><path d="M140 60 C128 86 112 116 84 140" stroke="#FF8A70" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M150 40 C150 28 160 20 172 18 L170 26 C162 28 158 34 158 44 Z" fill="#3E7A2C"/><path d="M136 44 C146 34 160 36 166 48 C156 46 146 46 136 44 Z" fill="#3E7A2C"/></symbol>`;
    const leafSym = `<symbol id="fr-leaf" viewBox="0 0 200 200"><use href="#leaf"/></symbol>`;
    const html = citrus("blood", "#E8540F", "#FFD9C4", "#B5121B", "#D42A1C") + citrus("yuzu", "#E9C80F", "#FFF6B8", "#F7DC1E", "#F2D20A") +
      citrus("lime", "#2F8F2E", "#E6F7C9", "#7BD957", "#9BE36F") + petals("hibiscus", "#F0307A", "#7A0A33", "#FFD23F") +
      petals("violet", "#8458F0", "#3D2373", "#F3E36A") + rasp + currant + pine + chili + leafSym;
    document.querySelector("svg defs").insertAdjacentHTML("beforeend", html);
  })();

  /* ---------- Product data ---------- */
  const readJSON = id => { try { const el = $(id); return el ? JSON.parse(el.textContent) : null; } catch (e) { return null; } };
  const PAGE_PRODUCT = readJSON("TorqProduct");
  const MAIN_PRODUCT = PAGE_PRODUCT || readJSON("TorqMainProduct");
  const optName = o => typeof o === "string" ? o : (o && o.name) || "";
  const flavorIndex = p => p ? p.options.findIndex(o => /flavou?r/i.test(optName(o))) : -1;
  const productFlavors = (() => {
    const i = flavorIndex(MAIN_PRODUCT);
    if (i < 0) return FLAVORS;
    const found = [];
    MAIN_PRODUCT.variants.forEach(v => { const f = flavorForValue(v.options[i]); if (f && !found.includes(f)) found.push(f); });
    return found.length ? FLAVORS.filter(f => found.includes(f)) : FLAVORS;
  })();
  if (!productFlavors.includes(flavor)) flavor = productFlavors[0];
  function variantForFlavor(p, f) {
    const i = flavorIndex(p); if (i < 0) return null;
    const matches = p.variants.filter(v => flavorForValue(v.options[i]) === f);
    return matches.find(v => v.available) || matches[0] || null;
  }
  function updateShopLinks() {
    if (!MAIN_PRODUCT) return;
    const v = variantForFlavor(MAIN_PRODUCT, flavor);
    const url = (MAIN_PRODUCT.url || ("/products/" + MAIN_PRODUCT.handle)) + (v ? "?variant=" + v.id : "");
    document.querySelectorAll("[data-shop-link]").forEach(a => { a.href = url; });
  }

  /* ---------- 3D can ---------- */
  const hasGL = !!window.THREE && (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl") || c.getContext("experimental-webgl")); } catch (e) { return false; } })();

  function drawLabel(f) {
    const L = f.label, W = 2048, H = 1024, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, L.top); grad.addColorStop(1, L.bot);
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.fillStyle = L.band;
    g.beginPath(); g.moveTo(0, 700); g.lineTo(W, 520); g.lineTo(W, 690); g.lineTo(0, 870); g.closePath(); g.fill();
    g.fillStyle = L.ink;
    g.beginPath(); g.moveTo(0, 870); g.lineTo(W, 690); g.lineTo(W, 712); g.lineTo(0, 892); g.closePath(); g.fill();
    g.fillRect(0, 0, W, 34); g.fillRect(0, H - 34, W, 34);
    g.fillStyle = L.band; g.fillRect(0, 34, W, 6); g.fillRect(0, H - 40, W, 6);
    g.save(); g.translate(W / 2, H / 2 + 10); g.rotate(-Math.PI / 2);
    g.font = '900 420px "Big Shoulders Display", "Arial Narrow", Impact, sans-serif';
    g.textAlign = "center"; g.textBaseline = "middle";
    const tw = g.measureText("TORQ").width; g.scale(Math.min(1, 860 / tw), 1);
    g.fillStyle = L.ink; g.fillText("TORQ", 0, 0);
    g.restore();
    g.fillStyle = L.ink; g.textAlign = "left"; g.textBaseline = "alphabetic";
    g.font = '600 30px "IBM Plex Mono", monospace';
    g.fillText(f.name.toUpperCase(), W / 2 + 190, 120);
    g.fillText("SPARKLING ENERGY", W / 2 + 190, 162);
    g.font = '900 120px "Big Shoulders Display", Impact, sans-serif';
    g.fillText("160MG", W / 2 + 190, 330);
    g.font = '700 30px "Barlow", Arial, sans-serif';
    g.fillText("NATURAL CAFFEINE", W / 2 + 194, 372);
    g.font = '900 120px "Big Shoulders Display", Impact, sans-serif';
    g.fillText("0G", W / 2 + 190, 520);
    g.font = '700 30px "Barlow", Arial, sans-serif';
    g.fillText("SUGAR · 10 CAL", W / 2 + 194, 562);
    g.textAlign = "right";
    g.font = '600 28px "IBM Plex Mono", monospace';
    g.fillText("12 FL OZ (355 mL)", W / 2 - 190, 120);
    g.fillText("+ L-THEANINE", W / 2 - 190, 160);
    g.fillText("+ ELECTROLYTES", W / 2 - 190, 200);
    g.textAlign = "left";
    g.font = '900 64px "Big Shoulders Display", Impact, sans-serif';
    g.fillText("CLEAN LIFT.", 90, 160); g.fillText("NO CRASH.", 90, 225);
    g.font = '500 24px "Barlow", Arial, sans-serif';
    const ing = ("Carbonated water, " + f.ingr + ", allulose, citric acid, natural caffeine (guayusa, green tea), L-theanine, sea salt, potassium citrate, natural flavors, monk fruit, B6, B12.").split(" ");
    let line = "", y = 300;
    for (const w of ing) { if (g.measureText(line + w).width > 560) { g.fillText(line, 90, y); y += 34; line = ""; } line += w + " "; }
    g.fillText(line, 90, y);
    g.font = '600 22px "IBM Plex Mono", monospace';
    g.fillText("CONTAINS 160MG CAFFEINE PER CAN.", 90, y + 70);
    g.fillText("NOT FOR CHILDREN OR THOSE PREGNANT.", 90, y + 102);
    g.globalAlpha = .05; for (let i = 0; i < 4000; i++) { g.fillStyle = i % 2 ? "#fff" : "#000"; g.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
    g.globalAlpha = 1;
    return c;
  }
  const labelCache = {};
  const labelFor = f => labelCache[f.id] || (labelCache[f.id] = drawLabel(f));

  function envMap(renderer) {
    const pm = new THREE.PMREMGenerator(renderer);
    const sc = new THREE.Scene();
    sc.background = new THREE.Color("#3a1208");
    const box = (col, w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); sc.add(m); };
    box(new THREE.Color(6, 5.6, 5.2), 6, 10, -8, 3, 4);
    box(new THREE.Color(4, 3.6, 1.2), 4, 12, 9, 1, -2);
    box(new THREE.Color(3.2, 1.2, .5), 12, 4, 0, -8, 0);
    box(new THREE.Color(2.4, 2.4, 2.6), 10, 3, 0, 9, 2);
    const tex = pm.fromScene(sc, 0.03).texture; pm.dispose();
    return tex;
  }

  function buildCan(labelTex) {
    const group = new THREE.Group();
    const silver = new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 1, roughness: .22 });
    const darkSilver = new THREE.MeshStandardMaterial({ color: 0xb8bec6, metalness: 1, roughness: .32 });
    const label = new THREE.MeshStandardMaterial({ map: labelTex, metalness: .45, roughness: .28 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3.2, 128, 1, true, -Math.PI, Math.PI * 2), label);
    group.add(body); group.userData.label = label;
    const top = [[1, 1.6], [.995, 1.66], [.95, 1.76], [.89, 1.86], [.885, 1.9], [.9, 1.935], [.89, 1.955], [.86, 1.95], [.845, 1.915]].map(p => new THREE.Vector2(p[0], p[1]));
    group.add(new THREE.Mesh(new THREE.LatheGeometry(top, 128), silver));
    const lid = new THREE.Mesh(new THREE.CircleGeometry(.85, 96), darkSilver); lid.rotation.x = -Math.PI / 2; lid.position.y = 1.905; group.add(lid);
    const bot = [[.8, -1.9], [.9, -1.86], [.96, -1.76], [.995, -1.66], [1, -1.6]].map(p => new THREE.Vector2(p[0], p[1]));
    group.add(new THREE.Mesh(new THREE.LatheGeometry(bot, 128), silver));
    const base = new THREE.Mesh(new THREE.CircleGeometry(.8, 64), darkSilver); base.rotation.x = Math.PI / 2; base.position.y = -1.9; group.add(base);
    // pull tab
    const tabShape = new THREE.Shape(); tabShape.absarc(0, 0, .2, 0, Math.PI * 2, false);
    const hole = new THREE.Path(); hole.absarc(0, .03, .11, 0, Math.PI * 2, true); tabShape.holes.push(hole);
    const tab = new THREE.Mesh(new THREE.ExtrudeGeometry(tabShape, { depth: .02, bevelEnabled: false }), silver);
    tab.rotation.x = -Math.PI / 2; tab.position.set(0, 1.92, .28); tab.scale.set(1, 1.5, 1); group.add(tab);
    const rivet = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .03, 24), silver); rivet.position.set(0, 1.925, .05); group.add(rivet);
    const mouth = new THREE.Mesh(new THREE.CircleGeometry(.2, 32), new THREE.MeshStandardMaterial({ color: 0x8b9199, metalness: 1, roughness: .5 }));
    mouth.rotation.x = -Math.PI / 2; mouth.position.set(0, 1.908, -.42); mouth.scale.set(1.4, .8, 1); group.add(mouth);
    return group;
  }

  class CanStage {
    constructor(el, opts = {}) {
      this.el = el; this.opts = opts;
      const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!opts.snap });
      r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
      this.scene = new THREE.Scene();
      this.scene.environment = envMap(r);
      this.can = buildCan(this.makeTex(labelFor(flavor)));
      this.pivot = new THREE.Group(); this.pivot.add(this.can); this.scene.add(this.pivot);
      this.camera = new THREE.PerspectiveCamera(opts.fov || 26, 1, .1, 100);
      this.camera.position.set(0, .25, opts.dist || 11);
      this.camera.lookAt(0, opts.lookY || 0, 0);
      const key = new THREE.DirectionalLight(0xfff1e0, 1.4); key.position.set(-4, 5, 6); this.scene.add(key);
      const rim1 = new THREE.DirectionalLight(0xffd45a, 1.6); rim1.position.set(6, 2, -4); this.scene.add(rim1);
      const rim2 = new THREE.DirectionalLight(0xff6a2a, 1.2); rim2.position.set(-6, -1, -5); this.scene.add(rim2);
      this.scene.add(new THREE.AmbientLight(0xffffff, .25));
      this.rotY = opts.startY || 0; this.vel = 0; this.target = null;
      this.tiltX = 0; this.tiltZ = opts.tiltZ ?? -.2; this.mx = 0; this.my = 0;
      this.pivot.rotation.z = this.tiltZ;
      if (opts.yOffset) this.pivot.position.y = opts.yOffset;
      if (el) {
        el.appendChild(r.domElement);
        r.domElement.setAttribute("aria-hidden", "true");
        this.resize(); new ResizeObserver(() => this.resize()).observe(el);
        this.visible = true;
        new IntersectionObserver(es => { this.visible = es[0].isIntersecting; }).observe(el);
        if (opts.drag) this.bindDrag();
      }
    }
    makeTex(canvas) {
      const t = new THREE.CanvasTexture(canvas);
      t.encoding = THREE.sRGBEncoding; t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      return t;
    }
    setLabel(canvas, spin) {
      const m = this.can.userData.label, old = m.map;
      m.map = this.makeTex(canvas); m.needsUpdate = true; old && old.dispose();
      if (spin && !reduced && this.target === null) this.vel = .5;
    }
    resize() {
      const w = this.el.clientWidth, h = this.el.clientHeight; if (!w || !h) return;
      this.renderer.setSize(w, h, false); this.camera.aspect = w / h;
      const fit = Math.max(1, (this.opts.minAspect || .62) / (w / h));
      this.camera.position.z = (this.opts.dist || 11) * fit;
      this.camera.updateProjectionMatrix();
      if (this.opts.wideX) this.pivot.position.x = w / h > 1.25 ? this.opts.wideX : 0;
    }
    bindDrag() {
      const c = this.renderer.domElement; let down = false, lx = 0, lt = 0;
      c.addEventListener("pointerdown", e => { down = true; lx = e.clientX; lt = performance.now(); this.vel = 0; c.setPointerCapture(e.pointerId); });
      c.addEventListener("pointermove", e => {
        if (!down) return; const dx = e.clientX - lx; const now = performance.now();
        this.rotY += dx * .012; this.vel = dx * .012 / Math.max(1, now - lt) * 16; lx = e.clientX; lt = now;
      });
      const up = () => { down = false; }; c.addEventListener("pointerup", up); c.addEventListener("pointercancel", up);
      this.dragging = () => down;
    }
    step(t) {
      if (this.target !== null) { this.rotY += (this.target - this.rotY) * .12; }
      else if (!(this.dragging && this.dragging())) {
        this.rotY += this.vel; this.vel *= .95;
        if (Math.abs(this.vel) < .002 && !reduced) this.rotY += this.opts.spin ?? .004;
      }
      this.can.rotation.y = this.rotY;
      this.tiltX += (this.my * .12 - this.tiltX) * .06;
      this.pivot.rotation.x = this.tiltX;
      this.pivot.rotation.z = this.tiltZ + this.mx * -.06;
      if (!reduced && this.opts.bob) this.pivot.position.y = (this.opts.yOffset || 0) + Math.sin(t / 900) * .08;
      this.renderer.render(this.scene, this.camera);
    }
    snapshot(rotY, tiltZ, w = 520, h = 820) {
      this.renderer.setPixelRatio(1); this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h; this.camera.position.z = 10.6; this.camera.updateProjectionMatrix();
      this.can.rotation.y = rotY; this.pivot.rotation.set(0, 0, tiltZ);
      this.renderer.render(this.scene, this.camera);
      return this.renderer.domElement.toDataURL("image/png");
    }
  }


  const STAGE_PRESETS = {
    hero: { drag: true, bob: true, tiltZ: -.22, dist: 12.5, yOffset: .15, minAspect: .55, spin: .005, wideX: 1.25 },
    anatomy: { tiltZ: .08, dist: 11, spin: .006, minAspect: .5 },
    product: { drag: true, tiltZ: -.1, dist: 10.6, spin: .004, minAspect: .6, bob: true }
  };
  const stages = [];
  let snapper = null, anatStage = null;
  const fronts = {};
  async function init3D() {
    const els = [...document.querySelectorAll("[data-can-stage]")];
    if (!hasGL) {
      els.forEach(el => { el.innerHTML = '<div class="fallback">' + flatCan + "</div>"; });
      return;
    }
    try {
      await Promise.race([
        Promise.all(['900 120px "Big Shoulders Display"', '600 30px "IBM Plex Mono"', '700 30px "Barlow"'].map(f => document.fonts.load(f))),
        new Promise(r => setTimeout(r, 2500))
      ]);
    } catch (e) {}
    els.forEach(el => {
      const st = new CanStage(el, STAGE_PRESETS[el.dataset.canStage] || STAGE_PRESETS.product);
      stages.push(st);
      if (el.dataset.canStage === "anatomy") anatStage = st;
      if (el.dataset.canStage === "hero") heroStage = st;
    });
    if (document.querySelector("#lineup, .cans-row, #drawer")) {
      snapper = new CanStage(null, { snap: true });
      productFlavors.forEach(f => { snapper.setLabel(labelFor(f)); fronts[f.id] = snapper.snapshot(-.25, -.06); });
    }
    addEventListener("pointermove", e => {
      const mx = e.clientX / innerWidth * 2 - 1, my = e.clientY / innerHeight * 2 - 1;
      stages.forEach(s => { if (s.opts.drag) { s.mx = mx; s.my = my; } });
      if (!reduced) document.querySelectorAll(".hero .slice").forEach(s => { const d = +s.dataset.depth; s.style.translate = `${mx * d}px ${my * d}px`; });
    }, { passive: true });
    const loop = t => { for (const s of stages) if (s.visible && s.el.offsetParent !== null) s.step(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  let heroStage = null;

  /* ---------- Flavor switching ---------- */
  function renderSwatches() {
    document.querySelectorAll("[data-swatches]").forEach(box => {
      box.innerHTML = productFlavors.map(f => `<button type="button" class="swatch" data-pick="${f.id}" aria-pressed="${f === flavor}" aria-label="${esc(f.name)}" title="${esc(f.name)}" style="--a:${f.vars.orange};--b:${f.vars.yuzu}"><i></i></button>`).join("");
    });
  }
  function renderLineup() {
    const el = $("lineup"); if (!el) return;
    el.innerHTML = productFlavors.map(f => `<button type="button" class="fl-card" data-pick="${f.id}" aria-pressed="${f === flavor}" style="--c1:${f.vars.orange};--c3:${f.vars["hero-hi"]};--ck:${f.vars.ink}">
      <span class="tag">${esc(f.tag)}</span><span class="can">${img(fronts[f.id], "")}</span>
      <b>${esc(f.name)}</b><small>${f.notes.slice(0, 3).map(esc).join(" · ")}</small><span class="pick">${f === flavor ? "Selected" : "Select"}</span></button>`).join("");
  }
  function renderCansRow() {
    const row = document.querySelector(".cans-row"); if (!row) return;
    const list = productFlavors, i = Math.max(0, list.indexOf(flavor));
    const at = k => list[(i + k + list.length) % list.length].id;
    row.innerHTML = [fronts[at(-1)], fronts[flavor.id], fronts[at(1)]].map(s => img(s, "")).join("");
  }
  function applyFlavor(id, spin, fromProduct) {
    flavor = byId(id);
    const root = document.documentElement.style;
    Object.entries(flavor.vars).forEach(([k, v]) => root.setProperty("--" + k, v));
    document.querySelectorAll("[data-fl]").forEach(el => { el.textContent = flavor[el.dataset.fl]; });
    document.querySelectorAll("[data-fruit]").forEach(u => u.setAttribute("href", "#fr-" + flavor.fruits[+u.dataset.fruit]));
    document.querySelectorAll("#bars .bar-row").forEach((row, i) => { const v = flavor.taste[i]; row.querySelector("i").style.setProperty("--v", v * 10 + "%"); row.querySelector(".mono").textContent = v + "/10"; });
    const notes = $("notes"); if (notes) notes.innerHTML = flavor.notes.map(n => `<span>${esc(n)}</span>`).join("");
    renderSwatches(); renderLineup(); renderCansRow(); updateShopLinks();
    stages.forEach(st => st.setLabel(labelFor(flavor), spin));
    try { localStorage.setItem("torq-flavor", flavor.id); } catch (e) {}
    if (!fromProduct && productForm) productForm.selectFlavor(flavor);
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-pick]"); if (!b || b.dataset.pick === flavor.id) return;
    const box = b.closest("[data-swatches]") || $("lineup");
    applyFlavor(b.dataset.pick, true);
    box && box.querySelector(`[data-pick="${flavor.id}"]`)?.focus({ preventScroll: true });
  });

  /* ---------- Header ---------- */
  const hdr = $("hdr");
  function setHeader() {
    if (!hdr) return;
    const onHero = T.template === "index" && scrollY < innerHeight * .6;
    hdr.classList.toggle("dark", !onHero);
    document.documentElement.style.setProperty("--hdr", onHero ? "var(--orange)" : "var(--blood)");
  }
  addEventListener("scroll", setHeader, { passive: true });
  setHeader();
  const menuBtn = $("menuBtn");
  if (menuBtn) menuBtn.onclick = () => { const o = $("nav").classList.toggle("open"); menuBtn.setAttribute("aria-expanded", o); };

  /* ---------- Toast ---------- */
  let toastT;
  function toast(m) { const t = $("toast"); if (!t) return; t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2800); }

  /* ---------- Cart (Shopify AJAX API) ---------- */
  const jsonFetch = async (url, body) => {
    const r = await fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) } : { headers: { Accept: "application/json" } });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.description || d.message || "Something went wrong. Please try again.");
    return d;
  };
  const Cart = {
    get: () => jsonFetch(T.routes.cart + ".js"),
    add: items => jsonFetch(T.routes.cartAdd + ".js", { items }),
    change: (key, quantity) => jsonFetch(T.routes.cartChange + ".js", { id: key, quantity })
  };
  const drawer = $("drawer"), scrim = $("scrim");
  let lastFocus;
  function openCart() {
    if (!drawer) return;
    lastFocus = document.activeElement; drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); scrim.hidden = false; $("closeCart").focus();
  }
  function closeCart() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); scrim.hidden = true; lastFocus && lastFocus.focus(); }
  function itemFlavor(item) {
    const opt = (item.options_with_values || []).find(o => /flavou?r/i.test(o.name));
    return flavorForValue(opt ? opt.value : (item.variant_title || "")) || null;
  }
  function renderCart(cart) {
    const lines = $("lines"); if (!lines) return;
    $("cartCount").textContent = cart.item_count;
    $("openCart").setAttribute("aria-label", `Open cart, ${cart.item_count} item${cart.item_count === 1 ? "" : "s"}`);
    if (!cart.items.length) {
      lines.innerHTML = `<div class="empty"><p>Your cart is empty.</p><a class="btn btn-orange" href="${esc(MAIN_PRODUCT ? MAIN_PRODUCT.url || "/products/" + MAIN_PRODUCT.handle : T.routes.allProducts)}">Shop TORQ</a></div>`;
    } else {
      lines.innerHTML = cart.items.map(it => {
        const f = itemFlavor(it);
        const thumb = it.image ? `<img src="${esc(it.image)}" alt="">` : img(f && fronts[f.id], "");
        const plan = it.selling_plan_allocation && it.selling_plan_allocation.selling_plan ? it.selling_plan_allocation.selling_plan.name : "";
        const variant = it.product_has_only_default_variant ? "" : it.variant_title;
        return `<div class="line"><div class="th" style="background:${f ? f.vars.orange : "var(--orange)"}">${thumb}</div>
          <b>${esc(it.product_title)}</b><span class="lp">${fmtMoney(it.final_line_price)}</span>
          <span class="meta">${esc([variant, plan].filter(Boolean).join(" · "))}</span>
          <span class="qty-mini"><button type="button" data-key="${esc(it.key)}" data-q="${it.quantity - 1}" aria-label="Decrease quantity of ${esc(it.product_title)}">−</button><span>${it.quantity}</span><button type="button" data-key="${esc(it.key)}" data-q="${it.quantity + 1}" aria-label="Increase quantity of ${esc(it.product_title)}">+</button></span>
          <button class="remove" type="button" data-key="${esc(it.key)}" data-q="0">Remove</button></div>`;
      }).join("");
    }
    $("subOut").textContent = fmtMoney(cart.total_price);
    const bar = $("shipBar"), msg = $("shipMsg"), free = +T.freeShip || 0;
    bar.hidden = msg.hidden = !free || !cart.items.length;
    if (free) {
      $("shipFill").style.width = Math.min(100, cart.total_price / free * 100) + "%";
      msg.textContent = cart.total_price >= free ? "Free shipping unlocked." : `Add ${fmtMoney(free - cart.total_price)} more for free shipping.`;
    }
    $("checkout").disabled = !cart.items.length;
  }
  const refreshCart = () => Cart.get().then(renderCart).catch(() => {});
  if (drawer) {
    $("openCart").addEventListener("click", e => { e.preventDefault(); openCart(); refreshCart(); });
    $("closeCart").onclick = closeCart; scrim.onclick = closeCart;
    document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) closeCart(); });
    $("lines").addEventListener("click", async e => {
      const b = e.target.closest("button[data-key]"); if (!b) return;
      b.disabled = true;
      try { renderCart(await Cart.change(b.dataset.key, Math.max(0, +b.dataset.q))); }
      catch (err) { $("checkoutNote").textContent = err.message; }
    });
    refreshCart();
  }

  /* ---------- Product form ---------- */
  const productForm = (() => {
    const form = document.querySelector("[data-product-form]");
    if (!form || !PAGE_PRODUCT) return null;
    const P = PAGE_PRODUCT, fIdx = flavorIndex(P);
    const groups = [...form.querySelectorAll("[data-option]")];
    const idInput = form.querySelector("[data-variant-id]");
    const planInput = form.querySelector("[data-selling-plan]");
    const qtyInput = form.querySelector(".qty-num");
    const priceEl = form.querySelector("[data-price]"), perEl = form.querySelector("[data-per]");
    const addBtn = form.querySelector("[data-add]"), errEl = form.querySelector("[data-error]");
    const packIdx = P.options.findIndex((o, i) => i !== fIdx && P.variants.some(v => /\d/.test(v.options[i] || "")));
    const packSize = s => { const m = String(s || "").match(/\d+/); return m ? +m[0] : 1; };
    if (fIdx < 0) form.querySelectorAll("h1 [data-fl]").forEach(el => el.remove());

    form.querySelectorAll(".swatch-opt input").forEach(inp => {
      const f = flavorForValue(inp.value), lab = inp.nextElementSibling;
      lab.style.setProperty("--a", f ? f.vars.orange : "#8a8a8a");
      lab.style.setProperty("--b", f ? f.vars.yuzu : "#d0d0d0");
    });
    const selected = () => groups.map(g => { const c = g.querySelector("input:checked"); return c ? c.value : undefined; });
    const findVariant = opts => P.variants.find(v => v.options.every((o, i) => o === opts[i]));
    const planId = () => { const c = form.querySelector("input[name=purchase_option]:checked"); return c ? c.value : ""; };
    const priceFor = (v, pid) => {
      if (pid) { const a = (v.selling_plan_allocations || []).find(x => String(x.selling_plan_id) === String(pid)); if (a) return { price: a.price, compare: a.compare_at_price && a.compare_at_price > a.price ? a.compare_at_price : v.price }; }
      return { price: v.price, compare: v.compare_at_price || 0 };
    };
    const qty = () => Math.max(1, Math.min(99, parseInt(qtyInput.value, 10) || 1));

    function update(fromFlavor) {
      const opts = selected(), v = findVariant(opts), pid = planId();
      groups.forEach((g, i) => { const l = g.querySelector("[data-option-label]"); if (l) l.textContent = opts[i] || ""; });
      groups.forEach((g, i) => g.querySelectorAll("input").forEach(inp => {
        const o = opts.slice(); o[i] = inp.value; const vv = findVariant(o);
        inp.disabled = !vv;
        if (i !== fIdx && inp.closest(".opt")) {
          const lab = inp.nextElementSibling, pr = lab.querySelector("[data-opt-price]"), per = lab.querySelector("[data-opt-per]");
          if (!pr) return;
          if (!vv) { pr.textContent = "Unavailable"; per.textContent = ""; return; }
          const { price } = priceFor(vv, pid), n = packSize(inp.value);
          pr.textContent = fmtMoney(price) + (vv.available ? "" : " · sold out");
          per.textContent = i === packIdx && n > 1 ? fmtMoney(Math.round(price / n)) + " / can" : "";
        }
      }));
      if (!v) { addBtn.disabled = true; addBtn.textContent = "Unavailable"; return; }
      form.querySelectorAll("[data-plan-price]").forEach(el => {
        const p = el.dataset.planPrice;
        if (!p) { el.textContent = fmtMoney(v.price); return; }
        const { price } = priceFor(v, p), pct = Math.round(100 - price / v.price * 100);
        el.textContent = fmtMoney(price) + (pct > 0 ? ` · save ${pct}%` : "");
      });
      idInput.value = v.id;
      if (planInput) planInput.value = pid;
      const { price, compare } = priceFor(v, pid), q = qty();
      priceEl.innerHTML = fmtMoney(price * q) + (compare > price ? `<s>${fmtMoney(compare * q)}</s>` : "");
      const n = packIdx >= 0 ? packSize(v.options[packIdx]) : 1;
      perEl.textContent = n > 1 ? `${fmtMoney(Math.round(price / n))} per can` : "";
      addBtn.disabled = !v.available;
      addBtn.textContent = v.available ? "Add to cart" : "Sold out";
      try { history.replaceState(history.state, "", `${location.pathname}?variant=${v.id}`); } catch (e) {}
      if (fIdx >= 0 && !fromFlavor) { const f = flavorForValue(v.options[fIdx]); if (f && f !== flavor) applyFlavor(f.id, true, true); }
    }
    function selectFlavor(f) {
      if (fIdx < 0) return;
      const g = groups[fIdx]; if (!g) return;
      const inp = [...g.querySelectorAll("input")].find(x => flavorForValue(x.value) === f);
      if (inp && !inp.checked) { inp.checked = true; update(true); }
    }
    form.addEventListener("change", e => { if (e.target.matches("input[type=radio]")) update(); });
    qtyInput.addEventListener("input", () => update(true));
    form.querySelectorAll("[data-qty]").forEach(b => b.addEventListener("click", () => { qtyInput.value = Math.max(1, Math.min(99, qty() + +b.dataset.qty)); update(true); }));
    form.addEventListener("submit", async e => {
      e.preventDefault();
      errEl.hidden = true;
      const item = { id: +idInput.value, quantity: qty() };
      if (planInput && planInput.value) item.selling_plan = +planInput.value;
      addBtn.disabled = true; const label = addBtn.textContent; addBtn.textContent = "Adding…";
      try {
        await Cart.add([item]);
        const cart = await Cart.get(); renderCart(cart);
        const cb = $("openCart"); cb.classList.remove("bump"); void cb.offsetWidth; cb.classList.add("bump");
        toast("Added to cart"); openCart();
      } catch (err) { errEl.textContent = err.message; errEl.hidden = false; }
      addBtn.disabled = false; addBtn.textContent = label;
    });
    // Start on the shopper's last flavor unless the URL names a variant
    const params = new URLSearchParams(location.search);
    if (!params.has("variant") && fIdx >= 0) {
      const g = groups[fIdx], inp = g && [...g.querySelectorAll("input")].find(x => flavorForValue(x.value) === flavor);
      if (inp) inp.checked = true;
    }
    if (fIdx >= 0) { const c = groups[fIdx] && groups[fIdx].querySelector("input:checked"); const f = c && flavorForValue(c.value); if (f) flavor = f; }
    update(true);

    // Gallery: 3D view plus product photos
    const thumbs = $("thumbs"), photo = $("gPhoto"), stage = document.querySelector(".pdp-stage");
    if (thumbs) thumbs.addEventListener("click", e => {
      const b = e.target.closest("[data-thumb]"); if (!b) return;
      thumbs.querySelectorAll("[data-thumb]").forEach(x => x.setAttribute("aria-pressed", x === b));
      if (b.dataset.thumb === "3d") { photo.hidden = true; stage.hidden = false; }
      else { photo.src = b.dataset.thumb; photo.alt = b.dataset.alt || ""; photo.hidden = false; stage.hidden = true; }
    });
    return { selectFlavor };
  })();

  /* ---------- Calculator ---------- */
  if ($("calcIn")) {
  const MG = { torq: 160, coffee: 95, espresso: 63, tea: 47, cola: 34 };
  const counts = { torq: 1, coffee: 1, espresso: 0, tea: 0, cola: 0 };
  function calc() {
    const total = Object.keys(MG).reduce((s, k) => s + MG[k] * counts[k], 0);
    Object.keys(counts).forEach(k => document.querySelector(`[data-o="${k}"]`).textContent = counts[k]);
    $("calcTotal").textContent = total;
    $("calcBar").style.width = Math.min(100, total / 500 * 100) + "%";
    const v = $("calcVerdict");
    v.classList.toggle("warn", total > 400);
    v.textContent = total === 0 ? "Nothing yet. Add what you drink in a typical day." :
      total <= 200 ? `Light day. You have ${400 - total}mg of headroom.` :
      total <= 400 ? `Within FDA guidance, with ${400 - total}mg to spare.` :
      `That's ${total - 400}mg over 400. Drop a drink, or swap a coffee for water.`;
  }
  $("calcIn").addEventListener("click", e => {
    const b = e.target.closest("button[data-k]"); if (!b) return;
    counts[b.dataset.k] = Math.max(0, Math.min(8, counts[b.dataset.k] + +b.dataset.d)); calc();
  });
  const fmtH = h => { h = ((h % 24) + 24) % 24; const ap = h >= 12 ? "pm" : "am"; const hh = h % 12 || 12; return `${hh}:00 ${ap}`; };
  const cut = () => { $("cutoff").textContent = fmtH(+$("bed").value - 8); };
    $("bed").onchange = cut; calc(); cut();
  }

  /* ---------- Stockists ---------- */
  if ($("stores")) {
    const cards = [...document.querySelectorAll("#stores .store")];
    const cities = ["All", ...new Set(cards.map(c => c.dataset.city).filter(Boolean))];
    let city = "All";
    $("cities").innerHTML = cities.length > 2 ? cities.map(c => `<button type="button" aria-pressed="${c === "All"}" data-c="${esc(c)}">${esc(c)}</button>`).join("") : "";
    const filter = () => {
      const q = $("storeSearch").value.trim().toLowerCase(); let n = 0;
      cards.forEach(c => { const show = (city === "All" || c.dataset.city === city) && (!q || c.dataset.search.includes(q)); c.hidden = !show; if (show) n++; });
      $("noResults").hidden = n > 0;
      $("findCount").textContent = `Showing ${n} of ${cards.length} stockists`;
    };
    $("cities").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; city = b.dataset.c; $("cities").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); filter(); });
    $("storeSearch").addEventListener("input", filter);
    filter();
  }

  /* ---------- Motion ---------- */
  function setupMotion() {
    if (!window.gsap || reduced) return;
    if ($("heroWord")) {
      gsap.from("#heroWord span", { yPercent: 40, rotate: 4, duration: 1.1, stagger: .07, ease: "expo.out" });
      gsap.from(".hero-stage", { y: 80, duration: 1.4, ease: "expo.out" });
    }
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    if ($("heroWord") && document.querySelector(".hero-stage")) gsap.to("#heroWord", { yPercent: -30, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.utils.toArray(".reveal").forEach(el => gsap.from(el, { y: 60, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } }));
    const line = document.querySelector(".torq-line");
    if (line) { const L = line.getTotalLength(); gsap.fromTo(line, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: line.closest("svg"), start: "top 75%" } }); }
    if (document.querySelector(".bars")) gsap.from(".bar i", { scaleX: 0, transformOrigin: "left", duration: 1.2, stagger: .1, ease: "expo.out", scrollTrigger: { trigger: ".bars", start: "top 80%" } });
    if (!$("anatomy") || T.designMode) return;
    gsap.matchMedia().add("(min-width: 961px)", () => {
      const calls = [...document.querySelectorAll(".callout")], dots = [...document.querySelectorAll(".anat-progress i")], n = Math.max(1, calls.length);
      const st = ScrollTrigger.create({
        trigger: "#anatomy", start: "top top", end: "+=" + n * 300, pin: true, scrub: true,
        onUpdate: self => {
          const i = Math.min(n - 1, Math.floor(self.progress * n));
          calls.forEach((c, j) => c.classList.toggle("on", j === i)); dots.forEach((d, j) => d.classList.toggle("on", j <= i));
          if (anatStage) anatStage.target = self.progress * Math.PI * 2;
        },
        onLeave: () => { if (anatStage) anatStage.target = null; },
        onLeaveBack: () => { if (anatStage) anatStage.target = null; },
        onEnter: () => { if (anatStage) anatStage.target = anatStage.rotY; },
        onEnterBack: () => { if (anatStage) anatStage.target = anatStage.rotY; }
      });
      return () => st.kill();
    });
  }

  /* ---------- Boot ---------- */
  applyFlavor(flavor.id, false, true);
  init3D().then(() => { applyFlavor(flavor.id, false, true); setupMotion(); stages.forEach(s => s.resize()); });
})();
