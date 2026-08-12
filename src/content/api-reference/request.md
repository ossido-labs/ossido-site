---
name: Request
ecosystem: rust
kind: struct
order: 8
guide: /documentation/rust-backend
source:
  kind: rust
  symbol: Request
description: "The incoming HTTP request in a handler or action: URI, headers,
  route params, and typed body parsing - body::<T>() decodes a JSON body,
  form_data::<T>() decodes a url-encoded form. Both return Result<T,
  BodyParseError>."
---

Read route params and headers:

```rust
#[handler]
async fn show(req: Request) -> PostProps {
    let id = req.params.get("id").unwrap();
    let lang = req.headers.get("accept-language");
    PostProps { post: load(id).await }
}
```

Parse a JSON body with body::<T>():

```rust
#[api(POST)]
async fn create(req: Request) -> Json<Created> {
    let input: NewPost = req.body().unwrap(); // deserialized from JSON
    Json(Created { id: save(input).await })
}
```

Parse a url-encoded form (application/x-www-form-urlencoded) with form_data::<T>():

```rust
#[api(POST)]
async fn login(req: Request) -> Response {
    let form: LoginForm = req.form_data().unwrap();
    authenticate(&form).await
}
```
