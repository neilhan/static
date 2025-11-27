import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AudioDriver,
  createMorseSender,
  DisplaySlices,
  SenderCallbacks,
  SenderCharMeta,
  SenderPlayState,
} from "../morseSender";

const timing = {
  dotWidth: 0.08,
  dashWidth: 0.24,
  charSpace: 0.12,
  wordSpace: 0.56,
};

const createAudioDriver = () => {
  let now = 0;
  const driver: AudioDriver = {
    scheduleTone: vi.fn<(startTime: number, duration: number) => void>(),
    cancelScheduledValues: vi.fn<(time: number) => void>(),
    getCurrentTime: vi.fn(() => now),
    unsuspend: vi.fn(),
  };

  return {
    driver,
    advance: (amount: number) => {
      now += amount;
    },
  };
};

const createCallbacks = (): Required<SenderCallbacks> => ({
  onCharStart: vi.fn<[string, SenderCharMeta?], void>(),
  onCharEnd: vi.fn<[string, SenderCharMeta?], void>(),
  onMessageStart: vi.fn<[number], void>(),
  onFinish: vi.fn<[], void>(),
});

const createSender = () => {
  const callbacks = createCallbacks();
  const statusChanges = vi.fn<[SenderPlayState], void>();
  const audioHarness = createAudioDriver();
  const sender = createMorseSender({
    audio: audioHarness.driver,
    getTiming: () => timing,
    callbacks,
    onStatusChange: statusChanges,
  });
  return { sender, callbacks, statusChanges, audioHarness };
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("createMorseSender", () => {
  it("plays queued characters sequentially and notifies callbacks", () => {
    const { sender, callbacks, statusChanges } = createSender();

    sender.loadMessages(["CQ"]);
    sender.play();

    vi.runAllTimers();

    expect(callbacks.onMessageStart).toHaveBeenCalledWith(0);
    expect(callbacks.onCharStart.mock.calls.map(([char]) => char)).toEqual([
      "C",
      "Q",
    ]);
    expect(callbacks.onCharEnd.mock.calls.map(([char]) => char)).toEqual([
      "C",
      "Q",
    ]);
    expect(callbacks.onFinish).toHaveBeenCalledTimes(1);
    expect(statusChanges).toHaveBeenCalledWith("playing");
    expect(statusChanges).toHaveBeenLastCalledWith("idle");
  });

  it("pauses and resumes mid-message without losing progress", () => {
    const { sender, callbacks, statusChanges, audioHarness } = createSender();

    sender.loadMessages(["EE"]);
    sender.play();

    expect(statusChanges).toHaveBeenCalledWith("playing");

    vi.advanceTimersByTime(500);

    expect(callbacks.onCharStart).toHaveBeenCalledTimes(1);

    sender.pause();

    expect(sender.getStatus()).toBe("paused");
    expect(callbacks.onCharEnd).toHaveBeenCalledTimes(1);
    expect(statusChanges).toHaveBeenLastCalledWith("paused");
    expect(audioHarness.driver.cancelScheduledValues).toHaveBeenCalled();

    sender.resume();

    expect(statusChanges).toHaveBeenLastCalledWith("playing");
    vi.runAllTimers();
    expect(callbacks.onFinish).toHaveBeenCalledTimes(1);
    expect(sender.getStatus()).toBe("idle");
  });

  it("skips to a later message and exposes cleaned display slices", () => {
    const { sender, callbacks } = createSender();

    sender.loadMessages(["CQ CQ", "@SK TEST"]);
    sender.play();

    expect(callbacks.onMessageStart).toHaveBeenCalledWith(0);

    sender.skipToMessage(1);

    vi.runAllTimers();

    expect(callbacks.onMessageStart.mock.calls.map(([index]) => index)).toEqual([
      0,
      1,
    ]);

    const display = sender.getDisplayMessage(1);
    expect(display).toBe("SK TEST");

    const slices: DisplaySlices = sender.getDisplaySlices(1, 2);
    expect(slices).toEqual({
      displayMessage: "SK TEST",
      doneText: "SK",
      remainingText: " TEST",
    });
  });
});

