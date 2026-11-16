import { AccidentalMode } from './notes';
import { TriadQuality } from './chords';

export interface CirclePosition {
  index: number;
  majorPc: number;
  minorPc: number;
  accidentalMode: AccidentalMode;
  signatureCount: number;
  signatureLabel: string;
}

export const CIRCLE_OF_FIFTHS: CirclePosition[] = Array.from({ length: 12 }, (_, index) => {
  const majorPc = (index * 7) % 12;
  const minorPc = (majorPc + 9) % 12;
  const accidentalMode: AccidentalMode = index >= 1 && index <= 6 ? 'sharp' : 'flat';
  const signatureCount = index <= 6 ? index : 12 - index;
  let signatureLabel = '0';
  if (index === 6) {
    signatureLabel = '6♯/6♭';
  } else if (index >= 1 && index <= 5) {
    signatureLabel = `${signatureCount}♯`;
  } else if (index >= 7) {
    signatureLabel = `${signatureCount}♭`;
  }
  return {
    index,
    majorPc,
    minorPc,
    accidentalMode,
    signatureCount,
    signatureLabel,
  };
});

export interface KeyWedgeChord {
  roman: 'IV' | 'I' | 'V' | 'ii' | 'vi' | 'iii' | 'vii°';
  rootPc: number;
  quality: TriadQuality;
  circleIndex: number;
  ring: 'outer' | 'inner' | 'dim';
}

/**
 * Returns the diatonic chords for the selected Circle of Fifths key index.
 * The 6 primary chords form a 3x2 wedge: IV-I-V (outer) and ii-vi-iii (inner).
 */
export function getKeyWedge(circleIndex: number): KeyWedgeChord[] {
  const norm = ((circleIndex % 12) + 12) % 12;
  const ccw = (norm + 11) % 12;
  const cw = (norm + 1) % 12;

  const posCcw = CIRCLE_OF_FIFTHS[ccw];
  const posCenter = CIRCLE_OF_FIFTHS[norm];
  const posCw = CIRCLE_OF_FIFTHS[cw];

  return [
    { roman: 'IV', rootPc: posCcw.majorPc, quality: 'major', circleIndex: ccw, ring: 'outer' },
    { roman: 'I', rootPc: posCenter.majorPc, quality: 'major', circleIndex: norm, ring: 'outer' },
    { roman: 'V', rootPc: posCw.majorPc, quality: 'major', circleIndex: cw, ring: 'outer' },
    { roman: 'ii', rootPc: posCcw.minorPc, quality: 'minor', circleIndex: ccw, ring: 'inner' },
    { roman: 'vi', rootPc: posCenter.minorPc, quality: 'minor', circleIndex: norm, ring: 'inner' },
    { roman: 'iii', rootPc: posCw.minorPc, quality: 'minor', circleIndex: cw, ring: 'inner' },
    {
      roman: 'vii°',
      rootPc: (posCenter.majorPc + 11) % 12,
      quality: 'dim',
      circleIndex: (norm + 5) % 12,
      ring: 'dim',
    },
  ];
}

/**
 * Returns the 7 pitch classes of a major (ionian) or natural minor (aeolian) scale.
 */
export function getDiatonicScalePitchClasses(
  rootPc: number,
  mode: 'major' | 'minor'
): number[] {
  const intervals =
    mode === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  return intervals.map((i) => (rootPc + i) % 12);
}

/**
 * When stepping 1 notch CW (+1) or CCW (-1) around the Circle of Fifths,
 * returns the single pitch class that changed in the new major scale.
 */
export function getChangedPitchClass(
  prevIndex: number,
  nextIndex: number
): { pitchClass: number; direction: 'cw' | 'ccw' } | null {
  const prev = ((prevIndex % 12) + 12) % 12;
  const next = ((nextIndex % 12) + 12) % 12;
  const diff = (next - prev + 12) % 12;
  const nextMajorPc = CIRCLE_OF_FIFTHS[next].majorPc;

  if (diff === 1) {
    // Stepping CW by a 5th sharpens the 4th into the new leading tone (7th)
    return { pitchClass: (nextMajorPc + 11) % 12, direction: 'cw' };
  }
  if (diff === 11) {
    // Stepping CCW by a 4th flattens the 7th into the new 4th
    return { pitchClass: (nextMajorPc + 5) % 12, direction: 'ccw' };
  }
  return null;
}

const ORDER_OF_SHARPS = ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯'] as const;
const ORDER_OF_FLATS = ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭'] as const;

/**
 * Returns the ordered list of accidental labels in the key signature
 * for a given Circle of Fifths index (0 = C, 1 = G, ..., 11 = F).
 */
export function getKeySignatureAccidentals(
  circleIndex: number,
  preferMode?: AccidentalMode
): string[] {
  const norm = ((circleIndex % 12) + 12) % 12;
  if (norm === 0) return [];
  if (norm >= 1 && norm <= 5) {
    return ORDER_OF_SHARPS.slice(0, norm);
  }
  if (norm === 6) {
    return preferMode === 'flat'
      ? ORDER_OF_FLATS.slice(0, 6)
      : ORDER_OF_SHARPS.slice(0, 6);
  }
  return ORDER_OF_FLATS.slice(0, 12 - norm);
}
