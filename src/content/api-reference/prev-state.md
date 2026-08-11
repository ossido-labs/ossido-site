---
name: PrevState
ecosystem: rust
kind: struct
order: 10
guide: /documentation/server-actions#stateful-actions-useactionstate
source:
  kind: rust
  symbol: PrevState
---

```rust
#[action]
async fn submit(prev: PrevState<FormState>, input: Subscribe) -> FormState {
    let attempts = prev.get().map(|s| s.attempts + 1).unwrap_or(1);
    FormState { attempts, ok: input.email.contains('@') }
}
```
