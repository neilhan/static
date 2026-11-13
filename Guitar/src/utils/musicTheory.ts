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

export type TileFilter = 'none' | 'gab-cde' | 'cde-fga' | 'efg-abc' | 'all';

export interface TileBlockRow {
  stringIndex: number;
  startFret: number;
  endFret: number;
}

export interface TileBlock {
  id: string;
  tileId: Exclude<TileFilter, 'none' | 'all'>;
  label: string;
  color: string;
  topStringIndex: number;
  bottomStringIndex: number;
  startFret: number;
  endFret: number;
  topStartFret?: number;
  topEndFret?: number;
  bottomStartFret?: number;
  bottomEndFret?: number;
  rowBounds?: TileBlockRow[];
}

export interface TileDefinition {
  id: Exclude<TileFilter, 'none' | 'all'>;
  label: string;
  subtitle: string;
  color: string;
  /** Base occurrences across string pairs (S6-S5, S4-S3, S2-S1) in standard tuning; +12 octave repeats are generated automatically */
  baseBoxes: Array<{
    topStringIndex: number;
    bottomStringIndex: number;
    startFret: number;
    endFret: number;
    topStartFret?: number;
    topEndFret?: number;
    bottomStartFret?: number;
    bottomEndFret?: number;
  }>;
}

export const REPEATING_TILE_DEFS: TileDefinition[] = [
  {
    id: 'gab-cde',
    label: 'G A B / C D E',
    subtitle: 'All occurrences across S6–S1 (including S1/S6 single-string & edge tiles)',
    color: '#06b6d4',
    baseBoxes: [
      { topStringIndex: 5, bottomStringIndex: 5, startFret: 8, endFret: 12 },
      { topStringIndex: 4, bottomStringIndex: 5, startFret: 3, endFret: 7 },
      { topStringIndex: 3, bottomStringIndex: 4, startFret: 10, endFret: 14 },
      { topStringIndex: 2, bottomStringIndex: 3, startFret: 5, endFret: 9 },
      {
        topStringIndex: 1,
        bottomStringIndex: 2,
        startFret: 0,
        endFret: 5,
        topStartFret: 1,
        topEndFret: 5,
        bottomStartFret: 0,
        bottomEndFret: 4,
      },
      { topStringIndex: 0, bottomStringIndex: 1, startFret: 8, endFret: 12 },
      { topStringIndex: 0, bottomStringIndex: 0, startFret: 3, endFret: 7 },
    ],
  },
  {
    id: 'cde-fga',
    label: 'C D E / F G A',
    subtitle: 'All occurrences across S6–S1 (including S1/S6 single-string & edge tiles)',
    color: '#a855f7',
    baseBoxes: [
      { topStringIndex: 5, bottomStringIndex: 5, startFret: 1, endFret: 5 },
      { topStringIndex: 4, bottomStringIndex: 5, startFret: 8, endFret: 12 },
      { topStringIndex: 3, bottomStringIndex: 4, startFret: 3, endFret: 7 },
      { topStringIndex: 2, bottomStringIndex: 3, startFret: 10, endFret: 14 },
      {
        topStringIndex: 1,
        bottomStringIndex: 2,
        startFret: 5,
        endFret: 10,
        topStartFret: 6,
        topEndFret: 10,
        bottomStartFret: 5,
        bottomEndFret: 9,
      },
      { topStringIndex: 0, bottomStringIndex: 1, startFret: 1, endFret: 5 },
      { topStringIndex: 0, bottomStringIndex: 0, startFret: 8, endFret: 12 },
    ],
  },
  {
    id: 'efg-abc',
    label: 'E F G / A B C',
    subtitle: 'All occurrences across S6–S1 (including S1/S6 single-string & edge tiles)',
    color: '#f59e0b',
    baseBoxes: [
      { topStringIndex: 5, bottomStringIndex: 5, startFret: 5, endFret: 8 },
      { topStringIndex: 4, bottomStringIndex: 5, startFret: 0, endFret: 3 },
      { topStringIndex: 3, bottomStringIndex: 4, startFret: 7, endFret: 10 },
      { topStringIndex: 2, bottomStringIndex: 3, startFret: 2, endFret: 5 },
      {
        topStringIndex: 1,
        bottomStringIndex: 2,
        startFret: 9,
        endFret: 13,
        topStartFret: 10,
        topEndFret: 13,
        bottomStartFret: 9,
        bottomEndFret: 12,
      },
      { topStringIndex: 0, bottomStringIndex: 1, startFret: 5, endFret: 8 },
      { topStringIndex: 0, bottomStringIndex: 0, startFret: 0, endFret: 3 },
    ],
  },
];

