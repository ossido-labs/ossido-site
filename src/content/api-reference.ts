/**
 * API Reference whitelist — the single source of truth for *which* symbols appear,
 * their kind (for the left-nav grouping), guide link, and hand-authored examples.
 * Signatures and one-line descriptions are NOT written here: they're extracted from
 * the framework source by `scripts/build-api-reference.ts`, which reads this list and
 * emits the committed `./api-reference.generated.ts` plus a page per symbol.
 *
 * To add/remove or re-example an API: edit this list, then run `bun run build-api-reference`.
 */

export type Ecosystem = 'rust' | 'react';

/** Symbol kind — drives the left-nav grouping ("Macros", "Hooks", …). */
export type SymbolKind =
  | 'macro'
  | 'function'
  | 'hook'
  | 'component'
  | 'class'
  | 'constant'
  | 'struct'
  | 'enum'
  | 'type';

/** Where the generator finds an entry's signature + doc comment. */
export type ApiSource =
  | { kind: 'rust'; symbol: string }
  | { kind: 'rust-macro'; name: string }
  | { kind: 'ts'; module: string; export: string };

/** A worked example on a symbol's page. */
export interface ExampleSnippet {
  code: string;
  lang?: 'rust' | 'tsx' | 'ts' | 'sh';
  /** Optional one-line caption above the snippet. */
  caption?: string;
}

export interface ApiEntry {
  /** Stable id → route slug (`/api-reference/<key>`) and anchor. */
  key: string;
  /** Display name (e.g. '#[action]', 'useRouter'). */
  name: string;
  ecosystem: Ecosystem;
  kind: SymbolKind;
  /** Deep link into the guide that explains this API in narrative form. */
  guideHref?: string;
  source: ApiSource;
  /** Usage-form signature override — required for macros; else the generator extracts it. */
  signature?: string;
  /** Fallback description — used only when the source carries no doc comment. */
  description?: string;
  /** Optional extra prose (plain text) shown under the description. */
  details?: string;
  /** Worked examples, reference-focused (not a repeat of the guide). */
  examples?: Array<ExampleSnippet>;
}

/** A resolved entry (whitelist metadata + extracted signature/description), the
 *  shape `./api-reference.generated.ts` exports and the pages render. */
export interface ResolvedApiEntry {
  key: string;
  name: string;
  ecosystem: Ecosystem;
  kind: SymbolKind;
  guideHref?: string;
  language: 'rust' | 'tsx';
  signature: string;
  description: string;
  details?: string;
  examples: Array<ExampleSnippet>;
}

/** Left-nav group label per kind, and the order groups appear in. */
export const KIND_LABEL: Record<SymbolKind, string> = {
  macro: 'Macros',
  function: 'Functions',
  hook: 'Hooks',
  component: 'Components',
  class: 'Classes',
  constant: 'Constants',
  struct: 'Structs',
  enum: 'Enums',
  type: 'Types',
};
export const KIND_ORDER: ReadonlyArray<SymbolKind> = [
  'macro',
  'component',
  'hook',
  'function',
  'class',
  'constant',
  'struct',
  'enum',
  'type',
];

export const ECOSYSTEM_LABEL: Record<Ecosystem, string> = { rust: 'Rust', react: 'React' };

/** Slugify a label for anchor ids — same rules as `docGroupId` in `./docs.ts`. */
export function apiRefId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface KindGroup {
  kind: SymbolKind;
  label: string;
  entries: Array<ResolvedApiEntry>;
}

/** Group an ecosystem's entries by kind, in `KIND_ORDER`. */
export function groupByKind(
  entries: ReadonlyArray<ResolvedApiEntry>,
  ecosystem: Ecosystem,
): Array<KindGroup> {
  const groups: Array<KindGroup> = [];
  for (const kind of KIND_ORDER) {
    const inKind = entries.filter((e) => e.ecosystem === ecosystem && e.kind === kind);
    if (inKind.length) groups.push({ kind, label: KIND_LABEL[kind], entries: inKind });
  }
  return groups;
}

const DOC = '/documentation';

