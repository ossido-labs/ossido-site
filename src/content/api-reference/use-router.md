---
name: useRouter
ecosystem: react
kind: hook
order: 22
guide: /documentation/react-frontend
source:
  kind: ts
  module: '@ossido-labs/ossido'
  export: useRouter
description: Access the router instance for programmatic navigation and the
  current location.
---

```tsx
import { useRouter } from '@ossido-labs/ossido';

const { pathname } = useRouter();
```
