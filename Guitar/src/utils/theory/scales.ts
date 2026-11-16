import { getFretPitchClass } from './notes';
import { TileBlock } from './tiles';

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

export type DiatonicMode =
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian';

export type ScaleLayoutMode = '3nps' | 'caged';

export interface DiatonicScaleDefinition {
  id: DiatonicMode;
  label: string;
  shortLabel: string;
  intervals: [number, number, number, number, number, number, number];
  degreeLabels: [string, string, string, string, string, string, string];
  /** Semitones from this mode's root up to its parent Major (Ionian) root */
  parentMajorOffset: number;
  /** Degree label that gives this mode its characteristic color */
  characteristicDegree: string;
}

export const DIATONIC_SCALE_ORDER: DiatonicMode[] = [
  'ionian',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'aeolian',
  'locrian',
];

export const DIATONIC_SCALE_DEFINITIONS: Record<DiatonicMode, DiatonicScaleDefinition> = {
  ionian: {
    id: 'ionian',
    label: 'Major (Ionian)',
    shortLabel: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degreeLabels: ['R', '2', '3', '4', '5', '6', '7'],
    parentMajorOffset: 0,
    characteristicDegree: '7',
  },
  dorian: {
    id: 'dorian',
    label: 'Dorian',
    shortLabel: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degreeLabels: ['R', '2', 'b3', '4', '5', '6', 'b7'],
    parentMajorOffset: 10,
    characteristicDegree: '6',
  },
  phrygian: {
    id: 'phrygian',
    label: 'Phrygian',
    shortLabel: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    degreeLabels: ['R', 'b2', 'b3', '4', '5', 'b6', 'b7'],
    parentMajorOffset: 8,
    characteristicDegree: 'b2',
  },
  lydian: {
    id: 'lydian',
    label: 'Lydian',
    shortLabel: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degreeLabels: ['R', '2', '3', '#4', '5', '6', '7'],
    parentMajorOffset: 7,
    characteristicDegree: '#4',
  },
  mixolydian: {
    id: 'mixolydian',
    label: 'Mixolydian',
    shortLabel: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degreeLabels: ['R', '2', '3', '4', '5', '6', 'b7'],
    parentMajorOffset: 5,
    characteristicDegree: 'b7',
  },
  aeolian: {
    id: 'aeolian',
    label: 'Natural Minor (Aeolian)',
    shortLabel: 'Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degreeLabels: ['R', '2', 'b3', '4', '5', 'b6', 'b7'],
    parentMajorOffset: 3,
    characteristicDegree: 'b6',
  },
  locrian: {
    id: 'locrian',
    label: 'Locrian',
    shortLabel: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degreeLabels: ['R', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
    parentMajorOffset: 1,
    characteristicDegree: 'b5',
  },
};

export const SCALE_PATTERN_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f59e0b',
  3: '#10b981',
  4: '#06b6d4',
  5: '#3b82f6',
  6: '#8b5cf6',
  7: '#ec4899',
};

const CAGED_SHAPE_NAMES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'G Shape',
  2: 'E Shape',
  3: 'D Shape',
  4: 'C Shape',
  5: 'A Shape',
};

export interface ScaleBox {
  id: string;
  positionNumber: number;
  label: string;
  color: string;
  minFret: number;
  maxFret: number;
  stringFrets: Array<{ stringIndex: number; frets: [number, number]; notes: number[] }>;
}

export function getDiatonicDegree(
  pc: number,
  rootPc: number,
  mode: DiatonicMode
): { degree: string; index: number; isCharacteristic: boolean } | null {
  const def = DIATONIC_SCALE_DEFINITIONS[mode];
  const interval = ((pc - rootPc) % 12 + 12) % 12;
  const idx = def.intervals.indexOf(interval);
  if (idx === -1) return null;
  const degree = def.degreeLabels[idx];
  return {
    degree,
    index: idx,
    isCharacteristic: degree === def.characteristicDegree,
  };
}

