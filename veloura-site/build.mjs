// Builds the static site into dist/: bundles JS (3D code split into a lazy chunk), copies public/ and styles/.
import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('public', 'dist', { recursive: true });
cpSync('styles', 'dist/styles', { recursive: true });
await build({ entryPoints: ['src/main.js'], bundle: true, splitting: true, format: 'esm', outdir: 'dist/js', minify: true, target: 'es2020', legalComments: 'eof', chunkNames: 'chunks/[name]-[hash]' });
// offline render studio (not part of the site)
rmSync('.studio', { recursive: true, force: true });
await build({ entryPoints: ['src/studio.js'], bundle: true, format: 'esm', outfile: '.studio/js/studio.js', minify: true, target: 'es2020' });
console.log('built dist/');
