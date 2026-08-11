import React from 'react';
import { Wordmark } from './wordmark';
import { Link } from '@ossido-labs/ossido';
import { Input } from '@/components/ui/base/input/input';
import { GraduationHat02, Menu01, SearchMd, X } from '@untitledui/icons';
import { Button } from '@/components/ui/base/buttons/button';
import { useSearch } from '@/components/search/search-context';
import { GitHubIcon } from '@/components/global/icons';

const LINKS = [
  { href: '/guides', text: 'Guides' },
  { href: '/documentation', text: 'Documentation' },
  { href: '/api-reference', text: 'Reference' },
  { href: '/news', text: 'News' },
];

export const Header: React.FC = () => {
  // State
  const [open, setOpen] = React.useState(false);
  const { open: openSearch } = useSearch();

  return (
    <>
      <header className="z-50 h-16 border-b border-secondary bg-primary px-4 md:px-8 sticky top-0 [view-transition-name:site-header]">
        <div className="max-w-350 mx-auto h-16 flex items-center gap-4 md:gap-8">
          <Link href="/">
            <Wordmark />
          </Link>
          <span className="hidden md:block h-4 w-px bg-border-secondary" />

          {/* Desktop nav */}
          <nav className="mr-auto hidden md:block">
            <ul className="flex gap-6 text-sm">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-fg-quaternary hover:text-fg-primary duration-150 font-semibold"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop actions — search collapses first (lg+), then the whole cluster (md+). */}
          <div className="hidden md:flex gap-2">
            <Input
              className="hidden lg:block w-75"
              size="sm"
              icon={SearchMd}
              type="text"
              placeholder="Search..."
              shortcut
              // The palette owns the actual typing; focusing this field opens it.
              // Blur immediately so the modal's focus restoration lands on <body>,
              // not back here (which would re-fire onFocus and reopen it).
              onFocus={(e) => {
                openSearch();
                (e.target as HTMLInputElement).blur();
              }}
            />
            <Button
              size="sm"
              iconLeading={GitHubIcon}
              href="https://github.com/ossido-labs/ossido"
            />
            <Button
              size="sm"
              iconLeading={GraduationHat02}
              href="/documentation"
            >
              Learn
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <Button
            size="sm"
            color="tertiary"
            className="md:hidden ml-auto"
            iconLeading={open ? X : Menu01}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onPress={() => setOpen((o) => !o)}
          />
        </div>
      </header>
      {/* Mobile menu — a blurred scrim over the rest of the page (tap to dismiss),
            with the menu panel pinned to the top. */}
      {open && (
        <div
          className="md:hidden sticky top-16 bg-ossido-background border-b border-secondary z-99"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-primary/80 px-4 py-4 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <nav>
              <ul className="flex flex-col gap-1 text-sm">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-fg-quaternary hover:text-fg-primary hover:bg-primary_hover duration-150 font-semibold"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <Input
              className="w-full"
              size="sm"
              icon={SearchMd}
              type="text"
              placeholder="Search..."
              onFocus={() => {
                openSearch();
                setOpen(false);
              }}
            />
            <Button
              size="sm"
              iconLeading={GraduationHat02}
              className="w-full"
              href="/documentation"
            >
              Learn
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
