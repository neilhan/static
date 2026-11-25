const SAMPLE_RATE = 8000;
const DURATION_SECONDS = 0.5;

const createSilentWavBlob = (): Blob => {
  const numSamples = Math.floor(SAMPLE_RATE * DURATION_SECONDS);
  const dataSize = numSamples * 2; // 16-bit mono PCM
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  // Remaining bytes are already 0 (16-bit signed PCM silence)

  return new Blob([buffer], { type: 'audio/wav' });
};

export type SilentAudioKeepAlive = {
  start: () => void;
  stop: () => void;
  dispose: () => void;
};

/**
 * Plays a looping silent WAV via HTMLAudioElement to help keep mobile PWAs
 * active when the screen locks or dims. Must be started from a user gesture.
 */
export const createSilentAudioKeepAlive = (): SilentAudioKeepAlive => {
  let audio: HTMLAudioElement | null = null;
  let objectUrl: string | null = null;

  const ensureAudio = (): HTMLAudioElement | null => {
    if (audio) return audio;
    if (
      typeof window === 'undefined' ||
      typeof Audio === 'undefined' ||
      typeof URL === 'undefined' ||
      typeof URL.createObjectURL !== 'function'
    ) {
      return null;
    }

    try {
      objectUrl = URL.createObjectURL(createSilentWavBlob());
      const el = new Audio(objectUrl);
      el.loop = true;
      el.setAttribute('playsinline', '');
      audio = el;
      return el;
    } catch {
      return null;
    }
  };

  return {
    start: () => {
      const el = ensureAudio();
      if (!el) return;
      try {
        const playPromise = el.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            // Autoplay blocked outside user gesture; ignore silently
          });
        }
      } catch {
        // Ignore playback errors
      }
    },
    stop: () => {
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // Ignore pause errors
      }
    },
    dispose: () => {
      if (audio) {
        try {
          audio.pause();
          audio.removeAttribute('src');
        } catch {
          // Ignore cleanup errors
        }
        audio = null;
      }
      if (objectUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    },
  };
};
