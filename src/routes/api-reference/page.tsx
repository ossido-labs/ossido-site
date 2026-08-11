import { Link } from '@ossido-labs/ossido';
import { groupByKind, ECOSYSTEM_LABEL, type Ecosystem } from '@/content/api-reference';
import { API_REFERENCE_RESOLVED } from '@/content/api-reference.generated';

const ECOSYSTEMS: ReadonlyArray<Ecosystem> = ['rust', 'react'];

const ApiReferenceIndex = () => (
  <>
    <title>API Reference</title>

    <h1 className="mb-3 text-[clamp(1.875rem,4vw,2.5rem)]/[1.15] font-bold tracking-tight text-primary">
      API Reference
    </h1>
    <p className="mb-10 text-tertiary leading-relaxed text-balance">
      Every important Ossido symbol on its own page — signature, description, and
      worked examples — across both ecosystems. Pick one below, or use the Rust/React
      switcher in the sidebar.
    </p>

    <div className="flex flex-col gap-12">
      {ECOSYSTEMS.map((eco) => (
        <section key={eco}>
          <h2
            id={eco}
            className="mb-5 scroll-mt-20 text-lg font-bold tracking-tight text-primary"
          >
            {ECOSYSTEM_LABEL[eco]}
          </h2>
          <div className="flex flex-col gap-6">
            {groupByKind(API_REFERENCE_RESOLVED, eco).map((group) => (
              <div key={group.kind}>
                <h3
                  id={`${eco}-${group.kind}`}
                  className="mb-3 scroll-mt-20 text-xs font-semibold uppercase tracking-wider text-fg-tertiary"
                >
                  {group.label}
                </h3>
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {group.entries.map((entry) => (
                    <li key={entry.key}>
                      <Link
                        href={`/api-reference/${entry.key}`}
                        className="group flex h-full flex-col rounded-xl border border-secondary bg-primary p-4 hover:border-primary hover:bg-primary_hover duration-150"
                      >
                        <span className="font-mono text-sm font-semibold text-primary group-hover:text-ossido-orange duration-150">
                          {entry.name}
                        </span>
                        <span className="mt-1 line-clamp-2 text-sm/relaxed text-tertiary">
                          {entry.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </>
);

export default ApiReferenceIndex;
