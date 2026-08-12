export interface Topic {
  title: string;
  description: string;
  /** Set once the topic has a page; omitted topics render as "coming soon". */
  href?: string;
}

export interface DocGroup {
  title: string;
  topics: Array<Topic>;
}

/**
 * Anchor id for a group section on the /documentation index. Shared by the index
 * page (the `<h2>` ids) and the docs layout (the right-rail "On this page" list) so
 * the two always agree.
 */
export function docGroupId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * The documentation topic map (see planned-content.md), grouped by subject and
 * ordered from first-day to advanced. Shared by the docs index
 * (`/documentation`) and the sidebar in the docs layout so there's a single
 * source of truth. Add an `href` to a topic once its page exists and it becomes
 * a live link everywhere.
 */
export const DOC_GROUPS: Array<DocGroup> = [
  {
    title: 'Getting started',
    topics: [
      {
        title: 'Mental model & architecture',
        description:
          'How Ossido fits a React frontend and a Rust (axum) backend into one project: the two runtimes, the request lifecycle, and the Rust/React boundary.',
        href: '/documentation/mental-model',
      },
      {
        title: 'Installation & project setup',
        description:
          'Prerequisites, installing the ossido CLI, the "ossido new" wizard, feature flags, and the project layout.',
        href: '/documentation/installation',
      },
      {
        title: 'The CLI',
        description:
          '"ossido dev", "build", and "new" - what each command does, and the generated .ossido/ directory.',
        href: '/documentation/cli',
      },
      {
        title: 'Configuration',
        description:
          'ossido.config.ts: server options, output mode, render threads, logging, Vite passthrough, and path aliases.',
        href: '/documentation/configuration',
      },
    ],
  },
  {
    title: 'Backend',
    topics: [
      {
        title: 'Ossido Application',
        description:
          'The src/routes convention: pages and handlers, dynamic and catch-all segments, layouts, loading and not-found, API routes, and middleware.',
        href: '/documentation/routing',
      },
      {
        title: 'Page & Layout Handlers',
        description:
          'Page and layout handlers, how they run, the Request extractor, the Props/Type macros, returning data, application state, logging, and cookies.',
        href: '/documentation/rust-backend',
      },
      {
        title: 'API Handlers',
        description:
          'HTTP endpoints with #[api] under src/routes/api: methods, returning JSON, reading the request body, and API-scoped middleware.',
        href: '/documentation/api-handlers',
      },
      {
        title: 'Server Actions',
        description:
          'Mutations with #[action]: a Rust function the build mirrors into a typed TypeScript one, called from React as an RPC, a <Form>, or with useActionState - plus stateful actions and error handling.',
        href: '/documentation/server-actions',
      },
      {
        title: 'Middleware',
        description:
          'Tower layers on the request pipeline: defining middleware, composing several with ServiceBuilder, and ordering.',
        href: '/documentation/middleware',
      },
      {
        title: 'Error Handling',
        description:
          'How handler panics and expected failures are handled, the error page and dev overlay, and hooking every error with set_error_handler.',
        href: '/documentation/error-handling',
      },
      {
        title: 'SSR, SSG & Streaming',
        description:
          'Server rendering, static generation with #[static_paths], streaming HTML, top-level await, and the render pool.',
        href: '/documentation/rendering',
      },
    ],
  },
  {
    title: 'Frontend',
    topics: [
      {
        title: 'React frontend',
        description:
          'Typed page components, layouts and children, client navigation with ossido-router, head/metadata, boundaries, hydration, and preloading.',
        href: '/documentation/react-frontend',
      },
      {
        title: 'Typed API client',
        description:
          'Call your #[api] routes from the frontend with ossido/client: paths, params, and JSON responses inferred from your Rust routes.',
        href: '/documentation/api-client',
      },
      {
        title: 'TypeScript integration',
        description:
          'Generated types from Rust Type macros, end-to-end type-safe props, and keeping tsconfig and path aliases in agreement.',
        href: '/documentation/typescript',
      },
    ],
  },
  {
    title: 'Styling & content',
    topics: [
      {
        title: 'Styling',
        description:
          'Tailwind, the global stylesheet, and component-scoped styles via Vite.',
        href: '/documentation/styling',
      },
      {
        title: 'MDX',
        description:
          'Enabling ossido-mdx, the mdx-components.tsx provider, and authoring pages and content in Markdown.',
        href: '/documentation/mdx',
      },
    ],
  },
  {
    title: 'Tooling & ecosystem',
    topics: [
      {
        title: 'Package ecosystem',
        description:
          'The ossido runtime, ossido-router, ossido-ui, ossido-mdx, the eslint plugin, and the React/Vite plugin.',
        href: '/documentation/packages',
      },
      {
        title: 'Tooling & developer experience',
        description:
          'Dev server and HMR, React Fast Refresh boundaries, linting, logging, environment variables, and Vite integration.',
        href: '/documentation/tooling',
      },
    ],
  },
  {
    title: 'Deploy & internals',
    topics: [
      {
        title: 'Building & deploying',
        description:
          'The static site vs. the standalone server binary, running the production server, static hosting, and production config.',
        href: '/documentation/deploying',
      },
      {
        title: 'Internals',
        description:
          'Render pool and threading, dev proxies, the asset manifest, catch-all rendering and error pages, debug timing, and the workspace crates.',
        href: '/documentation/internals',
      },
    ],
  },
  {
    title: 'Contributing',
    topics: [
      {
        title: 'Contributing to Ossido',
        description:
          'Set up the toolchain, build Ossido from source, run the checks, and open a pull request against the ossido-labs repositories.',
        href: '/documentation/contributing',
      },
    ],
  },
];
