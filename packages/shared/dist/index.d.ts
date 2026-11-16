export * from "./wakeLockEnv.js";
export * from "./audio.js";
export * from "./react/index.js";
/** Default relative href from `<App>/dist/index.html` back to the monorepo root `index.html`. */
export declare const HOME_HREF = "../../index.html";
export type HomeHrefOptions = {
    /** Explicit href override; takes precedence when non-empty. */
    href?: string;
    /** Fallback href when not running from a `<App>/dist/` build (defaults to `HOME_HREF`). */
    fallback?: string;
    /** Optional pathname to inspect instead of `window.location.pathname`. */
    pathname?: string;
};
/**
 * Resolves the navigation target for the monorepo home page without hardcoding a deployment origin.
 * In `<App>/dist/index.html` static builds this resolves to `../../index.html` (or the root `index.html`).
 */
export declare const getHomeHref: (options?: string | HomeHrefOptions) => string;
//# sourceMappingURL=index.d.ts.map