export function getDiatonicScaleBoxes(
  tuningStrings: number[],
  maxFret: number,
  rootPc: number,
  mode: DiatonicMode,
  layout: ScaleLayoutMode
): ScaleBox[] {
  const def = DIATONIC_SCALE_DEFINITIONS[mode];
  const boxes: ScaleBox[] = [];

  if (layout === 'caged') {
    const parentMajorPc = (rootPc + def.parentMajorOffset) % 12;
    const pentBoxes = getPentatonicBoxes(tuningStrings, maxFret, parentMajorPc, 'major');
    for (const pent of pentBoxes) {
      const stringFrets: ScaleBox['stringFrets'] = [];
      let boxMin = Infinity;
      let boxMax = -Infinity;

      for (let sIdx = 5; sIdx >= 0; sIdx--) {
        const openPc = tuningStrings[sIdx];
        // In CAGED G Shape (pattern 1), the 7th degree on S3 sits 1 fret below pent.minFret
        const rowMinFret =
          pent.patternNumber === 1 && sIdx === 2
            ? Math.max(0, pent.minFret - 1)
            : pent.minFret;
        // In CAGED A Shape (pattern 5), the B-string shift puts the 4th degree 1 fret past pent.maxFret
        const rowMaxFret =
          pent.patternNumber === 5 && sIdx === 1
            ? Math.min(maxFret, pent.maxFret + 1)
            : pent.maxFret;
        const notes: number[] = [];
        for (let f = rowMinFret; f <= rowMaxFret; f++) {
          if (getDiatonicDegree(getFretPitchClass(openPc, f), rootPc, mode)) {
            notes.push(f);
          }
        }
        if (notes.length === 0) continue;
        stringFrets.push({
          stringIndex: sIdx,
          frets: [notes[0], notes[notes.length - 1]],
          notes,
        });
        boxMin = Math.min(boxMin, notes[0]);
        boxMax = Math.max(boxMax, notes[notes.length - 1]);
      }

      if (stringFrets.length === 0) continue;
      boxes.push({
        id: `scale-caged-${pent.patternNumber}-${boxMin}`,
        positionNumber: pent.patternNumber,
        label: `Pos ${pent.patternNumber} (${CAGED_SHAPE_NAMES[pent.patternNumber]})`,
        color: SCALE_PATTERN_COLORS[pent.patternNumber],
        minFret: boxMin,
        maxFret: boxMax,
        stringFrets,
      });
    }

    boxes.sort((a, b) => a.minFret - b.minFret || a.positionNumber - b.positionNumber);
    return boxes;
  }

  // 3-Notes-Per-String (3NPS): 7 interlocking positions
  const lowEOpen = tuningStrings[5] ?? 4;
  for (let p = 1; p <= 7; p++) {
    const startPc = (rootPc + def.intervals[p - 1]) % 12;
    const baseS6Fret = ((startPc - lowEOpen) % 12 + 12) % 12;

    for (const octaveShift of [0, 12]) {
      const anchorFret = baseS6Fret + octaveShift;
      if (anchorFret > maxFret) continue;

      const stringFrets: ScaleBox['stringFrets'] = [];
      let boxMin = Infinity;
      let boxMax = -Infinity;
      let valid = true;
      let targetIdx = p - 1;
      let prevF1 = anchorFret;

      for (let sIdx = 5; sIdx >= 0; sIdx--) {
        const openPc = tuningStrings[sIdx];
        const pc1 = (rootPc + def.intervals[targetIdx % 7]) % 12;
        const pc2 = (rootPc + def.intervals[(targetIdx + 1) % 7]) % 12;
        const pc3 = (rootPc + def.intervals[(targetIdx + 2) % 7]) % 12;

        const searchStart = sIdx === 5 ? anchorFret : Math.max(0, prevF1 - 1);
        let f1 = -1;
        for (let f = searchStart; f <= maxFret; f++) {
          if (getFretPitchClass(openPc, f) === pc1) {
            f1 = f;
            break;
          }
        }
        let f2 = -1;
        if (f1 !== -1) {
          for (let f = f1 + 1; f <= maxFret; f++) {
            if (getFretPitchClass(openPc, f) === pc2) {
              f2 = f;
              break;
            }
          }
        }
        let f3 = -1;
        if (f2 !== -1) {
          for (let f = f2 + 1; f <= maxFret; f++) {
            if (getFretPitchClass(openPc, f) === pc3) {
              f3 = f;
              break;
            }
          }
        }

        if (f1 === -1 || f2 === -1 || f3 === -1) {
          valid = false;
          break;
        }

        stringFrets.push({
          stringIndex: sIdx,
          frets: [f1, f3],
          notes: [f1, f2, f3],
        });
        boxMin = Math.min(boxMin, f1);
        boxMax = Math.max(boxMax, f3);
        prevF1 = f1;
        targetIdx += 3;
      }

      if (!valid) continue;

      boxes.push({
        id: `scale-3nps-${p}-${boxMin}`,
        positionNumber: p,
        label: `Pos ${p} (${def.degreeLabels[p - 1]})`,
        color: SCALE_PATTERN_COLORS[p],
        minFret: boxMin,
        maxFret: boxMax,
        stringFrets,
      });
    }
  }

  boxes.sort((a, b) => a.minFret - b.minFret || a.positionNumber - b.positionNumber);
  return boxes;
}

export function scaleBoxesToOverlayBlocks(boxes: ScaleBox[]): TileBlock[] {
  return boxes.map((b) => ({
    id: `scale-overlay-${b.id}`,
    tileId: 'gab-cde',
    label: b.label,
    color: b.color,
    topStringIndex: 0,
    bottomStringIndex: 5,
    startFret: b.minFret,
    endFret: b.maxFret,
    rowBounds: [...b.stringFrets]
      .sort((a, c) => a.stringIndex - c.stringIndex)
      .map((sf) => ({
        stringIndex: sf.stringIndex,
        startFret: sf.frets[0],
        endFret: sf.frets[1],
      })),
  }));
}
