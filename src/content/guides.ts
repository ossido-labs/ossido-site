export type GuideLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Guide {
  title: string;
  description: string;
  /** Set once the guide has a page; omitted guides render as "coming soon". */
  href?: string;
  /** Rough time to complete, in minutes. */
  minutes?: number;
  level?: GuideLevel;
}

export interface GuideGroup {
  title: string;
  guides: Array<Guide>;
}

/**
 * Anchor id for a group section on the /guides index. Shared by the index page
 * (the `<h2>` ids) and the guides layout (the right-rail index) so they agree.
 */
export function guideGroupId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Task-oriented, end-to-end guides ("how to build X"), grouped along the journey
 * of building an app. Distinct from the reference Documentation, which explains
 * topics rather than walking through builds. Add an `href` to a guide once its
 * page exists and it becomes a live link everywhere.
 */
export const GUIDE_GROUPS: Array<GuideGroup> = [
  {
    title: 'Get started',
    guides: [
      {
        title: 'Build your first Ossido app',
        description:
          'Scaffold a project and build a small data-driven app end to end: a route, a Rust handler, typed props, a dynamic page, and a loading state.',
        href: '/guides/first-app',
        minutes: 20,
        level: 'Beginner',
      },
    ],
  },
  {
    title: 'Common tasks',
    guides: [
      {
        title: 'Fetching data & loading states',
        description:
          'Load data in handlers, pass it to typed props, and show loading.tsx fallbacks while it resolves.',
        href: '/guides/data-fetching',
        minutes: 10,
        level: 'Beginner',
      },
      {
        title: 'Forms & API endpoints',
        description:
          'Handle form submissions and POST requests with #[api] endpoints and the Request body helpers.',
        href: '/guides/forms-and-api',
        minutes: 15,
        level: 'Intermediate',
      },
      {
        title: 'Authentication with cookies',
        description:
          'Read and set cookies, guard routes, and thread the current user through your handlers.',
        href: '/guides/auth',
        minutes: 20,
        level: 'Intermediate',
      },
      {
        title: 'Styling with Tailwind',
        description:
          'Set up Tailwind, organise global and component styles, and build a responsive layout.',
        href: '/guides/styling-tailwind',
        minutes: 10,
        level: 'Beginner',
      },
      {
        title: 'A blog with MDX',
        description:
          'Author content in Markdown, route it with page.mdx, and render it with your design system.',
        href: '/guides/mdx-blog',
        minutes: 20,
        level: 'Intermediate',
      },
    ],
  },
  {
    title: 'Ship it',
    guides: [
      {
        title: 'Deploy your app',
        description:
          'Ship a static build or the standalone server binary, and configure it for production.',
        href: '/guides/deploy',
        minutes: 15,
        level: 'Intermediate',
      },
    ],
  },
];

/** Live guides (those with an `href`), in reading order - powers prev/next. */
export const GUIDES: Array<Guide> = GUIDE_GROUPS.flatMap((group) => group.guides).filter(
  (guide) => Boolean(guide.href),
);
