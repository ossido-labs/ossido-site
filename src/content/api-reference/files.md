---
name: Files
ecosystem: rust
kind: struct
order: 11
guide: /documentation/server-actions#file-uploads-multipart
source:
  kind: rust
  symbol: Files
---

A single required file:

```rust
#[action]
async fn upload(files: Files) -> Result<(), ActionError> {
    let file = files.get("avatar").ok_or_else(|| ActionError::message("required"))?;
    save(file.filename(), file.bytes()).await;
    Ok(())
}
```

Multiple files under one field (<input type="file" multiple>):

```rust
for photo in files.get_all("photos") {
    store(photo.filename(), photo.bytes()).await;
}
```
