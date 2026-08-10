import * as React from 'react';

/**
 * News (blog) layout: a single centered reading column. Posts render inside it;
 * prose styling comes from `useMDXComponents` (see `src/mdx-components.tsx`).
 */
export default function NewsLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 md:px-8 md:py-12 min-h-(--full-minus-header)">
      {children}
    </div>
  );
}
