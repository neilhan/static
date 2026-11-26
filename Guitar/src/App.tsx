import { useMemo, useState } from "react";
import "./App.css";
import homeIcon from "@static/shared/assets/home.svg?raw";
import { IconGraphic } from "@static/shared";
import { Fretboard, makeFretKey, PatternFilter } from "./components/Fretboard";
import { RandomNoteBox } from "./components/RandomNoteBox";
import { RepeatingTilesBoard } from "./components/RepeatingTilesBoard";
import { ChordStudyBoard } from "./components/ChordStudyBoard";
import { PentatonicBoard } from "./components/PentatonicBoard";
import { ScaleStudyBoard } from "./components/ScaleStudyBoard";
import { CircleOfFifthsBoard } from "./components/CircleOfFifthsBoard";
import {
  isSoundEnabled,
  playChordNotes,
  setSoundEnabled,
} from "./utils/guitarAudio";
import {
  AccidentalMode,
  DIATONIC_SCALE_DEFINITIONS,
  DIATONIC_SCALE_ORDER,
  DiatonicMode,
  formatPitchClass,
  getDiatonicScaleBoxes,
  getFretPitchClass,
  scaleBoxesToOverlayBlocks,
  ScaleLayoutMode,
  TileFilter,
  TUNING_PRESETS,
} from "./utils/musicTheory";

const FRET_COUNTS = [12, 15, 22];

type AccidentalDisplay = "off" | "sharp" | "flat";
type StudyTab = "fretboard" | "scales" | "triads" | "shells" | "pentatonic" | "circle";

const STUDY_TABS: Array<{ id: StudyTab; label: string }> = [
  { id: "fretboard", label: "Fretboard & Tiles" },
  { id: "scales", label: "Scales & Modes" },
  { id: "triads", label: "Triads" },
  { id: "shells", label: "7th Shell Chords" },
  { id: "pentatonic", label: "Pentatonic Scales" },
  { id: "circle", label: "Circle of 5ths" },
];

