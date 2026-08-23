---
name: Key
ecosystem: rust
kind: trait
order: 30
guide: /documentation/websockets
source:
  kind: rust
  symbol: Key
signature: |-
  pub trait Key: Eq + Hash + Clone + Send + Sync + 'static {}
---

Anything usable to index connections in the `SocketManager`. Blanket-implemented
for every `Eq + Hash + Clone + Send + Sync + 'static` type, so a `u64` user id, a
`String` room name, a `Uuid`, or a custom enum all qualify with no manual impl.
Keys of different types never collide, so you can key some connections by user id
and others by room name in the same app.

```rust
sockets.store(user_id, socket);          // keyed by a u64
conn.add_key(format!("room:{room_id}")); // also keyed by a String
```
