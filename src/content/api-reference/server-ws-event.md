---
name: '#[server_ws_event]'
ecosystem: rust
kind: macro
order: 11
guide: /documentation/websockets
source:
  kind: rust-macro
  name: server_ws_event
signature: |-
  #[server_ws_event("name")]
  pub struct Event { /* fields → generated TypeScript */ }
---

A JSON event the server sends to the client. Applies everything `#[Type]` does
(serde + generated TypeScript) and marks the struct as a `ServerWsEvent`, so the
type system only lets you send these to a client. A bare identifier also works as
the name: `#[server_ws_event(user_joined)]`.

```rust
#[server_ws_event("user_joined")]
pub struct UserJoined {
    pub user_id: u64,
}
```
