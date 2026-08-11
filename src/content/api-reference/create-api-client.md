---
name: createApiClient
ecosystem: react
kind: function
order: 26
guide: /documentation/api-client
source:
  kind: ts
  module: "@ossido-labs/ossido/client"
  export: createApiClient
---

```tsx
import { createApiClient } from '@ossido-labs/ossido/client'

const api = createApiClient({ baseUrl: 'https://example.com' })
const res = await api.get('/api/user', { params: { id: '1' } })
```
