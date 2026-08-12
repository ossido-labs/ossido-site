---
name: dynamic
ecosystem: react
kind: function
order: 25
guide: /documentation/react-frontend
source:
  kind: ts
  module: '@ossido-labs/ossido'
  export: dynamic
---

```tsx
import { dynamic } from '@ossido-labs/ossido';

const Chart = dynamic(() => import('./Chart'), { ssr: false });
```
