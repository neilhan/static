import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useAudioEngine } from "./useAudioEngine";
import { calculateTiming } from "../morse/morseTiming";
import {
  createMorseSender,
  SenderPlayState,
  SenderCharMeta,
  SenderCallbacks as CoreSenderCallbacks,
  MorseSender,
} from "../morse/morseSender";

export type { SenderPlayState } from "../morse/morseSender";

export type SenderProgress = {
  messageIndex: number;
  charOffset: number;
  outputChar: string;
  lastOutputChar: string;
  isCharActive: boolean;
  displayMessage: string;
  doneText: string;
  remainingText: string;
};

const INITIAL_SENDER_PROGRESS: SenderProgress = {
  messageIndex: 0,
  charOffset: 0,
  outputChar: "",
  lastOutputChar: "",
  isCharActive: false,
  displayMessage: "",
  doneText: "",
  remainingText: "",
};

const formatDisplayChar = (value: string) =>
  value === " " ? "" : value.toUpperCase();

type SenderCallbacks = {
  onCharStart?: (char: string) => void;
  onCharEnd?: (char: string) => void;
  onMessageStart?: (index: number) => void;
  onFinish?: () => void;
};

export const useMorseSender = (
  wpm: number,
  fw: number,
  frequency: number,
  callbacks: SenderCallbacks = {}
) => {
  const audio = useAudioEngine(frequency);
  const [status, setStatus] = useState<SenderPlayState>("idle");
  const [senderProgress, setSenderProgress] = useState<SenderProgress>(
    INITIAL_SENDER_PROGRESS
  );

  const timingRef = useRef(calculateTiming(wpm, fw));
  useEffect(() => {
    timingRef.current = calculateTiming(wpm, fw);
  }, [wpm, fw]);

  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const senderRef = useRef<MorseSender | null>(null);
  const charOffsetsRef = useRef<number[]>([]);

  const deriveHighlightSlices = useCallback(
    (messageIndex: number, charOffset: number) => {
      const slices =
        senderRef.current?.getDisplaySlices(messageIndex, charOffset);
      if (slices) {
        return slices;
      }
      return {
        displayMessage: "",
        doneText: "",
        remainingText: "",
      };
    },
    []
  );

  const applySenderProgressUpdate = useCallback(
    (updater: (prev: SenderProgress) => SenderProgress) => {
      setSenderProgress((prev) => {
        const base = updater(prev);
        const slices = deriveHighlightSlices(base.messageIndex, base.charOffset);
        return { ...base, ...slices };
      });
    },
    [deriveHighlightSlices]
  );

  const resetSenderProgress = useCallback(
    (overrides: Partial<SenderProgress> = {}) => {
      applySenderProgressUpdate(() => ({
        ...INITIAL_SENDER_PROGRESS,
        ...overrides,
      }));
    },
    [applySenderProgressUpdate]
  );

  const mergeSenderProgress = useCallback(
    (partial: Partial<SenderProgress>) => {
      applySenderProgressUpdate((prev) => ({ ...prev, ...partial }));
    },
    [applySenderProgressUpdate]
  );

  const incrementCharOffset = useCallback((messageIndex: number, delta: number) => {
    const displayMessage =
      senderRef.current?.getDisplayMessage(messageIndex) ?? "";
    if (typeof charOffsetsRef.current[messageIndex] !== "number") {
      charOffsetsRef.current[messageIndex] = 0;
    }

    let next = charOffsetsRef.current[messageIndex] + delta;
    while (displayMessage[next] === " ") {
      next += 1;
    }
    next = Math.min(next, displayMessage.length);
    charOffsetsRef.current[messageIndex] = next;
    return next;
  }, []);

  const audioDriver = useMemo(
    () => ({
      scheduleTone: audio.scheduleTone,
      cancelScheduledValues: audio.cancelScheduledValues,
      getCurrentTime: audio.getCurrentTime,
      unsuspend: audio.unsuspend,
    }),
    [
      audio.scheduleTone,
      audio.cancelScheduledValues,
      audio.getCurrentTime,
      audio.unsuspend,
    ]
  );

  const senderCallbacks = useMemo<CoreSenderCallbacks>(
    () => ({
      onCharStart: (char: string, meta?: SenderCharMeta) => {
        if (!meta) {
          const displayChar = char ? formatDisplayChar(char) : "";
          mergeSenderProgress({
            outputChar: displayChar,
            isCharActive: displayChar !== "",
          });
          callbacksRef.current.onCharStart?.(char ?? "");
          return;
        }

        if (meta.isSpace) {
          const currentOffset = charOffsetsRef.current[meta.messageIndex] ?? 0;
          mergeSenderProgress({
            messageIndex: meta.messageIndex,
            charOffset: currentOffset,
            outputChar: "",
            isCharActive: false,
          });
          callbacksRef.current.onCharStart?.(meta.raw);
          return;
        }

        const nextOffset = incrementCharOffset(meta.messageIndex, meta.length);
        const displayChar = formatDisplayChar(meta.raw);
        mergeSenderProgress({
          messageIndex: meta.messageIndex,
          charOffset: nextOffset,
          outputChar: displayChar,
          isCharActive: true,
        });
        callbacksRef.current.onCharStart?.(meta.raw);
      },
      onCharEnd: (_char: string, meta?: SenderCharMeta) => {
        const value = meta?.raw ?? _char ?? "";
        const displayChar = formatDisplayChar(value);
        if (!meta?.isSpace && displayChar) {
          mergeSenderProgress({
            outputChar: "",
            lastOutputChar: displayChar,
            isCharActive: false,
          });
        } else {
          mergeSenderProgress({
            outputChar: "",
            isCharActive: false,
          });
        }
        callbacksRef.current.onCharEnd?.(value);
      },
      onMessageStart: (messageIndex: number) => {
        if (charOffsetsRef.current.length > messageIndex) {
          charOffsetsRef.current[messageIndex] = 0;
        }
        resetSenderProgress({ messageIndex, charOffset: 0 });
        callbacksRef.current.onMessageStart?.(messageIndex);
      },
      onFinish: () => {
        mergeSenderProgress({ outputChar: "", isCharActive: false });
        callbacksRef.current.onFinish?.();
      },
    }),
    [incrementCharOffset, mergeSenderProgress, resetSenderProgress]
  );

  const sender = useMemo(
    () =>
      createMorseSender({
        audio: audioDriver,
        getTiming: () => timingRef.current,
        callbacks: senderCallbacks,
        onStatusChange: setStatus,
      }),
    [audioDriver, senderCallbacks]
  );
  senderRef.current = sender;

  useEffect(() => {
    return () => {
      sender.cleanup();
    };
  }, [sender]);

  const loadMessages = useCallback(
    (messages: string[], startMessageIndex = 0) => {
      if (!messages || messages.length === 0) {
        charOffsetsRef.current = [];
        resetSenderProgress();
        sender.loadMessages([], 0);
        return;
      }

      charOffsetsRef.current = new Array(messages.length).fill(0);
      const safeStart = Math.max(
        0,
        Math.min(messages.length - 1, startMessageIndex)
      );
      resetSenderProgress({ messageIndex: safeStart, charOffset: 0 });
      sender.loadMessages(messages, safeStart);
    },
    [resetSenderProgress, sender]
  );

  const play = useCallback(() => {
    sender.play();
  }, [sender]);

  const pause = useCallback(() => {
    sender.pause();
  }, [sender]);

  const resume = useCallback(() => {
    sender.resume();
  }, [sender]);

  const stop = useCallback(() => {
    sender.stop();
    charOffsetsRef.current = [];
    resetSenderProgress();
  }, [resetSenderProgress, sender]);

  const skipToMessage = useCallback(
    (messageIndex: number) => {
      if (charOffsetsRef.current.length > messageIndex) {
        charOffsetsRef.current[messageIndex] = 0;
      }
      resetSenderProgress({ messageIndex, charOffset: 0 });
      sender.skipToMessage(messageIndex);
    },
    [resetSenderProgress, sender]
  );

  const rewind = useCallback(() => {
    if (charOffsetsRef.current.length > 0) {
      charOffsetsRef.current.fill(0);
    }
    resetSenderProgress();
    sender.rewind();
  }, [resetSenderProgress, sender]);

  return {
    senderPlayState: status,
    senderProgress,
    loadMessages,
    play,
    pause,
    resume,
    stop,
    skipToMessage,
    rewind,
  };
};
