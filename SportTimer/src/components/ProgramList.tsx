import { useState, useRef } from 'react';
import { Program, Tracker, CounterItem, TimerSegment } from '../types.ts';
import { formatTime, calculateTotalDuration } from '../utils/helpers';
import homeIcon from '../assets/home.svg';
import { SoundIcon } from './icons/SoundIcon';
import './ProgramList.css';

type ProgramListProps = {
  programs: Program[];
  trackers: Tracker[];
  displayOrder?: string[];
  onCreateNew: () => void;
  onCreateTracker: () => void;
  onEdit: (program: Program) => void;
  onEditTracker: (tracker: Tracker) => void;
  onDelete: (programId: string) => void;
  onRun: (program: Program) => void;
  onRunTracker: (tracker: Tracker) => void;
  onDeleteTracker: (id: string) => void;
  onAddCounterToTracker: (trackerId: string, name: string) => void;
  onDeleteCounterFromTracker: (trackerId: string, counterId: string) => void;
  onUpdateCounter: (trackerId: string, counterId: string, delta: number) => void;
  onResetTracker: (trackerId: string) => void;
  onReorder: (newOrder: string[]) => void;
};

type DashboardItem = 
  | { type: 'program'; data: Program }
  | { type: 'tracker'; data: Tracker };

