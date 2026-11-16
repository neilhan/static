import { describe, expect, it } from 'vitest';
import { Program, TimerState } from '../types.ts';
import { advanceTimerByTimestamp } from './useTimer';

const makeProgram = (overrides: Partial<Program> = {}): Program => ({
  id: 'prog-1',
  name: 'HIIT',
  segments: [
    { id: 's1', name: 'Work', duration: 10, color: '#FF6B6B' },
    { id: 's2', name: 'Rest', duration: 20, color: '#4ECDC4' },
  ],
  rounds: 2,
  beepEnabled: true,
  createdAt: 1_000,
  ...overrides,
});

const makeState = (overrides: Partial<TimerState> = {}): TimerState => ({
  currentSegmentIndex: 0,
  remainingTime: 10,
  isPaused: false,
  isComplete: false,
  currentRound: 1,
  totalRounds: 2,
  ...overrides,
});

describe('advanceTimerByTimestamp', () => {
  it('does not advance when paused or already complete', () => {
    const program = makeProgram();
    const paused = makeState({ isPaused: true });
    const resPaused = advanceTimerByTimestamp({
      state: paused,
      program,
      deadlineMs: 10_000,
      nowMs: 25_000,
    });
    expect(resPaused.nextState).toBe(paused);
    expect(resPaused.shouldBeep).toBe(false);

    const complete = makeState({ isComplete: true, isPaused: true, remainingTime: 0 });
    const resComplete = advanceTimerByTimestamp({
      state: complete,
      program,
      deadlineMs: 10_000,
      nowMs: 25_000,
    });
    expect(resComplete.nextState).toBe(complete);
    expect(resComplete.shouldBeep).toBe(false);
  });

  it('decrements remaining seconds using ceiling of remaining milliseconds without drifting', () => {
    const program = makeProgram();
    const state = makeState({ remainingTime: 10 });

    // 250ms elapsed -> 9750ms left -> still displays 10s, same state reference
    const tick1 = advanceTimerByTimestamp({
      state,
      program,
      deadlineMs: 10_000,
      nowMs: 250,
    });
    expect(tick1.nextState).toBe(state);
    expect(tick1.shouldBeep).toBe(false);

    // 1050ms elapsed -> 8950ms left -> displays 9s
    const tick2 = advanceTimerByTimestamp({
      state,
      program,
      deadlineMs: 10_000,
      nowMs: 1_050,
    });
    expect(tick2.nextState.remainingTime).toBe(9);
    expect(tick2.nextDeadlineMs).toBe(10_000);
    expect(tick2.shouldBeep).toBe(false);
  });

  it('transitions cleanly to the next segment on deadline without cumulative drift', () => {
    const program = makeProgram();
    const state = makeState({ remainingTime: 1 });

    // Fired 35ms late after segment 0 ended at 10_000ms
    const res = advanceTimerByTimestamp({
      state,
      program,
      deadlineMs: 10_000,
      nowMs: 10_035,
    });

    expect(res.shouldBeep).toBe(true);
    expect(res.nextState.currentSegmentIndex).toBe(1);
    expect(res.nextState.currentRound).toBe(1);
    expect(res.nextState.remainingTime).toBe(20);
    // Deadline stays anchored to 10_000 + 20_000 = 30_000 (not 10_035 + 20_000)
    expect(res.nextDeadlineMs).toBe(30_000);
  });

  it('catches up across multiple segments and rounds when backgrounded', () => {
    const program = makeProgram({ rounds: 3 });
    const state = makeState({ totalRounds: 3 });

    // Round 1: 0..10s (s1), 10..30s (s2)
    // Round 2: 30..40s (s1), 40..60s (s2)
    // Round 3: 60..70s (s1), 70..90s (s2)
    // Backgrounded until t = 65_000ms -> 5s left in Round 3 segment 0
    const res = advanceTimerByTimestamp({
      state,
      program,
      deadlineMs: 10_000,
      nowMs: 65_000,
    });

    expect(res.shouldBeep).toBe(true);
    expect(res.nextState.isComplete).toBe(false);
    expect(res.nextState.isPaused).toBe(false);
    expect(res.nextState.currentRound).toBe(3);
    expect(res.nextState.currentSegmentIndex).toBe(0);
    expect(res.nextState.remainingTime).toBe(5);
    expect(res.nextDeadlineMs).toBe(70_000);
  });

  it('completes when backgrounded past the final round', () => {
    const program = makeProgram({ rounds: 3 });
    const state = makeState({ totalRounds: 3 });

    // Total duration across 3 rounds is 90s
    const exactEnd = advanceTimerByTimestamp({
      state,
      program,
      deadlineMs: 10_000,
      nowMs: 90_000,
    });
    expect(exactEnd.shouldBeep).toBe(true);
    expect(exactEnd.nextState.isComplete).toBe(true);
    expect(exactEnd.nextState.isPaused).toBe(true);
    expect(exactEnd.nextState.remainingTime).toBe(0);
    expect(exactEnd.nextState.currentRound).toBe(3);

    const overshoot = advanceTimerByTimestamp({
      state,
      program,
      deadlineMs: 10_000,
      nowMs: 150_000,
    });
    expect(overshoot.shouldBeep).toBe(true);
    expect(overshoot.nextState.isComplete).toBe(true);
    expect(overshoot.nextState.isPaused).toBe(true);
    expect(overshoot.nextState.remainingTime).toBe(0);
  });

  it('fast-forwards infinite rounds accurately after long background sleep', () => {
    const program = makeProgram({ rounds: 0 });
    const state = makeState({ totalRounds: 0 });

    // Round duration = 30s; at 10 hours + 15s (36015s):
    // 36015 / 30 = 1200 full rounds completed + 15s into round 1201 (5s into segment 1 of 20s -> 15s left)
    const nowMs = (10 * 3600 + 15) * 1000;
    const res = advanceTimerByTimestamp({
      state,
      program,
      deadlineMs: 10_000,
      nowMs,
    });

    expect(res.shouldBeep).toBe(true);
    expect(res.nextState.isComplete).toBe(false);
    expect(res.nextState.currentRound).toBe(1201);
    expect(res.nextState.currentSegmentIndex).toBe(1);
    expect(res.nextState.remainingTime).toBe(15);
    expect(res.nextDeadlineMs).toBe(1201 * 30_000);
  });

  it('guards against zero-duration segments in infinite programs', () => {
    const program = makeProgram({
      rounds: 0,
      segments: [{ id: 's1', name: 'Zero', duration: 0, color: '#FF6B6B' }],
    });
    const state = makeState({ remainingTime: 0, totalRounds: 0 });

    const res = advanceTimerByTimestamp({
      state,
      program,
      deadlineMs: 1_000,
      nowMs: 2_000,
    });

    expect(res.nextState.isComplete).toBe(true);
    expect(res.nextState.isPaused).toBe(true);
    expect(res.shouldBeep).toBe(true);
  });
});
