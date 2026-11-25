import { JournalItem } from './types';
import { buildItemPath } from './tree';
import { generateUniqueSlug } from './slug';
import { generateUlid } from './ulid';
import { nextOrderAtEnd } from './order';

export type CalendarEventInput = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  location?: string;
  htmlLink?: string;
};

export const getCalendarWindow = (
  todayStr: string
): { startDate: string; endDateExclusive: string } => {
  const [y, m, d] = todayStr.split('-').map(Number);
  const targetMonthZero = m - 1 + 2;
  const targetYear = y + Math.floor(targetMonthZero / 12);
  const normalizedMonth = targetMonthZero % 12;
  const daysInTargetMonth = new Date(
    Date.UTC(targetYear, normalizedMonth + 1, 0)
  ).getUTCDate();
  const clampedDay = Math.min(d, daysInTargetMonth);
  const endDateExclusive = `${targetYear}-${String(normalizedMonth + 1).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
  return { startDate: todayStr, endDateExclusive };
};

export type ReconcileCalendarResult = {
  upserted: JournalItem[];
  deletedIds: string[];
  deletedPaths: string[];
};

export const reconcileCalendarEvents = (
  items: JournalItem[],
  events: CalendarEventInput[],
  todayStr: string,
  nowIso = new Date().toISOString()
): ReconcileCalendarResult => {
  const { startDate, endDateExclusive } = getCalendarWindow(todayStr);
  const fetchedByEventId = new Map<string, CalendarEventInput>();
  for (const ev of events) {
    fetchedByEventId.set(ev.id, ev);
  }

  const existingByEventId = new Map<string, JournalItem>();
  for (const item of items) {
    if (item.calendar) {
      existingByEventId.set(item.calendar, item);
    }
  }

  const upserted: JournalItem[] = [];
  const deletedIds: string[] = [];
  const deletedPaths: string[] = [];

  // 1. Delete calendar items in [today, +2 months) missing from fetched events
  for (const item of items) {
    if (!item.calendar) continue;
    if (item.container.kind !== 'day') continue;
    const itemDate = item.container.key;
    if (itemDate >= startDate && itemDate < endDateExclusive) {
      if (!fetchedByEventId.has(item.calendar)) {
        deletedIds.push(item.id);
        deletedPaths.push(item.path);
      }
    }
  }

  // 2. Create or update fetched events
  const slugsByDay = new Map<string, Set<string>>();
  const ordersByDay = new Map<string, number[]>();
  for (const item of items) {
    if (item.container.kind === 'day' && !item.parentId) {
      const day = item.container.key;
      if (!slugsByDay.has(day)) slugsByDay.set(day, new Set());
      if (!ordersByDay.has(day)) ordersByDay.set(day, []);
      slugsByDay.get(day)!.add(item.slug);
      ordersByDay.get(day)!.push(item.order);
    }
  }

  for (const ev of events) {
    const existing = existingByEventId.get(ev.id);
    const details = (ev.location ?? '').trim();

    if (existing) {
      const dateChanged = existing.container.key !== ev.date;
      const contentChanged =
        existing.title !== ev.title ||
        (existing.time ?? '') !== (ev.time ?? '') ||
        existing.body !== details ||
        (existing.calendarUrl ?? '') !== (ev.htmlLink ?? '');

      if (!dateChanged && !contentChanged) {
        continue;
      }

      const targetContainer = { kind: 'day' as const, key: ev.date };
      const nextPath = dateChanged
        ? buildItemPath(targetContainer, null, existing.slug)
        : existing.path;

      if (dateChanged) {
        deletedPaths.push(existing.path);
      }

      const nextHistory = dateChanged
        ? [
            ...existing.history,
            {
              action: 'moved' as const,
              timestamp: nowIso,
              from: existing.container.key,
              to: ev.date,
            },
          ]
        : existing.history;

      upserted.push({
        ...existing,
        title: ev.title,
        body: details,
        time: ev.time,
        calendarUrl: ev.htmlLink,
        container: targetContainer,
        path: nextPath,
        history: nextHistory,
        dirty: true,
        updatedAt: Date.now(),
      });
    } else {
      const daySlugs = slugsByDay.get(ev.date) ?? new Set<string>();
      const dayOrders = ordersByDay.get(ev.date) ?? [];
      const slug = generateUniqueSlug(ev.title, daySlugs);
      const order = nextOrderAtEnd(dayOrders);
      daySlugs.add(slug);
      dayOrders.push(order);
      slugsByDay.set(ev.date, daySlugs);
      ordersByDay.set(ev.date, dayOrders);

      const container = { kind: 'day' as const, key: ev.date };
      upserted.push({
        id: generateUlid(),
        slug,
        status: 'open',
        order,
        created: ev.date,
        title: ev.title,
        body: details,
        history: [
          {
            action: 'added',
            timestamp: nowIso,
            from: '-',
            to: ev.date,
          },
        ],
        ...(ev.time ? { time: ev.time } : {}),
        calendar: ev.id,
        ...(ev.htmlLink ? { calendarUrl: ev.htmlLink } : {}),
        path: buildItemPath(container, null, slug),
        parentId: null,
        container,
        dirty: true,
        updatedAt: Date.now(),
      });
    }
  }

  return { upserted, deletedIds, deletedPaths };
};
