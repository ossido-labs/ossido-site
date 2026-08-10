import type { FC, ReactElement, ReactNode } from 'react';
import { Atom01, Box, CheckCircle, Code01, Code02, FileCode02, FolderCode, GitBranch01, Zap } from '@untitledui/icons';
import { cx } from '@/utils/cx';
import { CodeBlock } from '@/components/ui/code-block';

type Accent = 'orange' | 'cyan' | 'purple';

/** Literal accent classes (kept whole so Tailwind detects them) per subject colour. */
const ACCENTS: Record<Accent, { text: string; chip: string; icon: string }> = {
  orange: {
    text: 'text-ossido-orange',
    chip: 'border-ossido-orange/25 bg-ossido-orange/10 text-ossido-orange',
    icon: 'text-ossido-orange',
  },
  cyan: {
    text: 'text-ossido-cyan',
    chip: 'border-ossido-cyan/25 bg-ossido-cyan/10 text-ossido-cyan',
    icon: 'text-ossido-cyan',
  },
  purple: {
    text: 'text-ossido-purple',
    chip: 'border-ossido-purple/25 bg-ossido-purple/10 text-ossido-purple',
    icon: 'text-ossido-purple',
  },
};

/**
 * Minimal inline markdown for feature bodies: **bold** and `inline code`. Only these
 * two inline forms are supported (no block syntax), so a small splitter beats pulling
 * in a markdown dependency.
 */
function renderInline(text: string): ReactNode {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.length > 1 && part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.8em] text-primary">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.length > 3 && part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

interface Feature {
  icon: FC<{ className?: string }>;
  title: string;
  body: string;
}

interface Section {
  id: string;
  accent: Accent;
  eyebrow: string;
  title: ReactNode;
  lead: string;
  features: Array<Feature>;
  codes: Array<{ language: 'sh' | 'rust' | 'ts' | 'tsx'; code: string; caption?: string }>;
  /** Put the code column first (used to alternate the layout down the page). */
  reverse?: boolean;
}

const SECTIONS: Array<Section> = [
  {
    id: 'rust',
    accent: 'orange',
    eyebrow: 'Rust backend',
    title: 'A fast, type-safe core - powered by Axum',
    lead: 'Rendering, routing, and your API all run on one Rust core. Write your server logic once, in Rust, and ship it as a single binary.',
    features: [
      { icon: Zap, title: 'Streaming SSR', body: 'React is rendered on the server and streamed as HTML, so the first paint lands fast.' },
      { icon: FileCode02, title: 'Static generation', body: "Pre-render whole routes to static HTML + JSON with `output: 'static'`." },
      { icon: Code01, title: 'API routes in Rust', body: 'Drop endpoints in beside your pages with `#[api(GET)]` — type-safe, JSON and WebSockets built in.' },
      { icon: Box, title: 'One-binary deploy', body: 'The Axum server bundles your React app; there’s a **single artifact** to ship.' },
    ],
    codes: [
      {
        caption: 'Server-side rendering · src/routes/page.rs',
        language: 'rust',
        code: `use serde::Serialize;
use ossido::{handler, Props, Request};

#[Props]
struct HomeProps {
    subtitle: String,
}

// Runs on the server; the returned props are rendered into the HTML.
#[handler]
async fn get_server_side_props(_req: Request) -> HomeProps {
    HomeProps {
        subtitle: "Rust + React, server-rendered".into(),
    }
}`,
      },
      {
        caption: 'API route · src/routes/api/health_check.rs',
        language: 'rust',
        code: `use ossido::{api, Request};
use ossido::axum::http::StatusCode;

#[api(GET)]
pub async fn health_check(_req: Request) -> StatusCode {
    StatusCode::OK
}`,
      },
    ],
  },
  {
    id: 'react',
    accent: 'cyan',
    eyebrow: 'React frontend',
    title: 'The React you already know',
    lead: 'Every view is a plain React 19 component. File-based routing, a Vite dev server, and instant hot-reload keep the framework out of your way.',
    reverse: true,
    features: [
      { icon: Atom01, title: 'React 19', body: 'The latest React and its whole ecosystem — Actions, Suspense, hooks.' },
      { icon: FolderCode, title: 'File-based routing', body: '`page.tsx` and `layout.tsx` map straight to URLs, Next.js-style.' },
      { icon: Zap, title: 'Vite + hot reload', body: 'A fast dev server with HMR; your edits show up instantly.' },
      { icon: Code02, title: 'Typed & styled', body: 'Native TypeScript, Tailwind, CSS modules and MDX, out of the box.' },
    ],
    codes: [
      {
        language: 'tsx',
        code: `import type { OssidoPage } from '@ossido-labs/ossido/types';

// src/routes/about/page.tsx  ->  /about
const AboutPage: OssidoPage<'/about'> = () => {
  return <h1 className="text-2xl font-bold">About Ossido</h1>;
};

export default AboutPage;`,
      },
    ],
  },
  {
    id: 'tuono',
    accent: 'purple',
    eyebrow: 'Tuono roots',
    title: 'Built on the shoulders of Tuono',
    lead: "Ossido began as a fork of Tuono - the Rust-and-React framework - and carries its development forward. The proven architecture stays; it’s simply maintained again. (Tuono is Italian for “thunder”; ossido, for “oxide” — a nod to the Rust core.)",
    features: [
      { icon: Zap, title: 'Proven architecture', body: 'The same file-based routing and Rust + React model Tuono pioneered.' },
      { icon: GitBranch01, title: 'Actively maintained', body: 'Picking up where the now-unmaintained Tuono left off.' },
      { icon: CheckCircle, title: 'Familiar by design', body: 'Know Tuono? Then you already know Ossido.' },
    ],
    codes: [
      {
        language: 'ts',
        code: `import { defineConfig } from '@ossido-labs/ossido';

export default defineConfig({
  // pre-render every route to static HTML + JSON
  output: 'static',
});`,
      },
    ],
  },
];

