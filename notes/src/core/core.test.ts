import { describe, expect, it } from 'vitest';
import { parseItemMarkdown, serializeItemMarkdown } from './markdown';
import { generateUniqueSlug, slugifyTitle } from './slug';
import { midpointOrder, needsRenumber, renumberSiblings } from './order';
import {
  addMonthsClamped,
  containerDisplayLabel,
  containerToEndDate,
  formatDateWithWeekday,
  moveSubtreePaths,
  parseJournalPath,
  resolveTreeParents,
} from './tree';
import { reconcilePull } from './merge';
import { getCalendarWindow, reconcileCalendarEvents } from './calendar';
import { dropJournalItem } from '../state/journalActions';
import { JournalItem } from './types';

describe('slug', () => {
  it('normalizes NFD, strips combining marks, caps at 60 chars, and appends suffix after cap', () => {
    expect(slugifyTitle('Café & Résumé!')).toBe('cafe-resume');
    const longTitle = 'a'.repeat(65);
    expect(slugifyTitle(longTitle)).toHaveLength(60);
    expect(generateUniqueSlug(longTitle, ['a'.repeat(60)])).toBe(`${'a'.repeat(60)}-2`);
  });
});

describe('markdown round-trip', () => {
  it('parses and serializes integer IDs bare and ULIDs quoted', () => {
    const raw = `---
id: 64
status: open
order: 12
created: 2026-11-18
slug: books-interests-to-read
collapsed: true
---

# Books interests to read

Some details here.

## History

- added · 2026-11-18T15:16:23.655Z · - → Undated
`;
    const parsed = parseItemMarkdown(raw, 'journal/notes/books-interests-to-read.md');
    expect(parsed).not.toBeNull();
    expect(parsed!.id).toBe('64');
    expect(parsed!.collapsed).toBe(true);
    expect(parsed!.body).toBe('Some details here.');
    expect(parsed!.history).toHaveLength(1);

    const serialized = serializeItemMarkdown(parsed!);
    expect(serialized).toContain('id: 64\n');
    expect(serialized).toContain('collapsed: true\n');
  });

  it('quotes ULID ids', () => {
    const serialized = serializeItemMarkdown({
      id: '01M856RSX2DRF2ZQ2Z578AY5AS',
      slug: 'test-item',
      status: 'open',
      order: 1,
      created: '2026-11-24',
      title: 'Test item',
      body: '',
      history: [],
      path: 'journal/2026/2026-11-24/test-item.md',
    });
    expect(serialized).toContain('id: "01M856RSX2DRF2ZQ2Z578AY5AS"');
  });
});

describe('order', () => {
  it('computes midpoint and detects >6 decimal places for renumber', () => {
    expect(midpointOrder(1, 2)).toBe(1.5);
    expect(needsRenumber([1, 1.5, 2])).toBe(false);
    expect(needsRenumber([1, 1.1234567, 2])).toBe(true);
    expect(renumberSiblings([{ order: 1.5 }, { order: 9 }])).toEqual([
      { order: 1 },
      { order: 2 },
    ]);
  });
});

describe('tree & move', () => {
  it('formats day labels with 3-letter weekday and leaves date-range labels unchanged', () => {
    expect(formatDateWithWeekday('2026-11-24')).toBe('2026-11-24 Tue');
    expect(containerDisplayLabel({ kind: 'day', key: '2026-11-24' })).toBe('2026-11-24 Tue');
    expect(containerDisplayLabel({ kind: 'month', key: '2026-11' })).toBe('2026-11');
    expect(containerDisplayLabel({ kind: 'week', key: 'week-2026-11-23' })).toBe('Week of 2026-11-23');
    expect(containerToEndDate({ kind: 'week', key: 'week-2026-11-23' })).toBe('2026-11-29');
    expect(containerToEndDate({ kind: 'month', key: '2026-11' })).toBe('2026-11-30');
    expect(containerToEndDate({ kind: 'year', key: '2026' })).toBe('2026-12-31');
    expect(addMonthsClamped('2026-11-27', 1)).toBe('2026-12-27');
    expect(addMonthsClamped('2026-01-31', 1)).toBe('2026-02-28');
  });

  it('parses containers, sibling folders, and ignores README.md', () => {
    expect(parseJournalPath('journal/README.md').isJournalItem).toBe(false);
    expect(parseJournalPath('journal/2026/2026-11-24/task.md')).toMatchObject({
      isJournalItem: true,
      container: { kind: 'day', key: '2026-11-24' },
      parentPath: null,
      slug: 'task',
    });
    expect(parseJournalPath('journal/notes/books/dune.md')).toMatchObject({
      isJournalItem: true,
      container: { kind: 'notes', key: 'notes' },
      parentPath: 'journal/notes/books.md',
      slug: 'dune',
    });
  });

  it('moves a parent and its nested sibling folder subtree together', () => {
    const items: JournalItem[] = resolveTreeParents([
      {
        id: 'p1',
        slug: 'trip',
        status: 'open',
        order: 1,
        created: '2026-11-24',
        title: 'Trip',
        body: '',
        history: [],
        path: 'journal/notes/trip.md',
        parentId: null,
        container: { kind: 'notes', key: 'notes' },
        dirty: false,
        updatedAt: 1,
      },
      {
        id: 'c1',
        slug: 'pack',
        status: 'open',
        order: 1,
        created: '2026-11-24',
        title: 'Pack',
        body: '',
        history: [],
        path: 'journal/notes/trip/pack.md',
        parentId: null,
        container: { kind: 'notes', key: 'notes' },
        dirty: false,
        updatedAt: 1,
      },
    ]);

    const { updated, oldPaths } = moveSubtreePaths(
      items,
      'p1',
      { kind: 'day', key: '2026-11-25' },
      null
    );
    expect(oldPaths).toEqual(['journal/notes/trip.md', 'journal/notes/trip/pack.md']);
    expect(updated.map((u) => u.path)).toEqual([
      'journal/2026/2026-11-25/trip.md',
      'journal/2026/2026-11-25/trip/pack.md',
    ]);

    const toMonth = moveSubtreePaths(
      updated,
      'p1',
      { kind: 'month', key: '2026-12' },
      null
    );
    expect(toMonth.updated.map((u) => u.path)).toEqual([
      'journal/2026/2026-12/trip.md',
      'journal/2026/2026-12/trip/pack.md',
    ]);

    const toYear = moveSubtreePaths(
      toMonth.updated,
      'p1',
      { kind: 'year', key: '2027' },
      null
    );
    expect(toYear.updated.map((u) => u.path)).toEqual([
      'journal/2027/year/trip.md',
      'journal/2027/year/trip/pack.md',
    ]);
  });
});

