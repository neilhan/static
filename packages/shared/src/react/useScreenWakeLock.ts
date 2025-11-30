import { useCallback, useEffect, useRef } from "react";
import {
  getDocument,
  getNavigatorWithWakeLock,
  getWindow,
  isBrowserEnv,
  isMobileDevice,
  supportsWakeLock,
  type WakeLockNavigator,
} from "../wakeLockEnv";

const defaultEnvSnapshot = () => ({
  envReady: isBrowserEnv(),
  isMobile: isMobileDevice(),
  wakeLockSupported: supportsWakeLock(),
});

export const useScreenWakeLock = (shouldHold: boolean): void => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const shouldHoldRef = useRef<boolean>(shouldHold);
  const envSnapshotRef = useRef(defaultEnvSnapshot());

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
    const { envReady, wakeLockSupported } = envSnapshotRef.current;
    if (wakeLockRef.current || !envReady || !wakeLockSupported) {
      return;
    }

    const navWithWakeLock = getNavigatorWithWakeLock();
    if (!navWithWakeLock) {
      return;
    }

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
    const { envReady, isMobile, wakeLockSupported } = envSnapshotRef.current;
    if (!envReady || !isMobile || !wakeLockSupported) {
      void releaseWakeLock();
      return;
    }

    if (!shouldHold) {
      void releaseWakeLock();
      return;
    }

    let cancelled = false;

    const ensureWakeLock = () => {
      if (!cancelled) {
        void requestWakeLock();
      }
    };

    const handleVisibility = () => {
      const doc = getDocument();
      if (doc?.visibilityState === "visible" && shouldHoldRef.current) {
        ensureWakeLock();
      } else {
        void releaseWakeLock();
      }
    };

    const win = getWindow();
    const doc = getDocument();

    ensureWakeLock();

    doc?.addEventListener("visibilitychange", handleVisibility);
    win?.addEventListener("pagehide", releaseWakeLock);
    win?.addEventListener("beforeunload", releaseWakeLock);

    return () => {
      cancelled = true;
      doc?.removeEventListener("visibilitychange", handleVisibility);
      win?.removeEventListener("pagehide", releaseWakeLock);
      win?.removeEventListener("beforeunload", releaseWakeLock);
      void releaseWakeLock();
    };
  }, [releaseWakeLock, requestWakeLock, shouldHold]);
};

export type { WakeLockNavigator };

