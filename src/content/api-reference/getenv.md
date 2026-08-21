---
name: getEnv
ecosystem: react
kind: function
order: 27
guide: /documentation/environment-variables
source:
  kind: ts
  module: '@ossido-labs/ossido/env'
  export: getEnv
signature: |-
  function getEnv<K extends keyof PublicEnv>(key: K): PublicEnv[K];
  function getEnv<K extends keyof PublicEnv>(
    key: K,
    fallback: NonNullable<PublicEnv[K]>,
  ): NonNullable<PublicEnv[K]>;
---

Only `#[public]` fields are available, and their types are generated into `.ossido/types.ts`, so keys and value types are checked. `getEnv` works during SSR and on the client.

```tsx
import { getEnv } from '@ossido-labs/ossido/env';

const apiUrl = getEnv('API_URL'); // string
const analytics = getEnv('ANALYTICS_ENABLED'); // boolean | null
```

A second argument is a fallback that collapses an optional value to a concrete `T`. It's returned whenever the value is absent (an optional variable unset, or no public environment available), so this form never throws:

```tsx
const enabled = getEnv('ANALYTICS_ENABLED', false); // boolean
```
