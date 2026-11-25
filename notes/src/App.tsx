import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createExecutorFromItems } from './ai/gemini';
import { ChatBubble } from './components/ChatBubble';
import { OutlineRow } from './components/OutlineRow';
import { SettingsModal } from './components/SettingsModal';
import { ZoomView } from './components/ZoomView';
import { reconcileCalendarEvents } from './core/calendar';
import { containerDisplayLabel, containerToSortDate, resolveTreeParents } from './core/tree';
import {
  AppSettings,
  ContainerRef,
  ItemStatus,
  JournalItem,
  SyncMeta,
} from './core/types';
import {
  addDays,
  createJournalItem,
  deleteJournalSubtree,
  getTodayDateStr,
  moveJournalItem,
  reorderItemInSiblings,
  setItemStatus,
  toggleItemCollapsed,
  updateItemContent,
} from './state/journalActions';
import {
  addPendingDeletes,
  clearPendingDeletes,
  DEFAULT_SETTINGS,
  loadAllItems,
  loadPendingDeletes,
  loadSettings,
  loadSyncMeta,
  replaceAllItems,
  saveSettings,
  saveSyncMeta,
} from './storage/db';
import { fetchPrimaryCalendarEvents, requestCalendarToken } from './sync/gcal';
import { pullFromGitHub, pushToGitHub } from './sync/github';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const todayStr = getTodayDateStr(settings.timeZone);

  const [items, setItems] = useState<JournalItem[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);
  const [meta, setMeta] = useState<SyncMeta>({
    lastCommitSha: null,
    lastTreeSha: null,
    lastPulledAt: null,
    lastPushedAt: null,
    conflicts: [],
    showDone: true,
  });
  const [loaded, setLoaded] = useState(false);

  const [selectedDay, setSelectedDay] = useState(todayStr);
  const [zoomStack, setZoomStack] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [overdueOpen, setOverdueOpen] = useState(false);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const itemsRef = useRef<JournalItem[]>(items);
  itemsRef.current = items;
  const pendingDeletesRef = useRef<string[]>(pendingDeletes);
  pendingDeletesRef.current = pendingDeletes;
  const metaRef = useRef<SyncMeta>(meta);
  metaRef.current = meta;
  const settingsRef = useRef<AppSettings>(settings);
  settingsRef.current = settings;
  const syncingRef = useRef<boolean>(false);
  const autoPushTimerRef = useRef<number | null>(null);
  const aiSnapshotRef = useRef<{ items: JournalItem[]; deletes: string[] } | null>(
    null
  );
  const datedSectionRef = useRef<HTMLElement | null>(null);
  const notesSectionRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    void (async () => {
      const [dbItems, dbDeletes, dbMeta] = await Promise.all([
        loadAllItems(),
        loadPendingDeletes(),
        loadSyncMeta(),
      ]);
      setItems(dbItems);
      setPendingDeletes(dbDeletes);
      setMeta(dbMeta);
      setLoaded(true);
    })();
  }, []);

  const persistItems = useCallback(
    async (nextItems: JournalItem[], newDeletes: string[] = []) => {
      setItems(nextItems);
      itemsRef.current = nextItems;
      await replaceAllItems(nextItems);
      if (newDeletes.length > 0) {
        await addPendingDeletes(newDeletes);
        setPendingDeletes((prev) => Array.from(new Set([...prev, ...newDeletes])));
      }
    },
    []
  );

  const updateMeta = useCallback(async (nextMeta: SyncMeta) => {
    setMeta(nextMeta);
    await saveSyncMeta(nextMeta);
  }, []);

  const handleCreate = (
    container: ContainerRef,
    title: string,
    parentId: string | null = null,
    body?: string,
    time?: string
  ) => {
    const { items: nextItems, created } = createJournalItem(itemsRef.current, {
      title,
      body,
      container,
      parentId,
      time,
    });
    void persistItems(nextItems);
    return created;
  };

  const handleEditContent = (
    id: string,
    patch: { title?: string; body?: string; time?: string | undefined }
  ) => {
    void persistItems(updateItemContent(itemsRef.current, id, patch));
  };

  const handleToggleCollapse = (id: string) => {
    void persistItems(toggleItemCollapsed(itemsRef.current, id));
  };

  const handleSetStatus = (id: string, status: ItemStatus) => {
    void persistItems(setItemStatus(itemsRef.current, id, status));
  };

  const handleMove = (id: string, target: ContainerRef) => {
    const { items: nextItems, deletedPaths } = moveJournalItem(
      itemsRef.current,
      id,
      target,
      null
    );
    void persistItems(nextItems, deletedPaths);
  };

  const handleReorder = (id: string, direction: 'up' | 'down') => {
    void persistItems(reorderItemInSiblings(itemsRef.current, id, direction));
  };

  const handleDelete = (id: string) => {
    const { items: nextItems, deletedPaths } = deleteJournalSubtree(
      itemsRef.current,
      id
    );
    void persistItems(nextItems, deletedPaths);
    setZoomStack((stack) => stack.filter((z) => z !== id));
  };

  const runCalendarSync = async (
    currentItems: JournalItem[],
    allowPopup = false
  ): Promise<{ items: JournalItem[]; deletedPaths: string[] }> => {
    if (!settingsRef.current.googleClientId.trim()) {
      return { items: currentItems, deletedPaths: [] };
    }
    try {
      const token = await requestCalendarToken(
        settingsRef.current.googleClientId,
        allowPopup
      );
      const events = await fetchPrimaryCalendarEvents(
        token,
        todayStr,
        settingsRef.current.timeZone
      );
      const res = reconcileCalendarEvents(currentItems, events, todayStr);
      const deletedSet = new Set(res.deletedIds);
      const upsertedMap = new Map(res.upserted.map((u) => [u.id, u]));
      const merged = currentItems
        .filter((i) => !deletedSet.has(i.id))
        .map((i) => upsertedMap.get(i.id) ?? i);
      for (const u of res.upserted) {
        if (!currentItems.some((i) => i.id === u.id)) {
          merged.push(u);
        }
      }
      return { items: merged, deletedPaths: res.deletedPaths };
    } catch {
      // Calendar failure never blocks pull or push
      return { items: currentItems, deletedPaths: [] };
    }
  };

  const handleConnectCalendar = async () => {
    if (!settingsRef.current.googleClientId.trim() || !navigator.onLine) return;
    setSyncStatus('Connecting Google Calendar…');
    try {
      const token = await requestCalendarToken(
        settingsRef.current.googleClientId,
        true
      );
      const events = await fetchPrimaryCalendarEvents(
        token,
        todayStr,
        settingsRef.current.timeZone
      );
      const res = reconcileCalendarEvents(itemsRef.current, events, todayStr);
      const deletedSet = new Set(res.deletedIds);
      const upsertedMap = new Map(res.upserted.map((u) => [u.id, u]));
      const merged = itemsRef.current
        .filter((i) => !deletedSet.has(i.id))
        .map((i) => upsertedMap.get(i.id) ?? i);
      for (const u of res.upserted) {
        if (!itemsRef.current.some((i) => i.id === u.id)) {
          merged.push(u);
        }
      }
      await persistItems(merged, res.deletedPaths);
      setSyncStatus(`Calendar synced (${events.length} events)`);
    } catch (err) {
      setSyncStatus(err instanceof Error ? err.message : 'Calendar auth failed');
    }
  };

  const hasGitHubConfig = (s: AppSettings): boolean =>
    Boolean(s.githubOwner.trim() && s.githubRepo.trim() && s.githubPat.trim());

  const handlePull = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setSyncing(true);
    setSyncStatus('Pulling from GitHub…');
    try {
      const pulled = await pullFromGitHub(
        settingsRef.current,
        itemsRef.current,
        metaRef.current
      );
      const cal = await runCalendarSync(pulled.items);
      await persistItems(cal.items, cal.deletedPaths);
      await updateMeta(pulled.meta);
      setSyncStatus(`Pulled (${pulled.downloadedCount} updated)`);
    } catch (err) {
      setSyncStatus(err instanceof Error ? err.message : 'Pull failed');
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [persistItems, updateMeta]);

  const handlePush = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setSyncing(true);
    setSyncStatus('Pushing to GitHub…');
    try {
      const cal = await runCalendarSync(itemsRef.current);
      const allDeletes = Array.from(
        new Set([...pendingDeletesRef.current, ...cal.deletedPaths])
      );
      const pushed = await pushToGitHub(
        settingsRef.current,
        cal.items,
        allDeletes,
        metaRef.current
      );
      await replaceAllItems(pushed.items);
      setItems(pushed.items);
      itemsRef.current = pushed.items;
      await clearPendingDeletes();
      setPendingDeletes([]);
      pendingDeletesRef.current = [];
      await updateMeta(pushed.meta);
      setSyncStatus(
        pushed.pushedCount === 0 && pushed.deletedCount === 0
          ? 'Already up to date'
          : `Pushed ${pushed.pushedCount} updated, ${pushed.deletedCount} deleted`
      );
    } catch (err) {
      setSyncStatus(err instanceof Error ? err.message : 'Push failed');
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [updateMeta]);

  const AUTO_PULL_MS = 15 * 60 * 1000;
  const AUTO_PUSH_DEBOUNCE_MS = 45 * 1000;

  const maybeAutoPull = useCallback(async () => {
    const s = settingsRef.current;
    if (!loaded || !s.autoSync || !hasGitHubConfig(s) || !navigator.onLine) return;
    if (syncingRef.current) return;
    const lastPulled = metaRef.current.lastPulledAt
      ? Date.parse(metaRef.current.lastPulledAt)
      : 0;
    if (Date.now() - lastPulled < AUTO_PULL_MS) return;
    await handlePull();
  }, [loaded, handlePull]);

  const maybeAutoPushNow = useCallback(async () => {
    const s = settingsRef.current;
    if (!loaded || !s.autoSync || !hasGitHubConfig(s) || !navigator.onLine) return;
    if (syncingRef.current || metaRef.current.conflicts.length > 0) return;
    const hasDirty =
      itemsRef.current.some((i) => i.dirty) || pendingDeletesRef.current.length > 0;
    if (!hasDirty) return;
    await handlePush();
  }, [loaded, handlePush]);

  const dirtyCount = useMemo(
    () => items.filter((i) => i.dirty).length + pendingDeletes.length,
    [items, pendingDeletes]
  );

  // Auto-pull on load, foreground, online, and every 15 minutes
  useEffect(() => {
    if (!loaded) return;
    void maybeAutoPull();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void maybeAutoPull();
      } else if (document.visibilityState === 'hidden') {
        if (autoPushTimerRef.current !== null) {
          window.clearTimeout(autoPushTimerRef.current);
          autoPushTimerRef.current = null;
        }
        void maybeAutoPushNow();
      }
    };

    const onReconnect = () => {
      void (async () => {
        await maybeAutoPull();
        await maybeAutoPushNow();
      })();
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void maybeAutoPull();
      }
    }, AUTO_PULL_MS);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onReconnect);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onReconnect);
    };
  }, [loaded, maybeAutoPull, maybeAutoPushNow]);

  // Debounced auto-push 45s after edits
  useEffect(() => {
    if (autoPushTimerRef.current !== null) {
      window.clearTimeout(autoPushTimerRef.current);
      autoPushTimerRef.current = null;
    }
    if (
      !loaded ||
      !isOnline ||
      !settings.autoSync ||
      !hasGitHubConfig(settings) ||
      dirtyCount === 0 ||
      meta.conflicts.length > 0
    ) {
      return;
    }

    autoPushTimerRef.current = window.setTimeout(() => {
      autoPushTimerRef.current = null;
      void maybeAutoPushNow();
    }, AUTO_PUSH_DEBOUNCE_MS);

    return () => {
      if (autoPushTimerRef.current !== null) {
        window.clearTimeout(autoPushTimerRef.current);
        autoPushTimerRef.current = null;
      }
    };
  }, [loaded, isOnline, settings, dirtyCount, meta.conflicts.length, maybeAutoPushNow]);

  const overdueItems = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.status === 'open' &&
            !i.calendar &&
            i.container.kind !== 'notes' &&
            containerToSortDate(i.container) < todayStr
        )
        .sort((a, b) =>
          containerToSortDate(a.container).localeCompare(
            containerToSortDate(b.container)
          )
        ),
    [items, todayStr]
  );

  const archivedItems = useMemo(
    () => items.filter((i) => i.status === 'archived'),
    [items]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return items.filter(
      (i) =>
        i.status !== 'archived' &&
        (i.title.toLowerCase().includes(q) || i.body.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const upcomingContainers = useMemo(() => {
    const map = new Map<string, ContainerRef>();
    for (const item of items) {
      if (item.status === 'archived' || item.parentId) continue;
      if (!meta.showDone && item.status === 'done') continue;
      if (item.container.kind === 'notes') continue;
      const sortDate = containerToSortDate(item.container);
      if (sortDate > selectedDay) {
        const key = `${item.container.kind}:${item.container.key}`;
        map.set(key, item.container);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      containerToSortDate(a).localeCompare(containerToSortDate(b))
    );
  }, [items, selectedDay, meta.showDone]);

  const notesRoots = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.container.kind === 'notes' &&
            !i.parentId &&
            i.status !== 'archived' &&
            (meta.showDone || i.status !== 'done')
        )
        .sort((a, b) => a.order - b.order),
    [items, meta.showDone]
  );

  const dayRoots = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.container.kind === 'day' &&
            i.container.key === selectedDay &&
            !i.parentId &&
            i.status !== 'archived' &&
            (meta.showDone || i.status !== 'done')
        )
        .sort((a, b) => a.order - b.order),
    [items, selectedDay, meta.showDone]
  );

  const hasOpenNotes = useMemo(
    () => items.some((i) => i.container.kind === 'notes' && i.status === 'open'),
    [items]
  );

  const activeZoomId = zoomStack[zoomStack.length - 1] ?? null;
  const activeZoomItem = activeZoomId
    ? items.find((i) => i.id === activeZoomId) ?? null
    : null;

  const geminiExecutor = useMemo(
    () =>
      createExecutorFromItems(() => itemsRef.current, todayStr, {
        create: ({ title, body, containerKind, containerKey, time }) =>
          handleCreate({ kind: containerKind, key: containerKey }, title, null, body, time),
        update: ({ id, title, body, time }) => {
          handleEditContent(id, { title, body, time });
          return itemsRef.current.find((i) => i.id === id) ?? null;
        },
        move: ({ id, containerKind, containerKey }) => {
          handleMove(id, { kind: containerKind, key: containerKey });
          return itemsRef.current.find((i) => i.id === id) ?? null;
        },
        setStatus: ({ id, status }) => {
          handleSetStatus(id, status);
          return itemsRef.current.find((i) => i.id === id) ?? null;
        },
        remove: (id) => {
          const exists = itemsRef.current.some((i) => i.id === id);
          if (exists) handleDelete(id);
          return exists;
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayStr]
  );

  if (!loaded) {
    return <div className="app-shell">Loading…</div>;
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand-row">
          <h1>Daily Notes</h1>
          <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? 'Online' : 'Offline'}
            {dirtyCount > 0 ? ` · ${dirtyCount} unsynced` : ''}
          </span>
        </div>

        <div className="top-controls">
          <input
            ref={searchInputRef}
            type="search"
            className="search-input"
            placeholder="Search (2+ chars)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className={`btn-sm ${meta.showDone ? 'active-pill' : ''}`}
            onClick={() => void updateMeta({ ...meta, showDone: !meta.showDone })}
          >
            ✓ Done
          </button>
          <button
            type="button"
            className="btn-sm"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </button>
        </div>
      </header>

      {!settings.githubPat && items.length === 0 && (
        <div className="setup-banner">
          <span>Connect your GitHub PAT in Settings to pull your journal, or start adding notes offline.</span>
          <button type="button" className="btn-sm" onClick={() => setSettingsOpen(true)}>
            Open Settings
          </button>
        </div>
      )}

      {activeZoomItem ? (
        <ZoomView
          item={activeZoomItem}
          allItems={items}
          showDone={meta.showDone}
          todayStr={todayStr}
          onBack={() => setZoomStack((s) => s.slice(0, -1))}
          onZoom={(id) => setZoomStack((s) => [...s, id])}
          onToggleCollapse={handleToggleCollapse}
          onEditContent={handleEditContent}
          onSetStatus={handleSetStatus}
          onAddSubItem={(parentId, title) => {
            const parent = items.find((i) => i.id === parentId);
            if (parent) handleCreate(parent.container, title, parentId);
          }}
          onReorder={handleReorder}
          onMove={handleMove}
          onDelete={handleDelete}
        />
      ) : searchQuery.trim().length >= 2 ? (
        <section className="search-results">
          <h2>Search results ({searchResults.length})</h2>
          {searchResults.map((res) => (
            <button
              key={res.id}
              type="button"
              className="search-card"
              onClick={() => {
                setSearchQuery('');
                setZoomStack([res.id]);
              }}
            >
              <span className="search-card-title">{res.title}</span>
              <span className="search-card-meta">
                {containerDisplayLabel(res.container)} · {res.status}
              </span>
            </button>
          ))}
        </section>
      ) : (
        <main className="main-list">
          {overdueItems.length > 0 && (
            <section className="overdue-section">
              <div className="section-header-row">
                <button
                  type="button"
                  className="collapse-header"
                  onClick={() => setOverdueOpen((v) => !v)}
                >
                  {overdueOpen ? '▾' : '▸'} Overdue ({overdueItems.length})
                </button>
                {overdueOpen && (
                  <div className="bulk-actions">
                    <button
                      type="button"
                      className="btn-sm"
                      onClick={() => {
                        let next = itemsRef.current;
                        for (const o of overdueItems) {
                          next = setItemStatus(next, o.id, 'done');
                        }
                        void persistItems(next);
                      }}
                    >
                      Mark all done
                    </button>
                    <button
                      type="button"
                      className="btn-sm"
                      onClick={() => {
                        let next = itemsRef.current;
                        for (const o of overdueItems) {
                          next = setItemStatus(next, o.id, 'archived');
                        }
                        void persistItems(next);
                      }}
                    >
                      Archive all
                    </button>
                  </div>
                )}
              </div>

              {overdueOpen &&
                overdueItems.map((item) => (
                  <div key={item.id} className="overdue-row">
                    <button
                      type="button"
                      className="overdue-title"
                      onClick={() => setZoomStack([item.id])}
                    >
                      <span className="overdue-date">{item.container.key}</span>
                      <span>{item.title}</span>
                    </button>
                    <div className="overdue-pills">
                      <button
                        type="button"
                        className="btn-sm"
                        onClick={() =>
                          handleMove(item.id, { kind: 'day', key: todayStr })
                        }
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        className="btn-sm"
                        onClick={() => handleSetStatus(item.id, 'done')}
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                ))}
            </section>
          )}

          <section ref={datedSectionRef} className="day-section">
            <div className="day-nav">
              <button
                type="button"
                className="btn-sm"
                onClick={() => setSelectedDay(addDays(selectedDay, -1))}
              >
                ‹
              </button>
              <button
                type="button"
                className="btn-sm"
                onClick={() => setSelectedDay(todayStr)}
              >
                Today
              </button>
              <button
                type="button"
                className="btn-sm"
                onClick={() => setSelectedDay(addDays(selectedDay, 1))}
              >
                ›
              </button>
              <input
                type="date"
                value={selectedDay}
                onChange={(e) => e.target.value && setSelectedDay(e.target.value)}
              />
            </div>

            {dayRoots.map((item) => (
              <OutlineRow
                key={item.id}
                item={item}
                allItems={items}
                showDone={meta.showDone}
                todayStr={todayStr}
                onZoom={(id) => setZoomStack([id])}
                onToggleCollapse={handleToggleCollapse}
                onEditTitle={(id, t) => handleEditContent(id, { title: t })}
                onSetStatus={handleSetStatus}
                onAddSubItem={(pid, t) =>
                  handleCreate({ kind: 'day', key: selectedDay }, t, pid)
                }
                onReorder={handleReorder}
                onMove={handleMove}
                onDelete={handleDelete}
              />
            ))}

            {addingFor === 'day' ? (
              <div className="inline-add-sub">
                <input
                  type="text"
                  placeholder="New item…"
                  value={newTitle}
                  autoFocus
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTitle.trim()) {
                      handleCreate({ kind: 'day', key: selectedDay }, newTitle.trim());
                      setNewTitle('');
                      setAddingFor(null);
                    }
                    if (e.key === 'Escape') {
                      setNewTitle('');
                      setAddingFor(null);
                    }
                  }}
                  onBlur={() => {
                    if (newTitle.trim()) {
                      handleCreate({ kind: 'day', key: selectedDay }, newTitle.trim());
                    }
                    setNewTitle('');
                    setAddingFor(null);
                  }}
                />
              </div>
            ) : (
              <button
                type="button"
                className="add-plus-btn"
                onClick={() => setAddingFor('day')}
              >
                +
              </button>
            )}
          </section>

          {upcomingContainers.map((container) => {
            const groupItems = items
              .filter(
                (i) =>
                  i.container.kind === container.kind &&
                  i.container.key === container.key &&
                  !i.parentId &&
                  i.status !== 'archived' &&
                  (meta.showDone || i.status !== 'done')
              )
              .sort((a, b) => a.order - b.order);

            return (
              <section
                key={`${container.kind}:${container.key}`}
                className="group-section"
              >
                <div className="group-header">
                  <h2>{containerDisplayLabel(container)}</h2>
                  {container.kind === 'day' && (
                    <button
                      type="button"
                      className="btn-sm btn-ghost"
                      onClick={() => setSelectedDay(container.key)}
                    >
                      Open day
                    </button>
                  )}
                </div>
                {groupItems.map((item) => (
                  <OutlineRow
                    key={item.id}
                    item={item}
                    allItems={items}
                    showDone={meta.showDone}
                    todayStr={todayStr}
                    onZoom={(id) => setZoomStack([id])}
                    onToggleCollapse={handleToggleCollapse}
                    onEditTitle={(id, t) => handleEditContent(id, { title: t })}
                    onSetStatus={handleSetStatus}
                    onAddSubItem={(pid, t) => handleCreate(container, t, pid)}
                    onReorder={handleReorder}
                    onMove={handleMove}
                    onDelete={handleDelete}
                  />
                ))}
              </section>
            );
          })}

          <section ref={notesSectionRef} className="group-section">
            <div className="group-header">
              <h2>Notes</h2>
            </div>
            {notesRoots.map((item) => (
              <OutlineRow
                key={item.id}
                item={item}
                allItems={items}
                showDone={meta.showDone}
                todayStr={todayStr}
                onZoom={(id) => setZoomStack([id])}
                onToggleCollapse={handleToggleCollapse}
                onEditTitle={(id, t) => handleEditContent(id, { title: t })}
                onSetStatus={handleSetStatus}
                onAddSubItem={(pid, t) =>
                  handleCreate({ kind: 'notes', key: 'notes' }, t, pid)
                }
                onReorder={handleReorder}
                onMove={handleMove}
                onDelete={handleDelete}
              />
            ))}
            {addingFor === 'notes' ? (
              <div className="inline-add-sub">
                <input
                  type="text"
                  placeholder="New note…"
                  value={newTitle}
                  autoFocus
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTitle.trim()) {
                      handleCreate({ kind: 'notes', key: 'notes' }, newTitle.trim());
                      setNewTitle('');
                      setAddingFor(null);
                    }
                    if (e.key === 'Escape') {
                      setNewTitle('');
                      setAddingFor(null);
                    }
                  }}
                  onBlur={() => {
                    if (newTitle.trim()) {
                      handleCreate({ kind: 'notes', key: 'notes' }, newTitle.trim());
                    }
                    setNewTitle('');
                    setAddingFor(null);
                  }}
                />
              </div>
            ) : (
              <button
                type="button"
                className="add-plus-btn"
                onClick={() => setAddingFor('notes')}
              >
                +
              </button>
            )}
          </section>

          {archivedItems.length > 0 && (
            <section className="archived-section">
              <button
                type="button"
                className="collapse-header"
                onClick={() => setArchivedOpen((v) => !v)}
              >
                {archivedOpen ? '▾' : '▸'} Archived ({archivedItems.length})
              </button>
              {archivedOpen &&
                archivedItems.map((item) => (
                  <div key={item.id} className="overdue-row">
                    <button
                      type="button"
                      className="overdue-title"
                      onClick={() => setZoomStack([item.id])}
                    >
                      {item.title}
                    </button>
                    <button
                      type="button"
                      className="btn-sm"
                      onClick={() => handleSetStatus(item.id, 'open')}
                    >
                      Unarchive
                    </button>
                  </div>
                ))}
            </section>
          )}
        </main>
      )}

      <footer className="sync-bar">
        {meta.conflicts.length > 0 && (
          <div className="conflict-list">
            {meta.conflicts.map((c) => (
              <div key={c.id} className="conflict-banner">
                <span>
                  Conflict on <strong>{c.title}</strong> (local kept)
                </span>
                <div className="bulk-actions">
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={() =>
                      void updateMeta({
                        ...meta,
                        conflicts: meta.conflicts.filter((x) => x.id !== c.id),
                      })
                    }
                  >
                    Keep Local
                  </button>
                  {c.remoteItem && (
                    <button
                      type="button"
                      className="btn-sm"
                      onClick={() => {
                        const remote = c.remoteItem!;
                        const nextItems = resolveTreeParents(
                          itemsRef.current.map((item) =>
                            item.id === c.id ? remote : item
                          )
                        );
                        void persistItems(nextItems);
                        void updateMeta({
                          ...meta,
                          conflicts: meta.conflicts.filter((x) => x.id !== c.id),
                        });
                      }}
                    >
                      Use Remote
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="sync-actions">
          <button
            type="button"
            className="btn-sm"
            disabled={syncing || !isOnline}
            onClick={() => void handlePull()}
          >
            Pull
          </button>
          <button
            type="button"
            className="btn-primary btn-sm"
            disabled={syncing || !isOnline || dirtyCount === 0}
            onClick={() => void handlePush()}
          >
            Push {dirtyCount > 0 ? `(${dirtyCount})` : ''}
          </button>
          {settings.googleClientId.trim() && (
            <button
              type="button"
              className="btn-sm"
              disabled={syncing || !isOnline}
              onClick={() => void handleConnectCalendar()}
            >
              📅 Sync Calendar
            </button>
          )}
          <span className="sync-status-text">
            {syncStatus ||
              (meta.lastPulledAt
                ? `Last pull ${new Date(meta.lastPulledAt).toLocaleTimeString()}`
                : 'Not synced yet')}
          </span>
        </div>
      </footer>

      {!activeZoomItem && (
        <nav className="jump-chips" aria-label="Jump navigation">
          <button
            type="button"
            className="jump-chip"
            onClick={() => {
              if (searchQuery) setSearchQuery('');
              setTimeout(() => {
                datedSectionRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }, 0);
            }}
          >
            办点事儿
          </button>
          <button
            type="button"
            className="jump-chip"
            disabled={!hasOpenNotes}
            onClick={() => {
              if (searchQuery) setSearchQuery('');
              setTimeout(() => {
                notesSectionRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }, 0);
            }}
          >
            Notes
          </button>
          <button
            type="button"
            className="jump-chip"
            aria-label="Jump to search"
            onClick={() => {
              searchInputRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
              searchInputRef.current?.focus();
            }}
          >
            🔍
          </button>
        </nav>
      )}

      <ChatBubble
        apiKey={settings.geminiApiKey}
        model={settings.geminiModel || DEFAULT_SETTINGS.geminiModel}
        todayStr={todayStr}
        isOnline={isOnline}
        executor={geminiExecutor}
        onSnapshotBeforeMutate={() => {
          aiSnapshotRef.current = {
            items: itemsRef.current,
            deletes: pendingDeletes,
          };
        }}
        onUndoLastAi={() => {
          if (!aiSnapshotRef.current) return;
          void replaceAllItems(aiSnapshotRef.current.items);
          setItems(aiSnapshotRef.current.items);
          itemsRef.current = aiSnapshotRef.current.items;
          aiSnapshotRef.current = null;
        }}
        canUndo={aiSnapshotRef.current !== null}
      />

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={(next) => {
            setSettings(next);
            saveSettings(next);
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
