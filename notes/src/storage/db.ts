import { AppSettings, JournalItem, SyncMeta } from '../core/types';

const DB_NAME = 'daily-notes-db';
const DB_VERSION = 1;
const SETTINGS_KEY = 'daily-notes-settings-v1';

const DEFAULT_META: SyncMeta = {
  lastCommitSha: null,
  lastTreeSha: null,
  lastPulledAt: null,
  lastPushedAt: null,
  conflicts: [],
  showDone: true,
};

export const DEFAULT_SETTINGS: AppSettings = {
  githubPat: '',
  githubOwner: '',
  githubRepo: '',
  autoSync: true,
  geminiApiKey: '',
  geminiModel: 'gemini-4-hydrogen',
  googleClientId: '',
};

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const openDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('items')) {
        db.createObjectStore('items', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingDeletes')) {
        db.createObjectStore('pendingDeletes', { keyPath: 'path' });
      }
      if (!db.objectStoreNames.contains('syncMeta')) {
        db.createObjectStore('syncMeta', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('remoteNonItems')) {
        db.createObjectStore('remoteNonItems', { keyPath: 'path' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const reqToPromise = <T>(req: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const txDone = (tx: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

export const loadAllItems = async (): Promise<JournalItem[]> => {
  const db = await openDb();
  const tx = db.transaction('items', 'readonly');
  const items = await reqToPromise(tx.objectStore('items').getAll());
  db.close();
  return items as JournalItem[];
};

export const putItems = async (items: JournalItem[]): Promise<void> => {
  if (items.length === 0) return;
  const db = await openDb();
  const tx = db.transaction('items', 'readwrite');
  const store = tx.objectStore('items');
  for (const item of items) {
    store.put(item);
  }
  await txDone(tx);
  db.close();
};

export const replaceAllItems = async (items: JournalItem[]): Promise<void> => {
  const db = await openDb();
  const tx = db.transaction('items', 'readwrite');
  const store = tx.objectStore('items');
  store.clear();
  for (const item of items) {
    store.put(item);
  }
  await txDone(tx);
  db.close();
};

export const deleteItemsById = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;
  const db = await openDb();
  const tx = db.transaction('items', 'readwrite');
  const store = tx.objectStore('items');
  for (const id of ids) {
    store.delete(id);
  }
  await txDone(tx);
  db.close();
};

export const loadPendingDeletes = async (): Promise<string[]> => {
  const db = await openDb();
  const tx = db.transaction('pendingDeletes', 'readonly');
  const rows = (await reqToPromise(
    tx.objectStore('pendingDeletes').getAll()
  )) as { path: string }[];
  db.close();
  return rows.map((r) => r.path);
};

export const addPendingDeletes = async (paths: string[]): Promise<void> => {
  if (paths.length === 0) return;
  const db = await openDb();
  const tx = db.transaction('pendingDeletes', 'readwrite');
  const store = tx.objectStore('pendingDeletes');
  for (const path of paths) {
    store.put({ path });
  }
  await txDone(tx);
  db.close();
};

export const clearPendingDeletes = async (): Promise<void> => {
  const db = await openDb();
  const tx = db.transaction('pendingDeletes', 'readwrite');
  tx.objectStore('pendingDeletes').clear();
  await txDone(tx);
  db.close();
};

export const loadSyncMeta = async (): Promise<SyncMeta> => {
  const db = await openDb();
  const tx = db.transaction('syncMeta', 'readonly');
  const row = (await reqToPromise(
    tx.objectStore('syncMeta').get('meta')
  )) as { key: string; value: SyncMeta } | undefined;
  db.close();
  return row ? { ...DEFAULT_META, ...row.value } : { ...DEFAULT_META };
};

export const saveSyncMeta = async (meta: SyncMeta): Promise<void> => {
  const db = await openDb();
  const tx = db.transaction('syncMeta', 'readwrite');
  tx.objectStore('syncMeta').put({ key: 'meta', value: meta });
  await txDone(tx);
  db.close();
};
