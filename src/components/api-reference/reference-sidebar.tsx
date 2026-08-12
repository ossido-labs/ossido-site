import * as React from 'react';
import { Link, useRouter } from '@ossido-labs/ossido';
import { cx } from '@/utils/cx';
import { Select } from '@/components/ui/base/select/select';
import {
  groupByKind,
  ECOSYSTEM_LABEL,
  type Ecosystem,
} from '@/content/api-reference';
import { API_REFERENCE_RESOLVED } from '@/content/api-reference.generated';

const ECOSYSTEMS: ReadonlyArray<Ecosystem> = ['rust', 'react'];

/** Ecosystem of the symbol currently being viewed, so a deep link opens on the
 *  right tab. Falls back to Rust on the index. */
function ecosystemFor(pathname: string): Ecosystem {
  const slug = pathname.replace(/^\/api-reference\/?/, '').replace(/\/$/, '');
  return (
    API_REFERENCE_RESOLVED.find((e) => e.key === slug)?.ecosystem ?? 'rust'
  );
}

/**
 * Left rail for the API Reference: a prominent Rust/React switcher above a
 * symbol-kind-grouped list of symbol links (the symbol names themselves). The
 * switcher only changes which ecosystem's symbols are listed; it doesn't navigate.
 */
export function ReferenceSidebar() {
  // Computed Values - the current route drives the initial ecosystem and the active link.
  const { pathname } = useRouter();

  // State
  const [ecosystem, setEcosystem] = React.useState<Ecosystem>(() =>
    ecosystemFor(pathname),
  );

  // Computed Values - the selected ecosystem's symbols, grouped by kind.
  const groups = groupByKind(API_REFERENCE_RESOLVED, ecosystem);

  // Methods
  const onEcosystemChange = (key: React.Key | null): void => {
    if (key) setEcosystem(key as Ecosystem);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-1.5 px-0.5 text-xs font-semibold uppercase tracking-wider text-fg-tertiary">
          Ecosystem
        </p>
        <Select
          aria-label="Filter reference by ecosystem"
          size="sm"
          selectedKey={ecosystem}
          onSelectionChange={onEcosystemChange}
        >
          {ECOSYSTEMS.map((eco) => (
            <Select.Item key={eco} id={eco}>
              {ECOSYSTEM_LABEL[eco]}
            </Select.Item>
          ))}
        </Select>
      </div>

      <nav aria-label="API Reference" className="flex flex-col gap-5 text-sm">
        {groups.map((group) => (
          <div key={group.kind}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-fg-tertiary">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.entries.map((entry) => {
                const href = `/api-reference/${entry.key}`;
                const active = pathname.replace(/\/$/, '') === href;
                return (
                  <li key={entry.key}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={cx(
                        'block truncate rounded-md px-3 py-1.5 font-mono text-[13px] duration-150',
                        active
                          ? 'bg-primary_hover font-medium text-fg-primary'
                          : 'text-fg-quaternary hover:bg-primary_hover hover:text-fg-primary',
                      )}
                    >
                      {entry.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
