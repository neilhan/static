import { useState, useEffect, useCallback, useRef } from 'react';
import { Program, TimerState } from '../types.ts';

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
};

const TICK_INTERVAL_MS = 200;

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
    return { nextState: state, nextDeadlineMs: deadlineMs, shouldBeep: false };
  }

  const currentSegment = program.segments[state.currentSegmentIndex];
  if (!currentSegment) {
    return {
      nextState: { ...state, remainingTime: 0, isPaused: true, isComplete: true },
      nextDeadlineMs: deadlineMs,
      shouldBeep: false,
    };
  }

  if (nowMs < deadlineMs) {
    const remainingMs = deadlineMs - nowMs;
    const nextRemainingTime = Math.min(
      currentSegment.duration,
      Math.max(0, Math.ceil(remainingMs / 1000))
    );
    if (nextRemainingTime === state.remainingTime) {
      return { nextState: state, nextDeadlineMs: deadlineMs, shouldBeep: false };
    }
    return {
      nextState: { ...state, remainingTime: nextRemainingTime },
      nextDeadlineMs: deadlineMs,
      shouldBeep: false,
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

  const reset = useCallback((): void => {
    const nextState = createInitialTimerState(program);
    stateRef.current = nextState;
    deadlineMsRef.current = null;
    remainingMsRef.current = nextState.remainingTime * 1000;
    setTimerState(nextState);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [program]);

  const togglePause = useCallback((): void => {
    const current = stateRef.current;
    if (current.isComplete || !program || program.segments.length === 0) {
      return;
    }

    const now = Date.now();
    if (current.isPaused) {
      deadlineMsRef.current = now + remainingMsRef.current;
      const nextState = { ...current, isPaused: false };
      stateRef.current = nextState;
      setTimerState(nextState);
      playBeep();
      return;
    }

    const deadline = deadlineMsRef.current ?? now + remainingMsRef.current;
    const { nextState, nextDeadlineMs, shouldBeep } = advanceTimerByTimestamp({
      state: current,
      program,
      deadlineMs: deadline,
      nowMs: now,
    });

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
  }, [program, playBeep]);

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
    } else {
      remainingMsRef.current = 0;
      deadlineMsRef.current = null;
      const nextState: TimerState = { ...current, isComplete: true, isPaused: true };
      stateRef.current = nextState;
      setTimerState(nextState);
    }
  }, [program, playBeep]);

  useEffect(() => {
    if (!program || timerState.isPaused || timerState.isComplete) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (deadlineMsRef.current === null) {
      deadlineMsRef.current = Date.now() + remainingMsRef.current;
    }

    const tick = () => {
      const deadline = deadlineMsRef.current;
      if (deadline === null) return;

      const now = Date.now();
      const { nextState, nextDeadlineMs, shouldBeep } = advanceTimerByTimestamp({
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
    };
  }, [program, timerState.isPaused, timerState.isComplete, playBeep]);

  return {
    timerState,
    togglePause,
    reset,
    skip,
  };
};
