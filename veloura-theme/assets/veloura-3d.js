/*!
 * VELOURA 3D — procedural miniature perfume bottles, podiums and scenes.
 * Loaded lazily (dynamic import) only when a [data-v3d] element approaches the viewport
 * and WebGL is available. Everything here is optional enhancement: every 3D element
 * has a static image / SVG fallback underneath it, so the store works without WebGL.
 *
 * Bottles are generic, label-free shapes. Real product photography / Shopify 3D model
 * media should be used for actual products.
 */

let THREE = null;

/* ------------------------------------------------------------------ palettes */
const PALETTES = {
  noir: {
    env: { base: 0x050506, panels: [0xfff1dc, 0xc9a873, 0x2a2c31] },
    key: 0xffe7c4, rim: 0xb99b6b, fill: 0x8a9099, ambient: 0x1a1a1f,
    podium: 'marble-noir', podiumRim: 0xb99b6b, floor: 0x0b0b0d,
    bottles: [
      { shape: 'round', cap: 'cylinder', glass: 0x9aa0aa, liquid: 0x9a6a34, metal: 'silver', capColor: 0x16171a },
      { shape: 'square', cap: 'block', glass: 0x5b5f68, liquid: 0x5a3615, metal: 'gold', capColor: 0x0d0d0f },
      { shape: 'faceted', cap: 'cylinder', glass: 0xb59a74, liquid: 0xb07a2e, metal: 'gold' },
    ],
  },
  rose: {
    env: { base: 0x2e0716, panels: [0xffffff, 0xffb3d1, 0xf05291] },
    key: 0xfff0f5, rim: 0xf05291, fill: 0xf3a6c5, ambient: 0x4a1028,
    podium: 'gloss-rose', podiumRim: 0xe8b4a0, floor: 0xf3a6c5,
    bottles: [
      { shape: 'round', cap: 'dome', glass: 0xffc9de, liquid: 0xf27aa8, metal: 'rosegold' },
      { shape: 'faceted', cap: 'gem', glass: 0xffb6d3, liquid: 0xe8327a, metal: 'rosegold', capColor: 0xff9cc4 },
      { shape: 'square', cap: 'cylinder', glass: 0xffd3e4, liquid: 0xf05291, metal: 'rosegold' },
    ],
  },
};

const METALS = {
  gold: { color: 0xd9b98a, roughness: 0.22 },
  silver: { color: 0xc9cbcf, roughness: 0.18 },
  rosegold: { color: 0xe7b2a1, roughness: 0.2 },
  black: { color: 0x141416, roughness: 0.3 },
};

/* ------------------------------------------------------------------ helpers */
function detectQuality(requested) {
  if (requested === 'high' || requested === 'low') return requested;
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  return mem <= 4 || cores <= 4 || small ? 'low' : 'high';
}

function roundedRectShape(w, d, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function extrudeVertical(shape, height, bevel) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: height - bevel * 2,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 10,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, bevel, 0);
  g.computeVertexNormals();
  return g;
}

function lathe(profile, segments) {
  const pts = profile.map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, segments);
  g.computeVertexNormals();
  return g;
}

