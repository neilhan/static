# My Tools (`static-apps`) — Root Architecture & Cleanup Knowledge

## Overview
A `pnpm` workspace monorepo of 7 standalone, client-side static web apps plus a shared workspace package (`@static/shared`), built with Vite and deployed to GitHub Pages (`neilhan.github.io/static`) with generated PWA manifests, icons, and service workers (`scripts/generate_pwa_assets.py`).

### Workspace Layout
- `packages/shared` (`@static/shared`) — Shared wake-lock hook (`useScreenWakeLock`), Web Audio helper (`audio.ts`), `HOME_HREF` / `getHomeHref`, `IconGraphic`, `wakeLockEnv`, common SVG assets, and dark-mode `styles.css`.
- `FarnsworthCWTrainer` — React 19 + TypeScript + Vite (Morse code trainer with Web Audio API).
- `Guitar` — React 19 + TypeScript + Vite (see [Guitar/KNOWLEDGE.md](./Guitar/KNOWLEDGE.md)).
- `LearnForeignLanguage` — React 19 + TypeScript + Vite (see [LearnForeignLanguage/KNOWLEDGE.md](./LearnForeignLanguage/KNOWLEDGE.md)).
- `Life` — Svelte 5 + TypeScript + Vite ("Life in Weeks").
- `LuckyNumberLookup` — Vanilla TypeScript + Vite (modulo-80/81 lookup table).
- `RRSPCalculator` — React 19 + TypeScript + Vite (Canadian RRSP/TFSA/Taxable simulator & comparator).
- `SportTimer` — React 19 + TypeScript + Vite (interval timer & activity tracker).
- Root launcher & scripts — `index.html`, `manifest.webmanifest`, `sw.js`, `build_all.sh`, `publish.sh`, `scripts/generate_pwa_assets.py`.

---

## How the Monorepo Architecture Works

### 1. Workspace & Package Dependency Model
- **Package Manager:** `pnpm@10.24.0` configured via `pnpm-workspace.yaml` to include all 7 app directories plus `packages/*`.
- **Internal Linking (`@static/shared`):** Every subproject depends on `"@static/shared": "workspace:*"`.
- **Pre-compiled Library Pattern:** `packages/shared` compiles TypeScript from `src/` into `dist/` via `tsc -p tsconfig.json` and exposes `dist/index.js`, `dist/react/index.js`, and `dist/react/useScreenWakeLock.js` through `package.json` `exports`, alongside raw static assets (`./styles.css`, `./assets/*.svg`). Because `exports` points to `dist/`, `@static/shared` must be built before consumers run `tsc` or `vite build`.
- **Port Allocation in Dev:** Each app binds a distinct Vite dev port (`3000` SportTimer, `3001` FarnsworthCWTrainer, `3002` Life, `3003` LearnForeignLanguage, `3005` LuckyNumberLookup, `3006` RRSPCalculator, `3007` Guitar) so `pnpm dev:all` can run all 7 concurrently.

### 2. Static Deployment & Build Pipeline
- **No Backend / Pure Static Bundles:** Every subproject is 100% client-side (`localStorage` for user state, Web Audio API / browser Speech Synthesis for audio, no API server).
- **Root Launcher (`index.html`):** Serves as a static hub page linking directly to each subproject's built `./<App>/dist/index.html` (and embedding `./Life/dist/index.html` in an `<iframe>`).
- **Git-Tracked `dist/` Artifacts:** `.gitignore` intentionally leaves `dist` uncommented so GitHub Pages can serve the repository root directly without a separate CI deploy step.
- **Build & Publish Scripts:**
  - `build_all.sh` loads Node from `.nvmrc`, runs `pnpm install --frozen-lockfile`, and runs `pnpm run -r --workspace-concurrency=1 build` sequentially (ensuring `@static/shared` builds cleanly for workspace consumers).
  - `publish.sh` runs `./build_all.sh`, updates the `_Last updated: ..._` timestamp in `README.md` if changes exist, prompts for a commit message, commits, and pushes.

