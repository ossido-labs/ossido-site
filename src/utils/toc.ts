/** A single "On this page" entry, derived at build time from a document's headings. */
export interface Heading {
  id: string;
  text: string;
  level: number;
}

/**
 * Resolve the compile-time `toc` export for the current route from a glob map of
 * a section's `page.mdx` `toc` exports (see `remarkTocExport` in ossido.config.ts).
 *
 * `modules` comes from `import.meta.glob('./**\/page.mdx', { eager: true, import: 'toc' })`
 * in a section layout, so its keys are file paths relative to that layout
 * (e.g. `./rust-backend/page.mdx`). `basePath` is the section's route root
 * (e.g. `/documentation`).
 */
export function headingsForPath(
  modules: Record<string, ReadonlyArray<Heading> | undefined>,
  basePath: string,
  pathname: string,
): Array<Heading> {
  const target = pathname.replace(/\/$/, '');

  for (const [key, toc] of Object.entries(modules)) {
    const slug = key.replace(/^\.\//, '').replace(/\/?page\.mdx$/, '');
    const route = slug ? `${basePath}/${slug}` : basePath;
    if (route === target) return toc ? [...toc] : [];
  }

  return [];
}
