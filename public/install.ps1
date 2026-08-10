#!/usr/bin/env pwsh
#
# Ossido CLI installer for Windows.
#
# Usage:
#   irm https://ossido.dev/install.ps1 | iex
#
# This script verifies the required toolchains are present, then installs the
# `ossido_cli` crate from crates.io via cargo.

$ErrorActionPreference = "Stop"

# --- pretty output -----------------------------------------------------------

function Write-Info    { param([string]$Message) Write-Host $Message -ForegroundColor DarkGray }
function Write-Success { param([string]$Message) Write-Host $Message -ForegroundColor Green }
function Write-Failure {
    param([string]$Message)
    Write-Host "error: $Message" -ForegroundColor Red
    exit 1
}

function Test-Command {
    param([string]$Name)
    $null = Get-Command $Name -ErrorAction SilentlyContinue
    return $?
}

# --- pre-flight checks -------------------------------------------------------

Write-Info "Checking for a JavaScript runtime (node or bun)..."
if (Test-Command "bun") {
    Write-Success "  found bun $(bun --version)"
}
elseif (Test-Command "node") {
    Write-Success "  found node $(node --version)"
}
else {
    Write-Failure "no JavaScript runtime found. Install bun (https://bun.sh) or node (https://nodejs.org) first."
}

Write-Info "Checking for the Rust toolchain (cargo)..."
if (Test-Command "cargo") {
    Write-Success "  found $(cargo --version)"
}
else {
    Write-Failure "cargo not found. Install the Rust toolchain from https://rustup.rs first."
}

# --- install -----------------------------------------------------------------

Write-Host ""
Write-Host "Installing Ossido CLI..." -ForegroundColor White

cargo install ossido_cli
if ($LASTEXITCODE -ne 0) {
    Write-Failure "cargo install ossido_cli failed."
}

# --- done --------------------------------------------------------------------

Write-Host ""
Write-Success "Ossido CLI was installed successfully!"

if (-not (Test-Command "ossido")) {
    $cargoBin = if ($env:CARGO_HOME) { Join-Path $env:CARGO_HOME "bin" } else { Join-Path $env:USERPROFILE ".cargo\bin" }
    Write-Info "Add '$cargoBin' to your PATH to use the 'ossido' command."
}

Write-Host ""
Write-Info "Create a new project with:"
Write-Host "  ossido new my-app" -ForegroundColor Green
Write-Info "Or start from a template:"
Write-Host "  ossido new my-app --template with-tailwind" -ForegroundColor Green
Write-Host ""
Write-Info "Then 'cd my-app' and run 'ossido dev'. See 'ossido --help' for more."