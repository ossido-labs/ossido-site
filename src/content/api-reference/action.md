---
name: "#[action]"
ecosystem: rust
kind: macro
order: 3
guide: /documentation/server-actions
source:
  kind: rust-macro
  name: action
signature: >-
  #[action]                 // generated TS name = camelCased fn name

  #[action(customName)]     // …or override it with a bare identifier

  #[action("customName")]   // …or a string literal

  async fn act(input: In /* , state, Logger, Files, PrevState<T> */) ->
  Result<Out, ActionError>
---

The macro reads the function signature as the single source of truth: the first non-state/logger/PrevState argument is the input, a PrevState<T> argument opts into useActionState, a Files argument receives multipart uploads, and any other argument is injected application state (matched by name, like #[handler]). By default the generated TypeScript function is the camelCased Rust name; pass a token stream to the macro to override it.

Define an action in Rust — its return becomes a typed client function:

```rust
// src/routes/newsletter/actions.rs
#[action]
async fn subscribe(input: Subscribe) -> Result<Subscribed, ActionError> {
    if !input.email.contains('@') {
        return Err(ActionError::message("Please enter a valid email"));
    }
    Ok(Subscribed { id: 1 })
}
```

Call it from React, fully typed — input and output inferred from Rust:

```tsx
import { subscribe } from '.ossido/actions'

const { id } = await subscribe({ email: 'ada@example.com' })
```

Extra arguments are injected by name — application state, a Logger, and Files:

```rust
#[action]
async fn upload_avatar(input: AvatarMeta, files: Files, db: Db, logger: Logger)
    -> Result<Avatar, ActionError>
{
    logger.info("uploading avatar");
    let file = files.get("avatar").ok_or_else(|| ActionError::message("file required"))?;
    let id = db.store(input.user_id, file.bytes()).await?;
    Ok(Avatar { id })
}
```

Override the generated TypeScript name with a token stream:

```rust
#[action(registerUser)]        // or #[action("registerUser")]
async fn create_user(input: NewUser) -> Result<Created, ActionError> {
    Ok(persist(input).await?)
}
```

```tsx
import { registerUser } from '.ossido/actions'

await registerUser({ email, name })
```

A PrevState<T> first argument opts into React’s useActionState:

```rust
#[action]
async fn submit_signup(prev: PrevState<FormState>, input: Subscribe) -> FormState {
    let attempts = prev.get().map(|s| s.attempts + 1).unwrap_or(1);
    FormState { ok: input.email.contains('@'), attempts }
}
```

```tsx
import { useActionState } from '@ossido-labs/ossido/actions'
import { submitSignup } from '.ossido/actions'

const [state, formAction, isPending] = useActionState(submitSignup, INITIAL)
```
