import React from 'react';
import {
  AccidentalMode,
  formatPitchClass,
  PITCH_CLASS_COLORS,
  REPEATING_TILE_DEFS,
  TileFilter,
} from '../utils/musicTheory';
import { PatternFilter } from './Fretboard';
import { MiniFretboard, MiniFretNote } from './MiniFretboard';
import { SectionHeader } from './SectionHeader';
import './RepeatingTilesBoard.css';

interface RepeatingTilesBoardProps {
  accidentals: AccidentalMode;
  selectedPitchClasses: number[];
  activeSet: PatternFilter;
  onSelectSet: (set: PatternFilter) => void;
  tileFilter: TileFilter;
  onSelectTile: (filter: TileFilter) => void;
}

const TILE_COLS = [0, 1, 2, 3, 4];

const TILE_MINI_PATTERNS: Record<
  Exclude<TileFilter, 'none' | 'all'>,
  { topLabel: string; bottomLabel: string; notes: MiniFretNote[] }
> = {
  'gab-cde': {
    topLabel: 'S5 (A) / S3 (G)',
    bottomLabel: 'S6 (E) / S4 (D)',
    notes: [
      { row: 0, col: 0, label: 'C', color: PITCH_CLASS_COLORS[0] },
      { row: 0, col: 2, label: 'D', color: PITCH_CLASS_COLORS[2] },
      { row: 0, col: 4, label: 'E', color: PITCH_CLASS_COLORS[4] },
      { row: 1, col: 0, label: 'G', color: PITCH_CLASS_COLORS[7] },
      { row: 1, col: 2, label: 'A', color: PITCH_CLASS_COLORS[9] },
      { row: 1, col: 4, label: 'B', color: PITCH_CLASS_COLORS[11] },
    ],
  },
  'cde-fga': {
    topLabel: 'S4 (D) / S1 (e)',
    bottomLabel: 'S5 (A) / S2 (B)',
    notes: [
      { row: 0, col: 0, label: 'F', color: PITCH_CLASS_COLORS[5] },
      { row: 0, col: 2, label: 'G', color: PITCH_CLASS_COLORS[7] },
      { row: 0, col: 4, label: 'A', color: PITCH_CLASS_COLORS[9] },
      { row: 1, col: 0, label: 'C', color: PITCH_CLASS_COLORS[0] },
      { row: 1, col: 2, label: 'D', color: PITCH_CLASS_COLORS[2] },
      { row: 1, col: 4, label: 'E', color: PITCH_CLASS_COLORS[4] },
    ],
  },
  'efg-abc': {
    topLabel: 'S5 (A) / S2 (B)',
    bottomLabel: 'S6 (E) / S3 (G)',
    notes: [
      { row: 0, col: 0, label: 'A', color: PITCH_CLASS_COLORS[9] },
      { row: 0, col: 2, label: 'B', color: PITCH_CLASS_COLORS[11] },
      { row: 0, col: 3, label: 'C', color: PITCH_CLASS_COLORS[0] },
      { row: 1, col: 0, label: 'E', color: PITCH_CLASS_COLORS[4] },
      { row: 1, col: 1, label: 'F', color: PITCH_CLASS_COLORS[5] },
      { row: 1, col: 3, label: 'G', color: PITCH_CLASS_COLORS[7] },
    ],
  },
};

const OCTAVE_FILTER_OPTIONS: { id: PatternFilter; label: string }[] = [
  { id: 'all', label: 'All Octave Lines' },
  { id: 'oct-2', label: '2-String Octaves' },
  { id: 'oct-3', label: '3-String Crossings' },
  { id: 'unison', label: 'Unison Shifts' },
];

export const RepeatingTilesBoard: React.FC<RepeatingTilesBoardProps> = ({
  accidentals,
  selectedPitchClasses,
  activeSet,
  onSelectSet,
  tileFilter,
  onSelectTile,
}) => {
  const activePc = selectedPitchClasses[0] ?? 0;
  const activeNoteLabel = formatPitchClass(activePc, accidentals);

  return (
    <section className="panel tiles-board-panel" aria-label="Repeating note tiles">
      <SectionHeader
        title="Repeating 2-String Tiles"
        subtitle="Natural notes repeat in three 2-string blocks across the neck. Click a tile to highlight its color blocks on the fretboard."
        actions={
          <>
            <button
              type="button"
              className={`toggle-btn ${tileFilter === 'all' ? 'active' : ''}`}
              onClick={() => onSelectTile(tileFilter === 'all' ? 'none' : 'all')}
            >
              All 3 Tiles: {tileFilter === 'all' ? 'On' : 'Off'}
            </button>
            {tileFilter !== 'none' && (
              <button
                type="button"
                className="toggle-btn"
                onClick={() => onSelectTile('none')}
              >
                Clear Highlights
              </button>
            )}
          </>
        }
      />

      <div className="tile-blocks-grid">
        {REPEATING_TILE_DEFS.map((tile) => {
          const isSelected = tileFilter === tile.id || tileFilter === 'all';
          const isExact = tileFilter === tile.id;
          const preview = TILE_MINI_PATTERNS[tile.id];

          return (
            <button
              key={tile.id}
              type="button"
              className={`tile-block-card ${isSelected ? 'is-active' : ''}`}
              style={{ '--tile-color': tile.color } as React.CSSProperties}
              onClick={() => onSelectTile(isExact ? 'none' : tile.id)}
              aria-pressed={isSelected}
            >
              <div className="tile-block-card-header">
                <div>
                  <h3>{tile.label}</h3>
                  <p>{tile.subtitle}</p>
                </div>
                <span className={`tile-status-badge ${isSelected ? 'active' : ''}`}>
                  {isExact ? 'Highlighted' : tileFilter === 'all' ? 'Shown' : 'Highlight'}
                </span>
              </div>

              <MiniFretboard
                rowCount={2}
                cols={TILE_COLS}
                notes={preview.notes}
                variant="tile-box"
                tileColor={tile.color}
                rowHeight={30}
              />

              <div className="tile-block-card-footer">
                <span>Upper: {preview.topLabel}</span>
                <span>Lower: {preview.bottomLabel}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="octave-filter-bar">
        <span className="octave-filter-label">
          Octave Connection Filter ({activeNoteLabel}):
        </span>
        <div className="octave-filter-pills">
          {OCTAVE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`toggle-btn ${activeSet === opt.id ? 'active' : ''}`}
              onClick={() => onSelectSet(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
