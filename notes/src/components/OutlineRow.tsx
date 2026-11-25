import React, { useState } from 'react';
import { ContainerRef, ItemStatus, JournalItem } from '../core/types';

type OutlineRowProps = {
  item: JournalItem;
  allItems: JournalItem[];
  showDone: boolean;
  depth?: number;
  todayStr: string;
  onZoom: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onEditTitle: (id: string, title: string) => void;
  onSetStatus: (id: string, status: ItemStatus) => void;
  onAddSubItem: (parentId: string, title: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onMove: (id: string, target: ContainerRef) => void;
  onDelete: (id: string) => void;
};

const renderTextWithLinks = (text: string) => {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, idx) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={idx}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-link"
        onClick={(e) => e.stopPropagation()}
      >
        {part}
      </a>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
};

export const OutlineRow: React.FC<OutlineRowProps> = ({
  item,
  allItems,
  showDone,
  depth = 0,
  todayStr,
  onZoom,
  onToggleCollapse,
  onEditTitle,
  onSetStatus,
  onAddSubItem,
  onReorder,
  onMove,
  onDelete,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addingSub, setAddingSub] = useState(false);
  const [subTitle, setSubTitle] = useState('');
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveDate, setMoveDate] = useState(
    item.container.kind === 'day' ? item.container.key : todayStr
  );

  const isCalendar = Boolean(item.calendar);
  const children = allItems
    .filter(
      (c) =>
        c.parentId === item.id &&
        c.status !== 'archived' &&
        (showDone || c.status !== 'done')
    )
    .sort((a, b) => a.order - b.order);

  const hasAnyChildren = allItems.some(
    (c) => c.parentId === item.id && c.status !== 'archived'
  );

  const commitTitle = () => {
    setEditingTitle(false);
    const cleaned = titleDraft.replace(/\r?\n/g, ' ').trim();
    if (cleaned && cleaned !== item.title) {
      onEditTitle(item.id, cleaned);
    } else {
      setTitleDraft(item.title);
    }
  };

  const submitSub = () => {
    const trimmed = subTitle.trim();
    if (trimmed) {
      onAddSubItem(item.id, trimmed);
    }
    setSubTitle('');
    setAddingSub(false);
  };

  return (
    <div className="outline-node" style={{ marginLeft: depth > 0 ? '18px' : 0 }}>
      <div className={`outline-row ${item.status === 'done' ? 'is-done' : ''}`}>
        <button
          type="button"
          className={`bullet-btn ${hasAnyChildren ? 'has-children' : ''}`}
          onClick={() => onZoom(item.id)}
          title="Zoom into item"
          aria-label={`Zoom into ${item.title}`}
        >
          <span className="bullet-dot" />
        </button>

        <div className="row-content">
          <div className="row-title-line">
            {item.time && <span className="time-badge">{item.time}</span>}
            {isCalendar && item.calendarUrl && (
              <a
                href={item.calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cal-link"
                title="Open in Google Calendar"
                onClick={(e) => e.stopPropagation()}
              >
                📅
              </a>
            )}

            {editingTitle && !isCalendar ? (
              <input
                type="text"
                className="inline-title-input"
                value={titleDraft}
                autoFocus
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitTitle();
                  if (e.key === 'Escape') {
                    setTitleDraft(item.title);
                    setEditingTitle(false);
                  }
                }}
              />
            ) : (
              <span
                className="row-title"
                onClick={() => {
                  if (isCalendar && item.calendarUrl) {
                    window.open(item.calendarUrl, '_blank', 'noopener');
                  } else if (!isCalendar) {
                    setTitleDraft(item.title);
                    setEditingTitle(true);
                  }
                }}
              >
                {item.status === 'done' && <span className="done-check">✓ </span>}
                {renderTextWithLinks(item.title)}
              </span>
            )}
          </div>

          {item.body && (
            <div className="row-details-preview" onClick={() => onZoom(item.id)}>
              {renderTextWithLinks(item.body)}
            </div>
          )}

          {moveOpen && (
            <div className="inline-move-bar">
              <input
                type="date"
                value={moveDate}
                onChange={(e) => setMoveDate(e.target.value)}
              />
              <button
                type="button"
                className="btn-sm"
                onClick={() => {
                  onMove(item.id, { kind: 'day', key: moveDate });
                  setMoveOpen(false);
                }}
              >
                Move to day
              </button>
              <button
                type="button"
                className="btn-sm"
                onClick={() => {
                  onMove(item.id, { kind: 'notes', key: 'notes' });
                  setMoveOpen(false);
                }}
              >
                Notes
              </button>
              <button
                type="button"
                className="btn-sm btn-ghost"
                onClick={() => setMoveOpen(false)}
              >
                Cancel
              </button>
            </div>
          )}

          {addingSub && (
            <div className="inline-add-sub">
              <input
                type="text"
                placeholder="Sub-item title..."
                value={subTitle}
                autoFocus
                onChange={(e) => setSubTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitSub();
                  if (e.key === 'Escape') {
                    setSubTitle('');
                    setAddingSub(false);
                  }
                }}
                onBlur={submitSub}
              />
            </div>
          )}
        </div>

        <div className="row-actions">
          {hasAnyChildren && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => onToggleCollapse(item.id)}
              aria-label={item.collapsed ? 'Expand sub-items' : 'Collapse sub-items'}
            >
              {item.collapsed ? '▸' : '▾'}
            </button>
          )}

          {!isCalendar && (
            <div className="menu-anchor">
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setConfirmDelete(false);
                }}
                aria-label="Item actions"
              >
                ⋯
              </button>
              {menuOpen && (
                <div className="row-menu" onMouseLeave={() => setMenuOpen(false)}>
                  <button
                    type="button"
                    onClick={() => {
                      onSetStatus(item.id, item.status === 'done' ? 'open' : 'done');
                      setMenuOpen(false);
                    }}
                  >
                    {item.status === 'done' ? 'Reopen' : '✓ Done'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingSub(true);
                      setMenuOpen(false);
                    }}
                  >
                    + Add sub-item
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onReorder(item.id, 'up');
                      setMenuOpen(false);
                    }}
                  >
                    ↑ Move up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onReorder(item.id, 'down');
                      setMenuOpen(false);
                    }}
                  >
                    ↓ Move down
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMoveOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    → Move…
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSetStatus(
                        item.id,
                        item.status === 'archived' ? 'open' : 'archived'
                      );
                      setMenuOpen(false);
                    }}
                  >
                    {item.status === 'archived' ? 'Unarchive' : 'Archive'}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      if (!confirmDelete) {
                        setConfirmDelete(true);
                      } else {
                        onDelete(item.id);
                        setMenuOpen(false);
                      }
                    }}
                  >
                    {confirmDelete ? 'Confirm delete?' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!item.collapsed &&
        children.map((child) => (
          <OutlineRow
            key={child.id}
            item={child}
            allItems={allItems}
            showDone={showDone}
            depth={depth + 1}
            todayStr={todayStr}
            onZoom={onZoom}
            onToggleCollapse={onToggleCollapse}
            onEditTitle={onEditTitle}
            onSetStatus={onSetStatus}
            onAddSubItem={onAddSubItem}
            onReorder={onReorder}
            onMove={onMove}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
};
