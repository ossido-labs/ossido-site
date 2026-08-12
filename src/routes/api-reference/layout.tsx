import * as React from 'react';
import { useRouter } from '@ossido-labs/ossido';
import { ContentLayout } from '@/components/content/content-layout';
import { ReferenceSidebar } from '@/components/api-reference/reference-sidebar';
import {
  ECOSYSTEM_LABEL,
  groupByKind,
  type Ecosystem,
} from '@/content/api-reference';
import { API_REFERENCE_RESOLVED } from '@/content/api-reference.generated';
import type { Heading } from '@/utils/toc';

const ECOSYSTEMS: ReadonlyArray<Ecosystem> = ['rust', 'react'];

/**
 * API Reference shell: the shared 3-column layout with a custom left rail (the
 * Rust/React switcher + symbol links) and a right "On this page" rail specific to
 * the current symbol - its fixed Description / Signature / Examples sections.
 */
export default function ApiReferenceLayout({
  children,
}: React.PropsWithChildren) {
  // Computed Values
  const { pathname } = useRouter();
  const slug = pathname.replace(/^\/api-reference\/?/, '').replace(/\/$/, '');
  const entry = API_REFERENCE_RESOLVED.find((e) => e.key === slug);

  // A symbol page has its fixed sections; the index outlines its ecosystem groups
  // (Rust / React) and their kind sub-groups (Macros, Hooks, ...).
  const headings: Array<Heading> = entry
    ? [
        { id: 'description', text: 'Description', level: 2 },
        { id: 'signature', text: 'Signature', level: 2 },
        ...(entry.examples.length
          ? [{ id: 'examples', text: 'Examples', level: 2 }]
          : []),
      ]
    : ECOSYSTEMS.flatMap((eco) => [
        { id: eco, text: ECOSYSTEM_LABEL[eco], level: 2 },
        ...groupByKind(API_REFERENCE_RESOLVED, eco).map((group) => ({
          id: `${eco}-${group.kind}`,
          text: group.label,
          level: 3,
        })),
      ]);

  return (
    <ContentLayout
      sidebar={<ReferenceSidebar />}
      ariaLabel="API Reference"
      headings={headings}
    >
      {children}
    </ContentLayout>
  );
}
