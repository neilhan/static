# Guitar Fretboard Lookup — Project Knowledge

## Overview
**Guitar** is a 100% client-side interactive fretboard study app (Vite + React + TypeScript) designed to make note relationships, octave shapes, repeating 2-string tiles, 3-string chords, and pentatonic patterns immediately readable through color coding, stepped overlays, and synthesized guitar audio.

---

## Architecture & Key Files
- `src/App.tsx` — Top-level controls (Tuning presets, Fret range `0–12 / 0–15 / 0–22`, All Notes, Sharps/Flats toggle, Connect Same Notes, Repeating Tiles toggle, Scale Blocks overlay toggle, global Sound On/Off, Play Selected) and 6-tab study layout (`Fretboard & Tiles`, `Scales & Modes`, `Triads`, `7th Shell Chords`, `Pentatonic Scales`, `Circle of 5ths`).
- `src/utils/musicTheory.ts` & `src/utils/theory/` — Core music theory engine split into focused modules (`notes.ts` for pitch-class math, `#`/`b` formatting, and tuning presets; `tiles.ts` for repeating 2-string tile blocks; `chords.ts` for 3-string triad & shell chord voicing finders; `scales.ts` for pentatonic degrees, 5 box positions, 2-string octave shift tiles, and diatonic modes 3NPS & CAGED scale boxes; `circleOfFifths.ts` for `CIRCLE_OF_FIFTHS`, `getKeyWedge`, `getChangedPitchClass`, and `getKeySignatureAccidentals`), with `musicTheory.ts` re-exporting all modules as a barrel.
- `src/utils/guitarAudio.ts` — Zero-asset Web Audio API plucked-guitar synthesizer (`getFretMidi`, `midiToFreq`, `playMidiNote`, `playFretNote`, `playChordNotes`, `playArpeggioThenChord`, `playSequence`) with global `isSoundEnabled` / `setSoundEnabled`.
- `src/components/Fretboard.tsx` & `Fretboard.css` — Shared 6-string fretboard renderer: nut, inlay dots, note badges, octave/unison SVG connection lines, triad/shell polygon overlays, rectangular & multi-row stepped SVG tile/box overlays, and fret-click audio playback.
- `src/components/MiniFretboard.tsx`, `src/components/PitchClassSelector.tsx`, & `src/components/SectionHeader.tsx` — Shared mini diagram card, 12-note root pitch-class pill selector, and section header primitives reused across study boards.
- `src/components/RepeatingTilesBoard.tsx` — Repeating 2-string natural-note tiles (`G A B / C D E`, `C D E / F G A`, `E F G / A B C`) and octave connection filters (`All`, `2-String Octaves`, `3-String Crossings`, `Unison Shifts`).
- `src/components/ChordStudyBoard.tsx` — Reusable 3-string chord study board powering both **Triads** (`mode="triad"`) and **7th Shell Chords** (`mode="shell"`).
- `src/components/PentatonicBoard.tsx` — Pentatonic scales study board (**5 Boxes View** + **2-String Octave Shifts**).
- `src/components/ScaleStudyBoard.tsx` — Diatonic scales & modes study board (7 modes, **CAGED (5)** & **3NPS (7)** box layouts, characteristic tone highlighting, and **Note Names / Intervals** labels).
- `src/components/CircleOfFifths.tsx` & `src/components/CircleOfFifthsBoard.tsx` — Interactive 2-ring Circle of Fifths SVG wheel, diatonic key wedge (`IV – I – V` / `ii – vi – iii`), CW/CCW stepper, audio playback, and two-way Fretboard synchronization.

---

## Study Sections & Behavior (Implemented)

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

### 4. Scales & Modes (`ScaleStudyBoard`)
- Supports all 7 diatonic modes (`Ionian` through `Locrian`) with **CAGED (5)** and **3NPS (7)** position layouts, characteristic tone highlighting, **Note Names / Intervals** labels, and optional **Scale Blocks** overlay on the main Fretboard tab.

### 5. Circle of Fifths (`CircleOfFifthsBoard` + `CircleOfFifths`)
- **Placement:** Dedicated `"Circle of 5ths"` tab in `STUDY_TABS` (`src/App.tsx`).
- **Core Circle & Audio:**
  - Clickable 2-ring SVG wheel (Outer = Major keys + key signature counts, Inner = Relative Minor keys).
  - Outer **7-Note Diatonic Arc** and **5-Note Pentatonic Arc** overlays highlighting contiguous diatonic and pentatonic slices on the Circle.
  - Auto `#` / `b` accidental spelling based on the selected key's side of the circle (with manual spelling toggle) plus an ordered **Key Signature Accidentals** strip (`F♯, C♯, …` / `B♭, E♭, …`).
  - `IV – I – V` (outer) / `ii – vi – iii` (inner) diatonic key wedge highlight with clickable chord buttons (`I, ii, iii, IV, V, vi, vii°`) and **Quick Progression Step-Through** (`ii – V – I`, `I – IV – V`, `I – V – vi – IV`, `vi – IV – I – V`) with `Play Prog`.
  - `◀ 4ths (CCW)` / `5ths (CW) ▶` stepper controls and Left/Right arrow-key navigation.
  - Chord/key audio playback via `guitarAudio.ts` (`playChordNotes`), respecting global `Sound: On/Off`.
- **Circle ↔ Fretboard Links:**
  - Display mode toggle on the synchronized `Fretboard`: **Key Scale (7)**, **Pentatonic (5)**, **Key Chord** (triad tones for the clicked wedge chord), and **5th / 4th Shape** (Root + 5th/4th pairs across strings).
  - Fret-window / position filter (*All Frets*, *0–4*, *3–7*, *5–8*, *7–10*, *9–12*) for single-position voice-leading practice (`ii → V → I`).
  - **1-Note Diff** highlight showing the single note that changes when stepping CW/CCW.
  - **Two-way Fretboard → Circle sync:** clicking frets on the board highlights those pitch classes on the Circle to show contiguous diatonic (7-slice) and pentatonic (5-slice) clusters.

---

## Verification
- **Unit Tests (`vitest`):** `npm --prefix Guitar test` (`vitest run`) runs `src/utils/musicTheory.test.ts`, covering pitch formatting, fret note math, repeating 2-string tiles (including stepped S3–S2 bounds), triad & shell voicings, pentatonic boxes & 2-string shifts, diatonic scale degrees & 3NPS/CAGED boxes, Circle of Fifths positions/wedges/1-note diffs/key signatures, and `guitarAudio` MIDI/frequency calculation.
- **Build Check:** `tsc && vite build` (`pnpm --filter guitar build` / `npm --prefix Guitar run build`).