function App() {
  const [activeTab, setActiveTab] = useState<StudyTab>("fretboard");
  const [tuningId, setTuningId] = useState<string>(TUNING_PRESETS[0].id);
  const [maxFret, setMaxFret] = useState<number>(15);
  const [accidentalDisplay, setAccidentalDisplay] = useState<AccidentalDisplay>("off");
  const [showAllNotes, setShowAllNotes] = useState<boolean>(true);
  const [connectSameNotes, setConnectSameNotes] = useState<boolean>(true);
  const [activePatternSet, setActivePatternSet] = useState<PatternFilter>("all");
  const [tileFilter, setTileFilter] = useState<TileFilter>("gab-cde");
  const [lastTileFilter, setLastTileFilter] = useState<Exclude<TileFilter, "none">>("gab-cde");
  const [selectedFrets, setSelectedFrets] = useState<Set<string>>(() => new Set());
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [showScaleBlocks, setShowScaleBlocks] = useState<boolean>(false);
  const [scaleRootPc, setScaleRootPc] = useState<number>(0);
  const [scaleMode, setScaleMode] = useState<DiatonicMode>("ionian");
  const [scaleLayout, setScaleLayout] = useState<ScaleLayoutMode>("caged");
  const [scalePos, setScalePos] = useState<number | "all">("all");

  const handleToggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev;
      setSoundEnabled(next);
      return next;
    });
  };

  const handleSelectTile = (next: TileFilter) => {
    setTileFilter(next);
    if (next !== "none") {
      setLastTileFilter(next);
    }
  };

  const handleToggleTiles = () => {
    setTileFilter((prev) => (prev === "none" ? lastTileFilter : "none"));
  };

  const accidentals: AccidentalMode =
    accidentalDisplay === "flat" ? "flat" : "sharp";
  const showAccidentals = accidentalDisplay !== "off";

  const cycleAccidentalDisplay = () => {
    setAccidentalDisplay((prev) => {
      const next = prev === "off" ? "sharp" : prev === "sharp" ? "flat" : "off";
      if (next !== "off" && !showAllNotes) {
        setShowAllNotes(true);
      }
      return next;
    });
  };

  const activeTuning = useMemo(
    () => TUNING_PRESETS.find((t) => t.id === tuningId) ?? TUNING_PRESETS[0],
    [tuningId]
  );

  const fretboardScaleOverlayBlocks = useMemo(() => {
    if (!showScaleBlocks) return [];
    const allBoxes = getDiatonicScaleBoxes(
      activeTuning.strings,
      maxFret,
      scaleRootPc,
      scaleMode,
      scaleLayout
    );
    const maxPos = scaleLayout === "3nps" ? 7 : 5;
    const pos = scalePos !== "all" && scalePos <= maxPos ? scalePos : "all";
    const filtered =
      pos === "all" ? allBoxes : allBoxes.filter((b) => b.positionNumber === pos);
    return scaleBoxesToOverlayBlocks(filtered);
  }, [showScaleBlocks, activeTuning.strings, maxFret, scaleRootPc, scaleMode, scaleLayout, scalePos]);

  const handleToggleFret = (stringIndex: number, fret: number) => {
    const key = makeFretKey(stringIndex, fret);
    setSelectedFrets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectedNotesList = useMemo(() => {
    const items: Array<{ key: string; stringNum: number; fret: number; note: string }> = [];
    selectedFrets.forEach((key) => {
      const [sStr, fStr] = key.split(":");
      const stringIndex = Number(sStr);
      const fret = Number(fStr);
      const openPc = activeTuning.strings[stringIndex];
      if (openPc === undefined) return;
      const pc = getFretPitchClass(openPc, fret);
      items.push({
        key,
        stringNum: stringIndex + 1,
        fret,
        note: formatPitchClass(pc, accidentals),
      });
    });
    return items.sort((a, b) => a.stringNum - b.stringNum || a.fret - b.fret);
  }, [selectedFrets, activeTuning, accidentals]);

  const handleSelectPatternSet = (pattern: PatternFilter) => {
    setActivePatternSet(pattern);
    if (pattern !== "all") {
      setConnectSameNotes(true);
      if (selectedFrets.size === 0) {
        // Auto-select S6 F8 (C) so the pattern immediately lights up on the board
        setSelectedFrets(new Set([makeFretKey(5, 8)]));
      }
    }
  };

  const activePitchClass = useMemo(() => {
    const firstKey = selectedFrets.values().next().value;
    if (!firstKey) return null;
    const [sStr, fStr] = firstKey.split(":");
    const openPc = activeTuning.strings[Number(sStr)];
    return openPc === undefined ? null : getFretPitchClass(openPc, Number(fStr));
  }, [selectedFrets, activeTuning]);

  return (
    <div className="app-shell">
      <div className="app-shell__content">
        <header className="header-row">
          <div className="header-title-group">
            <a
              href="https://neilhan.github.io/static"
              className="home-link"
              title="Back to Home"
            >
              <IconGraphic
                svgMarkup={homeIcon}
                size="md"
                style={{ width: 24, height: 24 }}
              />
            </a>
            <span className="breadcrumb-separator">/</span>
            <img
              src={`${import.meta.env.BASE_URL ?? "./"}guitar.svg`}
              alt="Guitar icon"
              width="32"
              height="32"
              className="header-app-icon"
            />
            <h1>Guitar Fretboard Lookup</h1>
          </div>
        </header>

        <div className="study-tabs-bar">
          <div className="study-tabs" role="tablist" aria-label="Study sections">
            {STUDY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`study-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="study-global-controls">
            <label className="toolbar-field">
              <span>Tuning</span>
              <select
                value={tuningId}
                onChange={(e) => setTuningId(e.target.value)}
              >
                {TUNING_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="toolbar-field">
              <span>Frets</span>
              <select
                value={maxFret}
                onChange={(e) => setMaxFret(Number(e.target.value))}
              >
                {FRET_COUNTS.map((count) => (
                  <option key={count} value={count}>
                    0–{count}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className={`pill-btn ${soundOn ? "active" : ""}`}
              onClick={handleToggleSound}
              title="Toggle guitar audio playback across all sections"
            >
              {soundOn ? "Sound: On" : "Sound: Off"}
            </button>
          </div>
        </div>

        {activeTab === "fretboard" && (
          <>
            <main className="panel guitar-main">
              <div className="fretboard-toolbar">
                <div className="toolbar-pills">
              <button
                type="button"
                className={`pill-btn ${showAllNotes ? "active" : ""}`}
                onClick={() => setShowAllNotes((v) => !v)}
              >
                {showAllNotes ? "All Notes: On" : "All Notes: Off"}
              </button>
              <button
                type="button"
                className={`pill-btn ${showAccidentals ? "active" : ""}`}
                onClick={cycleAccidentalDisplay}
                title="Cycle between hiding sharps/flats, showing Sharps (#), and showing Flats (b)"
              >
                {accidentalDisplay === "off"
                  ? "Sharps/Flats: Off"
                  : accidentalDisplay === "sharp"
                  ? "Sharps (#): On"
                  : "Flats (b): On"}
              </button>
              <button
                type="button"
                className={`pill-btn ${connectSameNotes ? "active" : ""}`}
                onClick={() => setConnectSameNotes((v) => !v)}
                title="Draw lines connecting all matching occurrences of selected notes"
              >
                {connectSameNotes ? "Connect Same Notes: On" : "Connect Same Notes: Off"}
              </button>
              <button
                type="button"
                className={`pill-btn ${tileFilter !== "none" ? "active" : ""}`}
                onClick={handleToggleTiles}
                title="Toggle repeating 2-string color block tiles on the fretboard"
              >
                {tileFilter !== "none" ? "Tiles: On" : "Tiles: Off"}
              </button>
              <button
                type="button"
                className={`pill-btn ${showScaleBlocks ? "active" : ""}`}
                onClick={() => setShowScaleBlocks((v) => !v)}
                title="Overlay 3NPS or CAGED scale blocks on the fretboard"
              >
                {showScaleBlocks
                  ? `Scale Blocks: ${formatPitchClass(scaleRootPc, accidentals)} ${DIATONIC_SCALE_DEFINITIONS[scaleMode].shortLabel}`
                  : "Scale Blocks: Off"}
              </button>
              {selectedFrets.size > 0 && (
                <>
                  <button
                    type="button"
                    className="pill-btn active"
                    onClick={() => {
                      const notes = Array.from(selectedFrets)
                        .map((key) => {
                          const [sStr, fStr] = key.split(":");
                          const stringIndex = Number(sStr);
                          const fret = Number(fStr);
                          const openPc = activeTuning.strings[stringIndex];
                          return openPc === undefined
                            ? null
                            : { openPc, stringIndex, fret };
                        })
                        .filter(
                          (n): n is { openPc: number; stringIndex: number; fret: number } =>
                            n !== null
                        );
                      playChordNotes(notes, 0.08);
                    }}
                  >
                    Play Selected
                  </button>
                  <button
                    type="button"
                    className="pill-btn"
                    onClick={() => setSelectedFrets(new Set())}
                  >
                    Clear ({selectedFrets.size})
                  </button>
                </>
              )}
            </div>
          </div>

          {showScaleBlocks && (
            <div
              className="fretboard-toolbar"
              style={{ marginTop: "0.5rem", gap: "0.5rem", flexWrap: "wrap" }}
              aria-label="Scale block overlay options"
            >
              <div className="toolbar-pills" style={{ flexWrap: "wrap" }}>
                <select
                  className="pill-btn"
                  aria-label="Scale root"
                  value={scaleRootPc}
                  onChange={(e) => setScaleRootPc(Number(e.target.value))}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((pc) => (
                    <option key={pc} value={pc}>
                      Root: {formatPitchClass(pc, accidentals)}
                    </option>
                  ))}
                </select>
                <select
                  className="pill-btn"
                  aria-label="Scale mode"
                  value={scaleMode}
                  onChange={(e) => setScaleMode(e.target.value as DiatonicMode)}
                >
                  {DIATONIC_SCALE_ORDER.map((m) => (
                    <option key={m} value={m}>
                      {DIATONIC_SCALE_DEFINITIONS[m].label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={`pill-btn ${scaleLayout === "caged" ? "active" : ""}`}
                  onClick={() => setScaleLayout("caged")}
                >
                  CAGED (5)
                </button>
                <button
                  type="button"
                  className={`pill-btn ${scaleLayout === "3nps" ? "active" : ""}`}
                  onClick={() => setScaleLayout("3nps")}
                >
                  3NPS (7)
                </button>
                <select
                  className="pill-btn"
                  aria-label="Scale position"
                  value={scalePos}
                  onChange={(e) =>
                    setScalePos(e.target.value === "all" ? "all" : Number(e.target.value))
                  }
                >
                  <option value="all">All Positions</option>
                  {Array.from(
                    { length: scaleLayout === "3nps" ? 7 : 5 },
                    (_, i) => i + 1
                  ).map((pos) => (
                    <option key={pos} value={pos}>
                      Pos {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Fretboard
            strings={activeTuning.strings}
            maxFret={maxFret}
            accidentals={accidentals}
            showAllNotes={showAllNotes}
            showAccidentals={showAccidentals}
            connectSameNotes={connectSameNotes}
            patternFilter={activePatternSet}
            tileFilter={tileFilter}
            selectedFrets={selectedFrets}
            onToggleFret={handleToggleFret}
            overlayBlocks={fretboardScaleOverlayBlocks}
          />

          <div className="selected-readout">
            {selectedNotesList.length === 0 ? (
              <span className="readout-hint">
                Tap any fret on the board to highlight and inspect its note.
              </span>
            ) : (
              <div className="readout-chips">
                <span className="readout-title">Selected:</span>
                {selectedNotesList.map((item) => (
                  <span key={item.key} className="readout-chip">
                    <strong>{item.note}</strong> (S{item.stringNum} · F{item.fret})
                  </span>
                ))}
              </div>
            )}
              </div>
            </main>

            <div style={{ marginTop: "1rem" }}>
              <RandomNoteBox />
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <RepeatingTilesBoard
                accidentals={accidentals}
                selectedPitchClasses={activePitchClass !== null ? [activePitchClass] : []}
                activeSet={activePatternSet}
                onSelectSet={handleSelectPatternSet}
                tileFilter={tileFilter}
                onSelectTile={handleSelectTile}
              />
            </div>
          </>
        )}

        {activeTab === "triads" && (
          <ChordStudyBoard
            mode="triad"
            strings={activeTuning.strings}
            maxFret={maxFret}
            accidentals={accidentals}
          />
        )}

        {activeTab === "shells" && (
          <ChordStudyBoard
            mode="shell"
            strings={activeTuning.strings}
            maxFret={maxFret}
            accidentals={accidentals}
          />
        )}

        {activeTab === "pentatonic" && (
          <PentatonicBoard
            strings={activeTuning.strings}
            maxFret={maxFret}
            accidentals={accidentals}
          />
        )}

        {activeTab === "scales" && (
          <ScaleStudyBoard
            strings={activeTuning.strings}
            maxFret={maxFret}
            accidentals={accidentals}
          />
        )}

        {activeTab === "circle" && (
          <CircleOfFifthsBoard
            strings={activeTuning.strings}
            maxFret={maxFret}
          />
        )}
      </div>
    </div>
  );
}

export default App;
