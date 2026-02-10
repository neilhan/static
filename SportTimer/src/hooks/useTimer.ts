import { useState, useEffect, useCallback, useRef } from 'react';
import { Program, TimerState } from '../types.ts';

type UseTimerResult = {
  timerState: TimerState;
  togglePause: () => void;
  reset: () => void;
  skip: () => void;
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

export const useTimer = (program: Program | null): UseTimerResult => {
  const [timerState, setTimerState] = useState<TimerState>({
    currentSegmentIndex: 0,
    remainingTime: program?.segments[0]?.duration || 0,
    isPaused: true,
    isComplete: false,
    currentRound: 1,
    totalRounds: program?.rounds || 1,
  });

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
    setTimerState({
      currentSegmentIndex: 0,
      remainingTime: program?.segments[0]?.duration || 0,
      isPaused: true,
      isComplete: false,
      currentRound: 1,
      totalRounds: program?.rounds || 1,
    });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [program]);

  const togglePause = useCallback((): void => {
    setTimerState((prev: TimerState) => {
      if (prev.isPaused && !prev.isComplete) {
        playBeep();
      }
      return { ...prev, isPaused: !prev.isPaused };
    });
  }, [playBeep]);

  const skip = useCallback((): void => {
    if (!program) return;

    const nextIndex = timerState.currentSegmentIndex + 1;
    if (nextIndex < program.segments.length) {
      playBeep();
      setTimerState((prev: TimerState) => ({
        ...prev,
        currentSegmentIndex: nextIndex,
        remainingTime: program.segments[nextIndex].duration,
        isPaused: false,
        isComplete: false,
      }));
    } else {
      // End of segments - check if we should cycle again
      const shouldCycle = program.rounds === 0 || timerState.currentRound < program.rounds;
      
      if (shouldCycle) {
        playBeep();
        setTimerState((prev: TimerState) => ({
          currentSegmentIndex: 0,
          remainingTime: program.segments[0].duration,
          isPaused: false,
          isComplete: false,
          currentRound: prev.currentRound + 1,
          totalRounds: prev.totalRounds,
        }));
      } else {
        setTimerState((prev: TimerState) => ({ ...prev, isComplete: true, isPaused: true }));
      }
    }
  }, [program, timerState.currentSegmentIndex, timerState.currentRound, playBeep]);

  useEffect(() => {
    if (!program || timerState.isPaused || timerState.isComplete) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimerState((prev: TimerState) => {
        const newRemainingTime = prev.remainingTime - 1;

        if (newRemainingTime <= 0) {
          const nextIndex = prev.currentSegmentIndex + 1;
          
          if (nextIndex < program.segments.length) {
            playBeep();
            return {
              ...prev,
              currentSegmentIndex: nextIndex,
              remainingTime: program.segments[nextIndex].duration,
              isPaused: false,
              isComplete: false,
            };
          } else {
            // End of segments - check if we should cycle again
            const shouldCycle = program.rounds === 0 || prev.currentRound < program.rounds;
            
            if (shouldCycle) {
              playBeep();
              return {
                currentSegmentIndex: 0,
                remainingTime: program.segments[0].duration,
                isPaused: false,
                isComplete: false,
                currentRound: prev.currentRound + 1,
                totalRounds: prev.totalRounds,
              };
            } else {
              playBeep();
              return {
                ...prev,
                remainingTime: 0,
                isPaused: true,
                isComplete: true,
              };
            }
          }
        }

        return { ...prev, remainingTime: newRemainingTime };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [program, timerState.isPaused, timerState.isComplete, playBeep]);

  return {
    timerState,
    togglePause,
    reset,
    skip,
  };
};