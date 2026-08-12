---
name: "#[middleware]"
ecosystem: rust
kind: macro
order: 2
guide: /documentation/middleware
source:
  kind: rust-macro
  name: middleware
signature: |-
  #[middleware]
  pub fn my_layer() -> impl Layer<S> + Clone
description: Marks a function in a middleware.rs that returns a Tower Layer
  applied to its route segment. A function returns a single Layer; compose
  several with a ServiceBuilder.
---

A single layer applied to this segment:

```rust
// src/routes/api/middleware.rs
use ossido::middleware;
use tower_http::cors::{Any, CorsLayer};

#[middleware]
pub fn api_cors() -> CorsLayer {
    CorsLayer::new().allow_origin(Any)
}
```

Combine several layers - stack them with a ServiceBuilder and return the stack:

```rust
use ossido::middleware;
use ossido::tower::{Layer, ServiceBuilder};
use tower_http::compression::CompressionLayer;
use tower_http::trace::TraceLayer;

#[middleware]
pub fn stack<S>() -> impl Layer<S> + Clone {
    ServiceBuilder::new()
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
}
```
