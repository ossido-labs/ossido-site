/**
 * Tunable constants for the home-hero components - the counter-rotating "oxide"
 * word rings, oxygen's electron shells, and the obsidian cube. Kept free of React
 * and three imports so the DOM ring components and (indirectly) the offline geometry
 * bake can all read it. The cube's *geometry-spec* constants (deboss depth, symbol
 * placements, ...) live with the geometry code in `./cube-geometry`, since the bake
 * pipeline depends on them there.
 */

/* ── Layout ──────────────────────────────────────────────────────────────── */

/** Ensemble footprint (px) at full width; the hero scales down with the viewport below it. */
export const HERO_TARGET = 700;
/** Cube diameter as a fraction of the whole ensemble. */
export const CUBE_RATIO = 1 / 1.25;

/* ── Word rings ──────────────────────────────────────────────────────────── */

/**
 * "Oxide" across languages - the brand word "ossido" (Italian) among its kin.
 * Latin-script only, so they share one typeface cleanly on the ring.
 */
export const OXIDE_TRANSLATIONS = [
  'ossido', // Italian
  'oxide', // English
  'oxyde', // French
  'óxido', // Spanish
  'Oxid', // German
  'oksido', // Esperanto
  'oxidum', // Latin
  'tlenek', // Polish
  'oxid', // Czech / Romanian
  'oksit', // Turkish
] as const;

/**
 * A few more translations for the tighter inner ring, mixing scripts. Simple /
 * independent-glyph scripts only (Latin, Cyrillic, Greek, CJK) - they render
 * cleanly on a curved, spaced path; complex scripts like Devanagari get their
 * conjuncts split by the path spacing.
 */
export const OXIDE_TRANSLATIONS_INNER = [
  'oksid', // Serbo-Croatian
  'oxit', // Vietnamese
  'oksīds', // Latvian
  'oksidas', // Lithuanian
  'оксид', // Russian
  'οξείδιο', // Greek
  '酸化物', // Japanese
] as const;

/** Multi-script sans: Latin/Greek/Cyrillic + Devanagari + CJK all in one family. */
export const NOTO_STACK =
  "'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans JP', sans-serif";

/** Separator between words around the ring. Non-breaking spaces so SVG doesn't
 * collapse the run to one space or trim the trailing one at the seam. */
export const WORD_SEPARATOR = String.fromCharCode(160, 160, 183, 160, 160); // nbsp nbsp · nbsp nbsp

/** Word-ring text radius within the 0-100 viewBox. */
export const RING_RADIUS = 42;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
/** A full circle starting at the top, running clockwise (upright text along the top). */
export const RING_CIRCLE_PATH = `M50,${50 - RING_RADIUS} a${RING_RADIUS},${RING_RADIUS} 0 1,1 0,${2 * RING_RADIUS} a${RING_RADIUS},${RING_RADIUS} 0 1,1 0,-${2 * RING_RADIUS}`;
/** Fill the circle up to this fraction of its perimeter; `textLength` then stretches
 * the small remainder so it meets seamlessly. Keeping it < 1 guarantees `spacing`
 * only ever *adds* space, never compresses (which would overlap wide CJK glyphs). */
export const RING_FILL_FRACTION = 0.97;

/** Fade + subtle scale-in entrance (see the `ring-in` keyframe in global.css), held
 * invisible until its delay (`both`), skipped under reduced motion. Slow + gentle. */
export const RING_ENTER =
  '[animation:ring-in_1.5s_cubic-bezier(0.33,1,0.68,1)_both] motion-reduce:[animation:none]';

/* ── Electron shells ─────────────────────────────────────────────────────── */

/** Electron orbit radius within the 0-100 viewBox. */
export const ORBIT_RADIUS = 46;
/** Electron diameter in px, held constant regardless of shell size. */
export const ELECTRON_PX = 12;

/* ── OxygenAtom (interleaved rings) ──────────────────────────────────────── */

/** Colour shared by every ring - the electrons and text alike. Resolves via the
 * `--color-ossido-ring` theme token (see theme.css), so it flips with light/dark mode. */
export const ATOM_RING_COLOR = 'var(--color-ossido-ring)';
/** Each ring's box as a fraction of the whole ensemble, interleaved by radius:
 *  inner word → inner electron shell → outer word → outer electron shell. */
