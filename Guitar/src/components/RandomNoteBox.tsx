import { useCallback, useEffect, useState } from "react";
import {
  AccidentalMode,
  formatPitchClass,
  NATURAL_PITCH_CLASSES,
  PITCH_CLASS_COLORS,
} from "../utils/musicTheory";

export type AdvanceIntervalOption = "manual" | 1000 | 2000 | 5000;

const ADVANCE_OPTIONS: Array<{ value: AdvanceIntervalOption; label: string }> = [
  { value: "manual", label: "Manual" },
  { value: 1000, label: "1s" },
  { value: 2000, label: "2s" },
  { value: 5000, label: "5s" },
];

const ACCIDENTAL_PITCH_CLASSES = [1, 3, 6, 8, 10];
const NATURAL_LIST = Array.from(NATURAL_PITCH_CLASSES);

interface RandomNoteState {
  pitchClass: number;
  accidental: AccidentalMode;
}

export function buildNotePool(
  includeSharps: boolean,
  includeFlats: boolean
): RandomNoteState[] {
  const pool: RandomNoteState[] = NATURAL_LIST.map((pitchClass) => ({
    pitchClass,
    accidental: "sharp",
  }));

  if (includeSharps) {
    for (const pitchClass of ACCIDENTAL_PITCH_CLASSES) {
      pool.push({ pitchClass, accidental: "sharp" });
    }
  }
  if (includeFlats) {
    for (const pitchClass of ACCIDENTAL_PITCH_CLASSES) {
      pool.push({ pitchClass, accidental: "flat" });
    }
  }

  return pool;
}

export function pickRandomNote(
  includeSharps: boolean,
  includeFlats: boolean,
  excludeLabel?: string
): RandomNoteState {
  const pool = buildNotePool(includeSharps, includeFlats);
  const filtered = excludeLabel
    ? pool.filter(
        (item) => formatPitchClass(item.pitchClass, item.accidental) !== excludeLabel
      )
    : pool;
  const candidates = filtered.length > 0 ? filtered : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function RandomNoteBox() {
  const [includeSharps, setIncludeSharps] = useState<boolean>(true);
  const [includeFlats, setIncludeFlats] = useState<boolean>(false);
  const [note, setNote] = useState<RandomNoteState>(() =>
    pickRandomNote(true, false)
  );
  const [advanceInterval, setAdvanceInterval] =
    useState<AdvanceIntervalOption>("manual");
  const [tick, setTick] = useState<number>(0);

  const handleNext = useCallback(() => {
    setNote((prev) =>
      pickRandomNote(
        includeSharps,
        includeFlats,
        formatPitchClass(prev.pitchClass, prev.accidental)
      )
    );
    setTick((t) => t + 1);
  }, [includeSharps, includeFlats]);

  const handleToggleSharps = () => {
    const nextSharps = !includeSharps;
    setIncludeSharps(nextSharps);
    setNote((prev) => {
      const isNatural = NATURAL_PITCH_CLASSES.has(prev.pitchClass);
      if (!isNatural && !nextSharps && prev.accidental === "sharp") {
        return pickRandomNote(nextSharps, includeFlats);
      }
      return prev;
    });
  };

  const handleToggleFlats = () => {
    const nextFlats = !includeFlats;
    setIncludeFlats(nextFlats);
    setNote((prev) => {
      const isNatural = NATURAL_PITCH_CLASSES.has(prev.pitchClass);
      if (!isNatural && !nextFlats && prev.accidental === "flat") {
        return pickRandomNote(includeSharps, nextFlats);
      }
      return prev;
    });
  };

  useEffect(() => {
    if (advanceInterval === "manual") return;
    const id = window.setInterval(() => {
      setNote((prev) =>
        pickRandomNote(
          includeSharps,
          includeFlats,
          formatPitchClass(prev.pitchClass, prev.accidental)
        )
      );
    }, advanceInterval);
    return () => window.clearInterval(id);
  }, [advanceInterval, includeSharps, includeFlats, tick]);

  const noteLabel = formatPitchClass(note.pitchClass, note.accidental);
  const noteColor = PITCH_CLASS_COLORS[note.pitchClass];

  return (
    <div className="random-note-bar" aria-label="Random note generator">
      <div
        className="random-note-box"
        style={{ borderColor: noteColor }}
        aria-live="polite"
        aria-label={`Random note: ${noteLabel}`}
      >
        <span className="random-note-value" style={{ color: noteColor }}>
          {noteLabel}
        </span>
      </div>

      <div className="random-note-controls">
        <div className="toolbar-pills" role="group" aria-label="Included accidentals">
          <button
            type="button"
            className={`pill-btn ${includeSharps ? "active" : ""}`}
            onClick={handleToggleSharps}
            aria-pressed={includeSharps}
          >
            Sharps (#)
          </button>
          <button
            type="button"
            className={`pill-btn ${includeFlats ? "active" : ""}`}
            onClick={handleToggleFlats}
            aria-pressed={includeFlats}
          >
            Flats (b)
          </button>
        </div>

        <div className="toolbar-pills" role="group" aria-label="Auto advance interval">
          {ADVANCE_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              className={`pill-btn ${advanceInterval === opt.value ? "active" : ""}`}
              onClick={() => setAdvanceInterval(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="pill-btn random-note-next-btn"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