describe('merge & calendar', () => {
  it('merges by id first and flags conflict only when both local and remote changed', () => {
    const local: JournalItem[] = [
      {
        id: '1',
        slug: 'a',
        status: 'open',
        order: 1,
        created: '2026-11-24',
        title: 'Local edit',
        body: '',
        history: [],
        path: 'journal/notes/a.md',
        parentId: null,
        container: { kind: 'notes', key: 'notes' },
        remoteSha: 'sha-old',
        dirty: true,
        updatedAt: 1,
      },
    ];

    const res = reconcilePull(
      local,
      [
        {
          path: 'journal/2026/2026-11-24/a.md',
          sha: 'sha-new',
          parsed: {
            id: '1',
            slug: 'a',
            status: 'open',
            order: 1,
            created: '2026-11-24',
            title: 'Remote edit',
            body: '',
            history: [],
            path: 'journal/2026/2026-11-24/a.md',
          },
        },
      ],
      new Set(['journal/2026/2026-11-24/a.md'])
    );

    expect(res.items[0].title).toBe('Local edit');
    expect(res.conflicts).toHaveLength(1);
  });

  it('clamps 2-month calendar window on month-end and reconciles cancelled events', () => {
    expect(getCalendarWindow('2026-12-31')).toEqual({
      startDate: '2026-12-31',
      endDateExclusive: '2027-02-28',
    });

    const existing: JournalItem[] = [
      {
        id: 'cal-1',
        slug: 'dentist',
        status: 'open',
        order: 1,
        created: '2026-11-25',
        title: 'Dentist',
        body: '',
        history: [],
        calendar: 'ev-1',
        path: 'journal/2026/2026-11-25/dentist.md',
        parentId: null,
        container: { kind: 'day', key: '2026-11-25' },
        dirty: false,
        updatedAt: 1,
      },
    ];

    const res = reconcileCalendarEvents(existing, [], '2026-11-24');
    expect(res.deletedIds).toEqual(['cal-1']);
    expect(res.deletedPaths).toEqual(['journal/2026/2026-11-25/dentist.md']);
  });

  it('supports drag-to-sort and drag-to-nest via dropJournalItem', () => {
    const base: JournalItem[] = [
      {
        id: 'a',
        slug: 'a',
        status: 'open',
        order: 1,
        created: '2026-11-24',
        title: 'A',
        body: '',
        history: [],
        path: 'journal/notes/a.md',
        parentId: null,
        container: { kind: 'notes', key: 'notes' },
        dirty: false,
        updatedAt: 1,
      },
      {
        id: 'b',
        slug: 'b',
        status: 'open',
        order: 2,
        created: '2026-11-24',
        title: 'B',
        body: '',
        history: [],
        path: 'journal/notes/b.md',
        parentId: null,
        container: { kind: 'notes', key: 'notes' },
        dirty: false,
        updatedAt: 1,
      },
    ];

    const sorted = dropJournalItem(base, 'b', 'a', 'before');
    expect(sorted.items.find((i) => i.id === 'b')!.order).toBe(0);

    const nested = dropJournalItem(base, 'b', 'a', 'inside');
    const movedB = nested.items.find((i) => i.id === 'b')!;
    expect(movedB.parentId).toBe('a');
    expect(movedB.path).toBe('journal/notes/a/b.md');
  });
});
