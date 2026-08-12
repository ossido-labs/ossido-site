---
name: '#[static_paths]'
ecosystem: rust
kind: macro
order: 4
guide: /documentation/rendering
source:
  kind: rust-macro
  name: static_paths
signature: |-
  #[static_paths]
  async fn paths(paths: &mut StaticPaths)
---

A dynamic [slug] route - one page per registered param:

```rust
// src/routes/blog/[slug]/page.rs
#[static_paths]
async fn paths(paths: &mut StaticPaths) {
    for slug in ["hello", "world"] {
        paths.register(StaticParams::new().param("slug", slug));
    }
}
```

A catch-all [...path] route - each catchall is an ordered list of segments:

```rust
// src/routes/docs/[...path]/page.rs
#[static_paths]
async fn paths(paths: &mut StaticPaths) {
    // → /docs/intro
    paths.register(StaticParams::new().catchall("path", vec!["intro".into()]));
    // → /docs/guides/first-app
    paths.register(
        StaticParams::new().catchall("path", vec!["guides".into(), "first-app".into()]),
    );
}
```
