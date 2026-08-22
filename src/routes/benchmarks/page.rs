//! Build-time data handler for `/benchmarks`.
//!
//! The site builds in `static` mode, so this handler runs **once at build time**
//! (Ossido's SSG): it resolves which Ossido release to show - the pinned
//! `OSSIDO_VERSION` from `.env`, else the latest - fetches that release's
//! `results.json` (+ optional `memory.json`) from the ossido-benchmarks repo, and
//! returns them as typed props. The `#[Props]`/`#[Type]` structs both deserialize
//! the fetched JSON and generate the TypeScript the React page consumes, so the
//! Rust handler is the single source of truth. This replaces the old
//! `scripts/build-benchmarks.ts` + committed snapshot.
#![allow(non_snake_case)]

use std::cmp::Ordering;
use std::error::Error;

use ossido::{Props, Request, Type, get_env, handler};

const REPO: &str = "ossido-labs/ossido-benchmarks";
const REPO_URL: &str = "https://github.com/ossido-labs/ossido-benchmarks";

/* ── Result shapes (mirror ossido-benchmark/results@1 & memory@1) ──────────────
Field names are the JSON keys verbatim (camelCase) so serde deserializes the
fetched payload directly and the generated TypeScript matches the wire format. */

#[Type]
pub struct BenchEnvironment {
    pub host: String,
    pub cpu: String,
    pub cores: u32,
    pub totalMemGb: f64,
}

#[Type]
pub struct BenchVersions {
    pub ossido: String,
    pub next: String,
}

#[Type]
pub struct BenchLoad {
    pub connections: u32,
    pub durationSec: u32,
    pub warmupSec: u32,
    /// Present only on the memory sweep (its fixed `/ssr` route).
    pub route: Option<String>,
}

#[Type]
pub struct BenchScenario {
    pub key: String,
    pub title: String,
    pub path: String,
    pub note: String,
}

#[Type]
pub struct BenchResult {
    pub framework: String,
    pub mode: String,
    pub threads: u32,
    pub scenario: String,
    pub connections: u32,
    pub rps: f64,
    pub latencyMeanMs: f64,
    pub latencyP50Ms: f64,
    pub latencyP99Ms: f64,
    pub throughputMbps: f64,
    pub errors: u32,
}

#[Type]
pub struct BenchStreaming {
    pub framework: String,
    pub mode: String,
    pub threads: u32,
    pub ttfbMs: f64,
    pub totalMs: f64,
    pub bytes: u64,
}

#[Type]
pub struct BenchResultsFile {
    pub schema: String,
    pub generatedAt: String,
    pub environment: BenchEnvironment,
    pub versions: BenchVersions,
    pub load: BenchLoad,
    pub scenarios: Vec<BenchScenario>,
    pub results: Vec<BenchResult>,
    pub streaming: Vec<BenchStreaming>,
}

#[Type]
pub struct BenchMemoryRow {
    pub framework: String,
    pub parallelism: u32,
    pub idleRssMb: f64,
    pub meanRssMb: f64,
    pub peakRssMb: f64,
    pub rps: f64,
    pub reqPerMb: f64,
}

#[Type]
pub struct BenchMemoryFile {
    pub schema: String,
    pub generatedAt: String,
    pub environment: BenchEnvironment,
    pub versions: BenchVersions,
    pub load: BenchLoad,
    pub levels: Vec<u32>,
    pub results: Vec<BenchMemoryRow>,
}

#[Props]
pub struct BenchmarksProps {
    /// The Ossido release these results belong to (`results/<version>/`).
    pub version: String,
    /// GitHub tree URL for this version's result folder.
    pub source: String,
    /// The benchmarks repo root.
    pub repo: String,
    pub results: BenchResultsFile,
    /// `None` for a release with no memory sweep.
    pub memory: Option<BenchMemoryFile>,
}

/* ── Version resolution ────────────────────────────────────────────────────── */

