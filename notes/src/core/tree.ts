import { ContainerRef, JournalItem } from './types';

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const WEEK_RE = /^week-(\d{4}-\d{2}-\d{2})$/;
const MONTH_RE = /^\d{4}-\d{2}$/;
const YEAR_FOLDER_RE = /^\d{4}$/;

export type ParsedJournalPath = {
  isJournalItem: boolean;
  container: ContainerRef | null;
  parentPath: string | null;
  slug: string;
};

export const isNonItemJournalFile = (path: string): boolean => {
  if (!path.startsWith('journal/')) return true;
  const filename = path.split('/').pop() ?? '';
  return filename.toLowerCase() === 'readme.md' || !filename.endsWith('.md');
};

export const parseJournalPath = (path: string): ParsedJournalPath => {
  if (isNonItemJournalFile(path)) {
    return { isJournalItem: false, container: null, parentPath: null, slug: '' };
  }

  const parts = path.split('/');
  const filename = parts[parts.length - 1];
  const slug = filename.replace(/\.md$/i, '');

  // journal/notes/...
  if (parts[1] === 'notes' && parts.length >= 3) {
    const container: ContainerRef = { kind: 'notes', key: 'notes' };
    const parentPath =
      parts.length > 3 ? `${parts.slice(0, -1).join('/')}.md` : null;
    return { isJournalItem: true, container, parentPath, slug };
  }

  // journal/<year>/<container>/...
  if (parts.length >= 4 && YEAR_FOLDER_RE.test(parts[1])) {
    const year = parts[1];
    const containerSeg = parts[2];
    let container: ContainerRef | null = null;

    if (DAY_RE.test(containerSeg)) {
      container = { kind: 'day', key: containerSeg };
    } else if (WEEK_RE.test(containerSeg)) {
      container = { kind: 'week', key: containerSeg };
    } else if (MONTH_RE.test(containerSeg)) {
      container = { kind: 'month', key: containerSeg };
    } else if (containerSeg === 'year') {
      container = { kind: 'year', key: year };
    }

    if (container) {
      const parentPath =
        parts.length > 4 ? `${parts.slice(0, -1).join('/')}.md` : null;
      return { isJournalItem: true, container, parentPath, slug };
    }
  }

  return { isJournalItem: false, container: null, parentPath: null, slug };
};

export const containerBaseDir = (container: ContainerRef): string => {
  if (container.kind === 'notes') {
    return 'journal/notes';
  }
  const year =
    container.kind === 'week'
      ? container.key.replace(/^week-/, '').slice(0, 4)
      : container.key.slice(0, 4);
  if (container.kind === 'year') {
    return `journal/${year}/year`;
  }
  return `journal/${year}/${container.key}`;
};

export const buildItemPath = (
  container: ContainerRef,
  parentPath: string | null,
  slug: string
): string => {
  if (parentPath) {
    const siblingDir = parentPath.replace(/\.md$/i, '');
    return `${siblingDir}/${slug}.md`;
  }
  return `${containerBaseDir(container)}/${slug}.md`;
};

export const containerToSortDate = (container: ContainerRef): string => {
  switch (container.kind) {
    case 'day':
      return container.key;
    case 'week':
      return container.key.replace(/^week-/, '');
    case 'month':
      return `${container.key}-01`;
    case 'year':
      return `${container.key}-01-01`;
    case 'notes':
      return '9999-12-31';
  }
};

export const containerDisplayLabel = (container: ContainerRef): string => {
  switch (container.kind) {
    case 'day':
      return container.key;
    case 'week':
      return `Week of ${container.key.replace(/^week-/, '')}`;
    case 'month':
      return container.key;
    case 'year':
      return container.key;
    case 'notes':
      return 'Notes';
  }
};

export const resolveTreeParents = (items: JournalItem[]): JournalItem[] => {
  const byPath = new Map<string, JournalItem>();
  for (const item of items) {
    byPath.set(item.path, item);
  }

  return items.map((item) => {
    const parsed = parseJournalPath(item.path);
    const parent = parsed.parentPath ? byPath.get(parsed.parentPath) : undefined;
    return {
      ...item,
      container: parsed.container ?? item.container,
      parentId: parent ? parent.id : null,
    };
  });
};

export const collectSubtreeIds = (
  items: JournalItem[],
  rootId: string
): Set<string> => {
  const ids = new Set<string>([rootId]);
  let added = true;
  while (added) {
    added = false;
    for (const item of items) {
      if (item.parentId && ids.has(item.parentId) && !ids.has(item.id)) {
        ids.add(item.id);
        added = true;
      }
    }
  }
  return ids;
};

export const moveSubtreePaths = (
  items: JournalItem[],
  rootId: string,
  targetContainer: ContainerRef,
  targetParentId: string | null
): { updated: JournalItem[]; oldPaths: string[] } => {
  const byId = new Map(items.map((item) => [item.id, item]));
  const root = byId.get(rootId);
  if (!root) {
    return { updated: [], oldPaths: [] };
  }

  const targetParent = targetParentId ? byId.get(targetParentId) ?? null : null;
  const newRootPath = buildItemPath(
    targetContainer,
    targetParent ? targetParent.path : null,
    root.slug
  );

  const oldRootPrefix = root.path.replace(/\.md$/i, '');
  const newRootPrefix = newRootPath.replace(/\.md$/i, '');
  const subtreeIds = collectSubtreeIds(items, rootId);

  const updated: JournalItem[] = [];
  const oldPaths: string[] = [];

  for (const item of items) {
    if (!subtreeIds.has(item.id)) continue;
    oldPaths.push(item.path);

    const nextPath =
      item.id === rootId
        ? newRootPath
        : item.path.startsWith(`${oldRootPrefix}/`)
          ? `${newRootPrefix}${item.path.slice(oldRootPrefix.length)}`
          : item.path;

    updated.push({
      ...item,
      path: nextPath,
      container: targetContainer,
      parentId: item.id === rootId ? targetParentId : item.parentId,
      dirty: true,
      updatedAt: Date.now(),
    });
  }

  return { updated, oldPaths };
};