function FeatureSection({ section }: { section: Section }): ReactElement {
  // Computed Values
  const { id, accent, eyebrow, title, lead, features, codes, reverse } = section;
  const a = ACCENTS[accent];
  const maskDir = reverse ? 'to bottom right' : 'to bottom left';
  const cornerMask = `linear-gradient(${maskDir}, #000 0%, transparent 55%)`;

  return (
    <section id={id} className="relative overflow-hidden border-t border-secondary scroll-mt-16">
      {/* Dot pattern radiating from the top corner beside the code excerpt. */}
      <div
        aria-hidden
        className="dot-grid pointer-events-none absolute inset-0"
        style={{ maskImage: cornerMask, WebkitMaskImage: cornerMask }}
      />
      <div className="relative max-w-350 mx-auto px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Text column */}
        <div className={cx('flex flex-col min-w-0', reverse && 'lg:order-2')}>
          <span
            className={cx(
              'inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold',
              a.chip,
            )}
          >
            {eyebrow}
          </span>
          <h2 className="mt-5 text-[clamp(1.75rem,3.5vw,2.5rem)]/[1.15] font-bold tracking-tight text-primary">
            {title}
          </h2>
          <p className="mt-4 text-lg text-tertiary leading-relaxed">{lead}</p>
          <ul className="mt-8 flex flex-col gap-5">
            {features.map(({ icon: Icon, title: fTitle, body }) => (
              <li key={fTitle} className="flex gap-3">
                <Icon className={cx('mt-0.5 size-5 shrink-0', a.icon)} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-primary">{fTitle}</span>
                  <span className="text-sm text-tertiary leading-relaxed">{renderInline(body)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Code column (one or more samples). */}
        <div className={cx('min-w-0 flex flex-col gap-5', reverse && 'lg:order-1')}>
          {codes.map((c, i) => (
            <div key={i} className="min-w-0">
              {c.caption && <p className="mb-2 font-mono text-xs text-quaternary">{c.caption}</p>}
              <CodeBlock language={c.language} code={c.code} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The three home-page subject sections (Rust backend, React frontend, Tuono roots). */
export function FeatureSections(): ReactElement {
  return (
    <>
      {SECTIONS.map((section) => (
        <FeatureSection key={section.id} section={section} />
      ))}
    </>
  );
}
