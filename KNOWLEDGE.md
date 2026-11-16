# My Tools (`static-apps`) — Project Knowledge

## Overview
A `pnpm` workspace monorepo of 7 standalone, 100% client-side static web apps plus a shared workspace package (`@static/shared`), built with Vite and deployed to GitHub Pages (`neilhan.github.io/static`) with generated PWA manifests, icons, and service workers (`scripts/generate_pwa_assets.py`).

### Workspace Layout
- `packages/shared` (`@static/shared`) — Shared wake-lock hook (`useScreenWakeLock`), Web Audio helper (`audio.ts`), `HOME_HREF` / `getHomeHref`, `IconGraphic`, `wakeLockEnv`, common SVG assets, and dark-mode `styles.css`.
- `FarnsworthCWTrainer` — React 19 + TypeScript + Vite (Morse code trainer with Web Audio API).
- `Guitar` — React 19 + TypeScript + Vite (see [Guitar/KNOWLEDGE.md](./Guitar/KNOWLEDGE.md)).
- `LearnForeignLanguage` — React 19 + TypeScript + Vite (see [LearnForeignLanguage/KNOWLEDGE.md](./LearnForeignLanguage/KNOWLEDGE.md)).
- `Life` — Svelte 5 + TypeScript + Vite ("Life in Weeks").
- `LuckyNumberLookup` — Vanilla TypeScript + Vite (1–81 direct / modulo-80 lookup table).
- `RRSPCalculator` — React 19 + TypeScript + Vite (Canadian RRSP/TFSA/CCPC/Personal simulator & comparator).
- `SportTimer` — React 19 + TypeScript + Vite (interval timer & activity tracker).
- Root launcher & scripts — `index.html`, `manifest.webmanifest`, `sw.js`, `build_all.sh`, `publish.sh`, `scripts/generate_pwa_assets.py`.

---

## Monorepo Architecture

### 1. Workspace & Package Dependency Model
- **Package Manager:** `pnpm@10.24.0` configured via `pnpm-workspace.yaml` to include all 7 app directories plus `packages/*`.
- **Internal Linking (`@static/shared`):** Every subproject depends on `"@static/shared": "workspace:*"`.
- **Pre-compiled Library Pattern:** `packages/shared` compiles TypeScript from `src/` into `dist/` via `tsc -p tsconfig.json` and exposes `dist/index.js`, `dist/audio.js`, `dist/react/index.js`, and `dist/react/useScreenWakeLock.js` through `package.json` `exports`, alongside static assets (`./styles.css`, `./assets/*.svg`). Because `exports` points to `dist/`, `@static/shared` must be built before consumers run `tsc` or `vite build`.
- **Port Allocation in Dev:** Each app binds a distinct Vite dev port (`3000` SportTimer, `3001` FarnsworthCWTrainer, `3002` Life, `3003` LearnForeignLanguage, `3005` LuckyNumberLookup, `3006` RRSPCalculator, `3007` Guitar) so `pnpm dev:all` can run all 7 concurrently.

### 2. Static Deployment & Build Pipeline
- **Zero-Backend Static Apps:** Every subproject runs entirely in the browser (`localStorage` for user state, Web Audio API / browser Speech Synthesis for audio, no API server) and uses `base: "./"` in Vite so `dist/` bundles are portable.
- **Root Launcher (`index.html`):** Static hub page linking to each subproject's built `./<App>/dist/index.html` (and embedding `./Life/dist/index.html` in an `<iframe>`).
- **Git-Tracked `dist/` Artifacts:** `.gitignore` leaves `dist` tracked so GitHub Pages serves the repository root directly without a separate CI deploy step.
- **Build & Publish Scripts:**
  - `build_all.sh` loads Node from `.nvmrc`, runs `pnpm install --frozen-lockfile`, and runs `pnpm run -r --workspace-concurrency=1 build` sequentially (building `@static/shared` before workspace consumers).
  - `publish.sh` runs `./build_all.sh`, updates the `_Last updated: ..._` timestamp in `README.md` when changes exist, prompts for a commit message, commits, and pushes.