export const ATOM_INNER_WORD_RATIO = 0.73;
export const ATOM_INNER_SHELL_RATIO = 0.8;
export const ATOM_OUTER_WORD_RATIO = 0.95;
export const ATOM_OUTER_SHELL_RATIO = 0.995;
/** Seconds between each ring's entrance, innermost first. */
export const ATOM_ENTER_STAGGER = 0.35;

/* ── Cube: pose, lighting, material ──────────────────────────────────────── */

/**
 * Isometric rest pose. Yawing 45° and tilting by `atan(1/√2)` (≈35.26°) lands the
 * cube on a vertex, foreshortening the three visible faces equally - the canonical
 * isometric read. Paired with the orthographic camera (no perspective divergence),
 * this is a true isometric projection.
 */
export const ISO_Y = Math.PI / 4;
export const ISO_X = Math.atan(1 / Math.SQRT2);

/** Near-white key/fill with only a hint of warmth, so the metal isn't overly rusty. */
export const LIGHT_KEY = '#eff7ff';
export const LIGHT_FILL = '#dae6ff';

/** Overall glow strength - multiplies the per-vertex colour and the (fairly dark)
 * emissive map, so it runs high; only the map's brighter facets bloom. */
export const EMISSIVE_INTENSITY = 3.0;

/**
 * PBR (metalness workflow) texture set, served from `public/` at the site root.
 * KTX2 (Basis Universal) 1K re-encodes of the 2K source PNGs - they stay
 * GPU-compressed in VRAM (transcoded to ASTC/ETC/BC per device), so texture memory
 * and per-fragment sampling bandwidth are ~4× lower than uploading full RGBA. See
 * `scripts/encode-textures.ts` for the encode; the Basis transcoder is at
 * `public/basis/`. (The old WebP set is kept alongside as a reference/fallback.)
 */
export const TEX_BASE = '/obsidian/';
export const TEXTURES = {
  map: `${TEX_BASE}colour-map.ktx2`,
  normalMap: `${TEX_BASE}normal-map.ktx2`,
  roughnessMap: `${TEX_BASE}roughness-map.ktx2`,
  metalnessMap: `${TEX_BASE}metallic-map.ktx2`,
  aoMap: `${TEX_BASE}ambient-occlusion.ktx2`,
} as const;

/** Path (under `public/`) to the Basis Universal transcoder that `KTX2Loader` needs
 * to decode the compressed maps to the device's supported GPU format. */
export const KTX2_TRANSCODER_PATH = '/basis/';

/** UV repeat < 1 samples a smaller window of the source, so the corrosion detail
 * appears physically larger on each face (i.e. the texture "tiles" less). */
export const TEXTURE_REPEAT = 0.5;

/** Normal-map intensity. Kept low for obsidian: its shard detail is already baked
 * into the albedo/roughness, so a strong normal only buries the engravings. */
export const BUMP_STRENGTH = 0.22;

/** How far (radians) the cube tilts toward the pointer once settled. Kept subtle. */
export const FOLLOW_AMPLITUDE = 0.2;

/** Orthographic zoom is `canvasWidth / ZOOM_DIVISOR` (pixels-per-world-unit), sized
 * so the cube's ~3.46-unit diagonal fits the canvas with margin at any size. */
export const ZOOM_DIVISOR = 4.5;

/* ── Cube: spin-in + engraving reveal ────────────────────────────────────── */

/** Fraction of the eased spin-in after which the engravings begin carving in, so
 * they resolve just as the cube settles (0.6 → last 40% of the settle). */
export const ENGRAVE_START = 0.6;

/** Spin-in progress (0-1) at which the engraving glow begins fading in - partway
 * through the settle, overlapping the carve-in - and the seconds it takes to reach
 * full. A longer fade brings it up gently. */
export const GLOW_START = 0.5;
export const GLOW_FADE = 2.5;

/* ── Cube: showcase tumble ───────────────────────────────────────────────── */

/**
 * Once settled, the cube turns a crisp 90° about the next of its own face axes
 * (local X → Y → Z, cycling) every `STEP_INTERVAL` seconds, easing over
 * `STEP_DURATION`. A quarter-turn about a face axis is a cube symmetry, so it always
 * lands vertex-on again - back in a true isometric pose - while rolling a fresh set
 * of engraved faces into view.
 */
export const STEP_INTERVAL = 10;
export const STEP_DURATION = 0.8;