function radialTexture(inner, outer, size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Fast value-noise fbm for procedural marble / satin textures. */
function makeNoise(seed = 7) {
  const perm = new Uint8Array(512);
  let s = seed;
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const fade = (t) => t * t * (3 - 2 * t);
  const h = (x, y) => perm[(perm[x & 255] + y) & 511] / 255;
  const n = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = fade(xf), v = fade(yf);
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  return (x, y, oct = 5) => {
    let sum = 0, amp = 0.5, f = 1;
    for (let o = 0; o < oct; o++) { sum += amp * n(x * f, y * f); f *= 2; amp *= 0.5; }
    return sum;
  };
}

export function marbleCanvas(kind = 'noir', w = 512, h = 512, seed = 11) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const fbm = makeNoise(seed);
  const pal = kind === 'noir'
    ? { base: [11, 11, 13], mid: [34, 35, 39], vein: [196, 160, 104], veinFine: [120, 122, 128] }
    : { base: [236, 112, 160], mid: [243, 166, 197], vein: [255, 240, 245], veinFine: [152, 31, 80] };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w * 4, ny = y / h * 4;
      const t = fbm(nx, ny);
      const cloud = fbm(nx * 0.6 + 9, ny * 0.6 + 3, 4);
      const v1 = Math.abs(Math.sin((nx * 1.3 + ny * 0.7) * 2.2 + t * 7.5));
      const v2 = Math.abs(Math.sin((nx * 0.4 - ny * 1.1) * 3.1 + t * 11));
      const vein = Math.pow(1 - v1, 18);
      const fine = Math.pow(1 - v2, 40) * 0.6;
      const i = (y * w + x) * 4;
      for (let k = 0; k < 3; k++) {
        let col = pal.base[k] + (pal.mid[k] - pal.base[k]) * cloud * 1.1;
        col += (pal.vein[k] - col) * vein * (kind === 'noir' ? 0.5 : 0.45);
        col += (pal.veinFine[k] - col) * fine * (kind === 'noir' ? 0.35 : 0.25);
        img.data[i + k] = Math.max(0, Math.min(255, col));
      }
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/* ------------------------------------------------------------------ environment */
function buildEnvironment(renderer, palette) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(palette.env.base);
  const geo = new THREE.PlaneGeometry(1, 1);
  const panel = (color, intensity, w, h, pos, look) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide });
    const p = new THREE.Mesh(geo, m);
    p.scale.set(w, h, 1);
    p.position.set(...pos);
    p.lookAt(...look);
    env.add(p);
  };
  const [a, b, c] = palette.env.panels;
  panel(a, 2.6, 0.7, 9, [-5, 2, 3], [0, 0, 0]);   // narrow strip softbox left
  panel(a, 1.2, 2.5, 6, [-4, 1, -4], [0, 0, 0]); // soft back-left fill
  panel(b, 3.5, 0.7, 9, [5, 1, 2], [0, 0, 0]);  // warm strip right
  panel(c, 2, 10, 2, [0, 6, -4], [0, 0, 0]);  // top back
  panel(a, 1.5, 6, 1, [0, -3, 5], [0, 0, 0]); // floor bounce
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(env, 0.035);
  pm.dispose();
  return rt.texture;
}

/* ------------------------------------------------------------------ bottle */
function bottleMaterials(spec, quality) {
  const metal = METALS[spec.metal] || METALS.gold;
  const hi = quality === 'high';
  const glass = new THREE.MeshPhysicalMaterial({
    color: spec.glass,
    metalness: 0,
    roughness: 0.07,
    transmission: hi ? 1 : 0,
    thickness: 0.6,
    ior: 1.5,
    transparent: !hi,
    opacity: hi ? 1 : 0.42,
    clearcoat: 0.35,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.25,
    attenuationColor: new THREE.Color(spec.glass),
    attenuationDistance: 3.5,
    side: THREE.FrontSide,
    flatShading: spec.shape === 'faceted',
  });
  // Liquid is intentionally non-transmissive so it is captured by the glass transmission pass.
  const liquid = new THREE.MeshPhysicalMaterial({
    color: spec.liquid,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    transparent: !hi,
    opacity: hi ? 1 : 0.85,
    envMapIntensity: 1.1,
    flatShading: spec.shape === 'faceted',
  });
  const metalMat = new THREE.MeshStandardMaterial({ color: metal.color, metalness: 1, roughness: metal.roughness, envMapIntensity: 1.4 });
  const capMat = spec.cap === 'gem'
    ? new THREE.MeshPhysicalMaterial({ color: spec.capColor || spec.glass, roughness: 0.02, transmission: hi ? 1 : 0, transparent: !hi, opacity: hi ? 1 : 0.6, thickness: 1, ior: 1.6, clearcoat: 1, flatShading: true, envMapIntensity: 2 })
    : spec.capColor
      ? new THREE.MeshPhysicalMaterial({ color: spec.capColor, roughness: 0.12, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.3 })
      : metalMat;
  return { glass, liquid, metal: metalMat, cap: capMat };
}

