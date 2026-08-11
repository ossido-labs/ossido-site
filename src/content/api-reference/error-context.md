---
name: ErrorContext
ecosystem: rust
kind: struct
order: 13
guide: /documentation/error-handling
source:
  kind: rust
  symbol: ErrorContext
---

```rust
set_error_handler(|ctx: ErrorContext| async move {
    eprintln!("{} on {}", ctx.error, ctx.request.uri);
    None
});
```
