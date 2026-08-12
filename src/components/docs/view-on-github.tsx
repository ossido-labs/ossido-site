import { GitHubIcon } from '@/components/global/icons';

/** "View this page on GitHub" link shown beneath a documentation page's title. */
export function ViewOnGithub({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mb-8 inline-flex items-center gap-1.5 text-sm text-quaternary opacity-60 hover:opacity-100 duration-200 transition"
    >
      <GitHubIcon className="size-4" />
      View this page on GitHub
    </a>
  );
}
