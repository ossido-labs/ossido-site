---
name: "#[Type]"
ecosystem: rust
kind: macro
order: 5
guide: /documentation/typescript
source:
  kind: rust-macro
  name: Type
signature: |-
  #[Type]
  pub struct Name { /* fields → generated TypeScript */ }
---

```rust
#[Type]
pub struct User { pub id: u64, pub name: String }
```

The generated TypeScript is importable:

```ts
import type { User } from '@ossido-labs/ossido/types'
```