### 3. Nested PWA & Service Worker Architecture
- **Installable Root + Standalone Sub-Apps:** Both the root launcher and every individual sub-app can be installed independently as a PWA.
- **Asset & SW Generator (`scripts/generate_pwa_assets.py`):** Renders `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png` from each app's source SVG using `GdkPixbuf`, writes each app's `public/manifest.webmanifest` (`start_url: "./"`, `scope: "./"`), and generates each app's `public/sw.js` with an isolated cache namespace (`pwa-<app>-v1`).
- **Offline Caching Strategy:** Each generated `sw.js` uses a network-first strategy for same-origin `GET` requests, falling back to `CacheStorage` (and `./index.html` for navigation requests) when offline.

### 4. Subproject Architectural Styles
- **React 19 SPAs (`Guitar`, `FarnsworthCWTrainer`, `LearnForeignLanguage`, `SportTimer`, `RRSPCalculator`):** Use React 19 hooks/context + Vite, importing `@static/shared` (`IconGraphic`, `useScreenWakeLock`, raw SVG icons via `?raw`).
- **Svelte 5 App (`Life`):** Single-page reactive Svelte 5 app with pure TypeScript grid/date calculation modules (`src/lib/`).
- **Zero-Framework Vanilla TS (`LuckyNumberLookup`):** Renders HTML templates directly into `#app` with pure lookup logic (`data.ts`) and manual DOM event binding.

---

## Architectural Review & Recommended Cleanups

### 1. Cross-Cutting / Monorepo Architecture

#### Workspace Scripts & CI Gates
- **Broken `dev:sporttimer` script:** Root `package.json` runs `pnpm --filter sporttimer dev` (lowercase), whereas `SportTimer/package.json` declares `"name": "SportTimer"` (PascalCase). Normalize all package names to lowercase (`"sporttimer"`).
- **Inconsistent `test` / `lint` / `build` scripts:** Root `"test": "pnpm run -r test"` and `"lint": "pnpm run -r lint"` skip multiple subprojects:
  - `"test"` is missing from `Guitar/package.json` and `LearnForeignLanguage/package.json` even though both already include `vitest` and `.test.ts` suites; `Life` and `SportTimer` currently have no unit tests.
  - `"lint"` is only defined in `FarnsworthCWTrainer` and `SportTimer`.
  - `FarnsworthCWTrainer/package.json` runs `"build": "vite build"` without `tsc`, unlike the other TypeScript apps (`tsc && vite build`), so type errors can slip past `build_all.sh`.

#### `@static/shared` Utilization & Alignment
- **Hardcoded Home URL in 7 places:** Every app hardcodes `href="https://neilhan.github.io/static"` in its header instead of sharing a home URL constant or relative/base-aware header component, breaking local `npx serve` navigation and staging forks.
- **Misaligned `styles.css` theme:** `packages/shared/styles.css` defines a light-mode palette (`#f9fafb`), while all 7 apps use dark themes. Only `Guitar` and `LearnForeignLanguage` import it, and both override its variables in `App.css`. Align `@static/shared/styles.css` with dark-mode base tokens or remove unused theme tokens.
- **Duplicated Web Audio boilerplate:** `AudioContext` creation and `click` / `touchstart` resume listeners are duplicated across `FarnsworthCWTrainer/src/hooks/useAudioEngine.ts`, `SportTimer/src/hooks/useTimer.ts`, and `Guitar/src/utils/guitarAudio.ts`. Extract a shared `getOrResumeAudioContext()` utility into `@static/shared`.

#### Deployment, PWA & Stack Consistency
- **`Life` Vite base path mismatch:** 6 of 7 apps use `base: "./"`, while `Life/vite.config.ts` hardcodes `base: "/static/Life/dist/"`, breaking local `npx serve dist` previews (despite `README.md` recommending `npx serve dist`).
- **Committed `dist/` & fixed iframe height:** `.gitignore` leaves `dist/` tracked in git for GitHub Pages (creating noisy build diffs; moving builds to GitHub Actions would keep history clean). Root `index.html` also embeds `./Life/dist/index.html` inside a fixed `height: 2400px`, `scrolling="no"` `<iframe>`.
- **UI stack sprawl:** Across 7 tools there are 4 UI stacks: React 19 (`Guitar`, `FarnsworthCWTrainer`, `LearnForeignLanguage`), React 18 (`SportTimer`), Svelte 5 (`Life`), and raw `innerHTML` Vanilla TS (`RRSPCalculator`, `LuckyNumberLookup`). Upgrading `SportTimer` to React 19 is a quick alignment win.

