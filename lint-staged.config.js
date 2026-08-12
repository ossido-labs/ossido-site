export default {
  '{src,scripts,.storybook}/**/*.{ts,tsx,js,jsx,mjs,cjs}': [
    'oxlint --fix',
    'oxfmt',
  ],
  '*.{ts,mts,cts,js,mjs,cjs}': ['oxlint --fix', 'oxfmt'],
  '*.{ts,mts,cts,cjs}': () => 'tsc -p tsconfig.json --noEmit',
};
