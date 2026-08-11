---
name: StaticPaths
ecosystem: rust
kind: struct
order: 14
guide: /documentation/rendering
source:
  kind: rust
  symbol: StaticPaths
---

Collects the set of pages to generate for a dynamic route. Register one StaticParams per page; each carries a value for every dynamic slot in the route path.

One dynamic segment — register one page per value:

```rust
// src/routes/blog/[slug]/page.rs
#[static_paths]
async fn paths(paths: &mut StaticPaths) {
    paths.register(StaticParams::new().param("slug", "hello"));
}
```

Multiple params — one StaticParams per page carries every segment’s value:

```rust
// src/routes/[lang]/blog/[slug]/page.rs
#[static_paths]
async fn paths(paths: &mut StaticPaths) {
    for lang in ["en", "fr"] {
        for slug in ["hello", "world"] {
            paths.register(
                StaticParams::new().param("lang", lang).param("slug", slug),
            );
        }
    }
}
```
