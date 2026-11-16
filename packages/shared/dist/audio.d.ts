export type GestureResumeOptions = {
    /** Event target to attach gesture listeners to (defaults to `document`). */
    target?: EventTarget;
    /** DOM events treated as user activation gestures (defaults to `["click", "touchstart", "keydown"]`). */
    events?: readonly string[];
    /** Invoked when an AudioContext reaches the `"running"` state. */
    onResume?: (context: AudioContext) => void;
    /** Invoked if `context.resume()` rejects. */
    onError?: (error: unknown) => void;
};
/** Creates a new `AudioContext` (with `webkitAudioContext` fallback), or returns `null` outside a browser. */
export declare const createAudioContext: () => AudioContext | null;
/**
 * Returns an active `AudioContext`, creating a shared instance when none is supplied,
 * and triggers `resume()` if the context is currently `"suspended"`.
 */
export declare const getOrResumeAudioContext: (existingContext?: AudioContext | null) => AudioContext | null;
/**
 * Attaches user-gesture listeners (`click`, `touchstart`, `keydown` by default) to resume
 * a suspended `AudioContext`, cleaning up automatically once running. Returns a teardown function.
 */
export declare const resumeAudioContextOnGesture: (contextOrGetter?: AudioContext | (() => AudioContext | null) | null, options?: GestureResumeOptions) => (() => void);
//# sourceMappingURL=audio.d.ts.map