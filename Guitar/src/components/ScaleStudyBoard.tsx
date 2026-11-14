import React, { useCallback, useMemo, useState } from 'react';
import {
  AccidentalMode,
  DIATONIC_SCALE_DEFINITIONS,
  DIATONIC_SCALE_ORDER,
  DiatonicMode,
  formatPitchClass,
  getDiatonicDegree,
  getDiatonicScaleBoxes,
  getFretPitchClass,
  PITCH_CLASS_COLORS,
  SCALE_PATTERN_COLORS,
  scaleBoxesToOverlayBlocks,
  ScaleLayoutMode,
} from '../utils/musicTheory';
import { getFretMidi, playFretNote, playSequence } from '../utils/guitarAudio';
import { Fretboard, FretMarker } from './Fretboard';
import { MiniFretboard, MiniFretNote } from './MiniFretboard';
import { SectionHeader } from './SectionHeader';
import './ChordStudyBoard.css';

interface ScaleStudyBoardProps {
  strings: number[];
  maxFret: number;
  accidentals: AccidentalMode;
}

type LabelDisplayMode = 'notes' | 'intervals';

const ALL_PITCH_CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const EMPTY_FRETS = new Set<string>();

export const ScaleStudyBoard: React.FC<ScaleStudyBoardProps> = ({
  strings,
  maxFret,
  accidentals,
}) => {
  const [rootPc, setRootPc] = useState<number>(0); // Default C Major
  const [mode, setMode] = useState<DiatonicMode>('ionian');
  const [layout, setLayout] = useState<ScaleLayoutMode>('3nps');
  const [selectedPosition, setSelectedPosition] = useState<number | 'all'>('all');
  const [labelMode, setLabelMode] = useState<LabelDisplayMode>('notes');
  const [highlightCharTone, setHighlightCharTone] = useState<boolean>(true);

  const def = DIATONIC_SCALE_DEFINITIONS[mode];
  const rootName = formatPitchClass(rootPc, accidentals);
  const parentMajorPc = (rootPc + def.parentMajorOffset) % 12;
  const parentMajorName = formatPitchClass(parentMajorPc, accidentals);
  const positionCount = layout === '3nps' ? 7 : 5;
  const positionNumbers = useMemo(
    () => Array.from({ length: positionCount }, (_, i) => i + 1),
    [positionCount]
  );

  const boxes = useMemo(
    () => getDiatonicScaleBoxes(strings, maxFret, rootPc, mode, layout),
    [strings, maxFret, rootPc, mode, layout]
  );

  const effectivePosition =
    selectedPosition !== 'all' && selectedPosition > positionCount
      ? 'all'
      : selectedPosition;

  const visibleBoxes = useMemo(
    () =>
      effectivePosition === 'all'
        ? boxes
        : boxes.filter((b) => b.positionNumber === effectivePosition),
    [boxes, effectivePosition]
  );

  const overlayBlocks = useMemo(
    () => scaleBoxesToOverlayBlocks(visibleBoxes),
    [visibleBoxes]
  );

  const getScaleMarker = useCallback(
    (_stringIndex: number, _fret: number, pc: number): FretMarker | null => {
      const deg = getDiatonicDegree(pc, rootPc, mode);
      if (!deg) return null;

      return {
        label: labelMode === 'intervals' ? deg.degree : formatPitchClass(pc, accidentals),
        color: PITCH_CLASS_COLORS[pc],
        border:
          deg.index === 0
            ? 'root'
            : highlightCharTone && deg.isCharacteristic
              ? 'dashed'
              : 'solid',
      };
    },
    [rootPc, mode, labelMode, highlightCharTone, accidentals]
  );

  const cardBoxes = useMemo(
    () =>
      positionNumbers.map(
        (num) => boxes.find((b) => b.positionNumber === num) ?? null
      ),
    [boxes, positionNumbers]
  );

  return (
    <section
      className="panel chord-study-panel"
      aria-label="Diatonic scales and modes study section"
    >
      <SectionHeader
        title="Diatonic Scales & Modes (All Scale Blocks)"
        subtitle={
          <>
            Scale: <strong>{rootName} {def.label}</strong> ({def.degreeLabels.join(' – ')}) ·{' '}
            Parent Major: <strong>{parentMajorName} Major</strong> · Characteristic tone:{' '}
            <strong>{def.characteristicDegree}</strong>
          </>
        }
        actions={
          <>
            <button
              type="button"
              className="toggle-btn"
              onClick={() => {
                const activeBox =
                  effectivePosition !== 'all'
                    ? cardBoxes[effectivePosition - 1]
                    : null;
                if (activeBox) {
                  const midis = [...activeBox.stringFrets]
                    .sort((a, b) => b.stringIndex - a.stringIndex)
                    .flatMap(({ stringIndex, notes }) =>
                      notes.map((fret) => getFretMidi(strings[stringIndex], stringIndex, fret))
                    );
                  playSequence(midis, 0.13, 0.65);
                  return;
                }
                const baseMidi = 48 + rootPc;
                const midis = [...def.intervals.map((iv) => baseMidi + iv), baseMidi + 12];
                playSequence(midis, 0.15, 0.7);
              }}
            >
              Play Scale
            </button>
            <button
              type="button"
              className={`toggle-btn ${highlightCharTone ? 'active' : ''}`}
              onClick={() => setHighlightCharTone((v) => !v)}
            >
              Color Tone ({def.characteristicDegree}): {highlightCharTone ? 'On' : 'Off'}
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
          <span className="chord-study-control-label">Root Note & Mode</span>
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
            {DIATONIC_SCALE_ORDER.map((m) => (
              <button
                key={m}
                type="button"
                className={`toggle-btn ${mode === m ? 'active' : ''}`}
                onClick={() => setMode(m)}
              >
                {DIATONIC_SCALE_DEFINITIONS[m].shortLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="chord-study-control-group">
          <span className="chord-study-control-label">Block Layout & Position Focus</span>
          <div className="chord-study-strings-controls">
            <div className="chord-study-pill-row">
              <button
                type="button"
                className={`toggle-btn ${layout === '3nps' ? 'active' : ''}`}
                onClick={() => setLayout('3nps')}
              >
                3NPS (7 Blocks)
              </button>
              <button
                type="button"
                className={`toggle-btn ${layout === 'caged' ? 'active' : ''}`}
                onClick={() => setLayout('caged')}
              >
                CAGED (5 Blocks)
              </button>
            </div>

            <div className="chord-study-pill-row">
              <button
                type="button"
                className={`toggle-btn ${effectivePosition === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedPosition('all')}
              >
                All Blocks
              </button>
              {positionNumbers.map((num) => {
                const isActive = effectivePosition === num;
                const color = SCALE_PATTERN_COLORS[num];
                return (
                  <button
                    key={num}
                    type="button"
                    className={`toggle-btn ${isActive ? 'active' : ''}`}
                    style={
                      isActive
                        ? {
                            backgroundColor: color,
                            borderColor: color,
                            color: '#ffffff',
                          }
                        : undefined
                    }
                    onClick={() => setSelectedPosition(num)}
                  >
                    Pos {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="chord-study-fretboard-wrap">
        <Fretboard
          strings={strings}
          maxFret={maxFret}
          accidentals={accidentals}
          showAccidentals={true}
          showAllNotes={false}
          connectSameNotes={false}
          patternFilter="all"
          tileFilter="none"
          selectedFrets={EMPTY_FRETS}
          onToggleFret={(sIdx, fret) => {
            playFretNote(strings[sIdx], sIdx, fret);
          }}
          getMarker={getScaleMarker}
          overlayBlocks={overlayBlocks}
        />
      </div>

      <div className="chord-study-legend">
        <span className="chord-study-legend-item">
          <span className="legend-dot legend-dot--root" />
          Root ({rootName})
        </span>
        {highlightCharTone && (
          <span className="chord-study-legend-item">
            <span className="legend-dot legend-dot--blues" />
            Characteristic Mode Tone ({def.characteristicDegree})
          </span>
        )}
        <span className="chord-study-legend-item">
          Click any note on the fretboard or a block card below to inspect and play
        </span>
      </div>

      <div className="chord-voicings-grid">
        {cardBoxes.map((box, idx) => {
          const num = idx + 1;
          const color = SCALE_PATTERN_COLORS[num];
          if (!box) return null;

          const cols = Array.from(
            { length: Math.max(4, box.maxFret - box.minFret + 1) },
            (_, i) => box.minFret + i
          );

          const miniNotes: MiniFretNote[] = [];
          box.stringFrets.forEach(({ stringIndex, notes }) => {
            notes.forEach((f) => {
              const pc = getFretPitchClass(strings[stringIndex], f);
              const deg = getDiatonicDegree(pc, rootPc, mode);
              miniNotes.push({
                row: stringIndex,
                col: f,
                label:
                  labelMode === 'intervals'
                    ? (deg?.degree ?? '')
                    : formatPitchClass(pc, accidentals),
                color: PITCH_CLASS_COLORS[pc],
                highlight: deg?.index === 0 ? 'anchor' : 'target',
              });
            });
          });

          const isSelected = effectivePosition === num || effectivePosition === 'all';

          return (
            <button
              key={box.id}
              type="button"
              className={`chord-voicing-card ${isSelected ? 'is-active' : ''}`}
              style={{ borderColor: effectivePosition === num ? color : undefined }}
              onClick={() => {
                setSelectedPosition((prev) => (prev === num ? 'all' : num));
                const midis = [...box.stringFrets]
                  .sort((a, b) => b.stringIndex - a.stringIndex)
                  .flatMap(({ stringIndex, notes }) =>
                    notes.map((fret) => getFretMidi(strings[stringIndex], stringIndex, fret))
                  );
                playSequence(midis, 0.13, 0.65);
              }}
            >
              <div className="chord-voicing-header">
                <span className="chord-inversion-title">
                  <span className="chord-card-pill" style={{ backgroundColor: color }}>
                    P{num}
                  </span>
                  {box.label}
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
                rowHeight={20}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
};
