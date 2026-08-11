---
name: ActionError
ecosystem: rust
kind: struct
order: 9
guide: /documentation/server-actions#error-handling
source:
  kind: rust
  symbol: ActionError
---

```rust
return Err(ActionError::message("Please enter a valid email"));
// or with per-field messages:
return Err(ActionError::with_fields("Validation failed", fields));
```
