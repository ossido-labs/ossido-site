/**
 * Generates the API Reference data the `/api-reference` page renders. Reads the
 * curated whitelist (`src/content/api-reference.ts`), extracts each entry's
 * **signature** and **description** from the framework source, and writes the
 * committed `src/content/api-reference.generated.ts`.
 *
 *   - TypeScript entries: resolved from the installed `@ossido-labs/*` `.d.ts`
 *     (present in this repo's node_modules) via the TypeScript compiler API.
 *   - Rust entries: parsed from the Ossido monorepo source (`crates/ossido/**`,
 *     `crates/ossido_macros/**`).
 *
 * The output is committed (like the baked cube geometry / KTX2 textures) because CI
 * has no `tuono` checkout, so this is a manual regen step:
 *
 *   bun run build-api-reference [tuonoDir]   # tuonoDir defaults to ~/RustroverProjects/tuono
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
  mkdirSync,
  rmSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { parse as parseYaml } from 'yaml';
import {
  KIND_ORDER,
  type Ecosystem,
  type ExampleSnippet,
  type ResolvedApiEntry,
  type SymbolKind,
} from '../src/content/api-reference.ts';

/** Where the generator finds an entry's signature + doc comment. */
type ApiSource =
  | { kind: 'rust'; symbol: string }
  | { kind: 'rust-macro'; name: string }
  | { kind: 'ts'; module: string; export: string };

/** Frontmatter of a per-symbol `src/content/api-reference/<key>.md`. */
interface Frontmatter {
  name: string;
  ecosystem: Ecosystem;
  kind: SymbolKind;
  order: number;
  guide?: string;
  source: ApiSource;
  signature?: string;
  description?: string;
}

