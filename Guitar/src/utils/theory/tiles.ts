export type TileFilter = 'none' | 'gab-cde' | 'cde-fga' | 'efg-abc' | 'bcd-efg' | 'all';

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
  {
    id: 'bcd-efg',
    label: 'B C D / E F G',
    subtitle: 'All occurrences across S6–S1 (including S1/S6 single-string & edge tiles)',
    color: '#10b981',
    baseBoxes: [
      { topStringIndex: 5, bottomStringIndex: 5, startFret: 0, endFret: 3 },
      { topStringIndex: 4, bottomStringIndex: 5, startFret: 7, endFret: 10 },
      { topStringIndex: 3, bottomStringIndex: 4, startFret: 2, endFret: 5 },
      { topStringIndex: 2, bottomStringIndex: 3, startFret: 9, endFret: 12 },
      {
        topStringIndex: 1,
        bottomStringIndex: 2,
        startFret: 4,
        endFret: 8,
        topStartFret: 5,
        topEndFret: 8,
        bottomStartFret: 4,
        bottomEndFret: 7,
      },
      { topStringIndex: 0, bottomStringIndex: 1, startFret: 0, endFret: 3 },
      { topStringIndex: 0, bottomStringIndex: 0, startFret: 7, endFret: 10 },
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
