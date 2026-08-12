// Storybook mock for `@ossido-labs/ossido` (aliased in .storybook/main.ts). The real
// module needs a live RouterProvider; in isolated stories we only need `Link` to
// render an anchor and `useRouter` to return a pathname (for active-link states) and
// no-op navigation. The "current" pathname is settable so a story can show an active
// item (see the `route` parameter handled in preview.tsx).
import * as React from 'react';

const router = { pathname: '/' };

export function setMockPathname(pathname: string): void {
  router.pathname = pathname;
}

export function useRouter() {
  return {
    pathname: router.pathname,
    push: (to: string): void => console.info('[mock router] push', to),
    replace: (to: string): void => console.info('[mock router] replace', to),
  };
}

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  preload?: boolean;
  scroll?: boolean;
  replace?: boolean;
  viewTransition?: boolean;
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(
    { href, preload, scroll, replace, viewTransition, children, ...rest },
    ref,
  ) {
    // Swallow the router-only props so they don't hit the DOM.
    void preload;
    void scroll;
    void replace;
    void viewTransition;
    return (
      <a ref={ref} href={href} {...rest}>
        {children}
      </a>
    );
  },
);