export function getTileBlocksForFretboard(
  maxFret: number,
  filter: TileFilter
): TileBlock[] {
  if (filter === 'none') return [];
  const defs =
    filter === 'all'
      ? REPEATING_TILE_DEFS
      : REPEATING_TILE_DEFS.filter((d) => d.id === filter);

  const blocks: TileBlock[] = [];
  for (const def of defs) {
    for (const base of def.baseBoxes) {
      for (const octaveShift of [-12, 0, 12, 24]) {
        const rawStart = base.startFret + octaveShift;
        const rawEnd = base.endFret + octaveShift;
        if (rawEnd < 0 || rawStart > maxFret) continue;
        const clippedStart = Math.max(0, rawStart);
        const clippedEnd = Math.min(maxFret, rawEnd);
        if (clippedStart > clippedEnd) continue;

        let steppedProps: Pick<
          TileBlock,
          'topStartFret' | 'topEndFret' | 'bottomStartFret' | 'bottomEndFret'
        > = {};
        let topStringIndex = base.topStringIndex;
        let bottomStringIndex = base.bottomStringIndex;

        if (
          base.topStartFret !== undefined &&
          base.topEndFret !== undefined &&
          base.bottomStartFret !== undefined &&
          base.bottomEndFret !== undefined
        ) {
          const topStart = Math.max(0, base.topStartFret + octaveShift);
          const topEnd = Math.min(maxFret, base.topEndFret + octaveShift);
          const bottomStart = Math.max(0, base.bottomStartFret + octaveShift);
          const bottomEnd = Math.min(maxFret, base.bottomEndFret + octaveShift);

          const hasTop = topStart <= topEnd;
          const hasBottom = bottomStart <= bottomEnd;
          if (!hasTop && !hasBottom) continue;

          if (hasTop && hasBottom) {
            steppedProps = {
              topStartFret: topStart,
              topEndFret: topEnd,
              bottomStartFret: bottomStart,
              bottomEndFret: bottomEnd,
            };
          } else if (hasTop) {
            bottomStringIndex = topStringIndex;
          } else {
            topStringIndex = bottomStringIndex;
          }
        }

        blocks.push({
          id: `${def.id}-${base.topStringIndex}-${clippedStart}-${octaveShift}`,
          tileId: def.id,
          label: def.label,
          color: def.color,
          topStringIndex,
          bottomStringIndex,
          startFret: clippedStart,
          endFret: clippedEnd,
          ...steppedProps,
        });
      }
    }
  }
  return blocks;
}

export type TriadQuality = 'major' | 'minor' | 'dim' | 'aug';

export interface TriadDefinition {
  id: TriadQuality;
  label: string;
  suffix: string;
  intervals: [number, number, number];
  degreeLabels: [string, string, string];
}

