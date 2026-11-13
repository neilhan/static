import React, { useCallback, useMemo, useState } from 'react';
import {
  AccidentalMode,
  formatPitchClass,
  getSeventhDegree,
  getShellVoicings,
  PITCH_CLASS_COLORS,
  SEVENTH_DEFINITIONS,
  SeventhQuality,
  SeventhVoicing,
  SHELL_STRING_SETS,
} from '../utils/musicTheory';
import { Fretboard, FretMarker, makeFretKey } from './Fretboard';
import { MiniFretboard, MiniFretNote } from './MiniFretboard';
import { SectionHeader } from './SectionHeader';
import './TriadsBoard.css';

interface SeventhChordsBoardProps {
  strings: number[];
  maxFret: number;
  accidentals: AccidentalMode;
}

interface ShellChordSpec {
  rootPc: number;
  quality: SeventhQuality;
}

const ALL_PITCH_CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const SEVENTH_QUALITY_LIST: SeventhQuality[] = [
  'maj7',
  'dom7',
  'min7',
  'm7b5',
  'dim7',
];

const SHELL_PROGRESSIONS: Array<{
  id: string;
  label: string;
  chords: ShellChordSpec[];
}> = [
  {
    id: '2-5-1',
    label: 'Dm7 · G7 · Cmaj7 (ii–V–I)',
    chords: [
      { rootPc: 2, quality: 'min7' },
      { rootPc: 7, quality: 'dom7' },
      { rootPc: 0, quality: 'maj7' },
    ],
  },
  {
    id: '1-4-5',
    label: 'Cmaj7 · Fmaj7 · G7',
    chords: [
      { rootPc: 0, quality: 'maj7' },
      { rootPc: 5, quality: 'maj7' },
      { rootPc: 7, quality: 'dom7' },
    ],
  },
  {
    id: '6-2-5-1',
    label: 'Am7 · Dm7 · G7 · Cmaj7',
    chords: [
      { rootPc: 9, quality: 'min7' },
      { rootPc: 2, quality: 'min7' },
      { rootPc: 7, quality: 'dom7' },
      { rootPc: 0, quality: 'maj7' },
    ],
  },
];

const makeChordKey = (c: ShellChordSpec): string => `${c.rootPc}-${c.quality}`;

