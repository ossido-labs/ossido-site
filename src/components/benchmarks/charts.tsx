import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import type { Framework } from '@/content/benchmarks';

/**
 * Presentational primitives for the /benchmarks page. All pure/server-rendered
 * (no hooks) - Ossido bars use the brand orange, Next.js bars a muted neutral, so
 * the comparison reads at a glance.
 */

const BAR_CLASS: Record<Framework, string> = {
  ossido: 'bg-ossido-orange',
  next: 'bg-fg-quaternary/50',
};

const DOT_CLASS: Record<Framework, string> = {
  ossido: 'bg-ossido-orange',
  next: 'bg-fg-quaternary/60',
};

export interface Bar {
  label: string;
  framework: Framework;
  /** Raw value, used to scale the bar. */
  value: number;
  /** Pre-formatted value shown at the bar's end (e.g. "8,855"). */
  display: string;
}

/** A horizontal bar group scaled to the largest value in the set. */
export function BarChart({ bars }: { bars: Array<Bar> }): ReactNode {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <div className="flex flex-col gap-2.5">
      {bars.map((b) => (
        <div
          key={b.label}
          className="grid grid-cols-[6rem_1fr] items-center gap-3 sm:grid-cols-[7rem_1fr]"
        >
          <span className="truncate text-right text-xs font-medium text-tertiary">
            {b.label}
          </span>
          <div className="flex items-center gap-2">
            <div
              className={cx('h-6 rounded-md', BAR_CLASS[b.framework])}
              style={{ width: `${Math.max((b.value / max) * 100, 2)}%` }}
            />
            <span className="text-xs font-semibold tabular-nums text-secondary">
              {b.display}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Ossido / Next.js colour key. */
export function Legend({ note }: { note?: string }): ReactNode {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-tertiary">
      <span className="inline-flex items-center gap-2">
        <span className={cx('h-2.5 w-2.5 rounded-full', DOT_CLASS.ossido)} />
        Ossido
      </span>
      <span className="inline-flex items-center gap-2">
        <span className={cx('h-2.5 w-2.5 rounded-full', DOT_CLASS.next)} />
        Next.js
      </span>
      {note && <span className="text-quaternary">{note}</span>}
    </div>
  );
}

/** A single headline number with a supporting label. */
export function StatCard({
  value,
  label,
  sublabel,
}: {
  value: string;
  label: string;
  sublabel?: string;
}): ReactNode {
  return (
    <div className="rounded-xl border border-secondary bg-primary p-5">
      <div className="text-3xl font-bold tracking-tight text-ossido-orange tabular-nums md:text-4xl">
        {value}
      </div>
      <div className="mt-2 text-sm font-semibold text-primary">{label}</div>
      {sublabel && (
        <div className="mt-1 text-xs/relaxed text-tertiary">{sublabel}</div>
      )}
    </div>
  );
}

/** A titled comparison card wrapping a chart. */
export function ChartCard({
  title,
  path,
  note,
  children,
}: {
  title: string;
  path?: string;
  note?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div className="rounded-xl border border-secondary bg-primary p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-base font-semibold tracking-tight text-primary">
          {title}
        </h3>
        {path && (
          <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-tertiary">
            {path}
          </code>
        )}
      </div>
      {children}
      {note && <p className="mt-4 text-xs/relaxed text-quaternary">{note}</p>}
    </div>
  );
}

/** Section heading with an eyebrow + optional lead paragraph. */
export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}): ReactNode {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ossido-orange">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
        {title}
      </h2>
      {children && (
        <p className="mt-3 max-w-3xl text-tertiary md:text-lg/relaxed">
          {children}
        </p>
      )}
    </div>
  );
}
