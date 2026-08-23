---
name: '#[client_ws_event]'
ecosystem: rust
kind: macro
order: 12
guide: /documentation/websockets
source:
  kind: rust-macro
  name: client_ws_event
signature: |-
  #[client_ws_event("name")]
  pub struct Event { /* fields → generated TypeScript */ }
---

A JSON event the client sends to the server. Applies everything `#[Type]` does
(serde + generated TypeScript) and marks the struct as a `ClientWsEvent`, so the
type system only lets you parse these from an inbound frame. A bare identifier also
works as the name: `#[client_ws_event(chat_message)]`.

```rust
#[client_ws_event("chat_message")]
pub struct ChatMessage {
    pub text: String,
}
```
