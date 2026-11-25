import { ConflictRecord, JournalItem } from './types';
import { ParsedMarkdownItem } from './markdown';
import { parseJournalPath, resolveTreeParents } from './tree';

export type RemoteParsedFile = {
  path: string;
  sha: string;
  parsed: ParsedMarkdownItem;
};

export type ReconcilePullResult = {
  items: JournalItem[];
  conflicts: ConflictRecord[];
  removedIds: string[];
};

/**
 * Merges remote journal items into local items by `id` first (not path),
 * preserving local dirty edits and flagging conflicts when both sides changed.
 */
export const reconcilePull = (
  localItems: JournalItem[],
  remoteFiles: RemoteParsedFile[],
  allRemoteItemPaths: Set<string>,
  nowIso = new Date().toISOString()
): ReconcilePullResult => {
  const localById = new Map<string, JournalItem>();
  for (const item of localItems) {
    localById.set(item.id, item);
  }

  const remoteById = new Map<string, RemoteParsedFile>();
  for (const rf of remoteFiles) {
    remoteById.set(rf.parsed.id, rf);
  }

  const nextById = new Map<string, JournalItem>();
  const conflicts: ConflictRecord[] = [];
  const removedIds: string[] = [];

  // 1. Process all local items first
  for (const local of localItems) {
    const remote = remoteById.get(local.id);

    if (remote) {
      if (!local.dirty) {
        // Clean local item: accept remote (including moves/edits)
        const parsedPath = parseJournalPath(remote.path);
        nextById.set(local.id, {
          ...remote.parsed,
          path: remote.path,
          container: parsedPath.container ?? local.container,
          parentId: null,
          remoteSha: remote.sha,
          dirty: false,
          updatedAt: Date.now(),
        });
      } else {
        // Dirty local item: keep local edits, check for conflict
        if (local.remoteSha && local.remoteSha !== remote.sha) {
          conflicts.push({
            id: local.id,
            title: local.title,
            path: local.path,
            detectedAt: nowIso,
          });
        }
        nextById.set(local.id, {
          ...local,
          remoteSha: remote.sha,
        });
      }
      continue;
    }

    // Remote didn't send a changed blob for this id:
    // either it's unchanged on remote (path still in allRemoteItemPaths) or deleted remotely.
    if (local.dirty || allRemoteItemPaths.has(local.path)) {
      nextById.set(local.id, local);
    } else {
      removedIds.push(local.id);
    }
  }

  // 2. Add brand-new remote items not present locally
  for (const rf of remoteFiles) {
    if (nextById.has(rf.parsed.id)) continue;
    const parsedPath = parseJournalPath(rf.path);
    if (!parsedPath.container) continue;

    nextById.set(rf.parsed.id, {
      ...rf.parsed,
      path: rf.path,
      container: parsedPath.container,
      parentId: null,
      remoteSha: rf.sha,
      dirty: false,
      updatedAt: Date.now(),
    });
  }

  return {
    items: resolveTreeParents(Array.from(nextById.values())),
    conflicts,
    removedIds,
  };
};
