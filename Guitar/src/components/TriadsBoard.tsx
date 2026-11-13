import React, { useCallback, useMemo, useState } from 'react';
import {
  AccidentalMode,
  formatPitchClass,
  getTriadDegree,
  getTriadVoicings,
  PITCH_CLASS_COLORS,
  THREE_STRING_SETS,
  TRIAD_DEFINITIONS,
  TriadQuality,
  TriadVoicing,
} from '../utils/musicTheory';
import { Fretboard, FretMarker, makeFretKey } from './Fretboard';
import { MiniFretboard, MiniFretNote } from './MiniFretboard';
import { SectionHeader } from './SectionHeader';
import './TriadsBoard.css';

interface TriadsBoardProps {
  strings: number[];
  maxFret: number;
  accidentals: AccidentalMode;
}

interface ChordSpec {
  rootPc: number;
  quality: TriadQuality;
}

const ALL_PITCH_CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const QUALITY_LIST: TriadQuality[] = ['major', 'minor', 'dim', 'aug'];

const PROGRESSION_PRESETS: Array<{
  id: string;
  label: string;
  chords: ChordSpec[];
}> = [
  {
    id: '1-4-5',
    label: 'C · F · G (I–IV–V)',
    chords: [
      { rootPc: 0, quality: 'major' },
      { rootPc: 5, quality: 'major' },
      { rootPc: 7, quality: 'major' },
    ],
  },
  {
    id: '1-5-6-4',
    label: 'C · G · Am · F',
    chords: [
      { rootPc: 0, quality: 'major' },
      { rootPc: 7, quality: 'major' },
      { rootPc: 9, quality: 'minor' },
      { rootPc: 5, quality: 'major' },
    ],
  },
  {
    id: '2-5-1',
    label: 'Dm · G · C (ii–V–I)',
    chords: [
      { rootPc: 2, quality: 'minor' },
      { rootPc: 7, quality: 'major' },
      { rootPc: 0, quality: 'major' },
    ],
  },
];

const makeChordKey = (c: ChordSpec): string => `${c.rootPc}-${c.quality}`;