interface MdEntry {
  key: string;
  fm: Frontmatter;
  /** Prose paragraphs not attached to a code block. */
  details: string;
  examples: Array<ExampleSnippet>;
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TUONO =
  process.argv[2] ??
  process.env.OSSIDO_SRC ??
  join(homedir(), 'RustroverProjects', 'tuono');

const collapse = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** Conform em/en dashes and ellipses to CLAUDE.md house style (for signatures,
 *  whose inline source doc-comments may use them). */
const conformPunct = (s: string): string =>
  s.replace(/[—–]/g, '-').replace(/…/g, '...');

/** Normalise a doc comment to plain prose: drop rustdoc/JSDoc markup, and conform to
 *  CLAUDE.md prose (no em/en dashes, ellipses, or smart quotes) so extracted
 *  framework docs match the site's house style. */
const cleanDescription = (s: string): string =>
  collapse(
    s
      .replace(/\{@link(?:code|plain)?\s+([^}|]+?)(?:\|[^}]*)?\}/g, '$1') // {@link X} → X
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [text](url) → text
      .replace(/(?<!#)\[([^\]]+)\]/g, '$1') // bare [rustdoc::intra-doc] link → text (but not a Rust `#[attr]`)
      .replace(/`/g, '') // inline-code ticks → plain
      .replace(/[—–]/g, '-') // em/en dash → hyphen
      .replace(/…/g, '...') // ellipsis → periods
      .replace(/[‘’]/g, "'") // smart single quotes → straight
      .replace(/[“”]/g, '"'), // smart double quotes → straight
  );

/**
 * Reduce a `/** ... *\/` JSDoc block (raw inner text) to a one-paragraph summary:
 * strip leading `*`, and stop at the first `@tag` line.
 */
function jsdocSummary(raw: string): string {
  const out: Array<string> = [];
  for (const line of raw.split('\n')) {
    const t = line.replace(/^\s*\*\s?/, '').trim();
    if (t.startsWith('@')) break;
    out.push(t);
  }
  return collapse(out.join(' '));
}

/* ── Files ─────────────────────────────────────────────────────────────────── */

function filesUnder(dir: string, ext: string): Array<string> {
  if (!existsSync(dir)) return [];
  const out: Array<string> = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === 'target')
      continue;
    const p = join(dir, entry);
    let isDir = false;
    try {
      isDir = statSync(p).isDirectory(); // statSync follows symlinks; skip broken ones
    } catch {
      continue;
    }
    if (isDir) out.push(...filesUnder(p, ext));
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

/* ── TypeScript extraction (scan the built .d.ts by name) ──────────────────── */

/** Read a `.d.ts` declaration starting at line `i`. Interface/class/enum → balanced
 *  braces; function/const/type → up to the top-level `;` (tracking `{}` depth so a
 *  `;` inside an object type doesn't end it early). */
function readDtsDecl(lines: Array<string>, i: number, kind: string): string {
  if (kind === 'interface' || kind === 'class' || kind === 'enum') {
    return readBraced(lines, i);
  }
  let buf = '';
  let depth = 0;
  for (let k = i; k < lines.length; k++) {
    for (const ch of lines[k]) {
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      buf += ch;
      if (ch === ';' && depth === 0) return buf.trim();
    }
    buf += '\n';
  }
  return buf.trim();
}

/** JSDoc block immediately above line `i` (skipping blank lines). */
function jsdocAbove(lines: Array<string>, i: number): string {
  let j = i - 1;
  while (j >= 0 && lines[j].trim() === '') j--;
  if (j < 0 || !lines[j].trim().endsWith('*/')) return '';
  const end = j;
  while (j >= 0 && !lines[j].includes('/**')) j--;
  if (j < 0) return '';
  const block = lines.slice(j, end + 1).join('\n');
  return jsdocSummary(block.replace(/^\s*\/\*\*/, '').replace(/\*\/\s*$/, ''));
}

const stripLead = (t: string): string =>
  t
    .replace(/^export\s+/, '')
    .replace(/^declare\s+/, '')
    .trim();

/** JSDoc description above an export/declaration of `name` in TS *source* — a
 *  fallback for symbols whose built `.d.ts` carries no comment (or is stale). */
function extractTsDoc(srcFiles: Array<string>, name: string): string {
  const re = new RegExp(
    `\\b(?:export\\s+)?(?:default\\s+)?(?:async\\s+)?(?:function|const|let|var|class|interface|type|enum)\\s+${name}\\b`,
  );
  for (const file of srcFiles) {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) {
        const doc = jsdocAbove(lines, i);
        if (doc) return doc;
      }
    }
  }
  return '';
}

function extractTs(
  dtsFiles: Array<string>,
  name: string,
): { signature: string; description: string } | null {
  const kinds: Array<[RegExp, string]> = [
    [
      new RegExp(`^\\s*export\\s+(?:declare\\s+)?function\\s+${name}\\b`),
      'function',
    ],
    [new RegExp(`^\\s*export\\s+(?:declare\\s+)?const\\s+${name}\\b`), 'const'],
    [new RegExp(`^\\s*export\\s+(?:declare\\s+)?class\\s+${name}\\b`), 'class'],
    [new RegExp(`^\\s*export\\s+interface\\s+${name}\\b`), 'interface'],
    [new RegExp(`^\\s*export\\s+(?:declare\\s+)?enum\\s+${name}\\b`), 'enum'],
    [new RegExp(`^\\s*export\\s+type\\s+${name}\\b`), 'type'],
  ];
  for (const file of dtsFiles) {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const hit = kinds.find(([re]) => re.test(lines[i]));
      if (!hit) continue;
      const raw = stripLead(readDtsDecl(lines, i, hit[1]));
      const signature =
        hit[1] === 'interface' || hit[1] === 'class' || hit[1] === 'enum'
          ? raw
          : collapse(raw);
      return { signature, description: jsdocAbove(lines, i) };
    }
  }
  return null;
}

/* ── Rust extraction (source parsing) ──────────────────────────────────────── */

