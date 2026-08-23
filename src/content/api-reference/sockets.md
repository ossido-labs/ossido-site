---
name: sockets
ecosystem: rust
kind: function
order: 10
guide: /documentation/websockets
source:
  kind: rust
  symbol: sockets
---

The process-global `SocketManager`. Always available - no init required - so you
can address stored connections from anywhere, not just the socket handler.

```rust
use ossido::ws::sockets;

// From an #[api], an #[action], or a background task - anywhere:
sockets().get(&user_id).send(&UserJoined { user_id }).await;
```