/** Builds a generic miniature bottle (~ units: 1 = 1cm). Returns a Group whose base sits at y=0. */
export function buildBottle(spec, quality = 'high') {
  const g = new THREE.Group();
  const mats = bottleMaterials(spec, quality);
  let bodyH = 4.6, neckY;
  const fill = spec.fill ?? 0.72;

  if (spec.shape === 'square') {
    const w = 3, d = 1.9, r = 0.35, bev = 0.22;
    const body = new THREE.Mesh(extrudeVertical(roundedRectShape(w, d, r), bodyH, bev), mats.glass);
    // thick glass base
    const base = new THREE.Mesh(extrudeVertical(roundedRectShape(w - 0.5, d - 0.5, r * 0.6), 0.5, 0.08), mats.glass);
    const liq = new THREE.Mesh(extrudeVertical(roundedRectShape(w - 0.55, d - 0.55, r * 0.6), (bodyH - 1) * fill, 0.12), mats.liquid);
    liq.position.y = 0.5;
    g.add(body, base, liq);
    neckY = bodyH + 0.02;
  } else if (spec.shape === 'faceted') {
    const prof = [[0, 0], [1.25, 0], [1.75, 0.3], [1.95, 1.4], [1.95, 3.2], [1.6, 4.3], [0.55, 4.75], [0, 4.75]];
    const body = new THREE.Mesh(lathe(prof, 8), mats.glass);
    body.rotation.y = Math.PI / 8;
    const inner = [[0, 0.45], [1.1, 0.45], [1.5, 0.75], [1.62, 1.5], [1.62, 0.45 + 3.4 * fill], [0, 0.45 + 3.4 * fill]];
    const liq = new THREE.Mesh(lathe(inner, 8), mats.liquid);
    liq.rotation.y = Math.PI / 8;
    g.add(body, liq);
    bodyH = 4.75;
    neckY = bodyH;
  } else { // round
    const prof = [[0, 0], [1.3, 0], [1.7, 0.15], [1.85, 0.6], [1.85, 3.2], [1.7, 3.9], [1.2, 4.35], [0.5, 4.55], [0, 4.55]];
    const body = new THREE.Mesh(lathe(prof, 48), mats.glass);
    const h = 0.4 + 3.3 * fill;
    const inner = [[0, 0.4], [1.2, 0.4], [1.5, 0.6], [1.55, 1.0], [1.55, Math.min(h, 3.3)], [0, Math.min(h, 3.3)]];
    const liq = new THREE.Mesh(lathe(inner, 48), mats.liquid);
    g.add(body, liq);
    bodyH = 4.55;
    neckY = bodyH;
  }

  // neck + collar (pump crimp)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.35, 32), mats.glass);
  neck.position.y = neckY + 0.17;
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.42, 40), mats.metal);
  collar.position.y = neckY + 0.5;
  const collarRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.05, 12, 40), mats.metal);
  collarRing.rotation.x = Math.PI / 2;
  collarRing.position.y = neckY + 0.3;
  g.add(neck, collar, collarRing);

  // cap
  const capY = neckY + 0.72;
  let cap;
  switch (spec.cap) {
    case 'block': {
      cap = new THREE.Mesh(extrudeVertical(roundedRectShape(1.9, 1.9, 0.18), 1.7, 0.12), mats.cap);
      cap.position.y = capY;
      break;
    }
    case 'gem': {
      cap = new THREE.Mesh(lathe([[0, 0], [0.9, 0], [1.25, 0.55], [0.9, 1.6], [0, 1.75]], 6), mats.cap);
      cap.position.y = capY;
      break;
    }
    case 'dome': {
      cap = new THREE.Mesh(new THREE.SphereGeometry(1.05, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), mats.cap);
      cap.scale.set(1, 1.35, 1);
      cap.position.y = capY + 0.05;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.12, 40), mats.metal);
      band.position.y = capY;
      g.add(band);
      break;
    }
    default: { // cylinder
      cap = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.7, 48), mats.cap);
      cap.position.y = capY + 0.85;
    }
  }
  g.add(cap);
  g.userData.height = capY + 1.8;
  g.userData.materials = mats;
  return g;
}