export const ProgramList = ({ 
  programs, 
  trackers,
  displayOrder = [],
  onCreateNew,
  onCreateTracker,
  onEdit,
  onEditTracker,
  onDelete, 
  onRun, 
  onRunTracker,
  onDeleteTracker,
  onAddCounterToTracker,
  onDeleteCounterFromTracker,
  onUpdateCounter,
  onResetTracker,
  onReorder
}: ProgramListProps) => {
  // State for adding new counter to a specific tracker
  const [activeTrackerIdForAdd, setActiveTrackerIdForAdd] = useState<string | null>(null);
  const [newCounterName, setNewCounterName] = useState('');

  // Drag and Drop state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

  const handleAddCounterSubmit = (e: React.FormEvent, trackerId: string) => {
    e.preventDefault();
    if (!newCounterName.trim()) return;
    onAddCounterToTracker(trackerId, newCounterName);
    setNewCounterName('');
    setActiveTrackerIdForAdd(null);
  };

  const confirmDeletion = (entityType: 'timer' | 'tracker', name: string) =>
    window.confirm(`Delete ${entityType} "${name}"?`);

  const handleDeleteProgram = (program: Program) => {
    if (confirmDeletion('timer', program.name || 'Untitled Timer')) {
      onDelete(program.id);
    }
  };

  const handleDeleteTracker = (tracker: Tracker) => {
    if (confirmDeletion('tracker', tracker.name || 'Untitled Tracker')) {
      onDeleteTracker(tracker.id);
    }
  };

  // Merge and sort items
  const getSortedItems = (): DashboardItem[] => {
    const itemMap = new Map<string, DashboardItem>();
    programs.forEach(p => itemMap.set(p.id, { type: 'program', data: p }));
    trackers.forEach(t => itemMap.set(t.id, { type: 'tracker', data: t }));

    const sortedItems: DashboardItem[] = [];
    const processedIds = new Set<string>();

    // Add items based on displayOrder
    displayOrder.forEach(id => {
      const item = itemMap.get(id);
      if (item) {
        sortedItems.push(item);
        processedIds.add(id);
      }
    });

    // Add remaining items (newly created or legacy)
    itemMap.forEach((item, id) => {
      if (!processedIds.has(id)) {
        sortedItems.push(item);
      }
    });

    return sortedItems;
  };

  const sortedItems = getSortedItems();

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Set a transparent image or similar if needed, but default is usually fine
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOverItem.current = id;
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    dragOverItem.current = null;
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItemId || draggedItemId === targetId) {
      return;
    }

    const currentOrder = sortedItems.map(item => item.data.id);
    const oldIndex = currentOrder.indexOf(draggedItemId);
    const newIndex = currentOrder.indexOf(targetId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = [...currentOrder];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, draggedItemId);
      onReorder(newOrder);
    }
    
    setDraggedItemId(null);
    dragOverItem.current = null;
  };

  return (
    <div className="program-list">
      <div className="program-list-header">
        <div className="header-title-group">
          <a href="https://neilhan.github.io/static" className="btn-icon home-link" title="Back to Home">
            <img src={homeIcon} alt="Home" width="24" height="24" />
          </a>
          <span className="breadcrumb-separator">/</span>
          <h1>Timers & Trackers</h1>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary" 
            onClick={onCreateTracker}
          >
            + Tracker
          </button>
          <button className="btn-primary" onClick={onCreateNew}>
            + Timer
          </button>
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div className="empty-state">
          <p>No programs or trackers yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="program-grid">
          {sortedItems.map(({ type, data }) => (
            <div 
              key={data.id} 
              className={`program-card ${type === 'tracker' ? 'counter-card-style' : ''} ${draggedItemId === data.id ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, data.id)}
              onDragOver={(e) => handleDragOver(e, data.id)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, data.id)}
            >
              <div className="program-card-header">
                <h3>
                  <span className="drag-handle">⋮⋮</span> {data.name}
                </h3>
                <div className="program-card-actions">
                  {type === 'tracker' && (
                    <button 
                      className="btn-icon" 
                      onClick={() => onResetTracker(data.id)}
                      title="Reset All Counters"
                    >
                      ↻
                    </button>
                  )}
                  <button 
                    className="btn-icon" 
                    onClick={() => type === 'program' ? onEdit(data as Program) : onEditTracker(data as Tracker)}
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button 
                    className="btn-icon btn-delete" 
                    onClick={() => type === 'program' 
                      ? handleDeleteProgram(data as Program) 
                      : handleDeleteTracker(data as Tracker)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {type === 'tracker' ? (
                // Tracker Content
                <div className="tracker-items-list">
                  {(data as Tracker).items.length === 0 && !activeTrackerIdForAdd && (
                     <div className="empty-tracker-msg">No counters yet</div>
                  )}
                  
                  {(data as Tracker).items.map((item: CounterItem) => (
                    <div key={item.id} className="tracker-item-row">
                       <div className="tracker-item-name">
                         {item.name}
                         <button 
                           className="btn-icon-small btn-delete-item"
                           onClick={() => onDeleteCounterFromTracker(data.id, item.id)}
                           title="Delete Item"
                         >✕</button>
                       </div>
                       <div className="tracker-item-controls">
                          <button 
                            className="btn-control-small btn-minus"
                            onClick={() => onUpdateCounter(data.id, item.id, -1)}
                          >-</button>
                          <span className="tracker-item-value">{item.value}</span>
                          <button 
                            className="btn-control-small btn-plus"
                            onClick={() => onUpdateCounter(data.id, item.id, 1)}
                          >+</button>
                       </div>
                    </div>
                  ))}

                  {activeTrackerIdForAdd === data.id ? (
                    <form onSubmit={(e) => handleAddCounterSubmit(e, data.id)} className="add-item-form">
                      <input 
                        type="text" 
                        value={newCounterName}
                        onChange={(e) => setNewCounterName(e.target.value)}
                        placeholder="Item Name"
                        className="item-input"
                        autoFocus
                      />
                      <div className="add-item-actions">
                        <button type="submit" className="btn-primary btn-xs">Add</button>
                        <button 
                          type="button" 
                          className="btn-secondary btn-xs"
                          onClick={() => setActiveTrackerIdForAdd(null)}
                        >Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <button 
                      className="btn-add-item"
                      onClick={() => {
                        setActiveTrackerIdForAdd(data.id);
                        setNewCounterName('');
                      }}
                    >
                      + Add Item
                    </button>
                  )}
                </div>
              ) : (
                // Timer Content
                <>
                  <div className="program-card-info">
                    <div className="info-item">
                      <span className="label">Duration:</span>
                      <span className="value">
                        {(data as Program).rounds === 0 ? '∞' : formatTime(calculateTotalDuration((data as Program).segments) * (data as Program).rounds)}
                        {(data as Program).rounds > 1 && (
                          <span className="cycle-badge">{(data as Program).rounds} x ({formatTime(calculateTotalDuration((data as Program).segments))})</span>
                        )}
                        {(data as Program).rounds === 0 && (
                          <span className="cycle-badge">∞ x ({formatTime(calculateTotalDuration((data as Program).segments))})</span>
                        )}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Segments:</span>
                      <span className="value">
                        {(data as Program).segments.length}
                        <span
                          className={`beep-indicator ${!(data as Program).beepEnabled ? 'muted' : ''}`}
                          title={(data as Program).beepEnabled ? 'Sound enabled' : 'Sound disabled'}
                        >
                          <SoundIcon muted={!(data as Program).beepEnabled} />
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="segment-list-container">
                    <div className="segment-list">
                      {(data as Program).segments.map((segment: TimerSegment) => (
                        <div key={segment.id} className="segment-row">
                          <div 
                            className="segment-color-dot" 
                            style={{ backgroundColor: segment.color }}
                          />
                          <span className="segment-name">{segment.name}</span>
                          <span className="segment-duration">{formatTime(segment.duration)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    className="btn-run"
                    onClick={() => onRun(data as Program)}
                  >
                    ▶ Start Timer
                  </button>
                </>
              )}

              {/* Action buttons for tracker cards */}
              {type === 'tracker' && (
                <div className="tracker-card-actions">
                  <button 
                    className="btn-run btn-start-tracker"
                    onClick={() => onRunTracker(data as Tracker)}
                  >
                    ▶ Start Tracker
                  </button>
                  <button 
                    className="btn-reset-tracker"
                    onClick={() => onResetTracker(data.id)}
                  >
                    ↻ Reset
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
