/**
 * Types + typed accessors for the benchmark data the `/benchmarks` page renders.
 *
 * The raw numbers are a committed snapshot in `benchmarks.generated.ts`, fetched
 * from the ossido-benchmarks repo by `scripts/build-benchmarks.ts` (wired into the
 * production build's `prebuild` hook). This module is the hand-written half: the
 * shape of that JSON (schemas `ossido-benchmark/results@1` and `.../memory@1`) plus
 * small helpers to look up a row and format a number, so the page stays declarative.
 */
import { BENCHMARKS } from './benchmarks.generated';

export type Framework = 'ossido' | 'next';
export type Mode = 'single' | 'multi';

export interface BenchEnvironment {
  host: string;
  cpu: string;
  cores: number;
  totalMemGb: number;
}

export interface BenchScenario {
  key: string;
  title: string;
  path: string;
  note: string;
}

/** One (framework × config × scenario) throughput/latency record. */
export interface BenchResult {
  framework: Framework;
  mode: Mode;
  threads: number;
  scenario: string;
  connections: number;
  rps: number;
  latencyMeanMs: number;
  latencyP50Ms: number;
  latencyP99Ms: number;
  throughputMbps: number;
  errors: number;
}

/** One streaming-SSR probe (shell flushed first, table streamed after). */
export interface BenchStreaming {
  framework: Framework;
  mode: Mode;
  threads: number;
  ttfbMs: number;
  totalMs: number;
  bytes: number;
}

export interface BenchResultsFile {
  schema: string;
  generatedAt: string;
  environment: BenchEnvironment;
  versions: { ossido: string; next: string };
  load: { connections: number; durationSec: number; warmupSec: number };
  scenarios: Array<BenchScenario>;
  results: Array<BenchResult>;
  streaming: Array<BenchStreaming>;
}

/** One memory-sweep row: identical /ssr load at a given parallelism level. */
export interface BenchMemoryRow {
  framework: Framework;
  parallelism: number;
  idleRssMb: number;
  meanRssMb: number;
  peakRssMb: number;
  rps: number;
  reqPerMb: number;
}

export interface BenchMemoryFile {
  schema: string;
  generatedAt: string;
  environment: BenchEnvironment;
  versions: { ossido: string; next: string };
  load: {
    connections: number;
    durationSec: number;
    warmupSec: number;
    route: string;
  };
  levels: Array<number>;
  results: Array<BenchMemoryRow>;
}

export interface BenchmarkBundle {
  /** Ossido release these results belong to (the `results/<version>/` folder). */
  version: string;
  /** GitHub tree URL for this version's result folder. */
  source: string;
  /** The benchmarks repo root. */
  repo: string;
  results: BenchResultsFile;
  memory: BenchMemoryFile | null;
}

export { BENCHMARKS };

const { results, memory } = BENCHMARKS;

/** Throughput/latency row for a scenario in a given framework + threading mode. */
export function resultFor(
  scenario: string,
  framework: Framework,
  mode: Mode,
): BenchResult | undefined {
  return results.results.find(
    (r) =>
      r.scenario === scenario && r.framework === framework && r.mode === mode,
  );
}

/** Streaming-SSR probe for a framework + threading mode. */
export function streamingFor(
  framework: Framework,
  mode: Mode,
): BenchStreaming | undefined {
  return results.streaming.find(
    (s) => s.framework === framework && s.mode === mode,
  );
}

/** Memory-sweep row for a framework at a parallelism level. */
export function memoryFor(
  framework: Framework,
  parallelism: number,
): BenchMemoryRow | undefined {
  return memory?.results.find(
    (r) => r.framework === framework && r.parallelism === parallelism,
  );
}

/** How many cores the multi-threaded configuration used. */
export const CORES = results.environment.cores;

/** `a` relative to `b`, e.g. 2157 / 581 -> "3.7×". */
export function ratio(a: number, b: number): string {
  if (!b) return '-';
  const r = a / b;
  return `${r >= 10 ? Math.round(r) : r.toFixed(1)}×`;
}

/** Thousands-separated integer (req/s, MB, etc.). */
export function formatNum(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** Milliseconds with sensible precision (sub-10ms keeps one decimal). */
export function formatMs(n: number): string {
  return n < 10 ? n.toFixed(1) : formatNum(n);
}
