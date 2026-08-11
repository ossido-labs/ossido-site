---
name: OssidoPage
ecosystem: react
kind: type
order: 29
guide: /documentation/typescript
source:
  kind: ts
  module: "@ossido-labs/ossido/types"
  export: OssidoPage
signature: "type OssidoPage<Path extends keyof RouteProps> = (props:
  RouteProps[Path]) => ReactNode"
description: Types a page component so its props are exactly the matching Rust
  handler's return type, keyed by the route path.
---

```tsx
import type { OssidoPage } from '@ossido-labs/ossido/types'

const Home: OssidoPage<'/'> = ({ message }) => <h1>{message}</h1>
export default Home
```
