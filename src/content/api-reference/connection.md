---
name: Connection
ecosystem: rust
kind: struct
order: 21
guide: /documentation/websockets
source:
  kind: rust
  symbol: Connection
---

Returned by `SocketManager::store`: the read side of a stored socket plus the
means to reply and re-key it. `recv().await` yields the next inbound client event
(`None` on close), `send(&ev).await` replies, `handle()` hands out a cloneable
`SocketHandle`, and `add_key(key)` stores it under an additional key. Dropping it
unregisters the connection from the manager automatically.

```rust
let mut conn = sockets.store(user_id, socket);
while let Some(Ok(incoming)) = conn.recv().await {
    conn.send(&UserJoined { user_id }).await.ok();
}
```
