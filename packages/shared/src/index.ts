import { getWindow } from "./wakeLockEnv.js";

export * from "./wakeLockEnv.js";
export * from "./audio.js";
export * from "./react/index.js";

/** Default relative href from `<App>/dist/index.html` back to the monorepo root `index.html`. */
export const HOME_HREF = "../../index.html";

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
export const getHomeHref = (options?: string | HomeHrefOptions): string => {
  if (typeof options === "string") {
    return options || HOME_HREF;
  }

  if (options?.href) {
    return options.href;
  }

  const pathname = options?.pathname ?? getWindow()?.location?.pathname ?? "";
  if (/\/dist\/(?:index\.html)?$/.test(pathname)) {
    return HOME_HREF;
  }
  if (/\/dist$/.test(pathname)) {
    return pathname.replace(/\/[^/]+\/dist$/, "/index.html") || HOME_HREF;
  }

  return options?.fallback ?? HOME_HREF;
};
