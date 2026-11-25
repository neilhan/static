import { parseItemMarkdown, serializeItemMarkdown } from '../core/markdown';
import { reconcilePull, RemoteParsedFile } from '../core/merge';
import { isNonItemJournalFile } from '../core/tree';
import { AppSettings, ConflictRecord, JournalItem, SyncMeta } from '../core/types';

type GitTreeEntry = {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
};

const apiFetch = async <T>(
  settings: AppSettings,
  endpoint: string,
  init?: RequestInit
): Promise<T> => {
  const url = `https://api.github.com/repos/${settings.githubOwner}/${settings.githubRepo}${endpoint}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${settings.githubPat}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
};

const decodeBase64Utf8 = (b64: string): string => {
  const clean = b64.replace(/\s+/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
};

export type PullOutcome = {
  items: JournalItem[];
  meta: SyncMeta;
  newConflicts: ConflictRecord[];
  downloadedCount: number;
};

export const pullFromGitHub = async (
  settings: AppSettings,
  localItems: JournalItem[],
  meta: SyncMeta
): Promise<PullOutcome> => {
  if (
    !settings.githubOwner.trim() ||
    !settings.githubRepo.trim() ||
    !settings.githubPat.trim()
  ) {
    throw new Error('GitHub owner, repo, and PAT are required in Settings.');
  }

  const ref = await apiFetch<{ object: { sha: string } }>(
    settings,
    '/git/refs/heads/main'
  );
  const headCommitSha = ref.object.sha;

  if (meta.lastCommitSha && meta.lastCommitSha === headCommitSha) {
    return {
      items: localItems,
      meta: { ...meta, lastPulledAt: new Date().toISOString() },
      newConflicts: [],
      downloadedCount: 0,
    };
  }

  const commit = await apiFetch<{ tree: { sha: string } }>(
    settings,
    `/git/commits/${headCommitSha}`
  );
  const headTreeSha = commit.tree.sha;

  const treeRes = await apiFetch<{ tree: GitTreeEntry[] }>(
    settings,
    `/git/trees/${headTreeSha}?recursive=1`
  );

  const remoteJournalBlobs = treeRes.tree.filter(
    (entry) => entry.type === 'blob' && !isNonItemJournalFile(entry.path)
  );
  const allRemotePaths = new Set(remoteJournalBlobs.map((b) => b.path));

  const localShaByPath = new Map<string, string>();
  for (const item of localItems) {
    if (item.remoteSha) {
      localShaByPath.set(item.path, item.remoteSha);
    }
  }

  const toFetch = remoteJournalBlobs.filter(
    (blob) => localShaByPath.get(blob.path) !== blob.sha
  );

  const remoteFiles: RemoteParsedFile[] = [];
  // Fetch changed blobs in small concurrent batches
  const BATCH_SIZE = 8;
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    const fetched = await Promise.all(
      batch.map(async (blob) => {
        const blobData = await apiFetch<{ content: string }>(
          settings,
          `/git/blobs/${blob.sha}`
        );
        const raw = decodeBase64Utf8(blobData.content);
        const parsed = parseItemMarkdown(raw, blob.path);
        return parsed ? { path: blob.path, sha: blob.sha, parsed } : null;
      })
    );
    for (const item of fetched) {
      if (item) remoteFiles.push(item);
    }
  }

  const reconciled = reconcilePull(localItems, remoteFiles, allRemotePaths);
  const mergedConflicts = [...meta.conflicts, ...reconciled.conflicts];

  return {
    items: reconciled.items,
    meta: {
      ...meta,
      lastCommitSha: headCommitSha,
      lastTreeSha: headTreeSha,
      lastPulledAt: new Date().toISOString(),
      conflicts: mergedConflicts,
    },
    newConflicts: reconciled.conflicts,
    downloadedCount: toFetch.length,
  };
};

export type PushOutcome = {
  items: JournalItem[];
  meta: SyncMeta;
  pushedCount: number;
  deletedCount: number;
};

export const pushToGitHub = async (
  settings: AppSettings,
  localItems: JournalItem[],
  pendingDeletes: string[],
  meta: SyncMeta
): Promise<PushOutcome> => {
  if (
    !settings.githubOwner.trim() ||
    !settings.githubRepo.trim() ||
    !settings.githubPat.trim()
  ) {
    throw new Error('GitHub owner, repo, and PAT are required in Settings.');
  }

  let currentItems = localItems;
  let currentMeta = meta;

  const ref = await apiFetch<{ object: { sha: string } }>(
    settings,
    '/git/refs/heads/main'
  );
  if (currentMeta.lastCommitSha !== ref.object.sha) {
    const pulled = await pullFromGitHub(settings, currentItems, currentMeta);
    currentItems = pulled.items;
    currentMeta = pulled.meta;
  }

  const dirtyItems = currentItems.filter((item) => item.dirty);
  const occupiedPaths = new Set(currentItems.map((item) => item.path));
  const deletesToApply = Array.from(new Set(pendingDeletes)).filter(
    (p) => !occupiedPaths.has(p) && !isNonItemJournalFile(p)
  );

  if (dirtyItems.length === 0 && deletesToApply.length === 0) {
    return {
      items: currentItems,
      meta: currentMeta,
      pushedCount: 0,
      deletedCount: 0,
    };
  }

  const blobResults = await Promise.all(
    dirtyItems.map(async (item) => {
      const content = serializeItemMarkdown(item);
      const res = await apiFetch<{ sha: string }>(settings, '/git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content, encoding: 'utf-8' }),
      });
      return { id: item.id, path: item.path, sha: res.sha };
    })
  );

  const treeEntries: Array<{
    path: string;
    mode: string;
    type: 'blob';
    sha: string | null;
  }> = [
    ...blobResults.map((b) => ({
      path: b.path,
      mode: '100644',
      type: 'blob' as const,
      sha: b.sha,
    })),
    ...deletesToApply.map((path) => ({
      path,
      mode: '100644',
      type: 'blob' as const,
      sha: null,
    })),
  ];

  const newTree = await apiFetch<{ sha: string }>(settings, '/git/trees', {
    method: 'POST',
    body: JSON.stringify({
      ...(currentMeta.lastTreeSha ? { base_tree: currentMeta.lastTreeSha } : {}),
      tree: treeEntries,
    }),
  });

  const message = `Journal sync (${dirtyItems.length} updated, ${deletesToApply.length} deleted)`;
  const parentSha = currentMeta.lastCommitSha ?? ref.object.sha;

  const newCommit = await apiFetch<{ sha: string }>(settings, '/git/commits', {
    method: 'POST',
    body: JSON.stringify({
      message,
      tree: newTree.sha,
      parents: [parentSha],
    }),
  });

  await apiFetch(settings, '/git/refs/heads/main', {
    method: 'PATCH',
    body: JSON.stringify({ sha: newCommit.sha }),
  });

  const shaById = new Map(blobResults.map((b) => [b.id, b.sha]));
  const cleanItems = currentItems.map((item) =>
    shaById.has(item.id)
      ? { ...item, dirty: false, remoteSha: shaById.get(item.id)! }
      : item
  );

  return {
    items: cleanItems,
    meta: {
      ...currentMeta,
      lastCommitSha: newCommit.sha,
      lastTreeSha: newTree.sha,
      lastPushedAt: new Date().toISOString(),
    },
    pushedCount: dirtyItems.length,
    deletedCount: deletesToApply.length,
  };
};
