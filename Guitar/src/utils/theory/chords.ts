import { getFretPitchClass } from './notes';

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
  { id: '1-2-3', label: 'S1–2–3 (G-string root)', strings: [0, 1, 2] },
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
