---
name: '#[Props]'
ecosystem: rust
kind: macro
order: 6
guide: /documentation/rust-backend
source:
  kind: rust-macro
  name: Props
signature: |-
  #[Props]
  pub struct PageProps { /* becomes the page component props */ }
---

```rust
#[Props]
pub struct HomeProps { pub message: String }

#[handler]
async fn home(_req: Request) -> HomeProps {
    HomeProps { message: "Hi".into() }
}
```
