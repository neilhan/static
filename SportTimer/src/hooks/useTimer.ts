import { useState, useEffect, useCallback, useRef } from 'react';
import { Program, TimerState } from '../types.ts';
import { formatSpokenRemainingTime } from '../utils/helpers';
import { createSilentAudioKeepAlive, SilentAudioKeepAlive } from '../utils/silentAudio';

type UseTimerResult = {
  timerState: TimerState;
  togglePause: () => void;
  reset: () => void;
  skip: () => void;
};

export type TimerAdvanceInput = {
  state: TimerState;
  program: Program;
  deadlineMs: number;
  nowMs: number;
};

export type TimerAdvanceResult = {
  nextState: TimerState;
  nextDeadlineMs: number;
  shouldBeep: boolean;
  announceRemainingSeconds: number | null;
  announceSegmentName: string | null;
};

const TICK_INTERVAL_MS = 200;

const getRemainingTimeAnnouncement = (
  prevState: TimerState,
  nextState: TimerState,
  program: Program
): number | null => {
  const interval = program.announceInterval ?? 0;
  if (interval <= 0 || nextState.isPaused || nextState.isComplete) {
    return null;
  }
  if (
    nextState.currentSegmentIndex !== prevState.currentSegmentIndex ||
    nextState.currentRound !== prevState.currentRound
  ) {
    return null;
  }
  if (nextState.remainingTime === prevState.remainingTime || nextState.remainingTime <= 0) {
    return null;
  }
  const segmentDuration = program.segments[nextState.currentSegmentIndex]?.duration ?? 0;
  if (nextState.remainingTime >= segmentDuration) {
    return null;
  }
  return nextState.remainingTime % interval === 0 ? nextState.remainingTime : null;
};

/**
 * Advances timer state using wall-clock timestamps (`Date.now()`) so backgrounded
 * or throttled intervals catch up accurately across segments and rounds.
 */
