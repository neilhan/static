import { useMemo, useState } from "react";
import "./App.css";
import homeIcon from "@static/shared/assets/home.svg?raw";
import { IconGraphic } from "@static/shared";
import { Fretboard, makeFretKey, PatternFilter } from "./components/Fretboard";
import { RepeatingTilesBoard } from "./components/RepeatingTilesBoard";
import { TriadsBoard } from "./components/TriadsBoard";
import { SeventhChordsBoard } from "./components/SeventhChordsBoard";
import {
  AccidentalMode,
  formatPitchClass,
  getFretPitchClass,
  TileFilter,
  TUNING_PRESETS,
} from "./utils/musicTheory";

const FRET_COUNTS = [12, 15, 22];

type AccidentalDisplay = "off" | "sharp" | "flat";

function App() {
  const [tuningId, setTuningId] = useState<string>(TUNING_PRESETS[0].id);
  const [maxFret, setMaxFret] = useState<number>(15);
  const [accidentalDisplay, setAccidentalDisplay] = useState<AccidentalDisplay>("off");
  const [showAllNotes, setShowAllNotes] = useState<boolean>(true);
  const [connectSameNotes, setConnectSameNotes] = useState<boolean>(true);
  const [activePatternSet, setActivePatternSet] = useState<PatternFilter>("all");
  const [tileFilter, setTileFilter] = useState<TileFilter>("gab-cde");
  const [lastTileFilter, setLastTileFilter] = useState<Exclude<TileFilter, "none">>("gab-cde");
  const [selectedFrets, setSelectedFrets] = useState<Set<string>>(() => new Set());

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
            <h1>Guitar Fretboard Lookup</h1>
          </div>
        </header>

        <main className="panel guitar-main">
          <div className="fretboard-toolbar">
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
              {selectedFrets.size > 0 && (
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => setSelectedFrets(new Set())}
                >
                  Clear ({selectedFrets.size})
                </button>
              )}
            </div>
          </div>

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

        <div style={{ marginTop: "1.5rem" }}>
          <TriadsBoard
            strings={activeTuning.strings}
            maxFret={maxFret}
            accidentals={accidentals}
          />
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <SeventhChordsBoard
            strings={activeTuning.strings}
            maxFret={maxFret}
            accidentals={accidentals}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
