import { describe, it, expect } from 'vitest';
import { getFretMidi, midiToFreq } from './guitarAudio';
import {
  formatPitchClass,
  getFretPitchClass,
  getPentatonicBoxes,
  getPentatonicDegree,
  getPentatonicOctaveShiftBlocks,
  getSeventhDegree,
  getShellVoicings,
  getTileBlocksForFretboard,
  getTriadDegree,
  getTriadVoicings,
  TUNING_PRESETS,
} from './musicTheory';

describe('musicTheory', () => {
  it('formats pitch classes in sharp and flat modes', () => {
    expect(formatPitchClass(0, 'sharp')).toBe('C');
    expect(formatPitchClass(1, 'sharp')).toBe('C#');
    expect(formatPitchClass(1, 'flat')).toBe('Db');
    expect(formatPitchClass(10, 'flat')).toBe('Bb');
    expect(formatPitchClass(-1, 'sharp')).toBe('B');
  });

  it('computes fret notes accurately for standard tuning', () => {
    const standard = TUNING_PRESETS[0];
    // String 1 (index 0) is high E (4), fret 3 = G (7), fret 12 = E (4)
    expect(formatPitchClass(getFretPitchClass(standard.strings[0], 0))).toBe('E');
    expect(formatPitchClass(getFretPitchClass(standard.strings[0], 3))).toBe('G');
    expect(formatPitchClass(getFretPitchClass(standard.strings[0], 12))).toBe('E');
    // String 6 (index 5) is low E (4), fret 5 = A (9)
    expect(formatPitchClass(getFretPitchClass(standard.strings[5], 5))).toBe('A');
  });

  it('computes repeating 2-string tile blocks across the fretboard including edge tiles', () => {
    expect(getTileBlocksForFretboard(15, 'none')).toEqual([]);

    const gabBlocks15 = getTileBlocksForFretboard(15, 'gab-cde');
    // Includes S6 single (8-12), S6-S5 (3-7, 15-15), S5-S4 (0-2, 10-14), S4-S3 (5-9), S3-S2 (0-5, 12-15), S2-S1 (0-0, 8-12), S1 single (3-7)
    expect(gabBlocks15).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ topStringIndex: 5, bottomStringIndex: 5, startFret: 8, endFret: 12 }),
        expect.objectContaining({ topStringIndex: 4, bottomStringIndex: 5, startFret: 3, endFret: 7 }),
        expect.objectContaining({ topStringIndex: 4, bottomStringIndex: 5, startFret: 15, endFret: 15 }),
        expect.objectContaining({ topStringIndex: 3, bottomStringIndex: 4, startFret: 0, endFret: 2 }),
        expect.objectContaining({ topStringIndex: 3, bottomStringIndex: 4, startFret: 10, endFret: 14 }),
        expect.objectContaining({ topStringIndex: 2, bottomStringIndex: 3, startFret: 5, endFret: 9 }),
        expect.objectContaining({
          topStringIndex: 1,
          bottomStringIndex: 2,
          startFret: 0,
          endFret: 5,
          topStartFret: 1,
          topEndFret: 5,
          bottomStartFret: 0,
          bottomEndFret: 4,
        }),
        expect.objectContaining({ topStringIndex: 1, bottomStringIndex: 2, startFret: 12, endFret: 15 }),
        expect.objectContaining({ topStringIndex: 0, bottomStringIndex: 1, startFret: 0, endFret: 0 }),
        expect.objectContaining({ topStringIndex: 0, bottomStringIndex: 1, startFret: 8, endFret: 12 }),
        expect.objectContaining({ topStringIndex: 0, bottomStringIndex: 0, startFret: 3, endFret: 7 }),
      ])
    );

    const allBlocks15 = getTileBlocksForFretboard(15, 'all');
    expect(allBlocks15.length).toBeGreaterThan(gabBlocks15.length);
  });

  it('computes 3-string chord triad voicings for any 3 strings and chord quality', () => {
    const standard = TUNING_PRESETS[0];

    expect(getTriadDegree(0, 0, 'major')).toEqual({ degree: 'R', index: 0 });
    expect(getTriadDegree(4, 0, 'major')).toEqual({ degree: '3', index: 1 });
    expect(getTriadDegree(3, 0, 'minor')).toEqual({ degree: 'b3', index: 1 });
    expect(getTriadDegree(6, 0, 'dim')).toEqual({ degree: 'b5', index: 2 });
    expect(getTriadDegree(8, 0, 'aug')).toEqual({ degree: '#5', index: 2 });

    // C Major on top 3 strings (S1, S2, S3 = indices [0, 1, 2]) within 12 frets
    const cMajorTop3 = getTriadVoicings(standard.strings, 12, [0, 1, 2], 0, 'major');
    expect(cMajorTop3.map((v) => v.inversion)).toEqual(
      expect.arrayContaining(['2nd Inversion', 'Root Position', '1st Inversion'])
    );
    // Root position C Major on S3-S2-S1: S3 F5 (C), S2 F5 (E), S1 F3 (G)
    expect(cMajorTop3).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '0:3-1:5-2:5',
          inversion: 'Root Position',
          minFret: 3,
          maxFret: 5,
        }),
      ])
    );

    // Non-adjacent skip-string set: S1, S3, S5 (indices [0, 2, 4])
    const cMajorSkip = getTriadVoicings(standard.strings, 12, [0, 2, 4], 0, 'major');
    expect(cMajorSkip.length).toBeGreaterThan(0);
    expect(cMajorSkip[0].notes.map((n) => n.stringIndex)).toEqual([0, 2, 4]);
  });

  it('computes 3-string shell chord voicings (R, 3rd, 7th) for 7th chords', () => {
    const standard = TUNING_PRESETS[0];

    expect(getSeventhDegree(11, 0, 'maj7')).toEqual({ degree: '7', index: 3 });
    expect(getSeventhDegree(10, 0, 'dom7')).toEqual({ degree: 'b7', index: 3 });
    expect(getSeventhDegree(3, 0, 'min7')).toEqual({ degree: 'b3', index: 1 });
    expect(getSeventhDegree(6, 0, 'm7b5')).toEqual({ degree: 'b5', index: 2 });
    expect(getSeventhDegree(9, 0, 'dim7')).toEqual({ degree: 'bb7', index: 3 });

    // Cmaj7 shell on S6-S4-S3 ([2, 3, 5]): S6 F8 (C), S4 F9 (B), S3 F9 (E)
    const cmaj7S6 = getShellVoicings(standard.strings, 15, [2, 3, 5], 0, 'maj7');
    expect(cmaj7S6).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '2:9-3:9-5:8',
          inversion: 'Root Position',
          minFret: 8,
          maxFret: 9,
        }),
      ])
    );

    // Cmaj7 shell on S5-S4-S3 ([2, 3, 4]): S5 F3 (C), S4 F2 (E), S3 F4 (B)
    const cmaj7S5 = getShellVoicings(standard.strings, 15, [2, 3, 4], 0, 'maj7');
    expect(cmaj7S5).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '2:4-3:2-4:3',
          inversion: 'Root Position',
          minFret: 2,
          maxFret: 4,
        }),
      ])
    );
  });

  it('computes pentatonic degrees, 5 box positions, and 2-string octave shift blocks', () => {
    const standard = TUNING_PRESETS[0];

    expect(getPentatonicDegree(9, 9, 'minor')).toEqual({
      degree: 'R',
      index: 0,
      isBlues: false,
    });
    expect(getPentatonicDegree(0, 9, 'minor')).toEqual({
      degree: 'b3',
      index: 1,
      isBlues: false,
    });
    expect(getPentatonicDegree(3, 9, 'minor', true)).toEqual({
      degree: 'b5',
      index: -1,
      isBlues: true,
    });

    // A Minor Pentatonic across 0..15 frets includes Pattern 1 at F5..F8
    const boxes = getPentatonicBoxes(standard.strings, 15, 9, 'minor');
    const p1 = boxes.find((b) => b.patternNumber === 1 && b.minFret === 5);
    expect(p1).toBeDefined();
    expect(p1?.maxFret).toBe(8);

    // C Major Pentatonic 2+3 Tile (G A on lower string + C D E on upper string):
    // S6-S5 F3..7 (and edge F15..15), S4-S3 F5..9, S2-S1 F8..12
    const cMajorShifts23 = getPentatonicOctaveShiftBlocks(
      standard.strings,
      15,
      0,
      'major',
      '2-3',
      'even'
    );
    expect(cMajorShifts23).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ topStringIndex: 4, bottomStringIndex: 5, startFret: 3, endFret: 7 }),
        expect.objectContaining({ topStringIndex: 4, bottomStringIndex: 5, startFret: 15, endFret: 15 }),
        expect.objectContaining({ topStringIndex: 2, bottomStringIndex: 3, startFret: 5, endFret: 9 }),
        expect.objectContaining({ topStringIndex: 0, bottomStringIndex: 1, startFret: 8, endFret: 12 }),
      ])
    );

    // C Major Pentatonic 3+2 Tile (C D E on lower string + G A on upper string):
    // S6-S5 F8..12 -> S4-S3 F10..14 -> S2-S1 F1..5
    const cMajorShifts32 = getPentatonicOctaveShiftBlocks(
      standard.strings,
      15,
      0,
      'major',
      '3-2',
      'even'
    );
    expect(cMajorShifts32).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ topStringIndex: 4, bottomStringIndex: 5, startFret: 8, endFret: 12 }),
        expect.objectContaining({ topStringIndex: 2, bottomStringIndex: 3, startFret: 10, endFret: 14 }),
        expect.objectContaining({ topStringIndex: 0, bottomStringIndex: 1, startFret: 1, endFret: 5 }),
      ])
    );

    // 'all' includes every 2-string pair (S6-5..S2-1) plus S6 & S1 cut-off edge tiles
    const cMajorShiftsAll23 = getPentatonicOctaveShiftBlocks(
      standard.strings,
      15,
      0,
      'major',
      '2-3',
      'all'
    );
    expect(cMajorShiftsAll23).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ topStringIndex: 5, bottomStringIndex: 5, startFret: 8, endFret: 12 }),
        expect.objectContaining({ topStringIndex: 3, bottomStringIndex: 4, startFret: 10, endFret: 14 }),
        expect.objectContaining({ topStringIndex: 1, bottomStringIndex: 2, startFret: 0, endFret: 5 }),
        expect.objectContaining({ topStringIndex: 0, bottomStringIndex: 0, startFret: 3, endFret: 5 }),
      ])
    );
  });

  it('computes accurate MIDI pitch and frequency for standard and alternate tunings', () => {
    // Standard tuning: S6 open = E2 (40), S1 open = E4 (64), S1 F5 = A4 (69 = 440Hz)
    expect(getFretMidi(4, 5, 0)).toBe(40);
    expect(getFretMidi(4, 0, 0)).toBe(64);
    expect(getFretMidi(4, 0, 5)).toBe(69);
    expect(midiToFreq(69)).toBeCloseTo(440, 5);
    // Drop D: S6 open = D2 (38)
    expect(getFretMidi(2, 5, 0)).toBe(38);
  });
});

