/**
 * VELOURA 3D experiences (lazy-loaded bundle):
 *  - mountStory: the homepage scroll story (split worlds → signature bottle →
 *    cap lift & mist → miniature scale → discovery case unboxing)
 *  - mountViewer: interactive product bottle (drag / swipe / keys, cap toggle)
 *  - mountTray: build-your-own-set case that fills as the shopper picks minis
 */
import * as THREE from 'three';
import { createStage } from './three/stage.js';
import { createBackdrop } from './three/backdrop.js';
import { buildBottle, disposeObject } from './three/bottle.js';
import { buildCase, CASE } from './three/giftbox.js';
import { SIGNATURE, byWorld } from './data/products.js';

const ease = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.max(0, Math.min(1, t));
function key(p, stops) {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, v0] = stops[i], [p1, v1] = stops[i + 1];
    if (p <= p1) { const t = ease((p - p0) / (p1 - p0 || 1)); return v0 + (v1 - v0) * t; }
  }
  return stops[stops.length - 1][1];
}
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

function radialTexture(size = 128) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
function contactShadow(size, opacity) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: radialTexture(), color: 0x000000, transparent: true, opacity, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

function observeSize(el, stage) {
  const ro = new ResizeObserver(() => { const r = el.getBoundingClientRect(); stage.resize(r.width, r.height); });
  ro.observe(el);
  const r = el.getBoundingClientRect(); stage.resize(r.width, r.height);
  return ro;
}

