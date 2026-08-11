import { Link } from '@ossido-labs/ossido';
import { ArrowUpRight } from '@untitledui/icons';
import { CodeBlock } from '@/components/ui/code-block';
import { ECOSYSTEM_LABEL } from '@/content/api-reference';
import { API_REFERENCE_RESOLVED } from '@/content/api-reference.generated';

const BY_KEY = new Map(API_REFERENCE_RESOLVED.map((e) => [e.key, e]));

const titleCase = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const H2 = 'mt-10 mb-4 scroll-mt-20 text-xl font-bold tracking-tight text-primary';

/**
 * The reference page for a single symbol: header (name + ecosystem/kind badges +
 * guide link), then the fixed Description / Signature / Examples sections. Rendered
 * by the generated per-symbol route wrappers under `src/routes/api-reference/<key>`.
 */
export function SymbolPage({ entryKey }: { entryKey: string }) {
  const entry = BY_KEY.get(entryKey);
  if (!entry) return null;

  return (
    <>
      <title>{`${entry.name} — API Reference`}</title>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-quaternary">
          {ECOSYSTEM_LABEL[entry.ecosystem]}
        </span>
        <span className="rounded-full border border-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-quaternary">
          {titleCase(entry.kind)}
        </span>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2">
        <h1 className="font-mono text-[clamp(1.5rem,3.5vw,2rem)]/[1.15] font-bold tracking-tight text-primary">
          {entry.name}
        </h1>
        {entry.guideHref && (
          <Link
            href={entry.guideHref}
            className="group inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-ossido-orange hover:underline"
          >
            Open guide
            <ArrowUpRight className="h-4 w-4 duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </div>

      <h2 id="description" className={H2}>
        Description
      </h2>
      <p className="text-tertiary leading-relaxed">{entry.description}</p>
      {entry.details && <p className="mt-3 text-tertiary leading-relaxed">{entry.details}</p>}

      <h2 id="signature" className={H2}>
        Signature
      </h2>
      <CodeBlock language={entry.language} code={entry.signature} />

      {entry.examples.length > 0 && (
        <>
          <h2 id="examples" className={H2}>
            Examples
          </h2>
          <div className="flex flex-col gap-5">
            {entry.examples.map((example, i) => (
              <div key={i}>
                {example.caption && (
                  <p className="mb-2 text-sm text-tertiary">{example.caption}</p>
                )}
                <CodeBlock language={example.lang ?? entry.language} code={example.code} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
