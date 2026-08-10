import MiniSearch from 'minisearch';
import { SEARCH_OPTIONS, type SearchRecord } from './search-config';

let cache: Promise<MiniSearch<SearchRecord>> | null = null;

/**
 * Load and deserialize the prebuilt search index (`/search-index.json`, a static
 * asset - see `scripts/build-search-index.ts`). Fetched once on first use and
 * memoised, so opening the palette repeatedly costs nothing after the first time.
 */
export function loadSearch(): Promise<MiniSearch<SearchRecord>> {
  if (!cache) {
    cache = fetch('/search-index.json')
      .then((res) => {
        if (!res.ok) throw new Error(`search index ${res.status}`);
        return res.text();
      })
      .then((json) => MiniSearch.loadJSON<SearchRecord>(json, SEARCH_OPTIONS))
      .catch((err) => {
        cache = null; // allow a retry on the next open
        throw err;
      });
  }
  return cache;
}
