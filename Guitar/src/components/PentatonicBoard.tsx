import React, { useCallback, useMemo, useState } from 'react';
import {
  AccidentalMode,
  formatPitchClass,
  getFretPitchClass,
  getPentatonicBoxes,
  getPentatonicDegree,
  getPentatonicOctaveShiftBlocks,
  PENTATONIC_DEFINITIONS,
  PENTATONIC_PATTERN_COLORS,
  PentatonicMode,
  PentatonicShiftGroup,
  PentatonicShiftShape,
  PITCH_CLASS_COLORS,
  TileBlock,
} from '../utils/musicTheory';
import { getFretMidi, playFretNote, playSequence } from '../utils/guitarAudio';
import { Fretboard, FretMarker } from './Fretboard';
import { MiniFretboard, MiniFretNote } from './MiniFretboard';
import { SectionHeader } from './SectionHeader';
import './ChordStudyBoard.css';

interface PentatonicBoardProps {
  strings: number[];
  maxFret: number;
  accidentals: AccidentalMode;
}

type PentatonicViewMode = 'boxes' | 'shifts';
type LabelDisplayMode = 'notes' | 'intervals';

const ALL_PITCH_CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const PATTERN_NUMBERS: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];
const EMPTY_FRETS = new Set<string>();

export const PentatonicBoard: React.FC<PentatonicBoardProps> = ({
  strings,
  maxFret,
  accidentals,
}) => {
  const [rootPc, setRootPc] = useState<number>(0); // Default C Major Pentatonic
  const [mode, setMode] = useState<PentatonicMode>('major');
  const [includeBlues, setIncludeBlues] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<PentatonicViewMode>('boxes');
  const [selectedPattern, setSelectedPattern] = useState<1 | 2 | 3 | 4 | 5 | 'all'>(1);
  const [shiftShape, setShiftShape] = useState<PentatonicShiftShape>('2-3');
  const [shiftGroup, setShiftGroup] = useState<PentatonicShiftGroup>('all');
  const [labelMode, setLabelMode] = useState<LabelDisplayMode>('notes');

  const def = PENTATONIC_DEFINITIONS[mode];
  const rootName = formatPitchClass(rootPc, accidentals);
  const relativeRootPc = (rootPc + def.relativeOffset) % 12;
  const relativeName = formatPitchClass(relativeRootPc, accidentals);

  const boxes = useMemo(
    () => getPentatonicBoxes(strings, maxFret, rootPc, mode),
    [strings, maxFret, rootPc, mode]
  );

  const majorRootPc = mode === 'major' ? rootPc : (rootPc + 3) % 12;
  const shift23Label = `${formatPitchClass((majorRootPc + 7) % 12, accidentals)} ${formatPitchClass((majorRootPc + 9) % 12, accidentals)} / ${formatPitchClass(majorRootPc, accidentals)} ${formatPitchClass((majorRootPc + 2) % 12, accidentals)} ${formatPitchClass((majorRootPc + 4) % 12, accidentals)}`;
  const shift32Label = `${formatPitchClass(majorRootPc, accidentals)} ${formatPitchClass((majorRootPc + 2) % 12, accidentals)} ${formatPitchClass((majorRootPc + 4) % 12, accidentals)} / ${formatPitchClass((majorRootPc + 7) % 12, accidentals)} ${formatPitchClass((majorRootPc + 9) % 12, accidentals)}`;

  const overlayBlocks = useMemo<TileBlock[]>(() => {
    if (viewMode === 'shifts') {
      return getPentatonicOctaveShiftBlocks(
        strings,
        maxFret,
        rootPc,
        mode,
        shiftShape,
        shiftGroup
      );
    }
    const visibleBoxes =
      selectedPattern === 'all'
        ? boxes
        : boxes.filter((b) => b.patternNumber === selectedPattern);

    return visibleBoxes.map((b) => ({
      id: `box-overlay-${b.id}`,
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
  }, [
    viewMode,
    boxes,
    selectedPattern,
    strings,
    maxFret,
    rootPc,
    mode,
    shiftShape,
    shiftGroup,
  ]);

  const getPentatonicMarker = useCallback(
    (_stringIndex: number, _fret: number, pc: number): FretMarker | null => {
      const deg = getPentatonicDegree(pc, rootPc, mode, includeBlues);
      if (!deg) return null;

      return {
        label: labelMode === 'intervals' ? deg.degree : formatPitchClass(pc, accidentals),
        color: PITCH_CLASS_COLORS[pc],
        border: deg.isBlues ? 'dashed' : deg.index === 0 ? 'root' : 'solid',
      };
    },
    [rootPc, mode, includeBlues, labelMode, accidentals]
  );

  // One representative box per pattern (1..5) for the 5 pattern cards
  const cardBoxes = useMemo(() => {
    return PATTERN_NUMBERS.map((num) => {
      const matches = boxes.filter((b) => b.patternNumber === num);
      return matches[0] ?? null;
    });
  }, [boxes]);

  return (
    <section
      className="panel chord-study-panel"
      aria-label="Pentatonic scales study section"
    >
      <SectionHeader
        title="Pentatonic Scales Study Board (5 Boxes & 2-String Shifts)"
        subtitle={
          <>
            Scale: <strong>{rootName} {def.label}</strong> (
            {def.degreeLabels.join(' – ')}) · Relative {def.relativeLabel}:{' '}
            <strong>
              {relativeName} {def.relativeLabel} Pentatonic
            </strong>
          </>
        }
        actions={
          <>
            <button
              type="button"
              className="toggle-btn"
              onClick={() => {
                const activeBox =
                  viewMode === 'boxes' && selectedPattern !== 'all'
                    ? cardBoxes[selectedPattern - 1]
                    : null;
                if (activeBox) {
                  const midis = [...activeBox.stringFrets]
                    .sort((a, b) => b.stringIndex - a.stringIndex)
                    .flatMap(({ stringIndex, frets }) =>
                      frets.map((fret) => getFretMidi(strings[stringIndex], stringIndex, fret))
                    );
                  playSequence(midis, 0.14, 0.65);
                  return;
                }
                const intervals = [...def.intervals];
                if (includeBlues) {
                  intervals.push(mode === 'minor' ? 6 : 3);
                  intervals.sort((a, b) => a - b);
                }
                const baseMidi = 48 + rootPc; // C3..B3 range
                const midis = [...intervals.map((iv) => baseMidi + iv), baseMidi + 12];
                playSequence(midis, 0.16, 0.7);
              }}
            >
              Play Scale
            </button>
            <button
              type="button"
              className={`toggle-btn ${includeBlues ? 'active' : ''}`}
              onClick={() => setIncludeBlues((v) => !v)}
            >
              Blues Note ({mode === 'minor' ? 'b5' : 'b3'}): {includeBlues ? 'On' : 'Off'}
            </button>
            <button
              type="button"
              className={`toggle-btn ${labelMode === 'intervals' ? 'active' : ''}`}
              onClick={() =>
                setLabelMode((prev) => (prev === 'notes' ? 'intervals' : 'notes'))
              }
            >
              Labels: {labelMode === 'notes' ? 'Notes' : 'Intervals'}
            </button>
          </>
        }
      />

      <div className="chord-study-controls-grid">
        <div className="chord-study-control-group">
          <span className="chord-study-control-label">Root Note & Scale Mode</span>
          <div className="chord-study-pill-row">
            {ALL_PITCH_CLASSES.map((pc) => {
              const label = formatPitchClass(pc, accidentals);
              const isActive = rootPc === pc;
              return (
                <button
                  key={pc}
                  type="button"
                  className={`toggle-btn ${isActive ? 'active' : ''}`}
                  style={
                    isActive
                      ? {
                          backgroundColor: PITCH_CLASS_COLORS[pc],
                          borderColor: PITCH_CLASS_COLORS[pc],
                          color: '#ffffff',
                        }
                      : undefined
                  }
                  onClick={() => setRootPc(pc)}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="chord-study-pill-row" style={{ marginTop: '0.25rem' }}>
            {(['major', 'minor'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`toggle-btn ${mode === m ? 'active' : ''}`}
                onClick={() => setMode(m)}
              >
                {PENTATONIC_DEFINITIONS[m].label} (
                {PENTATONIC_DEFINITIONS[m].degreeLabels.join(' ')})
              </button>
            ))}
          </div>
        </div>

        <div className="chord-study-control-group">
          <span className="chord-study-control-label">
            Study View & Pattern Focus
          </span>
          <div className="chord-study-strings-controls">
            <div className="chord-study-pill-row">
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'boxes' ? 'active' : ''}`}
                onClick={() => setViewMode('boxes')}
              >
                5 Boxes View
              </button>
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'shifts' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('shifts');
                  if (selectedPattern === 'all') setSelectedPattern(1);
                }}
              >
                2-String Octave Shifts (+2 / +3)
              </button>
            </div>

            <div className="chord-study-pill-row">
              {viewMode === 'boxes' ? (
                <>
                  <button
                    type="button"
                    className={`toggle-btn ${selectedPattern === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedPattern('all')}
                  >
                    All 5 Boxes
                  </button>
                  {PATTERN_NUMBERS.map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`toggle-btn ${selectedPattern === num ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPattern(num);
                        const targetBox = cardBoxes[num - 1];
                        if (!targetBox) return;
                        const midis = [...targetBox.stringFrets]
                          .sort((a, b) => b.stringIndex - a.stringIndex)
                          .flatMap(({ stringIndex, frets }) =>
                            frets.map((fret) => getFretMidi(strings[stringIndex], stringIndex, fret))
                          );
                        playSequence(midis, 0.14, 0.65);
                      }}
                    >
                      Pattern {num}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={`toggle-btn ${shiftShape === '2-3' ? 'active' : ''}`}
                    onClick={() => setShiftShape('2-3')}
                  >
                    2+3 Tile ({shift23Label})
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${shiftShape === '3-2' ? 'active' : ''}`}
                    onClick={() => setShiftShape('3-2')}
                  >
                    3+2 Tile ({shift32Label})
                  </button>
                </>
              )}
            </div>
          </div>

          {viewMode === 'shifts' && (
            <div className="chord-study-pill-row" style={{ marginTop: '0.25rem' }}>
              <button
                type="button"
                className={`toggle-btn ${shiftGroup === 'all' ? 'active' : ''}`}
                onClick={() => setShiftGroup('all')}
              >
                All 2-String Pairs (+ Edge Tiles)
              </button>
              <button
                type="button"
                className={`toggle-btn ${shiftGroup === 'even' ? 'active' : ''}`}
                onClick={() => setShiftGroup('even')}
              >
                S6–5 → S4–3 (+2) → S2–1 (+3 B-shift)
              </button>
              <button
                type="button"
                className={`toggle-btn ${shiftGroup === 'odd' ? 'active' : ''}`}
                onClick={() => setShiftGroup('odd')}
              >
                S5–4 → S3–2 (+3 B-shift)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="chord-study-legend-row">
        {PATTERN_NUMBERS.map((num) => (
          <span key={num} className="chord-study-legend-item">
            <span
              className="chord-study-legend-swatch"
              style={{ background: PENTATONIC_PATTERN_COLORS[num] }}
            />
            Pattern {num}
          </span>
        ))}
      </div>

      <Fretboard
        strings={strings}
        maxFret={maxFret}
        accidentals={accidentals}
        showAllNotes={false}
        showAccidentals={true}
        connectSameNotes={false}
        overlayBlocks={overlayBlocks}
        selectedFrets={EMPTY_FRETS}
        playSoundOnClick={false}
        onToggleFret={(stringIndex, fret, pc) => {
          if (
            viewMode === 'shifts' &&
            getPentatonicDegree(pc, rootPc, mode, includeBlues)
          ) {
            const getRowRange = (block: TileBlock, sIdx: number): [number, number] | null => {
              if (sIdx < block.topStringIndex || sIdx > block.bottomStringIndex) return null;
              if (
                sIdx === block.topStringIndex &&
                block.topStartFret !== undefined &&
                block.topEndFret !== undefined
              ) {
                return [block.topStartFret, block.topEndFret];
              }
              if (
                sIdx === block.bottomStringIndex &&
                block.bottomStartFret !== undefined &&
                block.bottomEndFret !== undefined
              ) {
                return [block.bottomStartFret, block.bottomEndFret];
              }
              return [block.startFret, block.endFret];
            };

            const matchingBlock = overlayBlocks.find((block) => {
              const range = getRowRange(block, stringIndex);
              return range !== null && fret >= range[0] && fret <= range[1];
            });

            if (matchingBlock) {
              const midis: number[] = [];
              for (
                let sIdx = matchingBlock.bottomStringIndex;
                sIdx >= matchingBlock.topStringIndex;
                sIdx--
              ) {
                const range = getRowRange(matchingBlock, sIdx);
                if (!range) continue;
                for (let f = range[0]; f <= range[1]; f++) {
                  const notePc = getFretPitchClass(strings[sIdx], f);
                  if (getPentatonicDegree(notePc, rootPc, mode, includeBlues)) {
                    midis.push(getFretMidi(strings[sIdx], sIdx, f));
                  }
                }
              }
              if (midis.length > 0) {
                playSequence(midis, 0.14, 0.65);
                return;
              }
            }
          }
          playFretNote(strings[stringIndex], stringIndex, fret);
        }}
        getMarker={getPentatonicMarker}
      />

      <div className="chord-voicings-grid">
        {cardBoxes.map((box, idx) => {
          const num = (idx + 1) as 1 | 2 | 3 | 4 | 5;
          if (!box) return null;
          const isSelected =
            viewMode === 'boxes' &&
            (selectedPattern === num || selectedPattern === 'all');
          const cols = Array.from(
            { length: Math.max(4, box.maxFret - box.minFret + 1) },
            (_, i) => box.minFret + i
          );

          const miniNotes: MiniFretNote[] = [];
          box.stringFrets.forEach(({ stringIndex, frets }) => {
            frets.forEach((fret) => {
              const pc = (strings[stringIndex] + fret) % 12;
              const deg = getPentatonicDegree(pc, rootPc, mode, false);
              if (!deg) return;
              miniNotes.push({
                row: stringIndex,
                col: fret,
                label:
                  labelMode === 'intervals'
                    ? deg.degree
                    : formatPitchClass(pc, accidentals),
                color: PITCH_CLASS_COLORS[pc],
                highlight: deg.index === 0 ? 'anchor' : 'target',
              });
            });
          });

          return (
            <button
              key={box.id}
              type="button"
              className={`chord-voicing-card ${isSelected ? 'is-active' : ''}`}
              onClick={() => {
                setSelectedPattern(num);
                const midis = [...box.stringFrets]
                  .sort((a, b) => b.stringIndex - a.stringIndex)
                  .flatMap(({ stringIndex, frets }) =>
                    frets.map((fret) => getFretMidi(strings[stringIndex], stringIndex, fret))
                  );
                playSequence(midis, 0.14, 0.65);
              }}
            >
              <div className="chord-voicing-header">
                <span className="chord-inversion-title">
                  <span
                    className="chord-card-pill"
                    style={{ backgroundColor: box.color }}
                  >
                    P{num}
                  </span>
                  Pattern {num}
                </span>
                <span className="chord-fret-badge">
                  {box.minFret === 0 ? 'Open' : `F${box.minFret}`}–F{box.maxFret}
                </span>
              </div>

              <MiniFretboard
                rowCount={strings.length}
                cols={cols}
                notes={miniNotes}
                fretLabels={cols.map((f) => (f === 0 ? '0' : String(f)))}
                rowHeight={22}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
};

