import { execSync } from 'node:child_process';
import type { OssidoConfig } from '@ossido-labs/ossido/config';
import tailwindcss from '@tailwindcss/vite';
import { valueToEstree } from 'estree-util-value-to-estree';
import GithubSlugger from 'github-slugger';
import type { Root } from 'mdast';
import { toString as mdastToString } from 'mdast-util-to-string';
import { ossidoMdx } from '@ossido-labs/ossido-mdx/vite';
import rehypeSlug from 'rehype-slug';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import type { Plugin, Transformer } from 'unified';
import { visit } from 'unist-util-visit';
import type { Plugin as VitePlugin } from 'vite';

/**
 * Emit `export const toc = [...]` from each document's h2/h3 headings so the
 * docs/guides "On this page" rail can render server-side (read via
 * `import.meta.glob(..., { import: 'toc' })` in the section layouts). Ids are
 * produced with the same `github-slugger` `rehype-slug` uses, and the slugger is
 * advanced for *every* heading in document order, so the ids - including
 * duplicate-heading counters - match the rendered heading ids exactly.
 */
const remarkTocExport: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree) => {
    const slugger = new GithubSlugger();
    const toc: Array<{ id: string; text: string; level: number }> = [];

    visit(tree, 'heading', (node) => {
      const text = mdastToString(node);
      const id = slugger.slug(text);
      if (node.depth === 2 || node.depth === 3) {
        toc.push({ id, text, level: node.depth });
      }
    });

    tree.children.unshift({
      type: 'mdxjsEsm',
      value: '',
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          body: [
            {
              type: 'ExportNamedDeclaration',
              source: null,
              specifiers: [],
              declaration: {
                type: 'VariableDeclaration',
                kind: 'const',
                declarations: [
                  {
                    type: 'VariableDeclarator',
                    id: { type: 'Identifier', name: 'toc' },
                    init: valueToEstree(toc),
                  },
                ],
              },
            },
          ],
        },
      },
      // mdxjsEsm isn't part of mdast's own content union; @mdx-js consumes it downstream.
    } as unknown as Root['children'][number]);
  };

  return transformer;
};

/**
 * Regenerate the search index in dev. `ossido dev` doesn't run the build hooks, so
 * this builds the index when the dev server starts and whenever a `page.mdx`
 * changes. Production builds use the `build.prebuild` hook instead (this plugin is
 * `apply: 'serve'` only).
 */
function searchIndexDevPlugin(): VitePlugin {
  const rebuild = () => {
    try {
      execSync('bun run scripts/build-search-index.ts', { stdio: 'inherit' });
    } catch {
      // A malformed mdx mid-edit shouldn't crash the dev server.
    }
  };
  return {
    name: 'ossido-search-index-dev',
    apply: 'serve',
    buildStart() {
      rebuild();
    },
    configureServer(server) {
      const onChange = (file: string) => {
        if (file.endsWith('.mdx')) rebuild();
      };
      server.watcher.on('add', onChange);
      server.watcher.on('change', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}

const config: OssidoConfig = {
  output: 'static',
  server: { port: 3000 },
  // viewTransitions: true,
  build: {
    // Bake the engraved-cube mesh to public/cube-geometry.bin, and build the
    // command-palette search index to public/search-index.json. Both read/produce
    // files under public/, which the build copies into the output, so they have to
    // run *before* the build - i.e. prebuild, not postbuild.
    prebuild: () => {
      execSync('bun run scripts/bake-cube.ts', { stdio: 'inherit' });
      // Refresh the pinned/latest benchmark snapshot (src/content/benchmarks.generated.ts)
      // that the /benchmarks page renders, before the build reads it.
      execSync('bun run scripts/build-benchmarks.ts', { stdio: 'inherit' });
      execSync('bun run scripts/build-search-index.ts', { stdio: 'inherit' });
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ['@tailwindcss/oxide'],
    },
    plugins: [
      tailwindcss(),
      searchIndexDevPlugin(),
      ...ossidoMdx({
        mdxOptions: {
          // `remark-frontmatter` parses the leading `---` block; `remark-mdx-frontmatter`
          // turns it into `export const frontmatter = {...}` (used by /news posts).
          // `remarkTocExport` (above) emits `export const toc = [...]` for the
          // server-rendered "On this page" rail.
          remarkPlugins: [
            remarkFrontmatter,
            remarkMdxFrontmatter,
            remarkTocExport,
          ],
          rehypePlugins: [rehypeSlug],
        },
      }),
    ],
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
};

export default config;
