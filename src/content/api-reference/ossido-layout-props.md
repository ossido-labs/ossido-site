---
name: OssidoLayoutProps
ecosystem: react
kind: type
order: 30
guide: /documentation/react-frontend
source:
  kind: ts
  module: "@ossido-labs/ossido"
  export: OssidoLayoutProps
description: Props for a layout component - { children } for the wrapped subtree.
---

```tsx
import type { OssidoLayoutProps } from '@ossido-labs/ossido'

export default function Layout({ children }: OssidoLayoutProps) {
  return <section>{children}</section>
}
```
