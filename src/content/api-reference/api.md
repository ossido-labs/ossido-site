---
name: "#[api]"
ecosystem: rust
kind: macro
order: 1
guide: /documentation/api-handlers
source:
  kind: rust-macro
  name: api
signature: |-
  #[api(GET)] // GET | POST | PUT | PATCH | DELETE
  async fn route(req: Request) -> impl IntoResponse
description: Defines an HTTP API endpoint under src/routes/api, with the method
  as the macro argument (GET/POST/PUT/PATCH/DELETE). Returns JSON or any axum
  response.
---

A GET endpoint returning JSON:

```rust
// src/routes/api/health.rs
#[api(GET)]
async fn health(_req: Request) -> Json<Status> {
    Json(Status { ok: true })
}
```

A POST endpoint reading a typed JSON body, with state injected by name:

```rust
// src/routes/api/subscribe.rs
#[api(POST)]
async fn subscribe(req: Request, db: Db) -> Json<Subscribed> {
    let input: Subscribe = req.body().unwrap();
    Json(Subscribed { id: db.insert(input).await })
}
```

Call it from the frontend with the typed client (see createApiClient):

```tsx
import { apiClient } from '@ossido-labs/ossido/client'

const res = await apiClient.get('/api/health')
const status = await res.json() // typed from your Rust route
```
