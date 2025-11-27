import { useCallback, useEffect, useRef } from "react";

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinel>;
  };
};

const MOBILE_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

const isMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }
  const source = navigator.userAgent || navigator.vendor || "";
  return MOBILE_REGEX.test(source);
};

const supportsWakeLock = (): boolean =>
  typeof navigator !== "undefined" && "wakeLock" in navigator;

const isBrowserEnv = (): boolean =>
  typeof window !== "undefined" && typeof document !== "undefined";

export const useScreenWakeLock = (shouldHold: boolean): void => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const shouldHoldRef = useRef<boolean>(shouldHold);
  const envReadyRef = useRef<boolean>(isBrowserEnv());
  const mobileRef = useRef<boolean>(isMobileDevice());
  const wakeLockSupportedRef = useRef<boolean>(supportsWakeLock());

  useEffect(() => {
    shouldHoldRef.current = shouldHold;
  }, [shouldHold]);

  const handleSentinelRelease = useCallback(() => {
    wakeLockRef.current = null;
  }, []);

  const releaseWakeLock = useCallback(async () => {
    const sentinel = wakeLockRef.current;
    if (!sentinel) {
      return;
    }
    wakeLockRef.current = null;
    sentinel.removeEventListener("release", handleSentinelRelease);
    try {
      await sentinel.release();
    } catch {
      // Ignore release failures; the browser already dropped the lock.
    }
  }, [handleSentinelRelease]);

  const requestWakeLock = useCallback(async () => {
    if (
      wakeLockRef.current ||
      !envReadyRef.current ||
      !wakeLockSupportedRef.current
    ) {
      return;
    }

    const navWithWakeLock = navigator as WakeLockNavigator;
    try {
      const sentinel = await navWithWakeLock.wakeLock?.request("screen");
      if (!sentinel) {
        return;
      }
      wakeLockRef.current = sentinel;
      sentinel.addEventListener("release", handleSentinelRelease);
    } catch {
      // Request failures usually mean the browser rejected the lock request.
      wakeLockRef.current = null;
    }
  }, [handleSentinelRelease]);

  useEffect(() => {
    if (
      !envReadyRef.current ||
      !mobileRef.current ||
      !wakeLockSupportedRef.current
    ) {
      releaseWakeLock();
      return;
    }

    if (!shouldHold) {
      releaseWakeLock();
      return;
    }

    let cancelled = false;

    const ensureWakeLock = () => {
      if (!cancelled) {
        void requestWakeLock();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && shouldHoldRef.current) {
        ensureWakeLock();
      } else {
        void releaseWakeLock();
      }
    };

    ensureWakeLock();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", releaseWakeLock);
    window.addEventListener("beforeunload", releaseWakeLock);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", releaseWakeLock);
      window.removeEventListener("beforeunload", releaseWakeLock);
      void releaseWakeLock();
    };
  }, [releaseWakeLock, requestWakeLock, shouldHold]);
};

