import React, { useCallback, useMemo, useState } from 'react';
import {
  AccidentalMode,
  formatPitchClass,
  getSeventhDegree,
  getShellVoicings,
  getTriadDegree,
  getTriadVoicings,
  PITCH_CLASS_COLORS,
  SEVENTH_DEFINITIONS,
  SeventhQuality,
  SeventhVoicing,
  SHELL_STRING_SETS,
  THREE_STRING_SETS,
  TRIAD_DEFINITIONS,
  TriadQuality,
  TriadVoicing,
} from '../utils/musicTheory';
import { Fretboard, FretMarker, makeFretKey } from './Fretboard';
import { MiniFretboard, MiniFretNote } from './MiniFretboard';
import { SectionHeader } from './SectionHeader';
import './ChordStudyBoard.css';

export type ChordStudyMode = 'triad' | 'shell';

interface ChordStudyBoardProps {
  mode: ChordStudyMode;
  strings: number[];
  maxFret: number;
  accidentals: AccidentalMode;
}

type AnyQuality = TriadQuality | SeventhQuality;
type AnyVoicing = TriadVoicing | SeventhVoicing;

interface ChordSpec {
  rootPc: number;
  quality: AnyQuality;
}

interface ProgressionStep {
  offset: number;
  quality: AnyQuality;
}

interface ProgressionPreset {
  id: string;
  mode: 'major' | 'minor';
  romanLabel: string;
  steps: ProgressionStep[];
}

const ALL_PITCH_CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const TRIAD_PROGRESSIONS: ProgressionPreset[] = [
  {
    id: '1-4-5',
    mode: 'major',
    romanLabel: 'I–IV–V',
    steps: [
      { offset: 0, quality: 'major' },
      { offset: 5, quality: 'major' },
      { offset: 7, quality: 'major' },
    ],
  },
  {
    id: '1-5-6-4',
    mode: 'major',
    romanLabel: 'I–V–vi–IV',
    steps: [
      { offset: 0, quality: 'major' },
      { offset: 7, quality: 'major' },
      { offset: 9, quality: 'minor' },
      { offset: 5, quality: 'major' },
    ],
  },
  {
    id: '2-5-1',
    mode: 'major',
    romanLabel: 'ii–V–I',
    steps: [
      { offset: 2, quality: 'minor' },
      { offset: 7, quality: 'major' },
      { offset: 0, quality: 'major' },
    ],
  },
  {
    id: 'm-1-4-5',
    mode: 'minor',
    romanLabel: 'vi–ii–iii',
    steps: [
      { offset: 9, quality: 'minor' },
      { offset: 2, quality: 'minor' },
      { offset: 4, quality: 'minor' },
    ],
  },
  {
    id: 'm-1-6-3-7',
    mode: 'minor',
    romanLabel: 'vi–IV–I–V',
    steps: [
      { offset: 9, quality: 'minor' },
      { offset: 5, quality: 'major' },
      { offset: 0, quality: 'major' },
      { offset: 7, quality: 'major' },
    ],
  },
  {
    id: 'm-1-6-7',
    mode: 'minor',
    romanLabel: 'vi–IV–V',
    steps: [
      { offset: 9, quality: 'minor' },
      { offset: 5, quality: 'major' },
      { offset: 7, quality: 'major' },
    ],
  },
];

const SHELL_PROGRESSIONS: ProgressionPreset[] = [
  {
    id: '2-5-1',
    mode: 'major',
    romanLabel: 'ii–V–I',
    steps: [
      { offset: 2, quality: 'min7' },
      { offset: 7, quality: 'dom7' },
      { offset: 0, quality: 'maj7' },
    ],
  },
  {
    id: '1-4-5',
    mode: 'major',
    romanLabel: 'I–IV–V',
    steps: [
      { offset: 0, quality: 'maj7' },
      { offset: 5, quality: 'maj7' },
      { offset: 7, quality: 'dom7' },
    ],
  },
  {
    id: '6-2-5-1',
    mode: 'minor',
    romanLabel: 'vi–ii–V–I',
    steps: [
      { offset: 9, quality: 'min7' },
      { offset: 2, quality: 'min7' },
      { offset: 7, quality: 'dom7' },
      { offset: 0, quality: 'maj7' },
    ],
  },
];

