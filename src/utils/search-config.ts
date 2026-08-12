import type { Options } from 'minisearch';

/**
 * One search record = one section of a page (the lead, then each h2/h3). Keeping
 * results section-granular is what makes the palette feel like a command palette:
 * a hit is "Page & Layout Handlers › Dependency injection", linking to the anchor.
 */
export interface SearchRecord {
  /** Unique id, same as `url` (the anchor makes section ids unique per page). */
  id: string;
  /** The page title (h1 or frontmatter title), e.g. "Page & Layout Handlers". */
  title: string;
  /** The heading within the page; empty string for the lead section. */
  section: string;
  /** Prose of this section (indexed, not stored - used for matching only). */
  content: string;
  /** Destination, e.g. `/documentation/ossido-application#dependency-injection`. */
  url: string;
  /** Top-level area for labelling results: Documentation | Guides | News. */
  group: string;
}

/**
 * MiniSearch options. These MUST be identical in the prebuild indexer
 * (`scripts/build-search-index.ts`) and the browser (`MiniSearch.loadJSON`), or
 * the deserialized index won't match - so they live here, imported by both.
 */
export const SEARCH_OPTIONS: Options<SearchRecord> = {
  fields: ['title', 'section', 'content'],
  // `content` is intentionally not stored - it's matched against but never shown,
  // which keeps the serialized index small.
  storeFields: ['title', 'section', 'url', 'group'],
  searchOptions: {
    boost: { title: 4, section: 2, content: 1 },
    prefix: true,
    fuzzy: 0.2,
    combineWith: 'AND',
  },
};