/* =========================================================== STORY */
export function mountStory(canvas, opts = {}) {
  const stage = createStage(canvas, {});
  const { scene, camera } = stage;
  const reduced = !!opts.reducedMotion;
  const backdrop = createBackdrop();
  scene.add(backdrop);
  const U = backdrop.material.uniforms;

  const sig = { noir: buildBottle(SIGNATURE.noir, stage.quality), rose: buildBottle(SIGNATURE.rose, stage.quality) };
  const ghost = { noir: buildBottle(SIGNATURE.noir, stage.quality, { ghost: true }), rose: buildBottle(SIGNATURE.rose, stage.quality, { ghost: true }) };
  const cases = { noir: buildCase('noir', 5), rose: buildCase('rose', 5) };
  ['noir', 'rose'].forEach((w) => {
    scene.add(sig[w], ghost[w], cases[w]);
    // four companions in the case; the signature bottle lands in the centre slot
    const picks = byWorld(w).filter((p) => p.bottle.shape !== 'studded').slice(0, 4);
    const slotIdx = [0, 1, 3, 4];
    picks.forEach((p, i) => {
      const b = buildBottle(p.bottle, stage.quality);
      b.scale.setScalar(CASE.mini); b.position.copy(cases[w].userData.slots[slotIdx[i]]); b.rotation.y = -0.4 + i * 0.25;
      cases[w].add(b);
    });
    cases[w].scale.setScalar(0.85);
  });
  const shadows = { noir: contactShadow(5.5, 0.55), rose: contactShadow(5.5, 0.3) };
  scene.add(shadows.noir, shadows.rose);

  // mist particles
  const MIST = 220;
  const mistGeo = new THREE.BufferGeometry();
  const mPos = new Float32Array(MIST * 3), mVel = new Float32Array(MIST * 3), mLife = new Float32Array(MIST);
  mistGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  const mistMat = new THREE.PointsMaterial({ size: 0.6, map: radialTexture(64), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff });
  const mist = new THREE.Points(mistGeo, mistMat); mist.frustumCulled = false;
  scene.add(mist);
  let mistCursor = 0;

  const target = { p: 0, hover: 0, world: opts.world || 'noir', mx: 0, my: 0 };
  const cur = { p: 0, hover: 0, worldMix: target.world === 'rose' ? 1 : 0 };
  U.uWorld.value = cur.worldMix;
  stage.applyWorldLights(cur.worldMix);
  const ro = observeSize(canvas.parentElement, stage);

  const tmp = new THREE.Vector3();
  let t = 0;
  stage.onFrame((dt) => {
    t += reduced ? 0 : dt;
    cur.p = damp(cur.p, target.p, 6, dt);
    cur.hover = damp(cur.hover, target.hover, 5, dt);
    const wm = target.world === 'rose' ? 1 : 0;
    cur.worldMix = damp(cur.worldMix, wm, 3.5, dt);
    stage.applyWorldLights(cur.worldMix);
    const p = cur.p;
    const aspect = stage.size.w / stage.size.h;
    const wide = aspect > 1.05;
    const X = wide ? Math.min(3.6, 1.6 + aspect * 1.2) : 0;    // text on the left, objects on the right (desktop)
    const Y0 = wide ? 0 : -1.4;                                   // phones: objects lower, text above
    const zoom = wide ? 1 : Math.max(0.62, aspect / 0.9);

    // backdrop
    U.uTime.value = t;
    U.uAspect.value = aspect;
    U.uSplit.value = 1 - clamp01((p - 0.25) / 0.5);
    U.uSeam.value = 0.5 - cur.hover * 0.07;
    U.uWorld.value = cur.worldMix;
    U.uMouse.value.set(target.mx, target.my);

    const active = target.world, other = active === 'noir' ? 'rose' : 'noir';
    const sideOf = (w) => (w === 'noir' ? -1 : 1);

    ['noir', 'rose'].forEach((w) => {
      const b = sig[w];
      const isActive = w === active;
      const homeX = sideOf(w) * (wide ? Math.min(5.2, 1.6 + aspect * 1.6) : 2.0);
      const hoverBoost = (cur.hover * sideOf(w)) > 0 ? cur.hover * sideOf(w) : 0;
      const hoverDim = (cur.hover * sideOf(w)) < 0 ? -cur.hover * sideOf(w) : 0;
      let x, y, z, s, ry, cap = 0;
      const sway = Math.sin(t * 0.6 + (w === 'noir' ? 0 : 2)) * 0.25;
      const bob = Math.sin(t * 0.9 + (w === 'noir' ? 1 : 0)) * 0.12;
      const homeS = (wide ? 0.66 : 0.5) * (1 + hoverBoost * 0.12 - hoverDim * 0.06);
      if (isActive) {
        x = key(p, [[0, homeX], [1, X], [2.6, X], [3.1, X + (wide ? 0.6 : 0.9)], [3.7, X + (wide ? 0.6 : 0.9)]]);
        y = key(p, [[0, wide ? -4.1 : -3.2], [1, -3.4 + Y0], [2.6, -3.6 + Y0], [3.1, -1.6 + Y0], [3.7, -1.6 + Y0]]) + bob;
        z = key(p, [[0, hoverBoost * 1.4], [1, 0.5], [3.7, 0.5]]);
        s = key(p, [[0, homeS], [1, 1.02 * zoom], [2.6, 1.02 * zoom], [3.1, 0.46 * zoom], [3.7, 0.46 * zoom]]);
        ry = (p < 0.4 ? -0.4 * sideOf(w) + sway : 0) + key(p, [[0.4, 0], [1.6, Math.PI * 2], [2.6, Math.PI * 2 + 0.3]]) + (p > 0.4 ? sway * 0.5 : 0);
        cap = key(p, [[1.45, 0], [1.9, 1], [2.55, 1], [2.9, 0]]);
        // final chapter: drop into the case's centre slot
        if (p > 3.5) {
          cases[w].updateMatrixWorld(true);
          tmp.copy(cases[w].userData.slots[2]); cases[w].localToWorld(tmp);
          const k2 = ease(clamp01((p - 3.75) / 0.5));
          x = x + (tmp.x - x) * k2; y = y + (tmp.y - y) * k2; z = z + (tmp.z - z) * k2;
          s = s + (CASE.mini * 0.85 - s) * k2;
          ry = ry + (-0.2 - ry) * k2;
        }
        b.visible = true;
      } else {
        x = key(p, [[0, homeX], [0.7, homeX * 3.5]]);
        y = (wide ? -4.1 : -3.2) + bob;
        z = hoverBoost * 1.4;
        s = key(p, [[0, homeS], [0.7, homeS * 0.7]]);
        ry = -0.4 * sideOf(w) + sway;
        b.visible = p < 0.75;
      }
      b.position.set(x, y, z);
      b.scale.setScalar(s);
      b.rotation.y = ry;
      b.userData.setCap(cap);
      shadows[w].visible = b.visible && p < 2.9;
      shadows[w].position.set(x, y - 0.02, z);
      shadows[w].scale.setScalar(s);

      // ghost: full-size silhouette for the scale chapter
      const g = ghost[w];
      const go = isActive ? key(p, [[2.55, 0], [3.0, 1], [3.45, 1], [3.75, 0]]) : 0;
      g.visible = go > 0.01;
      g.position.set(X - (wide ? 2.6 : 0.6), -5.2 + Y0, -2.4);
      g.scale.setScalar(1.5 * zoom);
      g.rotation.y = -0.35 + sway * 0.3;
      g.traverse((o) => { if (o.material && o.material.transparent) o.material.opacity = Math.min(0.5, (o.material.userData.baseOpacity ??= o.material.opacity) * 2.2) * go; });

      // case
      const c = cases[w];
      const cy = key(p, [[3.2, -16], [3.75, -5.6 + Y0 * 0.6]]);
      c.visible = isActive && p > 3.2;
      c.position.set(wide ? X - 0.4 : 0, cy, 0);
      c.rotation.set(0.12, -0.32 + Math.sin(t * 0.3) * 0.05, 0);
      c.userData.setOpen(key(p, [[3.65, 0], [4.05, 1]]));
    });

    // mist bursts while the cap is off
    const a = sig[active];
    const spraying = !reduced && p > 1.85 && p < 2.55;
    if (spraying) {
      a.updateMatrixWorld(true);
      const nozzle = new THREE.Vector3(0, a.userData.bodyHeight + 0.98, 0.35); a.localToWorld(nozzle);
      for (let i = 0; i < 4; i++) {
        const k3 = mistCursor++ % MIST;
        mPos[k3 * 3] = nozzle.x; mPos[k3 * 3 + 1] = nozzle.y; mPos[k3 * 3 + 2] = nozzle.z;
        const dir = new THREE.Vector3(Math.sin(a.rotation.y), 0.15, Math.cos(a.rotation.y));
        mVel[k3 * 3] = dir.x * 3 + (Math.random() - 0.5) * 1.2; mVel[k3 * 3 + 1] = dir.y + (Math.random() - 0.3) * 1.0; mVel[k3 * 3 + 2] = dir.z * 3 + (Math.random() - 0.5) * 1.2;
        mLife[k3] = 1;
      }
    }
    for (let i = 0; i < MIST; i++) {
      if (mLife[i] <= 0) { mPos[i * 3 + 1] = -999; continue; }
      mLife[i] -= dt * 0.7;
      mPos[i * 3] += mVel[i * 3] * dt; mPos[i * 3 + 1] += mVel[i * 3 + 1] * dt; mPos[i * 3 + 2] += mVel[i * 3 + 2] * dt;
      mVel[i * 3] *= 0.97; mVel[i * 3 + 1] = mVel[i * 3 + 1] * 0.97 + 0.15 * dt; mVel[i * 3 + 2] *= 0.97;
    }
    mistGeo.attributes.position.needsUpdate = true;
    mistMat.color.set(cur.worldMix > 0.5 ? 0xffd9e8 : 0xf3e2c4);

    // camera: gentle parallax, rises to look into the case at the end
    const cy2 = key(p, [[3.3, 0.6], [4.05, 6.2]]);
    const ly = key(p, [[3.3, -0.4], [4.05, -4.2]]);
    camera.position.x = damp(camera.position.x, target.mx * 0.8, 3, dt);
    camera.position.y = damp(camera.position.y, cy2 - target.my * 0.5, 3, dt);
    camera.position.z = 24;
    camera.lookAt(0, ly, 0);
    if (stage.bloom) stage.bloom.strength = 0.18 + (1 - cur.worldMix) * 0.08;
  });
  stage.start();

  return {
    quality: stage.quality,
    setProgress(p) { target.p = p; },
    setHover(h) { target.hover = h; },
    setWorld(w) { target.world = w; },
    setPointer(x, y) { target.mx = x; target.my = y; },
    setVisible(v) { stage.setVisible(v); },
    dispose() { ro.disconnect(); stage.dispose(); },
  };
}

