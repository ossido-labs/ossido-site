'use client';

import * as React from 'react';
import { CommandPalette } from './command-palette';
import { SearchContext } from './search-context';

/**
 * Owns the command-palette open state, wires the global ⌘K / Ctrl+K shortcut, and
 * renders the palette. Wrap the app so the header (and anything else) can open it
 * via {@link useSearch}.
 */
export function SearchProvider({
  children,
}: React.PropsWithChildren): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const value = React.useMemo(() => ({ open: () => setIsOpen(true) }), []);

  return (
    <SearchContext.Provider value={value}>
      {children}
      <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} />
    </SearchContext.Provider>
  );
}
