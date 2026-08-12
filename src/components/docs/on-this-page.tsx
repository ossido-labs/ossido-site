import * as React from 'react';
import { cx } from '@/utils/cx';
import type { Heading } from '@/utils/toc';

interface OnThisPageProps {
  /**
   * The article's h2/h3 headings, resolved at build time from the page's `toc`
   * export (see `remarkTocExport` in ossido.config.ts and `headingsForPath`).
   * Passed in by the section layout so the rail renders on the server.
   */
  headings: Array<Heading>;
}

/** Distance from the top of the viewport (below the sticky header) at which a
 * heading counts as "current". */
const ACTIVE_OFFSET = 96;

/**
 * Right rail: a table of contents for the current article. The list itself is
 * built at compile time (so it renders server-side); only the active-section
 * highlight is a client enhancement - the last heading scrolled past the
 * {@link ACTIVE_OFFSET} line, recomputed on scroll. Heading IDs come from
 * `rehype-slug` (see ossido.config.ts), so the anchors deep-link too.
 */
export function OnThisPage({ headings }: OnThisPageProps) {
  // State
  const [activeId, setActiveId] = React.useState<string>('');

  // Effects
  React.useEffect(() => {
    const list = headings;
    if (list.length === 0) return;

    // Resolve elements fresh on every tick (by id) so this survives any
    // re-render/remount of the article between navigations.
    const computeActive = () => {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) return list[list.length - 1].id;

      let current = list[0].id;
      for (const h of list) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top - ACTIVE_OFFSET <= 0) {
          current = h.id;
        } else {
          break;
        }
      }
      return current;
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setActiveId(computeActive());
        ticking = false;
      });
    };

    setActiveId(computeActive());
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [headings]);

  // Self-handle clicks so scrolling is deterministic: `scrollIntoView` honours
  // the heading's `scroll-mt`, so it lands below the sticky header (native/router
  // hash handling did not do this reliably). The URL hash is still updated so the
  // anchor remains shareable.
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      event.preventDefault();
      setActiveId(id);
      el.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', `#${id}`);
    },
    [],
  );

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-tertiary">
        On this page
      </p>
      <ul className="flex flex-col border-l border-secondary">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={cx(
                '-ml-px block border-l border-transparent py-1 pr-2 duration-150',
                h.level === 3 ? 'pl-6' : 'pl-4',
                activeId === h.id
                  ? 'border-ossido-orange text-fg-primary'
                  : 'text-fg-quaternary hover:border-border-secondary hover:text-fg-primary',
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
