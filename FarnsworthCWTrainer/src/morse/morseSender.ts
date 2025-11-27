import { getMorseSequence } from "./morseTiming";

export type SenderPlayState = "idle" | "playing" | "paused";

type GapToken = { kind: "gap"; messageIndex: number; gap: "lead" | "tail" };
type SpaceToken = { kind: "space"; messageIndex: number };
type CharToken = {
  kind: "char";
  messageIndex: number;
  raw: string;
  display: string;
  addCharSpace: boolean;
};
type Token = GapToken | SpaceToken | CharToken;

export type DisplaySlices = {
  displayMessage: string;
  doneText: string;
  remainingText: string;
};

export type SenderCharMeta = {
  messageIndex: number;
  length: number;
  isSpace: boolean;
  raw: string;
};

const MESSAGE_LEAD = 0.5;
const MESSAGE_TAIL = 1.0;
const TOKEN_START_DELAY = 0.02;
const ELEMENT_RAMP = 0.005;

const buildMessageArtifacts = (messages: string[]) => {
  const tokens: Token[] = [];
  const displayMessages: string[] = [];
  messages.forEach((message, messageIndex) => {
    tokens.push({ kind: "gap", messageIndex, gap: "lead" });

    let i = 0;
    const displayParts: string[] = [];
    while (i < message.length) {
      const char = message[i];

      if (char === " ") {
        tokens.push({ kind: "space", messageIndex });
        displayParts.push(" ");
        i += 1;
        continue;
      }

      if (char === "@") {
        let j = i + 1;
        while (j < message.length && message[j] !== " ") {
          j++;
        }
        const prosign = message.slice(i, j);
        const display = prosign.slice(1);
        const nextChar = message[j];
        const addCharSpace = !!nextChar && nextChar !== " ";

        tokens.push({
          kind: "char",
          messageIndex,
          raw: prosign,
          display,
          addCharSpace,
        });
        displayParts.push(display);
        i = j;
        continue;
      }

      const nextChar = message[i + 1];
      const addCharSpace = !!nextChar && nextChar !== " ";

      tokens.push({
        kind: "char",
        messageIndex,
        raw: char,
        display: char,
        addCharSpace,
      });
      displayParts.push(char);
      i += 1;
    }

    tokens.push({ kind: "gap", messageIndex, gap: "tail" });
    displayMessages[messageIndex] = displayParts.join("");
  });
  return { tokens, displayMessages };
};

type Timing = {
  dotWidth: number;
  dashWidth: number;
  charSpace: number;
  wordSpace: number;
};

export type AudioDriver = {
  scheduleTone: (startTime: number, duration: number) => void;
  cancelScheduledValues: (time: number) => void;
  getCurrentTime: () => number;
  unsuspend: () => void;
};

type TimingAccessor = () => Timing;

export type SenderCallbacks = {
  onCharStart?: (char: string, meta?: SenderCharMeta) => void;
  onCharEnd?: (char: string, meta?: SenderCharMeta) => void;
  onMessageStart?: (index: number) => void;
  onFinish?: () => void;
};

export type MorseSender = {
  loadMessages: (messages: string[], startMessageIndex?: number) => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skipToMessage: (messageIndex: number) => void;
  rewind: () => void;
  cleanup: () => void;
  getStatus: () => SenderPlayState;
  getDisplayMessages: () => string[];
  getDisplayMessage: (messageIndex: number) => string;
  getDisplaySlices: (messageIndex: number, charOffset: number) => DisplaySlices;
};

type SenderDependencies = {
  audio: AudioDriver;
  getTiming: TimingAccessor;
  callbacks: SenderCallbacks;
  onStatusChange?: (status: SenderPlayState) => void;
};