export const TriadsBoard: React.FC<TriadsBoardProps> = ({
  strings,
  maxFret,
  accidentals,
}) => {
  const [selectedChords, setSelectedChords] = useState<ChordSpec[]>([
    { rootPc: 0, quality: 'major' },
  ]);
  const [pickerRootPc, setPickerRootPc] = useState<number>(0);
  const [pickerQuality, setPickerQuality] = useState<TriadQuality>('major');
  const [selectedStrings, setSelectedStrings] = useState<number[]>([0, 1, 2]);
  const [activeVoicingId, setActiveVoicingId] = useState<string | null>(null);
  const [showAllFretNotes, setShowAllFretNotes] = useState<boolean>(false);

  const isMultiChord = selectedChords.length > 1;

  const formatChordName = useCallback(
    (c: ChordSpec) =>
      `${formatPitchClass(c.rootPc, accidentals)}${TRIAD_DEFINITIONS[c.quality].suffix}`,
    [accidentals]
  );

  const sortedStrings = useMemo(
    () => [...selectedStrings].sort((a, b) => a - b),
    [selectedStrings]
  );

  const voicings = useMemo(() => {
    const all: TriadVoicing[] = [];
    selectedChords.forEach((chord) => {
      const label = formatChordName(chord);
      const list = getTriadVoicings(
        strings,
        maxFret,
        sortedStrings,
        chord.rootPc,
        chord.quality
      );
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
  }, [selectedChords, strings, maxFret, sortedStrings, formatChordName, isMultiChord]);

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

  const getTriadMarker = useCallback(
    (stringIndex: number, _fret: number, pc: number): FretMarker | null => {
      if (!selectedStrings.includes(stringIndex)) return null;

      let bestDeg: { degree: string; index: 0 | 1 | 2 } | null = null;
      for (const chord of selectedChords) {
        const deg = getTriadDegree(pc, chord.rootPc, chord.quality);
        if (deg) {
          if (!bestDeg || deg.index < bestDeg.index) {
            bestDeg = deg;
          }
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

  const handlePickQuality = (q: TriadQuality) => {
    setPickerQuality(q);
    setActiveVoicingId(null);
    if (selectedChords.length === 1) {
      setSelectedChords([{ rootPc: pickerRootPc, quality: q }]);
    }
  };

  const handleAddPickerChord = () => {
    const candidate: ChordSpec = { rootPc: pickerRootPc, quality: pickerQuality };
    const key = makeChordKey(candidate);
    setActiveVoicingId(null);
    setSelectedChords((prev) =>
      prev.some((c) => makeChordKey(c) === key) ? prev : [...prev, candidate]
    );
  };

  const handleRemoveChord = (chord: ChordSpec) => {
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
      THREE_STRING_SETS.find((preset) => preset.strings.join('-') === key)?.id ??
      null
    );
  }, [sortedStrings]);

  const handleSelectVoicing = (voicing: TriadVoicing) => {
    setActiveVoicingId((prev) => (prev === voicing.id ? null : voicing.id));
  };

  const pickerChordAlreadyAdded = selectedChords.some(
    (c) => c.rootPc === pickerRootPc && c.quality === pickerQuality
  );

  return (
    <section className="panel triads-board-panel" aria-label="Triads study section">
      <SectionHeader
        title="Triads Study Board (3-String Chord Shapes)"
        subtitle={
          <>
            Active Chords:{' '}
            <strong>{selectedChords.map(formatChordName).join(' · ')}</strong> · Strings:{' '}
            <strong>{sortedStrings.map((s) => `S${s + 1}`).join('–')}</strong> · Study one
            chord or stack multiple chords on the same 3 strings.
          </>
        }
        actions={
          <button
            type="button"
            className={`toggle-btn ${showAllFretNotes ? 'active' : ''}`}
            onClick={() => setShowAllFretNotes((v) => !v)}
          >
            Background Notes: {showAllFretNotes ? 'On' : 'Off'}
          </button>
        }
      />

      <div className="triads-controls-grid">
        <div className="triads-control-group">
          <span className="triads-control-label">Active Chords & Quick Progressions</span>
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
              {PROGRESSION_PRESETS.map((preset) => (
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
            Root Note & Quality {isMultiChord ? '(Pick & click "+ Add Chord")' : ''}
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
            {QUALITY_LIST.map((q) => {
              const qDef = TRIAD_DEFINITIONS[q];
              return (
                <button
                  key={q}
                  type="button"
                  className={`toggle-btn ${pickerQuality === q ? 'active' : ''}`}
                  onClick={() => handlePickQuality(q)}
                >
                  {qDef.label} ({qDef.degreeLabels.join(' ')})
                </button>
              );
            })}
            <button
              type="button"
              className="toggle-btn active"
              disabled={pickerChordAlreadyAdded}
              onClick={handleAddPickerChord}
              title="Add this chord to the Triads Study Board alongside existing chords"
            >
              + Add {formatChordName({ rootPc: pickerRootPc, quality: pickerQuality })}
            </button>
          </div>
        </div>

        <div className="triads-control-group">
          <span className="triads-control-label">3-String Set (Presets or Any 3 Strings)</span>
          <div className="triads-strings-controls">
            <div className="triads-pill-row">
              {THREE_STRING_SETS.map((preset) => (
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
            <span className="triads-legend-item">
              <span className="triads-legend-swatch" style={{ background: '#38bdf8' }} />
              1st Inversion
            </span>
            <span className="triads-legend-item">
              <span className="triads-legend-swatch" style={{ background: '#f472b6' }} />
              2nd Inversion
            </span>
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
        getMarker={getTriadMarker}
      />

      {selectedStrings.length !== 3 ? (
        <p className="triads-empty-msg">Select 3 strings above to view triad shapes.</p>
      ) : voicings.length === 0 ? (
        <p className="triads-empty-msg">
          No close-position triads found on{' '}
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
                onClick={() => handleSelectVoicing(voicing)}
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
