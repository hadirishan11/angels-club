/**
 * Shared WebGL stage: renderer, studio environment, world-tinted lights,
 * optional bloom post-processing, adaptive quality, visibility-aware loop.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export function detectQuality() {
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  if (mem <= 2 || cores <= 2) return 'low';
  return small || mem <= 4 ? 'medium' : 'high';
}

export const LIGHTS = {
  noir: { key: 0xffe9c8, rim: 0xd7b27a, fill: 0x8c929c, exposure: 1.05 },
  rose: { key: 0xfff3f7, rim: 0xff7fb0, fill: 0xffc2da, exposure: 1.0 },
};

export function createStage(canvas, options = {}) {
  const quality = options.quality || detectQuality();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality !== 'low', alpha: !!options.alpha, powerPreference: 'high-performance', preserveDrawingBuffer: !!options.preserveDrawingBuffer });
  const maxDpr = options.maxDpr || (quality === 'high' ? 2 : quality === 'medium' ? 1.5 : 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (options.alpha) renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.035).texture;
  scene.environmentIntensity = 0.9;
  room.dispose?.();

  const camera = new THREE.PerspectiveCamera(options.fov || 30, 1, 0.1, 200);

  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-5, 9, 7);
  const rim = new THREE.PointLight(0xffffff, 80, 40, 1.6); rim.position.set(6, 6, -5);
  const rim2 = new THREE.PointLight(0xffffff, 40, 40, 1.6); rim2.position.set(-7, 3, -4);
  const fill = new THREE.HemisphereLight(0xffffff, 0x222222, 0.6);
  scene.add(key, rim, rim2, fill);

  let composer = null, bloom = null;
  const usePost = options.post !== false && quality === 'high';
  if (usePost) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.22, 0.45, 0.93);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  const state = { world: 'noir', worldMix: 0 };
  function applyWorldLights(mix) {
    const a = LIGHTS.noir, b = LIGHTS.rose;
    const lerp = (x, y) => new THREE.Color(x).lerp(new THREE.Color(y), mix);
    key.color.copy(lerp(a.key, b.key));
    rim.color.copy(lerp(a.rim, b.rim)); rim2.color.copy(lerp(a.rim, b.rim));
    fill.color.copy(lerp(a.fill, b.fill));
  }
  applyWorldLights(0);

  const size = { w: 1, h: 1 };
  function resize(w, h) {
    size.w = Math.max(1, w); size.h = Math.max(1, h);
    renderer.setSize(size.w, size.h, false);
    camera.aspect = size.w / size.h;
    camera.updateProjectionMatrix();
    if (composer) { composer.setSize(size.w, size.h); }
  }

  const callbacks = new Set();
  let raf = 0, running = false, last = performance.now(), visible = true, disposed = false;
  function frame(now) {
    raf = 0;
    if (disposed || !visible || document.hidden) { running = false; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    callbacks.forEach((cb) => cb(dt, now / 1000));
    if (composer) composer.render(); else renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running || disposed) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  const onVis = () => { if (!document.hidden) start(); };
  document.addEventListener('visibilitychange', onVis);

  return {
    renderer, scene, camera, composer, bloom, quality, state, size,
    resize, start,
    setVisible(v) { visible = v; if (v) start(); },
    onFrame(cb) { callbacks.add(cb); return () => callbacks.delete(cb); },
    applyWorldLights,
    renderOnce() { if (composer) composer.render(); else renderer.render(scene, camera); },
    dispose() {
      disposed = true; cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      scene.traverse((o) => { o.geometry?.dispose?.(); if (o.material) [].concat(o.material).forEach((m) => m.dispose?.()); });
      scene.environment?.dispose?.();
      pmrem.dispose();
      composer?.dispose?.();
      renderer.dispose();
    },
  };
}
