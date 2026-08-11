---
name: Response
ecosystem: rust
kind: enum
order: 17
guide: /documentation/rust-backend
source:
  kind: rust
  symbol: Response
description: "A handler's return value: page Props, a redirect, or a custom axum
  response. Most handlers return a #[Props] struct and never build this
  directly."
---

```rust
#[handler]
async fn go(_req: Request) -> Response {
    Response::Redirect("/login".into())
}
```
