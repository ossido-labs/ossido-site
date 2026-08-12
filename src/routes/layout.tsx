import type { JSX } from 'react';
import { OssidoScripts } from '@ossido-labs/ossido';
import type { OssidoLayoutProps } from '@ossido-labs/ossido';

import '../styles/global.css';
import { Header } from '../components/global/header.tsx';
import { Footer } from '../components/global/footer.tsx';
import { Toaster } from '../components/ui/base/toast/toast';
import { SearchProvider } from '../components/search/search-provider.tsx';

export default function RootLayout({
  children,
}: OssidoLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <head>
        <title>Ossido - React + Rust Full Stack Framework</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen dark-mode">
        <SearchProvider>
          <Header />
          {/* Tagged for the page swipe transition (see global.css). Lifting the
              content out during a view transition lets the old page leave fully
              before the new one swipes in; the header stays put. */}
          <div className="[view-transition-name:page]">
            <main>{children}</main>
            <Footer />
          </div>
        </SearchProvider>
        <Toaster />
        <OssidoScripts />
      </body>
    </html>
  );
}
