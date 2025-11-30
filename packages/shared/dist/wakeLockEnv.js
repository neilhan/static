const MOBILE_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const safeNavigator = () => typeof navigator === "undefined" ? undefined : navigator;
const safeDocument = () => typeof document === "undefined" ? undefined : document;
const safeWindow = () => typeof window === "undefined" ? undefined : window;
export const isBrowserEnv = () => Boolean(safeWindow()) && Boolean(safeDocument());
export const isMobileDevice = (source = safeNavigator()) => {
    if (!source) {
        return false;
    }
    const userAgent = source.userAgent || source.vendor || "";
    return MOBILE_REGEX.test(userAgent);
};
export const supportsWakeLock = (source = safeNavigator()) => Boolean(source && "wakeLock" in source);
export const getNavigatorWithWakeLock = () => {
    const nav = safeNavigator();
    if (!nav) {
        return undefined;
    }
    return nav;
};
export const getDocument = () => safeDocument();
export const getWindow = () => safeWindow();
