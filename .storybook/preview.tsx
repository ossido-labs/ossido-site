import type { Preview } from '@storybook/react-vite';
import { create } from 'storybook/theming';
// The app's global styles: Tailwind, fonts, and the shared `rotate` keyframe.
import '@/styles/global.css';
import { SearchContext } from '@/components/search/search-context';
import { setMockPathname } from './mocks/ossido';

// Dark autodocs, themed to the app: near-black surface and a rust-orange accent.
const docsTheme = create({
  base: 'dark',
  brandTitle: 'Ossido',
  appBg: '#080808',
  appContentBg: '#080808',
  appBorderColor: '#26262e',
  colorPrimary: '#ff5c1a',
  colorSecondary: '#ff5c1a',
  barBg: '#080808',
  fontBase:
    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  fontCode:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
});

// Put `.dark-mode` on the root so portaled content (react-aria modals/popovers, the
// command palette, toasts) also picks up the dark theme, not just the story wrapper.
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark-mode');
}

const preview: Preview = {
  parameters: {
    docs: { theme: docsTheme },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  // Render every story on the app's dark surface (the site defaults to `.dark-mode`
  // on <body>), provide a no-op search context so the header's search button works,
  // and let a story set the mock "current route" via a `route` parameter for
  // active-link states.
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
    (Story, context) => {
      setMockPathname((context.parameters.route as string | undefined) ?? '/');
      // Full-width components (header, footer, home sections) opt out of the padding.
      const pad = context.parameters.layout === 'fullscreen' ? '' : 'p-8';
      return (
        <SearchContext.Provider value={{ open: () => undefined }}>
          <div className={`dark-mode bg-primary text-primary ${pad}`}>
            <Story />
          </div>
        </SearchContext.Provider>
      );
    },
  ],
};

export default preview;