---

### 2. Per-Subproject Architecture & Cleanups

#### `Guitar`
- **Current Architecture:** Clean separation between pure music theory (`src/utils/musicTheory.ts`), Web Audio synthesis (`src/utils/guitarAudio.ts`), and shared SVG primitives (`Fretboard.tsx`, `MiniFretboard.tsx`, `SectionHeader.tsx`).
- **Cleanups:**
  - Split `src/utils/musicTheory.ts` (~1,440 lines) into focused modules (`notes.ts`, `tiles.ts`, `chords.ts`, `scales.ts`, `circleOfFifths.ts`) re-exported from `musicTheory.ts`.
  - Extract a shared `<PitchClassSelector />` component to remove the duplicated 12-note root selector pill strip across `ChordStudyBoard.tsx`, `PentatonicBoard.tsx`, and `ScaleStudyBoard.tsx`.
  - Add `"test": "vitest run"` to `Guitar/package.json`.

#### `FarnsworthCWTrainer`
- **Current Architecture:** Well-tested core engine (`src/morse/morseSender.ts` + `morseSender.test.ts` with an injected `AudioDriver` interface and fake-timer tests).
- **Cleanups:**
  - Remove the empty dead file `FarnsworthCWTrainer/src/morse/AudioEngine.ts`.
  - Add `tsc --noEmit` (or `tsc`) to `FarnsworthCWTrainer/package.json`'s `build` script and convert `vite.config.js` to `vite.config.ts`.
  - Trim redundant hook/context indirection (`useSenderControls` + `useTrainerMessages` wrapping `MorseSenderContext` + `TrainerSettingsContext`).

#### `LearnForeignLanguage`
- **Current Architecture:** Clean split between read-only bundled JSON (`spanish-500-phrases.json`, `spanish-3000-words.json`) and compact `localStorage` SRS state (`learn-foreign-language-v3` in `src/utils/storage.ts`).
- **Cleanups:**
  - Refactor `buildSourceCollection` in `src/utils/curriculum.ts` so it does not eagerly construct a huge `rawInput` string and 3,500 `Conversation` objects in React state when `CollectionManager.tsx` only needs item counts and `srsData`.
  - Replace the hardcoded `itemId.startsWith("es-p-")` check in `getSourceForItem` (`src/App.tsx`) with explicit source metadata or a lookup map.
  - Delete leftover Vite template asset `LearnForeignLanguage/public/vite.svg`.
  - Add `"test": "vitest run"` to `LearnForeignLanguage/package.json` and update `LearnForeignLanguage/KNOWLEDGE.md` (replace the stale `parser.test.ts` reference with `curriculum.test.ts` and `recall.test.ts`).

#### `SportTimer`
- **Current Architecture:** Clean hook/component layout with legacy schema migration (`cycles` → `rounds`) in `src/App.tsx`.
- **Cleanups:**
  - Upgrade from React 18 / ESLint 8 to React 19 / ESLint 9 to match the rest of the workspace.
  - Replace the `1000ms` `setInterval` decrement (`prev.remainingTime - 1`) in `src/hooks/useTimer.ts` with target-timestamp (`Date.now()`) math so timers do not drift when backgrounded on mobile devices.
  - Add Vitest unit tests for `useTimer` and `src/utils/helpers.ts`.

#### `RRSPCalculator`
- **Current Architecture:** Strong, well-tested pure financial engine (`src/engine/`, ~1,960 lines, tested in `src/calculator.test.ts`) with zero DOM dependencies, paired with ~4,370 lines of Vanilla TS `innerHTML` string templates across 25 files in `src/components/`. `src/main.ts` manually splits rendering into `renderApp()`, `renderControlsPanel()`, and `updateResultsOnly()` (plus imperative DOM patchers like `updateAllocationVisuals` / `updatePensionCoverageLive`) so `<input type="range">` sliders keep pointer capture during drags.
- **Cleanups & Framework Migration Plan:**
  - Make `getStrategyParams()` in `src/state.ts` pure (remove side-effect mutations to `state.annualSaving` and `state.retireStartTotal` during reads).
  - **Conditional React 19 Migration:** If continuing active UI feature work on `RRSPCalculator`, migrate `src/components/` and `src/state.ts` to **React 19** (matching `Guitar`, `FarnsworthCWTrainer`, and `LearnForeignLanguage` and reusing `@static/shared`), while keeping the pure `src/engine/` math core and `calculator.test.ts` 100% intact. This eliminates manual `renderControlsPanel` / `updateResultsOnly` workarounds, global DOM `id` coupling, and `attach*Listeners` boilerplate. If the app is in maintenance-only mode, keeping Vanilla TS and only fixing `state.ts` purity is lower-risk.

