# LearnForeignLanguage — Project Knowledge

## Overview
**LearnForeignLanguage** is a 100% client-side **B1-level Spanish** active-recall and spaced-repetition (SRS) trainer for desktop and mobile browsers, built around:
- **500 B1-level Spanish phrases** (5 packs of 100: Core Survival, Everyday Frames, Storytelling & Time, Opinions & Comparisons, Natural Spoken Glue & Idioms)
- **3,000 most frequent Spanish words** (grouped into frequency bands with gender/plural/verb forms and example context)

---

## Data Architecture
- **Read-only Curriculum Data:** Bundled as static JSON rather than stored in `localStorage` so large datasets remain easy to edit and fast to load:
  - `src/data/spanish-500-phrases.json` — 500 B1-level phrases across 5 packs with category, English translation, and usage/mnemonic notes.
  - `src/data/spanish-3000-words.json` — Top 3,000 frequency-ranked words (`1–3000`) with `forms` (`singular`, `plural`, `masculine`, `feminine`, `yo`, `tu`, `el`, `nosotros`, `ellos`) and example sentences.
- **`localStorage` Persistence:** Stores user progress (`SRSData`, bookmarks, notes, settings) keyed by stable `VocabItem.id` (or `contentHash` for custom user collections) so progress survives app updates.

---

## Implemented Features & Workflows

### 1. Curriculum & Pack Loader
- `VocabItem` and curriculum pack types in `src/types.ts`.
- Built-in Curriculum / Pack selector in `CollectionManager.tsx` supporting the 5 phrase packs and 3,000-word frequency bands alongside custom text collections.

### 2. Active Recall & Production Mode (`English -> Spanish`)
- **Reverse Prompting (Native → Target):** Presents/speaks the English prompt first, then reveals/speaks Spanish on demand.
- **Hide / Blur Target Text:** Masks Spanish text until **Reveal** (`Space`).
- **SRS Self-Grading:** **Again / Hard / Good / Easy** (`1–4`) wired to `src/utils/srs.ts` to update `interval`, `repetition`, and `easeFactor`.
- **Typed Recall / Cloze Mode:** Accent-tolerant typed matching with instant feedback.
- **Word Variations & Inflection Drill:** Displays `forms` on reveal with tap-to-pronounce TTS and targeted inflection prompts.
- **Independent Audio & Navigation:** **Auto-read: On / Off** toggle, standalone **Listen / Replay** button, and **Prev / Next** skip navigation without altering SRS state.

### 3. SRS Due Queue & Mastery Progress
- **Due-Today Queue & Daily New-Item Caps:** Serves all due items (`nextReview <= now`) first, plus configurable daily new-item caps (`4` phrases/day, `10` words/day) with a **"+5 Extra New"** override.
- **Already Know Skip:** Marks `New` cards as learned (`21d`, `repetition: 3`) without consuming a daily new-item slot.
- **Same-Session Re-Queue:** Cards needing more practice stay in today's queue until graded **I Know It**.
- **Visual Status & Mastery Dashboard:** `New` / `Due` / `In Xd` badges and progress bars for **Phrases (X / 500)** and **Words (X / 3,000)** split by `New`, `Learning`, and `Mastered` (`interval >= 21` days).

### Intentionally Excluded Scope
- Playback speed controls, single-item loop, trouble list, daily streak UI, sentence scratchpad, JSON export/import, and offline PWA support were intentionally dropped.

---

## Verification
- **Unit Tests (`vitest`):** Validates `spanish-500-phrases.json` (500 items) and `spanish-3000-words.json` (3,000 items), SRS scheduling in `src/utils/srs.ts`, and `src/utils/parser.test.ts`.
- **Build Check:** `pnpm build` inside `LearnForeignLanguage/`.
