import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { isValidElement, useContext } from 'react';
import type { MDXComponents } from '@ossido-labs/ossido-mdx';
import { cx } from '@/utils/cx';
import { CodeBlock } from '@/components/ui/code-block';
import { HeadingAnchor } from '@/components/ui/heading-anchor';
import { DocSourceContext } from '@/components/docs/doc-source-context';
import { ViewOnGithub } from '@/components/docs/view-on-github';

/**
 * Global MDX components for the site (Next.js-style convention). ossido-mdx resolves
 * this file, so every `.mdx` file renders Markdown with the ossido design system -
 * no `<MDXProvider>` needed. Fenced code blocks are routed through `CodeBlock` for
 * Shiki highlighting + a copy button.
 */

type CodeLang = 'sh' | 'powershell' | 'rust' | 'ts' | 'tsx' | 'css' | 'json';

/** Map common Markdown fence languages onto the ones `CodeBlock` supports. */
const LANG_ALIASES: Record<string, CodeLang> = {
  sh: 'sh',
  bash: 'sh',
  css: 'css',
  shell: 'sh',
  zsh: 'sh',
  json: 'json',
  console: 'sh',
  powershell: 'powershell',
  ps1: 'powershell',
  pwsh: 'powershell',
  rust: 'rust',
  rs: 'rust',
  ts: 'ts',
  typescript: 'ts',
  tsx: 'tsx',
};

/** Slug fallback for the rare case the MDX pipeline didn't hand us an `id`
 * (rehype-slug normally does, using github-slugger). Matches it for simple text. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Flatten a heading's children to plain text for the slug fallback. */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return '';
}

/**
 * A self-linking MDX heading: it carries a sluggified `id` (supplied by rehype-slug,
 * or derived from its own text as a fallback) and reveals an anchor-link icon to the
 * right on hover or keyboard focus, so any section can be linked to directly.
 */
function Heading({
  level,
  className,
  children,
  id,
  ...rest
}: ComponentPropsWithoutRef<'h2'> & { level: 2 | 3 | 4 }): ReactElement {
  const Tag = `h${level}` as const;
  const slug = id ?? slugify(textOf(children));
  return (
    <Tag id={slug} className={cx('group scroll-mt-20', className)} {...rest}>
      {children}
      <HeadingAnchor id={slug} />
    </Tag>
  );
}

/**
 * The page title. In documentation the layout supplies the page's GitHub source
 * via `DocSourceContext`, so a "View this page on GitHub" link renders beneath the
 * title; elsewhere (blog, guides) the context is empty and only the title shows.
 */
function DocumentH1(p: ComponentPropsWithoutRef<'h1'>): ReactElement {
  const source = useContext(DocSourceContext);
  return (
    <>
      <h1
        className={cx(
          'text-[clamp(1.875rem,4vw,2.5rem)]/[1.15] font-bold tracking-tight text-primary',
          source ? 'mb-3' : 'mb-4',
        )}
        {...p}
      />
      {source && <ViewOnGithub href={source} />}
    </>
  );
}

/** Render a fenced code block via `CodeBlock` when the language is supported,
 * otherwise a plainly-styled `<pre>`. */
function CodePre({ children }: ComponentPropsWithoutRef<'pre'>): ReactElement {
  if (isValidElement(children)) {
    const codeEl = children as ReactElement<{
      className?: string;
      children?: ReactNode;
    }>;
    const match = /language-(\w+)/.exec(codeEl.props.className ?? '');
    const lang = match ? LANG_ALIASES[match[1].toLowerCase()] : undefined;
    const raw =
      typeof codeEl.props.children === 'string'
        ? codeEl.props.children.replace(/\n$/, '')
        : '';

    if (lang && raw) {
      return (
        <div className="my-6">
          <CodeBlock language={lang} code={raw} />
        </div>
      );
    }
  }

  return (
    <pre className="my-6 overflow-x-auto rounded-lg border border-secondary bg-primary p-4 font-mono text-sm text-primary">
      {children}
    </pre>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    h1: (p: ComponentPropsWithoutRef<'h1'>) => <DocumentH1 {...p} />,
    h2: (p: ComponentPropsWithoutRef<'h2'>) => (
      <Heading
        level={2}
        className="mt-10 mb-4 text-2xl font-bold tracking-tight text-primary"
        {...p}
      />
    ),
    h3: (p: ComponentPropsWithoutRef<'h3'>) => (
      <Heading
        level={3}
        className="mt-8 mb-3 text-xl font-semibold tracking-tight text-primary"
        {...p}
      />
    ),
    h4: (p: ComponentPropsWithoutRef<'h4'>) => (
      <Heading
        level={4}
        className="mt-6 mb-2 text-lg font-semibold text-primary"
        {...p}
      />
    ),

    p: (p: ComponentPropsWithoutRef<'p'>) => (
      <p className="my-4 text-tertiary leading-relaxed" {...p} />
    ),
    a: (p: ComponentPropsWithoutRef<'a'>) => (
      <a
        className="font-medium text-ossido-orange underline-offset-4 hover:underline"
        {...p}
      />
    ),
    strong: (p: ComponentPropsWithoutRef<'strong'>) => (
      <strong className="font-semibold text-primary" {...p} />
    ),
    em: (p: ComponentPropsWithoutRef<'em'>) => <em className="italic" {...p} />,

    ul: (p: ComponentPropsWithoutRef<'ul'>) => (
      <ul
        className="my-4 flex list-disc flex-col gap-2 pl-6 text-tertiary marker:text-quaternary"
        {...p}
      />
    ),
    ol: (p: ComponentPropsWithoutRef<'ol'>) => (
      <ol
        className="my-4 flex list-decimal flex-col gap-2 pl-6 text-tertiary marker:text-quaternary"
        {...p}
      />
    ),
    li: (p: ComponentPropsWithoutRef<'li'>) => (
      <li className="leading-relaxed" {...p} />
    ),

    blockquote: (p: ComponentPropsWithoutRef<'blockquote'>) => (
      <blockquote
        className="my-6 border-l-2 border-ossido-orange/40 pl-4 text-tertiary italic"
        {...p}
      />
    ),
    hr: (p: ComponentPropsWithoutRef<'hr'>) => (
      <hr className="my-8 border-secondary" {...p} />
    ),

    // Inline code chip; block code (language-*) is left plain so `pre` can style it.
    code: ({
      className,
      children,
      ...rest
    }: ComponentPropsWithoutRef<'code'>) => {
      if (className?.includes('language-')) {
        return (
          <code className={className} {...rest}>
            {children}
          </code>
        );
      }
      return (
        <code
          className={cx(
            'rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.85em] text-primary',
            className,
          )}
          {...rest}
        >
          {children}
        </code>
      );
    },
    pre: CodePre,
  };
}
