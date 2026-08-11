---
name: StaticParams
ecosystem: rust
kind: struct
order: 15
guide: /documentation/rendering
source:
  kind: rust
  symbol: StaticParams
---

```rust
StaticParams::new()
    .param("lang", "en")
    .catchall("path", vec!["docs".into(), "intro".into()])
```