const STUDY_CONFIG = {
  triad: {
    ariaLabel: 'Triads study section',
    title: 'Triads Study Board (3-String Chord Shapes)',
    subtitleSuffix: 'Study one chord or stack multiple chords on the same 3 strings.',
    activeChordsLabel: 'Active Chords & Quick Progressions',
    qualitySectionLabel: 'Root Note & Quality',
    stringSetSectionLabel: '3-String Set (Presets or Any 3 Strings)',
    defaultQuality: 'major' as AnyQuality,
    defaultStrings: [0, 1, 2],
    showRootInBassToggle: false,
    stringSets: THREE_STRING_SETS,
    qualities: ['major', 'minor', 'dim', 'aug'] as AnyQuality[],
    progressions: TRIAD_PROGRESSIONS,
    inversionLegend: [
      { label: 'Root Position', color: '#10b981', rootOnly: false },
      { label: '1st Inversion', color: '#38bdf8', rootOnly: false },
      { label: '2nd Inversion', color: '#f472b6', rootOnly: false },
    ],
  },
  shell: {
    ariaLabel: 'Shell chords study section',
    title: 'Shell Chords Study Board (R – 3 – 7 Voicings)',
    subtitleSuffix:
      'Drops the 5th and keeps Root, 3rd, and 7th for clean 3-string 7th chord shapes.',
    activeChordsLabel: 'Active Shell Chords & Jazz Progressions',
    qualitySectionLabel: 'Root Note & Shell Quality (R – 3 – 7)',
    stringSetSectionLabel: '3-String Shell Set (Presets or Any 3 Strings)',
    defaultQuality: 'maj7' as AnyQuality,
    defaultStrings: [2, 3, 5],
    showRootInBassToggle: true,
    stringSets: SHELL_STRING_SETS,
    qualities: ['maj7', 'dom7', 'min7', 'm7b5', 'dim7'] as AnyQuality[],
    progressions: SHELL_PROGRESSIONS,
    inversionLegend: [
      { label: 'Root Position', color: '#10b981', rootOnly: true },
      { label: '1st Inversion (3rd in bass)', color: '#38bdf8', rootOnly: false },
      { label: '3rd Inversion (7th in bass)', color: '#f59e0b', rootOnly: false },
    ],
  },
};

const makeChordKey = (c: ChordSpec): string => `${c.rootPc}-${c.quality}`;

const buildProgressionChords = (
  keyRootPc: number,
  steps: ProgressionStep[]
): ChordSpec[] =>
  steps.map((s) => ({
    rootPc: (keyRootPc + s.offset) % 12,
    quality: s.quality,
  }));

const getQualityInfo = (mode: ChordStudyMode, quality: AnyQuality) => {
  if (mode === 'triad') {
    const def = TRIAD_DEFINITIONS[quality as TriadQuality];
    return {
      label: def.label,
      suffix: def.suffix,
      degreesText: def.degreeLabels.join(' '),
    };
  }
  const def = SEVENTH_DEFINITIONS[quality as SeventhQuality];
  return {
    label: def.label,
    suffix: def.suffix,
    degreesText: `${def.degreeLabels[0]} ${def.degreeLabels[1]} ${def.degreeLabels[3]}`,
  };
};

