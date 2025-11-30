# My tools

[<img src="./SportTimer/public/stopwatch.svg" width="24" height="24" style="vertical-align: middle; margin-right: 8px;" /> Timer & Tracker](./SportTimer/dist/index.html)

[<img src="./FarnsworthCWTrainer/public/key.svg" width="24" height="24" style="vertical-align: middle; margin-right: 8px;" /> Farnsworth CW Trainer](./FarnsworthCWTrainer/dist/index.html)

[<img src="./Life/public/calendar.svg" width="24" height="24" style="vertical-align: middle; margin-right: 8px;" /> Life in weeks](./Life/dist/index.html)

[<img src="./packages/shared/assets/icons/language.svg" width="24" height="24" style="vertical-align: middle; margin-right: 8px;" /> Learn Foreign Language](./LearnForeignLanguage/dist/index.html) — in-progress language practice workspace.

<iframe src="./Life/dist/index.html" width="100%" height="2400px" style="border: 1px solid #333; border-radius: 8px;" scrolling="no"></iframe>

## Development
```
nvm use 22
pnpm -r install
pnpm build
pnpm dev:all
```

This repo is a pnpm workspace. To work on any app:

1. Enable pnpm via Corepack once: `corepack enable pnpm`
2. Use Node 22+ (run `nvm use` to respect `.nvmrc`, Vite 7 requires 20.19+)
3. Install everything from the repo root: `pnpm install`
4. Dev servers:
   - Single app: `pnpm dev:farnsworth`, `pnpm dev:sporttimer`, `pnpm dev:life`, or `pnpm dev:language`
   - All apps together: `pnpm dev:all`
5. Build every app at once: `pnpm run -r build` (or `./build_all.sh`)

### Shared library (`packages/shared`)

- React wake-lock hook lives in `@static/shared/react/useScreenWakeLock`
- Common icons (for now, `home.svg`) live in `@static/shared/assets/home.svg`
- Build the package with `pnpm --filter @static/shared build`
- Extend it with additional hooks/utilities to keep apps in sync

## Testing Production Builds Locally

Source code: [https://github.com/neilhan/static](https://github.com/neilhan/static)
To test a production build locally (avoiding CORS issues), navigate to the app directory and run:

```bash
npx serve dist
```

This will serve the built files over HTTP at `http://localhost:3000` (or another port if 3000 is busy).

---

_Last updated: 2025-11-30 19:00 PT_
