import * as React from 'react';

/**
 * Benchmarks layout: a single centered column, a touch wider than the blog so the
 * comparison tables and charts breathe.
 */
export default function BenchmarksLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 md:px-8 md:py-12 min-h-(--full-minus-header)">
      {children}
    </div>
  );
}
