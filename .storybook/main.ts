import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

const srcDir = new URL('../src', import.meta.url).pathname;

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/react-vite',
  // Process the app's Tailwind (global.css) so stories match the real app.
  viteFinal: async (cfg) => {
    cfg.plugins = cfg.plugins ?? [];
    cfg.plugins.push(tailwindcss());
    cfg.optimizeDeps = cfg.optimizeDeps ?? {};
    cfg.optimizeDeps.exclude = [...(cfg.optimizeDeps.exclude ?? []), '@tailwindcss/oxide'];
    // Mirror the app's `@/*` -> `src/*` path alias so stories can render UI-kit
    // components (which import via `@/...` internally).
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = { ...cfg.resolve.alias, '@': srcDir };
    return cfg;
  },
};
export default config;
