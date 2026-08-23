---
name: '#[ws]'
ecosystem: rust
kind: macro
order: 10
guide: /documentation/websockets
source:
  kind: rust-macro
  name: ws
signature: |-
  #[ws]
  pub async fn socket(req: Request, socket: WebSocket, sockets: SocketManager /* , Logger, state */)
---

The project's single WebSocket handler. It must live in `src/ws.rs`; marking one
under `src/routes/**` is a build error. After `Request`, parameters may appear in
any order and are supplied by the framework (`WebSocket`, `TypedSocket`,
`SocketManager`, `Logger`) or destructured from your `ApplicationState`.

```rust
// src/ws.rs
use ossido::ws::{Connection, SocketManager, WebSocket, WsEvent};
use ossido::{ws, Logger, Request};

#[ws]
pub async fn socket(req: Request, socket: WebSocket, sockets: SocketManager, logger: Logger) {
    let mut conn: Connection = sockets.store(user_id, socket);
    while let Some(Ok(incoming)) = conn.recv().await {
        // dispatch on incoming.event()
    }
}
```