/* ------------------------------------------------------------------ podium & floor */
function buildPodium(palette, quality, radius = 4.2) {
  const g = new THREE.Group();
  let topMat;
  if (palette.podium === 'marble-noir') {
    const tex = new THREE.CanvasTexture(marbleCanvas('noir', quality === 'high' ? 512 : 256, quality === 'high' ? 512 : 256, 23));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    topMat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.18, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.9 });
  } else {
    const tex = new THREE.CanvasTexture(marbleCanvas('rose', quality === 'high' ? 512 : 256, quality === 'high' ? 512 : 256, 5));
    tex.colorSpace = THREE.SRGBColorSpace;
    topMat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04, sheen: 1, sheenColor: new THREE.Color(0xffd0e2), envMapIntensity: 1.1 });
  }
  const rimMat = new THREE.MeshStandardMaterial({ color: palette.podiumRim, metalness: 1, roughness: 0.2 });
  const lower = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.12, radius * 1.15, 0.7, 96), topMat);
  lower.position.y = 0.35;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.12, 0.035, 8, 120), rimMat);
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.7;
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, 0.7, 96), topMat);
  upper.position.y = 1.05;
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.62, 0.03, 8, 96), rimMat);
  ring2.rotation.x = Math.PI / 2; ring2.position.y = 1.4;
  g.add(lower, ring, upper, ring2);
  g.userData.levels = { low: 0.7, high: 1.4, radius };
  return g;
}

function contactShadow(size, opacity = 0.55) {
  const m = new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,1)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false, opacity });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(size, size), m);
  p.rotation.x = -Math.PI / 2;
  return p;
}

function buildFloor(palette, transparent) {
  const group = new THREE.Group();
  const fade = radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)', 256);
  const mat = new THREE.MeshStandardMaterial({
    color: palette.floor, roughness: 0.25, metalness: 0.3,
    transparent: true, opacity: 0.86, alphaMap: fade, depthWrite: false,
  });
  if (transparent) mat.opacity = 0.75;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(16, 64), mat);
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = 1;
  group.add(floor);
  return group;
}

/* ------------------------------------------------------------------ scene mounting */
/**
 * mount(el, options)
 *  options.scene: 'viewer' | 'display'
 *  options.world: 'noir' | 'rose'
 *  options.bottle: spec override for viewer {shape, cap, glass, liquid, metal}
 *  options.interactive: drag/keyboard rotation (viewer)
 *  options.transparent: transparent background
 *  options.quality: 'auto' | 'high' | 'low'
 *  options.reducedMotion: boolean
 */
