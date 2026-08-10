/**
 * Bakes the engraved cube geometry ahead of time so the client never runs the
 * (main-thread-blocking) boolean CSG. Runs the exact same build the app would, then
 * writes the base geometry to `public/cube-geometry.bin` (compact binary — see
 * `deserializeBaseGeometry`). At runtime the app loads that and adds the cheap
 * per-vertex passes (`hydrateEngravedGeometry`).
 *
 * Run with:  bun run bake
 *
 * `SVGLoader` needs a DOM (`DOMParser`), which jsdom provides in Node.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM } from 'jsdom';

// Provide the DOM globals SVGLoader expects, before importing anything that uses it.
const dom = new JSDOM('<!DOCTYPE html><body></body>');
const g = globalThis as unknown as Record<string, unknown>;
g.window = dom.window;
g.document = dom.window.document;
g.DOMParser = dom.window.DOMParser;

const { buildEngravedBase, extrudeCutter } = await import(
  '../src/components/home-hero/cube-geometry.build.ts'
);
const { SYMBOL_SVGS } = await import('../src/components/home-hero/cube-geometry.ts');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readSvg = (publicPath: string): string => readFileSync(join(root, 'public', publicPath), 'utf8');

const cutters = {
  react: extrudeCutter(readSvg(SYMBOL_SVGS.react)),
  rust: extrudeCutter(readSvg(SYMBOL_SVGS.rust)),
  bolt: extrudeCutter(readSvg(SYMBOL_SVGS.bolt)),
};

const geometry = buildEngravedBase(cutters);

// Serialize to the compact binary that `deserializeBaseGeometry` reads.
const position = geometry.getAttribute('position').array as Float32Array;
const normal = geometry.getAttribute('normal').array as Float32Array;
const uv = geometry.getAttribute('uv').array as Float32Array;
const index = geometry.index ? Uint32Array.from(geometry.index.array) : new Uint32Array(0);
const vertexCount = geometry.getAttribute('position').count;

const bytes = 12 + position.byteLength + normal.byteLength + uv.byteLength + index.byteLength;
const buf = new ArrayBuffer(bytes);
new Uint32Array(buf, 0, 3).set([0x4f584431, vertexCount, index.length]); // "OXD1"
let off = 12;
new Float32Array(buf, off, position.length).set(position);
off += position.byteLength;
new Float32Array(buf, off, normal.length).set(normal);
off += normal.byteLength;
new Float32Array(buf, off, uv.length).set(uv);
off += uv.byteLength;
if (index.length) new Uint32Array(buf, off, index.length).set(index);

const out = join(root, 'public', 'cube-geometry.bin');
writeFileSync(out, Buffer.from(buf));
console.log(
  `Baked ${vertexCount} verts, ${index.length} indices → public/cube-geometry.bin (${(bytes / 1024).toFixed(0)} KB)`,
);