export const advanceTimerByTimestamp = ({
  state,
  program,
  deadlineMs,
  nowMs,
}: TimerAdvanceInput): TimerAdvanceResult => {
  if (state.isPaused || state.isComplete || program.segments.length === 0) {
    return { nextState: state, nextDeadlineMs: deadlineMs, shouldBeep: false, announceRemainingSeconds: null, announceSegmentName: null };
  }

  const currentSegment = program.segments[state.currentSegmentIndex];
  if (!currentSegment) {
    return {
      nextState: { ...state, remainingTime: 0, isPaused: true, isComplete: true },
      nextDeadlineMs: deadlineMs,
      shouldBeep: false,
      announceRemainingSeconds: null,
      announceSegmentName: null,
    };
  }

  if (nowMs < deadlineMs) {
    const remainingMs = deadlineMs - nowMs;
    const nextRemainingTime = Math.min(
      currentSegment.duration,
      Math.max(0, Math.ceil(remainingMs / 1000))
    );
    if (nextRemainingTime === state.remainingTime) {
      return { nextState: state, nextDeadlineMs: deadlineMs, shouldBeep: false, announceRemainingSeconds: null, announceSegmentName: null };
    }
    const nextState = { ...state, remainingTime: nextRemainingTime };
    return {
      nextState,
      nextDeadlineMs: deadlineMs,
      shouldBeep: false,
      announceRemainingSeconds: getRemainingTimeAnnouncement(state, nextState, program),
      announceSegmentName: null,
    };
  }

  const totalRoundDurationMs = program.segments.reduce(
    (sum, seg) => sum + Math.max(0, seg.duration) * 1000,
    0
  );

  if (totalRoundDurationMs <= 0) {
    return {
      nextState: {
        ...state,
        currentSegmentIndex: program.segments.length - 1,
        remainingTime: 0,
        isPaused: true,
        isComplete: true,
      },
      nextDeadlineMs: deadlineMs,
      shouldBeep: true,
      announceRemainingSeconds: null,
      announceSegmentName: null,
    };
  }

  let currentIndex = state.currentSegmentIndex;
  let currentRound = state.currentRound;
  let currentDeadline = deadlineMs;
  let shouldBeep = false;

  while (nowMs >= currentDeadline) {
    shouldBeep = true;
    const nextIndex = currentIndex + 1;

    if (nextIndex < program.segments.length) {
      currentIndex = nextIndex;
      currentDeadline += Math.max(0, program.segments[currentIndex].duration) * 1000;
      continue;
    }

    const canCycle = program.rounds === 0 || currentRound < program.rounds;
    if (!canCycle) {
      return {
        nextState: {
          ...state,
          currentSegmentIndex: currentIndex,
          currentRound,
          remainingTime: 0,
          isPaused: true,
          isComplete: true,
        },
        nextDeadlineMs: currentDeadline,
        shouldBeep: true,
        announceRemainingSeconds: null,
        announceSegmentName: null,
      };
    }

    const elapsedPastRound = nowMs - currentDeadline;
    const fullRoundsElapsed = Math.floor(elapsedPastRound / totalRoundDurationMs);

    if (fullRoundsElapsed > 0) {
      if (program.rounds > 0 && currentRound + fullRoundsElapsed >= program.rounds) {
        return {
          nextState: {
            ...state,
            currentSegmentIndex: program.segments.length - 1,
            currentRound: program.rounds,
            remainingTime: 0,
            isPaused: true,
            isComplete: true,
          },
          nextDeadlineMs: currentDeadline + (program.rounds - currentRound) * totalRoundDurationMs,
          shouldBeep: true,
          announceRemainingSeconds: null,
          announceSegmentName: null,
        };
      }
      currentRound += fullRoundsElapsed;
      currentDeadline += fullRoundsElapsed * totalRoundDurationMs;
    }

    currentIndex = 0;
    currentRound += 1;
    currentDeadline += Math.max(0, program.segments[0].duration) * 1000;
  }

  const activeDuration = Math.max(0, program.segments[currentIndex].duration);
  const nextRemainingTime = Math.min(
    activeDuration,
    Math.max(1, Math.ceil((currentDeadline - nowMs) / 1000))
  );

  return {
    nextState: {
      ...state,
      currentSegmentIndex: currentIndex,
      currentRound,
      remainingTime: nextRemainingTime,
      isPaused: false,
      isComplete: false,
    },
    nextDeadlineMs: currentDeadline,
    shouldBeep,
    announceRemainingSeconds: null,
    announceSegmentName: program.segments[currentIndex]?.name ?? null,
  };
};

const createAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const AudioContextClass =
    window.AudioContext ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitAudioContext;
  return AudioContextClass ? new AudioContextClass() : null;
};

const createInitialTimerState = (program: Program | null): TimerState => ({
  currentSegmentIndex: 0,
  remainingTime: program?.segments[0]?.duration || 0,
  isPaused: true,
  isComplete: false,
  currentRound: 1,
  totalRounds: program?.rounds || 1,
});

