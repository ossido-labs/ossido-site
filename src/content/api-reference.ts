/**
 * API Reference — shared types + grouping helpers.
 *
 * The *content* lives in per-symbol markdown files under `src/content/api-reference/*.md`
 * (frontmatter: name / ecosystem / kind / order / guide / source / optional signature;
 * body: details prose + captioned example code fences). `scripts/build-api-reference.ts`
 * reads those, injects each signature + one-line description from the framework source,
 * and emits the committed `./api-reference.generated.ts` that the pages render. This
 * module holds only the types and the ecosystem/kind grouping used by both.
 */

export type Ecosystem = 'rust' | 'react';

/** Symbol kind — drives the left-nav grouping ("Macros", "Hooks", …). */
export type SymbolKind =
  | 'macro'
  | 'function'
  | 'hook'
  | 'component'
  | 'class'
  | 'constant'
  | 'struct'
  | 'enum'
  | 'type';

/** A worked example on a symbol's page. */
export interface ExampleSnippet {
  code: string;
  lang?: 'rust' | 'tsx' | 'ts' | 'sh';
  /** Optional one-line caption above the snippet. */
  caption?: string;
}

/** One resolved entry — the shape `./api-reference.generated.ts` exports and the
 *  pages render. */
export interface ResolvedApiEntry {
  key: string;
  name: string;
  ecosystem: Ecosystem;
  kind: SymbolKind;
  guideHref?: string;
  /** Highlight language for the signature block. */
  language: 'rust' | 'tsx';
  signature: string;
  description: string;
  details?: string;
  examples: Array<ExampleSnippet>;
}

export interface KindGroup {
  kind: SymbolKind;
  label: string;
  entries: Array<ResolvedApiEntry>;
}

/** Left-nav group label per kind, and the order groups appear in. */
export const KIND_LABEL: Record<SymbolKind, string> = {
  macro: 'Macros',
  function: 'Functions',
  hook: 'Hooks',
  component: 'Components',
  class: 'Classes',
  constant: 'Constants',
  struct: 'Structs',
  enum: 'Enums',
  type: 'Types',
};
export const KIND_ORDER: ReadonlyArray<SymbolKind> = [
  'macro',
  'component',
  'hook',
  'function',
  'class',
  'constant',
  'struct',
  'enum',
  'type',
];

export const ECOSYSTEM_LABEL: Record<Ecosystem, string> = { rust: 'Rust', react: 'React' };

/** Group an ecosystem's entries by kind, in `KIND_ORDER`. */
export function groupByKind(
  entries: ReadonlyArray<ResolvedApiEntry>,
  ecosystem: Ecosystem,
): Array<KindGroup> {
  const groups: Array<KindGroup> = [];
  for (const kind of KIND_ORDER) {
    const inKind = entries.filter((e) => e.ecosystem === ecosystem && e.kind === kind);
    if (inKind.length) groups.push({ kind, label: KIND_LABEL[kind], entries: inKind });
  }
  return groups;
}
