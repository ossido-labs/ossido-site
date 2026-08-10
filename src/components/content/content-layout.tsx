import * as React from 'react';
import { OnThisPage } from '@/components/docs/on-this-page';
import type { Heading } from '@/utils/toc';
import { ContentSidebar, type SidebarGroup } from './content-sidebar';

interface ContentLayoutProps {
  groups: Array<SidebarGroup>;
  ariaLabel: string;
  children: React.ReactNode;
  /**
   * The current page's h2/h3 headings for the "On this page" rail, resolved from
   * the page's compile-time `toc` export (see `headingsForPath`). Empty on routes
   * without an mdx `toc` (e.g. the section index), which hides the rail.
   */
  headings?: Array<Heading>;
  /** Rendered inside the `<article>` above the content (e.g. a guide meta line). */
  header?: React.ReactNode;
  /** Rendered inside the `<article>` below the content (e.g. prev/next links). */
  footer?: React.ReactNode;
}

/**
 * The 3-column reading shell shared by Documentation and Guides:
 * subject sidebar | article | "On this page" TOC. The `header`/`footer` slots
 * sit inside the `<article>` around `children`; keep them free of `h2`/`h3` so
 * they don't show up in the TOC.
 */
export function ContentLayout({
  groups,
  ariaLabel,
  children,
  headings = [],
  header,
  footer,
}: ContentLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-350 px-6 md:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[15rem_minmax(0,1fr)_14rem]">
        <aside className="hidden lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-10 pr-2 scrollbar-hide md:py-12">
            <ContentSidebar groups={groups} ariaLabel={ariaLabel} />
          </div>
        </aside>

        <article className="min-w-0 max-w-3xl py-10 md:py-12">
          {header}
          {children}
          {footer}
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-10 pl-2 scrollbar-hide md:py-12">
            <OnThisPage headings={headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
