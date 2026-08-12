import * as React from 'react';
import { Link, useRouter } from '@ossido-labs/ossido';
import { ArrowLeft, ArrowRight } from '@untitledui/icons';
import { ContentLayout } from '@/components/content/content-layout';
import { GUIDE_GROUPS, GUIDES, guideGroupId } from '@/content/guides';
import { headingsForPath, type Heading } from '@/utils/toc';

// Each guide's compile-time `toc` export (see `remarkTocExport` in ossido.config.ts),
// keyed by file path. Read per-route so the "On this page" rail renders server-side.
const TOCS = import.meta.glob<ReadonlyArray<Heading>>('./**/page.mdx', {
  eager: true,
  import: 'toc',
});

/**
 * Guides layout: the shared 3-column content shell, plus tutorial touches - an
 * eyebrow meta line (level · time) above the guide and prev/next links below,
 * both derived from the current path against the guide map. On the index route
 * there's no current guide, so neither slot renders.
 */
export default function GuidesLayout({ children }: React.PropsWithChildren) {
  const { pathname } = useRouter();

  const groups = GUIDE_GROUPS.map((group) => ({
    title: group.title,
    items: group.guides,
  }));

  // On the index there's no mdx `toc`; surface the journey groups in the right rail
  // instead (ids match the index page's `<h2>` ids via `guideGroupId`) - mirroring
  // the Documentation index.
  const isIndex = pathname.replace(/\/$/, '') === '/guides';
  const headings: Array<Heading> = isIndex
    ? GUIDE_GROUPS.map((group) => ({
        id: guideGroupId(group.title),
        text: group.title,
        level: 2,
      }))
    : headingsForPath(TOCS, '/guides', pathname);

  const index = GUIDES.findIndex((guide) => guide.href === pathname);
  const current = index >= 0 ? GUIDES[index] : undefined;
  const prev = index > 0 ? GUIDES[index - 1] : undefined;
  const next =
    index >= 0 && index < GUIDES.length - 1 ? GUIDES[index + 1] : undefined;

  const header = current ? (
    <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fg-tertiary">
      <span className="text-ossido-orange">Guide</span>
      {current.level && (
        <>
          <span aria-hidden>·</span>
          <span>{current.level}</span>
        </>
      )}
      {current.minutes && (
        <>
          <span aria-hidden>·</span>
          <span>~{current.minutes} min</span>
        </>
      )}
    </p>
  ) : undefined;

  const footer =
    current && (prev || next) ? (
      <nav
        aria-label="Guide navigation"
        className="mt-12 grid gap-3 border-t border-secondary pt-6 sm:grid-cols-2"
      >
        {prev ? (
          <Link
            href={prev.href}
            className="group flex flex-col gap-1 rounded-xl border border-secondary p-4 hover:border-primary hover:bg-primary_hover duration-150"
          >
            <span className="inline-flex items-center gap-1 text-xs text-fg-quaternary">
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </span>
            <span className="text-sm font-medium text-fg-primary group-hover:text-ossido-orange duration-150">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={next.href}
            className="group flex flex-col gap-1 rounded-xl border border-secondary p-4 text-right hover:border-primary hover:bg-primary_hover duration-150 sm:col-start-2"
          >
            <span className="inline-flex items-center justify-end gap-1 text-xs text-fg-quaternary">
              Next <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-medium text-fg-primary group-hover:text-ossido-orange duration-150">
              {next.title}
            </span>
          </Link>
        ) : null}
      </nav>
    ) : undefined;

  return (
    <ContentLayout
      groups={groups}
      ariaLabel="Guides"
      headings={headings}
      header={header}
      footer={footer}
    >
      {children}
    </ContentLayout>
  );
}
