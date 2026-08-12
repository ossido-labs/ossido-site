---
name: Form
ecosystem: react
kind: component
order: 20
guide: /documentation/server-actions
source:
  kind: ts
  module: '@ossido-labs/ossido/actions'
  export: Form
signature: |-
  function Form<Input, Output>(props: {
    action: ActionFn<Input, Output> | StatefulActionFn<Input, Output>
    onSubmit?: (result: Output) => void
  } & FormHTMLAttributes): ReactNode
---

Renders a real <form method="post" action={fn.url}>. When hydrated it intercepts the submit and calls the action with the form's FormData; with JS disabled the browser does a native POST and the server replies with a 303 redirect. Prefer <Form> over React's own <form action={fn}> when you want that no-JS fallback. Set encType="multipart/form-data" for file uploads.

Progressive-enhancement form - works with or without JavaScript:

```tsx
import { Form } from '@ossido-labs/ossido/actions';
import { subscribe } from '.ossido/actions';

<Form action={subscribe} encType="multipart/form-data">
  <input name="email" type="email" />
  <input name="avatar" type="file" />
  <button>Subscribe</button>
</Form>;
```
