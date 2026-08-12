---
name: OssidoConfig
ecosystem: react
kind: type
order: 32
guide: /documentation/configuration
source:
  kind: ts
  module: '@ossido-labs/ossido/config'
  export: OssidoConfig
description: 'The ossido.config.ts shape: server options, Vite passthrough,
  logging, SSR render threads, output mode, build hooks, and view transitions.'
---

```ts
import type { OssidoConfig } from '@ossido-labs/ossido/config';

const config: OssidoConfig = {
  output: 'static',
  server: { port: 3000 },
};
export default config;
```
