/**
 * High-fidelity procedural miniature perfume bottles.
 * Parts: refractive glass body (with optical dispersion), liquid, dip tube,
 * glass neck, metal crimp collar, spray actuator, removable cap, optional
 * embossed V monogram (Veloura signature bottle only — never on catalogue bottles).
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { EMBLEM_SVG } from './emblem-paths.js';

export const METALS = {
  gold: { color: 0xd8b47c, roughness: 0.26 },
  rosegold: { color: 0xe6ad9c, roughness: 0.24 },
  silver: { color: 0xd3d6db, roughness: 0.22 },
  gunmetal: { color: 0x45474d, roughness: 0.3 },
};

export function glassMaterial(tint, quality, extra = {}) {
  const hi = quality === 'high';
  return new THREE.MeshPhysicalMaterial(Object.assign({
    color: new THREE.Color(tint),
    metalness: 0,
    roughness: 0.03,
    transmission: hi ? 1 : 0,
    thickness: 1.1,
    ior: 1.52,
    dispersion: hi ? 0.35 : 0,
    attenuationColor: new THREE.Color(tint),
    attenuationDistance: 5,
    specularIntensity: 1,
    envMapIntensity: 1.15,
    transparent: !hi,
    opacity: hi ? 1 : 0.38,
    clearcoat: 0.15,
  }, extra));
}

export function liquidMaterial(color) {
  const c = new THREE.Color(color);
  return new THREE.MeshPhysicalMaterial({
    color: c,
    roughness: 0.16,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    sheen: 0.4,
    sheenColor: c.clone().offsetHSL(0, 0, 0.25),
    emissive: c.clone().multiplyScalar(0.14),
    envMapIntensity: 0.9,
  });
}

export function metalMaterial(name, brushed = true) {
  const m = METALS[name] || METALS.gold;
  return new THREE.MeshPhysicalMaterial({
    color: m.color, metalness: 1, roughness: m.roughness,
    // anisotropy needs well-formed UVs; extruded logo geometry uses polished metal instead
    anisotropy: brushed ? 0.7 : 0, anisotropyRotation: Math.PI / 2,
    clearcoat: 0.3, clearcoatRoughness: 0.2, envMapIntensity: 1.25,
  });
}

export function lacquerMaterial(color) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.18, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.1 });
}

function pearlMaterial(color) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.22, iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [200, 600], sheen: 1, sheenColor: new THREE.Color(0xffffff), clearcoat: 1, envMapIntensity: 1.2 });
}

/* Smooth lathe from a few control points */
function smoothLathe(points, segments, divisions = 64, flat = false) {
  const curve = new THREE.SplineCurve(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const pts = curve.getPoints(divisions).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  pts[0].x = 0; pts[pts.length - 1].x = 0;
  let g = new THREE.LatheGeometry(pts, segments);
  if (flat) { g = g.toNonIndexed(); }
  g.computeVertexNormals();
  return g;
}

/* Cut a lathe profile at height h (for liquid) and close it */
function insetProfile(profile, inset, bottom, top) {
  const out = [[0, bottom]];
  const curve = new THREE.SplineCurve(profile.map(([x, y]) => new THREE.Vector2(x, y)));
  const pts = curve.getPoints(80);
  for (const p of pts) {
    if (p.y < bottom || p.y > top) continue;
    out.push([Math.max(0.05, p.x - inset), p.y]);
  }
  out.push([out[out.length - 1][0] * 0.98, top]);
  out.push([0, top]);
  return out;
}

const SHAPES = {
  flask: { profile: [[0, 0], [1.25, 0], [1.72, 0.22], [1.94, 0.95], [1.96, 2.6], [1.78, 3.65], [1.15, 4.25], [0.52, 4.42], [0, 4.44]], height: 4.44, zScale: 0.64, segments: 96 },
  crystal: { profile: [[0, 0], [1.2, 0], [1.86, 0.42], [2.02, 1.7], [1.88, 3.3], [1.15, 4.25], [0.5, 4.48], [0, 4.5]], height: 4.5, zScale: 1, segments: 10, flat: true },
  pillar: { profile: [[0, 0], [1.08, 0], [1.26, 0.18], [1.28, 2.5], [1.26, 4.95], [1.05, 5.32], [0.5, 5.45], [0, 5.46]], height: 5.46, zScale: 1, segments: 72 },
};

/* Degenerate triangles in outlined font paths give NaN normals, which bloom would spread across the frame */
export function sanitizeNormals(g) {
  const n = g.attributes.normal.array;
  for (let i = 0; i < n.length; i += 3) {
    if (!Number.isFinite(n[i]) || !Number.isFinite(n[i + 1]) || !Number.isFinite(n[i + 2]) || (n[i] === 0 && n[i + 1] === 0 && n[i + 2] === 0)) { n[i] = 0; n[i + 1] = 0; n[i + 2] = 1; }
  }
  g.attributes.normal.needsUpdate = true;
}

/**
 * Studded column ("rockstud" style): a tall cylinder whose surface is a grid of
 * four-sided pyramids. Built triangle by triangle so every facet is crisp.
 */
function studdedGeometry(R, A, H, rows, cols, base = 0.35) {
  const pos = [];
  const pt = (r, a, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
  const tri = (a, b, c) => pos.push(...a, ...b, ...c);
  const h = (H - base) / rows;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a0 = (j / cols) * Math.PI * 2, a1 = ((j + 1) / cols) * Math.PI * 2, am = (a0 + a1) / 2;
      const y0 = base + i * h, y1 = y0 + h, ym = (y0 + y1) / 2;
      const p00 = pt(R, a0, y0), p10 = pt(R, a1, y0), p01 = pt(R, a0, y1), p11 = pt(R, a1, y1), apex = pt(R + A, am, ym);
      tri(p00, apex, p10); tri(p10, apex, p11); tri(p11, apex, p01); tri(p01, apex, p00);
    }
  }
  // clear glass base band and closed ends
  const seg = cols * 4;
  for (let j = 0; j < seg; j++) {
    const a0 = (j / seg) * Math.PI * 2, a1 = ((j + 1) / seg) * Math.PI * 2;
    const b0 = pt(R, a0, 0), b1 = pt(R, a1, 0), t0 = pt(R, a0, base), t1 = pt(R, a1, base);
    tri(b0, t0, b1); tri(b1, t0, t1);
    tri([0, 0, 0], b0, b1);
    tri([0, H, 0], pt(R, a1, H), pt(R, a0, H));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

let emblemGeometry = null;
function getEmblemGeometry() {
  if (emblemGeometry) return emblemGeometry;
  const data = new SVGLoader().parse(EMBLEM_SVG);
  const geos = [];
  data.paths.forEach((path) => {
    SVGLoader.createShapes(path).forEach((shape) => {
      geos.push(new THREE.ExtrudeGeometry(shape, { depth: 14, bevelEnabled: true, bevelThickness: 3, bevelSize: 2, bevelSegments: 2, curveSegments: 10 }));
    });
  });
  // merge
  const merged = new THREE.BufferGeometry();
  const positions = []; const normals = [];
  geos.forEach((g) => {
    const ng = g.index ? g.toNonIndexed() : g;
    positions.push(...ng.attributes.position.array);
    normals.push(...ng.attributes.normal.array);
  });
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  merged.computeBoundingBox();
  const bb = merged.boundingBox; const c = new THREE.Vector3(); bb.getCenter(c);
  merged.translate(-c.x, -c.y, -bb.min.z);
  const w = bb.max.x - bb.min.x;
  const s = 1 / w;
  merged.scale(s, -s, s); // flip SVG y
  merged.computeVertexNormals();
  sanitizeNormals(merged);
  emblemGeometry = merged;
  return merged;
}

/**
 * spec: { shape: 'column'|'flask'|'crystal'|'pillar', cap: 'block'|'cylinder'|'gem'|'pearl',
 *         glass, liquid, metal, capColor, fill (0-1), emblem (bool) }
 */
export function buildBottle(spec = {}, quality = 'high', opts = {}) {
  const s = Object.assign({ shape: 'column', cap: 'block', glass: '#cfd3da', liquid: '#7a4a1f', metal: 'gold', fill: 0.74 }, spec);
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const glass = opts.ghost
    ? new THREE.MeshPhysicalMaterial({ color: s.glass, transparent: true, opacity: 0.12, roughness: 0.1, depthWrite: false, envMapIntensity: 2 })
    : glassMaterial(s.glass, quality);
  const liquid = liquidMaterial(s.liquid);
  const metal = metalMaterial(s.metal);
  let H, frontZ;

  if (s.shape === 'studded') {
    const R = 0.58, A = 0.22; H = 6.6;
    body.add(new THREE.Mesh(studdedGeometry(R, A, H, 10, 8), glass));
    if (!opts.ghost) {
      const lh = (H - 0.7) * s.fill;
      const lg = new THREE.CylinderGeometry(R - 0.06, R - 0.06, lh, 32); lg.translate(0, 0.42 + lh / 2, 0);
      body.add(new THREE.Mesh(lg, liquid));
    }
    frontZ = R + A;
  } else if (s.shape === 'column') {
    const W = 3.0, D = 2.0; H = 4.4;
    const g = new RoundedBoxGeometry(W, H, D, 8, 0.4); g.translate(0, H / 2, 0);
    body.add(new THREE.Mesh(g, glass));
    if (!opts.ghost) {
      const lh = (H - 0.9) * s.fill;
      const lg = new RoundedBoxGeometry(W - 0.46, lh, D - 0.46, 6, 0.26); lg.translate(0, 0.55 + lh / 2, 0);
      body.add(new THREE.Mesh(lg, liquid));
    }
    frontZ = D / 2;
  } else {
    const def = SHAPES[s.shape] || SHAPES.flask;
    H = def.height;
    const g = smoothLathe(def.profile, def.segments, 72, def.flat);
    if (def.flat) g.rotateY(Math.PI / def.segments);
    const m = new THREE.Mesh(g, glass); m.scale.z = def.zScale; body.add(m);
    if (!opts.ghost) {
      const top = 0.5 + (H - 1.4) * s.fill;
      const lp = insetProfile(def.profile, def.flat ? 0.3 : 0.24, 0.5, top);
      const lg = smoothLathe(lp, def.segments, 48, def.flat);
      if (def.flat) lg.rotateY(Math.PI / def.segments);
      const lm = new THREE.Mesh(lg, liquid); lm.scale.z = def.zScale; body.add(lm);
    }
    frontZ = 1.95 * def.zScale;
  }

  // neck, dip tube, collar, actuator
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.32, 40), glass);
  neck.position.y = H + 0.14;
  body.add(neck);
  if (!opts.ghost) {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, H - 0.25, 10), new THREE.MeshStandardMaterial({ color: 0xe9e6e1, roughness: 0.35 }));
    tube.position.set(0.12, (H - 0.25) / 2 + 0.25, 0);
    body.add(tube);
  }
  const collar = new THREE.Mesh(smoothLathe([[0, 0], [0.56, 0], [0.6, 0.05], [0.6, 0.38], [0.5, 0.46], [0, 0.46]], 48, 20), metal);
  collar.position.y = H + 0.28;
  body.add(collar);
  const actuator = new THREE.Group();
  const act = new THREE.Mesh(smoothLathe([[0, 0], [0.3, 0], [0.32, 0.04], [0.32, 0.36], [0.26, 0.42], [0, 0.42]], 36, 16), metal);
  const nozzle = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), new THREE.MeshBasicMaterial({ color: 0x111111 }));
  nozzle.position.set(0, 0.24, 0.321);
  actuator.add(act, nozzle);
  actuator.position.y = H + 0.74;
  body.add(actuator);

  // cap
  const capPivot = new THREE.Group();
  capPivot.position.y = H + 0.24;
  let capMat = s.capColor ? lacquerMaterial(s.capColor) : metal;
  let cap;
  switch (s.cap) {
    case 'gem': {
      capMat = glassMaterial(s.capColor || s.glass, quality, { dispersion: quality === 'high' ? 0.6 : 0, thickness: 1.6 });
      const g = smoothLathe([[0, 0], [0.82, 0], [1.16, 0.5], [0.92, 1.45], [0.35, 1.78], [0, 1.8]], 8, 12, true);
      cap = new THREE.Mesh(g, capMat);
      break;
    }
    case 'pearl': {
      capMat = pearlMaterial(s.capColor || 0xfff0f5);
      cap = new THREE.Mesh(new THREE.SphereGeometry(0.98, 48, 32), capMat);
      cap.scale.set(1, 1.08, 1); cap.position.y = 1.0;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.7, 0.18, 40), metal); band.position.y = 0.06;
      capPivot.add(band);
      break;
    }
    case 'stepped': {
      cap = new THREE.Mesh(smoothLathe([[0, 0], [0.84, 0], [0.86, 0.04], [0.86, 0.72], [0.74, 0.78], [0.72, 1.6], [0.66, 1.68], [0, 1.7]], 64, 40), capMat);
      break;
    }
    case 'cylinder': {
      cap = new THREE.Mesh(smoothLathe([[0, 0], [0.78, 0], [0.84, 0.05], [0.84, 1.56], [0.78, 1.66], [0, 1.68]], 64, 24), capMat);
      break;
    }
    default: {
      const g = new RoundedBoxGeometry(1.9, 1.6, 1.9, 6, 0.14); g.translate(0, 0.8, 0);
      cap = new THREE.Mesh(g, capMat);
    }
  }
  if (opts.ghost) { capMat = capMat.clone(); capMat.transparent = true; capMat.opacity = 0.2; capMat.depthWrite = false; cap.material = capMat; }
  if (s.capScale) cap.scale.set(s.capScale, s.capScale * (s.capHeight || 1), s.capScale);
  capPivot.add(cap);
  root.add(capPivot);

  // emblem (signature bottle only)
  if (s.emblem && !opts.ghost) {
    const em = new THREE.Mesh(getEmblemGeometry(), metalMaterial(s.metal, false));
    em.scale.setScalar(1.15);
    em.position.set(0, H * 0.5, frontZ - 0.01);
    body.add(em);
  }

  // apply opacity for ghost
  if (opts.ghost) root.traverse((o) => { if (o.material && o.material !== glass && o !== capPivot) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.2; o.material.depthWrite = false; } });

  const capBase = H + 0.24;
  root.userData = {
    height: H + 2.0,
    bodyHeight: H,
    cap: capPivot,
    setCap(t) {
      const e = t * t * (3 - 2 * t);
      capPivot.position.y = capBase + e * 2.4;
      capPivot.position.x = e * 0.5;
      capPivot.rotation.z = -e * 0.35;
      capPivot.rotation.y = e * 0.8;
    },
    materials: { glass, liquid, metal, cap: capMat },
  };
  return root;
}

export function disposeObject(obj) {
  obj.traverse((o) => {
    if (o.geometry && o.geometry !== emblemGeometry) o.geometry.dispose();
    if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose(); m.dispose(); });
  });
}