/* =========================================================== PRODUCT VIEWER */
export function mountViewer(container, spec, world, opts = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'stage-canvas';
  container.appendChild(canvas);
  const stage = createStage(canvas, { fov: 26 });
  const { scene, camera } = stage;
  const backdrop = createBackdrop();
  backdrop.material.uniforms.uWorld.value = world === 'rose' ? 1 : 0;
  backdrop.material.uniforms.uDim.value = world === 'rose' ? 1 : 1.25;
  scene.add(backdrop);
  stage.applyWorldLights(world === 'rose' ? 1 : 0);
  const bottle = buildBottle(spec, stage.quality);
  const pivot = new THREE.Group();
  bottle.position.y = -bottle.userData.height / 2 + 0.3;
  pivot.add(bottle);
  scene.add(pivot);
  const sh = contactShadow(5.5, world === 'rose' ? 0.3 : 0.55); sh.position.y = bottle.position.y - 0.02; scene.add(sh);
  // pull the camera back for tall bottles (e.g. slim travel sprays) so they always fit the frame
  const camZ = Math.max(22, bottle.userData.height * 2.75);
  camera.position.set(0, 1.0, camZ); camera.lookAt(0, 0, 0);
  const ro = observeSize(container, stage);

  let rotY = -0.5, target = -0.5, vel = 0, tilt = 0, tTilt = 0, dragging = false, lastX = 0, lastY = 0, idle = 0, capT = 0, capTarget = 0, t = 0;
  const reduced = !!opts.reducedMotion;
  const down = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; vel = 0; canvas.setPointerCapture?.(e.pointerId); container.classList.add('is-dragging'); };
  const move = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
    vel = dx * 0.012; target += vel; tTilt = Math.max(-0.35, Math.min(0.35, tTilt + dy * 0.004)); idle = 0;
  };
  const up = () => { dragging = false; container.classList.remove('is-dragging'); };
  const keyh = (e) => {
    if (e.key === 'ArrowLeft') { target -= 0.4; e.preventDefault(); } else if (e.key === 'ArrowRight') { target += 0.4; e.preventDefault(); } else return;
    idle = 0;
  };
  canvas.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  container.addEventListener('keydown', keyh);

  stage.onFrame((dt) => {
    t += dt; idle += dt;
    if (!dragging) { target += vel; vel *= 0.92; if (!reduced && idle > 2.5) target += dt * 0.35; tTilt *= 0.97; }
    rotY = damp(rotY, target, 8, dt); tilt = damp(tilt, tTilt, 8, dt);
    pivot.rotation.set(tilt, rotY, 0);
    pivot.position.y = reduced ? 0 : Math.sin(t * 0.9) * 0.15;
    capT = damp(capT, capTarget, 5, dt); bottle.userData.setCap(capT);
    backdrop.material.uniforms.uTime.value = reduced ? 8 : t;
    backdrop.material.uniforms.uAspect.value = stage.size.w / stage.size.h;
  });
  stage.start();
  requestAnimationFrame(() => container.classList.add('is-3d-ready'));
  return {
    toggleCap() { capTarget = capTarget ? 0 : 1; return !!capTarget; },
    dispose() { ro.disconnect(); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); stage.dispose(); canvas.remove(); },
  };
}

