---
name: SocketManager
ecosystem: rust
kind: struct
order: 20
guide: /documentation/websockets
source:
  kind: rust
  symbol: SocketManager
---

The keyed connection store. `store(key, socket)` indexes a live socket under any
`Key` and returns a `Connection`; `get(&key)` returns the `SocketGroup` stored
there; `broadcast(&ev)` sends to every live connection; `count()` reports the
total. Reach it anywhere via `sockets()`, or inject it as a handler parameter.

```rust
let group = sockets.get(&user_id);
group.send(&UserJoined { user_id }).await;        // this user, every tab/device
sockets.broadcast(&UserJoined { user_id }).await; // everyone
```