/// One entry from the GitHub contents API listing of `results/`.
#[derive(serde::Deserialize)]
struct GhEntry {
    name: String,
    #[serde(rename = "type")]
    kind: String,
}

/// Split a release folder name into numeric `major.minor.patch` + prerelease tail.
fn parse_version(v: &str) -> (Vec<u64>, &str) {
    let (core, pre) = v.split_once('-').unwrap_or((v, ""));
    let nums = core
        .split('.')
        .map(|n| n.parse::<u64>().unwrap_or(0))
        .collect();
    (nums, pre)
}

/// Order two release folders: numeric core first, then a full release outranks a
/// prerelease, then prereleases compare lexically (the `.<timestamp>Z` betas of a
/// base version are equal-length, so lexical order is chronological).
fn compare_versions(a: &str, b: &str) -> Ordering {
    let (na, pa) = parse_version(a);
    let (nb, pb) = parse_version(b);
    for i in 0..3 {
        let ord = na
            .get(i)
            .copied()
            .unwrap_or(0)
            .cmp(&nb.get(i).copied().unwrap_or(0));
        if ord != Ordering::Equal {
            return ord;
        }
    }
    match (pa.is_empty(), pb.is_empty()) {
        (true, true) => Ordering::Equal,
        (true, false) => Ordering::Greater, // a is a full release -> newer
        (false, true) => Ordering::Less,
        (false, false) => pa.cmp(pb),
    }
}

fn client() -> Result<reqwest::Client, reqwest::Error> {
    reqwest::Client::builder()
        .user_agent("ossido-site-build")
        .build()
}

/// Fetch JSON, treating 404 as `None` (e.g. a release with no memory sweep).
async fn fetch_opt<T: serde::de::DeserializeOwned>(
    client: &reqwest::Client,
    url: &str,
) -> Result<Option<T>, Box<dyn Error>> {
    let res = client.get(url).send().await?;
    if res.status() == reqwest::StatusCode::NOT_FOUND {
        return Ok(None);
    }
    Ok(Some(res.error_for_status()?.json::<T>().await?))
}

async fn load() -> Result<BenchmarksProps, Box<dyn Error>> {
    let client = client()?;

    // List published result folders, then pin OSSIDO_VERSION (if it exists) or
    // fall back to the latest release.
    let listing = format!("https://api.github.com/repos/{REPO}/contents/results?ref=main");
    let mut req = client
        .get(&listing)
        .header("Accept", "application/vnd.github+json");
    // Authenticate the API call when a token is available (raises the rate limit
    // on shared CI IPs); the raw.githubusercontent fetches below need no auth.
    if let Ok(token) = std::env::var("GITHUB_TOKEN") {
        req = req.header("Authorization", format!("Bearer {token}"));
    }
    let entries: Vec<GhEntry> = req.send().await?.error_for_status()?.json().await?;
    let versions: Vec<String> = entries
        .into_iter()
        .filter(|e| e.kind == "dir")
        .map(|e| e.name)
        .collect();

    let pinned = get_env!(OSSIDO_VERSION);
    let version = match pinned {
        Some(v) if versions.iter().any(|x| x == &v) => v,
        _ => versions
            .iter()
            .max_by(|a, b| compare_versions(a, b))
            .ok_or("no benchmark result folders found")?
            .clone(),
    };

    let base = format!("https://raw.githubusercontent.com/{REPO}/main/results/{version}");
    let results: BenchResultsFile = fetch_opt(&client, &format!("{base}/results.json"))
        .await?
        .ok_or("results.json missing for the resolved version")?;
    let memory: Option<BenchMemoryFile> =
        fetch_opt(&client, &format!("{base}/memory.json")).await?;

    Ok(BenchmarksProps {
        source: format!("{REPO_URL}/tree/main/results/{version}"),
        repo: REPO_URL.to_string(),
        version,
        results,
        memory,
    })
}

#[handler]
async fn benchmarks(_req: Request) -> BenchmarksProps {
    load()
        .await
        .expect("failed to load benchmark results from ossido-benchmarks")
}