export const ChordStudyBoard: React.FC<ChordStudyBoardProps> = ({
  mode,
  strings,
  maxFret,
  accidentals,
}) => {
  const cfg = STUDY_CONFIG[mode];

  const [selectedChords, setSelectedChords] = useState<ChordSpec[]>([
    { rootPc: 0, quality: cfg.defaultQuality },
  ]);
  const [pickerRootPc, setPickerRootPc] = useState<number>(0);
  const [pickerQuality, setPickerQuality] = useState<AnyQuality>(cfg.defaultQuality);
  const [activeProgressionId, setActiveProgressionId] = useState<string | null>(null);
  const [selectedStrings, setSelectedStrings] = useState<number[]>(cfg.defaultStrings);
  const [rootInBassOnly, setRootInBassOnly] = useState<boolean>(
    cfg.showRootInBassToggle
  );
  const [activeVoicingId, setActiveVoicingId] = useState<string | null>(null);
  const [showAllFretNotes, setShowAllFretNotes] = useState<boolean>(false);

  const isMultiChord = selectedChords.length > 1;

  const formatChordName = useCallback(
    (c: ChordSpec) =>
      `${formatPitchClass(c.rootPc, accidentals)}${getQualityInfo(mode, c.quality).suffix}`,
    [accidentals, mode]
  );

  const sortedStrings = useMemo(
    () => [...selectedStrings].sort((a, b) => a - b),
    [selectedStrings]
  );

  const voicings = useMemo(() => {
    const all: AnyVoicing[] = [];
    selectedChords.forEach((chord) => {
      const label = formatChordName(chord);
      const raw =
        mode === 'triad'
          ? getTriadVoicings(
              strings,
              maxFret,
              sortedStrings,
              chord.rootPc,
              chord.quality as TriadQuality
            )
          : getShellVoicings(
              strings,
              maxFret,
              sortedStrings,
              chord.rootPc,
              chord.quality as SeventhQuality
            ).filter((v) => !rootInBassOnly || v.inversion === 'Root Position');

      raw.forEach((v) => {
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
    mode,
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

  const getChordMarker = useCallback(
    (stringIndex: number, _fret: number, pc: number): FretMarker | null => {
      if (!selectedStrings.includes(stringIndex)) return null;

      let bestIndex: number | null = null;
      for (const chord of selectedChords) {
        const deg =
          mode === 'triad'
            ? getTriadDegree(pc, chord.rootPc, chord.quality as TriadQuality)
            : getSeventhDegree(pc, chord.rootPc, chord.quality as SeventhQuality);
        if (!deg) continue;
        if (mode === 'shell' && deg.index === 2) continue;
        if (bestIndex === null || deg.index < bestIndex) {
          bestIndex = deg.index;
        }
      }
      if (bestIndex === null) return null;

      return {
        label: formatPitchClass(pc, accidentals),
        color: PITCH_CLASS_COLORS[pc],
        border: bestIndex === 0 ? 'root' : bestIndex === 1 ? 'solid' : 'dashed',
      };
    },
    [selectedStrings, selectedChords, mode, accidentals]
  );

  const handlePickRoot = (pc: number) => {
    setPickerRootPc(pc);
    setActiveVoicingId(null);
    if (activeProgressionId) {
      const preset = cfg.progressions.find((p) => p.id === activeProgressionId);
      if (preset) {
        setSelectedChords(buildProgressionChords(pc, preset.steps));
        return;
      }
    }
    if (selectedChords.length === 1) {
      setSelectedChords([{ rootPc: pc, quality: pickerQuality }]);
    }
  };

  const handlePickQuality = (q: AnyQuality) => {
    setPickerQuality(q);
    setActiveVoicingId(null);
    if (selectedChords.length === 1) {
      setSelectedChords([{ rootPc: pickerRootPc, quality: q }]);
    }
  };

  const handleAddPickerChord = () => {
    const candidate: ChordSpec = { rootPc: pickerRootPc, quality: pickerQuality };
    const key = makeChordKey(candidate);
    setActiveProgressionId(null);
    setActiveVoicingId(null);
    setSelectedChords((prev) =>
      prev.some((c) => makeChordKey(c) === key) ? prev : [...prev, candidate]
    );
  };

  const handleRemoveChord = (chord: ChordSpec) => {
    if (selectedChords.length <= 1) return;
    const key = makeChordKey(chord);
    setActiveProgressionId(null);
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
      cfg.stringSets.find((preset) => preset.strings.join('-') === key)?.id ?? null
    );
  }, [cfg.stringSets, sortedStrings]);

  const pickerChordAlreadyAdded = selectedChords.some(
    (c) => c.rootPc === pickerRootPc && c.quality === pickerQuality
  );

  const progressionModes = useMemo(
    () => (['major', 'minor'] as const).filter((m) => cfg.progressions.some((p) => p.mode === m)),
    [cfg.progressions]
  );

  return (
    <section className="panel chord-study-panel" aria-label={cfg.ariaLabel}>
      <SectionHeader
        title={cfg.title}
        subtitle={
          <>
            Active Chords:{' '}
            <strong>{selectedChords.map(formatChordName).join(' · ')}</strong> · Strings:{' '}
            <strong>{sortedStrings.map((s) => `S${s + 1}`).join('–')}</strong> ·{' '}
            {cfg.subtitleSuffix}
          </>
        }
        actions={
          <>
            {cfg.showRootInBassToggle && (
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
            )}
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

      <div className="chord-study-controls-grid">
        <div className="chord-study-control-group">
          <span className="chord-study-control-label">{cfg.activeChordsLabel}</span>
          <div className="chord-study-strings-controls">
            <div className="chord-study-pill-row">
              {selectedChords.map((chord) => {
                const name = formatChordName(chord);
                const color = PITCH_CLASS_COLORS[chord.rootPc];
                return (
                  <span
                    key={makeChordKey(chord)}
                    className="chord-active-chip"
                    style={{ borderColor: color }}
                  >
                    <span
                      className="chord-active-dot"
                      style={{ backgroundColor: color }}
                    />
                    <strong>{name}</strong>
                    {selectedChords.length > 1 && (
                      <button
                        type="button"
                        className="chord-chip-remove"
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
                    setActiveProgressionId(null);
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

            <div className="chord-progression-rows">
              {progressionModes.map((progMode) => (
                <div key={progMode} className="chord-progression-row">
                  <span className="chord-progression-tag">
                    {progMode === 'major' ? 'Major' : 'Rel. Minor'}
                  </span>
                  <div className="chord-study-pill-row">
                    {cfg.progressions
                      .filter((p) => p.mode === progMode)
                      .map((preset) => {
                        const chords = buildProgressionChords(pickerRootPc, preset.steps);
                        const label = `${chords.map(formatChordName).join(' · ')} (${preset.romanLabel})`;
                        const isActive = activeProgressionId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            className={`toggle-btn ${isActive ? 'active' : ''}`}
                            onClick={() => {
                              setActiveProgressionId(preset.id);
                              setSelectedChords(chords);
                              setActiveVoicingId(null);
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chord-study-control-group">
          <span className="chord-study-control-label">
            {cfg.qualitySectionLabel}{' '}
            {isMultiChord ? '(Pick & click "+ Add Chord")' : ''}
          </span>
          <div className="chord-study-pill-row">
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
          <div className="chord-study-pill-row" style={{ marginTop: '0.25rem' }}>
            {cfg.qualities.map((q) => {
              const info = getQualityInfo(mode, q);
              return (
                <button
                  key={q}
                  type="button"
                  className={`toggle-btn ${pickerQuality === q ? 'active' : ''}`}
                  onClick={() => handlePickQuality(q)}
                >
                  {info.label} ({info.degreesText})
                </button>
              );
            })}
            <button
              type="button"
              className="toggle-btn active"
              disabled={pickerChordAlreadyAdded}
              onClick={handleAddPickerChord}
              title="Add this chord alongside existing chords"
            >
              + Add {formatChordName({ rootPc: pickerRootPc, quality: pickerQuality })}
            </button>
          </div>
        </div>

        <div className="chord-study-control-group">
          <span className="chord-study-control-label">{cfg.stringSetSectionLabel}</span>
          <div className="chord-study-strings-controls">
            <div className="chord-study-pill-row">
              {cfg.stringSets.map((preset) => (
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
            <div className="chord-study-pill-row">
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

      <div className="chord-study-legend-row">
        {isMultiChord
          ? selectedChords.map((chord) => (
              <span key={makeChordKey(chord)} className="chord-study-legend-item">
                <span
                  className="chord-study-legend-swatch"
                  style={{ background: PITCH_CLASS_COLORS[chord.rootPc] }}
                />
                {formatChordName(chord)}
              </span>
            ))
          : cfg.inversionLegend
              .filter((item) => !rootInBassOnly || item.rootOnly)
              .map((item) => (
                <span key={item.label} className="chord-study-legend-item">
                  <span
                    className="chord-study-legend-swatch"
                    style={{ background: item.color }}
                  />
                  {item.label}
                </span>
              ))}
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
        getMarker={getChordMarker}
      />

      {selectedStrings.length !== 3 ? (
        <p className="chord-study-empty-msg">
          Select 3 strings above to view chord shapes.
        </p>
      ) : voicings.length === 0 ? (
        <p className="chord-study-empty-msg">
          No close-position shapes found on{' '}
          {sortedStrings.map((s) => `S${s + 1}`).join('–')} within 0–{maxFret} frets.
        </p>
      ) : (
        <div className="chord-voicings-grid">
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
                className={`chord-voicing-card ${isSelected ? 'is-active' : ''}`}
                onClick={() =>
                  setActiveVoicingId((prev) =>
                    prev === voicing.id ? null : voicing.id
                  )
                }
              >
                <div className="chord-voicing-header">
                  <span className="chord-inversion-title">
                    {isMultiChord && voicing.chordLabel && (
                      <span
                        className="chord-card-pill"
                        style={{ backgroundColor: voicing.color }}
                      >
                        {voicing.chordLabel}
                      </span>
                    )}
                    {voicing.inversion}
                  </span>
                  <span className="chord-fret-badge">
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

