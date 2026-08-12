import { createContext } from 'react';

const REPO_BLOB = 'https://github.com/ossido-labs/ossido-site/blob/main';

/** GitHub "blob" URL for a repo-relative source path (e.g. a docs `page.mdx`). */
export function githubSource(repoRelPath: string): string {
  return `${REPO_BLOB}/${repoRelPath}`;
}

/**
 * GitHub URL for the current docs page's source, provided by the documentation
 * layout and read by the MDX `h1` renderer to show a "View this page on GitHub"
 * link beneath the title. `null` outside docs (blog, guides), so no link renders
 * there.
 */
export const DocSourceContext = createContext<string | null>(null);