export const TRIAD_DEFINITIONS: Record<TriadQuality, TriadDefinition> = {
  major: {
    id: 'major',
    label: 'Major',
    suffix: '',
    intervals: [0, 4, 7],
    degreeLabels: ['R', '3', '5'],
  },
  minor: {
    id: 'minor',
    label: 'Minor',
    suffix: 'm',
    intervals: [0, 3, 7],
    degreeLabels: ['R', 'b3', '5'],
  },
  dim: {
    id: 'dim',
    label: 'Diminished',
    suffix: 'dim',
    intervals: [0, 3, 6],
    degreeLabels: ['R', 'b3', 'b5'],
  },
  aug: {
    id: 'aug',
    label: 'Augmented',
    suffix: 'aug',
    intervals: [0, 4, 8],
    degreeLabels: ['R', '3', '#5'],
  },
};

export const THREE_STRING_SETS: Array<{
  id: string;
  label: string;
  strings: [number, number, number];
}> = [
  { id: '1-2-3', label: 'S1–2–3 (e B G)', strings: [0, 1, 2] },
  { id: '2-3-4', label: 'S2–3–4 (B G D)', strings: [1, 2, 3] },
  { id: '3-4-5', label: 'S3–4–5 (G D A)', strings: [2, 3, 4] },
  { id: '4-5-6', label: 'S4–5–6 (D A E)', strings: [3, 4, 5] },
];

export interface TriadNote {
  stringIndex: number;
  fret: number;
  pc: number;
  degree: string;
  degreeIndex: 0 | 1 | 2;
}

export type TriadInversion = 'Root Position' | '1st Inversion' | '2nd Inversion';

export interface TriadVoicing {
  id: string;
  inversion: TriadInversion;
  notes: TriadNote[];
  minFret: number;
  maxFret: number;
  chordLabel?: string;
  color?: string;
}

export function getTriadDegree(
  pc: number,
  rootPc: number,
  quality: TriadQuality
): { degree: string; index: 0 | 1 | 2 } | null {
  const def = TRIAD_DEFINITIONS[quality];
  const interval = ((pc - rootPc) % 12 + 12) % 12;
  const idx = def.intervals.indexOf(interval);
  if (idx === -1) return null;
  const degreeIndex = idx as 0 | 1 | 2;
  return { degree: def.degreeLabels[degreeIndex], index: degreeIndex };
}

export function getTriadVoicings(
  tuningStrings: number[],
  maxFret: number,
  selectedStringIndices: number[],
  rootPc: number,
  quality: TriadQuality,
  maxFretSpan = 4
): TriadVoicing[] {
  if (selectedStringIndices.length !== 3) return [];
  const sortedStrings = [...selectedStringIndices].sort((a, b) => a - b);
  const [sTop, sMid, sBot] = sortedStrings;

  const candidatesForString = (stringIndex: number): TriadNote[] => {
    const openPc = tuningStrings[stringIndex];
    if (openPc === undefined) return [];
    const list: TriadNote[] = [];
    for (let fret = 0; fret <= maxFret; fret++) {
      const pc = getFretPitchClass(openPc, fret);
      const deg = getTriadDegree(pc, rootPc, quality);
      if (deg) {
        list.push({
          stringIndex,
          fret,
          pc,
          degree: deg.degree,
          degreeIndex: deg.index,
        });
      }
    }
    return list;
  };

  const topNotes = candidatesForString(sTop);
  const midNotes = candidatesForString(sMid);
  const botNotes = candidatesForString(sBot);

  const voicings: TriadVoicing[] = [];

  for (const nTop of topNotes) {
    for (const nMid of midNotes) {
      if (nTop.degreeIndex === nMid.degreeIndex) continue;
      for (const nBot of botNotes) {
        if (
          nBot.degreeIndex === nTop.degreeIndex ||
          nBot.degreeIndex === nMid.degreeIndex
        ) {
          continue;
        }
        const minF = Math.min(nTop.fret, nMid.fret, nBot.fret);
        const maxF = Math.max(nTop.fret, nMid.fret, nBot.fret);
        if (maxF - minF > maxFretSpan) continue;

        const inversion: TriadInversion =
          nBot.degreeIndex === 0
            ? 'Root Position'
            : nBot.degreeIndex === 1
            ? '1st Inversion'
            : '2nd Inversion';

        voicings.push({
          id: `${sTop}:${nTop.fret}-${sMid}:${nMid.fret}-${sBot}:${nBot.fret}`,
          inversion,
          notes: [nTop, nMid, nBot],
          minFret: minF,
          maxFret: maxF,
        });
      }
    }
  }

  voicings.sort((a, b) => a.minFret - b.minFret || a.maxFret - b.maxFret);
  return voicings;
}

