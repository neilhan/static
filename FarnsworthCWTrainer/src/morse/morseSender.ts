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

const EVENT_TICK_MS = 50;
const TIME_EPSILON = 0.0005;

type ToneInstruction = {
  offset: number;
  duration: number;
};

type CharSchedule = {
  tokenIndex: number;
  startOffset: number;
  duration: number;
  instructions: ToneInstruction[];
};

type MessageStartEvent = {
  type: "messageStart";
  timeOffset: number;
  messageIndex: number;
};

type GapStartEvent = {
  type: "gapStart";
  timeOffset: number;
  tokenIndex: number;
  token: GapToken;
};

type CharEvent = {
  type: "charStart" | "charEnd";
  timeOffset: number;
  tokenIndex: number;
  displayChar: string;
  meta: SenderCharMeta;
};

type TokenAdvanceEvent = {
  type: "tokenAdvance";
  timeOffset: number;
  tokenIndex: number;
};

type FinishEvent = {
  type: "finish";
  timeOffset: number;
};

type PlaybackEvent =
  | MessageStartEvent
  | GapStartEvent
  | CharEvent
  | TokenAdvanceEvent
  | FinishEvent;

type PlaybackPlan = {
  events: PlaybackEvent[];
  charSchedules: CharSchedule[];
};

const buildCharInstructions = (
  token: CharToken,
  timing: Timing
): { instructions: ToneInstruction[]; duration: number } => {
  const instructions: ToneInstruction[] = [];
  let cursor = 0;
  const morse = getMorseSequence(token.raw);

  if (morse && morse.length > 0) {
    for (let i = 0; i < morse.length; i++) {
      const symbol = morse[i];
      const width = symbol === "." ? timing.dotWidth : timing.dashWidth;
      instructions.push({ offset: cursor, duration: width });
      cursor += width + ELEMENT_RAMP;
      if (i < morse.length - 1) {
        cursor += timing.dotWidth;
      }
    }
  } else {
    cursor += timing.dotWidth;
  }

  return { instructions, duration: cursor };
};

