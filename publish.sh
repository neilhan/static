#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

./build_all.sh

if [[ -n "$(git status --porcelain)" ]]; then
  LAST_MESSAGE="$(git log -1 --pretty=%s 2>/dev/null || true)"
  if [[ -n "$LAST_MESSAGE" ]]; then
    read -r -p "Commit message [${LAST_MESSAGE}]: " COMMIT_MESSAGE
  else
    read -r -p "Commit message: " COMMIT_MESSAGE
  fi
  if [[ -z "${COMMIT_MESSAGE:-}" ]]; then
    COMMIT_MESSAGE="$LAST_MESSAGE"
  fi
  if [[ -z "$COMMIT_MESSAGE" ]]; then
    echo "Commit message cannot be empty."
    exit 1
  fi
  git add .
  git commit --no-verify -m "$COMMIT_MESSAGE"
  git push --no-verify
else
  echo "No changes detected; skipping commit."
fi

