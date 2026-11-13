import { SRSData, VocabItem, WordForms } from '../types';
import { getReviewStatus } from './srs';

export type RecallFilter = 'due-and-new' | 'review' | 'all';
export type RecallMatchResult = 'exact' | 'accent-diff' | 'mismatch';
export const SESSION_SIZE = 25;

export function shouldUpdateSrsOnGrade(current?: SRSData): boolean {
  if (!current) return true;
  return getReviewStatus(current.nextReview) !== 'future';
}

export function normalizeSpanish(text: string, stripAccents = true): string {
  let out = text
    .trim()
    .toLowerCase()
    .replace(/[¿?¡!.,;:()"']/g, '')
    .replace(/\s+/g, ' ');

  if (stripAccents) {
    out = out.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  return out;
}

export function checkTypedRecall(guess: string, target: string): RecallMatchResult {
  const cleanGuess = normalizeSpanish(guess, false);
  const cleanTarget = normalizeSpanish(target, false);
  if (!cleanGuess) return 'mismatch';
  if (cleanGuess === cleanTarget) return 'exact';

  const foldedGuess = normalizeSpanish(guess, true);
  const foldedTarget = normalizeSpanish(target, true);
  if (foldedGuess === foldedTarget) return 'accent-diff';

  return 'mismatch';
}

export function buildRecallQueue(
  items: VocabItem[],
  srsData: Record<string, SRSData>,
  filter: RecallFilter = 'due-and-new',
  newLimit?: number
): VocabItem[] {
  const due: VocabItem[] = [];
  const fresh: VocabItem[] = [];
  const future: VocabItem[] = [];

  for (const item of items) {
    const entry = srsData[item.id];
    const status = entry ? getReviewStatus(entry.nextReview) : 'new';
    if (status === 'due') {
      due.push(item);
    } else if (status === 'new') {
      fresh.push(item);
    } else {
      future.push(item);
    }
  }

  // Sort due items oldest-due first
  due.sort((a, b) => (srsData[a.id]?.nextReview ?? 0) - (srsData[b.id]?.nextReview ?? 0));

  if (filter === 'due-and-new') {
    const cappedFresh =
      typeof newLimit === 'number' ? fresh.slice(0, Math.max(0, newLimit)) : fresh;
    return [...due, ...cappedFresh];
  }
  return [...due, ...fresh, ...future];
}

export function shuffleItems<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function interleaveArrays<T>(a: T[], b: T[]): T[] {
  const result: T[] = [];
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < a.length) result.push(a[i]);
    if (i < b.length) result.push(b[i]);
  }
  return result;
}

export function buildMixedRecallQueue(
  phraseItems: VocabItem[],
  phraseSrs: Record<string, SRSData>,
  vocabItems: VocabItem[],
  vocabSrs: Record<string, SRSData>,
  filter: RecallFilter = 'due-and-new',
  phraseNewLimit?: number,
  vocabNewLimit?: number
): VocabItem[] {
  const splitByStatus = (items: VocabItem[], srs: Record<string, SRSData>) => {
    const due: Array<{ item: VocabItem; nextReview: number }> = [];
    const fresh: VocabItem[] = [];
    const future: VocabItem[] = [];

    for (const item of items) {
      const entry = srs[item.id];
      const status = entry ? getReviewStatus(entry.nextReview) : 'new';
      if (status === 'due') {
        due.push({ item, nextReview: entry.nextReview });
      } else if (status === 'new') {
        fresh.push(item);
      } else {
        future.push(item);
      }
    }
    return { due, fresh, future };
  };

  const p = splitByStatus(phraseItems, phraseSrs);
  const v = splitByStatus(vocabItems, vocabSrs);

  if (filter === 'review') {
    const learned: Array<{ item: VocabItem; nextReview: number }> = [];
    for (const item of phraseItems) {
      const entry = phraseSrs[item.id];
      if (entry && entry.repetition > 0) {
        learned.push({ item, nextReview: entry.nextReview });
      }
    }
    for (const item of vocabItems) {
      const entry = vocabSrs[item.id];
      if (entry && entry.repetition > 0) {
        learned.push({ item, nextReview: entry.nextReview });
      }
    }
    return learned
      .sort((a, b) => a.nextReview - b.nextReview)
      .map((entry) => entry.item);
  }

  const allDue = [...p.due, ...v.due]
    .sort((a, b) => a.nextReview - b.nextReview)
    .map((entry) => entry.item);

  const cappedP =
    filter === 'due-and-new' && typeof phraseNewLimit === 'number'
      ? p.fresh.slice(0, Math.max(0, phraseNewLimit))
      : p.fresh;
  const cappedV =
    filter === 'due-and-new' && typeof vocabNewLimit === 'number'
      ? v.fresh.slice(0, Math.max(0, vocabNewLimit))
      : v.fresh;

  const mixedNew = interleaveArrays(cappedP, cappedV);

  if (filter === 'due-and-new') {
    return [...allDue, ...mixedNew];
  }
  return [...allDue, ...mixedNew, ...interleaveArrays(p.future, v.future)];
}

export interface SmartReviewBatch {
  items: VocabItem[];
  resetCycle: boolean;
}

/**
 * Selects an open-review batch using a weighted tiered mix:
 * - ~50% weakest & newest (lowest interval / easeFactor)
 * - ~30% due soonest (earliest nextReview)
 * - ~20% random long-term refresh
 * Excludes already-reviewed IDs in the current cycle until exhausted.
 */
export function selectSmartReviewBatch(
  learnedItems: VocabItem[],
  getSrs: (id: string) => SRSData | undefined,
  excludeIds: Set<string> = new Set(),
  sessionSize: number = SESSION_SIZE
): SmartReviewBatch {
  if (learnedItems.length === 0) {
    return { items: [], resetCycle: false };
  }

  const remaining = learnedItems.filter((item) => !excludeIds.has(item.id));
  const resetCycle = remaining.length === 0;
  const pool = resetCycle ? learnedItems : remaining;

  const targetCount = Math.min(sessionSize, pool.length);
  if (pool.length <= targetCount) {
    return { items: shuffleItems(pool), resetCycle };
  }

  const weakTarget = Math.round(targetCount * 0.5);
  const soonTarget = Math.round(targetCount * 0.3);
  const refreshTarget = Math.max(0, targetCount - weakTarget - soonTarget);

  const picked = new Set<string>();
  const selected: VocabItem[] = [];

  const takeFromSorted = (sorted: VocabItem[], count: number) => {
    if (count <= 0) return;
    const unpicked = sorted.filter((i) => !picked.has(i.id));
    // Shuffle within a 2x candidate window so ties and near-ties vary each round
    const window = shuffleItems(unpicked.slice(0, Math.min(unpicked.length, count * 2)));
    for (const item of window.slice(0, count)) {
      picked.add(item.id);
      selected.push(item);
    }
  };

  // Tier 1: Weakest & newest (lowest interval, then lowest easeFactor, then lowest repetition)
  const byWeakness = [...pool].sort((a, b) => {
    const sa = getSrs(a.id);
    const sb = getSrs(b.id);
    const intervalDiff = (sa?.interval ?? 0) - (sb?.interval ?? 0);
    if (intervalDiff !== 0) return intervalDiff;
    const easeDiff = (sa?.easeFactor ?? 2.5) - (sb?.easeFactor ?? 2.5);
    if (easeDiff !== 0) return easeDiff;
    return (sa?.repetition ?? 0) - (sb?.repetition ?? 0);
  });
  takeFromSorted(byWeakness, weakTarget);

  // Tier 2: Due soonest (earliest nextReview)
  const bySoonestDue = [...pool].sort(
    (a, b) => (getSrs(a.id)?.nextReview ?? 0) - (getSrs(b.id)?.nextReview ?? 0)
  );
  takeFromSorted(bySoonestDue, soonTarget);

  // Tier 3: Random long-term refresh
  const leftovers = shuffleItems(pool.filter((i) => !picked.has(i.id)));
  for (const item of leftovers.slice(0, refreshTarget)) {
    picked.add(item.id);
    selected.push(item);
  }

  // Top up if any tier had fewer items than its target
  if (selected.length < targetCount) {
    const extra = shuffleItems(pool.filter((i) => !picked.has(i.id)));
    for (const item of extra.slice(0, targetCount - selected.length)) {
      picked.add(item.id);
      selected.push(item);
    }
  }

  return { items: shuffleItems(selected), resetCycle };
}

export function formatFormEntries(
  forms?: WordForms
): Array<{ label: string; value: string }> {
  if (!forms) return [];
  const entries: Array<{ label: string; value: string }> = [];

  if (forms.yo) entries.push({ label: 'yo', value: forms.yo });
  if (forms.tu) entries.push({ label: 'tú', value: forms.tu });
  if (forms.el) entries.push({ label: 'él/ella', value: forms.el });
  if (forms.nosotros) entries.push({ label: 'nosotros', value: forms.nosotros });
  if (forms.ellos) entries.push({ label: 'ellos', value: forms.ellos });

  if (forms.masculine) entries.push({ label: 'm.', value: forms.masculine });
  if (forms.feminine) entries.push({ label: 'f.', value: forms.feminine });
  if (forms.masculinePlural) entries.push({ label: 'm. pl.', value: forms.masculinePlural });
  if (forms.femininePlural) entries.push({ label: 'f. pl.', value: forms.femininePlural });

  if (forms.singular) entries.push({ label: 'sg.', value: forms.singular });
  if (forms.plural && forms.plural !== forms.singular) {
    entries.push({ label: 'pl.', value: forms.plural });
  }

  return entries;
}

