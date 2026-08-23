---
name: SocketHandle
ecosystem: rust
kind: struct
order: 23
guide: /documentation/websockets
source:
  kind: rust
  symbol: SocketHandle
---

A cheap, cloneable sender for one live connection - the write side, safe to hold
and use from anywhere. Obtained from a `SocketGroup` or `Connection::handle()`.
Exposes `id()`, `send(&ev)`, and `close(code)`.

```rust
let handle = conn.handle();
tokio::spawn(async move {
    handle.send(&UserJoined { user_id }).await.ok();
});
```
