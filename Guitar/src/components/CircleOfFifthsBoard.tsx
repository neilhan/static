import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccidentalMode,
  CIRCLE_OF_FIFTHS,
  formatPitchClass,
  getChangedPitchClass,
  getDiatonicScalePitchClasses,
  getFretPitchClass,
  getKeySignatureAccidentals,
  getKeyWedge,
  getTriadVoicings,
  KeyWedgeChord,
  PITCH_CLASS_COLORS,
} from '../utils/musicTheory';
import { playChordNotes } from '../utils/guitarAudio';
import { CircleOfFifths } from './CircleOfFifths';
import { Fretboard, FretMarker, makeFretKey } from './Fretboard';
import { SectionHeader } from './SectionHeader';
import './CircleOfFifthsBoard.css';

interface CircleOfFifthsBoardProps {
  strings: number[];
  maxFret: number;
}

type FretboardSyncMode = 'scale' | 'pentatonic' | 'chord' | 'fifths';

interface FretWindowOption {
  id: string;
  label: string;
  min: number;
  max: number;
}

const FRET_WINDOWS: FretWindowOption[] = [
  { id: 'all', label: 'All Frets', min: 0, max: 99 },
  { id: '0-4', label: 'Frets 0–4', min: 0, max: 4 },
  { id: '3-7', label: 'Frets 3–7', min: 3, max: 7 },
  { id: '5-8', label: 'Frets 5–8', min: 5, max: 8 },
  { id: '7-10', label: 'Frets 7–10', min: 7, max: 10 },
  { id: '9-12', label: 'Frets 9–12', min: 9, max: 12 },
];

interface WedgeProgression {
  id: string;
  label: string;
  romans: Array<KeyWedgeChord['roman']>;
}

const WEDGE_PROGRESSIONS: WedgeProgression[] = [
  { id: 'ii-V-I', label: 'ii – V – I', romans: ['ii', 'V', 'I'] },
  { id: 'I-IV-V', label: 'I – IV – V', romans: ['I', 'IV', 'V'] },
  { id: 'I-V-vi-IV', label: 'I – V – vi – IV', romans: ['I', 'V', 'vi', 'IV'] },
  { id: 'vi-IV-I-V', label: 'vi – IV – I – V', romans: ['vi', 'IV', 'I', 'V'] },
];

