import { getWindow } from "./wakeLockEnv.js";
export * from "./wakeLockEnv.js";
export * from "./audio.js";
export * from "./react/index.js";
/** Default relative href from `<App>/dist/index.html` back to the monorepo root `index.html`. */
export const HOME_HREF = "../../index.html";
/**
 * Resolves the navigation target for the monorepo home page without hardcoding a deployment origin.
 * In `<App>/dist/index.html` static builds this resolves to `../../index.html` (or the root `index.html`).
 */
export const getHomeHref = (options) => {
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
