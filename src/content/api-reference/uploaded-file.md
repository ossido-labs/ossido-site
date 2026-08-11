---
name: UploadedFile
ecosystem: rust
kind: struct
order: 12
guide: /documentation/server-actions#file-uploads-multipart
source:
  kind: rust
  symbol: UploadedFile
---

```rust
let file = files.get("avatar").unwrap();
println!("{} — {} bytes ({:?})", file.filename(), file.len(), file.content_type());
let bytes = file.into_bytes();
```