export type SeventhQuality = 'maj7' | 'dom7' | 'min7' | 'm7b5' | 'dim7';

export interface SeventhDefinition {
  id: SeventhQuality;
  label: string;
  suffix: string;
  intervals: [number, number, number, number];
  degreeLabels: [string, string, string, string];
}

export const SEVENTH_DEFINITIONS: Record<SeventhQuality, SeventhDefinition> = {
  maj7: {
    id: 'maj7',
    label: 'Major 7',
    suffix: 'maj7',
    intervals: [0, 4, 7, 11],
    degreeLabels: ['R', '3', '5', '7'],
  },
  dom7: {
    id: 'dom7',
    label: 'Dominant 7',
    suffix: '7',
    intervals: [0, 4, 7, 10],
    degreeLabels: ['R', '3', '5', 'b7'],
  },
  min7: {
    id: 'min7',
    label: 'Minor 7',
    suffix: 'm7',
    intervals: [0, 3, 7, 10],
    degreeLabels: ['R', 'b3', '5', 'b7'],
  },
  m7b5: {
    id: 'm7b5',
    label: 'Half-Dim (m7b5)',
    suffix: 'm7b5',
    intervals: [0, 3, 6, 10],
    degreeLabels: ['R', 'b3', 'b5', 'b7'],
  },
  dim7: {
    id: 'dim7',
    label: 'Diminished 7',
    suffix: 'dim7',
    intervals: [0, 3, 6, 9],
    degreeLabels: ['R', 'b3', 'b5', 'bb7'],
  },
};

export const SHELL_STRING_SETS: Array<{
  id: string;
  label: string;
  strings: [number, number, number];
}> = [
  { id: '2-3-4', label: 'S2–3–4 (D-string root)', strings: [1, 2, 3] },
  { id: '2-3-5', label: 'S2–3–5 (A-string skip)', strings: [1, 2, 4] },
  { id: '3-4-5', label: 'S3–4–5 (A-string root)', strings: [2, 3, 4] },
  { id: '3-4-6', label: 'S3–4–6 (E-string root)', strings: [2, 3, 5] },
];

export type ChordInversion =
  | 'Root Position'
  | '1st Inversion'
  | '2nd Inversion'
  | '3rd Inversion';

export interface ChordNote {
  stringIndex: number;
  fret: number;
  pc: number;
  degree: string;
  degreeIndex: 0 | 1 | 2 | 3;
}

export interface SeventhVoicing {
  id: string;
  inversion: ChordInversion;
  notes: ChordNote[];
  minFret: number;
  maxFret: number;
  chordLabel?: string;
  color?: string;
}

export function getSeventhDegree(
  pc: number,
  rootPc: number,
  quality: SeventhQuality
): { degree: string; index: 0 | 1 | 2 | 3 } | null {
  const def = SEVENTH_DEFINITIONS[quality];
  const interval = ((pc - rootPc) % 12 + 12) % 12;
  const idx = def.intervals.indexOf(interval);
  if (idx === -1) return null;
  const degreeIndex = idx as 0 | 1 | 2 | 3;
  return { degree: def.degreeLabels[degreeIndex], index: degreeIndex };
}