/** Read a braced item (struct/enum/interface/class) from line `i`, balanced. */
function readBraced(lines: Array<string>, i: number): string {
  let buf = '';
  let depth = 0;
  let opened = false;
  for (let k = i; k < lines.length; k++) {
    for (const ch of lines[k]) {
      if (ch === '{') {
        depth++;
        opened = true;
      } else if (ch === '}') {
        depth--;
      } else if (ch === ';' && depth === 0 && !opened) {
        return (buf + ';').trim();
      }
      buf += ch;
      if (opened && depth === 0) return buf.trim();
    }
    buf += '\n';
  }
  return buf.trim();
}

function rustFiles(dir: string): Array<string> {
  if (!existsSync(dir)) return [];
  const out: Array<string> = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...rustFiles(p));
    else if (entry.endsWith('.rs')) out.push(p);
  }
  return out;
}

/** Collect the contiguous `///` doc block above line `i`, skipping any attribute
 *  (`#[...]`) and blank lines that sit between the doc and the item. */
function docAbove(lines: Array<string>, i: number): string {
  let j = i - 1;
  while (j >= 0 && (lines[j].trim().startsWith('#[') || lines[j].trim() === ''))
    j--;
  const doc: Array<string> = [];
  while (j >= 0 && lines[j].trim().startsWith('///')) {
    doc.unshift(lines[j].trim().replace(/^\/\/\/\s?/, ''));
    j--;
  }
  return collapse(doc.join(' '));
}

/** Read a Rust item starting at line `i`. For `fn`, stop at the signature (first
 *  top-level `{` or `;`). For `struct`/`enum`, capture the balanced body so fields
 *  and variants show. */
function readRustItem(
  lines: Array<string>,
  i: number,
  keepBody: boolean,
): string {
  let buf = '';
  let depth = 0;
  let opened = false;
  for (let k = i; k < lines.length; k++) {
    for (const ch of lines[k]) {
      if (ch === '{') {
        if (!keepBody) return buf.trim();
        depth++;
        opened = true;
        buf += ch;
      } else if (ch === '}') {
        depth--;
        buf += ch;
        if (opened && depth === 0) return buf.trim();
      } else if (ch === ';' && depth === 0) {
        return (buf + ';').trim();
      } else {
        buf += ch;
      }
    }
    buf += '\n';
  }
  return buf.trim();
}

function extractRust(
  files: Array<string>,
  symbol: string,
): { signature: string; description: string } | null {
  const re = new RegExp(`^\\s*pub\\s+(fn|struct|enum)\\s+${symbol}\\b`);
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = re.exec(lines[i]);
      if (!m) continue;
      const kind = m[1];
      const raw = readRustItem(lines, i, kind !== 'fn');
      const signature =
        kind === 'fn' ? collapse(raw).replace(/,\s*$/, '') : raw;
      return { signature, description: docAbove(lines, i) };
    }
  }
  return null;
}

/** Doc comment above the proc-macro's `pub fn <name>` in the macros crate. */
function extractMacroDoc(files: Array<string>, name: string): string {
  const re = new RegExp(`^\\s*pub\\s+fn\\s+${name}\\s*\\(`);
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) return docAbove(lines, i);
    }
  }
  return '';
}

/* ── Resolve every whitelist entry ─────────────────────────────────────────── */

const ossidoSrc = join(TUONO, 'crates', 'ossido', 'src');
const macrosSrc = join(TUONO, 'crates', 'ossido_macros', 'src');
const hasRust = existsSync(ossidoSrc);
if (!hasRust) {
  console.warn(
    `  ! Ossido source not found at ${TUONO} — Rust signatures/descriptions will fall back to the whitelist.\n    Pass the path: bun run build-api-reference /path/to/tuono`,
  );
}
const ossidoFiles = rustFiles(ossidoSrc);
const macroFiles = rustFiles(macrosSrc);

// TypeScript signatures come from the built `.d.ts` — prefer the tuono monorepo's
// `packages/*/dist` (current version, includes the newest APIs); fall back to the
// installed `@ossido-labs/*` in node_modules.
const pkgDir = join(TUONO, 'packages');
let dtsFiles = existsSync(pkgDir)
  ? filesUnder(pkgDir, '.d.ts').filter(
      (f) => f.includes('/dist/') && !f.includes('/node_modules/'),
    )
  : [];
