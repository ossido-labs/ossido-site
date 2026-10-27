/**
 * Post-build: render the not-found page to `404.html` for static hosting.
 *
 * Ossido's static build (`output: 'static'`) emits one HTML file per known route,
 * but nothing for unmatched URLs: the not-found route (`src/routes/not-found.tsx`)
 * is rendered by the router's catch-all, so there is no not-found HTML on disk.
 * Static hosts (GitHub Pages, etc.) serve `/404.html` for any path they can't
 * resolve, so we need that file to hold the *actual* not-found page.
 *
 * The build already compiled the SSR server (`target/debug/ossido`) to prerender
 * each route, so we reuse it: boot the same binary in buffered-prerender mode
 * (`OSSIDO_STATIC_EXPORT=1`, exactly as `ossido build` does), request an unmatched
 * path so the server renders the not-found page inside the app shell, and write
 * that response to `<buildFolder>/404.html`.
 *
 * Run with: bun run scripts/generate-404.ts [buildFolder] [port]
 * Wired into the production build via `build.postbuild` in ossido.config.ts, which
 * passes the resolved output directory and server port. Defaults: `./out/static`
 * and 3000.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const buildFolder =
  process.argv[2] ?? process.env.BUILD_FOLDER ?? join(ROOT, 'out', 'static');
const port = Number(process.argv[3] ?? process.env.PORT ?? 3000);
// `localhost` (not `127.0.0.1`) so we reach the server whichever family it binds:
// with the default host it listens on IPv6 `localhost` (::1), same as the address
// `ossido build` uses to drive static generation.
const host = process.argv[4] ?? process.env.HOST ?? 'localhost';

// The SSR server binary `ossido build` compiles for static generation (the `ossido`
// bin from Cargo.toml, debug profile). Present after a build.
const serverBin = join(ROOT, 'target', 'debug', 'ossido');
// A path that matches no route, so the server renders the not-found page.
const PROBE_PATH = '/__ossido_generate_404_probe';
const baseUrl = `http://${host}:${port}`;
const READY_TIMEOUT_MS = 60_000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function main(): Promise<void> {
  if (!existsSync(serverBin)) {
    console.error(
      `generate-404: server binary not found at ${serverBin} - run "ossido build" first.`,
    );
    process.exit(1);
  }

  // Boot the server the same way the build does: buffered (`prerender`) output so
  // the captured HTML is a clean, fully-settled snapshot that hydrates cleanly.
  const server = spawn(serverBin, {
    cwd: ROOT,
    env: { ...process.env, OSSIDO_STATIC_EXPORT: '1' },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let stderr = '';
  server.stderr?.on('data', (chunk) => (stderr += chunk));

  try {
    // Wait for the server to accept connections (bounded).
    const started = Date.now();
    for (;;) {
      try {
        await fetch(baseUrl, { signal: AbortSignal.timeout(1000) });
        break;
      } catch {
        if (server.exitCode !== null) {
          throw new Error(
            `server exited early (code ${server.exitCode}).\n${stderr}`,
          );
        }
        if (Date.now() - started >= READY_TIMEOUT_MS) {
          throw new Error(
            `server did not become ready at ${baseUrl} within ${READY_TIMEOUT_MS / 1000}s (is port ${port} free?).`,
          );
        }
        await sleep(150);
      }
    }

    // Request an unmatched path; the catch-all renders the not-found page.
    const res = await fetch(baseUrl + PROBE_PATH);
    const html = await res.text();

    // Fail loudly if we didn't get the not-found page (e.g. a catch-all route
    // swallowed the probe path), rather than shipping a wrong 404.
    if (!html.includes('data-testid="not-found"')) {
      throw new Error(
        `response for ${PROBE_PATH} is not the not-found page - refusing to write 404.html.`,
      );
    }

    const dest = join(buildFolder, '404.html');
    writeFileSync(dest, html);
    console.log(`generate-404: wrote ${dest} (rendered not-found page).`);
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(`generate-404: ${err.message ?? err}`);
  process.exit(1);
});
