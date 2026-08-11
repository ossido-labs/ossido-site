---
name: useFormStatus
ecosystem: react
kind: hook
order: 24
guide: /documentation/server-actions
source:
  kind: ts
  module: "@ossido-labs/ossido/actions"
  export: useFormStatus
signature: const { pending, data, method, action } = useFormStatus()
description: React DOM's hook for the pending state of the nearest parent
  <form>, re-exported for convenience inside action forms.
---

```tsx
import { useFormStatus } from '@ossido-labs/ossido/actions'

function Submit() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>Save</button>
}
```
