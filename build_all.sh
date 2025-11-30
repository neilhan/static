#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Load NVM if it exists so pnpm uses the expected Node version.
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1090
  . "$NVM_DIR/nvm.sh"
  if [ -f ".nvmrc" ]; then
    echo "Using Node version from .nvmrc..."
    nvm use
  fi
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required but not installed. Install via corepack or npm."
  exit 1
fi

echo "Installing workspace dependencies..."
pnpm install --frozen-lockfile

echo "Running builds for all workspace packages..."
pnpm run -r --workspace-concurrency=1 build

echo "--------------------------------------------------"
echo "All projects built successfully!"