export function getShellVoicings(
  tuningStrings: number[],
  maxFret: number,
  selectedStringIndices: number[],
  rootPc: number,
  quality: SeventhQuality,
  maxFretSpan = 4
): SeventhVoicing[] {
  if (selectedStringIndices.length !== 3) return [];
  const sortedStrings = [...selectedStringIndices].sort((a, b) => a - b);
  const [sTop, sMid, sBot] = sortedStrings;

  const candidatesForString = (stringIndex: number): ChordNote[] => {
    const openPc = tuningStrings[stringIndex];
    if (openPc === undefined) return [];
    const list: ChordNote[] = [];
    for (let fret = 0; fret <= maxFret; fret++) {
      const pc = getFretPitchClass(openPc, fret);
      const deg = getSeventhDegree(pc, rootPc, quality);
      // Shell voicings keep only Root (0), 3rd (1), and 7th (3) — dropping the 5th (2)
      if (deg && deg.index !== 2) {
        list.push({
          stringIndex,
          fret,
          pc,
          degree: deg.degree,
          degreeIndex: deg.index,
        });
      }
    }
    return list;
  };

  const cTop = candidatesForString(sTop);
  const cMid = candidatesForString(sMid);
  const cBot = candidatesForString(sBot);

  const voicings: SeventhVoicing[] = [];

  for (const nTop of cTop) {
    for (const nMid of cMid) {
      if (nTop.degreeIndex === nMid.degreeIndex) continue;
      if (Math.abs(nTop.fret - nMid.fret) > maxFretSpan) continue;
      for (const nBot of cBot) {
        if (
          nBot.degreeIndex === nTop.degreeIndex ||
          nBot.degreeIndex === nMid.degreeIndex
        ) {
          continue;
        }
        const minF = Math.min(nTop.fret, nMid.fret, nBot.fret);
        const maxF = Math.max(nTop.fret, nMid.fret, nBot.fret);
        if (maxF - minF > maxFretSpan) continue;

        const inversion: ChordInversion =
          nBot.degreeIndex === 0
            ? 'Root Position'
            : nBot.degreeIndex === 1
            ? '1st Inversion'
            : '3rd Inversion';

        voicings.push({
          id: `${sTop}:${nTop.fret}-${sMid}:${nMid.fret}-${sBot}:${nBot.fret}`,
          inversion,
          notes: [nTop, nMid, nBot],
          minFret: minF,
          maxFret: maxF,
        });
      }
    }
  }

  voicings.sort((a, b) => a.minFret - b.minFret || a.maxFret - b.maxFret);
  return voicings;
}

export type PentatonicMode = 'minor' | 'major';

export interface PentatonicDefinition {
  id: PentatonicMode;
  label: string;
  intervals: [number, number, number, number, number];
  degreeLabels: [string, string, string, string, string];
  relativeOffset: number;
  relativeLabel: string;
}

export const PENTATONIC_DEFINITIONS: Record<PentatonicMode, PentatonicDefinition> = {
  minor: {
    id: 'minor',
    label: 'Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    degreeLabels: ['R', 'b3', '4', '5', 'b7'],
    relativeOffset: 3,
    relativeLabel: 'Major',
  },
  major: {
    id: 'major',
    label: 'Major Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    degreeLabels: ['R', '2', '3', '5', '6'],
    relativeOffset: 9,
    relativeLabel: 'Minor',
  },
};

export const PENTATONIC_PATTERN_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#06b6d4',
  3: '#10b981',
  4: '#a855f7',
  5: '#f59e0b',
};

export interface PentatonicBox {
  id: string;
  patternNumber: 1 | 2 | 3 | 4 | 5;
  label: string;
  color: string;
  minFret: number;
  maxFret: number;
  /** Notes per string (indexed 0..5 = S1..S6), 2 frets each */
  stringFrets: Array<{ stringIndex: number; frets: [number, number] }>;
}

