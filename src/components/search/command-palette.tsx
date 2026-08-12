'use client';

import * as React from 'react';
import { useRouter } from '@ossido-labs/ossido';
import { Dialog, Modal, ModalOverlay } from 'react-aria-components';
import {
  Announcement02,
  BookOpen01,
  CornerDownRight,
  File02,
  GraduationHat02,
  SearchMd,
} from '@untitledui/icons';
import { loadSearch } from '@/utils/search';
import type { SearchRecord } from '@/utils/search-config';
import { cx } from '@/utils/cx';

interface CommandPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type Hit = Pick<SearchRecord, 'title' | 'section' | 'url' | 'group'>;

const GROUP_ICON: Record<string, typeof File02> = {
  Documentation: File02,
  Guides: GraduationHat02,
  News: Announcement02,
};

/** A few good default destinations shown before the user types. */
const SUGGESTIONS: Array<Hit> = [
  {
    title: 'Build your first Ossido app',
    section: '',
    url: '/guides/first-app',
    group: 'Guides',
  },
  {
    title: 'Mental model & architecture',
    section: '',
    url: '/documentation/mental-model',
    group: 'Documentation',
  },
  {
    title: 'Installation & project setup',
    section: '',
    url: '/documentation/installation',
    group: 'Documentation',
  },
  {
    title: 'The CLI',
    section: '',
    url: '/documentation/cli',
    group: 'Documentation',
  },
];

const MAX_RESULTS = 25;

export function CommandPalette({
  isOpen,
  onOpenChange,
}: CommandPaletteProps): React.ReactElement {
  const { push } = useRouter();
  const [query, setQuery] = React.useState('');
  const [hits, setHits] = React.useState<Array<Hit>>([]);
  const [active, setActive] = React.useState(0);
  const indexRef = React.useRef<Awaited<ReturnType<typeof loadSearch>> | null>(
    null,
  );
  const listRef = React.useRef<HTMLUListElement>(null);

  const q = query.trim();
  const showing = q ? hits : SUGGESTIONS;

  // Load the index the first time the palette opens.
  React.useEffect(() => {
    if (!isOpen || indexRef.current) return;
    let alive = true;
    loadSearch()
      .then((idx) => {
        if (alive) indexRef.current = idx;
      })
      .catch(() => {
        // Index failed to load; the palette just shows no results.
      });
    return () => {
      alive = false;
    };
  }, [isOpen]);

  // Reset when closed.
  React.useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setHits([]);
      setActive(0);
    }
  }, [isOpen]);

  // Run the query.
  React.useEffect(() => {
    setActive(0);
    if (!q) {
      setHits([]);
      return;
    }
    const idx = indexRef.current;
    if (!idx) return;
    const found = idx.search(q).slice(0, MAX_RESULTS) as unknown as Array<Hit>;
    setHits(
      found.map((h) => ({
        title: h.title,
        section: h.section,
        url: h.url,
        group: h.group,
      })),
    );
  }, [q]);

  // Keep the active row in view.
  React.useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({
        block: 'nearest',
      });
  }, [active]);

  const go = React.useCallback(
    (url: string) => {
      onOpenChange(false);
      const [path, hash] = url.split('#');
      if (!hash) {
        push(path);
        return;
      }
      const scrollTo = () => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView();
          history.replaceState(null, '', url);
          return true;
        }
        return false;
      };
      if (path === window.location.pathname) {
        scrollTo();
        return;
      }
      push(path);
      // Wait for the target heading to mount after the client navigation.
      let tries = 0;
      const tick = () => {
        if (scrollTo() || tries++ > 120) return;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    [onOpenChange, push],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, showing.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = showing[active];
      if (hit) go(hit.url);
    }
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-100 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm data-[entering]:animate-in data-[entering]:fade-in data-[exiting]:animate-out data-[exiting]:fade-out"
    >
      <Modal className="w-full max-w-xl overflow-hidden rounded-2xl border border-secondary bg-primary shadow-2xl data-[entering]:animate-in data-[entering]:zoom-in-95 data-[entering]:slide-in-from-top-2">
        <Dialog aria-label="Search documentation" className="outline-hidden">
          {/* Search field */}
          <div className="flex items-center gap-3 border-b border-secondary px-4">
            <SearchMd className="size-5 shrink-0 text-fg-quaternary" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search documentation, guides, and news..."
              aria-label="Search"
              className="flex-1 bg-transparent py-4 text-fg-primary placeholder:text-fg-quaternary outline-hidden"
            />
            <kbd className="hidden shrink-0 rounded border border-secondary px-1.5 py-0.5 text-[10px] font-medium text-fg-quaternary sm:block">
              Esc
            </kbd>
          </div>

          {/* Results */}
          {showing.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-fg-quaternary">
              No results for &ldquo;{q}&rdquo;
            </div>
          ) : (
            <ul
              ref={listRef}
              className="max-h-[min(60vh,24rem)] overflow-y-auto p-2 scrollbar-hide"
            >
              {!q && (
                <li className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-fg-tertiary">
                  Jump to
                </li>
              )}
              {showing.map((hit, i) => {
                const Icon = hit.section
                  ? CornerDownRight
                  : (GROUP_ICON[hit.group] ?? BookOpen01);
                const isActive = i === active;
                return (
                  <li key={hit.url}>
                    <button
                      type="button"
                      data-active={isActive}
                      onPointerMove={() => setActive(i)}
                      onClick={() => go(hit.url)}
                      className={cx(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left duration-75',
                        isActive
                          ? 'bg-primary_hover'
                          : 'hover:bg-primary_hover/50',
                      )}
                    >
                      <Icon
                        className={cx(
                          'size-4 shrink-0',
                          isActive
                            ? 'text-ossido-orange'
                            : 'text-fg-quaternary',
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-fg-primary">
                          {hit.section || hit.title}
                        </span>
                        {hit.section && (
                          <span className="block truncate text-xs text-fg-quaternary">
                            {hit.title}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-fg-quaternary">
                        {hit.group}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Footer hints */}
          <div className="hidden items-center gap-4 border-t border-secondary px-4 py-2.5 text-xs text-fg-quaternary sm:flex">
            <Hint keys={['↑', '↓']} label="Navigate" />
            <Hint keys={['↵']} label="Select" />
            <Hint keys={['Esc']} label="Close" />
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function Hint({
  keys,
  label,
}: {
  keys: Array<string>;
  label: string;
}): React.ReactElement {
  return (
    <span className="inline-flex items-center gap-1.5">
      {keys.map((k) => (
        <kbd
          key={k}
          className="inline-flex min-w-5 items-center justify-center rounded border border-secondary px-1 py-0.5 text-[10px] font-medium"
        >
          {k}
        </kbd>
      ))}
      <span>{label}</span>
    </span>
  );
}
