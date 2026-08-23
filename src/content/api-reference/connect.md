---
name: connect
ecosystem: react
kind: function
order: 33
guide: /documentation/websockets
source:
  kind: ts
  module: '@ossido-labs/ossido/ws'
  export: connect
signature: |-
  function connect(options?: {
    protocols?: string | Array<string>;
  }): OssidoSocket
---

Connects to the app's `#[ws]` handler at `/__ossido/ws` (resolving `ws(s)://` from
the current origin) and returns a small typed handle. `on(handler)` subscribes to
inbound server events and returns an unsubscribe; `send(event)` sends a client
event; `close()` closes; and `raw` exposes the underlying `WebSocket`. Send and
receive are typed against the events you declared.

```tsx
import { connect } from '@ossido-labs/ossido/ws';

const socket = connect();
const off = socket.on((event) => {
  if (event.event === 'user_joined') console.log(event.data.user_id);
});
socket.send({ event: 'chat_message', data: { text: 'hello' } });
```