export function getPentatonicDegree(
  pc: number,
  rootPc: number,
  mode: PentatonicMode,
  includeBlues = false
): { degree: string; index: number; isBlues: boolean } | null {
  const def = PENTATONIC_DEFINITIONS[mode];
  const interval = ((pc - rootPc) % 12 + 12) % 12;
  const idx = def.intervals.indexOf(interval);
  if (idx !== -1) {
    return { degree: def.degreeLabels[idx], index: idx, isBlues: false };
  }
  if (includeBlues) {
    if (mode === 'minor' && interval === 6) {
      return { degree: 'b5', index: -1, isBlues: true };
    }
    if (mode === 'major' && interval === 3) {
      return { degree: 'b3', index: -1, isBlues: true };
    }
  }
  return null;
}

export function getPentatonicBoxes(
  tuningStrings: number[],
  maxFret: number,
  rootPc: number,
  mode: PentatonicMode
): PentatonicBox[] {
  const minorRootPc = mode === 'minor' ? rootPc : (rootPc + 9) % 12;
  const minorIntervals = PENTATONIC_DEFINITIONS.minor.intervals;
  const boxes: PentatonicBox[] = [];

  for (let p = 1; p <= 5; p++) {
    const patternNumber = p as 1 | 2 | 3 | 4 | 5;
    const startPc = (minorRootPc + minorIntervals[patternNumber - 1]) % 12;
    const lowEOpen = tuningStrings[5] ?? 4;
    const baseS6Fret = ((startPc - lowEOpen) % 12 + 12) % 12;

    for (const octaveShift of [0, 12]) {
      const anchorFret = baseS6Fret + octaveShift;
      if (anchorFret > maxFret) continue;

      const stringFrets: Array<{ stringIndex: number; frets: [number, number] }> = [];
      let boxMin = Infinity;
      let boxMax = -Infinity;
      let valid = true;

      // Walk from S6 (index 5) up to S1 (index 0), finding the 2 consecutive pentatonic notes per string
      let targetPcIdx = patternNumber - 1;
      for (let sIdx = 5; sIdx >= 0; sIdx--) {
        const openPc = tuningStrings[sIdx];
        const firstPc = (minorRootPc + minorIntervals[targetPcIdx % 5]) % 12;
        const secondPc = (minorRootPc + minorIntervals[(targetPcIdx + 1) % 5]) % 12;

        // Find fret >= Math.max(0, anchorFret - 1) nearest to anchorFret
        let f1 = -1;
        for (let f = Math.max(0, anchorFret - 2); f <= maxFret; f++) {
          if (getFretPitchClass(openPc, f) === firstPc) {
            f1 = f;
            break;
          }
        }
        let f2 = -1;
        if (f1 !== -1) {
          for (let f = f1 + 1; f <= maxFret; f++) {
            if (getFretPitchClass(openPc, f) === secondPc) {
              f2 = f;
              break;
            }
          }
        }
        if (f1 === -1 || f2 === -1) {
          valid = false;
          break;
        }
        stringFrets.push({ stringIndex: sIdx, frets: [f1, f2] });
        boxMin = Math.min(boxMin, f1);
        boxMax = Math.max(boxMax, f2);
        targetPcIdx += 2;
      }

      if (!valid) continue;

      boxes.push({
        id: `pent-${patternNumber}-${boxMin}`,
        patternNumber,
        label: `Pattern ${patternNumber}`,
        color: PENTATONIC_PATTERN_COLORS[patternNumber],
        minFret: boxMin,
        maxFret: boxMax,
        stringFrets,
      });
    }
  }

  boxes.sort((a, b) => a.minFret - b.minFret || a.patternNumber - b.patternNumber);
  return boxes;
}

export type PentatonicShiftGroup = 'all' | 'even' | 'odd';
export type PentatonicShiftShape = '2-3' | '3-2';

