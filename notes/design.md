# Daily Notes PWA — Design

An offline-first, iPhone-installable static PWA for a Git-backed `journal/` Markdown database, hosted in `my-static-site` (`neilhan/static`) with zero backend server.

---

## 1. Goals & Constraints

- **100% static client-side app:** Runs on GitHub Pages under `./notes/dist/index.html` (`base: "./"`), installable as a standalone iPhone Home Screen PWA.
- **True offline-first:** Cold launches work offline via Service Worker; all reads, edits, moves, reorders, completions, and searches run locally against `IndexedDB` with zero network lag.
- **Direct GitHub sync:** Reads and writes `journal/` in a user-configured GitHub repo directly via GitHub REST / Git Data APIs—no backend, no branch/PR workflow, and 1 atomic commit per Push (no "owed deletions").
- **Data portability:** Strictly adheres to the `journal/README.md` file format, folder tree, frozen slugs, ULIDs, fractional ordering, and `## History` log.
- **Usable from BC and China:** Core journal + GitHub sync work without Google services; Google Calendar and Gemini AI degrade gracefully when unreachable.

---

## 2. Monorepo Integration (`my-static-site`)

- **Package:** `notes/` (`package.json` name `notes`, Vite dev port `3008`).
- **Stack:** React 19 + TypeScript + Vite (matching `SportTimer`, `FarnsworthCWTrainer`, `Guitar`, `RRSPCalculator`), depending on `"@static/shared": "workspace:*"`.
- **Workspace wiring:**
  - Add `notes` to `pnpm-workspace.yaml`.
  - Add `"dev:notes": "pnpm --filter notes dev"` (and include in `dev:all`) in root `package.json`.
  - Add `notes` entry to root `index.html` and `README.md`.
  - Add `notes` to `scripts/generate_pwa_assets.py` so `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `public/manifest.webmanifest` (`start_url: "./"`, `scope: "./"`), and `public/sw.js` (`pwa-notes-v1`) are generated consistently.
  - Built `notes/dist/` is git-tracked and built sequentially by `./build_all.sh`.

---

## 3. Data Model & File Format Compatibility

The app treats the configured repo's `journal/` folder as the source of truth and implements the `journal/README.md` spec directly:

- **Item identity:** `id` (26-char Crockford base32 ULID for new items; bare integer/string accepted for legacy items), stored as a string end-to-end.
- **Frozen slug & path:** `slug` generated once on creation (NFD normalized, ASCII lowercase, `-` separated, max 60 chars, `-2`/`-3` suffix on sibling collision). Title edits update `# Title` only—never `slug` or file path.
- **Containers:**
  - Day: `journal/<year>/<YYYY-MM-DD>/`
  - Week: `journal/<year>/week-<Monday>/`
  - Month: `journal/<year>/<YYYY-MM>/`
  - Year: `journal/<year>/year/`
  - Notes: `journal/notes/`
- **Sibling folders:** Sub-items of `foo.md` live in `foo/` beside `foo.md` recursively. Moving an item moves its file + entire sibling folder.
- **Frontmatter fields:** `id`, `slug`, `status` (`open` | `done` | `archived`), `order` (fractional; renumber `1..N` only past 6 decimal places), `created` (`YYYY-MM-DD`), optional `time` (`HH:MM`), `collapsed` (`true` when collapsed), `calendar`, `calendarUrl`.
- **History:** Every item embeds `## History` with `- <action> · <ISO-Z> · <from> → <to>`.
- **Non-item files:** `journal/README.md` and files outside `journal/` are ignored by item parsing and never deleted on Push.
- **Legacy layout import:** On Pull, parse older single-file-per-day/period layouts (`journal/<year>/<YYYY-MM-DD>.md`, `journal/future.md`, `journal/plans.md`) if present; per-item files win, and the next Push writes per-item files and removes the legacy files.

---

## 4. Offline Storage (`IndexedDB`) & Service Worker

### Service Worker (`public/sw.js`)
- Generated via `scripts/generate_pwa_assets.py` (`pwa-notes-v1`).
- Network-first for same-origin `GET` requests with `CacheStorage` fallback and `./index.html` fallback for navigations—ensuring cold launches work offline after initial install.
- Cross-origin API calls (`api.github.com`, `generativelanguage.googleapis.com`, `www.googleapis.com`) bypass the SW cache.

### IndexedDB (`notes-db`, v1)
Replaces `localStorage` so the journal isn't capped at ~5 MB and tracks GitHub blob SHAs cleanly:

| Object Store | Key | Purpose |
|---|---|---|
| `items` | `id` | Parsed item fields (`id`, `slug`, `path`, `parentId`, `container`, `status`, `order`, `title`, `body`, `history`, `time`, `collapsed`, `calendar`, `calendarUrl`), `rawMarkdown`, `remoteSha`, `dirty` (`boolean`), `updatedAt`. |
| `pendingDeletes` | `path` | Paths deleted or moved away from locally that must be removed (`sha: null`) on next Push. |
| `syncMeta` | `key` | `lastCommitSha`, `lastTreeSha`, `lastPulledAt`, `lastPushedAt`, `conflicts[]`, `uiPrefs` (`showDone`, collapsed sections). |
| `remoteNonItems` | `path` | Tracked non-item paths under `journal/` (e.g. `journal/README.md`) so Push never sweeps them. |

