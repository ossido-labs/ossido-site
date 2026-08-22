use ossido::Environment;

/// The site's environment schema. Discovered automatically by the Ossido CLI
/// (it scans `src/**/*.rs` for the `#[Environment]` struct) and read in Rust
/// with `get_env!`.
#[allow(non_snake_case)]
#[Environment]
pub struct Environment {
    /// The Ossido release to pin benchmark results to (`/benchmarks` handler).
    /// Optional: when unset, the handler uses the latest published results.
    OSSIDO_VERSION: Option<String>,
}
