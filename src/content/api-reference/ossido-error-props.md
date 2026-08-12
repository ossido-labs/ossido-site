---
name: OssidoErrorProps
ecosystem: react
kind: type
order: 31
guide: /documentation/error-handling
source:
  kind: ts
  module: '@ossido-labs/ossido'
  export: OssidoErrorProps
---

```tsx
import type { OssidoErrorProps } from '@ossido-labs/ossido';

export default function Error({ error, reset }: OssidoErrorProps) {
  return <button onClick={reset}>Try again</button>;
}
```
