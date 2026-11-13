import { describe, it, expect } from 'vitest';
import {
  buildMixedRecallQueue,
  buildRecallQueue,
  checkTypedRecall,
  formatFormEntries,
  normalizeSpanish,
  selectSmartReviewBatch,
  shouldUpdateSrsOnGrade,
  shuffleItems,
} from './recall';
import { markAsWellKnown } from './srs';
import { VocabItem } from '../types';

describe('recall helpers', () => {
  it('normalizes Spanish text and checks typed recall with accent tolerance', () => {
    expect(normalizeSpanish('¿Cómo estás?')).toBe('como estas');
    expect(checkTypedRecall('¿Cómo estás?', '¿Cómo estás?')).toBe('exact');
    expect(checkTypedRecall('como estas', '¿Cómo estás?')).toBe('accent-diff');
    expect(checkTypedRecall('buenos dias', '¿Cómo estás?')).toBe('mismatch');
  });

  it('orders recall queue with due items first, then new, then future', () => {
    const items: VocabItem[] = [
      { id: 'future', target: 'uno', native: 'one' },
      { id: 'new', target: 'dos', native: 'two' },
      { id: 'due', target: 'tres', native: 'three' },
    ];
    const now = Date.now();
    const srsData = {
      future: { lastReviewed: now, nextReview: now + 86400_000, interval: 1, repetition: 1, easeFactor: 2.5 },
      due: { lastReviewed: now - 172800_000, nextReview: now - 1000, interval: 1, repetition: 1, easeFactor: 2.5 },
    };

    expect(buildRecallQueue(items, srsData, 'due-and-new').map((i) => i.id)).toEqual(['due', 'new']);
    expect(buildRecallQueue(items, srsData, 'due-and-new', 0).map((i) => i.id)).toEqual(['due']);
    expect(buildRecallQueue(items, srsData, 'all').map((i) => i.id)).toEqual(['due', 'new', 'future']);

    const known = markAsWellKnown(now);
    expect(known.interval).toBe(21);
    expect(known.repetition).toBe(3);
    expect(known.nextReview).toBeGreaterThan(now);
  });

  it('formats verb and noun/adjective forms cleanly', () => {
    const verbEntries = formatFormEntries({
      yo: 'hablo',
      tu: 'hablas',
      el: 'habla',
      nosotros: 'hablamos',
      ellos: 'hablan',
    });
    expect(verbEntries).toHaveLength(5);
    expect(verbEntries[3]).toEqual({ label: 'nosotros', value: 'hablamos' });

    const nounEntries = formatFormEntries({ singular: 'el lunes', plural: 'los lunes' });
    expect(nounEntries).toEqual([
      { label: 'sg.', value: 'el lunes' },
      { label: 'pl.', value: 'los lunes' },
    ]);
  });

  it('mixes due items from both sources and interleaves capped new phrases and words', () => {
    const now = Date.now();
    const phrases: VocabItem[] = [
      { id: 'es-p-001', target: 'p1', native: 'p1' },
      { id: 'es-p-002', target: 'p2', native: 'p2' },
      { id: 'es-p-003', target: 'p3', native: 'p3' },
    ];
    const vocab: VocabItem[] = [
      { id: 'es-w-0001', target: 'w1', native: 'w1' },
      { id: 'es-w-0002', target: 'w2', native: 'w2' },
      { id: 'es-w-0003', target: 'w3', native: 'w3' },
    ];
    const phraseSrs = {
      'es-p-001': { lastReviewed: now - 2000, nextReview: now - 500, interval: 1, repetition: 1, easeFactor: 2.5 },
    };
    const vocabSrs = {
      'es-w-0001': { lastReviewed: now - 3000, nextReview: now - 1000, interval: 1, repetition: 1, easeFactor: 2.5 },
    };

    const mixed = buildMixedRecallQueue(phrases, phraseSrs, vocab, vocabSrs, 'due-and-new', 1, 2);
    expect(mixed.map((i) => i.id)).toEqual([
      'es-w-0001', // oldest due
      'es-p-001',  // next due
      'es-p-002',  // 1st new phrase
      'es-w-0002', // 1st new word
      'es-w-0003', // 2nd new word
    ]);

    const reviewOnly = buildMixedRecallQueue(phrases, phraseSrs, vocab, vocabSrs, 'review');
    expect(reviewOnly.map((i) => i.id)).toEqual(['es-w-0001', 'es-p-001']);
    expect(shuffleItems(reviewOnly)).toHaveLength(2);

    expect(shouldUpdateSrsOnGrade(undefined)).toBe(true);
    expect(shouldUpdateSrsOnGrade(phraseSrs['es-p-001'])).toBe(true); // due
    expect(
      shouldUpdateSrsOnGrade({
        lastReviewed: now,
        nextReview: now + 86400_000,
        interval: 1,
        repetition: 1,
        easeFactor: 2.5,
      })
    ).toBe(false); // future-scheduled: protected from same-day interval inflation
  });

  it('selects smart review batches with tiered priority and cycle de-duplication', () => {
    const now = Date.now();
    const items: VocabItem[] = Array.from({ length: 40 }, (_, idx) => ({
      id: `item-${idx}`,
      target: `es-${idx}`,
      native: `en-${idx}`,
    }));
    const srsMap: Record<string, { lastReviewed: number; nextReview: number; interval: number; repetition: number; easeFactor: number }> = {};
    items.forEach((item, idx) => {
      const isWeak = idx < 15;
      srsMap[item.id] = {
        lastReviewed: now - 86400_000,
        nextReview: now + (idx + 1) * 86400_000,
        interval: isWeak ? 1 : 30,
        repetition: isWeak ? 1 : 5,
        easeFactor: isWeak ? 1.8 : 2.6,
      };
    });

    const round1 = selectSmartReviewBatch(items, (id) => srsMap[id], new Set(), 25);
    expect(round1.resetCycle).toBe(false);
    expect(round1.items).toHaveLength(25);

    // Second round excludes all 25 items from round 1 and picks the remaining 15
    const exclude1 = new Set(round1.items.map((i) => i.id));
    const round2 = selectSmartReviewBatch(items, (id) => srsMap[id], exclude1, 25);
    expect(round2.resetCycle).toBe(false);
    expect(round2.items).toHaveLength(15);
    for (const item of round2.items) {
      expect(exclude1.has(item.id)).toBe(false);
    }

    // Once all 40 are excluded, it resets the cycle and returns a fresh 25-item batch
    const excludeAll = new Set(items.map((i) => i.id));
    const round3 = selectSmartReviewBatch(items, (id) => srsMap[id], excludeAll, 25);
    expect(round3.resetCycle).toBe(true);
    expect(round3.items).toHaveLength(25);
  });
});