export const API_REFERENCE: Array<ApiEntry> = [
  /* ── Rust: Macros ──────────────────────────────────────────────────────── */
  {
    key: 'handler',
    name: '#[handler]',
    ecosystem: 'rust',
    kind: 'macro',
    guideHref: `${DOC}/rust-backend`,
    source: { kind: 'rust-macro', name: 'handler' },
    signature: '#[handler]\nasync fn page(req: Request /* , state, Logger */) -> impl Into<Response>',
    description:
      "Turns an async function into a page/route data handler. The first argument is the Request; remaining arguments are injected application state or a Logger. Its return becomes the page's props.",
    examples: [
      {
        caption: 'Return a #[Props] struct — it becomes the page component’s props:',
        lang: 'rust',
        code: `// src/routes/page.rs
#[handler]
async fn home(_req: Request) -> HomeProps {
    HomeProps { message: "Hello from Rust".into() }
}`,
      },
      {
        caption: 'Read a dynamic segment, and inject application state by name:',
        lang: 'rust',
        code: `// src/routes/posts/[id]/page.rs
#[handler]
async fn post(req: Request, db: Db) -> PostProps {
    let id = req.params.get("id").unwrap();
    PostProps { post: db.load_post(id).await }
}`,
      },
      {
        caption: 'Return a Response directly to redirect or set a status; log with a Logger:',
        lang: 'rust',
        code: `#[handler]
async fn dashboard(req: Request, logger: Logger) -> Response {
    logger.info("rendering dashboard");
    if req.headers.get("cookie").is_none() {
        return Response::Redirect("/login".into());
    }
    DashboardProps::load().await.into()
}`,
      },
    ],
  },
  {
    key: 'api',
    name: '#[api]',
    ecosystem: 'rust',
    kind: 'macro',
    guideHref: `${DOC}/api-handlers`,
    source: { kind: 'rust-macro', name: 'api' },
    signature: '#[api(GET)] // GET | POST | PUT | PATCH | DELETE\nasync fn route(req: Request) -> impl IntoResponse',
    description:
      'Defines an HTTP API endpoint under src/routes/api, with the method as the macro argument (GET/POST/PUT/PATCH/DELETE). Returns JSON or any axum response.',
    examples: [
      {
        caption: 'A GET endpoint returning JSON:',
        lang: 'rust',
        code: `// src/routes/api/health.rs
#[api(GET)]
async fn health(_req: Request) -> Json<Status> {
    Json(Status { ok: true })
}`,
      },
      {
        caption: 'A POST endpoint reading a typed JSON body, with state injected by name:',
        lang: 'rust',
        code: `// src/routes/api/subscribe.rs
#[api(POST)]
async fn subscribe(req: Request, db: Db) -> Json<Subscribed> {
    let input: Subscribe = req.body().unwrap();
    Json(Subscribed { id: db.insert(input).await })
}`,
      },
      {
        caption: 'Call it from the frontend with the typed client (see createApiClient):',
        lang: 'tsx',
        code: `import { apiClient } from '@ossido-labs/ossido/client'

const res = await apiClient.get('/api/health')
const status = await res.json() // typed from your Rust route`,
      },
    ],
  },
  {
    key: 'middleware',
    name: '#[middleware]',
    ecosystem: 'rust',
    kind: 'macro',
    guideHref: `${DOC}/middleware`,
    source: { kind: 'rust-macro', name: 'middleware' },
    signature: '#[middleware]\npub fn my_layer() -> impl Layer<S> + Clone',
    description:
      'Marks a function in a middleware.rs that returns a Tower Layer applied to its route segment. A function returns a single Layer; compose several with a ServiceBuilder.',
    examples: [
      {
        caption: 'A single layer applied to this segment:',
        lang: 'rust',
        code: `// src/routes/api/middleware.rs
use ossido::middleware;
use tower_http::cors::{Any, CorsLayer};

#[middleware]
pub fn api_cors() -> CorsLayer {
    CorsLayer::new().allow_origin(Any)
}`,
      },
      {
        caption: 'Combine several layers — stack them with a ServiceBuilder and return the stack:',
        lang: 'rust',
        code: `use ossido::middleware;
use ossido::tower::{Layer, ServiceBuilder};
use tower_http::compression::CompressionLayer;
use tower_http::trace::TraceLayer;

#[middleware]
pub fn stack<S>() -> impl Layer<S> + Clone {
    ServiceBuilder::new()
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
}`,
      },
    ],
  },
  {
    key: 'action',
    name: '#[action]',
    ecosystem: 'rust',
    kind: 'macro',
    guideHref: `${DOC}/server-actions`,
    source: { kind: 'rust-macro', name: 'action' },
    signature:
      '#[action]                 // generated TS name = camelCased fn name\n#[action(customName)]     // …or override it with a bare identifier\n#[action("customName")]   // …or a string literal\nasync fn act(input: In /* , state, Logger, Files, PrevState<T> */) -> Result<Out, ActionError>',
    details:
      'The macro reads the function signature as the single source of truth: the first non-state/logger/PrevState argument is the input, a PrevState<T> argument opts into useActionState, a Files argument receives multipart uploads, and any other argument is injected application state (matched by name, like #[handler]). By default the generated TypeScript function is the camelCased Rust name; pass a token stream to the macro to override it.',
    examples: [
      {
        caption: 'Define an action in Rust — its return becomes a typed client function:',
        lang: 'rust',
        code: `// src/routes/newsletter/actions.rs
#[action]
async fn subscribe(input: Subscribe) -> Result<Subscribed, ActionError> {
    if !input.email.contains('@') {
        return Err(ActionError::message("Please enter a valid email"));
    }
    Ok(Subscribed { id: 1 })
}`,
      },
      {
        caption: 'Call it from React, fully typed — input and output inferred from Rust:',
        lang: 'tsx',
        code: `import { subscribe } from '.ossido/actions'

const { id } = await subscribe({ email: 'ada@example.com' })`,
      },
      {
        caption: 'Extra arguments are injected by name — application state, a Logger, and Files:',
        lang: 'rust',
        code: `#[action]
async fn upload_avatar(input: AvatarMeta, files: Files, db: Db, logger: Logger)
    -> Result<Avatar, ActionError>
{
    logger.info("uploading avatar");
    let file = files.get("avatar").ok_or_else(|| ActionError::message("file required"))?;
    let id = db.store(input.user_id, file.bytes()).await?;
    Ok(Avatar { id })
}`,
      },
      {
        caption: 'Override the generated TypeScript name with a token stream:',
        lang: 'rust',
        code: `#[action(registerUser)]        // or #[action("registerUser")]
async fn create_user(input: NewUser) -> Result<Created, ActionError> {
    Ok(persist(input).await?)
}`,
      },
      {
        lang: 'tsx',
        code: `import { registerUser } from '.ossido/actions'

await registerUser({ email, name })`,
      },
      {
        caption: 'A PrevState<T> first argument opts into React’s useActionState:',
        lang: 'rust',
        code: `#[action]
async fn submit_signup(prev: PrevState<FormState>, input: Subscribe) -> FormState {
    let attempts = prev.get().map(|s| s.attempts + 1).unwrap_or(1);
    FormState { ok: input.email.contains('@'), attempts }
}`,
      },
      {
        lang: 'tsx',
        code: `import { useActionState } from '@ossido-labs/ossido/actions'
import { submitSignup } from '.ossido/actions'

const [state, formAction, isPending] = useActionState(submitSignup, INITIAL)`,
      },
    ],
  },
  {
    key: 'static-paths',
    name: '#[static_paths]',
    ecosystem: 'rust',
    kind: 'macro',
    guideHref: `${DOC}/rendering`,
    source: { kind: 'rust-macro', name: 'static_paths' },
    signature: '#[static_paths]\nasync fn paths(paths: &mut StaticPaths)',
    examples: [
      {
        caption: 'A dynamic [slug] route — one page per registered param:',
        lang: 'rust',
        code: `// src/routes/blog/[slug]/page.rs
#[static_paths]
async fn paths(paths: &mut StaticPaths) {
    for slug in ["hello", "world"] {
        paths.register(StaticParams::new().param("slug", slug));
    }
}`,
      },
      {
        caption: 'A catch-all [...path] route — each catchall is an ordered list of segments:',
        lang: 'rust',
        code: `// src/routes/docs/[...path]/page.rs
#[static_paths]
async fn paths(paths: &mut StaticPaths) {
    // → /docs/intro
    paths.register(StaticParams::new().catchall("path", vec!["intro".into()]));
    // → /docs/guides/first-app
    paths.register(
        StaticParams::new().catchall("path", vec!["guides".into(), "first-app".into()]),
    );
}`,
      },
    ],
  },
  {
    key: 'type-macro',
    name: '#[Type]',
    ecosystem: 'rust',
    kind: 'macro',
    guideHref: `${DOC}/typescript`,
    source: { kind: 'rust-macro', name: 'Type' },
    signature: '#[Type]\npub struct Name { /* fields → generated TypeScript */ }',
    examples: [
      {
        lang: 'rust',
        code: `#[Type]
pub struct User { pub id: u64, pub name: String }`,
      },
      {
        caption: 'The generated TypeScript is importable:',
        lang: 'ts',
        code: `import type { User } from '@ossido-labs/ossido/types'`,
      },
    ],
  },
  {
    key: 'props-macro',
    name: '#[Props]',
    ecosystem: 'rust',
    kind: 'macro',
    guideHref: `${DOC}/rust-backend`,
    source: { kind: 'rust-macro', name: 'Props' },
    signature: '#[Props]\npub struct PageProps { /* becomes the page component props */ }',
    examples: [
      {
        lang: 'rust',
        code: `#[Props]
pub struct HomeProps { pub message: String }

#[handler]
async fn home(_req: Request) -> HomeProps {
    HomeProps { message: "Hi".into() }
}`,
      },
    ],
  },

  /* ── Rust: functions ──────────────────────────────────────────────────── */
  {
    key: 'set-error-handler',
    name: 'set_error_handler',
    ecosystem: 'rust',
    kind: 'function',
    guideHref: `${DOC}/error-handling`,
    source: { kind: 'rust', symbol: 'set_error_handler' },
    details:
      'Register once, early (typically from src/app.rs main()), before the server starts — the first registration wins. The closure runs for every error thrown by a handler or action.',
    examples: [
      {
        caption: 'Report every error, then fall back to the default error page:',
        lang: 'rust',
        code: `// src/app.rs
set_error_handler(|ctx: ErrorContext| async move {
    report(&ctx.error).await;
    None // None → Ossido renders its default error page / JSON
});`,
      },
      {
        caption: 'Return Some(response) to override the default 500 with your own:',
        lang: 'rust',
        code: `use ossido::axum::{http::StatusCode, response::IntoResponse, Json};

set_error_handler(|ctx: ErrorContext| async move {
    report(&ctx.error).await;
    Some((StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorBody { id: ctx.error_id })).into_response())
});`,
      },
    ],
  },

  /* ── Rust: structs ─────────────────────────────────────────────────────── */
  {
    key: 'request',
    name: 'Request',
    ecosystem: 'rust',
    kind: 'struct',
    guideHref: `${DOC}/rust-backend`,
    source: { kind: 'rust', symbol: 'Request' },
    description:
      'The incoming HTTP request in a handler or action: URI, headers, route params, and typed body parsing — body::<T>() decodes a JSON body, form_data::<T>() decodes a url-encoded form. Both return Result<T, BodyParseError>.',
    examples: [
      {
        caption: 'Read route params and headers:',
        lang: 'rust',
        code: `#[handler]
async fn show(req: Request) -> PostProps {
    let id = req.params.get("id").unwrap();
    let lang = req.headers.get("accept-language");
    PostProps { post: load(id).await }
}`,
      },
      {
        caption: 'Parse a JSON body with body::<T>():',
        lang: 'rust',
        code: `#[api(POST)]
async fn create(req: Request) -> Json<Created> {
    let input: NewPost = req.body().unwrap(); // deserialized from JSON
    Json(Created { id: save(input).await })
}`,
      },
      {
        caption: 'Parse a url-encoded form (application/x-www-form-urlencoded) with form_data::<T>():',
        lang: 'rust',
        code: `#[api(POST)]
async fn login(req: Request) -> Response {
    let form: LoginForm = req.form_data().unwrap();
    authenticate(&form).await
}`,
      },
    ],
  },
  {
    key: 'action-error',
    name: 'ActionError',
    ecosystem: 'rust',
    kind: 'struct',
    guideHref: `${DOC}/server-actions#error-handling`,
    source: { kind: 'rust', symbol: 'ActionError' },
    examples: [
      {
        lang: 'rust',
        code: `return Err(ActionError::message("Please enter a valid email"));
// or with per-field messages:
return Err(ActionError::with_fields("Validation failed", fields));`,
      },
    ],
  },
  {
    key: 'prev-state',
    name: 'PrevState',
    ecosystem: 'rust',
    kind: 'struct',
    guideHref: `${DOC}/server-actions#stateful-actions-useactionstate`,
    source: { kind: 'rust', symbol: 'PrevState' },
    examples: [
      {
        lang: 'rust',
        code: `#[action]
async fn submit(prev: PrevState<FormState>, input: Subscribe) -> FormState {
    let attempts = prev.get().map(|s| s.attempts + 1).unwrap_or(1);
    FormState { attempts, ok: input.email.contains('@') }
}`,
      },
    ],
  },
  {
    key: 'files',
    name: 'Files',
    ecosystem: 'rust',
    kind: 'struct',
    guideHref: `${DOC}/server-actions#file-uploads-multipart`,
    source: { kind: 'rust', symbol: 'Files' },
    examples: [
      {
        caption: 'A single required file:',
        lang: 'rust',
        code: `#[action]
async fn upload(files: Files) -> Result<(), ActionError> {
    let file = files.get("avatar").ok_or_else(|| ActionError::message("required"))?;
    save(file.filename(), file.bytes()).await;
    Ok(())
}`,
      },
      {
        caption: 'Multiple files under one field (<input type="file" multiple>):',
        lang: 'rust',
        code: `for photo in files.get_all("photos") {
    store(photo.filename(), photo.bytes()).await;
}`,
      },
    ],
  },
  {
    key: 'uploaded-file',
    name: 'UploadedFile',
    ecosystem: 'rust',
    kind: 'struct',
    guideHref: `${DOC}/server-actions#file-uploads-multipart`,
    source: { kind: 'rust', symbol: 'UploadedFile' },
    examples: [
      {
        lang: 'rust',
        code: `let file = files.get("avatar").unwrap();
println!("{} — {} bytes ({:?})", file.filename(), file.len(), file.content_type());
let bytes = file.into_bytes();`,
      },
    ],
  },
  {
    key: 'error-context',
    name: 'ErrorContext',
    ecosystem: 'rust',
    kind: 'struct',
    guideHref: `${DOC}/error-handling`,
    source: { kind: 'rust', symbol: 'ErrorContext' },
    examples: [
      {
        lang: 'rust',
        code: `set_error_handler(|ctx: ErrorContext| async move {
    eprintln!("{} on {}", ctx.error, ctx.request.uri);
    None
});`,
      },
    ],
  },
  {
    key: 'static-paths-type',
    name: 'StaticPaths',
    ecosystem: 'rust',
    kind: 'struct',
    guideHref: `${DOC}/rendering`,
    source: { kind: 'rust', symbol: 'StaticPaths' },
    details:
      'Collects the set of pages to generate for a dynamic route. Register one StaticParams per page; each carries a value for every dynamic slot in the route path.',
    examples: [
      {
        caption: 'One dynamic segment — register one page per value:',
        lang: 'rust',
        code: `// src/routes/blog/[slug]/page.rs
#[static_paths]
async fn paths(paths: &mut StaticPaths) {
    paths.register(StaticParams::new().param("slug", "hello"));
}`,
      },
      {
        caption: 'Multiple params — one StaticParams per page carries every segment’s value:',
        lang: 'rust',
        code: `// src/routes/[lang]/blog/[slug]/page.rs
#[static_paths]
async fn paths(paths: &mut StaticPaths) {
    for lang in ["en", "fr"] {
        for slug in ["hello", "world"] {
            paths.register(
                StaticParams::new().param("lang", lang).param("slug", slug),
            );
        }
    }
}`,
      },
    ],
  },
  {
    key: 'static-params',
    name: 'StaticParams',
    ecosystem: 'rust',
    kind: 'struct',
    guideHref: `${DOC}/rendering`,
    source: { kind: 'rust', symbol: 'StaticParams' },
    examples: [
      {
        lang: 'rust',
        code: `StaticParams::new()
    .param("lang", "en")
    .catchall("path", vec!["docs".into(), "intro".into()])`,
      },
    ],
  },
  {
    key: 'logger',
    name: 'Logger',
    ecosystem: 'rust',
    kind: 'struct',
    guideHref: `${DOC}/rust-backend`,
    source: { kind: 'rust', symbol: 'Logger' },
    examples: [
      {
        lang: 'rust',
        code: `#[handler]
async fn home(_req: Request, logger: Logger) -> HomeProps {
    logger.info("loading home");
    HomeProps::default()
}`,
      },
    ],
  },

  /* ── Rust: enums ───────────────────────────────────────────────────────── */
  {
    key: 'response',
    name: 'Response',
    ecosystem: 'rust',
    kind: 'enum',
    guideHref: `${DOC}/rust-backend`,
    source: { kind: 'rust', symbol: 'Response' },
    description:
      "A handler's return value: page Props, a redirect, or a custom axum response. Most handlers return a #[Props] struct and never build this directly.",
    examples: [
      {
        lang: 'rust',
        code: `#[handler]
async fn go(_req: Request) -> Response {
    Response::Redirect("/login".into())
}`,
      },
    ],
  },
  {
    key: 'segment-value',
    name: 'SegmentValue',
    ecosystem: 'rust',
    kind: 'enum',
    guideHref: `${DOC}/rendering`,
    source: { kind: 'rust', symbol: 'SegmentValue' },
    examples: [
      {
        lang: 'rust',
        code: `match value {
    SegmentValue::One(seg) => { /* a [param] slot — one segment */ }
    SegmentValue::Many(parts) => { /* a [...catchall] slot — many segments */ }
}`,
      },
    ],
  },

  /* ── React: components ─────────────────────────────────────────────────── */
  {
    key: 'link',
    name: 'Link',
    ecosystem: 'react',
    kind: 'component',
    guideHref: `${DOC}/react-frontend#client-navigation`,
    source: { kind: 'ts', module: '@ossido-labs/ossido', export: 'Link' },
    description:
      'Client-side navigation link — preload-aware (loads the route on hover/viewport), with optional scroll, replace, and View Transition control. Keeps navigation within the SPA.',
    examples: [
      {
        lang: 'tsx',
        code: `import { Link } from '@ossido-labs/ossido'

<Link href="/guides" preload>Guides</Link>`,
      },
    ],
  },
  {
    key: 'form',
    name: 'Form',
    ecosystem: 'react',
    kind: 'component',
    guideHref: `${DOC}/server-actions`,
    source: { kind: 'ts', module: '@ossido-labs/ossido/actions', export: 'Form' },
    signature: 'function Form<Input, Output>(props: {\n  action: ActionFn<Input, Output> | StatefulActionFn<Input, Output>\n  onSubmit?: (result: Output) => void\n} & FormHTMLAttributes): ReactNode',
    details:
      'Renders a real <form method="post" action={fn.url}>. When hydrated it intercepts the submit and calls the action with the form’s FormData; with JS disabled the browser does a native POST and the server replies with a 303 redirect. Prefer <Form> over React’s own <form action={fn}> when you want that no-JS fallback. Set encType="multipart/form-data" for file uploads.',
    examples: [
      {
        caption: 'Progressive-enhancement form — works with or without JavaScript:',
        lang: 'tsx',
        code: `import { Form } from '@ossido-labs/ossido/actions'
import { subscribe } from '.ossido/actions'

<Form action={subscribe} encType="multipart/form-data">
  <input name="email" type="email" />
  <input name="avatar" type="file" />
  <button>Subscribe</button>
</Form>`,
      },
    ],
  },
  {
    key: 'ossido-scripts',
    name: 'OssidoScripts',
    ecosystem: 'react',
    kind: 'component',
    guideHref: `${DOC}/react-frontend`,
    source: { kind: 'ts', module: '@ossido-labs/ossido', export: 'OssidoScripts' },
    description:
      "Injects the serialized server payload and the framework's client scripts. Render once in the root layout's <body>.",
    examples: [
      {
        lang: 'tsx',
        code: `import { OssidoScripts } from '@ossido-labs/ossido'

export default function RootLayout({ children }) {
  return <html><body>{children}<OssidoScripts /></body></html>
}`,
      },
    ],
  },

  /* ── React: hooks ──────────────────────────────────────────────────────── */
  {
    key: 'use-router',
    name: 'useRouter',
    ecosystem: 'react',
    kind: 'hook',
    guideHref: `${DOC}/react-frontend`,
    source: { kind: 'ts', module: '@ossido-labs/ossido', export: 'useRouter' },
    description: 'Access the router instance for programmatic navigation and the current location.',
    examples: [
      {
        lang: 'tsx',
        code: `import { useRouter } from '@ossido-labs/ossido'

const { pathname } = useRouter()`,
      },
    ],
  },
  {
    key: 'use-action-state',
    name: 'useActionState',
    ecosystem: 'react',
    kind: 'hook',
    guideHref: `${DOC}/server-actions#stateful-actions-useactionstate`,
    source: { kind: 'ts', module: '@ossido-labs/ossido/actions', export: 'useActionState' },
    signature: 'const [state, formAction, isPending] = useActionState(action, initialState)',
    description:
      "React's hook for stateful actions, re-exported so there's one import site. Pass a stateful Ossido action (one with a PrevState argument) and its initial state.",
    examples: [
      {
        lang: 'tsx',
        code: `import { useActionState } from '@ossido-labs/ossido/actions'
import { submitSignup } from '.ossido/actions'

const [state, formAction, isPending] = useActionState(submitSignup, INITIAL)`,
      },
    ],
  },
  {
    key: 'use-form-status',
    name: 'useFormStatus',
    ecosystem: 'react',
    kind: 'hook',
    guideHref: `${DOC}/server-actions`,
    source: { kind: 'ts', module: '@ossido-labs/ossido/actions', export: 'useFormStatus' },
    signature: 'const { pending, data, method, action } = useFormStatus()',
    description:
      "React DOM's hook for the pending state of the nearest parent <form>, re-exported for convenience inside action forms.",
    examples: [
      {
        lang: 'tsx',
        code: `import { useFormStatus } from '@ossido-labs/ossido/actions'

function Submit() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>Save</button>
}`,
      },
    ],
  },

  /* ── React: functions ──────────────────────────────────────────────────── */
  {
    key: 'dynamic',
    name: 'dynamic',
    ecosystem: 'react',
    kind: 'function',
    guideHref: `${DOC}/react-frontend`,
    source: { kind: 'ts', module: '@ossido-labs/ossido', export: 'dynamic' },
    examples: [
      {
        lang: 'tsx',
        code: `import { dynamic } from '@ossido-labs/ossido'

const Chart = dynamic(() => import('./Chart'), { ssr: false })`,
      },
    ],
  },
  {
    key: 'create-api-client',
    name: 'createApiClient',
    ecosystem: 'react',
    kind: 'function',
    guideHref: `${DOC}/api-client`,
    source: { kind: 'ts', module: '@ossido-labs/ossido/client', export: 'createApiClient' },
    examples: [
      {
        lang: 'tsx',
        code: `import { createApiClient } from '@ossido-labs/ossido/client'

const api = createApiClient({ baseUrl: 'https://example.com' })
const res = await api.get('/api/user', { params: { id: '1' } })`,
      },
    ],
  },

  /* ── React: classes ────────────────────────────────────────────────────── */
  {
    key: 'ossido-action-error',
    name: 'OssidoActionError',
    ecosystem: 'react',
    kind: 'class',
    guideHref: `${DOC}/server-actions#error-handling`,
    source: { kind: 'ts', module: '@ossido-labs/ossido/actions', export: 'OssidoActionError' },
    signature: 'class OssidoActionError extends Error {\n  message: string\n  fields?: Record<string, string>\n}',
    examples: [
      {
        lang: 'tsx',
        code: `import { OssidoActionError } from '@ossido-labs/ossido/actions'

try {
  await createUser(input)
} catch (e) {
  if (e instanceof OssidoActionError) console.log(e.message, e.fields)
}`,
      },
    ],
  },

  /* ── React: constants ──────────────────────────────────────────────────── */
  {
    key: 'api-client',
    name: 'apiClient',
    ecosystem: 'react',
    kind: 'constant',
    guideHref: `${DOC}/api-client`,
    source: { kind: 'ts', module: '@ossido-labs/ossido/client', export: 'apiClient' },
    examples: [
      {
        lang: 'tsx',
        code: `import { apiClient } from '@ossido-labs/ossido/client'

const res = await apiClient.get('/api/health')
const data = await res.json()`,
      },
    ],
  },

  /* ── React: types ──────────────────────────────────────────────────────── */
  {
    key: 'ossido-page',
    name: 'OssidoPage',
    ecosystem: 'react',
    kind: 'type',
    guideHref: `${DOC}/typescript`,
    source: { kind: 'ts', module: '@ossido-labs/ossido/types', export: 'OssidoPage' },
    signature: 'type OssidoPage<Path extends keyof RouteProps> = (props: RouteProps[Path]) => ReactNode',
    description:
      "Types a page component so its props are exactly the matching Rust handler's return type, keyed by the route path.",
    examples: [
      {
        lang: 'tsx',
        code: `import type { OssidoPage } from '@ossido-labs/ossido/types'

const Home: OssidoPage<'/'> = ({ message }) => <h1>{message}</h1>
export default Home`,
      },
    ],
  },
  {
    key: 'ossido-layout-props',
    name: 'OssidoLayoutProps',
    ecosystem: 'react',
    kind: 'type',
    guideHref: `${DOC}/react-frontend`,
    source: { kind: 'ts', module: '@ossido-labs/ossido', export: 'OssidoLayoutProps' },
    description: 'Props for a layout component — { children } for the wrapped subtree.',
    examples: [
      {
        lang: 'tsx',
        code: `import type { OssidoLayoutProps } from '@ossido-labs/ossido'

export default function Layout({ children }: OssidoLayoutProps) {
  return <section>{children}</section>
}`,
      },
    ],
  },
  {
    key: 'ossido-error-props',
    name: 'OssidoErrorProps',
    ecosystem: 'react',
    kind: 'type',
    guideHref: `${DOC}/error-handling`,
    source: { kind: 'ts', module: '@ossido-labs/ossido', export: 'OssidoErrorProps' },
    examples: [
      {
        lang: 'tsx',
        code: `import type { OssidoErrorProps } from '@ossido-labs/ossido'

export default function Error({ error, reset }: OssidoErrorProps) {
  return <button onClick={reset}>Try again</button>
}`,
      },
    ],
  },
  {
    key: 'ossido-config',
    name: 'OssidoConfig',
    ecosystem: 'react',
    kind: 'type',
    guideHref: `${DOC}/configuration`,
    source: { kind: 'ts', module: '@ossido-labs/ossido/config', export: 'OssidoConfig' },
    description:
      'The ossido.config.ts shape: server options, Vite passthrough, logging, SSR render threads, output mode, build hooks, and view transitions.',
    examples: [
      {
        lang: 'ts',
        code: `import type { OssidoConfig } from '@ossido-labs/ossido/config'

const config: OssidoConfig = {
  output: 'static',
  server: { port: 3000 },
}
export default config`,
      },
    ],
  },
];