export const CircleOfFifthsBoard: React.FC<CircleOfFifthsBoardProps> = ({
  strings,
  maxFret,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0); // C Major / A Minor
  const [selectedQuality, setSelectedQuality] = useState<'major' | 'minor'>('major');
  const [accidentalOverride, setAccidentalOverride] = useState<AccidentalMode | null>(null);
  const [activeWedgeRoman, setActiveWedgeRoman] = useState<KeyWedgeChord['roman'] | null>(null);
  const [syncMode, setSyncMode] = useState<FretboardSyncMode>('scale');
  const [showDiatonicArc, setShowDiatonicArc] = useState<boolean>(true);
  const [showPentatonicArc, setShowPentatonicArc] = useState<boolean>(true);
  const [fretWindowId, setFretWindowId] = useState<string>('all');
  const [changedPitchClass, setChangedPitchClass] = useState<{
    pitchClass: number;
    direction: 'cw' | 'ccw';
  } | null>(null);
  const [selectedFrets, setSelectedFrets] = useState<Set<string>>(() => new Set());
  const [activeProgId, setActiveProgId] = useState<string>('ii-V-I');
  const [progStepIndex, setProgStepIndex] = useState<number>(0);
  const [isPlayingProg, setIsPlayingProg] = useState<boolean>(false);

  const activePosition = CIRCLE_OF_FIFTHS[selectedIndex];
  const effectiveAccidentals: AccidentalMode =
    accidentalOverride ?? activePosition.accidentalMode;

  const activeRootPc =
    selectedQuality === 'major' ? activePosition.majorPc : activePosition.minorPc;

  const wedge = useMemo(() => getKeyWedge(selectedIndex), [selectedIndex]);

  const activeChord = useMemo(() => {
    if (activeWedgeRoman) {
      return wedge.find((w) => w.roman === activeWedgeRoman) ?? wedge[1];
    }
    return selectedQuality === 'major'
      ? wedge.find((w) => w.roman === 'I')!
      : wedge.find((w) => w.roman === 'vi')!;
  }, [wedge, activeWedgeRoman, selectedQuality]);

  const playTriadSound = useCallback(
    (rootPc: number, quality: 'major' | 'minor' | 'dim') => {
      const voicings = getTriadVoicings(
        strings,
        Math.min(maxFret, 12),
        [0, 1, 2],
        rootPc,
        quality
      );
      if (voicings.length === 0) return;
      // Pick a comfortable mid-neck or open-position voicing
      const preferred =
        voicings.find((v) => v.minFret >= 2 && v.maxFret <= 7) ?? voicings[0];
      playChordNotes(
        preferred.notes.map((n) => ({
          openPc: strings[n.stringIndex],
          stringIndex: n.stringIndex,
          fret: n.fret,
        })),
        0.045
      );
    },
    [strings, maxFret]
  );

  const keySigAccidentals = useMemo(
    () => getKeySignatureAccidentals(selectedIndex, effectiveAccidentals),
    [selectedIndex, effectiveAccidentals]
  );

  const activeProg = useMemo(
    () => WEDGE_PROGRESSIONS.find((p) => p.id === activeProgId) ?? WEDGE_PROGRESSIONS[0],
    [activeProgId]
  );

  const triggerProgressionStep = useCallback(
    (prog: WedgeProgression, stepIdx: number) => {
      const roman = prog.romans[stepIdx % prog.romans.length];
      const chord = wedge.find((w) => w.roman === roman);
      if (!chord) return;
      setProgStepIndex(stepIdx % prog.romans.length);
      setActiveWedgeRoman(chord.roman);
      setSyncMode('chord');
      playTriadSound(chord.rootPc, chord.quality === 'aug' ? 'major' : chord.quality);
    },
    [wedge, playTriadSound]
  );

  useEffect(() => {
    if (!isPlayingProg) return;
    const timer = window.setInterval(() => {
      setProgStepIndex((prev) => {
        const next = (prev + 1) % activeProg.romans.length;
        const roman = activeProg.romans[next];
        const chord = wedge.find((w) => w.roman === roman);
        if (chord) {
          setActiveWedgeRoman(chord.roman);
          setSyncMode('chord');
          playTriadSound(chord.rootPc, chord.quality === 'aug' ? 'major' : chord.quality);
        }
        return next;
      });
    }, 1150);
    return () => window.clearInterval(timer);
  }, [isPlayingProg, activeProg, wedge, playTriadSound]);

  const handleSelectSlice = useCallback(
    (index: number, quality: 'major' | 'minor') => {
      const diff = getChangedPitchClass(selectedIndex, index);
      setChangedPitchClass(diff);
      setSelectedIndex(index);
      setSelectedQuality(quality);
      setAccidentalOverride(null);
      setActiveWedgeRoman(null);
      setIsPlayingProg(false);
      const pos = CIRCLE_OF_FIFTHS[index];
      const rootPc = quality === 'major' ? pos.majorPc : pos.minorPc;
      playTriadSound(rootPc, quality);
    },
    [selectedIndex, playTriadSound]
  );

  const handleStep = useCallback(
    (delta: 1 | -1) => {
      const nextIndex = (selectedIndex + delta + 12) % 12;
      const diff = getChangedPitchClass(selectedIndex, nextIndex);
      setChangedPitchClass(diff);
      setSelectedIndex(nextIndex);
      setAccidentalOverride(null);
      setActiveWedgeRoman(null);
      setIsPlayingProg(false);
      const pos = CIRCLE_OF_FIFTHS[nextIndex];
      const rootPc = selectedQuality === 'major' ? pos.majorPc : pos.minorPc;
      playTriadSound(rootPc, selectedQuality);
    },
    [selectedIndex, selectedQuality, playTriadSound]
  );

  const handleSelectWedgeChord = useCallback(
    (chord: KeyWedgeChord) => {
      setActiveWedgeRoman(chord.roman);
      setSyncMode('chord');
      playTriadSound(chord.rootPc, chord.quality === 'aug' ? 'major' : chord.quality);
    },
    [playTriadSound]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStep(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStep(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleStep]);

  const scalePitchClasses = useMemo(
    () => getDiatonicScalePitchClasses(activeRootPc, selectedQuality),
    [activeRootPc, selectedQuality]
  );

  const pentatonicPitchClasses = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => CIRCLE_OF_FIFTHS[(selectedIndex + i) % 12].majorPc),
    [selectedIndex]
  );

  const activeChordPitchClasses = useMemo(() => {
    const thirdOffset = activeChord.quality === 'major' ? 4 : 3;
    const fifthOffset = activeChord.quality === 'dim' ? 6 : 7;
    return [
      activeChord.rootPc,
      (activeChord.rootPc + thirdOffset) % 12,
      (activeChord.rootPc + fifthOffset) % 12,
    ];
  }, [activeChord]);

  const fretWindow = useMemo(
    () => FRET_WINDOWS.find((w) => w.id === fretWindowId) ?? FRET_WINDOWS[0],
    [fretWindowId]
  );

  const handleToggleFret = useCallback((stringIndex: number, fret: number) => {
    const key = makeFretKey(stringIndex, fret);
    setSelectedFrets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const highlightedPitchClasses = useMemo(() => {
    const pcs = new Set<number>();
    selectedFrets.forEach((key) => {
      const [sStr, fStr] = key.split(':');
      const openPc = strings[Number(sStr)];
      if (openPc !== undefined) {
        pcs.add(getFretPitchClass(openPc, Number(fStr)));
      }
    });
    return Array.from(pcs);
  }, [selectedFrets, strings]);

  const getMarker = useCallback(
    (_stringIndex: number, fret: number, pitchClass: number): FretMarker | null => {
      if (fret < fretWindow.min || fret > fretWindow.max) {
        return null;
      }

      const noteName = formatPitchClass(pitchClass, effectiveAccidentals);
      const baseColor = PITCH_CLASS_COLORS[pitchClass] ?? '#4ecdc4';
      const isDiff =
        changedPitchClass !== null && changedPitchClass.pitchClass === pitchClass;

      if (syncMode === 'scale' || syncMode === 'pentatonic') {
        const activeNotes =
          syncMode === 'pentatonic' ? pentatonicPitchClasses : scalePitchClasses;
        if (!activeNotes.includes(pitchClass)) return null;
        const isRoot = pitchClass === activeRootPc;
        return {
          label: isDiff ? `${noteName}*` : noteName,
          color: baseColor,
          border: isRoot ? 'root' : isDiff ? 'selected' : 'solid',
        };
      }

      if (syncMode === 'chord') {
        if (!activeChordPitchClasses.includes(pitchClass)) return null;
        const isRoot = pitchClass === activeChord.rootPc;
        return {
          label: noteName,
          color: baseColor,
          border: isRoot ? 'root' : 'solid',
        };
      }

      // syncMode === 'fifths' (Root + 5th + 4th)
      const fifthPc = (activeRootPc + 7) % 12;
      const fourthPc = (activeRootPc + 5) % 12;
      if (pitchClass === activeRootPc) {
        return { label: noteName, color: baseColor, border: 'root' };
      }
      if (pitchClass === fifthPc) {
        return { label: `${noteName} 5`, color: baseColor, border: 'solid' };
      }
      if (pitchClass === fourthPc) {
        return { label: `${noteName} 4`, color: baseColor, border: 'dashed' };
      }
      return null;
    },
    [
      fretWindow,
      effectiveAccidentals,
      changedPitchClass,
      syncMode,
      scalePitchClasses,
      pentatonicPitchClasses,
      activeRootPc,
      activeChordPitchClasses,
      activeChord,
    ]
  );

  const keyTitle = `${formatPitchClass(activeRootPc, effectiveAccidentals)} ${
    selectedQuality === 'major' ? 'Major' : 'Natural Minor'
  }`;

  return (
    <section className="panel circle-board-panel">
      <SectionHeader
        title="Circle of Fifths & Fretboard"
        subtitle="Click any Major or Minor slice to set the key center, inspect its diatonic wedge chords, and map them across the neck."
      />

      <div className="circle-board-grid">
        <div className="circle-board-wheel-col">
          <div className="circle-stepper-bar">
            <button
              type="button"
              className="pill-btn"
              onClick={() => handleStep(-1)}
              title="Step counter-clockwise by 4ths (Left Arrow)"
            >
              ◀ 4ths (CCW)
            </button>
            <span className="circle-key-badge">{keyTitle}</span>
            <button
              type="button"
              className="pill-btn"
              onClick={() => handleStep(1)}
              title="Step clockwise by 5ths (Right Arrow)"
            >
              5ths (CW) ▶
            </button>
          </div>

          <CircleOfFifths
            selectedIndex={selectedIndex}
            selectedQuality={selectedQuality}
            activeWedgeRoman={activeWedgeRoman}
            accidentals={effectiveAccidentals}
            highlightedPitchClasses={highlightedPitchClasses}
            changedPitchClass={changedPitchClass}
            showDiatonicArc={showDiatonicArc}
            showPentatonicArc={showPentatonicArc}
            onSelectSlice={handleSelectSlice}
          />

          <div className="toolbar-pills" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              type="button"
              className={`pill-btn ${showDiatonicArc ? 'active' : ''}`}
              onClick={() => setShowDiatonicArc((v) => !v)}
              title="Highlight the 7 contiguous diatonic notes of the active key"
            >
              7-Note Diatonic Arc
            </button>
            <button
              type="button"
              className={`pill-btn ${showPentatonicArc ? 'active' : ''}`}
              onClick={() => setShowPentatonicArc((v) => !v)}
              title="Highlight the 5 contiguous pentatonic notes of the active key"
            >
              5-Note Pentatonic Arc
            </button>
          </div>
        </div>

        <div className="circle-board-info-col">
          <div className="circle-info-card">
            <div className="circle-info-header">
              <h3>Diatonic Key Wedge ({keyTitle})</h3>
              <button
                type="button"
                className="pill-btn"
                onClick={() =>
                  setAccidentalOverride((prev) =>
                    (prev ?? effectiveAccidentals) === 'sharp' ? 'flat' : 'sharp'
                  )
                }
                title="Toggle Sharp (#) vs Flat (b) note spelling"
              >
                Spelling: {effectiveAccidentals === 'sharp' ? 'Sharps (♯)' : 'Flats (♭)'}
              </button>
            </div>

            <div className="circle-scale-strip">
              {scalePitchClasses.map((pc, idx) => (
                <span
                  key={pc}
                  className={`circle-scale-chip ${
                    changedPitchClass?.pitchClass === pc ? 'is-diff' : ''
                  }`}
                  style={{ '--chip-color': PITCH_CLASS_COLORS[pc] } as React.CSSProperties}
                >
                  <small>{idx + 1}</small>
                  <strong>{formatPitchClass(pc, effectiveAccidentals)}</strong>
                </span>
              ))}
            </div>

            <div className="circle-key-sig-row">
              <span className="circle-key-sig-label">
                Key Signature ({activePosition.signatureLabel}):
              </span>
              {keySigAccidentals.length === 0 ? (
                <span className="circle-key-sig-none">All natural notes (no ♯ or ♭)</span>
              ) : (
                <div className="circle-key-sig-chips">
                  {keySigAccidentals.map((acc) => (
                    <span key={acc} className="circle-key-sig-chip">
                      {acc}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {changedPitchClass && (
              <div className="circle-diff-banner">
                1-Note Diff ({changedPitchClass.direction === 'cw' ? '5ths CW' : '4ths CCW'}):{' '}
                <strong>
                  {formatPitchClass(changedPitchClass.pitchClass, effectiveAccidentals)}
                </strong>{' '}
                changed from the previous key.
              </div>
            )}

            <div className="circle-wedge-grid">
              {wedge.map((chord) => {
                const chordName = `${formatPitchClass(chord.rootPc, effectiveAccidentals)}${
                  chord.quality === 'minor' ? 'm' : chord.quality === 'dim' ? '°' : ''
                }`;
                const isSelected =
                  activeWedgeRoman === chord.roman && syncMode === 'chord';
                return (
                  <button
                    key={chord.roman}
                    type="button"
                    className={`circle-wedge-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectWedgeChord(chord)}
                  >
                    <span className="wedge-roman">{chord.roman}</span>
                    <strong className="wedge-name">{chordName}</strong>
                  </button>
                );
              })}
            </div>

            <div className="circle-prog-bar">
              <div className="toolbar-pills" style={{ flexWrap: 'wrap', gap: '0.4rem' }}>
                {WEDGE_PROGRESSIONS.map((prog) => (
                  <button
                    key={prog.id}
                    type="button"
                    className={`pill-btn ${activeProgId === prog.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveProgId(prog.id);
                      setIsPlayingProg(false);
                      triggerProgressionStep(prog, 0);
                    }}
                  >
                    {prog.label}
                  </button>
                ))}
                <button
                  type="button"
                  className={`pill-btn ${isPlayingProg ? 'active' : ''}`}
                  onClick={() => {
                    if (isPlayingProg) {
                      setIsPlayingProg(false);
                    } else {
                      triggerProgressionStep(activeProg, 0);
                      setIsPlayingProg(true);
                    }
                  }}
                >
                  {isPlayingProg ? 'Stop' : 'Play Prog'}
                </button>
              </div>
              <div className="circle-prog-steps">
                {activeProg.romans.map((roman, idx) => {
                  const chord = wedge.find((w) => w.roman === roman);
                  const chordName = chord
                    ? `${formatPitchClass(chord.rootPc, effectiveAccidentals)}${
                        chord.quality === 'minor' ? 'm' : chord.quality === 'dim' ? '°' : ''
                      }`
                    : roman;
                  const isStepActive =
                    activeWedgeRoman === roman &&
                    syncMode === 'chord' &&
                    progStepIndex === idx;
                  return (
                    <button
                      key={`${roman}-${idx}`}
                      type="button"
                      className={`circle-prog-step ${isStepActive ? 'active' : ''}`}
                      onClick={() => {
                        setIsPlayingProg(false);
                        triggerProgressionStep(activeProg, idx);
                      }}
                    >
                      <span>{roman}</span> · <strong>{chordName}</strong>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="circle-info-card">
            <div className="circle-info-header">
              <h3>Fretboard Link</h3>
              {selectedFrets.size > 0 && (
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => setSelectedFrets(new Set())}
                >
                  Clear Board ({selectedFrets.size})
                </button>
              )}
            </div>

            <div className="toolbar-pills" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                type="button"
                className={`pill-btn ${syncMode === 'scale' ? 'active' : ''}`}
                onClick={() => setSyncMode('scale')}
              >
                Key Scale (7)
              </button>
              <button
                type="button"
                className={`pill-btn ${syncMode === 'pentatonic' ? 'active' : ''}`}
                onClick={() => setSyncMode('pentatonic')}
              >
                Pentatonic (5)
              </button>
              <button
                type="button"
                className={`pill-btn ${syncMode === 'chord' ? 'active' : ''}`}
                onClick={() => setSyncMode('chord')}
              >
                Key Chord ({activeChord.roman})
              </button>
              <button
                type="button"
                className={`pill-btn ${syncMode === 'fifths' ? 'active' : ''}`}
                onClick={() => setSyncMode('fifths')}
              >
                5th / 4th Shape
              </button>

              <select
                className="pill-btn"
                aria-label="Fret window filter"
                value={fretWindowId}
                onChange={(e) => setFretWindowId(e.target.value)}
              >
                {FRET_WINDOWS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="circle-sync-hint">
              Tip: Click any frets on the board below to highlight those pitch classes on the
              Circle above and see your diatonic (7-slice) or pentatonic (5-slice) cluster.
            </p>
          </div>
        </div>
      </div>

      <div className="circle-fretboard-wrap">
        <Fretboard
          strings={strings}
          maxFret={maxFret}
          accidentals={effectiveAccidentals}
          showAllNotes={false}
          showAccidentals={true}
          connectSameNotes={false}
          selectedFrets={selectedFrets}
          onToggleFret={handleToggleFret}
          getMarker={getMarker}
        />
      </div>
    </section>
  );
};
