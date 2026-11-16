import { getDocument, getWindow } from "./wakeLockEnv.js";

type WindowWithWebkitAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

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

let sharedAudioContext: AudioContext | null = null;

/** Creates a new `AudioContext` (with `webkitAudioContext` fallback), or returns `null` outside a browser. */
export const createAudioContext = (): AudioContext | null => {
  const win = getWindow() as WindowWithWebkitAudio | undefined;
  if (!win) {
    return null;
  }

  const AudioContextClass = win.AudioContext || win.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  try {
    return new AudioContextClass();
  } catch {
    return null;
  }
};

/**
 * Returns an active `AudioContext`, creating a shared instance when none is supplied,
 * and triggers `resume()` if the context is currently `"suspended"`.
 */
export const getOrResumeAudioContext = (
  existingContext?: AudioContext | null
): AudioContext | null => {
  let ctx: AudioContext | null = existingContext ?? null;

  if (!ctx) {
    if (!sharedAudioContext || sharedAudioContext.state === "closed") {
      sharedAudioContext = createAudioContext();
    }
    ctx = sharedAudioContext;
  }

  if (!ctx || ctx.state === "closed") {
    return null;
  }

  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => {
      // Browsers reject resume() prior to user activation; pair with resumeAudioContextOnGesture.
    });
  }

  return ctx;
};

/**
 * Attaches user-gesture listeners (`click`, `touchstart`, `keydown` by default) to resume
 * a suspended `AudioContext`, cleaning up automatically once running. Returns a teardown function.
 */
export const resumeAudioContextOnGesture = (
  contextOrGetter?: AudioContext | (() => AudioContext | null) | null,
  options: GestureResumeOptions = {}
): (() => void) => {
  const target = options.target ?? getDocument();
  if (!target) {
    return () => {};
  }

  const events = options.events ?? ["click", "touchstart", "keydown"];
  let cleanedUp = false;

  const cleanup = () => {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    for (const eventName of events) {
      target.removeEventListener(eventName, handleGesture);
    }
  };

  const resolveContext = (): AudioContext | null => {
    if (typeof contextOrGetter === "function") {
      return contextOrGetter();
    }
    return contextOrGetter ?? getOrResumeAudioContext();
  };

  const handleGesture = () => {
    const ctx = resolveContext();
    if (!ctx || ctx.state === "closed") {
      return;
    }

    if (ctx.state === "running") {
      cleanup();
      options.onResume?.(ctx);
      return;
    }

    if (ctx.state === "suspended") {
      ctx
        .resume()
        .then(() => {
          if (cleanedUp) {
            return;
          }
          cleanup();
          options.onResume?.(ctx);
        })
        .catch((error: unknown) => {
          if (!cleanedUp) {
            options.onError?.(error);
          }
        });
    }
  };

  for (const eventName of events) {
    target.addEventListener(eventName, handleGesture, { passive: true });
  }

  return cleanup;
};
