---
name: SocketGroup
ecosystem: rust
kind: struct
order: 22
guide: /documentation/websockets
source:
  kind: rust
  symbol: SocketGroup
---

The 0, 1, or many connections currently stored under a key, returned by
`SocketManager::get`. `send(&ev)` fans out to all of them; also `close(code)`,
`len()`, `is_empty()`, and `iter()` over the individual `SocketHandle`s.

```rust
let group = sockets.get(&user_id);
group.send(&UserJoined { user_id }).await; // to every connection under the key
group.close(1000).await;                    // or disconnect them all
```
