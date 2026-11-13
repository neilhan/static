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

export interface TileBlock {
  id: string;
  tileId: Exclude<TileFilter, 'none' | 'all'>;
  label: string;
  color: string;
  topStringIndex: number;
  bottomStringIndex: number;
  startFret: number;
  endFret: number;
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
      { topStringIndex: 1, bottomStringIndex: 2, startFret: 0, endFret: 5 },
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
      { topStringIndex: 1, bottomStringIndex: 2, startFret: 5, endFret: 10 },
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
      { topStringIndex: 1, bottomStringIndex: 2, startFret: 9, endFret: 13 },
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
        blocks.push({
          id: `${def.id}-${base.topStringIndex}-${clippedStart}-${octaveShift}`,
          tileId: def.id,
          label: def.label,
          color: def.color,
          topStringIndex: base.topStringIndex,
          bottomStringIndex: base.bottomStringIndex,
          startFret: clippedStart,
          endFret: clippedEnd,
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
  { id: '6-4-3', label: 'S6–4–3 (E-string root)', strings: [2, 3, 5] },
  { id: '5-4-3', label: 'S5–4–3 (A-string root)', strings: [2, 3, 4] },
  { id: '5-3-2', label: 'S5–3–2 (A-string skip)', strings: [1, 2, 4] },
  { id: '4-3-2', label: 'S4–3–2 (D-string root)', strings: [1, 2, 3] },
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

