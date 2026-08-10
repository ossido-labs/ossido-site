import React from 'react';
import { Link } from '@ossido-labs/ossido';
import { Wordmark } from './wordmark';
import {
  DiscordIcon,
  ExternalIcon,
  GitHubIcon,
} from '@/components/global/icons';

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
      { href: 'https://github.com/ossido-labs/ossido/releases', text: 'Changelog', external: true },
      { href: '/documentation/installation', text: 'Getting started' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { href: 'https://github.com/ossido-labs/ossido', text: 'GitHub', external: true },
      { href: 'https://discord.com/invite/3ddKV4e83M', text: 'Discord', external: true },
      { href: 'https://github.com/ossido-labs/ossido/discussions', text: 'Discussions', external: true },
    ],
  },
];

const SOCIALS: Array<{ href: string; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }> = [
  { href: 'https://github.com/ossido-labs/ossido', label: 'Ossido on GitHub', icon: GitHubIcon },
  { href: 'https://discord.com/invite/3ddKV4e83M', label: 'Ossido on Discord', icon: DiscordIcon },
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