export const SeventhChordsBoard: React.FC<SeventhChordsBoardProps> = ({
  strings,
  maxFret,
  accidentals,
}) => {
  const [selectedChords, setSelectedChords] = useState<ShellChordSpec[]>([
    { rootPc: 0, quality: 'maj7' },
  ]);
  const [pickerRootPc, setPickerRootPc] = useState<number>(0);
  const [pickerQuality, setPickerQuality] = useState<SeventhQuality>('maj7');
  const [selectedStrings, setSelectedStrings] = useState<number[]>([2, 3, 5]);
  const [rootInBassOnly, setRootInBassOnly] = useState<boolean>(true);
  const [activeVoicingId, setActiveVoicingId] = useState<string | null>(null);
  const [showAllFretNotes, setShowAllFretNotes] = useState<boolean>(false);

  const isMultiChord = selectedChords.length > 1;

  const formatChordName = useCallback(
    (c: ShellChordSpec) =>
      `${formatPitchClass(c.rootPc, accidentals)}${SEVENTH_DEFINITIONS[c.quality].suffix}`,
    [accidentals]
  );

  const sortedStrings = useMemo(
    () => [...selectedStrings].sort((a, b) => a - b),
    [selectedStrings]
  );

  const voicings = useMemo(() => {
    const all: SeventhVoicing[] = [];
    selectedChords.forEach((chord) => {
      const label = formatChordName(chord);
      const list = getShellVoicings(
        strings,
        maxFret,
        sortedStrings,
        chord.rootPc,
        chord.quality
      ).filter((v) => !rootInBassOnly || v.inversion === 'Root Position');

      list.forEach((v) => {
        all.push({
          ...v,
          id: `${makeChordKey(chord)}::${v.id}`,
          chordLabel: label,
          color: isMultiChord ? PITCH_CLASS_COLORS[chord.rootPc] : undefined,
        });
      });
    });
    all.sort((a, b) => a.minFret - b.minFret || a.maxFret - b.maxFret);
    return all;
  }, [
    selectedChords,
    strings,
    maxFret,
    sortedStrings,
    formatChordName,
    isMultiChord,
    rootInBassOnly,
  ]);

  const activeVoicing = useMemo(
    () => voicings.find((v) => v.id === activeVoicingId) ?? null,
    [voicings, activeVoicingId]
  );

  const selectedFrets = useMemo(() => {
    if (!activeVoicing) return new Set<string>();
    return new Set(
      activeVoicing.notes.map((n) => makeFretKey(n.stringIndex, n.fret))
    );
  }, [activeVoicing]);

  const getShellMarker = useCallback(
    (stringIndex: number, _fret: number, pc: number): FretMarker | null => {
      if (!selectedStrings.includes(stringIndex)) return null;

      let bestDeg: { degree: string; index: 0 | 1 | 2 | 3 } | null = null;
      for (const chord of selectedChords) {
        const deg = getSeventhDegree(pc, chord.rootPc, chord.quality);
        // Shell chords keep R (0), 3rd (1), 7th (3) — drop 5th (2)
        if (deg && deg.index !== 2 && (!bestDeg || deg.index < bestDeg.index)) {
          bestDeg = deg;
        }
      }
      if (!bestDeg) return null;

      return {
        label: formatPitchClass(pc, accidentals),
        color: PITCH_CLASS_COLORS[pc],
        border: bestDeg.index === 0 ? 'root' : bestDeg.index === 1 ? 'solid' : 'dashed',
      };
    },
    [selectedStrings, selectedChords, accidentals]
  );

  const handlePickRoot = (pc: number) => {
    setPickerRootPc(pc);
    setActiveVoicingId(null);
    if (selectedChords.length === 1) {
      setSelectedChords([{ rootPc: pc, quality: pickerQuality }]);
    }
  };

  const handlePickQuality = (q: SeventhQuality) => {
    setPickerQuality(q);
    setActiveVoicingId(null);
    if (selectedChords.length === 1) {
      setSelectedChords([{ rootPc: pickerRootPc, quality: q }]);
    }
  };

  const handleAddPickerChord = () => {
    const candidate: ShellChordSpec = {
      rootPc: pickerRootPc,
      quality: pickerQuality,
    };
    const key = makeChordKey(candidate);
    setActiveVoicingId(null);
    setSelectedChords((prev) =>
      prev.some((c) => makeChordKey(c) === key) ? prev : [...prev, candidate]
    );
  };

  const handleRemoveChord = (chord: ShellChordSpec) => {
    if (selectedChords.length <= 1) return;
    const key = makeChordKey(chord);
    setActiveVoicingId(null);
    setSelectedChords((prev) => prev.filter((c) => makeChordKey(c) !== key));
  };

  const handleToggleSingleString = (stringIndex: number) => {
    setActiveVoicingId(null);
    if (selectedStrings.includes(stringIndex)) {
      if (selectedStrings.length <= 1) return;
      setSelectedStrings(selectedStrings.filter((s) => s !== stringIndex));
      return;
    }
    if (selectedStrings.length < 3) {
      setSelectedStrings([...selectedStrings, stringIndex]);
      return;
    }
    setSelectedStrings([...selectedStrings.slice(1), stringIndex]);
  };

  const activePresetId = useMemo(() => {
    const key = sortedStrings.join('-');
    return (
      SHELL_STRING_SETS.find((preset) => preset.strings.join('-') === key)?.id ??
      null
    );
  }, [sortedStrings]);

  const pickerChordAlreadyAdded = selectedChords.some(
    (c) => c.rootPc === pickerRootPc && c.quality === pickerQuality
  );

  return (
    <section
      className="panel triads-board-panel"
      aria-label="Shell chords study section"
    >
      <SectionHeader
        title="Shell Chords Study Board (R – 3 – 7 Voicings)"
        subtitle={
          <>
            Active Chords:{' '}
            <strong>{selectedChords.map(formatChordName).join(' · ')}</strong> · Strings:{' '}
            <strong>{sortedStrings.map((s) => `S${s + 1}`).join('–')}</strong> · Drops
            the 5th and keeps Root, 3rd, and 7th for clean 3-string 7th chord shapes.
          </>
        }
        actions={
          <>
            <button
              type="button"
              className={`toggle-btn ${rootInBassOnly ? 'active' : ''}`}
              onClick={() => {
                setRootInBassOnly((v) => !v);
                setActiveVoicingId(null);
              }}
            >
              Root in Bass Only: {rootInBassOnly ? 'On' : 'Off'}
            </button>
            <button
              type="button"
              className={`toggle-btn ${showAllFretNotes ? 'active' : ''}`}
              onClick={() => setShowAllFretNotes((v) => !v)}
            >
              Background Notes: {showAllFretNotes ? 'On' : 'Off'}
            </button>
          </>
        }
      />

      <div className="triads-controls-grid">
        <div className="triads-control-group">
          <span className="triads-control-label">
            Active Shell Chords & Jazz Progressions
          </span>
          <div className="triads-strings-controls">
            <div className="triads-pill-row">
              {selectedChords.map((chord) => {
                const name = formatChordName(chord);
                const color = PITCH_CLASS_COLORS[chord.rootPc];
                return (
                  <span
                    key={makeChordKey(chord)}
                    className="triad-active-chord-chip"
                    style={{ borderColor: color }}
                  >
                    <span
                      className="triad-chord-dot"
                      style={{ backgroundColor: color }}
                    />
                    <strong>{name}</strong>
                    {selectedChords.length > 1 && (
                      <button
                        type="button"
                        className="triad-chip-remove"
                        onClick={() => handleRemoveChord(chord)}
                        aria-label={`Remove ${name}`}
                        title={`Remove ${name}`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                );
              })}
              {selectedChords.length > 1 && (
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => {
                    setSelectedChords([
                      { rootPc: pickerRootPc, quality: pickerQuality },
                    ]);
                    setActiveVoicingId(null);
                  }}
                >
                  Single Chord
                </button>
              )}
            </div>

            <div className="triads-pill-row">
              {SHELL_PROGRESSIONS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="toggle-btn"
                  onClick={() => {
                    setSelectedChords(preset.chords);
                    setActiveVoicingId(null);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="triads-control-group">
          <span className="triads-control-label">
            Root Note & Shell Quality (R – 3 – 7){' '}
            {isMultiChord ? '(Pick & click "+ Add Chord")' : ''}
          </span>
          <div className="triads-pill-row">
            {ALL_PITCH_CLASSES.map((pc) => {
              const label = formatPitchClass(pc, accidentals);
              const isActive = pickerRootPc === pc;
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
                  onClick={() => handlePickRoot(pc)}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="triads-pill-row" style={{ marginTop: '0.25rem' }}>
            {SEVENTH_QUALITY_LIST.map((q) => {
              const qDef = SEVENTH_DEFINITIONS[q];
              const shellDegrees = [
                qDef.degreeLabels[0],
                qDef.degreeLabels[1],
                qDef.degreeLabels[3],
              ];
              return (
                <button
                  key={q}
                  type="button"
                  className={`toggle-btn ${pickerQuality === q ? 'active' : ''}`}
                  onClick={() => handlePickQuality(q)}
                >
                  {qDef.label} ({shellDegrees.join(' ')})
                </button>
              );
            })}
            <button
              type="button"
              className="toggle-btn active"
              disabled={pickerChordAlreadyAdded}
              onClick={handleAddPickerChord}
              title="Add this shell chord alongside existing chords"
            >
              + Add {formatChordName({ rootPc: pickerRootPc, quality: pickerQuality })}
            </button>
          </div>
        </div>

        <div className="triads-control-group">
          <span className="triads-control-label">
            3-String Shell Set (Presets or Any 3 Strings)
          </span>
          <div className="triads-strings-controls">
            <div className="triads-pill-row">
              {SHELL_STRING_SETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`toggle-btn ${activePresetId === preset.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedStrings([...preset.strings]);
                    setActiveVoicingId(null);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="triads-pill-row">
              {strings.map((_, sIdx) => {
                const isSelected = selectedStrings.includes(sIdx);
                return (
                  <button
                    key={sIdx}
                    type="button"
                    className={`toggle-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleToggleSingleString(sIdx)}
                    title={`Toggle String ${sIdx + 1}`}
                  >
                    S{sIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="triads-legend-row">
        {isMultiChord ? (
          selectedChords.map((chord) => (
            <span key={makeChordKey(chord)} className="triads-legend-item">
              <span
                className="triads-legend-swatch"
                style={{ background: PITCH_CLASS_COLORS[chord.rootPc] }}
              />
              {formatChordName(chord)}
            </span>
          ))
        ) : (
          <>
            <span className="triads-legend-item">
              <span className="triads-legend-swatch" style={{ background: '#10b981' }} />
              Root Position
            </span>
            {!rootInBassOnly && (
              <>
                <span className="triads-legend-item">
                  <span
                    className="triads-legend-swatch"
                    style={{ background: '#38bdf8' }}
                  />
                  1st Inversion (3rd in bass)
                </span>
                <span className="triads-legend-item">
                  <span
                    className="triads-legend-swatch"
                    style={{ background: '#f59e0b' }}
                  />
                  3rd Inversion (7th in bass)
                </span>
              </>
            )}
          </>
        )}
        {activeVoicing && (
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setActiveVoicingId(null)}
          >
            Show All Shapes
          </button>
        )}
      </div>

      <Fretboard
        strings={strings}
        maxFret={maxFret}
        accidentals={accidentals}
        showAllNotes={showAllFretNotes}
        showAccidentals={true}
        connectSameNotes={false}
        triadVoicings={voicings}
        activeTriadVoicingId={activeVoicingId}
        selectedFrets={selectedFrets}
        getMarker={getShellMarker}
      />

      {selectedStrings.length !== 3 ? (
        <p className="triads-empty-msg">Select 3 strings above to view shell chord shapes.</p>
      ) : voicings.length === 0 ? (
        <p className="triads-empty-msg">
          No close-position shell chords found on{' '}
          {sortedStrings.map((s) => `S${s + 1}`).join('–')} within 0–{maxFret} frets.
        </p>
      ) : (
        <div className="triads-voicings-grid">
          {voicings.map((voicing) => {
            const isSelected = activeVoicingId === voicing.id;
            const windowStart = Math.max(0, voicing.minFret);
            const windowEnd = Math.max(windowStart + 3, voicing.maxFret);
            const cols = Array.from(
              { length: windowEnd - windowStart + 1 },
              (_, i) => windowStart + i
            );
            const inactiveRows = new Set(
              strings
                .map((_, sIdx) => sIdx)
                .filter((sIdx) => !sortedStrings.includes(sIdx))
            );
            const miniNotes: MiniFretNote[] = voicing.notes.map((note) => ({
              row: note.stringIndex,
              col: note.fret,
              label: note.degree,
              color: PITCH_CLASS_COLORS[note.pc],
              highlight: note.degreeIndex === 0 ? 'anchor' : 'target',
              title: `${formatPitchClass(note.pc, accidentals)} (${note.degree})`,
            }));

            return (
              <button
                key={voicing.id}
                type="button"
                className={`triad-voicing-card ${isSelected ? 'is-active' : ''}`}
                onClick={() =>
                  setActiveVoicingId((prev) =>
                    prev === voicing.id ? null : voicing.id
                  )
                }
              >
                <div className="triad-voicing-header">
                  <span className="triad-inversion-title">
                    {isMultiChord && voicing.chordLabel && (
                      <span
                        className="triad-card-chord-pill"
                        style={{ backgroundColor: voicing.color }}
                      >
                        {voicing.chordLabel}
                      </span>
                    )}
                    {voicing.inversion}
                  </span>
                  <span className="triad-fret-badge">
                    {voicing.minFret === 0 ? 'Open' : `F${voicing.minFret}`}–F{voicing.maxFret}
                  </span>
                </div>

                <MiniFretboard
                  rowCount={strings.length}
                  cols={cols}
                  notes={miniNotes}
                  inactiveRows={inactiveRows}
                  fretLabels={cols.map((f) => (f === 0 ? '0' : String(f)))}
                  rowHeight={22}
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
