---
name: 'get_env!'
ecosystem: rust
kind: macro
order: 8
guide: /documentation/environment-variables
source:
  kind: rust-macro
  name: get_env
signature: |-
  use ossido::get_env;

  let db = get_env!(DATABASE_URL);                    // String
  let raw = get_env!(ANALYTICS_ENABLED);              // Option<bool>
  let analytics = get_env!(ANALYTICS_ENABLED, false); // bool
description: Reads a field from the typed Environment singleton, returning a parsed copy of its value. A second argument provides a fallback that collapses an Option<T> field to a concrete T. If the project defines no Environment struct the accessor is never generated, so the macro fails to compile at the call site.
---

Read any field - public or private - from your `Environment` struct. The value comes back parsed to the field's Rust type:

```rust
use ossido::get_env;

let db = get_env!(DATABASE_URL); // String
let flag = get_env!(ANALYTICS_ENABLED); // Option<bool>
```

Pass a second argument to collapse an `Option<T>` field to a concrete `T`, using the fallback when the variable is unset (a fallback on a required field is a type error):

```rust
// ANALYTICS_ENABLED: Option<bool>
let analytics = get_env!(ANALYTICS_ENABLED, false); // bool
```
