# Guitar Fretboard Lookup — Plan

## Goal
Build **Guitar**, a 100% client-side interactive fretboard lookup tool (desktop & mobile) that lets guitarists quickly find notes, scales, chords, and intervals across the neck using distinct **colors** and **borders** to make relationships immediately readable.

---

## 1. Lookup Modes

1. **Note Lookup**
   - Pick one or more pitch classes (`C`, `C#/Db`, `D`, ..., `B`) to highlight every occurrence across all 6 strings and frets.
   - Great for memorizing the fretboard and seeing octave shapes.

2. **Scale / Mode Lookup**
   - Choose a **Root** + **Scale** (`Major`, `Natural Minor`, `Major Pentatonic`, `Minor Pentatonic`, `Blues`, `Dorian`, `Mixolydian`, `Harmonic Minor`).
   - Optionally **overlay a Chord** (e.g. `Am7` over `A Minor Pentatonic` or `C Major`) so chord tones stand out from passing scale tones.

3. **Chord & Arpeggio Lookup**
   - Choose a **Root** + **Quality** (`Major`, `Minor`, `5 (Power)`, `7`, `Maj7`, `m7`, `sus2`, `sus4`, `dim`, `aug`, `add9`).
   - Show all chord tones across the neck, plus optional **Fret Window / CAGED Position** focus (`Open (0–4)`, `Pos 1 (0–5)`, `Pos 2 (4–9)`, `Pos 3 (7–12)`, `All Frets`).

4. **Reverse Fretboard Lookup (Tap-to-Identify)**
   - Click/tap frets directly on the fretboard to select notes (up to one note per string or free selection).
   - Live readout shows the selected **Notes**, **Intervals** (relative to the lowest note or chosen root), and **Matching Chord Names** (e.g., `C E G` → `C Major`, `A C E G` → `Am7`).

---

## 2. Color & Border Visual System

To make complex overlays effortless to read at a glance, every note marker uses **both** color and border styling:

### Color Coding (Pitch / Interval Role)
- **Root (`R` / `1`):** Warm Red/Coral fill (`#ef4444`) — immediately anchors the pattern.
- **3rd (`b3` / `3`):** Sky/Cyan fill (`#0ea5e9`) — defines Major vs. Minor quality.
- **5th (`b5` / `5`):** Emerald Green fill (`#10b981`) — structural anchor.
- **7th (`b7` / `7`):** Violet/Purple fill (`#a855f7`) — color/tension tone.
- **2nd / 4th / 6th (Extensions):** Amber/Gold fill (`#f59e0b`).
- *(In **Note Lookup** mode, each selected note can use a distinct per-note color or Root/Accent color.)*

### Border Coding (Layer / Emphasis)
- **Root Note:** Thick solid **white/bright ring** (`3px solid #ffffff`) + subtle outer glow.
- **Chord Tone (when overlaid on a Scale):** Crisp **solid border** (`2.5px solid #f8fafc`) so triad/7th tones pop out of the scale.
- **Scale-only Passing Tone:** **Dashed border** (`2px dashed`) with slightly softer opacity so it supports without cluttering.
- **Active Fret Window / CAGED Box:** Subtle **highlighted border box** around the selected fret range, dimming out-of-box notes rather than hiding them.
- **Tapped / Selected Note (Reverse Lookup):** Bright **amber/gold double-ring border** (`box-shadow` + `solid` border).

---

## 3. Fretboard Controls & Features
- **Tunings:** Standard (`E A D G B E`), Drop D (`D A D G B E`), Half-Step Down (`Eb`), Open G (`D G D G B D`), DADGAD.
- **Fret Range:** `0–12`, `0–15`, or `0–22` frets, with standard fret inlay dots (`3, 5, 7, 9, 12, 15, 17, 19, 21`).
- **Display Toggles:**
  - Labels: `Note Name` (`C, E, G`) vs. `Interval` (`R, 3, 5`).
  - Accidentals: `Sharps (#)` vs. `Flats (b)`.
  - Optional **Left-Handed / Mirror** view & **Web Audio Pluck** on tap (100% synthesized, no audio files).
- **Interactive Legend:** Always visible below/above the fretboard explaining every active color and border style.

---

## 4. Implementation Phases

### Phase 1: Project Scaffold & Music Theory Engine
- [x] Scaffold `Guitar/` Vite + React + TypeScript project in the monorepo (`pnpm-workspace.yaml`, `package.json`, `PLAN.md`).
- [ ] Create `src/utils/musicTheory.ts` (note math, enharmonic `#`/`b` formatting, tunings, scale formulas, chord formulas, interval naming, and reverse chord-matching) + `src/utils/musicTheory.test.ts` (`vitest`).

### Phase 2: Interactive Fretboard UI (Colors & Borders)
- [ ] Build `src/components/Fretboard.tsx` & `Fretboard.css` (responsive 6-string neck, nut, fret wires, inlay dots, nut/open-string column, horizontal scroll on narrow mobile screens).
- [ ] Implement the **Color + Border** marker system and **Interactive Legend**.

### Phase 3: Lookup Modes & Controls
- [ ] Build `src/components/LookupControls.tsx` with tabs for **Notes**, **Scales**, **Chords**, and **Identify (Tap)**, plus tuning, fret-range, `#`/`b`, `Notes`/`Intervals`, and CAGED/fret-window focus.
- [ ] Wire **Scale + Chord Overlay** (solid border on chord tones, dashed border on scale tones).
- [ ] *(Optional)* Add Web Audio synthesized guitar-like pluck on note tap.

---

## 5. Verification Plan
- **Unit Tests (`vitest`):** Test note/fret calculation across tunings, scale & chord interval generation, `#`/`b` spelling, and reverse chord identification.
- **Build Check:** Run `pnpm --filter guitar build` (`tsc && vite build`) to verify zero TypeScript or bundle errors.

