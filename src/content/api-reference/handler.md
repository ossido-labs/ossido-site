---
name: "#[handler]"
ecosystem: rust
kind: macro
order: 0
guide: /documentation/rust-backend
source:
  kind: rust-macro
  name: handler
signature: |-
  #[handler]
  async fn page(req: Request /* , state, Logger */) -> impl Into<Response>
description: Turns an async function into a page/route data handler. The first
  argument is the Request; remaining arguments are injected application state or
  a Logger. Its return becomes the page's props.
---

Return a #[Props] struct — it becomes the page component’s props:

```rust
// src/routes/page.rs
#[handler]
async fn home(_req: Request) -> HomeProps {
    HomeProps { message: "Hello from Rust".into() }
}
```

Read a dynamic segment, and inject application state by name:

```rust
// src/routes/posts/[id]/page.rs
#[handler]
async fn post(req: Request, db: Db) -> PostProps {
    let id = req.params.get("id").unwrap();
    PostProps { post: db.load_post(id).await }
}
```

Return a Response directly to redirect or set a status; log with a Logger:

```rust
#[handler]
async fn dashboard(req: Request, logger: Logger) -> Response {
    logger.info("rendering dashboard");
    if req.headers.get("cookie").is_none() {
        return Response::Redirect("/login".into());
    }
    DashboardProps::load().await.into()
}
```
