---
name: apiClient
ecosystem: react
kind: constant
order: 28
guide: /documentation/api-client
source:
  kind: ts
  module: '@ossido-labs/ossido/client'
  export: apiClient
---

```tsx
import { apiClient } from '@ossido-labs/ossido/client';

const res = await apiClient.get('/api/health');
const data = await res.json();
```