if (!dtsFiles.length) {
  dtsFiles = filesUnder(join(ROOT, 'node_modules', '@ossido-labs'), '.d.ts');
}
if (!dtsFiles.length) {
  console.warn(
    '  ! no .d.ts found — TypeScript signatures will fall back to the whitelist.',
  );
}
// Current TS source (has the newest APIs + JSDoc), for descriptions the built
// `.d.ts` lacks or a stale dist is missing.
const tsSrcFiles = existsSync(pkgDir)
  ? [...filesUnder(pkgDir, '.ts'), ...filesUnder(pkgDir, '.tsx')].filter(
      (f) => f.includes('/src/') && !f.endsWith('.d.ts'),
    )
  : [];

/* ── Read per-symbol markdown ───────────────────────────────────────────────── */

/** Split a markdown body into `details` (standalone prose) and `examples` (code
 *  fences, each captioned by the paragraph immediately above it). */
function parseBody(body: string): {
  details: string;
  examples: Array<ExampleSnippet>;
} {
  const lines = body.split('\n');
  type Block =
    | { type: 'prose'; text: string }
    | { type: 'code'; lang: string; code: string };
  const blocks: Array<Block> = [];
  for (let i = 0; i < lines.length;) {
    const fence = /^```(\w+)?/.exec(lines[i]);
    if (fence) {
      const lang = fence[1] ?? '';
      const code: Array<string> = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```'))
        code.push(lines[i++]);
      i++; // closing fence
      blocks.push({ type: 'code', lang, code: code.join('\n') });
    } else if (lines[i].trim() === '') {
      i++;
    } else {
      const para: Array<string> = [];
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !lines[i].startsWith('```')
      )
        para.push(lines[i++]);
      blocks.push({ type: 'prose', text: para.join(' ').trim() });
    }
  }

  const captionAt = new Set<number>();
  const examples: Array<ExampleSnippet> = [];
  blocks.forEach((block, idx) => {
    if (block.type !== 'code') return;
    const prev = blocks[idx - 1];
    const caption = prev?.type === 'prose' ? prev.text : undefined;
    if (caption) captionAt.add(idx - 1);
    examples.push({
      code: block.code,
      ...(block.lang ? { lang: block.lang as ExampleSnippet['lang'] } : {}),
      ...(caption ? { caption } : {}),
    });
  });
  const details = blocks
    .map((block, idx) =>
      block.type === 'prose' && !captionAt.has(idx) ? block.text : '',
    )
    .filter(Boolean)
    .join('\n\n');
  return { details, examples };
}

function readMdEntries(dir: string): Array<MdEntry> {
  const out: Array<MdEntry> = [];
  for (const name of existsSync(dir) ? readdirSync(dir) : []) {
    if (!name.endsWith('.md')) continue;
    const raw = readFileSync(join(dir, name), 'utf8');
    const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
    if (!m) {
      console.warn(`  ! ${name}: missing frontmatter — skipped`);
      continue;
    }
    const fm = parseYaml(m[1]) as Frontmatter;
    const { details, examples } = parseBody(m[2] ?? '');
    out.push({ key: name.replace(/\.md$/, ''), fm, details, examples });
  }
  return out;
}

const ECO_ORDER: ReadonlyArray<Ecosystem> = ['rust', 'react'];
const entries = readMdEntries(
  join(ROOT, 'src', 'content', 'api-reference'),
).sort(
  (a, b) =>
    ECO_ORDER.indexOf(a.fm.ecosystem) - ECO_ORDER.indexOf(b.fm.ecosystem) ||
    KIND_ORDER.indexOf(a.fm.kind) - KIND_ORDER.indexOf(b.fm.kind) ||
    a.fm.order - b.fm.order,
);

const resolved: Array<ResolvedApiEntry> = [];
const problems: Array<string> = [];

