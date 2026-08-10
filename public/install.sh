#!/usr/bin/env bash
#
# Ossido CLI installer for macOS and Linux.
#
# Usage:
#   curl -fsSL https://ossido.dev/install.sh | bash
#
# This script verifies the required toolchains are present, then installs the
# `ossido_cli` crate from crates.io via cargo.

set -euo pipefail

# --- pretty output ------------------------------------------------------------

if [[ -t 1 ]] && [[ -z "${NO_COLOR:-}" ]]; then
    Color_Off='\033[0m'
    Red='\033[0;31m'
    Green='\033[0;32m'
    Dim='\033[0;2m'
    Bold_White='\033[1m'
    Bold_Green='\033[1;32m'
else
    Color_Off=''
    Red=''
    Green=''
    Dim=''
    Bold_White=''
    Bold_Green=''
fi

info() {
    printf '%b\n' "${Dim}$*${Color_Off}"
}

info_bold() {
    printf '%b\n' "${Bold_White}$*${Color_Off}"
}

success() {
    printf '%b\n' "${Green}$*${Color_Off}"
}

error() {
    printf '%b\n' "${Red}error${Color_Off}: $*" >&2
    exit 1
}

has() {
    command -v "$1" >/dev/null 2>&1
}

# --- pre-flight checks --------------------------------------------------------

case "$(uname -s)" in
    Linux | Darwin) ;;
    *) error "this installer supports macOS and Linux only. On Windows use install.ps1." ;;
esac

info "Checking for a JavaScript runtime (node or bun)..."
if has bun; then
    success "  found bun $(bun --version)"
elif has node; then
    success "  found node $(node --version)"
else
    error "no JavaScript runtime found. Install bun (https://bun.sh) or node (https://nodejs.org) first."
fi

info "Checking for the Rust toolchain (cargo)..."
if has cargo; then
    success "  found $(cargo --version)"
else
    error "cargo not found. Install the Rust toolchain from https://rustup.rs first."
fi

# --- install ------------------------------------------------------------------

info ""
info_bold "Installing ossido cli..."

if ! cargo install ossido_cli; then
    error "cargo install ossido_cli failed."
fi

# --- done ---------------------------------------------------------------------

printf '%b\n' ""
success "Ossido CLI was installed successfully!"

cargo_bin="${CARGO_HOME:-$HOME/.cargo}/bin"
if ! has ossido; then
    info "Add ${Bold_White}${cargo_bin}${Color_Off}${Dim} to your PATH to use the ${Bold_White}ossido${Color_Off}${Dim} command."
fi

printf '%b\n' ""
info "Create a new project with:"
printf '%b\n' "  ${Bold_Green}ossido new my-app${Color_Off}"
info "Or start from a template:"
printf '%b\n' "  ${Bold_Green}ossido new my-app --template with-tailwind${Color_Off}"
printf '%b\n' ""
info "Then ${Bold_White}cd my-app${Color_Off}${Dim} and run ${Bold_White}ossido dev${Color_Off}${Dim}. See ${Bold_White}ossido --help${Color_Off}${Dim} for more."