- Every UI mutation writes to `IndexedDB` synchronously in the interaction flow (marking `dirty: true` and recording old paths in `pendingDeletes` when moved/deleted).
- An offline/unsynced status strip shows connection state and `dirtyCount + pendingDeletesCount`.

---

## 5. GitHub Sync Engine (`main` branch only)

All sync runs directly against `https://api.github.com/repos/{owner}/{repo}` (configured in Settings, starting empty) using a Fine-Grained PAT (`Contents: Read & Write` scoped to that repo).

### Pull (Incremental + Merge-by-`id`)
1. `GET /git/refs/heads/main` → get `headCommitSha`. If equal to `lastCommitSha`, return immediately (1 API call).
2. `GET /git/trees/{headCommitSha}?recursive=1` → filter blobs under `journal/` (excluding `journal/README.md`).
3. Diff remote `(path, sha)` against `items` in `IndexedDB`:
   - **Unchanged `sha`:** skip download.
   - **New or changed `sha`:** fetch blob (`GET /git/blobs/{sha}` or raw content) and parse Markdown.
4. **Reconcile by `id` first (not path):**
   - Remote item matches local `id` with `dirty: false` → accept remote update (including path move).
   - Remote item matches local `id` with `dirty: true`:
     - If remote `sha === local.remoteSha` → keep local edit.
     - If remote `sha !== local.remoteSha` → **conflict**: keep local version, update `remoteSha`, and record in `syncMeta.conflicts` for a dismissible notice.
   - Remote path disappeared and `id` is `dirty: false` → delete from `IndexedDB` (unless it's in `pendingDeletes`).
5. Save `lastCommitSha` and `lastTreeSha`.

### Push (Atomic Single-Commit via Git Data API)
1. Collect all `items` with `dirty: true` and all `pendingDeletes`. If empty, return.
2. Check `GET /git/refs/heads/main`. If `headCommitSha !== lastCommitSha`, run **Pull** first so merges happen before committing.
3. For each dirty item, serialize Markdown and `POST /git/blobs` → get new `blobSha`.
4. Build `tree` entries for `POST /git/trees` with `base_tree: lastTreeSha`:
   - Dirty items: `{ path, mode: "100644", type: "blob", sha: blobSha }`
   - Deleted/moved-away paths in `pendingDeletes` (not re-occupied by a current item): `{ path, mode: "100644", type: "blob", sha: null }`
5. `POST /git/commits` (parent: `headCommitSha`, tree: `newTreeSha`, message: `"Journal sync (<N> updated, <M> deleted)"`).
6. `PATCH /git/refs/heads/main` with `{ sha: newCommitSha }`.
7. On success, clear `dirty`, update `remoteSha` & `lastCommitSha` / `lastTreeSha`, and clear `pendingDeletes`.

---

## 6. Google Calendar Sync (One-Way, Optional)

- **Window:** Today through +2 months (exclusive end, month-end clamped per `journal/README.md`).
- **Browser flow:** Google Identity Services (GIS) OAuth token (read-only `calendar.readonly`) → `GET /calendar/v3/calendars/primary/events`.
- **Reconciliation:**
  - Match by `calendar` (`event.id`). Update `title`, `time`, and address in details in place.
  - Past calendar items (before today) stay as history unless rescheduled into the future window (then move file, keeping `id` and history).
  - Items in `[today, +2 months)` missing from fetched events are deleted (queued in `pendingDeletes` + removed from `items`).
- **Trigger:** Runs automatically after Pull and before Push when signed in; a failed or offline calendar read never blocks GitHub Pull/Push.
- **China fallback:** Optional scheduled GitHub Action in the journal repo can sync calendar events headless into `journal/` so the PWA simply pulls them from GitHub.

---

## 7. Built-in Gemini AI Chat *(Last Feature to Implement)*

Implemented after the core offline `IndexedDB` store, GitHub sync, UI views, and calendar sync are working.

- **Direct REST call:** Browser calls `generativelanguage.googleapis.com` (`generateContent`) using the user's stored Gemini API key (defaulting to a fast model like Gemini 4 Hydrogen).
- **Text & Voice input in one chat box:**
  - **Text:** Multiline input (`Enter` sends, `Shift+Enter` newline).
  - **Voice (tap-to-talk mic button):** Record audio via `MediaRecorder` (`audio/mp4` on iOS Safari, `audio/webm` on Chrome/desktop) and send the audio clip directly as multimodal input to `generateContent`. Avoids `webkitSpeechRecognition` quirks in iPhone standalone PWAs and handles mixed English + Chinese natively without a separate transcription step.
  - **Spoken replies:** Auto-speak replies when triggered by voice (plus a speaker toggle on the chat box / individual messages) using `window.speechSynthesis` with language-matched voice selection (English / Chinese), with optional Gemini TTS upgrade later.
- **Function Calling wired to `IndexedDB`:**
  - Read tools: `search_items`, `list_day`, `list_overdue`, `list_notes`, `get_item` (excluding calendar items from open-todo reminders).
  - Write tools: `create_item`, `update_item`, `move_item`, `set_status`, `delete_item` (all write locally to `IndexedDB` and mark `dirty: true`).
- **UI & Safety:** Floating chat bubble on all views, suggestion chips when empty, a compact summary of local changes made with an **Undo** button (and 1-tap confirmation for bulk deletes/moves) before pushing to GitHub. Disabled gracefully when offline.

---

## 8. Auth & Security

- Stored in `localStorage` (entered once in Settings, never committed):
  - `github_owner` / `github_repo` (empty by default, entered in Settings)
  - `github_pat` (Fine-Grained PAT scoped only to the journal repo, `Contents: Read & Write`)
  - `gemini_api_key`
  - Optional `google_client_id` for GIS Calendar read
- No untrusted third-party scripts or CDNs; strict CSP-friendly bundle.

---

## 9. UI & Views

Shared `56rem` centered column on desktop, full-width on phone, minimal UI (no empty-state clutter):

- **Main list:** Merged time-ordered view — Today (with `‹` / `›` / `Today` / date picker), upcoming days, rough plans (week/month/year at period start), and `Notes` last.
- **Overdue:** Collapsed section at top for past-dated open non-calendar items, with count badge and bulk/per-row Done, Move, Archive, Delete.
- **Outline rows:**
  - Circled bullet = has sub-items; plain dot = leaf. Clicking bullet zooms in.
  - `▸`/`▾` collapse toggle at right beside `⋯` menu (only when item has sub-items).
  - Tap title or details for inline edit; list rows clamp details to 3 lines with ellipsis.
  - Drag grip `⋮⋮` for reorder/move/nest, plus `⋯` menu (Add sub-item, Indent, Outdent, Move up/down, Move, Done/Reopen, Archive, Delete with two-tap confirm).
- **Zoom view:** Single-item focus with breadcrumb ancestors, `‹ Back` trail, full details editor, time-of-day editor, sub-item outline, and collapsible `## History`.
- **Header / Controls:** Search input (`≥ 2` chars), `✓ Done` filter toggle (persisted, hides done items + subtrees when off), quick-jump chips, and bottom Sync bar (Pull, Push, dirty count, conflict banner).

---

## 10. Module Layout & Testing

```text
notes/
├── design.md
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── icon.svg
│   ├── icon-192.png        # generated
│   ├── icon-512.png        # generated
│   ├── apple-touch-icon.png# generated
│   ├── manifest.webmanifest# generated
│   └── sw.js               # generated
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── core/               # pure TS, unit-tested with Vitest
    │   ├── markdown.ts     # frontmatter + # Title + body + ## History parser/serializer
    │   ├── slug.ts         # NFD + 60-char cap + collision suffix
    │   ├── order.ts        # fractional midpoint + 6-decimal renumber
    │   ├── ulid.ts         # 26-char Crockford base32 ULID generator
    │   ├── tree.ts         # container detection, sibling folders, legacy layout import
    │   ├── merge.ts        # id-first pull reconciliation & conflict detection
    │   └── calendar.ts     # 2-month window & reschedule/cancel reconciliation
    ├── storage/
    │   └── db.ts           # IndexedDB wrapper (items, pendingDeletes, syncMeta)
    ├── sync/
    │   ├── github.ts       # Git Data API pull & atomic single-commit push
    │   └── gcal.ts         # GIS + Google Calendar REST fetch
    ├── ai/
    │   └── gemini.ts       # Gemini REST + function calling tools
    └── components/         # Outline, Row, ZoomView, Overdue, SyncBar, ChatBubble, Settings
```

- **Unit tests (`pnpm --filter notes test`):** Vitest suite covering `markdown.ts`, `slug.ts`, `order.ts`, `tree.ts`, `merge.ts`, and `calendar.ts` (round-trip fidelity against `journal/` format fixtures).
- **Build check:** `pnpm --filter @static/shared build && pnpm --filter notes build` (and `./build_all.sh` from root).

---

## 11. Implementation Order

1. **Core parser & data engine (`core/`):** Markdown/frontmatter parser & serializer, ULID, frozen slug, fractional order, tree/legacy import, and unit tests.
2. **Offline store & PWA shell (`storage/`, `sw.js`, `manifest`):** `IndexedDB` schema, Service Worker, and `my-static-site` workspace wiring.
3. **GitHub Sync (`sync/github.ts`):** Incremental Pull (tree SHA diff + `id`-first merge) and atomic 1-commit Push (Git Data API).
4. **Core UI views (`components/`):** Main list, Overdue, Zoom view, inline editing, drag/reorder, `✓ Done` toggle, Archived, Search, and Sync bar.
5. **Google Calendar sync (`sync/gcal.ts`):** Optional 2-month read-only GIS sync.
6. **Gemini text & voice chat (`ai/gemini.ts`):** Last feature—chat box with `MediaRecorder` voice input, spoken replies, `IndexedDB` function calling, and Undo.
