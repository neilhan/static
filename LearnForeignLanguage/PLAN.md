# Spanish Recall & Curriculum Plan

## Goal
Build out **LearnForeignLanguage** into a focused **B1-level Spanish** recall trainer, running 100% client-side (desktop & phone browsers), with the goal of mastering:
- **500 B1-level Spanish phrases** (5 packs of 100: Core Survival, Everyday Frames, Storytelling & Time, Opinions & Comparisons, Natural Spoken Glue & Idioms)
- **3,000 most frequent Spanish words** (learned in frequency bands with example context)

Both datasets will live directly in the project as structured data files, paired with active-recall and spaced-repetition (SRS) workflows.

---

## 1. Bundled Data Files (`src/data/` or `public/data/`)

Storing all 3,000 words + 100 phrases in `localStorage` as raw text would be noisy to edit and heavy to parse on every keystroke. Instead, keep the curriculum as read-only bundled JSON data and store only user progress (`SRSData`, bookmarks, notes, settings) in `localStorage`.

### Planned Files
- `src/data/spanish-500-phrases.json` — 500 B1-level phrases organized into 5 packs of 100 (`A1 Core Survival`, `A2 Everyday Frames`, `A2–B1 Storytelling & Time`, `B1 Opinions & Comparisons`, `B1 Spoken Glue & Idioms`), each with category, English translation, and usage/mnemonic note.
- `src/data/spanish-3000-words.json` (or split into bands / lazy-loaded from `public/data/`) — Top 3,000 words ordered by frequency rank (`1` to `3000`), grouped into manageable packs (e.g., `1–100`, `101–300`, `301–600`, `601–1000`, `1001–1500`, `1501–2000`, `2001–2500`, `2501–3000`).

### Proposed Entry Schema
```ts
export interface WordForms {
  // Nouns & Adjectives
  singular?: string;
  plural?: string;
  masculine?: string;
  feminine?: string;
  masculinePlural?: string;
  femininePlural?: string;
  // Verbs (present indicative)
  yo?: string;           // I
  tu?: string;           // you (singular informal)
  el?: string;           // he / she / you (formal)
  nosotros?: string;     // we
  ellos?: string;        // they / you (plural)
}

export interface VocabItem {
  id: string;            // Stable ID, e.g. "es-w-0001" or "es-p-001"
  rank?: number;         // 1..3000 for frequency words
  target: string;        // Spanish word (with article for nouns, e.g. "la mesa") or phrase
  native: string;        // English meaning
  pos?: string;          // Part of speech (noun, verb, adj, phrase, etc.)
  category?: string;     // e.g. "Core", "Travel", "Food"
  forms?: WordForms;     // Gender, plural, and verb subject variations
  exampleTarget?: string;// Short Spanish example sentence using the word
  exampleNative?: string;// English translation of the example
  note?: string;         // Cognate hint or mnemonic hook
}
```

> **Note on `localStorage`:** Keep `SRSData` keyed by stable item `id` (or `contentHash` for custom user collections) so progress is preserved across edits and app updates.

---

## 2. Implementation Phases

### Phase 1: Curriculum Data & Pack Loader
- [x] Add `VocabItem` and curriculum pack types in `src/types.ts`.
- [x] Create `src/data/spanish-500-phrases.json` with 500 B1-level phrases (5 packs of 100) + English translations + usage notes.
- [x] Create `src/data/spanish-3000-words.json` (frequency-ranked 1–3000 from open frequency lists + Wiktionary/Kaikki glosses, with `forms` for plural, gender, and verb subject variations).
- [x] Add a **Curriculum / Built-in Packs** selector in `CollectionManager.tsx` (or a dedicated tab) so users can study the 5 phrase packs and unlock/study 3,000-word frequency bands alongside custom text collections.

### Phase 2: Active Recall & Production Mode
Shift from passive listening to active retrieval (`English -> Spanish`):
- [x] **Reverse Prompting (Native → Target):** Present or speak the English (`native`) prompt first, pause for user recall, then reveal/speak the Spanish (`target`).
- [x] **Hide / Blur Target Text Toggle:** Mask Spanish text until the user clicks **Reveal** (or presses `Space`).
- [x] **SRS Self-Grading Controls:** Add **Again / Hard / Good / Easy** buttons wired to `src/utils/srs.ts` to update `interval`, `repetition`, and `easeFactor`.
- [x] **Typed Recall / Cloze Mode (Optional):** Let the user type the missing word or full phrase with accent-tolerant matching and instant feedback.
- [x] **Word Variations & Inflection Drill:** Show `forms` (singular/plural, male/female, `yo/tú/él/nosotros/ellos`) on card reveal with tap-to-pronounce TTS, plus an optional drill prompting specific forms (e.g., *"we speak"* → `nosotros hablamos`).
- [x] **Separate Audio & Card Navigation:** Add an **Auto-read: On / Off** toggle on reveal, independent **🔊 Listen / Replay** button, **← Prev / Next →** skip navigation (without affecting SRS), and `Space` / `1–4` keyboard shortcuts.

### Phase 3: SRS Due Queue & Mastery Progress
Make daily review effortless and show progress toward the 3,000-word + 500-phrase goal:
- [x] **Due-Today Queue & Daily New-Item Caps:** Serve all `Due` items first (`nextReview <= now`), plus up to a per-source daily cap (`4` new phrases/day, `10` new words/day, configurable) with a **"+5 Extra New"** override.
- [x] **Already Well-Known Skip:** Add an **"Already Know ✓"** action on `New` cards that schedules them as learned (`21d`, `repetition: 3`) without consuming a daily new-item slot.
- [x] **Same-Session Re-Queue:** Cards graded **Need More Practice** stay in today's session queue until graded **I Know It**.
- [x] **Visual Due Indicators:** Show `New`, `Due`, or `In Xd` status badges on collections and items (completing the planned item in `README.md`).
- [x] **Mastery Dashboard:** Progress bars for **Phrases (X / 500)** and **Words (X / 3,000)** broken down by `New`, `Learning`, and `Mastered` (e.g., `interval >= 21` days).

### Phase 4: Audio Speed & Memory Hooks *(Not Needed)*
- Dropped per user preference — no playback speed controls, single-item loop, or trouble list planned.

### Phase 5: Daily Habit, Micro-Output & Mobile Offline Support *(Not Needed)*
- Dropped per user preference — no daily streak UI, sentence scratchpad, JSON export/import, or offline PWA work planned.

---

## 3. Verification Plan
- **Unit Tests (`vitest`):**
  - Validate `spanish-500-phrases.json` and `spanish-3000-words.json` (unique IDs, non-empty `target`/`native`, expected counts: 500 and 3000).
  - Test SRS scheduling calculations (`Again / Hard / Good / Easy`) in `src/utils/srs.ts`.
  - Ensure existing `src/utils/parser.test.ts` continues to pass.
- **Build & UI Check:**
  - Run `pnpm build` in `LearnForeignLanguage` to verify TypeScript compilation and bundle size.
  - Verify TTS playback, hide/reveal recall flow, JSON export/import, and `localStorage` persistence in desktop and mobile browsers.

