export type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinel>;
  };
};

const MOBILE_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

const safeNavigator = (): Navigator | undefined =>
  typeof navigator === "undefined" ? undefined : navigator;

const safeDocument = (): Document | undefined =>
  typeof document === "undefined" ? undefined : document;

const safeWindow = (): Window | undefined =>
  typeof window === "undefined" ? undefined : window;

export const isBrowserEnv = (): boolean =>
  Boolean(safeWindow()) && Boolean(safeDocument());

export const isMobileDevice = (source = safeNavigator()): boolean => {
  if (!source) {
    return false;
  }
  const userAgent =
    source.userAgent || (source as typeof navigator & { vendor?: string }).vendor || "";
  return MOBILE_REGEX.test(userAgent);
};

export const supportsWakeLock = (source = safeNavigator()): boolean =>
  Boolean(source && "wakeLock" in source);

export const getNavigatorWithWakeLock = (): WakeLockNavigator | undefined => {
  const nav = safeNavigator();
  if (!nav) {
    return undefined;
  }
  return nav as WakeLockNavigator;
};

export const getDocument = (): Document | undefined => safeDocument();

export const getWindow = (): Window | undefined => safeWindow();

