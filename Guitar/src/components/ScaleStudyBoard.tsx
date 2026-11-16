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
  getTriadVoicings,
  PITCH_CLASS_COLORS,
  SCALE_PATTERN_COLORS,
  scaleBoxesToOverlayBlocks,
  ScaleLayoutMode,
  TriadVoicing,
} from '../utils/musicTheory';
import { getFretMidi, playFretNote, playSequence } from '../utils/guitarAudio';
import { Fretboard, FretMarker } from './Fretboard';
import { MiniFretboard, MiniFretNote } from './MiniFretboard';
import { PitchClassSelector } from './PitchClassSelector';
import { SectionHeader } from './SectionHeader';
import './ChordStudyBoard.css';

interface ScaleStudyBoardProps {
  strings: number[];
  maxFret: number;
  accidentals: AccidentalMode;
}

type LabelDisplayMode = 'notes' | 'intervals';

const EMPTY_FRETS = new Set<string>();

export const ScaleStudyBoard: React.FC<ScaleStudyBoardProps> = ({
  strings,
  maxFret,
  accidentals,
}) => {
  const [rootPc, setRootPc] = useState<number>(0); // Default C Major
  const [mode, setMode] = useState<DiatonicMode>('ionian');
  const [layout, setLayout] = useState<ScaleLayoutMode>('caged');
  const [selectedPosition, setSelectedPosition] = useState<number | 'all'>('all');
  const [labelMode, setLabelMode] = useState<LabelDisplayMode>('notes');
  const [highlightCharTone, setHighlightCharTone] = useState<boolean>(true);
  const [markCagedTriad, setMarkCagedTriad] = useState<boolean>(true);

  const def = DIATONIC_SCALE_DEFINITIONS[mode];
  const rootName = formatPitchClass(rootPc, accidentals);
  const parentMajorPc = (rootPc + def.parentMajorOffset) % 12;
  const parentMajorName = formatPitchClass(parentMajorPc, accidentals);

  const isParentMajorTriad = useCallback(
    (pc: number) => {
      const iv = ((pc - parentMajorPc) % 12 + 12) % 12;
      return iv === 0 || iv === 4 || iv === 7;
    },
    [parentMajorPc]
  );
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

  const cagedTriadVoicings = useMemo<TriadVoicing[]>(() => {
    if (layout !== 'caged' || !markCagedTriad) return [];
    const majorTriads = getTriadVoicings(strings, maxFret, [0, 1, 2], parentMajorPc, 'major');
    const result: TriadVoicing[] = [];

    const makeTriadNote = (stringIndex: number, fret: number): TriadVoicing['notes'][number] => {
      const pc = getFretPitchClass(strings[stringIndex], fret);
      const iv = ((pc - parentMajorPc) % 12 + 12) % 12;
      return {
        stringIndex,
        fret,
        pc,
        degree: iv === 0 ? 'R' : iv === 4 ? '3' : '5',
        degreeIndex: iv === 0 ? 0 : iv === 4 ? 1 : 2,
      };
    };

    for (const box of visibleBoxes) {
      const getTriadFretsForString = (sIdx: number) =>
        (box.stringFrets.find((x) => x.stringIndex === sIdx)?.notes ?? []).filter(
          (fret) => isParentMajorTriad(getFretPitchClass(strings[sIdx], fret))
        );

      const s4TriadFrets = getTriadFretsForString(3);
      const s5TriadFrets = getTriadFretsForString(4);

      const pickClosest = (candidates: number[], targetFret: number) =>
        candidates.length > 0
          ? [...candidates].sort((a, b) => Math.abs(a - targetFret) - Math.abs(b - targetFret))[0]
          : undefined;

      const match = majorTriads.find(
        (v) => v.minFret >= box.minFret && v.maxFret <= box.maxFret
      );
      if (match) {
        const s3Fret = match.notes.find((n) => n.stringIndex === 2)?.fret ?? match.minFret;
        const bestS4Fret = pickClosest(s4TriadFrets, s3Fret);
        const bestS5Fret =
          bestS4Fret !== undefined ? pickClosest(s5TriadFrets, bestS4Fret) : undefined;
        const notes = [...match.notes];
        if (bestS4Fret !== undefined) notes.push(makeTriadNote(3, bestS4Fret));
        if (bestS5Fret !== undefined) notes.push(makeTriadNote(4, bestS5Fret));
        const frets = notes.map((n) => n.fret);
        result.push({
          ...match,
          id: `caged-triad-${box.id}`,
          notes,
          minFret: Math.min(...frets),
          maxFret: Math.max(...frets),
          color: box.color,
        });
        continue;
      }

      // Fallback (e.g. G Shape where S1-S3 is R-3-R: C-E-C on S3-S2-S1)
      const fallbackNotes: TriadVoicing['notes'] = [];
      for (const sIdx of [0, 1, 2, 3, 4]) {
        const fretsForStr = getTriadFretsForString(sIdx);
        const f =
          sIdx <= 2
            ? fretsForStr[0]
            : pickClosest(
                fretsForStr,
                fallbackNotes[fallbackNotes.length - 1]?.fret ?? box.minFret
              );
        if (f !== undefined) {
          fallbackNotes.push(makeTriadNote(sIdx, f));
        }
      }
      if (fallbackNotes.length >= 3) {
        const frets = fallbackNotes.map((n) => n.fret);
        result.push({
          id: `caged-triad-${box.id}`,
          inversion: 'Root Position',
          notes: fallbackNotes,
          minFret: Math.min(...frets),
          maxFret: Math.max(...frets),
          color: box.color,
        });
      }
    }

    return result;
  }, [layout, markCagedTriad, strings, maxFret, parentMajorPc, visibleBoxes, isParentMajorTriad]);

  const getScaleMarker = useCallback(
    (stringIndex: number, _fret: number, pc: number): FretMarker | null => {
      const deg = getDiatonicDegree(pc, rootPc, mode);
      if (!deg) return null;

      const isCagedS15Triad =
        layout === 'caged' &&
        markCagedTriad &&
        stringIndex <= 4 &&
        isParentMajorTriad(pc);

      return {
        label: labelMode === 'intervals' ? deg.degree : formatPitchClass(pc, accidentals),
        color: PITCH_CLASS_COLORS[pc],
        border:
          deg.index === 0
            ? 'root'
            : isCagedS15Triad || (highlightCharTone && deg.isCharacteristic)
              ? 'dashed'
              : 'solid',
      };
    },
    [
      rootPc,
      mode,
      layout,
      markCagedTriad,
      isParentMajorTriad,
      labelMode,
      highlightCharTone,
      accidentals,
    ]
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
            {layout === 'caged' && (
              <button
                type="button"
                className={`toggle-btn ${markCagedTriad ? 'active' : ''}`}
                onClick={() => setMarkCagedTriad((v) => !v)}
              >
                S1–S5 Chord Shape: {markCagedTriad ? 'On' : 'Off'}
              </button>
            )}
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
          <PitchClassSelector
            value={rootPc}
            onChange={setRootPc}
            accidentals={accidentals}
          />
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
                className={`toggle-btn ${layout === 'caged' ? 'active' : ''}`}
                onClick={() => setLayout('caged')}
              >
                CAGED (5 Blocks)
              </button>
              <button
                type="button"
                className={`toggle-btn ${layout === '3nps' ? 'active' : ''}`}
                onClick={() => setLayout('3nps')}
              >
                3NPS (7 Blocks)
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
          triadVoicings={cagedTriadVoicings}
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
        {layout === 'caged' && markCagedTriad && (
          <span className="chord-study-legend-item">
            <span className="legend-dot legend-dot--blues" />
            {parentMajorName} Chord Shape on S1–S5 (1–3–5)
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
          const s15TriadFrets: Record<number, number[]> = { 4: [], 3: [], 2: [], 1: [], 0: [] };
          box.stringFrets.forEach(({ stringIndex, notes }) => {
            notes.forEach((f) => {
              const pc = getFretPitchClass(strings[stringIndex], f);
              const deg = getDiatonicDegree(pc, rootPc, mode);
              const isCagedS15 =
                layout === 'caged' &&
                markCagedTriad &&
                stringIndex <= 4 &&
                isParentMajorTriad(pc);
              if (isCagedS15) {
                s15TriadFrets[stringIndex].push(f);
              }
              miniNotes.push({
                row: stringIndex,
                col: f,
                label:
                  labelMode === 'intervals'
                    ? (deg?.degree ?? '')
                    : formatPitchClass(pc, accidentals),
                color: PITCH_CLASS_COLORS[pc],
                highlight:
                  layout === 'caged' && markCagedTriad
                    ? isCagedS15
                      ? 'anchor'
                      : 'target'
                    : deg?.index === 0
                      ? 'anchor'
                      : 'target',
              });
            });
          });

          const s51Summary =
            layout === 'caged' && markCagedTriad
              ? [4, 3, 2, 1, 0]
                  .map((sIdx) => s15TriadFrets[sIdx].join('/') || 'x')
                  .join('-')
              : null;

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
                  {s51Summary
                    ? `S5–S1: ${s51Summary}`
                    : `${box.minFret === 0 ? 'Open' : `F${box.minFret}`}–F${box.maxFret}`}
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
