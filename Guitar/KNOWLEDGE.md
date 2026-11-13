# Guitar Fretboard Lookup — Project Knowledge

## Overview
**Guitar** is a 100% client-side interactive fretboard study app (Vite + React + TypeScript) designed to make note relationships, octave shapes, repeating 2-string tiles, 3-string chords, and pentatonic patterns immediately readable through color coding, stepped overlays, and synthesized guitar audio.

---

## Architecture & Key Files
- `src/App.tsx` — Top-level controls (Tuning presets, Fret range `0–12 / 0–15 / 0–22`, All Notes, Sharps/Flats toggle, Connect Same Notes, Repeating Tiles toggle, global Sound On/Off, Play Selected) and section layout.
- `src/utils/musicTheory.ts` — Core music theory engine: pitch-class math, `#`/`b` formatting, tuning presets, repeating 2-string tile blocks, 3-string triad & shell chord voicing finders, pentatonic degrees, 5 box positions, and 2-string octave shift tiles.
- `src/utils/guitarAudio.ts` — Zero-asset Web Audio API plucked-guitar synthesizer (`getFretMidi`, `midiToFreq`, `playMidiNote`, `playFretNote`, `playChordNotes`, `playArpeggioThenChord`, `playSequence`) with global `isSoundEnabled` / `setSoundEnabled`.
- `src/components/Fretboard.tsx` & `Fretboard.css` — Shared 6-string fretboard renderer: nut, inlay dots, note badges, octave/unison SVG connection lines, triad/shell polygon overlays, rectangular & multi-row stepped SVG tile/box overlays, and fret-click audio playback.
- `src/components/MiniFretboard.tsx` & `src/components/SectionHeader.tsx` — Shared mini diagram card and section header primitives reused across study boards.
- `src/components/RepeatingTilesBoard.tsx` — Repeating 2-string natural-note tiles (`G A B / C D E`, `C D E / F G A`, `E F G / A B C`) and octave connection filters (`All`, `2-String Octaves`, `3-String Crossings`, `Unison Shifts`).
- `src/components/ChordStudyBoard.tsx` — Reusable 3-string chord study board powering both **Triads** (`mode="triad"`) and **7th Shell Chords** (`mode="shell"`).
- `src/components/PentatonicBoard.tsx` — Pentatonic scales study board (**5 Boxes View** + **2-String Octave Shifts**).

---

## Study Sections & Behavior

### 1. Main Fretboard & Repeating 2-String Tiles
- **Tunings:** Standard (`E A D G B E`), Drop D, Half-Step Down (`Eb`), Open G, DADGAD.
- **Tiles:** Natural notes repeat in three 2-string tiles (`G A B / C D E`, `C D E / F G A`, `E F G / A B C`), including cut-off S6/S1 edge tiles and stepped `+1` fret S3–S2 B-string shift polygons so adjacent tiles do not overlap.
- **Audio:** Clicking any fret plays its exact pitch; each tile card has a **Play** button for its 6-note ascending pattern; **Play Selected** arpeggiates selected frets.

### 2. Triads & 7th Shell Chords (`ChordStudyBoard`)
- **Triads (`mode="triad"`):** `Major`, `Minor`, `Diminished`, `Augmented` plus quick progressions (`I–IV–V`, `I–V–vi–IV`, `ii–V–I`, `i–iv–v`).
- **Shell Chords (`mode="shell"`):** Drops the 5th and keeps `R – 3 – 7` (`Maj7`, `Dom7`, `Min7`, `m7b5`, `Dim7`), with an optional **Root in Bass Only** toggle and jazz progressions.
- **Audio:** Clicking a voicing card strums the chord; clicking any shown chord note on the fretboard plays a **low-to-high arpeggio followed by the chord strum** of that voicing.

### 3. Pentatonic Scales (`PentatonicBoard`)
- Defaults to **C Major Pentatonic** with relative Major/Minor pairing, optional **Blues note** (`b5` / `b3`), and **Note Names / Intervals** labels.
- **5 Boxes View:** Renders per-string stepped SVG outlines fitting 4-fret wide strings and 3-fret narrow strings across Patterns 1–5.
- **2-String Octave Shifts:** Shows stepped L-shaped `2+3` and `3+2` tiles across all adjacent 2-string pairs plus S6/S1 cut-off edge tiles (or isolated `even` / `odd` octave-shift chains). Clicking any note inside a shift tile plays that tile's notes low-to-high.

---

## Verification
- **Unit Tests (`vitest`):** `src/utils/musicTheory.test.ts` covers pitch formatting, fret note math, repeating 2-string tiles (including stepped S3–S2 bounds), triad & shell voicings, pentatonic boxes & 2-string shifts, and `guitarAudio` MIDI/frequency calculation.
- **Build Check:** `tsc && vite build` (`pnpm --filter guitar build` / `npm --prefix Guitar run build`).
