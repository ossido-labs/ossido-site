import React from 'react';
import { Link } from '@ossido-labs/ossido';
import { Wordmark } from './wordmark';

interface FooterLink {
  href: string;
  text: string;
  external?: boolean;
}

interface FooterColumn {
  heading: string;
  links: Array<FooterLink>;
}

const COLUMNS: Array<FooterColumn> = [
  {
    heading: 'Product',
    links: [
      { href: '/documentation', text: 'Documentation' },
      { href: '/guides', text: 'Guides' },
      { href: '/news', text: 'News' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { href: 'https://crates.io/crates/ossido_cli', text: 'crates.io', external: true },
      { href: 'https://github.com/ossido/ossido/releases', text: 'Changelog', external: true },
      { href: '/documentation/installation', text: 'Getting started' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { href: 'https://github.com/ossido/ossido', text: 'GitHub', external: true },
      { href: 'https://discord.gg/ossido', text: 'Discord', external: true },
      { href: 'https://github.com/ossido/ossido/discussions', text: 'Discussions', external: true },
    ],
  },
];

const SOCIALS: Array<{ href: string; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }> = [
  { href: 'https://github.com/ossido/ossido', label: 'Ossido on GitHub', icon: GitHubIcon },
  { href: 'https://discord.gg/ossido', label: 'Ossido on Discord', icon: DiscordIcon },
];

const linkClass =
  'group inline-flex items-center gap-1 text-sm text-fg-quaternary hover:text-fg-primary duration-150';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-secondary bg-primary">
      <div className="max-w-350 mx-auto px-8 py-12 md:py-16">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between md:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-5 md:max-w-xs">
            <Link href="/" aria-label="Ossido home" className="w-fit">
              <Wordmark />
            </Link>
            <p className="text-sm/relaxed text-fg-tertiary text-balance">
              A <span className="text-ossido-orange">Rust</span> powered{' '}
              <span className="text-ossido-cyan">React</span> framework for server-side
              rendering, built on Axum.
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid place-items-center h-9 w-9 rounded-lg border border-secondary text-fg-quaternary hover:text-fg-primary hover:bg-primary_hover hover:border-primary duration-150"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12 lg:gap-16">
            {COLUMNS.map((column) => (
              <div key={column.heading} className="flex flex-col gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-tertiary">
                  {column.heading}
                </h3>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={linkClass}
                        >
                          {link.text}
                          <ExternalIcon className="h-3 w-3 opacity-0 duration-150 group-hover:opacity-100" />
                        </a>
                      ) : (
                        <Link href={link.href} className={linkClass}>
                          {link.text}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-secondary border-dashed flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fg-quaternary">
            © {year} Ossido. Released under the MIT License.
          </p>
          <p className="text-sm text-fg-quaternary inline-flex items-center gap-1.5">
            Built with
            <span className="text-ossido-orange font-medium">Rust</span>
            <span aria-hidden>+</span>
            <span className="text-ossido-cyan font-medium">React</span>
          </p>
        </div>
      </div>
    </footer>
  );
};


function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  );
}

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.32 4.37A19.8 19.8 0 0 0 15.45 2.9a.07.07 0 0 0-.08.04c-.21.38-.44.87-.6 1.25a18.3 18.3 0 0 0-5.5 0 12.6 12.6 0 0 0-.61-1.25.08.08 0 0 0-.08-.04c-1.71.3-3.35.8-4.87 1.47a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.05 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.29 1.22-1.99a.08.08 0 0 0-.04-.11c-.65-.25-1.27-.55-1.87-.89a.08.08 0 0 1-.01-.13l.37-.29a.07.07 0 0 1 .08-.01c3.92 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08 0l.37.3a.08.08 0 0 1-.01.13c-.6.35-1.22.64-1.87.89a.08.08 0 0 0-.04.11c.36.7.77 1.36 1.22 1.99a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.54-13.66a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42Zm7.97 0c-1.18 0-2.15-1.08-2.15-2.42s.95-2.42 2.15-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Z" />
    </svg>
  );
}

function ExternalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}