for (const { key, fm, details, examples } of entries) {
  const src = fm.source;
  let signature = fm.signature ?? '';
  let description = '';

  if (src.kind === 'ts') {
    const got = extractTs(dtsFiles, src.export);
    if (got && !signature) signature = got.signature;
    if (got?.description) description = got.description;
    if (!description) description = extractTsDoc(tsSrcFiles, src.export);
    if (!signature)
      problems.push(
        `TS ${src.module}#${src.export} (${fm.name}) — no signature from .d.ts`,
      );
  } else if (src.kind === 'rust') {
    const got = extractRust(ossidoFiles, src.symbol);
    if (got) {
      if (!signature) signature = got.signature;
      description = got.description;
    } else if (hasRust) {
      problems.push(`Rust ${src.symbol} (${fm.name}) — not found`);
    }
  } else {
    // rust-macro: signature is the frontmatter usage form; description from source.
    description = extractMacroDoc(macroFiles, src.name);
  }

  if (!description) description = fm.description ?? '';
  description = cleanDescription(description);
  if (!signature) problems.push(`${fm.name} — no signature`);
  if (!description) problems.push(`${fm.name} — no description`);

  resolved.push({
    key,
    name: fm.name,
    ecosystem: fm.ecosystem,
    kind: fm.kind,
    ...(fm.guide ? { guideHref: fm.guide } : {}),
    language: fm.ecosystem === 'rust' ? 'rust' : 'tsx',
    signature: conformPunct(signature.trim()),
    description,
    ...(details ? { details } : {}),
    examples,
  });
}

/* ── Emit the committed module ─────────────────────────────────────────────── */

const body = resolved.map((e) => `  ${JSON.stringify(e)},`).join('\n');
const out = `/**
 * GENERATED by scripts/build-api-reference.ts - do not edit by hand.
 * Regenerate with: bun run build-api-reference
 */
import type { ResolvedApiEntry } from './api-reference';

export const API_REFERENCE_RESOLVED: ReadonlyArray<ResolvedApiEntry> = [
${body}
];
`;
writeFileSync(join(ROOT, 'src', 'content', 'api-reference.generated.ts'), out);

/* ── Emit a route (page.tsx) per symbol ────────────────────────────────────── */

// Each symbol gets its own SSG route that renders the shared <SymbolPage>. These
// thin wrappers are generator-owned: stale ones (for removed symbols) are pruned.
const routeDir = join(ROOT, 'src', 'routes', 'api-reference');
const keys = new Set(resolved.map((e) => e.key));
const GENERATED_MARK = '/* GENERATED api-reference symbol page */';

for (const entry of resolved) {
  const dir = join(routeDir, entry.key);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'page.tsx'),
    `${GENERATED_MARK}
import { SymbolPage } from '@/components/api-reference/symbol-page';

export default function Page() {
  return <SymbolPage entryKey=${JSON.stringify(entry.key)} />;
}
`,
  );
}

// Prune folders for symbols no longer in the whitelist (only ones we generated).
let pruned = 0;
for (const name of existsSync(routeDir) ? readdirSync(routeDir) : []) {
  const dir = join(routeDir, name);
  if (!statSync(dir).isDirectory() || keys.has(name)) continue;
  const page = join(dir, 'page.tsx');
  if (
    existsSync(page) &&
    readFileSync(page, 'utf8').startsWith(GENERATED_MARK)
  ) {
    rmSync(dir, { recursive: true, force: true });
    pruned++;
  }
}

// Report.
if (pruned) console.log(`Pruned ${pruned} stale symbol route(s).`);
console.log(
  `Wrote ${resolved.length} symbol pages under src/routes/api-reference/.`,
);
// Report.
const byEco = resolved.reduce<Record<string, number>>(
  (a, e) => ((a[e.ecosystem] = (a[e.ecosystem] ?? 0) + 1), a),
  {},
);
console.log(
  `Resolved ${resolved.length} entries (${byEco.rust ?? 0} rust, ${byEco.react ?? 0} react) → src/content/api-reference.generated.ts`,
);
if (problems.length) {
  console.warn(`\n${problems.length} issue(s):`);
  for (const p of problems) console.warn(`  - ${p}`);
}
