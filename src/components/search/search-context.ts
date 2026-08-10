import * as React from 'react';

export interface SearchContextValue {
  open: () => void;
}

export const SearchContext = React.createContext<SearchContextValue | null>(null);

/** Open the command palette from anywhere under the provider (e.g. the header). */
export function useSearch(): SearchContextValue {
  const ctx = React.useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within <SearchProvider>');
  return ctx;
}