#### `Life`
- **Current Architecture:** Minimal, clean Svelte 5 component tree (`App.svelte`) with pure logic modules (`src/lib/lifeLogic.ts`, `src/lib/dateUtils.ts`).
- **Cleanups:**
  - Change `base` in `Life/vite.config.ts` from `"/static/Life/dist/"` to `"./"`.
  - Add Vitest unit tests for `generateLifeGrid` and `getWeeksInYear`.

#### `LuckyNumberLookup`
- **Current Architecture:** Small, self-contained Vanilla TS app with unit tests (`src/data.test.ts`).
- **Cleanups:**
  - Align the UI copy in `LuckyNumberLookup/src/main.ts` (`"reduced modulo 80 (1–80)"` vs `"Lookup table (1–81)"`) with `src/data.ts` (which keeps `1–81` directly and reduces values `> 81` modulo `80`) and root `index.html` (`"modulo 81 (1–81)"`).

---

## Planned Upgrades & Cleanup Checklist

### Cross-Cutting / Monorepo
- [x] Fix `dev:sporttimer` / `dev:all` lowercase filter mismatch (`"sporttimer"`).
- [x] Add `"test": "vitest run"` scripts to `Guitar`, `LearnForeignLanguage`, `Life`, and `SportTimer`.
- [x] Add `tsc && vite build` to `FarnsworthCWTrainer` (`vite.config.ts`).
- [x] Add shared Web Audio helper (`packages/shared/src/audio.ts`), `HOME_HREF` / `getHomeHref` (`packages/shared/src/index.ts`), and dark-mode base tokens (`packages/shared/styles.css`).
- [x] Align `Life/vite.config.ts` `base` to `"./"`.
- [ ] Wire individual subproject headers and audio hooks to consume `HOME_HREF` / `getOrResumeAudioContext` from `@static/shared`.
- [ ] Optional: move `dist/` builds to GitHub Actions and replace fixed-height `<iframe>` in root `index.html`.

### Per-Subproject
- [x] **`Guitar`:** Split `src/utils/musicTheory.ts` into `src/utils/theory/*`, extracted `<PitchClassSelector />`, added `"test": "vitest run"`, synced `Guitar/KNOWLEDGE.md`.
- [x] **`FarnsworthCWTrainer`:** Deleted empty `src/morse/AudioEngine.ts`, converted `vite.config.js` → `vite.config.ts`, enabled `tsc && vite build`.
- [x] **`LearnForeignLanguage`:** Replaced eager `conversations`/`rawInput` in `buildSourceCollection` with `itemCount`, replaced `es-p-` prefix heuristic with `getItemSourceId`, deleted `public/vite.svg`, synced `LearnForeignLanguage/KNOWLEDGE.md`.
- [x] **`SportTimer`:** Upgraded from React 18 to React 19 (`^19.3.1`), replaced drifting `1000ms` decrement in `useTimer.ts` with timestamp-based (`Date.now()`) tracking + `visibilitychange` catch-up, added Vitest tests (`helpers.test.ts`, `useTimer.test.ts`).
- [x] **`RRSPCalculator`:** Migrated UI (`src/components/`, `src/state.ts`, `src/main.tsx`) to React 19 with pure state derivations (`state.test.ts`) while keeping `src/engine/` and `calculator.test.ts` intact.
- [x] **`Life`:** Switched `base` to `"./"` and added Vitest unit tests (`dateUtils.test.ts`, `lifeLogic.test.ts`).
- [x] **`LuckyNumberLookup`:** Aligned subtitle copy in `src/main.ts` with `1–81` direct + `> 81` mod `80` behavior.
