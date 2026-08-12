---
name: Link
ecosystem: react
kind: component
order: 19
guide: /documentation/react-frontend#client-navigation
source:
  kind: ts
  module: '@ossido-labs/ossido'
  export: Link
description: Client-side navigation link - preload-aware (loads the route on
  hover/viewport), with optional scroll, replace, and View Transition control.
  Keeps navigation within the SPA.
---

```tsx
import { Link } from '@ossido-labs/ossido';

<Link href="/guides" preload>
  Guides
</Link>;
```
