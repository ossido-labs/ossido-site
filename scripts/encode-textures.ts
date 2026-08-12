/**
 * Encode the obsidian PBR texture set to KTX2 (Basis Universal) so the cube's five
 * maps stay GPU-compressed in VRAM (ASTC/ETC/BC via the transcoder) instead of being
 * uploaded as full 32-bpp RGBA. That's ~4× less texture memory and, more to the
 * point on fill-rate-bound mobile GPUs (iOS Safari especially), ~4× less per-fragment
 * sampling bandwidth across all five maps.
 *
 * Reads the 2048² PNG originals (not the lossy WebP) from a source dir and writes
 * `public/obsidian/<name>.ktx2`, downsampled to 1024² (plenty for the render size)
 * with mipmaps. The outputs are committed — CI has no `basisu` — so this is a manual
 * regen step, not part of the build:
 *
 *   brew install basis_universal        # provides `basisu`
 *   bun run encode-textures [srcDir]     # srcDir defaults to ~/Documents/obsidion
 *
 * Encode modes are per-map: ETC1S (small, supercompressed) for the color/metalness/AO
 * maps, and higher-quality UASTC for the normal and roughness maps, where ETC1S
 * blocking would show (the normal drives lighting; the roughness doubles as the
 * emissive map that feeds the glow bloom). `-y_flip` matches three's default flipY —
 * compressed textures can't be flipped at upload, so the flip is baked in here.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = process.argv[2] ?? join(homedir(), 'Documents', 'obsidion');
const outDir = join(root, 'public', 'obsidian');

const SIZE = 1024;

/** Per-map encode settings; `height-map` is intentionally omitted (unused by the material). */
const MAPS: ReadonlyArray<{ name: string; args: Array<string> }> = [
  // Colour: sRGB. ETC1S is ample for the near-black, low-detail obsidian albedo.
  { name: 'colour-map', args: [] },
  // Normal: directional data — UASTC + normal-map tuning, renormalised per mip.
  {
    name: 'normal-map',
    args: ['-uastc', '-uastc_level', '2', '-normal_map', '-mip_renorm'],
  },
  // Roughness (also the emissive map): UASTC linear, so glow detail doesn't band.
  {
    name: 'roughness-map',
    args: ['-uastc', '-uastc_level', '2', '-linear', '-mip_linear'],
  },
  // Metalness / AO: smooth linear data — ETC1S is fine and keeps the download small.
  { name: 'metallic-map', args: ['-linear', '-mip_linear'] },
  { name: 'ambient-occlusion', args: ['-linear', '-mip_linear'] },
];

if (!existsSync(srcDir)) {
  console.error(
    `Source dir not found: ${srcDir}\nPass it explicitly: bun run encode-textures <dir>`,
  );
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

for (const map of MAPS) {
  const input = join(srcDir, `${map.name}.png`);
  const output = join(outDir, `${map.name}.ktx2`);
  const args = [
    '-ktx2',
    '-mipmap',
    '-resample',
    String(SIZE),
    String(SIZE),
    '-y_flip',
    ...map.args,
    '-output_file',
    output,
    input,
  ];
  console.log(
    `basisu ${map.name} → ${map.args.includes('-uastc') ? 'UASTC' : 'ETC1S'} ${SIZE}²`,
  );
  execFileSync('basisu', args, { stdio: ['ignore', 'ignore', 'inherit'] });
}

console.log(`Encoded ${MAPS.length} maps → public/obsidian/*.ktx2`);