export const createMorseSender = ({
  audio,
  getTiming,
  callbacks,
  onStatusChange,
}: SenderDependencies): MorseSender => {
  let tokens: Token[] = [];
  let displayMessages: string[] = [];
  let tokenIndex = 0;
  let pendingTimeout: number | null = null;
  let lastMessageIndex: number | null = null;
  let activeToken: {
    token: Token | null;
    displayChar?: string;
    meta?: SenderCharMeta;
  } = {
    token: null,
  };
  let status: SenderPlayState = "idle";

  const updateStatus = (next: SenderPlayState) => {
    status = next;
    onStatusChange?.(next);
  };

  const clearPendingTimeout = () => {
    if (pendingTimeout !== null) {
      window.clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }
  };

  const completeActiveToken = (advanceIndex: boolean) => {
    const active = activeToken.token;
    if (!active) {
      return;
    }

    if (active.kind === "char") {
      const displayChar =
        activeToken.displayChar ??
        (active.display === " " ? "" : active.display.toUpperCase());
      callbacks.onCharEnd?.(displayChar, activeToken.meta);
    } else if (active.kind === "space") {
      const displayChar = activeToken.displayChar ?? " ";
      callbacks.onCharEnd?.(displayChar, activeToken.meta);
    }

    activeToken = { token: null };
    if (advanceIndex) {
      tokenIndex += 1;
    }
  };

  const scheduleCharToken = (token: CharToken): number => {
    const timing = getTiming();
    const startTime = audio.getCurrentTime() + TOKEN_START_DELAY;
    let cursor = startTime;
    const morse = getMorseSequence(token.raw);

    if (morse && morse.length > 0) {
      for (let i = 0; i < morse.length; i++) {
        const symbol = morse[i];
        const width = symbol === "." ? timing.dotWidth : timing.dashWidth;
        audio.scheduleTone(cursor, width);
        cursor += width + ELEMENT_RAMP;
        if (i < morse.length - 1) {
          cursor += timing.dotWidth;
        }
      }
    } else {
      cursor += timing.dotWidth;
    }

    return cursor - startTime;
  };

  const seekToMessage = (messageIndex: number) => {
    if (tokens.length === 0) {
      return;
    }

    const nextIndex = tokens.findIndex(
      (token) =>
        (token.kind === "gap" &&
          token.gap === "lead" &&
          token.messageIndex >= messageIndex) ||
        token.messageIndex >= messageIndex
    );

    tokenIndex = nextIndex === -1 ? tokens.length : nextIndex;
    activeToken = { token: null };
    lastMessageIndex = null;
  };

  const scheduleNextToken = () => {
    if (status !== "playing") {
      return;
    }

    if (tokenIndex >= tokens.length) {
      updateStatus("idle");
      callbacks.onFinish?.();
      return;
    }

    const token = tokens[tokenIndex];
    activeToken = { token };

    if (lastMessageIndex !== token.messageIndex) {
      lastMessageIndex = token.messageIndex;
      callbacks.onMessageStart?.(token.messageIndex);
    }

    if (token.kind === "gap") {
      const duration = token.gap === "lead" ? MESSAGE_LEAD : MESSAGE_TAIL;
      pendingTimeout = window.setTimeout(() => {
        pendingTimeout = null;
        completeActiveToken(true);
        scheduleNextToken();
      }, duration * 1000);
      return;
    }

    if (token.kind === "space") {
      const duration = getTiming().wordSpace;
      const displayChar = " ";
      const meta: SenderCharMeta = {
        messageIndex: token.messageIndex,
        length: 0,
        isSpace: true,
        raw: " ",
      };
      activeToken = { token, displayChar, meta };
      callbacks.onCharStart?.(displayChar, meta);
      pendingTimeout = window.setTimeout(() => {
        completeActiveToken(true);
        pendingTimeout = null;
        scheduleNextToken();
      }, duration * 1000);
      return;
    }

    const displayChar =
      token.display === " " ? "" : token.display.toUpperCase();
    const meta: SenderCharMeta = {
      messageIndex: token.messageIndex,
      length: token.display.length,
      isSpace: false,
      raw: token.display,
    };
    activeToken = { token, displayChar, meta };
    const toneDuration = scheduleCharToken(token);
    callbacks.onCharStart?.(displayChar, meta);
    pendingTimeout = window.setTimeout(() => {
      pendingTimeout = null;
      completeActiveToken(true);

      if (token.addCharSpace) {
        const spacingDuration = getTiming().charSpace;
        if (spacingDuration > 0) {
          pendingTimeout = window.setTimeout(() => {
            pendingTimeout = null;
            scheduleNextToken();
          }, spacingDuration * 1000);
          return;
        }
      }

      scheduleNextToken();
    }, toneDuration * 1000);
  };

  const loadMessages = (messages: string[], startMessageIndex = 0) => {
    clearPendingTimeout();
    audio.cancelScheduledValues(audio.getCurrentTime());

    if (!messages || messages.length === 0) {
      tokens = [];
      displayMessages = [];
      tokenIndex = 0;
      lastMessageIndex = null;
      activeToken = { token: null };
      updateStatus("idle");
      return;
    }

    const artifacts = buildMessageArtifacts(messages);
    tokens = artifacts.tokens;
    displayMessages = artifacts.displayMessages;
    tokenIndex = 0;
    lastMessageIndex = null;
    activeToken = { token: null };

    const safeStartIndex = Math.max(
      0,
      Math.min(messages.length - 1, startMessageIndex)
    );
    seekToMessage(safeStartIndex);
    updateStatus("idle");
  };

  const play = () => {
    if (!tokens || tokens.length === 0) {
      return;
    }

    audio.unsuspend();
    clearPendingTimeout();
    audio.cancelScheduledValues(audio.getCurrentTime());

    updateStatus("playing");
    scheduleNextToken();
  };

  const resume = () => {
    if (status !== "paused") {
      return;
    }
    audio.unsuspend();
    clearPendingTimeout();
    audio.cancelScheduledValues(audio.getCurrentTime());
    updateStatus("playing");
    scheduleNextToken();
  };

  const pause = () => {
    if (status !== "playing") {
      return;
    }
    clearPendingTimeout();
    audio.cancelScheduledValues(audio.getCurrentTime());
    completeActiveToken(true);
    updateStatus("paused");
  };

  const stop = () => {
    clearPendingTimeout();
    audio.cancelScheduledValues(audio.getCurrentTime());
    tokens = [];
    displayMessages = [];
    tokenIndex = 0;
    lastMessageIndex = null;
    activeToken = { token: null };
    updateStatus("idle");
  };

  const skipToMessage = (messageIndex: number) => {
    if (tokens.length === 0) {
      return;
    }
    seekToMessage(messageIndex);
    if (status === "playing") {
      clearPendingTimeout();
      audio.cancelScheduledValues(audio.getCurrentTime());
      scheduleNextToken();
    }
  };

  const rewind = () => {
    clearPendingTimeout();
    audio.cancelScheduledValues(audio.getCurrentTime());
    tokenIndex = 0;
    lastMessageIndex = null;
    activeToken = { token: null };
    updateStatus("paused");
  };

  const cleanup = () => {
    clearPendingTimeout();
  };

  const getStatus = () => status;

  const getDisplayMessages = () => displayMessages.slice();
  const getDisplayMessage = (messageIndex: number) =>
    displayMessages[messageIndex] ?? "";
  const getDisplaySlices = (
    messageIndex: number,
    charOffset: number
  ): DisplaySlices => {
    const message = getDisplayMessage(messageIndex);
    const safeOffset = Math.max(0, Math.min(charOffset, message.length));
    return {
      displayMessage: message,
      doneText: message.slice(0, safeOffset),
      remainingText: message.slice(safeOffset),
    };
  };

  return {
    loadMessages,
    play,
    pause,
    resume,
    stop,
    skipToMessage,
    rewind,
    cleanup,
    getStatus,
    getDisplayMessages,
    getDisplayMessage,
    getDisplaySlices,
  };
};


