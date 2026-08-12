---
name: set_error_handler
ecosystem: rust
kind: function
order: 7
guide: /documentation/error-handling
source:
  kind: rust
  symbol: set_error_handler
---

Register once, early (typically from src/app.rs main()), before the server starts - the first registration wins. The closure runs for every error thrown by a handler or action.

Report every error, then fall back to the default error page:

```rust
// src/app.rs
set_error_handler(|ctx: ErrorContext| async move {
    report(&ctx.error).await;
    None // None → Ossido renders its default error page / JSON
});
```

Return Some(response) to override the default 500 with your own:

```rust
use ossido::axum::{http::StatusCode, response::IntoResponse, Json};

set_error_handler(|ctx: ErrorContext| async move {
    report(&ctx.error).await;
    Some((StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorBody { id: ctx.error_id })).into_response())
});
```