/* =========================================================== SET TRAY */
export function mountTray(container, world, size) {
  const canvas = document.createElement('canvas');
  canvas.className = 'stage-canvas';
  container.appendChild(canvas);
  const stage = createStage(canvas, { fov: 28 });
  const { scene, camera } = stage;
  const backdrop = createBackdrop();
  backdrop.material.uniforms.uWorld.value = world === 'rose' ? 1 : 0;
  scene.add(backdrop);
  stage.applyWorldLights(world === 'rose' ? 1 : 0);
  const c = buildCase(world, size); c.userData.setOpen(1); c.rotation.set(0.1, 0, 0);
  scene.add(c);
  const W = size * CASE.spacing + 0.7;
  camera.position.set(0, 7.5, 9 + W * 0.9); camera.lookAt(0, 1.4, 0);
  const ro = observeSize(container, stage);
  const slots = []; // { id, obj, t }
  let t = 0;
  stage.onFrame((dt) => {
    t += dt;
    slots.forEach((s, i) => {
      if (!s) return;
      s.t = Math.min(1, s.t + dt * 2.2);
      const e = 1 - Math.pow(1 - s.t, 3);
      const base = c.userData.slots[i];
      s.obj.position.set(base.x, base.y + (1 - e) * 4, base.z);
      s.obj.rotation.y = -0.3 + Math.sin(t * 0.8 + i) * 0.08 + (1 - e) * 2;
    });
    backdrop.material.uniforms.uTime.value = t;
    backdrop.material.uniforms.uAspect.value = stage.size.w / stage.size.h;
  });
  stage.start();
  return {
    setItems(specs) {
      for (let i = 0; i < size; i++) {
        const want = specs[i];
        const have = slots[i];
        if (have && (!want || have.id !== want.id)) { c.remove(have.obj); disposeObject(have.obj); slots[i] = null; }
        if (want && !slots[i]) {
          const obj = buildBottle(want.bottle, stage.quality); obj.scale.setScalar(CASE.mini * Math.min(1, 6.4 / obj.userData.height));
          c.add(obj); slots[i] = { id: want.id, obj, t: 0 };
        }
      }
    },
    dispose() { ro.disconnect(); stage.dispose(); canvas.remove(); },
  };
}
