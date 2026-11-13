import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildSourceCollection,
  getSourceItems,
  PHRASE_ITEMS,
  VOCAB_ITEMS,
} from './curriculum';
import {
  loadState,
  saveState,
  STORAGE_KEY,
  createDefaultDailyProgress,
  recordDailyReview,
  normalizeDailyProgressForToday,
} from './storage';
import { calculateNextReview } from './srs';

const createMockStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
};

describe('2-source curriculum & localStorage progress', () => {
  beforeEach(() => {
    (globalThis as { localStorage: ReturnType<typeof createMockStorage> }).localStorage =
      createMockStorage();
  });

  it('loads 500 phrases and 3000 vocab words with forms', () => {
    expect(PHRASE_ITEMS).toHaveLength(500);
    expect(VOCAB_ITEMS).toHaveLength(3000);

    const hablar = getSourceItems('vocab').find((w) => w.target === 'hablar');
    expect(hablar?.forms?.yo).toBe('hablo');
    expect(hablar?.forms?.nosotros).toBe('hablamos');

    const phrasesCol = buildSourceCollection('phrases');
    const vocabCol = buildSourceCollection('vocab');
    expect(phrasesCol.conversations).toHaveLength(500);
    expect(vocabCol.conversations).toHaveLength(3000);
  });

  it('persists only compact progress in localStorage and hydrates both sources', () => {
    const state = loadState();
    expect(state.collections.map((c) => c.id)).toEqual(['phrases', 'vocab']);
    expect(state.activeCollectionId).toBe('phrases');

    const vocab = state.collections.find((c) => c.id === 'vocab')!;
    vocab.srsData['es-w-0001'] = calculateNextReview(undefined, 4);
    state.activeCollectionId = 'vocab';

    saveState(state);

    const rawStored = localStorage.getItem(STORAGE_KEY)!;
    expect(rawStored).toBeTruthy();
    // Static content should NOT be duplicated in localStorage
    expect(rawStored).not.toContain('Buenos días');
    expect(rawStored.length).toBeLessThan(2000);

    const reloaded = loadState();
    expect(reloaded.activeCollectionId).toBe('vocab');
    const reloadedVocab = reloaded.collections.find((c) => c.id === 'vocab')!;
    expect(reloadedVocab.conversations).toHaveLength(3000);
    expect(reloadedVocab.srsData['es-w-0001'].repetition).toBe(1);
  });

  it('tracks daily reviewed, newLearned, and streak across days', () => {
    let daily = createDefaultDailyProgress('2026-11-11');
    daily = recordDailyReview(daily, true, '2026-11-11');
    daily = recordDailyReview(daily, false, '2026-11-11');
    expect(daily.reviewed).toBe(2);
    expect(daily.newLearned).toBe(1);
    expect(daily.streak).toBe(1);
    expect(daily.history['2026-11-11']).toEqual({ reviewed: 2, newLearned: 1 });

    // Next consecutive day keeps streak and increments on first review
    const nextDayRolled = normalizeDailyProgressForToday(daily, '2026-11-12');
    expect(nextDayRolled.reviewed).toBe(0);
    expect(nextDayRolled.streak).toBe(1);

    const nextDayAfterReview = recordDailyReview(daily, true, '2026-11-12');
    expect(nextDayAfterReview.reviewed).toBe(1);
    expect(nextDayAfterReview.streak).toBe(2);

    // Skipping a day resets streak
    const skippedDay = normalizeDailyProgressForToday(daily, '2026-11-14');
    expect(skippedDay.streak).toBe(0);
  });
});
