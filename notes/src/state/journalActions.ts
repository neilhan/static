import {
  midpointOrder,
  needsRenumber,
  nextOrderAtEnd,
  renumberSiblings,
} from '../core/order';
import { generateUniqueSlug } from '../core/slug';
import {
  buildItemPath,
  collectSubtreeIds,
  containerDisplayLabel,
  moveSubtreePaths,
  resolveTreeParents,
} from '../core/tree';
import { ContainerRef, HistoryAction, ItemStatus, JournalItem } from '../core/types';
import { generateUlid } from '../core/ulid';

export const getTodayDateStr = (timeZone?: string): string => {
  const d = new Date();
  if (timeZone) {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(d);
      const y = parts.find((p) => p.type === 'year')?.value;
      const m = parts.find((p) => p.type === 'month')?.value;
      const day = parts.find((p) => p.type === 'day')?.value;
      if (y && m && day) return `${y}-${m}-${day}`;
    } catch {
      // Fallback to browser local date if invalid timezone
    }
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (dateStr: string, delta: number): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dt.toISOString().slice(0, 10);
};

export const getSiblings = (
  items: JournalItem[],
  container: ContainerRef,
  parentId: string | null
): JournalItem[] =>
  items
    .filter(
      (i) =>
        i.parentId === parentId &&
        i.container.kind === container.kind &&
        i.container.key === container.key
    )
    .sort((a, b) => a.order - b.order);

const maybeRenumberGroup = (
  items: JournalItem[],
  container: ContainerRef,
  parentId: string | null
): JournalItem[] => {
  const siblings = getSiblings(items, container, parentId);
  if (!needsRenumber(siblings.map((s) => s.order))) {
    return items;
  }
  const renumbered = renumberSiblings(siblings);
  const byId = new Map(renumbered.map((s) => [s.id, s]));
  return items.map((item) => {
    const updated = byId.get(item.id);
    return updated ? { ...updated, dirty: true, updatedAt: Date.now() } : item;
  });
};

export const createJournalItem = (
  items: JournalItem[],
  params: {
    title: string;
    body?: string;
    container: ContainerRef;
    parentId?: string | null;
    time?: string;
  }
): { items: JournalItem[]; created: JournalItem } => {
  const nowIso = new Date().toISOString();
  const today = getTodayDateStr();
  const parentId = params.parentId ?? null;
  const parent = parentId ? items.find((i) => i.id === parentId) ?? null : null;
  const container = parent ? parent.container : params.container;

  const siblings = getSiblings(items, container, parentId);
  const slug = generateUniqueSlug(
    params.title,
    siblings.map((s) => s.slug)
  );
  const order = nextOrderAtEnd(siblings.map((s) => s.order));
  const path = buildItemPath(container, parent ? parent.path : null, slug);

  const created: JournalItem = {
    id: generateUlid(),
    slug,
    status: 'open',
    order,
    created: today,
    title: params.title.trim() || 'Untitled',
    body: (params.body ?? '').trim(),
    history: [
      {
        action: 'added',
        timestamp: nowIso,
        from: '-',
        to: containerDisplayLabel(container),
      },
    ],
    ...(params.time ? { time: params.time } : {}),
    path,
    parentId,
    container,
    dirty: true,
    updatedAt: Date.now(),
  };

  // Uncollapse parent when adding a sub-item
  const nextItems = items.map((item) =>
    parent && item.id === parent.id && item.collapsed
      ? { ...item, collapsed: undefined, dirty: true, updatedAt: Date.now() }
      : item
  );

  return {
    items: resolveTreeParents([...nextItems, created]),
    created,
  };
};

export const updateItemContent = (
  items: JournalItem[],
  id: string,
  patch: { title?: string; body?: string; time?: string | undefined }
): JournalItem[] => {
  const nowIso = new Date().toISOString();
  return items.map((item) => {
    if (item.id !== id) return item;
    const nextTitle =
      patch.title !== undefined ? patch.title.replace(/\r?\n/g, ' ').trim() || item.title : item.title;
    const nextBody = patch.body !== undefined ? patch.body.trim() : item.body;
    const nextTime = 'time' in patch ? patch.time : item.time;

    const changed =
      nextTitle !== item.title ||
      nextBody !== item.body ||
      (nextTime ?? '') !== (item.time ?? '');
    if (!changed) return item;

    return {
      ...item,
      title: nextTitle,
      body: nextBody,
      time: nextTime || undefined,
      history: [
        ...item.history,
        { action: 'edited', timestamp: nowIso, from: '-', to: '-' },
      ],
      dirty: true,
      updatedAt: Date.now(),
    };
  });
};

