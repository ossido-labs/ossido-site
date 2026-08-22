import type { ReactElement, ReactNode } from 'react';
import type { OssidoPage } from '@ossido-labs/ossido/types';
import { ArrowUpRight } from '@untitledui/icons';
import {
  formatMs,
  formatNum,
  memoryFor,
  ratio,
  resultFor,
  streamingFor,
  type Framework,
  type Mode,
} from '@/content/benchmarks';
import {
  BarChart,
  ChartCard,
  Legend,
  SectionHeading,
  StatCard,
  type Bar,
} from '@/components/benchmarks/charts';

function EnvRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}): ReactElement {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-tertiary">{label}</dt>
      <dd className="text-right font-medium text-secondary">{value}</dd>
    </div>
  );
}

function Th({
  children,
  numeric,
}: {
  children: ReactNode;
  numeric?: boolean;
}): ReactElement {
  return (
    <th
      className={`border-b border-secondary px-3 py-2.5 font-semibold text-tertiary ${numeric ? 'text-right tabular-nums' : 'text-left'}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  numeric,
  strong,
}: {
  children: ReactNode;
  numeric?: boolean;
  strong?: boolean;
}): ReactElement {
  return (
    <td
      className={`border-b border-secondary px-3 py-2.5 ${numeric ? 'text-right tabular-nums' : 'text-left'} ${strong ? 'font-semibold text-ossido-orange' : 'text-secondary'}`}
    >
      {children}
    </td>
  );
}

// The props are exactly the Rust handler's return type (src/routes/benchmarks/page.rs),
// fetched and baked at build time (static SSG).
const Benchmarks: OssidoPage<'/benchmarks'> = ({
  version,
  source,
  repo,
  results,
  memory,
}) => {
  // Computed values
  const { environment, load } = results;
  const cores = environment.cores;

  // Config columns shown across the tables/charts, in display order.
  const configs: Array<{ framework: Framework; mode: Mode; label: string }> = [
    { framework: 'ossido', mode: 'single', label: 'Ossido ×1' },
    { framework: 'ossido', mode: 'multi', label: `Ossido ×${cores}` },
    { framework: 'next', mode: 'single', label: 'Next ×1' },
    { framework: 'next', mode: 'multi', label: `Next ×${cores}` },
  ];

  // Only the scenarios with throughput rows (streaming is measured separately).
  const scenarios = results.scenarios.filter((s) =>
    resultFor(results, s.key, 'ossido', 'multi'),
  );

  const throughputBars = (scenarioKey: string): Array<Bar> =>
    configs.map(({ framework, mode, label }) => {
      const rps = resultFor(results, scenarioKey, framework, mode)?.rps ?? 0;
      return { label, framework, value: rps, display: formatNum(rps) };
    });

  // Headline numbers, derived so they stay honest to whichever version is pinned.
  const ssrMulti = {
    ossido: resultFor(results, 'ssr', 'ossido', 'multi')?.rps ?? 0,
    next: resultFor(results, 'ssr', 'next', 'multi')?.rps ?? 0,
  };
  const apiSingle = {
    ossido: resultFor(results, 'api', 'ossido', 'single')?.rps ?? 0,
    next: resultFor(results, 'api', 'next', 'single')?.rps ?? 0,
  };
  const ttfbSingle = {
    ossido: streamingFor(results, 'ossido', 'single')?.ttfbMs ?? 0,
    next: streamingFor(results, 'next', 'single')?.ttfbMs ?? 0,
  };
  const memPeak = memory
    ? {
        ossido: memoryFor(memory, 'ossido', cores),
        next: memoryFor(memory, 'next', cores),
      }
    : null;

  return (
    <>
      <title>Benchmarks · Ossido vs Next.js</title>
      <meta
        name="description"
        content="Reproducible throughput, latency, streaming and memory benchmarks comparing Ossido (React + Rust) against Next.js."
      />

      {/* Hero */}
      <header className="mb-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ossido-orange">
          Benchmarks
        </p>
        <h1 className="text-[clamp(2rem,5vw,3rem)]/[1.1] font-bold tracking-tight text-primary">
          Ossido vs Next.js
        </h1>
        <p className="mt-4 max-w-2xl text-tertiary md:text-lg/relaxed">
          Both apps render{' '}
          <strong className="text-secondary">byte-for-byte identical</strong>{' '}
          React trees from identical data, so the numbers reflect the runtime,
          not the workload. Ossido renders through a multi-threaded V8 pool
          embedded in a Rust/axum server; Next.js runs on Node.js, scaled across
          cores with the <code className="font-mono text-sm">cluster</code>{' '}
          module.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary bg-primary px-3 py-1 font-medium text-secondary">
            <span className="h-2 w-2 rounded-full bg-ossido-orange" />
            Ossido {version}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary bg-primary px-3 py-1 font-medium text-secondary">
            Next.js {results.versions.next}
          </span>
          <a
            href={source}
            className="inline-flex items-center gap-1 font-medium text-ossido-orange hover:underline"
          >
            View raw results
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Headline stats */}
      <section className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          value={`${formatNum(ssrMulti.ossido)}`}
          label="req/s rendering the SSR catalogue"
          sublabel={`${ratio(ssrMulti.ossido, ssrMulti.next)} Next.js across ${cores} cores`}
        />
        <StatCard
          value={ratio(apiSingle.ossido, apiSingle.next)}
          label="JSON API throughput"
          sublabel="Rust/axum vs Node, single process"
        />
        <StatCard
          value={ratio(ttfbSingle.next, ttfbSingle.ossido)}
          label="faster time-to-first-byte"
          sublabel="streaming SSR, shell flushed first"
        />
        {memPeak?.ossido && memPeak.next && (
          <StatCard
            value={ratio(memPeak.ossido.reqPerMb, memPeak.next.reqPerMb)}
            label="more requests per MB of RAM"
            sublabel={`under ${cores}-way parallel SSR load`}
          />
        )}
      </section>

      {/* Throughput */}
      <section className="mb-16">
        <SectionHeading eyebrow="Throughput" title="Requests per second">
          Higher is better. Every app is a production build rendering on every
          request - neither serves cached HTML. Each scenario runs
          single-threaded and across all {cores} cores.
        </SectionHeading>
        <div className="mb-5">
          <Legend note="higher is better" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {scenarios.map((s) => (
            <ChartCard key={s.key} title={s.title} path={s.path} note={s.note}>
              <BarChart bars={throughputBars(s.key)} />
            </ChartCard>
          ))}
        </div>
      </section>

      {/* Latency */}
      <section className="mb-16">
        <SectionHeading eyebrow="Latency" title="p99 latency (ms)">
          The 99th-percentile response time under the same load. Lower is
          better.
        </SectionHeading>
        <div className="overflow-x-auto rounded-xl border border-secondary bg-primary">
          <table className="w-full min-w-125 border-collapse text-sm">
            <thead>
              <tr>
                <Th>Scenario</Th>
                {configs.map((c) => (
                  <Th key={c.label} numeric>
                    {c.label}
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => {
                const cells = configs.map(
                  (c) =>
                    resultFor(results, s.key, c.framework, c.mode)
                      ?.latencyP99Ms ?? 0,
                );
                const best = Math.min(...cells.filter((v) => v > 0));
                return (
                  <tr key={s.key}>
                    <Td>{s.title}</Td>
                    {cells.map((v, i) => (
                      <Td key={configs[i].label} numeric strong={v === best}>
                        {formatMs(v)}
                      </Td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Streaming */}
      <section className="mb-16">
        <SectionHeading eyebrow="Streaming SSR" title="Time-to-first-byte">
          The streaming route flushes the shell first, then streams a 3000-row
          table. A lower TTFB means the browser starts painting sooner. Lower is
          better.
        </SectionHeading>
        <div className="mb-5">
          <Legend note="lower is better" />
        </div>
        <ChartCard title="Time-to-first-byte (ms)" path="/stream">
          <BarChart
            bars={configs.map(({ framework, mode, label }) => {
              const ms = streamingFor(results, framework, mode)?.ttfbMs ?? 0;
              return {
                label,
                framework,
                value: ms,
                display: `${formatMs(ms)} ms`,
              };
            })}
          />
        </ChartCard>
      </section>

      {/* Memory */}
      {memory && (
        <section className="mb-16">
          <SectionHeading
            eyebrow="Memory efficiency"
            title="Requests per MB of RAM"
          >
            Ossido scales SSR across cores with V8 render threads inside a
            single Rust process (one shared heap); Next.js forks {cores} full
            Node processes (a heap each). Identical{' '}
            <code className="font-mono text-sm">/ssr</code> load at each
            parallelism level, sampling resident memory throughout.
          </SectionHeading>
          <div className="overflow-x-auto rounded-xl border border-secondary bg-primary">
            <table className="w-full min-w-125 border-collapse text-sm">
              <thead>
                <tr>
                  <Th>Parallelism</Th>
                  <Th numeric>Ossido req/s·MB</Th>
                  <Th numeric>Next req/s·MB</Th>
                  <Th numeric>Ossido RSS (MB)</Th>
                  <Th numeric>Next RSS (MB)</Th>
                </tr>
              </thead>
              <tbody>
                {memory.levels.map((level) => {
                  const o = memoryFor(memory, 'ossido', level);
                  const n = memoryFor(memory, 'next', level);
                  return (
                    <tr key={level}>
                      <Td>
                        ×{level}
                        {level === 1 ? ' (single)' : ''}
                      </Td>
                      <Td numeric strong>
                        {o ? o.reqPerMb.toFixed(2) : '-'}
                      </Td>
                      <Td numeric>{n ? n.reqPerMb.toFixed(2) : '-'}</Td>
                      <Td numeric>{o ? formatNum(o.meanRssMb) : '-'}</Td>
                      <Td numeric>{n ? formatNum(n.meanRssMb) : '-'}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs/relaxed text-quaternary">
            Idle resident memory at ×{cores}:{' '}
            <span className="font-medium text-tertiary">
              Ossido{' '}
              {formatNum(memoryFor(memory, 'ossido', cores)?.idleRssMb ?? 0)} MB
            </span>{' '}
            vs{' '}
            <span className="font-medium text-tertiary">
              Next.js{' '}
              {formatNum(memoryFor(memory, 'next', cores)?.idleRssMb ?? 0)} MB
            </span>
            .
          </p>
        </section>
      )}

      {/* Methodology */}
      <section className="rounded-xl border border-secondary bg-secondary/40 p-6 md:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-primary">
          How this was measured
        </h2>
        <p className="mt-3 max-w-3xl text-sm/relaxed text-tertiary">
          Load generated with autocannon: {load.connections} connections,{' '}
          {load.durationSec}s per scenario after a {load.warmupSec}s warm-up.
          Single-threaded runs Ossido with{' '}
          <code className="font-mono">OSSIDO_SSR_THREADS=1</code> and Next.js as
          one Node process; multi-threaded runs Ossido with one V8 render
          isolate per core and Next.js as a {cores}-worker cluster. Results are
          hardware-dependent - regenerate them on your own machine.
        </p>
        <dl className="mt-5 grid gap-x-10 border-t border-secondary text-sm sm:grid-cols-2">
          <EnvRow label="CPU" value={environment.cpu} />
          <EnvRow label="Logical cores" value={environment.cores} />
          <EnvRow label="Host" value={environment.host} />
          <EnvRow label="Memory" value={`${environment.totalMemGb} GB`} />
          <EnvRow label="Ossido" value={version} />
          <EnvRow label="Next.js" value={results.versions.next} />
        </dl>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
          <a
            href={source}
            className="inline-flex items-center gap-1 text-ossido-orange hover:underline"
          >
            Full results (Markdown + JSON)
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href={repo}
            className="inline-flex items-center gap-1 text-ossido-orange hover:underline"
          >
            Reproduce the benchmark
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
};

export default Benchmarks;