export const useTimer = (program: Program | null): UseTimerResult => {
  const [timerState, setTimerState] = useState<TimerState>(() => createInitialTimerState(program));

  const stateRef = useRef<TimerState>(timerState);
  const deadlineMsRef = useRef<number | null>(null);
  const remainingMsRef = useRef<number>((program?.segments[0]?.duration || 0) * 1000);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null); // New ref for AudioContext
  const isAudioContextResumed = useRef(false); // To track if audio context has been resumed
  const silentAudioRef = useRef<SilentAudioKeepAlive | null>(null);

  // useEffect to initialize audio context and handle resume on user interaction
  useEffect(() => {
    // Initialize AudioContext if it hasn't been yet
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }

    const resumeContext = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log('AudioContext resumed successfully');
          isAudioContextResumed.current = true;
          // Remove event listeners after successful resume
          document.removeEventListener('click', resumeContext);
          document.removeEventListener('touchstart', resumeContext);
        }).catch(error => {
          console.error('Error resuming AudioContext:', error);
        });
      } else if (audioContextRef.current && audioContextRef.current.state === 'running') {
        isAudioContextResumed.current = true;
        // Remove event listeners if context is already running
        document.removeEventListener('click', resumeContext);
        document.removeEventListener('touchstart', resumeContext);
      }
    };

    // Attach event listeners to resume context on first user interaction
    document.addEventListener('click', resumeContext, { once: true });
    document.addEventListener('touchstart', resumeContext, { once: true });

    // Cleanup function
    return () => {
      document.removeEventListener('click', resumeContext);
      document.removeEventListener('touchstart', resumeContext);
      silentAudioRef.current?.dispose();
      silentAudioRef.current = null;
    };
  }, []); // Empty dependency array means this runs once on mount

  // Helper function to create and play the oscillator
  const _createAndPlayOscillator = useCallback((audioContext: AudioContext) => {
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing beep (oscillator creation):', error);
    }
  }, []);

  const playBeep = useCallback((): void => {
    if (!program?.beepEnabled || !audioContextRef.current) return;

    const currentAudioContext = audioContextRef.current; // Extract to a non-nullable local variable

    // Ensure context is running, attempt to resume if suspended
    if (currentAudioContext.state === 'suspended' && !isAudioContextResumed.current) {
      currentAudioContext.resume().then(() => {
        console.log('AudioContext resumed from playBeep fallback');
        isAudioContextResumed.current = true;
        _createAndPlayOscillator(currentAudioContext); // Use the non-nullable local variable
      }).catch(error => {
        console.error('Error resuming AudioContext from playBeep fallback:', error);
      });
    } else if (currentAudioContext.state === 'running') {
      _createAndPlayOscillator(currentAudioContext); // Use the non-nullable local variable
    }
  }, [program?.beepEnabled, _createAndPlayOscillator]);

  const cancelSpeech = useCallback((): void => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakText = useCallback((text: string): void => {
    const trimmed = text.trim();
    if (
      !trimmed ||
      !program?.beepEnabled ||
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking announcement:', error);
    }
  }, [program?.beepEnabled]);

  const announceRemaining = useCallback((seconds: number): void => {
    speakText(formatSpokenRemainingTime(seconds));
  }, [speakText]);

  const startSilentKeepAlive = useCallback((): void => {
    if (!program?.beepEnabled) return;
    if (!silentAudioRef.current) {
      silentAudioRef.current = createSilentAudioKeepAlive();
    }
    silentAudioRef.current.start();
  }, [program?.beepEnabled]);

  const stopSilentKeepAlive = useCallback((): void => {
    silentAudioRef.current?.stop();
  }, []);

  const reset = useCallback((): void => {
    cancelSpeech();
    stopSilentKeepAlive();
    const nextState = createInitialTimerState(program);
    stateRef.current = nextState;
    deadlineMsRef.current = null;
    remainingMsRef.current = nextState.remainingTime * 1000;
    setTimerState(nextState);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [program, cancelSpeech, stopSilentKeepAlive]);

  const togglePause = useCallback((): void => {
    const current = stateRef.current;
    if (current.isComplete || !program || program.segments.length === 0) {
      return;
    }

    const now = Date.now();
    if (current.isPaused) {
      const currentSegment = program.segments[current.currentSegmentIndex];
      const isAtSegmentStart =
        currentSegment !== undefined &&
        remainingMsRef.current >= currentSegment.duration * 1000;
      deadlineMsRef.current = now + remainingMsRef.current;
      const nextState = { ...current, isPaused: false };
      stateRef.current = nextState;
      setTimerState(nextState);
      startSilentKeepAlive();
      playBeep();
      if (isAtSegmentStart) {
        speakText(currentSegment.name);
      }
      return;
    }

    const deadline = deadlineMsRef.current ?? now + remainingMsRef.current;
    const { nextState, nextDeadlineMs, shouldBeep } = advanceTimerByTimestamp({
      state: current,
      program,
      deadlineMs: deadline,
      nowMs: now,
    });

    cancelSpeech();
    stopSilentKeepAlive();

    if (shouldBeep) {
      playBeep();
    }

    if (nextState.isComplete) {
      remainingMsRef.current = 0;
      deadlineMsRef.current = null;
      stateRef.current = nextState;
      setTimerState(nextState);
    } else {
      remainingMsRef.current = Math.max(0, nextDeadlineMs - now);
      deadlineMsRef.current = null;
      const pausedState = { ...nextState, isPaused: true };
      stateRef.current = pausedState;
      setTimerState(pausedState);
    }
  }, [program, playBeep, speakText, cancelSpeech, startSilentKeepAlive, stopSilentKeepAlive]);

  const skip = useCallback((): void => {
    if (!program || program.segments.length === 0) return;

    const current = stateRef.current;
    const now = Date.now();
    const nextIndex = current.currentSegmentIndex + 1;

    if (nextIndex < program.segments.length) {
      const nextDuration = program.segments[nextIndex].duration;
      remainingMsRef.current = nextDuration * 1000;
      deadlineMsRef.current = now + remainingMsRef.current;
      const nextState: TimerState = {
        ...current,
        currentSegmentIndex: nextIndex,
        remainingTime: nextDuration,
        isPaused: false,
        isComplete: false,
      };
      stateRef.current = nextState;
      setTimerState(nextState);
      playBeep();
      speakText(program.segments[nextIndex].name);
      return;
    }

    // End of segments - check if we should cycle again
    const shouldCycle = program.rounds === 0 || current.currentRound < program.rounds;

    if (shouldCycle) {
      const nextDuration = program.segments[0].duration;
      remainingMsRef.current = nextDuration * 1000;
      deadlineMsRef.current = now + remainingMsRef.current;
      const nextState: TimerState = {
        currentSegmentIndex: 0,
        remainingTime: nextDuration,
        isPaused: false,
        isComplete: false,
        currentRound: current.currentRound + 1,
        totalRounds: current.totalRounds,
      };
      stateRef.current = nextState;
      setTimerState(nextState);
      playBeep();
      speakText(program.segments[0].name);
    } else {
      remainingMsRef.current = 0;
      deadlineMsRef.current = null;
      const nextState: TimerState = { ...current, isComplete: true, isPaused: true };
      stateRef.current = nextState;
      setTimerState(nextState);
    }
  }, [program, playBeep, speakText, cancelSpeech, startSilentKeepAlive, stopSilentKeepAlive]);

  useEffect(() => {
    if (!program || timerState.isPaused || timerState.isComplete) {
      stopSilentKeepAlive();
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (!program.beepEnabled) {
      stopSilentKeepAlive();
    }

    if (deadlineMsRef.current === null) {
      deadlineMsRef.current = Date.now() + remainingMsRef.current;
    }

    const tick = () => {
      const deadline = deadlineMsRef.current;
      if (deadline === null) return;

      const now = Date.now();
      const { nextState, nextDeadlineMs, shouldBeep, announceRemainingSeconds, announceSegmentName } = advanceTimerByTimestamp({
        state: stateRef.current,
        program,
        deadlineMs: deadline,
        nowMs: now,
      });

      if (nextState.isComplete) {
        deadlineMsRef.current = null;
        remainingMsRef.current = 0;
      } else {
        deadlineMsRef.current = nextDeadlineMs;
        remainingMsRef.current = Math.max(0, nextDeadlineMs - now);
      }

      if (nextState !== stateRef.current) {
        stateRef.current = nextState;
        setTimerState(nextState);
      }

      if (shouldBeep) {
        playBeep();
      }
      if (announceSegmentName) {
        speakText(announceSegmentName);
      } else if (announceRemainingSeconds !== null) {
        announceRemaining(announceRemainingSeconds);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };

    intervalRef.current = window.setInterval(tick, TICK_INTERVAL_MS);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelSpeech();
    };
  }, [program, timerState.isPaused, timerState.isComplete, playBeep, speakText, announceRemaining, cancelSpeech, stopSilentKeepAlive]);

  return {
    timerState,
    togglePause,
    reset,
    skip,
  };
};
