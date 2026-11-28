import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ContainerRef, ItemStatus, JournalItem } from '../core/types';
import { DropPosition } from '../state/journalActions';
import { MoveForm } from './MoveForm';

export type DragHoverState = {
  draggedId: string;
  overId: string | null;
  position: DropPosition | null;
};

type OutlineRowProps = {
  item: JournalItem;
  allItems: JournalItem[];
  showDone: boolean;
  depth?: number;
  todayStr: string;
  onZoom: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onEditTitle: (id: string, title: string) => void;
  onEditDetails?: (id: string, body: string) => void;
  onSetStatus: (id: string, status: ItemStatus) => void;
  onAddSubItem: (parentId: string, title: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onIndent?: (id: string) => void;
  onOutdent?: (id: string) => void;
  onMove: (id: string, target: ContainerRef) => void;
  onDelete: (id: string) => void;
  dragState?: DragHoverState | null;
  onStartDrag?: (id: string) => void;
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
  onEditDetails,
  onSetStatus,
  onAddSubItem,
  onReorder,
  onIndent,
  onOutdent,
  onMove,
  onDelete,
  dragState,
  onStartDrag,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.title);
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState(item.body);
  const detailsRef = useRef<HTMLTextAreaElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addingSub, setAddingSub] = useState(false);
  const [subTitle, setSubTitle] = useState('');
  const [moveOpen, setMoveOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = detailsRef.current;
    if (!editingDetails || !el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [editingDetails, detailsDraft]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

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

  const siblingList = allItems
    .filter(
      (s) =>
        s.parentId === item.parentId &&
        s.container.kind === item.container.kind &&
        s.container.key === item.container.key &&
        s.status !== 'archived' &&
        (showDone || s.status !== 'done')
    )
    .sort((a, b) => a.order - b.order);
  const myIdx = siblingList.findIndex((s) => s.id === item.id);
  const canIndent =
    Boolean(onIndent) && myIdx > 0 && !siblingList[myIdx - 1]?.calendar;
  const canOutdent = Boolean(onOutdent) && item.parentId !== null;
  const canMoveUp = myIdx > 0;
  const canMoveDown = myIdx !== -1 && myIdx < siblingList.length - 1;

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

  const isDraggingThis = dragState?.draggedId === item.id;
  const dropClass =
    dragState &&
    dragState.overId === item.id &&
    dragState.draggedId !== item.id &&
    dragState.position
      ? `drop-${dragState.position}`
      : '';

  return (
    <div className="outline-node" style={{ marginLeft: depth > 0 ? '18px' : 0 }}>
      <div
        data-item-id={item.id}
        data-is-calendar={isCalendar ? 'true' : 'false'}
        className={`outline-row ${item.status === 'done' ? 'is-done' : ''} ${isDraggingThis ? 'is-dragging' : ''} ${dropClass}`}
      >
        {!isCalendar && onStartDrag && (
          <span
            className="drag-grip"
            title="Drag to reorder or nest"
            aria-label="Drag handle"
            onPointerDown={(e) => {
              e.preventDefault();
              onStartDrag(item.id);
            }}
          >
            ⋮⋮
          </span>
        )}
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
          <div
            className={`row-title-line ${!isCalendar ? 'editable' : ''}`}
            onClick={() => {
              if (editingTitle) return;
              if (isCalendar && item.calendarUrl) {
                window.open(item.calendarUrl, '_blank', 'noopener');
              } else if (!isCalendar) {
                setTitleDraft(item.title);
                setEditingTitle(true);
              }
            }}
          >
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
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    commitTitle();
                    if (e.shiftKey && canOutdent) onOutdent?.(item.id);
                    else if (!e.shiftKey && canIndent) onIndent?.(item.id);
                    return;
                  }
                  if (e.key === 'Enter' && e.shiftKey) {
                    e.preventDefault();
                    commitTitle();
                    if (onEditDetails) {
                      setDetailsDraft(item.body);
                      setEditingDetails(true);
                    }
                    return;
                  }
                  if (e.key === 'Enter') commitTitle();
                  if (e.key === 'Escape') {
                    setTitleDraft(item.title);
                    setEditingTitle(false);
                  }
                }}
              />
            ) : (
              <span className="row-title">
                {item.status === 'done' && <span className="done-check">✓ </span>}
                {renderTextWithLinks(item.title)}
              </span>
            )}
          </div>

          {editingDetails && onEditDetails ? (
            <textarea
              ref={detailsRef}
              className="inline-details-editor"
              rows={2}
              autoFocus
              placeholder="Add details..."
              value={detailsDraft}
              onChange={(e) => setDetailsDraft(e.target.value)}
              onBlur={() => {
                if (detailsDraft.trim() !== item.body) {
                  onEditDetails(item.id, detailsDraft);
                }
                setEditingDetails(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setDetailsDraft(item.body);
                  setEditingDetails(false);
                }
              }}
            />
          ) : (
            item.body && (
              <div
                className="row-details-preview"
                onClick={() => {
                  if (!isCalendar && onEditDetails) {
                    setDetailsDraft(item.body);
                    setEditingDetails(true);
                  } else {
                    onZoom(item.id);
                  }
                }}
                title={!isCalendar && onEditDetails ? 'Click to edit details' : undefined}
              >
                {renderTextWithLinks(item.body)}
              </div>
            )
          )}

          {(editingTitle || editingDetails) && !isCalendar && (
            <div className="edit-toolbar" role="toolbar" aria-label="Edit item position">
              <button
                type="button"
                className="edit-tool-btn"
                disabled={!canOutdent}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onOutdent?.(item.id)}
                title="Outdent (Shift+Tab)"
                aria-label="Outdent"
              >
                ⇤
              </button>
              <button
                type="button"
                className="edit-tool-btn"
                disabled={!canIndent}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onIndent?.(item.id)}
                title="Indent (Tab)"
                aria-label="Indent"
              >
                ⇥
              </button>
              <button
                type="button"
                className="edit-tool-btn"
                disabled={!canMoveUp}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onReorder(item.id, 'up')}
                title="Move up"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                className="edit-tool-btn"
                disabled={!canMoveDown}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onReorder(item.id, 'down')}
                title="Move down"
                aria-label="Move down"
              >
                ↓
              </button>
            </div>
          )}

          {moveOpen && (
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
            <div className="menu-anchor" ref={menuRef}>
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
                <div className="row-menu">
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
                  {canIndent && (
                    <button
                      type="button"
                      onClick={() => {
                        onIndent?.(item.id);
                        setMenuOpen(false);
                      }}
                    >
                      →| Indent
                    </button>
                  )}
                  {canOutdent && (
                    <button
                      type="button"
                      onClick={() => {
                        onOutdent?.(item.id);
                        setMenuOpen(false);
                      }}
                    >
                      |← Outdent
                    </button>
                  )}
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
            onEditDetails={onEditDetails}
            onSetStatus={onSetStatus}
            onAddSubItem={onAddSubItem}
            onReorder={onReorder}
            onIndent={onIndent}
            onOutdent={onOutdent}
            onMove={onMove}
            onDelete={onDelete}
            dragState={dragState}
            onStartDrag={onStartDrag}
          />
        ))}
    </div>
  );
};
