/**
 * Builds the client search index consumed by the command palette.
 *
 * Parses every docs/guides/news `page.mdx` into section-granular records (the lead,
 * then each h2/h3), builds a MiniSearch index, and serialises it to
 * `public/search-index.json` - a static asset, so the whole thing is SSG-friendly
 * (no search server at runtime). Anchors are slugged with the same github-slugger
 * the rendered headings use (see `remarkTocExport` in ossido.config.ts), so hits
 * deep-link correctly.
 *
 * Run with:  bun run scripts/build-search-index.ts
 * Wired into the production build via `build.prebuild`, and regenerated in dev by a
 * Vite plugin (both in ossido.config.ts).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import GithubSlugger from 'github-slugger';
import { toString as mdastToString } from 'mdast-util-to-string';
import MiniSearch from 'minisearch';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { parse as parseYaml } from 'yaml';
import { SEARCH_OPTIONS, type SearchRecord } from '../src/utils/search-config.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Content areas to index. `base` is the route root; `group` labels results.
const SOURCES = [
  { dir: 'src/routes/documentation', base: '/documentation', group: 'Documentation' },
  { dir: 'src/routes/guides', base: '/guides', group: 'Guides' },
  { dir: 'src/routes/news', base: '/news', group: 'News' },
];

const processor = unified().use(remarkParse).use(remarkMdx).use(remarkFrontmatter);

function findPageMdx(absDir: string): Array<string> {
  let entries: Array<string>;
  try {
    entries = readdirSync(absDir, { recursive: true }) as Array<string>;
  } catch {
    return [];
  }
  return entries.filter((e) => e.replace(/\\/g, '/').endsWith('/page.mdx') || e === 'page.mdx');
}

function urlFor(base: string, dir: string, file: string): string {
  const slug = relative(dir, file).replace(/\\/g, '/').replace(/\/?page\.mdx$/, '');
  return slug ? `${base}/${slug}` : base;
}

interface Section {
  heading: string;
  anchor: string;
  text: string;
}

function extract(raw: string): { title: string; sections: Array<Section>; lead: Section; fm: Record<string, unknown> } {
  const tree = processor.parse(raw);
  const slugger = new GithubSlugger();
  const lead: Section = { heading: '', anchor: '', text: '' };
  const sections: Array<Section> = [];
  let current = lead;
  let title = '';
  let fm: Record<string, unknown> = {};

  for (const node of (tree as { children: Array<Record<string, unknown>> }).children) {
    const type = node.type as string;
    if (type === 'yaml') {
      try {
        fm = (parseYaml(node.value as string) as Record<string, unknown>) ?? {};
      } catch {
        fm = {};
      }
      continue;
    }
    if (type === 'mdxjsEsm') continue; // import/export statements

    if (type === 'heading') {
      const text = mdastToString(node).trim();
      const anchor = slugger.slug(text); // advance for EVERY heading, for anchor parity
      const depth = node.depth as number;
      if (depth === 1) {
        if (!title) title = text;
        continue;
      }
      if (depth === 2 || depth === 3) {
        current = { heading: text, anchor, text: '' };
        sections.push(current);
        continue;
      }
      current.text += ` ${text}`; // h4-h6 fold into the current section's body
      continue;
    }

    current.text += ` ${mdastToString(node)}`;
  }

  return { title, sections, lead, fm };
}

const records: Array<SearchRecord> = [];

for (const { dir, base, group } of SOURCES) {
  const absDir = join(ROOT, dir);
  for (const rel of findPageMdx(absDir)) {
    const file = join(absDir, rel);
    const raw = readFileSync(file, 'utf8');
    const { title, sections, lead, fm } = extract(raw);
    const url = urlFor(base, absDir, file);
    const pageTitle = (fm.title as string) || title || url.split('/').pop() || url;
    const blurb = (fm.excerpt as string) || (fm.description as string) || '';

    records.push({
      id: url,
      title: pageTitle,
      section: '',
      content: `${blurb} ${lead.text}`.trim(),
      url,
      group,
    });

    for (const s of sections) {
      const surl = `${url}#${s.anchor}`;
      records.push({
        id: surl,
        title: pageTitle,
        section: s.heading,
        content: s.text.trim(),
        url: surl,
        group,
      });
    }
  }
}

const mini = new MiniSearch<SearchRecord>(SEARCH_OPTIONS);
mini.addAll(records);

const out = join(ROOT, 'public/search-index.json');
writeFileSync(out, JSON.stringify(mini));
