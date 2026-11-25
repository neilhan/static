import React, { useEffect, useState } from 'react';
import { containerDisplayLabel } from '../core/tree';
import { ContainerRef, ItemStatus, JournalItem } from '../core/types';
import { MoveForm } from './MoveForm';
import { OutlineRow } from './OutlineRow';

type ZoomViewProps = {
  item: JournalItem;
  allItems: JournalItem[];
  showDone: boolean;
  todayStr: string;
  onBack: () => void;
  onZoom: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onEditContent: (
    id: string,
    patch: { title?: string; body?: string; time?: string | undefined }
  ) => void;
  onSetStatus: (id: string, status: ItemStatus) => void;
  onAddSubItem: (parentId: string, title: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onMove: (id: string, target: ContainerRef) => void;
  onDelete: (id: string) => void;
};

export const ZoomView: React.FC<ZoomViewProps> = ({
  item,
  allItems,
  showDone,
  todayStr,
  onBack,
  onZoom,
  onToggleCollapse,
  onEditContent,
  onSetStatus,
  onAddSubItem,
  onReorder,
  onMove,
  onDelete,
}) => {
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body);
  const [time, setTime] = useState(item.time ?? '');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [newSub, setNewSub] = useState('');
  const [addingSub, setAddingSub] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setTitle(item.title);
    setBody(item.body);
    setTime(item.time ?? '');
    setConfirmDelete(false);
  }, [item.id, item.title, item.body, item.time]);

  const isCalendar = Boolean(item.calendar);

  // Build ancestor chain
  const ancestors: JournalItem[] = [];
  let cursor = item.parentId
    ? allItems.find((i) => i.id === item.parentId) ?? null
    : null;
  while (cursor) {
    ancestors.unshift(cursor);
    cursor = cursor.parentId
      ? allItems.find((i) => i.id === cursor!.parentId) ?? null
      : null;
  }

  const subItems = allItems
    .filter(
      (c) =>
        c.parentId === item.id &&
        c.status !== 'archived' &&
        (showDone || c.status !== 'done')
    )
    .sort((a, b) => a.order - b.order);

  return (
    <div className="zoom-view">
      <div className="zoom-nav">
        <button type="button" className="btn-sm" onClick={onBack}>
          ‹ Back
        </button>
        <div className="breadcrumbs">
          <span className="crumb-container">
            {containerDisplayLabel(item.container)}
          </span>
          {ancestors.map((anc) => (
            <React.Fragment key={anc.id}>
              <span className="crumb-sep">/</span>
              <button
                type="button"
                className="crumb-link"
                onClick={() => onZoom(anc.id)}
              >
                {anc.title}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="zoom-card">
        {isCalendar ? (
          <h2 className="zoom-title">
            {item.title}{' '}
            {item.calendarUrl && (
              <a
                href={item.calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-link"
              >
                📅 Open in Calendar
              </a>
            )}
          </h2>
        ) : (
          <input
            type="text"
            className="zoom-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              const cleaned = title.replace(/\r?\n/g, ' ').trim();
              if (cleaned && cleaned !== item.title) {
                onEditContent(item.id, { title: cleaned });
              }
            }}
          />
        )}

        <div className="zoom-meta-row">
          <span className="status-pill">{item.status}</span>
          {item.container.kind === 'day' && !isCalendar && (
            <div className="time-editor">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                onBlur={() =>
                  onEditContent(item.id, { time: time || undefined })
                }
              />
              {time && (
                <button
                  type="button"
                  className="btn-sm btn-ghost"
                  onClick={() => {
                    setTime('');
                    onEditContent(item.id, { time: undefined });
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          )}
          {!isCalendar && (
            <div className="zoom-quick-actions">
              <button
                type="button"
                className="btn-sm"
                onClick={() =>
                  onSetStatus(item.id, item.status === 'done' ? 'open' : 'done')
                }
              >
                {item.status === 'done' ? 'Reopen' : '✓ Done'}
              </button>
              <button
                type="button"
                className="btn-sm"
                onClick={() => setMoveOpen((v) => !v)}
              >
                → Move…
              </button>
              <button
                type="button"
                className="btn-sm"
                onClick={() =>
                  onSetStatus(
                    item.id,
                    item.status === 'archived' ? 'open' : 'archived'
                  )
                }
              >
                {item.status === 'archived' ? 'Unarchive' : 'Archive'}
              </button>
              <button
                type="button"
                className="btn-sm danger-btn"
                onClick={() => {
                  if (!confirmDelete) {
                    setConfirmDelete(true);
                  } else {
                    onDelete(item.id);
                    onBack();
                  }
                }}
              >
                {confirmDelete ? 'Confirm delete?' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {moveOpen && !isCalendar && (
          <MoveForm
            currentContainer={item.container}
            isNested={item.parentId !== null}
            todayStr={todayStr}
            onMove={(target) => {
              onMove(item.id, target);
              setMoveOpen(false);
            }}
            onCancel={() => setMoveOpen(false)}
          />
        )}

        <textarea
          className="zoom-details-editor"
          rows={5}
          readOnly={isCalendar}
          placeholder="Add details..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={() => {
            if (!isCalendar && body.trim() !== item.body) {
              onEditContent(item.id, { body });
            }
          }}
        />

        <div className="zoom-subitems">
          {subItems.map((sub) => (
            <OutlineRow
              key={sub.id}
              item={sub}
              allItems={allItems}
              showDone={showDone}
              todayStr={todayStr}
              onZoom={onZoom}
              onToggleCollapse={onToggleCollapse}
              onEditTitle={(id, t) => onEditContent(id, { title: t })}
              onSetStatus={onSetStatus}
              onAddSubItem={onAddSubItem}
              onReorder={onReorder}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))}

          {!isCalendar &&
            (addingSub ? (
              <div className="inline-add-sub">
                <input
                  type="text"
                  placeholder="Sub-item title..."
                  value={newSub}
                  autoFocus
                  onChange={(e) => setNewSub(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSub.trim()) {
                      onAddSubItem(item.id, newSub.trim());
                      setNewSub('');
                      setAddingSub(false);
                    }
                    if (e.key === 'Escape') {
                      setNewSub('');
                      setAddingSub(false);
                    }
                  }}
                  onBlur={() => {
                    if (newSub.trim()) {
                      onAddSubItem(item.id, newSub.trim());
                    }
                    setNewSub('');
                    setAddingSub(false);
                  }}
                />
              </div>
            ) : (
              <button
                type="button"
                className="add-plus-btn"
                onClick={() => setAddingSub(true)}
              >
                +
              </button>
            ))}
        </div>

        <div className="zoom-history">
          <button
            type="button"
            className="history-toggle"
            onClick={() => setHistoryOpen((v) => !v)}
          >
            {historyOpen ? '▾' : '▸'} History ({item.history.length})
          </button>
          {historyOpen && (
            <ul className="history-list">
              {item.history.map((h, i) => (
                <li key={i}>
                  {h.action} · {h.timestamp} · {h.from} → {h.to}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
