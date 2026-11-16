import { describe, it, expect } from 'vitest';
import {
  allocateNewItemsSeparate,
  allocateNewItemsUpTo,
  buildMixedRecallQueue,
  buildRecallQueue,
  checkTypedRecall,
  formatFormEntries,
  getLearnedItemEntries,
  normalizeSpanish,
  selectSmartReviewBatch,
  shouldUpdateSrsOnGrade,
  shuffleItems,
} from './recall';
import { calculateNextReview, getReviewStatus, markAsWellKnown } from './srs';
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

    const reset = calculateNextReview(known, 1);
    expect(reset.repetition).toBe(0);
    expect(reset.interval).toBe(0);
    expect(getReviewStatus(reset.nextReview)).toBe('due');
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
    const futureItem = {
      lastReviewed: now,
      nextReview: now + 86400_000,
      interval: 1,
      repetition: 1,
      easeFactor: 2.5,
    };
    expect(shouldUpdateSrsOnGrade(futureItem, 4)).toBe(false); // Show it less: protected from same-day interval inflation
    expect(shouldUpdateSrsOnGrade(futureItem, 1)).toBe(true);  // Show it more: brings troubled items back sooner
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

    // Second round takes the remaining 15 unreviewed items AND tops up to 25 from the reset cycle
    const exclude1 = new Set(round1.items.map((i) => i.id));
    const round2 = selectSmartReviewBatch(items, (id) => srsMap[id], exclude1, 25);
    expect(round2.resetCycle).toBe(true);
    expect(round2.items).toHaveLength(25);
    const round2Ids = new Set(round2.items.map((i) => i.id));
    for (const item of items) {
      if (!exclude1.has(item.id)) {
        expect(round2Ids.has(item.id)).toBe(true);
      }
    }

    // Once all 40 are excluded, it resets the cycle and returns a fresh 25-item batch
    const excludeAll = new Set(items.map((i) => i.id));
    const round3 = selectSmartReviewBatch(items, (id) => srsMap[id], excludeAll, 25);
    expect(round3.resetCycle).toBe(true);
    expect(round3.items).toHaveLength(25);
  });

  it('allocates up to N unseen items across phrases and vocab with spillover', () => {
    const phrases: VocabItem[] = Array.from({ length: 4 }, (_, i) => ({
      id: `es-p-${i}`,
      target: `p${i}`,
      native: `ep${i}`,
    }));
    const vocab: VocabItem[] = Array.from({ length: 10 }, (_, i) => ({
      id: `es-w-${i}`,
      target: `w${i}`,
      native: `ew${i}`,
    }));

    // 1 phrase and 2 words already in today's cap -> 3 phrases and 8 words remain (1:6 ratio -> 1 phrase + 6 words)
    const set7 = allocateNewItemsUpTo(phrases, {}, vocab, {}, 1, 2, 7);
    expect(set7.addedPhraseCount).toBe(1);
    expect(set7.addedVocabCount).toBe(6);
    expect(set7.addedItems.map((i) => i.id)).toEqual([
      'es-p-1',
      'es-w-2',
      'es-w-3',
      'es-w-4',
      'es-w-5',
      'es-w-6',
      'es-w-7',
    ]);

    // Asking for 10 when only 1 phrase and 2 words remain -> caps at 3 total ("up to")
    const spillover = allocateNewItemsUpTo(phrases, {}, vocab, {}, 3, 8, 10);
    expect(spillover.addedPhraseCount).toBe(1);
    expect(spillover.addedVocabCount).toBe(2);
    expect(spillover.addedItems).toHaveLength(3);

    // Separate allocation picks independently from phrases and vocab without spillover
    const sep = allocateNewItemsSeparate(phrases, {}, vocab, {}, 1, 2, 2, 1);
    expect(sep.addedPhraseCount).toBe(2);
    expect(sep.addedVocabCount).toBe(1);
    expect(sep.addedItems.map((i) => i.id)).toEqual(['es-p-1', 'es-w-2', 'es-p-2']);

    const onlyVocab = allocateNewItemsSeparate(phrases, {}, vocab, {}, 0, 0, 0, 3);
    expect(onlyVocab.addedPhraseCount).toBe(0);
    expect(onlyVocab.addedVocabCount).toBe(3);
    expect(onlyVocab.addedItems.map((i) => i.id)).toEqual(['es-w-0', 'es-w-1', 'es-w-2']);
  });

  it('filters and searches past learned items including known/mastered ones', () => {
    const now = Date.now();
    const phrases: VocabItem[] = [
      { id: 'es-p-1', target: 'Buenos días', native: 'Good morning' },
      { id: 'es-p-2', target: '¿Qué tal?', native: 'How is it going?' },
    ];
    const vocab: VocabItem[] = [
      { id: 'es-w-1', target: 'casa', native: 'house' },
      { id: 'es-w-2', target: 'perro', native: 'dog' },
    ];
    const phraseSrs = {
      'es-p-1': markAsWellKnown(now),
      'es-p-2': { lastReviewed: now - 2000, nextReview: now - 1000, interval: 1, repetition: 1, easeFactor: 2.5 },
    };
    const vocabSrs = {
      'es-w-1': { lastReviewed: now, nextReview: now + 86400_000, interval: 6, repetition: 2, easeFactor: 2.5 },
      // es-w-2 is unseen
    };

    expect(getLearnedItemEntries(phrases, phraseSrs, vocab, vocabSrs, 'all').map((e) => e.item.id)).toEqual([
      'es-p-2',
      'es-w-1',
      'es-p-1',
    ]);
    expect(getLearnedItemEntries(phrases, phraseSrs, vocab, vocabSrs, 'known').map((e) => e.item.id)).toEqual([
      'es-p-1',
    ]);
    expect(getLearnedItemEntries(phrases, phraseSrs, vocab, vocabSrs, 'learning').map((e) => e.item.id)).toEqual([
      'es-p-2',
      'es-w-1',
    ]);
    expect(getLearnedItemEntries(phrases, phraseSrs, vocab, vocabSrs, 'due').map((e) => e.item.id)).toEqual([
      'es-p-2',
    ]);
    expect(getLearnedItemEntries(phrases, phraseSrs, vocab, vocabSrs, 'all', 'morning').map((e) => e.item.id)).toEqual([
      'es-p-1',
    ]);
  });
});

