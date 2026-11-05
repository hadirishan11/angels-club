/**
 * Full-screen animated backdrop rendered inside the 3D scene (so glass refracts it).
 * Noir: slow domain-warped smoke with faint champagne-gold veins.
 * Rosé: flowing pink satin folds with anisotropic sheen.
 * uWorld blends Noir (0) → Rosé (1); uSplit shows both side by side with a seam.
 */
import * as THREE from 'three';

const frag = /* glsl */ `
  uniform float uTime; uniform float uWorld; uniform float uSplit; uniform float uSeam; uniform float uAspect; uniform vec2 uMouse; uniform float uDim;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
  float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a*noise(p); p = p*2.03 + 7.1; a *= 0.5; } return s; }
  vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }

  vec3 noir(vec2 p, float t){
    vec2 q = vec2(fbm(p*1.1 + vec2(0.0, t*0.04)), fbm(p*1.1 + vec2(5.2, 1.3) - t*0.03));
    vec2 r = vec2(fbm(p*1.4 + 2.2*q + vec2(1.7, 9.2) + t*0.02), fbm(p*1.4 + 2.2*q + vec2(8.3, 2.8)));
    float f = fbm(p*1.3 + 2.4*r);
    vec3 col = mix(lin(vec3(0.035,0.035,0.042)), lin(vec3(0.15,0.15,0.165)), smoothstep(0.25, 0.95, f));
    float vein = smoothstep(0.012, 0.0, abs(f - 0.6)) + 0.4*smoothstep(0.02, 0.0, abs(r.x - 0.55));
    col += lin(vec3(0.78, 0.66, 0.48)) * vein * 0.05;
    col += lin(vec3(0.8, 0.68, 0.5)) * 0.05 * smoothstep(1.3, 0.0, length(p - vec2(0.55 + uMouse.x*0.2, 0.55)));
    return col;
  }
  vec3 rose(vec2 p, float t){
    vec2 w = p + 0.35*vec2(fbm(p*0.6 + t*0.05), fbm(p*0.6 + vec2(3.1, 7.7) - t*0.04));
    float ph = w.x*5.2 + w.y*2.4 + fbm(w*1.1 + t*0.03)*4.0;
    float h = sin(ph)*0.5 + 0.5;
    float slope = cos(ph);
    float spec = pow(max(0.0, slope*0.6 + 0.4), 26.0) + 0.35*pow(max(0.0, -slope*0.6 + 0.4), 40.0);
    vec3 berry = lin(vec3(0.596,0.122,0.314)), vibrant = lin(vec3(0.94,0.32,0.57)), baby = lin(vec3(0.953,0.651,0.773)), blush = lin(vec3(0.98,0.835,0.886));
    vec3 col = mix(vibrant, baby, smoothstep(0.1, 0.9, h));
    col = mix(col, blush, smoothstep(0.75, 1.0, h)*0.55);
    col = mix(col, berry, smoothstep(0.35, 0.0, h)*0.6);
    col += lin(vec3(1.0, 0.94, 0.97)) * spec * 0.42;
    col *= 0.9 + 0.1*smoothstep(1.4, 0.2, length(p - vec2(0.3, 0.4)));
    return col;
  }
  void main(){
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float t = uTime;
    vec3 a = noir(p, t);
    vec3 b = rose(p + vec2(0.0, 0.0), t);
    vec3 single = mix(a, b, uWorld);
    float side = smoothstep(uSeam - 0.002, uSeam + 0.002, vUv.x);
    vec3 split = mix(a, b, side);
    float seam = smoothstep(0.004, 0.0, abs(vUv.x - uSeam));
    split += mix(lin(vec3(0.97,0.88,0.72)), lin(vec3(1.0,0.75,0.86)), vUv.y) * seam * 0.9;
    vec3 col = mix(single, split, uSplit);
    col *= uDim;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createBackdrop() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uWorld: { value: 0 }, uSplit: { value: 0 }, uSeam: { value: 0.5 },
      uAspect: { value: 1 }, uMouse: { value: new THREE.Vector2() }, uDim: { value: 1 },
    },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }',
    fragmentShader: frag,
    depthWrite: false,
    depthTest: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  return mesh;
}
