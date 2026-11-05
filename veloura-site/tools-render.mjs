// Renders product photos, cut-outs and case/gift images with the site's own 3D engine.
// Usage: node tools-render.mjs <outdir>   (needs Playwright and `.studio` served on :8802)
import { products } from './src/data/products.js';
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const jobs = [];
for (const p of products) {
  const spec = encodeURIComponent(JSON.stringify(p.bottle));
  jobs.push({ q: `kind=bottle&world=${p.world}&w=800&h=1000&ry=-0.45&spec=${spec}`, out: `${out}/p-${p.id}.png` });
  jobs.push({ q: `kind=bottle&world=${p.world}&w=600&h=900&ry=-0.45&bg=0&post=0&spec=${spec}`, out: `${out}/c-${p.id}.png` });
}
for (const w of ['noir', 'rose']) {
  jobs.push({ q: `kind=case&world=${w}&w=1400&h=900&open=1&bg=0&post=0`, out: `${out}/case-${w}.png` });
  jobs.push({ q: `kind=case&world=${w}&w=1400&h=900&open=0&bg=0&post=0`, out: `${out}/gift-${w}.png` });
}
const only = process.argv[3]; if (only) jobs.splice(0, jobs.length, ...jobs.filter((j) => j.out.includes(only)));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: 1500, height: 1100 } });
pg.on('pageerror', (e) => console.log('ERR', e.message));
for (const j of jobs) {
  await pg.goto('http://localhost:8802/studio.html?' + j.q);
  await pg.waitForFunction('window.ready', null, { timeout: 120000 });
  await pg.waitForTimeout(300);
  const data = await pg.evaluate(() => { window.inst.renderOnce(); return window.inst.canvas.toDataURL('image/png'); });
  fs.writeFileSync(j.out, Buffer.from(data.split(',')[1], 'base64'));
}
await b.close();
console.log('rendered', jobs.length);