export async function mount(el, options = {}) {
  if (!THREE) THREE = await import(options.threeUrl);
  const opts = Object.assign({ scene: 'viewer', world: 'noir', interactive: true, transparent: true, quality: 'auto', autoRotate: true }, options);
  const quality = detectQuality(opts.quality);
  const palette = PALETTES[opts.world] || PALETTES.noir;

  const canvas = document.createElement('canvas');
  canvas.className = 'v3d__canvas';
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: quality === 'high', alpha: true,
      powerPreference: quality === 'high' ? 'high-performance' : 'low-power',
      preserveDrawingBuffer: !!opts.preserveDrawingBuffer,
    });
  } catch (e) {
    return null; // fallback stays visible
  }
  const maxDpr = opts.maxDpr || (quality === 'high' ? 2 : 1.5);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  // Neutral tone mapping keeps the Rosé pinks saturated; ACES gives Noir its cinematic roll-off.
  renderer.toneMapping = opts.world === 'rose' ? THREE.NeutralToneMapping : THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.world === 'rose' ? 0.95 : 1.15;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.environment = buildEnvironment(renderer, palette);

  const camera = new THREE.PerspectiveCamera(opts.scene === 'viewer' ? 26 : 30, 1, 0.1, 100);
  const key = new THREE.DirectionalLight(palette.key, 2.2); key.position.set(-4, 8, 6);
  const rim = new THREE.PointLight(palette.rim, 60, 30); rim.position.set(5, 6, -4);
  const fillL = new THREE.PointLight(palette.fill, 25, 25); fillL.position.set(-6, 2, 4);
  scene.add(key, rim, fillL, new THREE.AmbientLight(palette.ambient, 1.2));

  const stage = new THREE.Group();
  scene.add(stage);
  const floats = [];
  const disposables = [];

  if (opts.scene === 'display') {
    const podium = buildPodium(palette, quality);
    stage.add(podium);
    const { low, high, radius } = podium.userData.levels;
    const specs = opts.bottles || palette.bottles;
    const placements = [
      { x: -radius * 0.86, y: low, z: 0.9, s: 0.5, ry: 0.5 },
      { x: 0, y: high, z: 0, s: 0.64, ry: -0.35 },
      { x: radius * 0.86, y: low, z: 0.9, s: 0.48, ry: -0.6 },
    ];
    specs.slice(0, 3).forEach((spec, i) => {
      const p = placements[i];
      const holder = new THREE.Group();
      const b = buildBottle(spec, quality);
      b.scale.setScalar(p.s);
      b.rotation.y = p.ry;
      holder.add(b);
      holder.position.set(p.x, p.y, p.z);
      const sh = contactShadow(4.2 * p.s, opts.world === 'noir' ? 0.7 : 0.35);
      sh.position.set(p.x, p.y + 0.01, p.z);
      stage.add(holder, sh);
      floats.push({ obj: b, holderIndex: stage.children.indexOf(holder), base: 0, amp: 0.06 + i * 0.015, speed: 0.6 + i * 0.13, phase: i * 1.7 });
    });
    const floor = buildFloor(palette, opts.transparent);
    stage.add(floor);
    // fake reflection: mirrored clone under a translucent floor
    if (opts.reflection !== false) {
      const mirror = stage.clone(true);
      mirror.remove(mirror.children[mirror.children.length - 1]);
      mirror.scale.y = -1;
      mirror.traverse((o) => { if (o.material && o.material.map && o.material.transparent && !o.material.alphaMap) o.visible = false; });
      scene.add(mirror);
      stage.userData.mirror = mirror;
      floats.forEach((f) => { f.mirror = mirror.children[f.holderIndex]?.children[0]; });
    }
    camera.position.set(0, 4.2, 21);
    camera.lookAt(0, 2.9, 0);
  } else {
    const spec = Object.assign({}, palette.bottles[1], opts.bottle || {});
    const b = buildBottle(spec, quality);
    const h = b.userData.height;
    b.position.y = -h / 2;
    const pivot = new THREE.Group();
    pivot.add(b);
    stage.add(pivot);
    const sh = contactShadow(5, opts.world === 'noir' ? 0.65 : 0.3);
    sh.position.y = -h / 2 - 0.9;
    stage.add(sh);
    floats.push({ obj: pivot, base: 0, amp: 0.18, speed: 0.9, phase: 0 });
    stage.userData.pivot = pivot;
    camera.position.set(0, 1.4, 21);
    camera.lookAt(0, 0, 0);
  }

  if (!opts.interactive) { canvas.style.cursor = 'inherit'; canvas.style.pointerEvents = 'none'; }
  el.appendChild(canvas);

  /* sizing */
  const resize = () => {
    const r = el.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep subject framed on tall (mobile) canvases
    camera.zoom = w / h < 0.8 ? Math.max(0.62, w / h / 0.8) : 1;
    camera.updateProjectionMatrix();
    needsRender = true;
  };

  /* interaction */
  let targetRotY = opts.scene === 'viewer' ? (opts.initialRotation ?? 0.45) : 0;
  let rotY = targetRotY, targetRotX = 0, rotX = 0, velocity = 0;
  let dragging = false, lastX = 0, lastY = 0, idleTime = 0;
  let pointerNX = 0, pointerNY = 0;
  let needsRender = true;
  const reduced = !!opts.reducedMotion;

  const onDown = (e) => {
    if (!opts.interactive) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY; velocity = 0;
    el.classList.add('is-dragging');
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    pointerNX = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointerNY = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (!dragging) { needsRender = true; return; }
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    velocity = dx * 0.012;
    targetRotY += velocity;
    targetRotX = Math.max(-0.35, Math.min(0.35, targetRotX + dy * 0.004));
    idleTime = 0;
    needsRender = true;
  };
  const onUp = () => { dragging = false; el.classList.remove('is-dragging'); };
  const onKey = (e) => {
    if (!opts.interactive) return;
    const step = 0.35;
    if (e.key === 'ArrowLeft') { targetRotY -= step; e.preventDefault(); }
    else if (e.key === 'ArrowRight') { targetRotY += step; e.preventDefault(); }
    else if (e.key === 'ArrowUp') { targetRotX = Math.max(-0.35, targetRotX - 0.1); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { targetRotX = Math.min(0.35, targetRotX + 0.1); e.preventDefault(); }
    idleTime = 0; needsRender = true;
  };
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp);
  el.addEventListener('keydown', onKey);

  /* visibility-driven render loop */
  let visible = true, raf = 0, last = performance.now(), t = 0, running = false;
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); }, { rootMargin: '100px' });
  io.observe(el);
  const ro = new ResizeObserver(resize);
  ro.observe(el);
  const onVis = () => { if (!document.hidden) start(); };
  document.addEventListener('visibilitychange', onVis);

  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) { running = false; return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    idleTime += dt;

    if (!dragging) {
      targetRotY += velocity; velocity *= 0.92;
      if (opts.autoRotate && !reduced && idleTime > 2.5 && opts.scene === 'viewer') targetRotY += dt * 0.35;
    }
    rotY += (targetRotY - rotY) * 0.1;
    rotX += (targetRotX - rotX) * 0.1;
    if (!dragging && opts.scene === 'viewer') targetRotX *= 0.98;

    if (opts.scene === 'viewer') {
      stage.userData.pivot.rotation.y = rotY;
      stage.userData.pivot.rotation.x = rotX;
    } else {
      // gentle parallax response to pointer + hover intensity
      const intensity = el.closest('[data-hover-active]') ? 1 : 0.4;
      const tgtY = pointerNX * 0.22 * intensity + (reduced ? 0 : Math.sin(t * 0.25) * 0.05);
      stage.rotation.y += (tgtY - stage.rotation.y) * 0.05;
      if (stage.userData.mirror) stage.userData.mirror.rotation.y = stage.rotation.y;
      camera.position.y += ((4.2 - pointerNY * 0.6 * intensity) - camera.position.y) * 0.05;
      camera.lookAt(0, 2.9, 0);
      rim.intensity += ((intensity > 0.5 ? 120 : 60) - rim.intensity) * 0.06;
    }
    if (!reduced) floats.forEach((f) => {
      f.obj.position.y = f.base + Math.sin(t * f.speed + f.phase) * f.amp;
      if (f.mirror) f.mirror.position.y = f.obj.position.y;
    });

    renderer.render(scene, camera);
    needsRender = false;
    const settling = Math.abs(targetRotY - rotY) > 0.0005 || Math.abs(velocity) > 0.0005;
    if (!reduced || settling || needsRender || dragging) { raf = requestAnimationFrame(frame); }
    else running = false;
  }
  function start() {
    if (running) return;
    running = true; last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  resize();
  renderer.render(scene, camera);
  requestAnimationFrame(() => el.classList.add('is-3d-ready'));
  start();
  // reduced motion: re-render on interaction only
  if (reduced) { canvas.addEventListener('pointermove', start); el.addEventListener('keydown', start); }

  return {
    renderer, scene, camera, canvas,
    renderOnce() { renderer.render(scene, camera); },
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('visibilitychange', onVis);
      scene.traverse((o) => { o.geometry?.dispose?.(); const m = o.material; if (m) [].concat(m).forEach((x) => { x.map?.dispose?.(); x.dispose?.(); }); });
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      canvas.remove();
      el.classList.remove('is-3d-ready');
    },
  };
}

/** Loads three.js once and returns the namespace (used by offline asset rendering tools). */
export async function loadThree(url) {
  if (!THREE) THREE = await import(url);
  return THREE;
}

export { PALETTES, buildPodium, contactShadow, buildEnvironment, roundedRectShape, extrudeVertical };
