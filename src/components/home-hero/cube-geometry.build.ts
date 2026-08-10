import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  CORNER_RADIUS,
  CORNER_SEGMENTS,
  CURVE_SEGMENTS,
  CUT_OVERSHOOT,
  DEBOSS_DEPTH,
  SYMBOL_PLACEMENTS,
  SYMBOL_SPAN,
  SYMBOL_SVGS,
  type SymbolCutters,
} from './cube-geometry';

/**
 * The expensive boolean build for the engraved cube. Kept out of the main bundle:
 * the app loads a pre-baked geometry (see `scripts/bake-cube.ts`) and only reaches
 * here as a fallback (via dynamic import) or from the bake script itself — so
 * `three-bvh-csg` never rides in the critical path.
 */

/** Reverse triangle winding of a non-indexed geometry. */
function flipWinding(geometry: THREE.BufferGeometry): void {
  for (const name of ['position', 'normal', 'uv'] as const) {
    const attr = geometry.getAttribute(name);
    if (!attr) continue;
    const array = attr.array as Float32Array;
    const size = attr.itemSize;
    for (let tri = 0; tri < attr.count; tri += 3) {
      for (let k = 0; k < size; k++) {
        const a = (tri + 1) * size + k;
        const b = (tri + 2) * size + k;
        const tmp = array[a];
        array[a] = array[b];
        array[b] = tmp;
      }
    }
    attr.needsUpdate = true;
  }
}

/**
 * Parse SVG text (filled paths) and extrude a centred, upright, unit-scaled cutter
 * solid facing +Z (spanning z = 0…depth), later positioned to punch a recess.
 *
 * Note: the SVG must be built from filled paths — `SVGLoader` does not expand
 * `<use>`, apply `<mask>`, or convert strokes to fills.
 */
export function extrudeCutter(svgText: string): THREE.BufferGeometry {
  const parsed = new SVGLoader().parse(svgText);

  const shapes: Array<THREE.Shape> = [];
  for (const path of parsed.paths) {
    for (const shape of SVGLoader.createShapes(path)) shapes.push(shape);
  }

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: DEBOSS_DEPTH + CUT_OVERSHOOT,
    bevelEnabled: false,
    curveSegments: CURVE_SEGMENTS,
  });

  // SVG space is Y-down; three is Y-up. Mirror Y (a reflection), then restore
  // outward-facing winding so CSG classifies inside/outside correctly.
  geometry.applyMatrix4(new THREE.Matrix4().makeScale(1, -1, 1));
  flipWinding(geometry);

  // Scale to the target span and centre on XY (keeping z = 0…depth intact).
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (box) {
    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;
    const scale = SYMBOL_SPAN / Math.max(width, height);
    geometry.applyMatrix4(new THREE.Matrix4().makeScale(scale, scale, 1));
    geometry.computeBoundingBox();
    const b2 = geometry.boundingBox;
    if (b2) {
      const cx = (b2.max.x + b2.min.x) / 2;
      const cy = (b2.max.y + b2.min.y) / 2;
      geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-cx, -cy, 0));
    }
  }

  return geometry;
}

/**
 * Re-derive UVs by box (planar) projection: each vertex is mapped along its own
 * shading normal's dominant axis (`(coord + 1) / 2`). Index-agnostic (the CSG
 * output is indexed, so consecutive position entries aren't a triangle), which is
 * why it classifies per-vertex by the stored normal rather than by winding.
 */
function applyBoxProjectedUVs(geometry: THREE.BufferGeometry): void {
  const position = geometry.getAttribute('position');
  if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
  const normals = geometry.getAttribute('normal');
  const uv = new Float32Array(position.count * 2);

  for (let i = 0; i < position.count; i++) {
    const ax = Math.abs(normals.getX(i));
    const ay = Math.abs(normals.getY(i));
    const az = Math.abs(normals.getZ(i));
    const px = position.getX(i);
    const py = position.getY(i);
    const pz = position.getZ(i);
    let u: number;
    let v: number;
    if (az >= ax && az >= ay) {
      u = (px + 1) / 2; // z-facing (front/back)
      v = (py + 1) / 2;
    } else if (ax >= ay) {
      u = (pz + 1) / 2; // x-facing walls
      v = (py + 1) / 2;
    } else {
      u = (px + 1) / 2; // y-facing (top/bottom) walls & floors
      v = (pz + 1) / 2;
    }
    uv[i * 2] = u;
    uv[i * 2 + 1] = v;
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  // The AO map samples the second UV set (`uv1`); reuse the same box projection.
  geometry.setAttribute('uv1', new THREE.BufferAttribute(uv.slice(), 2));
}

/**
 * Subtract the six symbol cutters from a rounded box and box-project its UVs. This
 * is the deterministic, expensive part that gets baked; the cheap per-vertex passes
 * (morph + emissive) are added later by `hydrateEngravedGeometry`.
 */
export function buildEngravedBase(cutters: SymbolCutters): THREE.BufferGeometry {
  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  const slot = new THREE.MeshBasicMaterial();
  const boxGeometry = new RoundedBoxGeometry(2, 2, 2, CORNER_SEGMENTS, CORNER_RADIUS);
  let result = new Brush(boxGeometry, slot);
  result.updateMatrixWorld();

  const d = 1 - DEBOSS_DEPTH;
  for (const place of SYMBOL_PLACEMENTS) {
    const cutter = new Brush(cutters[place.symbol], slot);
    cutter.rotation.set(place.rotation[0], place.rotation[1], place.rotation[2]);
    cutter.position.set(place.dir[0] * d, place.dir[1] * d, place.dir[2] * d);
    cutter.updateMatrixWorld();
    result = evaluator.evaluate(result, cutter, SUBTRACTION);
  }

  slot.dispose();
  applyBoxProjectedUVs(result.geometry);
  // The CSG output is triangle soup with many exact-duplicate vertices; index it so
  // the baked file (and the GPU upload) carries each unique vertex once. Distinct
  // normals/UVs at face seams aren't merged, so the faceting is preserved.
  return mergeVertices(result.geometry);
}

/** Browser fallback: fetch the SVGs and cut the base geometry live. */
export async function buildEngravedBaseLive(): Promise<THREE.BufferGeometry> {
  const [react, rust, bolt] = await Promise.all(
    [SYMBOL_SVGS.react, SYMBOL_SVGS.rust, SYMBOL_SVGS.bolt].map((url) =>
      fetch(url).then((r) => r.text()).then(extrudeCutter),
    ),
  );
  return buildEngravedBase({ react, rust, bolt });
}
