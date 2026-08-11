---
name: useActionState
ecosystem: react
kind: hook
order: 23
guide: /documentation/server-actions#stateful-actions-useactionstate
source:
  kind: ts
  module: "@ossido-labs/ossido/actions"
  export: useActionState
signature: const [state, formAction, isPending] = useActionState(action, initialState)
description: React's hook for stateful actions, re-exported so there's one
  import site. Pass a stateful Ossido action (one with a PrevState argument) and
  its initial state.
---

```tsx
import { useActionState } from '@ossido-labs/ossido/actions'
import { submitSignup } from '.ossido/actions'

const [state, formAction, isPending] = useActionState(submitSignup, INITIAL)
```
