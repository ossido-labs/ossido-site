import * as React from 'react';
import { useRouter } from '@ossido-labs/ossido';
import { ContentLayout } from '@/components/content/content-layout';
import { DOC_GROUPS, docGroupId } from '@/content/docs';
import { headingsForPath, type Heading } from '@/utils/toc';

// Each doc's compile-time `toc` export (see `remarkTocExport` in ossido.config.ts),
// keyed by file path. Read per-route so the "On this page" rail renders server-side.
const TOCS = import.meta.glob<ReadonlyArray<Heading>>('./**/page.mdx', {
  eager: true,
  import: 'toc',
});

/**
 * Docs layout: the shared 3-column content shell (nav | article | "On this page")
 * driven by the documentation topic map. Prose styling comes from
 * `useMDXComponents` (see `src/mdx-components.tsx`).
 */
export default function DocumentationLayout({
  children,
}: React.PropsWithChildren) {
  const { pathname } = useRouter();

  const groups = DOC_GROUPS.map((group) => ({
    title: group.title,
    items: group.topics,
  }));

  // On the index there's no mdx `toc`; surface the group sections in the right rail
  // instead (their ids match the index page's `<h2>` ids via `docGroupId`).
  const isIndex = pathname.replace(/\/$/, '') === '/documentation';
  const headings: Array<Heading> = isIndex
    ? DOC_GROUPS.map((group) => ({
        id: docGroupId(group.title),
        text: group.title,
        level: 2,
      }))
    : headingsForPath(TOCS, '/documentation', pathname);

  return (
    <ContentLayout
      groups={groups}
      ariaLabel="Documentation"
      headings={headings}
    >
      {children}
    </ContentLayout>
  );
}
