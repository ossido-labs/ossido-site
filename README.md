<div align="center">
  <a href="https://ossido.dev">
    <img src="https://raw.githubusercontent.com/ossido-labs/ossido/main/assets/header.png" alt="Ossido" width="100%">
  </a>

  <p><strong>The full-stack React framework powered by a Rust backend — built for usability and performance.</strong></p>

  <p>
    <a href="https://crates.io/crates/ossido_cli"><img src="https://img.shields.io/crates/v/ossido_cli?logo=rust&label=crates.io&color=E43717" alt="crates.io version"></a>
    <a href="https://www.npmjs.com/package/@ossido-labs/ossido"><img src="https://img.shields.io/npm/v/@ossido-labs/ossido?logo=npm&label=npm&color=CB3837" alt="npm version"></a>
    <a href="https://github.com/ossido-labs/ossido/actions/workflows/rust-ci.yml"><img src="https://github.com/ossido-labs/ossido/actions/workflows/rust-ci.yml/badge.svg" alt="Rust CI"></a>
    <a href="https://github.com/ossido-labs/ossido/actions/workflows/typescript-ci.yml"><img src="https://github.com/ossido-labs/ossido/actions/workflows/typescript-ci.yml/badge.svg" alt="TypeScript CI"></a>
    <a href="./LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://discord.com/invite/3ddKV4e83M"><img src="https://img.shields.io/discord/1536194582889627658?style=flat" alt="Discord"></a>
  </p>

  <p>
    <a href="https://ossido.dev">Documentation</a> ·
    <a href="https://discord.com/invite/3ddKV4e83M">Discord</a> ·
    <a href="https://ossido.dev/documentation/contributing">Contributing</a>
  </p>
</div>

# ossido-site

The [Ossido](https://ossido.dev) website — marketing home, documentation, guides
and news — built with Ossido itself (the React/Rust full-stack framework). It's a
statically-exported site: React 19 + Tailwind CSS v4 on the front, an Axum/Rust
SSR pass that pre-renders every route at build time, and MDX-authored content.

The home hero is an isometric obsidian cube (three.js via react-three-fiber),
engraved with the React, Rust and lightning-bolt symbols and ringed by an oxygen
atom of counter-rotating "oxide" word rings and electron shells.

## Prerequisites

- [Bun](https://bun.sh) — package manager and script runner
- A [Rust toolchain](https://rustup.rs) — the Ossido CLI is Rust, and the build
  compiles a small SSR server to pre-render the site
- The **Ossido CLI** (`ossido`), which `bun run dev` / `bun run build` shell out to:

  **macOS / Linux**

  ```sh
  curl -fsSL https://ossido.dev/install.sh | bash
  ```

  **Windows**

  ```powershell
  irm https://ossido.dev/install.ps1 | iex
  ```

  Or install the exact pinned version from crates.io (this is what CI uses):

  ```sh
  cargo install ossido_cli --version 0.1.1 --locked
  ```

## Getting started

```sh
bun install
bun run dev
```

The dev server runs at [http://localhost:3000](http://localhost:3000) with hot
module reloading.

To produce and preview the static build:

```sh
bun run build   # → ./out/static
bun run serve   # serves ./out/static locally
```

## Scripts

| Script                    | What it does                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `bun run dev`             | Start the Ossido dev server (HMR) on port 3000.                                      |
| `bun run build`           | Clean `./out`, run prebuild hooks, and statically export the site to `./out/static`. |
| `bun run serve`           | Serve the built `./out/static` locally.                                              |
| `bun run typecheck`       | `tsc --noEmit` across the project.                                                   |
| `bun run storybook`       | Run Storybook (component workshop) on port 6006.                                     |
| `bun run build-storybook` | Build the static Storybook.                                                          |
| `bun run bake`            | Bake the engraved cube mesh (see below).                                             |
| `bun run encode-textures` | Encode the cube's PBR textures to KTX2 (see below).                                  |

## Asset pipelines

Two of the hero cube's assets are generated offline rather than at runtime, so
the client never pays for the expensive work.

- **Cube geometry — `bun run bake`.** The obsidian cube's engravings are real
  boolean (CSG) cuts of the React/Rust/bolt vector symbols into a rounded box.
  That cut is baked ahead of time to `public/cube-geometry.bin` (a compact binary
  the client loads and hydrates with cheap per-vertex passes), keeping the
  `three-bvh-csg` toolchain out of the bundle. It runs automatically as a
  `prebuild` hook (see `ossido.config.ts`), so a normal build regenerates it; run
  it by hand only when the geometry spec changes. The `.bin` is gitignored.

- **Cube textures — `bun run encode-textures`.** The five PBR maps are
  [KTX2 (Basis Universal)](https://github.khronos.org/KTX-Software/) so they stay
  GPU-compressed in VRAM (transcoded to ASTC/ETC/BC per device) — far cheaper
  per-fragment sampling on mobile GPUs than uploading full RGBA. This is a
  **manual** step (its `public/obsidian/*.ktx2` outputs are committed, since CI
  has no encoder):

  ```sh
  brew install basis_universal          # provides `basisu`
  bun run encode-textures [srcDir]       # srcDir defaults to ~/Documents/obsidion
  ```

  The Basis transcoder that decodes them in the browser is hosted at
  `public/basis/`.

## Project structure

```
src/
  routes/            File-based routes (page/layout/loading/not-found/error.tsx).
    documentation/   MDX docs.
    guides/          MDX guides.
    news/            MDX blog posts.
    api/             Rust API handlers (middleware, health check).
  components/
    home-hero/       The 3D cube + oxygen-atom rings (three.js / R3F).
    ...              Global chrome, search command palette, content layout, UI kit.
  content/           Doc/guide manifests.
  styles/            Tailwind theme + global CSS.
scripts/             Offline asset builders (bake-cube, encode-textures, search index).
public/              Static assets served at the site root.
```

Routing is file-based: `page.tsx` renders a route, `layout.tsx` wraps a subtree,
and `loading.tsx` / `not-found.tsx` / `error.tsx` provide the Suspense, 404 and
error-boundary fallbacks.

## Deployment

Pushes to `main` are built and published to **GitHub Pages** by
`.github/workflows/deploy.yml`: it sets up Bun + Rust, installs the pinned
`ossido_cli`, runs `bun run build`, and uploads `./out/static` as the Pages
artifact.
