/**
 * Veloura discovery case: base tray with five slots, hinged lid with ribbon,
 * bow (Rosé) or gold band (Noir) and the V monogram on the lid.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { metalMaterial, sanitizeNormals } from './bottle.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { EMBLEM_SVG } from './emblem-paths.js';

export const CASE = { W: 8.4, D: 3.0, H: 2.2, LID: 0.8, slots: 5, spacing: 1.55, floor: 0.6, mini: 0.24 };

function emblemFlat() {
  const data = new SVGLoader().parse(EMBLEM_SVG);
  const shapes = [];
  data.paths.forEach((p) => shapes.push(...SVGLoader.createShapes(p)));
  const g = new THREE.ExtrudeGeometry(shapes, { depth: 6, bevelEnabled: true, bevelThickness: 2, bevelSize: 1.5, bevelSegments: 2, curveSegments: 8 });
  g.computeBoundingBox();
  const bb = g.boundingBox; const c = new THREE.Vector3(); bb.getCenter(c);
  g.translate(-c.x, -c.y, -bb.min.z);
  const s = 1 / (bb.max.x - bb.min.x);
  g.scale(s, -s, s);
  g.computeVertexNormals();
  sanitizeNormals(g);
  return g;
}

export function buildCase(world = 'noir', slots = CASE.slots) {
  const noir = world === 'noir';
  const { D, H, LID } = CASE;
  const W = slots * CASE.spacing + 0.7;
  const group = new THREE.Group();
  const paper = new THREE.MeshPhysicalMaterial({
    color: noir ? 0x0f0f11 : 0xe8508d, roughness: noir ? 0.42 : 0.5,
    clearcoat: noir ? 0.6 : 0.25, clearcoatRoughness: 0.3, sheen: noir ? 0 : 0.6, sheenColor: new THREE.Color(0xffd2e4), envMapIntensity: 0.7,
  });
  const insert = new THREE.MeshPhysicalMaterial({ color: noir ? 0x1c1d21 : 0xfad5e2, roughness: 0.95, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(noir ? 0x55565c : 0xffffff) });
  const trim = metalMaterial(noir ? 'gold' : 'rosegold', false);
  const ribbonMat = new THREE.MeshPhysicalMaterial({ color: noir ? 0xc9a873 : 0xfff0f5, metalness: noir ? 0.85 : 0.1, roughness: noir ? 0.28 : 0.35, sheen: 1, sheenColor: new THREE.Color(noir ? 0xf6deb0 : 0xffffff), clearcoat: 0.5 });

  // hollow base: floor + four walls, with a velvet platform inside
  const T = 0.14;
  const floorM = new THREE.Mesh(new RoundedBoxGeometry(W, 0.2, D, 2, 0.06), paper); floorM.position.y = 0.1;
  const wallB = new THREE.Mesh(new RoundedBoxGeometry(W, H, T, 2, 0.05), paper); wallB.position.set(0, H / 2, -D / 2 + T / 2);
  // front panel is a drop-down flap hinged at the bottom edge
  const flap = new THREE.Group(); flap.position.set(0, 0.2, D / 2);
  const wallF = new THREE.Mesh(new RoundedBoxGeometry(W, H - 0.2, T, 2, 0.05), paper); wallF.position.set(0, (H - 0.2) / 2, -T / 2);
  const flapInner = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.3, H - 0.5), insert); flapInner.position.set(0, (H - 0.2) / 2, -T - 0.001); flapInner.rotation.y = Math.PI;
  flap.add(wallF, flapInner);
  const wallL = new THREE.Mesh(new RoundedBoxGeometry(T, H, D, 2, 0.05), paper); wallL.position.set(-W / 2 + T / 2, H / 2, 0);
  const wallR = wallL.clone(); wallR.position.x = W / 2 - T / 2;
  const pad = new THREE.Mesh(new THREE.BoxGeometry(W - 2 * T, CASE.floor, D - 2 * T), insert); pad.position.y = CASE.floor / 2 + 0.05;
  // thin metal rim around the opening
  const rim = new THREE.Group();
  const rimF = new THREE.Mesh(new THREE.BoxGeometry(W + 0.02, 0.05, 0.08), trim); rimF.position.set(0, H - 0.2, -0.03);
  flap.add(rimF);
  const rimB = new THREE.Mesh(new THREE.BoxGeometry(W + 0.02, 0.05, 0.08), trim); rimB.position.set(0, H, -D / 2 + 0.03);
  const rimL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, D), trim); rimL.position.set(-W / 2 + 0.03, H, 0);
  const rimR = rimL.clone(); rimR.position.x = W / 2 - 0.03;
  rim.add(rimB, rimL, rimR);
  group.add(floorM, flap, wallB, wallL, wallR, pad, rim);
  // slot recesses
  const slotMat = new THREE.MeshStandardMaterial({ color: noir ? 0x0a0a0b : 0xd9799f, roughness: 1 });
  const slotPositions = [];
  for (let i = 0; i < slots; i++) {
    const x = (i - (slots - 1) / 2) * CASE.spacing;
    const s = new THREE.Mesh(new THREE.CircleGeometry(0.55, 40), slotMat);
    s.rotation.x = -Math.PI / 2; s.position.set(x, CASE.floor + 0.06, 0.05);
    group.add(s);
    slotPositions.push(new THREE.Vector3(x, CASE.floor + 0.07, 0.05));
  }

  // lid on a hinge at the back edge
  const hinge = new THREE.Group();
  hinge.position.set(0, H, -D / 2);
  const lid = new THREE.Group();
  const lidBox = new THREE.Mesh(new RoundedBoxGeometry(W + 0.12, LID, D + 0.12, 4, 0.14), paper);
  lidBox.position.set(0, LID / 2, D / 2);
  lid.add(lidBox);
  // ribbon band across the lid (front to back) + over the front face
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.62, LID + 0.03, D + 0.16), ribbonMat);
  band.position.set(W * 0.3, LID / 2, D / 2);
  lid.add(band);
  // emblem on lid
  const em = new THREE.Mesh(emblemFlat(), trim);
  em.scale.setScalar(1.5);
  em.rotation.x = -Math.PI / 2;
  em.position.set(-W * 0.12, LID + 0.005, D / 2 + 0.15);
  lid.add(em);
  if (!noir) {
    // bow: two flattened loops + tails, built from tubes
    const loop = (dir) => {
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        pts.push(new THREE.Vector3(dir * (0.75 + Math.cos(a) * 0.75), 0.35 + Math.sin(a) * 0.32, 0));
      }
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 64, 0.12, 10, true), ribbonMat);
      tube.scale.set(1, 1, 2.2);
      tube.rotation.x = -0.55;
      return tube;
    };
    const bow = new THREE.Group();
    bow.add(loop(1), loop(-1));
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), ribbonMat); knot.scale.set(1.2, 0.9, 1.1); knot.position.y = 0.2;
    bow.add(knot);
    bow.position.set(W * 0.3, LID + 0.02, D / 2);
    lid.add(bow);
  } else {
    const pin = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.08, 0.5, 2, 0.03), trim);
    pin.position.set(W * 0.3, LID + 0.04, D / 2 + 0.6);
    lid.add(pin);
  }
  hinge.add(lid);
  group.add(hinge);

  // front ribbon on base
  const bandFront = new THREE.Mesh(new THREE.BoxGeometry(0.62, H + 0.02, D + 0.06), ribbonMat);
  bandFront.position.set(W * 0.3, H / 2, 0);
  group.add(bandFront);

  group.userData = {
    slots: slotPositions,
    setOpen(t) {
      const e = t * t * (3 - 2 * t);
      hinge.rotation.x = -e * 1.95;
      const f = Math.max(0, Math.min(1, (t - 0.35) / 0.65));
      flap.rotation.x = (f * f * (3 - 2 * f)) * 1.45;
      bandFront.visible = e < 0.05; // ribbon "untied" as the lid opens
      band.visible = true;
      bandFront.position.z = 0;
    },
  };
  group.userData.setOpen(0);
  return group;
}