export const toggleItemCollapsed = (
  items: JournalItem[],
  id: string
): JournalItem[] =>
  items.map((item) =>
    item.id === id
      ? {
          ...item,
          collapsed: item.collapsed ? undefined : true,
          dirty: true,
          updatedAt: Date.now(),
        }
      : item
  );

export const setItemStatus = (
  items: JournalItem[],
  id: string,
  nextStatus: ItemStatus
): JournalItem[] => {
  const nowIso = new Date().toISOString();
  return items.map((item) => {
    if (item.id !== id || item.status === nextStatus) return item;
    let action: HistoryAction = 'edited';
    if (nextStatus === 'done') action = 'done';
    else if (nextStatus === 'archived') action = 'archived';
    else if (item.status === 'done') action = 'reopened';
    else if (item.status === 'archived') action = 'unarchived';

    return {
      ...item,
      status: nextStatus,
      history: [
        ...item.history,
        { action, timestamp: nowIso, from: '-', to: '-' },
      ],
      dirty: true,
      updatedAt: Date.now(),
    };
  });
};

export const moveJournalItem = (
  items: JournalItem[],
  id: string,
  targetContainer: ContainerRef,
  targetParentId: string | null = null
): { items: JournalItem[]; deletedPaths: string[] } => {
  const target = items.find((i) => i.id === id);
  if (!target) return { items, deletedPaths: [] };

  const alreadyThere =
    target.container.kind === targetContainer.kind &&
    target.container.key === targetContainer.key &&
    target.parentId === targetParentId;
  if (alreadyThere) return { items, deletedPaths: [] };

  const subtreeIds = collectSubtreeIds(items, id);
  if (targetParentId && subtreeIds.has(targetParentId)) {
    return { items, deletedPaths: [] };
  }

  const destSiblings = getSiblings(items, targetContainer, targetParentId);
  const newOrder = nextOrderAtEnd(destSiblings.map((s) => s.order));
  const nowIso = new Date().toISOString();
  const fromLabel = containerDisplayLabel(target.container);
  const toLabel = containerDisplayLabel(targetContainer);

  const { updated, oldPaths } = moveSubtreePaths(
    items,
    id,
    targetContainer,
    targetParentId
  );

  const updatedById = new Map(updated.map((u) => [u.id, u]));
  const nextItems = items.map((item) => {
    const moved = updatedById.get(item.id);
    if (!moved) return item;
    if (moved.id === id) {
      return {
        ...moved,
        order: newOrder,
        history: [
          ...moved.history,
          { action: 'moved' as const, timestamp: nowIso, from: fromLabel, to: toLabel },
        ],
      };
    }
    return moved;
  });

  const resolved = resolveTreeParents(nextItems);
  return {
    items: maybeRenumberGroup(resolved, targetContainer, targetParentId),
    deletedPaths: oldPaths,
  };
};

export const reorderItemInSiblings = (
  items: JournalItem[],
  id: string,
  direction: 'up' | 'down'
): JournalItem[] => {
  const target = items.find((i) => i.id === id);
  if (!target) return items;

  const siblings = getSiblings(items, target.container, target.parentId);
  const idx = siblings.findIndex((s) => s.id === id);
  if (idx === -1) return items;

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return items;

  let newOrder: number;
  if (direction === 'up') {
    const before = swapIdx > 0 ? siblings[swapIdx - 1].order : null;
    const after = siblings[swapIdx].order;
    newOrder = midpointOrder(before, after);
  } else {
    const before = siblings[swapIdx].order;
    const after = swapIdx < siblings.length - 1 ? siblings[swapIdx + 1].order : null;
    newOrder = midpointOrder(before, after);
  }

  const nextItems = items.map((item) =>
    item.id === id
      ? { ...item, order: newOrder, dirty: true, updatedAt: Date.now() }
      : item
  );
  return maybeRenumberGroup(nextItems, target.container, target.parentId);
};

export const deleteJournalSubtree = (
  items: JournalItem[],
  rootId: string
): { items: JournalItem[]; deletedIds: string[]; deletedPaths: string[] } => {
  const toDelete = collectSubtreeIds(items, rootId);
  const deletedIds: string[] = [];
  const deletedPaths: string[] = [];
  const kept: JournalItem[] = [];

  for (const item of items) {
    if (toDelete.has(item.id)) {
      deletedIds.push(item.id);
      deletedPaths.push(item.path);
    } else {
      kept.push(item);
    }
  }

  return { items: resolveTreeParents(kept), deletedIds, deletedPaths };
};
