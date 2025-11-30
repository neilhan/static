#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

README_FILE="$ROOT_DIR/README.md"

update_readme_timestamp() {
  if [[ ! -f "$README_FILE" ]]; then
    echo "README.md not found at $README_FILE; skipping timestamp update." >&2
    return
  fi

  local timestamp replacement
  timestamp="$(TZ=America/Los_Angeles date '+%Y-%m-%d %H:%M PT')"
  replacement="_Last updated: ${timestamp}_"

  if grep -q '^_Last updated:' "$README_FILE"; then
    perl -0pi -e 's/_Last updated:.*_/'"$replacement"'/' "$README_FILE"
  else
    printf "\n%s\n" "$replacement" >> "$README_FILE"
  fi
}

./build_all.sh

if [[ -n "$(git status --porcelain)" ]]; then
  update_readme_timestamp
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

