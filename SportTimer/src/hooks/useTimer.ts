import { useState, useEffect, useCallback, useRef } from 'react';
import { Program, TimerState } from '../types';

export const useTimer = (program: Program | null) => {
  const [timerState, setTimerState] = useState<TimerState>({
    currentSegmentIndex: 0,
    remainingTime: program?.segments[0]?.duration || 0,
    isPaused: true,
    isComplete: false,
    currentCycle: 1,
    totalCycles: program?.cycles || 1,
  });

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio context for beep sound
    audioRef.current = new Audio();
  }, []);

  const playBeep = useCallback(() => {
    if (!program?.beepEnabled) return;
    
    try {
      // Simple beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
      console.error('Error playing beep:', error);
    }
  }, [program?.beepEnabled]);

  const reset = useCallback(() => {
    setTimerState({
      currentSegmentIndex: 0,
      remainingTime: program?.segments[0]?.duration || 0,
      isPaused: true,
      isComplete: false,
      currentCycle: 1,
      totalCycles: program?.cycles || 1,
    });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [program]);

  const togglePause = useCallback(() => {
    setTimerState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const skip = useCallback(() => {
    if (!program) return;

    const nextIndex = timerState.currentSegmentIndex + 1;
    if (nextIndex < program.segments.length) {
      playBeep();
      setTimerState(prev => ({
        ...prev,
        currentSegmentIndex: nextIndex,
        remainingTime: program.segments[nextIndex].duration,
        isPaused: false,
        isComplete: false,
      }));
    } else {
      // End of segments - check if we should cycle again
      const shouldCycle = program.cycles === 0 || timerState.currentCycle < program.cycles;
      
      if (shouldCycle) {
        playBeep();
        setTimerState(prev => ({
          currentSegmentIndex: 0,
          remainingTime: program.segments[0].duration,
          isPaused: false,
          isComplete: false,
          currentCycle: prev.currentCycle + 1,
          totalCycles: prev.totalCycles,
        }));
      } else {
        setTimerState(prev => ({ ...prev, isComplete: true, isPaused: true }));
      }
    }
  }, [program, timerState.currentSegmentIndex, timerState.currentCycle, playBeep]);

  useEffect(() => {
    if (!program || timerState.isPaused || timerState.isComplete) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimerState(prev => {
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
            const shouldCycle = program.cycles === 0 || prev.currentCycle < program.cycles;
            
            if (shouldCycle) {
              playBeep();
              return {
                currentSegmentIndex: 0,
                remainingTime: program.segments[0].duration,
                isPaused: false,
                isComplete: false,
                currentCycle: prev.currentCycle + 1,
                totalCycles: prev.totalCycles,
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

