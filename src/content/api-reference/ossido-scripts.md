---
name: OssidoScripts
ecosystem: react
kind: component
order: 21
guide: /documentation/react-frontend
source:
  kind: ts
  module: '@ossido-labs/ossido'
  export: OssidoScripts
description: Injects the serialized server payload and the framework's client
  scripts. Render once in the root layout's <body>.
---

```tsx
import { OssidoScripts } from '@ossido-labs/ossido';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <OssidoScripts />
      </body>
    </html>
  );
}
```
