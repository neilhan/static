export type WakeLockNavigator = Navigator & {
    wakeLock?: {
        request: (type: "screen") => Promise<WakeLockSentinel>;
    };
};
export declare const isBrowserEnv: () => boolean;
export declare const isMobileDevice: (source?: Navigator | undefined) => boolean;
export declare const supportsWakeLock: (source?: Navigator | undefined) => boolean;
export declare const getNavigatorWithWakeLock: () => WakeLockNavigator | undefined;
export declare const getDocument: () => Document | undefined;
export declare const getWindow: () => Window | undefined;
//# sourceMappingURL=wakeLockEnv.d.ts.map