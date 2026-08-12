---
name: SegmentValue
ecosystem: rust
kind: enum
order: 18
guide: /documentation/rendering
source:
  kind: rust
  symbol: SegmentValue
---

```rust
match value {
    SegmentValue::One(seg) => { /* a [param] slot - one segment */ }
    SegmentValue::Many(parts) => { /* a [...catchall] slot - many segments */ }
}
```
