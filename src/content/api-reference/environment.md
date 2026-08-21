---
name: '#[Environment]'
ecosystem: rust
kind: macro
order: 7
guide: /documentation/environment-variables
source:
  kind: rust-macro
  name: Environment
signature: |-
  use ossido::Environment;

  #[allow(non_snake_case)]
  #[Environment]
  pub struct Environment {
      #[public]
      API_URL: String,
      ANALYTICS_ENABLED: Option<bool>,
      DATABASE_URL: String,
  }
---

The struct becomes the single source of truth for configuration: fields are parsed and validated once at startup, and only the fields you mark `#[public]` are exposed to the frontend (with generated TypeScript types). The whole feature is optional - define no `Environment` struct and nothing is generated.

Define the schema (convention: `src/env.rs`):

```rust
// src/env.rs
use ossido::Environment;

#[allow(non_snake_case)]
#[Environment]
pub struct Environment {
    // Public - available on the client via getEnv('API_URL').
    #[public]
    API_URL: String,

    // Public, typed + optional - getEnv('ANALYTICS_ENABLED') is `boolean | null`.
    #[public]
    ANALYTICS_ENABLED: Option<bool>,

    // Server-only secret - never leaves the backend.
    DATABASE_URL: String,
}
```

Name fields in `SCREAMING_SNAKE` so the key is identical everywhere - the OS variable, `get_env!`, and `getEnv`. A non-`Option` field is required (a missing or unparseable value panics at startup); an `Option<T>` field is optional. Read fields in Rust with `get_env!`, and public fields on the frontend with `getEnv`.
