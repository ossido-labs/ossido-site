import * as THREE from 'three';

/**
 * Shared geometry constants + the cheap per-vertex passes for the engraved cube.
 * This module is deliberately free of `three-bvh-csg` / `SVGLoader` / DOM so it can
 * run on the main thread (and the baked path) without pulling in the CSG toolchain.
 * The expensive boolean build lives in `./cube-geometry.build`.
 */

/** Symbol SVGs cut into the faces (a face and its opposite each). */
export const SYMBOL_SVGS = {
  react: '/react.svg',
  rust: '/rust.svg',
  bolt: '/bolt-lightning-solid-full.svg',
} as const;

export type SymbolCutters = Record<
  keyof typeof SYMBOL_SVGS,
  THREE.BufferGeometry
>;

/** Per-symbol emissive glow colours, keyed by the face's dominant axis:
 *  X faces → Rust orange, Y faces → bolt, Z faces → React cyan. */
export const EMISSIVE_BY_AXIS = ['#f74c00', '#41258f', '#61dafb'] as const;

/** Real recess depth, in world units (the cube is 2 units across). */
export const DEBOSS_DEPTH = 0.2;

/** Corner/edge fillet radius, in world units - a slight softening of the cube's
 * hard edges. `CORNER_SEGMENTS` controls how smooth each rounded edge is (kept low:
 * the radius is tiny, and it feeds the boolean build so fewer segments = faster). */
export const CORNER_RADIUS = 0.01;
export const CORNER_SEGMENTS = 2;

/** How far each symbol spans across its 2-unit face (leaves a margin). */
export const SYMBOL_SPAN = 1.36;

/** Extra length so the cutter pokes out past the surface for a clean through-cut. */
export const CUT_OVERSHOOT = 0.2;

/** Curve tessellation when extruding the vector paths. The dominant driver of the
 * final mesh's triangle count - the extruded symbol recesses. Kept low (4) so the
 * baked mesh stays light for mobile GPUs, while still reading as smooth arcs at this
 * render size. Halving this from 8 roughly halves the whole cube's polygon count. */
export const CURVE_SEGMENTS = 4;

/**
 * Where each symbol sits: which cutter, the rotation that faces its prism outward,
 * and the outward unit `dir`. Each symbol appears on a face and its opposite (the
 * twin turned 180°); the cutter is placed `DEBOSS_DEPTH` back along `dir`.
 */
export const SYMBOL_PLACEMENTS: ReadonlyArray<{
  symbol: keyof typeof SYMBOL_SVGS;
  rotation: [number, number, number];
  dir: [number, number, number];
}> = [
  { symbol: 'react', rotation: [0, 0, 0], dir: [0, 0, 1] }, // +Z front
  { symbol: 'react', rotation: [0, Math.PI, 0], dir: [0, 0, -1] }, // -Z back
  { symbol: 'rust', rotation: [0, -Math.PI / 2, 0], dir: [-1, 0, 0] }, // -X left
  { symbol: 'rust', rotation: [0, Math.PI / 2, 0], dir: [1, 0, 0] }, // +X right
  { symbol: 'bolt', rotation: [-Math.PI / 2, 0, 0], dir: [0, 1, 0] }, // +Y top
  { symbol: 'bolt', rotation: [Math.PI / 2, 0, 0], dir: [0, -1, 0] }, // -Y bottom
];

/** Reused result of {@link classifyRecess} to avoid per-vertex allocation. */
const recess = { axis: 0, sign: 1, depth: 0 };

/**
 * Classify a vertex as inside an engraved recess (every face carries a symbol).
 * The recess face is the vertex's DOMINANT axis (largest |coord|) - walking the
 * faces in a fixed order misclassified symbol-extent vertices whose off-axis
 * coordinate exceeds 0.5 (e.g. the tall bolt leaking Rust/React colour). Excludes
 * outer-surface vertices (|coord| ≈ 1) and corner fillets (a 2nd near-1 coord).
 * On a match, fills `recess` (axis, outward sign, depth = |coord| there) → true.
 */
export function classifyRecess(x: number, y: number, z: number): boolean {
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  const az = Math.abs(z);
  let axis = 0;
  let depth = ax;
  if (ay > depth) {
    axis = 1;
    depth = ay;
  }
  if (az > depth) {
    axis = 2;
    depth = az;
  }
  const tangential =
    axis === 0
      ? Math.max(ay, az)
      : axis === 1
        ? Math.max(ax, az)
        : Math.max(ax, ay);
  if (depth <= 0.5 || depth >= 0.999 || tangential >= 0.9) return false;
  recess.axis = axis;
  recess.sign = (axis === 0 ? x : axis === 1 ? y : z) >= 0 ? 1 : -1;
  recess.depth = depth;
  return true;
}