### 3. Nested PWA & Service Worker Architecture
- **Installable Root + Standalone Sub-Apps:** Both the root launcher and every individual sub-app can be installed independently as a PWA.
- **Asset & SW Generator (`scripts/generate_pwa_assets.py`):** Renders `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png` from each app's source SVG using `GdkPixbuf`, writes each app's `public/manifest.webmanifest` (`start_url: "./"`, `scope: "./"`), and generates each app's `public/sw.js` with an isolated cache namespace (`pwa-<app>-v1`).
- **Offline Caching Strategy:** Each generated `sw.js` uses a network-first strategy for same-origin `GET` requests, falling back to `CacheStorage` (and `./index.html` for navigation requests) when offline.

---

## Subprojects

- **`FarnsworthCWTrainer` (React 19):** Core timing/sequencing engine (`src/morse/morseSender.ts`) tested with an injected `AudioDriver` (`src/morse/__tests__/morseSender.test.ts`), Web Audio tone hook (`useAudioEngine`), and React Context state (`MorseSenderContext`, `TrainerSettingsContext`).
- **`Guitar` (React 19):** Shared SVG `Fretboard` / `MiniFretboard` renderers, Web Audio synthesis (`src/utils/guitarAudio.ts`), modular music theory engine (`src/utils/theory/*` re-exported via `src/utils/musicTheory.ts`), `<PitchClassSelector />`, and 6 study tabs including the interactive Circle of Fifths. See [Guitar/KNOWLEDGE.md](./Guitar/KNOWLEDGE.md).
- **`LearnForeignLanguage` (React 19):** Bundled read-only Spanish B1 datasets (`spanish-500-phrases.json`, `spanish-3000-words.json`) paired with compact `localStorage` SRS state (`src/utils/storage.ts`, `src/utils/srs.ts`, `src/utils/curriculum.ts`, `src/utils/recall.ts`). See [LearnForeignLanguage/KNOWLEDGE.md](./LearnForeignLanguage/KNOWLEDGE.md).
- **`Life` (Svelte 5):** Reactive "Life in Weeks" grid (`App.svelte`) backed by pure calculation modules (`src/lib/lifeLogic.ts`, `src/lib/dateUtils.ts`) and `localStorage` persistence.
- **`LuckyNumberLookup` (Vanilla TS):** Minimal single-page lookup UI (`src/main.ts`) backed by `src/data.ts` (direct lookup for `1–81`, modulo `80` reduction for other integers).
- **`RRSPCalculator` (React 19):** Pure Canadian tax, OAS clawback, CCPC/CDA, RRIF minimum, and strategy simulation engine (`src/engine/{types,taxRules,accountComparator,strategySimulator}.ts`), pure state helpers (`src/state.ts`), and React 19 UI (`src/App.tsx`, `src/components/*`).
- **`SportTimer` (React 19):** Interval timer & activity tracker with timestamp-based (`Date.now()`) drift-free countdown and `visibilitychange` catch-up (`src/hooks/useTimer.ts`), `localStorage` persistence, and wake-lock integration.

---

## Verification
- **Workspace Build:** `./build_all.sh` or `pnpm run -r --workspace-concurrency=1 build` (builds `@static/shared` and all 7 apps with TypeScript checking).
- **Workspace Tests:** `pnpm run -r test` runs Vitest unit tests across all 7 apps (`FarnsworthCWTrainer`, `Guitar`, `LearnForeignLanguage`, `Life`, `LuckyNumberLookup`, `RRSPCalculator`, `SportTimer`).
- **Additional Checks:** `npm --prefix Life run check` (`svelte-check`) and `npm --prefix FarnsworthCWTrainer run lint` (`eslint .`).
