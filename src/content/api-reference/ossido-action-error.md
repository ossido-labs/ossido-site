---
name: OssidoActionError
ecosystem: react
kind: class
order: 27
guide: /documentation/server-actions#error-handling
source:
  kind: ts
  module: "@ossido-labs/ossido/actions"
  export: OssidoActionError
signature: |-
  class OssidoActionError extends Error {
    message: string
    fields?: Record<string, string>
  }
---

```tsx
import { OssidoActionError } from '@ossido-labs/ossido/actions'

try {
  await createUser(input)
} catch (e) {
  if (e instanceof OssidoActionError) console.log(e.message, e.fields)
}
```
