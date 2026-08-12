---
name: Logger
ecosystem: rust
kind: struct
order: 16
guide: /documentation/ossido-application
source:
  kind: rust
  symbol: Logger
---

```rust
#[handler]
async fn home(_req: Request, logger: Logger) -> HomeProps {
    logger.info("loading home");
    HomeProps::default()
}
```
