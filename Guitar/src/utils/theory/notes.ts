export type AccidentalMode = 'sharp' | 'flat';

export interface TuningPreset {
  id: string;
  name: string;
  /** Pitch classes (0=C .. 11=B) from String 1 (high e, top) to String 6 (low E, bottom) */
  strings: number[];
}

export const SHARP_NOTES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export const FLAT_NOTES = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
] as const;

export const TUNING_PRESETS: TuningPreset[] = [
  { id: 'standard', name: 'Standard (E A D G B E)', strings: [4, 11, 7, 2, 9, 4] },
  { id: 'drop-d', name: 'Drop D (D A D G B E)', strings: [4, 11, 7, 2, 9, 2] },
  { id: 'eb', name: 'Half-Step Down (Eb)', strings: [3, 10, 6, 1, 8, 3] },
  { id: 'open-g', name: 'Open G (D G D G B D)', strings: [2, 11, 7, 2, 7, 2] },
  { id: 'dadgad', name: 'DADGAD (D A D G A D)', strings: [2, 9, 7, 2, 9, 2] },
];

export const INLAY_FRETS = new Set([3, 5, 7, 9, 12, 15, 17, 19, 21]);
export const NATURAL_PITCH_CLASSES = new Set([0, 2, 4, 5, 7, 9, 11]);

export function isNaturalPitchClass(pitchClass: number): boolean {
  const normalized = ((pitchClass % 12) + 12) % 12;
  return NATURAL_PITCH_CLASSES.has(normalized);
}

export function formatPitchClass(
  pitchClass: number,
  accidentals: AccidentalMode = 'sharp'
): string {
  const normalized = ((pitchClass % 12) + 12) % 12;
  return accidentals === 'flat' ? FLAT_NOTES[normalized] : SHARP_NOTES[normalized];
}

export function getFretPitchClass(openPitchClass: number, fret: number): number {
  return (((openPitchClass + fret) % 12) + 12) % 12;
}

export const PITCH_CLASS_COLORS: Record<number, string> = {
  0: '#ef4444',  // C (Red)
  1: '#ea580c',  // C#/Db
  2: '#f59e0b',  // D (Amber)
  3: '#ca8a04',  // D#/Eb
  4: '#16a34a',  // E (Green)
  5: '#0d9488',  // F (Teal)
  6: '#0891b2',  // F#/Gb
  7: '#0284c7',  // G (Blue)
  8: '#2563eb',  // G#/Ab
  9: '#6366f1',  // A (Indigo)
  10: '#9333ea', // A#/Bb
  11: '#db2777', // B (Pink)
};