const buildPlaybackPlan = (
  tokenList: Token[],
  startIndex: number,
  timing: Timing,
  currentMessageIndex: number | null
): PlaybackPlan | null => {
  if (startIndex >= tokenList.length) {
    return null;
  }

  const events: PlaybackEvent[] = [];
  const charSchedules: CharSchedule[] = [];
  let cursor = 0;
  let messageTracker = currentMessageIndex;

  for (let idx = startIndex; idx < tokenList.length; idx++) {
    const token = tokenList[idx];

    if (token.messageIndex !== messageTracker) {
      events.push({
        type: "messageStart",
        timeOffset: cursor,
        messageIndex: token.messageIndex,
      });
      messageTracker = token.messageIndex;
    }

    if (token.kind === "gap") {
      events.push({
        type: "gapStart",
        timeOffset: cursor,
        tokenIndex: idx,
        token,
      });
      const duration = token.gap === "lead" ? MESSAGE_LEAD : MESSAGE_TAIL;
      cursor += duration;
      events.push({
        type: "tokenAdvance",
        timeOffset: cursor,
        tokenIndex: idx,
      });
      continue;
    }

    if (token.kind === "space") {
      const displayChar = " ";
      const meta: SenderCharMeta = {
        messageIndex: token.messageIndex,
        length: 0,
        isSpace: true,
        raw: " ",
      };
      events.push({
        type: "charStart",
        timeOffset: cursor,
        tokenIndex: idx,
        displayChar,
        meta,
      });
      cursor += timing.wordSpace;
      events.push({
        type: "charEnd",
        timeOffset: cursor,
        tokenIndex: idx,
        displayChar,
        meta,
      });
      events.push({
        type: "tokenAdvance",
        timeOffset: cursor,
        tokenIndex: idx,
      });
      continue;
    }

    const displayChar = token.display === " " ? "" : token.display.toUpperCase();
    const meta: SenderCharMeta = {
      messageIndex: token.messageIndex,
      length: token.display.length,
      isSpace: false,
      raw: token.display,
    };
    const charStart = cursor;
    events.push({
      type: "charStart",
      timeOffset: charStart,
      tokenIndex: idx,
      displayChar,
      meta,
    });
    const { instructions, duration } = buildCharInstructions(token, timing);
    charSchedules.push({
      tokenIndex: idx,
      startOffset: charStart,
      duration,
      instructions,
    });
    cursor += duration;
    events.push({
      type: "charEnd",
      timeOffset: cursor,
      tokenIndex: idx,
      displayChar,
      meta,
    });
    events.push({
      type: "tokenAdvance",
      timeOffset: cursor,
      tokenIndex: idx,
    });

    if (token.addCharSpace && timing.charSpace > 0) {
      cursor += timing.charSpace;
    }
  }

  events.push({ type: "finish", timeOffset: cursor });
  return { events, charSchedules };
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
  let lastMessageIndex: number | null = null;
  let activeToken: {
    token: Token | null;
    tokenIndex: number;
    displayChar?: string;
    meta?: SenderCharMeta;
  } = {
    token: null,
    tokenIndex: -1,
  };
  let status: SenderPlayState = "idle";
  let playbackPlan: PlaybackPlan | null = null;
  let planAnchorTime: number | null = null;
  let nextEventIndex = 0;
  let intervalId: number | null = null;

  const updateStatus = (next: SenderPlayState) => {
    status = next;
    onStatusChange?.(next);
  };

  const stopEventLoop = () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };

  const clearPlaybackPlan = () => {
    stopEventLoop();
    playbackPlan = null;
    planAnchorTime = null;
    nextEventIndex = 0;
  };

  const schedulePlanAudio = (plan: PlaybackPlan, anchor: number) => {
    plan.charSchedules.forEach(({ startOffset, instructions }) => {
      const baseStart = anchor + startOffset;
      instructions.forEach(({ offset, duration }) => {
        audio.scheduleTone(baseStart + offset, duration);
      });
    });
  };

  const processDueEvents = (targetTime: number) => {
    if (!playbackPlan || planAnchorTime === null) {
      return;
    }
    const elapsed = targetTime - planAnchorTime;
    if (elapsed < -TIME_EPSILON) {
      return;
    }

    while (nextEventIndex < playbackPlan.events.length) {
      const event = playbackPlan.events[nextEventIndex];
      if (event.timeOffset - elapsed > TIME_EPSILON) {
        break;
      }
      runPlaybackEvent(event);
      nextEventIndex += 1;
      if (event.type === "finish") {
        break;
      }
    }
  };

  const ensureEventLoop = () => {
    if (intervalId !== null) {
      return;
    }
    intervalId = window.setInterval(() => {
      processDueEvents(audio.getCurrentTime());
    }, EVENT_TICK_MS);
  };

  const completeActiveToken = () => {
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

    tokenIndex = Math.max(tokenIndex, activeToken.tokenIndex + 1);
    activeToken = { token: null, tokenIndex: -1 };
  };

  const finalizePlayback = () => {
    clearPlaybackPlan();
    activeToken = { token: null, tokenIndex: -1 };
    tokenIndex = tokens.length;
    lastMessageIndex = null;
    if (status !== "idle") {
      updateStatus("idle");
    }
    callbacks.onFinish?.();
  };

  const runPlaybackEvent = (event: PlaybackEvent) => {
    switch (event.type) {
      case "messageStart":
        lastMessageIndex = event.messageIndex;
        callbacks.onMessageStart?.(event.messageIndex);
        break;
      case "gapStart":
        activeToken = { token: event.token, tokenIndex: event.tokenIndex };
        break;
      case "charStart":
        activeToken = {
          token: tokens[event.tokenIndex],
          tokenIndex: event.tokenIndex,
          displayChar: event.displayChar,
          meta: event.meta,
        };
        callbacks.onCharStart?.(event.displayChar, event.meta);
        break;
      case "charEnd":
        callbacks.onCharEnd?.(event.displayChar, event.meta);
        activeToken = { token: null, tokenIndex: event.tokenIndex };
        break;
      case "tokenAdvance":
        tokenIndex = event.tokenIndex + 1;
        if (
          activeToken.token &&
          activeToken.tokenIndex === event.tokenIndex
        ) {
          activeToken = { token: null, tokenIndex: event.tokenIndex };
        }
        break;
      case "finish":
        finalizePlayback();
        break;
    }
  };

  const syncToCurrentTime = () => {
    if (status !== "playing") {
      return;
    }
    processDueEvents(audio.getCurrentTime());
  };

  const startPlayback = () => {
    if (!tokens.length || tokenIndex >= tokens.length) {
      return;
    }
    const timing = getTiming();
    const plan = buildPlaybackPlan(tokens, tokenIndex, timing, lastMessageIndex);
    if (!plan) {
      return;
    }

    playbackPlan = plan;
    const planStart = audio.getCurrentTime();
    const audioStart = planStart + TOKEN_START_DELAY;
    planAnchorTime = planStart;
    nextEventIndex = 0;
    activeToken = { token: null, tokenIndex: -1 };
    schedulePlanAudio(plan, audioStart);
    updateStatus("playing");
    ensureEventLoop();
    processDueEvents(planAnchorTime + TIME_EPSILON);
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
    activeToken = { token: null, tokenIndex: -1 };
    lastMessageIndex = null;
  };

  const loadMessages = (messages: string[], startMessageIndex = 0) => {
    clearPlaybackPlan();
    audio.cancelScheduledValues(audio.getCurrentTime());

    if (!messages || messages.length === 0) {
      tokens = [];
      displayMessages = [];
      tokenIndex = 0;
      lastMessageIndex = null;
      activeToken = { token: null, tokenIndex: -1 };
      updateStatus("idle");
      return;
    }

    const artifacts = buildMessageArtifacts(messages);
    tokens = artifacts.tokens;
    displayMessages = artifacts.displayMessages;
    tokenIndex = 0;
    lastMessageIndex = null;
    activeToken = { token: null, tokenIndex: -1 };

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
    clearPlaybackPlan();
    audio.cancelScheduledValues(audio.getCurrentTime());

    startPlayback();
  };

  const resume = () => {
    if (status !== "paused") {
      return;
    }
    audio.unsuspend();
    clearPlaybackPlan();
    audio.cancelScheduledValues(audio.getCurrentTime());
    startPlayback();
  };

  const pause = () => {
    if (status !== "playing") {
      return;
    }
    syncToCurrentTime();
    clearPlaybackPlan();
    audio.cancelScheduledValues(audio.getCurrentTime());
    completeActiveToken();
    updateStatus("paused");
  };

  const stop = () => {
    clearPlaybackPlan();
    audio.cancelScheduledValues(audio.getCurrentTime());
    tokens = [];
    displayMessages = [];
    tokenIndex = 0;
    lastMessageIndex = null;
    activeToken = { token: null, tokenIndex: -1 };
    updateStatus("idle");
  };

  const skipToMessage = (messageIndex: number) => {
    if (tokens.length === 0) {
      return;
    }
    syncToCurrentTime();
    clearPlaybackPlan();
    seekToMessage(messageIndex);
    if (status === "playing") {
      audio.cancelScheduledValues(audio.getCurrentTime());
      startPlayback();
    }
  };

  const rewind = () => {
    syncToCurrentTime();
    clearPlaybackPlan();
    audio.cancelScheduledValues(audio.getCurrentTime());
    tokenIndex = 0;
    lastMessageIndex = null;
    activeToken = { token: null, tokenIndex: -1 };
    updateStatus("paused");
  };

  const cleanup = () => {
    clearPlaybackPlan();
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


