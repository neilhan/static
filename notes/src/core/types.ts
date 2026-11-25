export type ItemStatus = 'open' | 'done' | 'archived';

export type HistoryAction =
  | 'added'
  | 'moved'
  | 'snoozed'
  | 'done'
  | 'reopened'
  | 'edited'
  | 'archived'
  | 'unarchived';

export type HistoryEntry = {
  action: HistoryAction;
  timestamp: string;
  from: string;
  to: string;
};

export type ContainerKind = 'day' | 'week' | 'month' | 'year' | 'notes';

export type ContainerRef = {
  kind: ContainerKind;
  key: string; // e.g. '2026-11-24', 'week-2026-11-23', '2026-11', '2026', 'notes'
};

export type JournalItem = {
  id: string;
  slug: string;
  status: ItemStatus;
  order: number;
  created: string; // YYYY-MM-DD
  title: string;
  body: string;
  history: HistoryEntry[];
  time?: string; // HH:MM
  collapsed?: boolean;
  calendar?: string;
  calendarUrl?: string;
  path: string; // e.g. 'journal/2026/2026-11-24/my-item.md'
  parentId: string | null;
  container: ContainerRef;
  remoteSha?: string | null;
  dirty: boolean;
  updatedAt: number;
};

export type ConflictRecord = {
  id: string;
  title: string;
  path: string;
  detectedAt: string;
  remoteItem?: JournalItem;
};

export type SyncMeta = {
  lastCommitSha: string | null;
  lastTreeSha: string | null;
  lastPulledAt: string | null;
  lastPushedAt: string | null;
  conflicts: ConflictRecord[];
  showDone: boolean;
};

export type AppSettings = {
  githubPat: string;
  githubOwner: string;
  githubRepo: string;
  autoSync: boolean;
  geminiApiKey: string;
  geminiModel: string;
  googleClientId: string;
};