/**
 * Fraction of the recess depth the "sealed" morph keeps. Sealing fully flush
 * collapsed the recess walls into zero-height triangles coplanar with the face -
 * they carry the walls' depth-projected UVs, so they z-fought the surface and made
 * the sealed symbol shimmer/deform while the cube spun (before the carve-in). A
 * small residual keeps the walls real geometry (no coincident faces) while still
 * reading as barely-engraved.
 */
export const SEAL_RESIDUAL = 0.12;

/**
 * Build a "sealed" morph target: every recess vertex pushed back out flush with
 * its face, so the engravings read as un-cut. Morphing from this target (influence
 * 1) to the base geometry (influence 0) makes the symbols carve themselves in.
 */
export function buildSealedMorph(geometry: THREE.BufferGeometry): void {
  const position = geometry.getAttribute('position');
  const sealed = new Float32Array(position.array as Float32Array); // start as a copy

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    if (classifyRecess(x, y, z)) {
      // Lift most of the way out to the surface, keeping SEAL_RESIDUAL of the
      // recess depth so the walls stay real (non-degenerate) geometry.
      sealed[i * 3 + recess.axis] =
        recess.sign * (1 - (1 - recess.depth) * SEAL_RESIDUAL);
    }
  }

  geometry.morphAttributes.position = [new THREE.BufferAttribute(sealed, 3)];
}

/**
 * Per-vertex emissive colour: each engraved recess vertex (floor + walls) gets its
 * symbol's brand colour, outer-face vertices get black. Fed to the material shader
 * so the glow shows *only* inside the engravings, tinted per symbol.
 */
export function buildEmissiveColors(geometry: THREE.BufferGeometry): void {
  const position = geometry.getAttribute('position');
  const emissive = new Float32Array(position.count * 3); // zeroed = black = no glow
  const colour = new THREE.Color();

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    if (classifyRecess(x, y, z)) {
      colour.set(EMISSIVE_BY_AXIS[recess.axis]); // sRGB hex → linear working space
      emissive[i * 3] = colour.r;
      emissive[i * 3 + 1] = colour.g;
      emissive[i * 3 + 2] = colour.b;
    }
  }

  geometry.setAttribute('aEmissive', new THREE.BufferAttribute(emissive, 3));
}

/**
 * Add the cheap per-vertex passes (sealed morph + emissive colours) to a base
 * engraved geometry - whether freshly cut or loaded from the baked file. These are
 * pure functions of the vertex positions, so they're a couple of ms, non-blocking.
 */
export function hydrateEngravedGeometry(
  geometry: THREE.BufferGeometry,
): THREE.BufferGeometry {
  buildSealedMorph(geometry);
  buildEmissiveColors(geometry);
  return geometry;
}

/**
 * Compact binary layout for the baked base geometry (see `scripts/bake-cube.ts`):
 *   [u32 magic][u32 vertexCount][u32 indexCount]
 *   f32 position[count*3]  f32 normal[count*3]  f32 uv[count*2]  u32 index[indexCount]
 * Far smaller than `toJSON` and parsed without blocking. `uv1` (for the AO map) is
 * regenerated from `uv` rather than stored.
 */
export const BAKED_GEOMETRY_URL = '/cube-geometry.bin';
const BAKED_MAGIC = 0x4f584431; // "OXD1"

export function deserializeBaseGeometry(
  buffer: ArrayBuffer,
): THREE.BufferGeometry {
  const header = new Uint32Array(buffer, 0, 3);
  if (header[0] !== BAKED_MAGIC) throw new Error('cube-geometry: bad magic');
  const vertexCount = header[1];
  const indexCount = header[2];

  let offset = 12;
  const take = <T>(
    Ctor: new (b: ArrayBuffer, o: number, n: number) => T,
    n: number,
  ): T => {
    const view = new Ctor(buffer, offset, n);
    offset += n * 4;
    return view;
  };
  const position = take(Float32Array, vertexCount * 3);
  const normal = take(Float32Array, vertexCount * 3);
  const uv = take(Float32Array, vertexCount * 2);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(position.slice(), 3),
  );
  geometry.setAttribute('normal', new THREE.BufferAttribute(normal.slice(), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv.slice(), 2));
  geometry.setAttribute('uv1', new THREE.BufferAttribute(uv.slice(), 2)); // AO shares the projection
  if (indexCount > 0) {
    geometry.setIndex(
      new THREE.BufferAttribute(take(Uint32Array, indexCount).slice(), 1),
    );
  }
  return geometry;
}
