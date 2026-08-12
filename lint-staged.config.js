export default {
  '*.{ts,mts,cts,js,mjs,cjs}': ['oxlint --fix', 'oxfmt'],
  '*.{ts,mts,cts,cjs}': () => 'tsc -p tsconfig.json --noEmit',
};
