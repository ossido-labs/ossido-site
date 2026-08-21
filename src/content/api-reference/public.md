---
name: '#[public]'
ecosystem: rust
kind: macro
order: 9
guide: /documentation/environment-variables
source:
  kind: rust-macro
  name: public
signature: |-
  #[Environment]
  pub struct Environment {
      #[public]
      API_URL: String, // exposed as getEnv('API_URL')
  }
description: An inert helper attribute on an Environment field that exposes it to the frontend. Public fields are serialized into the SSR payload and the browser global that getEnv reads; every other field stays server-only.
---

Mark the fields you want available in the browser. Only `#[public]` fields are serialized to the client - secrets and connection strings left unmarked never leave the server:

```rust
use ossido::Environment;

#[allow(non_snake_case)]
#[Environment]
pub struct Environment {
    #[public]
    API_URL: String, // getEnv('API_URL')

    DATABASE_URL: String, // server-only
}
```
