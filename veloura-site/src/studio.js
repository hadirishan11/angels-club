// Offline render studio for QA and product images (not loaded by the site).
import * as THREE from 'three';
import { createStage } from './three/stage.js';
import { createBackdrop } from './three/backdrop.js';
import { buildBottle } from './three/bottle.js';
import { buildCase } from './three/giftbox.js';

const q = new URLSearchParams(location.search);
const W = +(q.get('w') || 900), H = +(q.get('h') || 900);
const canvas = document.createElement('canvas'); canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
document.body.appendChild(canvas);
const world = q.get('world') || 'noir';
const stage = createStage(canvas, { quality: 'high', preserveDrawingBuffer: true, post: q.get('post') !== '0', alpha: q.get('bg') === '0' });
stage.resize(W, H);
stage.applyWorldLights(world === 'rose' ? 1 : 0);
if (q.get('bg') !== '0') {
  const bd = createBackdrop(); bd.material.uniforms.uWorld.value = world === 'rose' ? 1 : 0; bd.material.uniforms.uAspect.value = W / H;
  bd.material.uniforms.uTime.value = 12; stage.scene.add(bd);
}
const kind = q.get('kind') || 'bottle';
if (kind === 'bottle') {
  const spec = q.get('spec') ? JSON.parse(q.get('spec')) : {};
  const b = buildBottle(spec, 'high');
  b.position.y = -b.userData.height / 2; b.rotation.y = +(q.get('ry') || -0.5);
  if (q.get('cap')) b.userData.setCap(+q.get('cap'));
  stage.scene.add(b);
  stage.camera.position.set(0, 1.2, 21); stage.camera.lookAt(0, 0.2, 0);
} else if (kind === 'case') {
  const c = buildCase(world); c.userData.setOpen(+(q.get('open') ?? 0.7)); stage.scene.add(c);
  const specs = world === 'noir'
    ? [{ shape: 'column', cap: 'block', glass: '#3b3e45', liquid: '#5a3615', capColor: '#0d0d0f' }, { shape: 'flask', cap: 'cylinder', glass: '#b9bec7', liquid: '#9a6a34', metal: 'silver' }, { shape: 'pillar', cap: 'cylinder', glass: '#d6c4a4', liquid: '#b07a2e' }, { shape: 'crystal', cap: 'block', glass: '#8a7a64', liquid: '#6b4220', capColor: '#141416' }, { shape: 'flask', cap: 'cylinder', glass: '#9aa0aa', liquid: '#c08a40', metal: 'gunmetal' }]
    : [{ shape: 'flask', cap: 'pearl', glass: '#ffd0e2', liquid: '#f27aa8', metal: 'rosegold' }, { shape: 'pillar', cap: 'cylinder', glass: '#ffe3ee', liquid: '#f05291', metal: 'rosegold' }, { shape: 'crystal', cap: 'gem', glass: '#ffc1da', liquid: '#e8327a', metal: 'rosegold', capColor: '#ff9cc4' }, { shape: 'column', cap: 'block', glass: '#ffdbe8', liquid: '#f6a9c4', metal: 'rosegold', capColor: '#f9c9da' }, { shape: 'flask', cap: 'pearl', glass: '#ffcfe1', liquid: '#d8457f', metal: 'rosegold' }];
  c.userData.slots.forEach((p, i) => { const b = buildBottle(specs[i], 'high'); b.scale.setScalar(0.24); b.position.copy(p); b.rotation.y = -0.3 + i * 0.12; c.add(b); });
  c.rotation.y = -0.35;
  stage.camera.position.set(0, 7, 15.5); stage.camera.lookAt(0, 0.8, 0);
}
stage.renderOnce(); stage.renderOnce();
window.inst = { canvas, renderOnce: () => stage.renderOnce() };
window.ready = true;