export function getPentatonicOctaveShiftBlocks(
  tuningStrings: number[],
  maxFret: number,
  rootPc: number,
  mode: PentatonicMode,
  shape: PentatonicShiftShape,
  group: PentatonicShiftGroup
): TileBlock[] {
  // Anchor on the Major Pentatonic root (R, 2, 3 = the only 3-note group spanning 4 frets: W + W)
  const majorRootPc = mode === 'major' ? rootPc : (rootPc + 3) % 12;
  const rPc = majorRootPc;
  const twoPc = (majorRootPc + 2) % 12;
  const threePc = (majorRootPc + 4) % 12;
  const fivePc = (majorRootPc + 7) % 12;
  const sixPc = (majorRootPc + 9) % 12;

  const color = shape === '2-3' ? '#06b6d4' : '#a855f7';
  const labelPrefix = shape === '2-3' ? '2+3' : '3+2';

  const evenPairs = [
    { topS: 4, botS: 5, shiftLabel: 'Base', targetShift: 0 },
    { topS: 2, botS: 3, shiftLabel: '+2 frets', targetShift: 2 },
    { topS: 0, botS: 1, shiftLabel: '+3 frets (B-shift)', targetShift: 5 },
  ];
  const oddPairs = [
    { topS: 3, botS: 4, shiftLabel: 'Base', targetShift: 0 },
    { topS: 1, botS: 2, shiftLabel: '+3 frets (B-shift)', targetShift: 3 },
  ];

  const pairs: Array<{
    topS: number;
    botS: number;
    shiftLabel: string;
    targetShift: number;
  }> =
    group === 'all'
      ? [
          evenPairs[0],
          oddPairs[0],
          evenPairs[1],
          oddPairs[1],
          evenPairs[2],
        ]
      : group === 'even'
        ? evenPairs
        : oddPairs;

  const getPcAtVirtualFret = (openPc: number, fret: number): number =>
    (((openPc + fret) % 12) + 12) % 12;

  const findNextFret = (
    stringIndex: number,
    minSearchFret: number,
    targetPc: number
  ): number => {
    const openPc = tuningStrings[stringIndex];
    for (let f = minSearchFret; f <= maxFret + 5; f++) {
      if (getPcAtVirtualFret(openPc, f) === targetPc) return f;
    }
    return -999;
  };

  const blocks: TileBlock[] = [];
  const seen = new Set<string>();

  for (const pair of pairs) {
    const botOpen = tuningStrings[pair.botS];
    const startTargetPc = shape === '2-3' ? fivePc : rPc;

    for (let f = -5; f <= maxFret; f++) {
      if (getPcAtVirtualFret(botOpen, f) !== startTargetPc) continue;

      let startFret = f;
      let endFret = f;
      let rawTopStart = f;
      let rawTopEnd = f;
      let rawBotStart = f;
      let rawBotEnd = f;

      if (shape === '2-3') {
        const fLow1 = f;
        const fLow2 = findNextFret(pair.botS, fLow1 + 1, sixPc);
        if (fLow2 === -999) continue;

        const fUp1 = findNextFret(pair.topS, fLow1 - 1, rPc);
        if (fUp1 === -999) continue;
        const fUp2 = findNextFret(pair.topS, fUp1 + 1, twoPc);
        if (fUp2 === -999) continue;
        const fUp3 = findNextFret(pair.topS, fUp2 + 1, threePc);
        if (fUp3 === -999) continue;

        rawBotStart = fLow1;
        rawBotEnd = fLow2;
        rawTopStart = fUp1;
        rawTopEnd = fUp3;
        startFret = Math.min(rawBotStart, rawTopStart);
        endFret = Math.max(rawBotEnd, rawTopEnd);
      } else {
        const fLow1 = f;
        const fLow2 = findNextFret(pair.botS, fLow1 + 1, twoPc);
        if (fLow2 === -999) continue;
        const fLow3 = findNextFret(pair.botS, fLow2 + 1, threePc);
        if (fLow3 === -999) continue;

        const fUp1 = findNextFret(pair.topS, fLow1, fivePc);
        if (fUp1 === -999) continue;
        const fUp2 = findNextFret(pair.topS, fUp1 + 1, sixPc);
        if (fUp2 === -999) continue;

        rawBotStart = fLow1;
        rawBotEnd = fLow3;
        rawTopStart = fUp1;
        rawTopEnd = fUp2;
        startFret = Math.min(rawBotStart, rawTopStart);
        endFret = Math.max(rawBotEnd, rawTopEnd);
      }

      if (endFret - startFret > 5) continue;
      if (endFret < 0 || startFret > maxFret) continue;

      const clampRow = (rowStart: number, rowEnd: number) => {
        if (rowEnd < 0 || rowStart > maxFret) return undefined;
        return {
          start: Math.max(0, rowStart),
          end: Math.min(maxFret, rowEnd),
        };
      };
      const topBounds = clampRow(rawTopStart, rawTopEnd);
      const botBounds = clampRow(rawBotStart, rawBotEnd);
      if (!topBounds && !botBounds) continue;

      let topStringIndex = pair.topS;
      let bottomStringIndex = pair.botS;
      let clippedStart = Math.max(0, startFret);
      let clippedEnd = Math.min(maxFret, endFret);
      let steppedProps: Pick<
        TileBlock,
        'topStartFret' | 'topEndFret' | 'bottomStartFret' | 'bottomEndFret'
      > = {};

      if (topBounds && botBounds) {
        steppedProps = {
          topStartFret: topBounds.start,
          topEndFret: topBounds.end,
          bottomStartFret: botBounds.start,
          bottomEndFret: botBounds.end,
        };
      } else if (topBounds) {
        bottomStringIndex = pair.topS;
        clippedStart = topBounds.start;
        clippedEnd = topBounds.end;
      } else if (botBounds) {
        topStringIndex = pair.botS;
        clippedStart = botBounds.start;
        clippedEnd = botBounds.end;
      }

      const dedupeKey = `${topStringIndex}-${bottomStringIndex}-${clippedStart}-${clippedEnd}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      blocks.push({
        id: `pent-shift-${shape}-${dedupeKey}`,
        tileId: 'gab-cde',
        label: `${labelPrefix} (${pair.shiftLabel})`,
        color,
        topStringIndex,
        bottomStringIndex,
        startFret: clippedStart,
        endFret: clippedEnd,
        ...steppedProps,
      });
    }
  }

  // Include cut-off edge tiles on String 6 (bottom edge) and String 1 (top edge)
  if (group === 'all' && tuningStrings.length >= 2) {
    const edgeSpecs: Array<{
      stringIndex: number;
      startPc: number;
      span: number;
    }> = [
      {
        stringIndex: tuningStrings.length - 1,
        startPc: shape === '2-3' ? rPc : fivePc,
        span: shape === '2-3' ? 4 : 2,
      },
      {
        stringIndex: 0,
        startPc: shape === '2-3' ? fivePc : rPc,
        span: shape === '2-3' ? 2 : 4,
      },
    ];

    for (const edge of edgeSpecs) {
      const openPc = tuningStrings[edge.stringIndex];
      for (let f = -edge.span; f <= maxFret; f++) {
        if (getPcAtVirtualFret(openPc, f) !== edge.startPc) continue;
        const rawStart = f;
        const rawEnd = f + edge.span;
        if (rawEnd < 0 || rawStart > maxFret) continue;
        const clippedStart = Math.max(0, rawStart);
        const clippedEnd = Math.min(maxFret, rawEnd);
        const dedupeKey = `${edge.stringIndex}-${edge.stringIndex}-${clippedStart}-${clippedEnd}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        blocks.push({
          id: `pent-shift-${shape}-edge-${dedupeKey}`,
          tileId: 'gab-cde',
          label: `${labelPrefix} (Edge)`,
          color,
          topStringIndex: edge.stringIndex,
          bottomStringIndex: edge.stringIndex,
          startFret: clippedStart,
          endFret: clippedEnd,
        });
      }
    }
  }

  return blocks;
}

