import { describe, expect, it } from 'vitest';
import {
  calculateTotalDuration,
  formatSpokenRemainingTime,
  formatTime,
  generateId,
  getRandomColor,
} from './helpers';

describe('helpers', () => {
  it('formats seconds as MM:SS with zero padding', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(5)).toBe('00:05');
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(125)).toBe('02:05');
    expect(formatTime(3661)).toBe('61:01');
  });

  it('generates distinct non-empty IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('picks a hex color from the palette', () => {
    const color = getRandomColor();
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('calculates total duration across segments', () => {
    expect(calculateTotalDuration([])).toBe(0);
    expect(
      calculateTotalDuration([{ duration: 30 }, { duration: 15 }, { duration: 45 }])
    ).toBe(90);
  });

  it('formats spoken remaining time naturally', () => {
    expect(formatSpokenRemainingTime(1)).toBe('1 second remaining');
    expect(formatSpokenRemainingTime(15)).toBe('15 seconds remaining');
    expect(formatSpokenRemainingTime(60)).toBe('1 minute remaining');
    expect(formatSpokenRemainingTime(90)).toBe('1 minute 30 seconds remaining');
    expect(formatSpokenRemainingTime(125)).toBe('2 minutes 5 seconds remaining');
  });
});
