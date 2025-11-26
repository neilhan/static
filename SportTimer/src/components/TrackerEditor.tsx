import { useState, useRef, useEffect } from 'react';
import { Tracker, CounterItem } from '../types.ts';
import { generateId } from '../utils/helpers';
import './TrackerEditor.css';

interface TrackerEditorProps {
  tracker?: Tracker;
  onSave: (tracker: Tracker) => void;
  onCancel: () => void;
}

export const TrackerEditor = ({ tracker, onSave, onCancel }: TrackerEditorProps) => {
  const [trackerName, setTrackerName] = useState(tracker?.name || '');
  const [items, setItems] = useState<CounterItem[]>(tracker?.items || []);
  const [newItemName, setNewItemName] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    trackerName?: boolean;
    newItemName?: boolean;
  }>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const newItemInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!tracker) return;
    setTrackerName(tracker.name);
    setItems(tracker.items);
  }, [tracker]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!tracker) return;

    const hasChanges =
      trackerName.trim() !== tracker.name ||
      JSON.stringify(items) !== JSON.stringify(tracker.items);

    if (!hasChanges) return;

    const updatedTracker: Tracker = {
      id: tracker.id,
      name: trackerName.trim() || 'Untitled Tracker',
      items,
    };
    onSave(updatedTracker);
  }, [trackerName, items, tracker, onSave]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      // Prevent closing if text is being selected
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        return;
      }
      handleClose();
    }
  };

  const handleClose = () => {
    if (tracker) {
      const updatedTracker: Tracker = {
        id: tracker.id,
        name: trackerName.trim() || 'Untitled Tracker',
        items,
      };
      onSave(updatedTracker);
    }
    onCancel();
  };

  const handleSave = () => {
    if (!trackerName.trim()) {
      setValidationErrors(prev => ({ ...prev, trackerName: true }));
      return false;
    }

    const updatedTracker: Tracker = {
      id: tracker?.id || generateId(),
      name: trackerName.trim() || 'Untitled Tracker',
      items: items,
    };
    
    onSave(updatedTracker);
    return true;
  };

  const handleAddItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newItemName.trim()) {
      setValidationErrors(prev => ({ ...prev, newItemName: true }));
      return;
    }

    const newItem: CounterItem = {
      id: generateId(),
      name: newItemName.trim(),
      value: 0
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setValidationErrors(prev => ({ ...prev, newItemName: false }));
    
    // Keep focus on input
    newItemInputRef.current?.focus();
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= items.length) return;

    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
  };

  return (
    <div 
      className="tracker-editor-overlay" 
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="tracker-editor"
      >
        <div className="editor-header">
          <h2>{tracker ? 'Edit Tracker' : 'Create New Tracker'}</h2>
          <button className="btn-close" onClick={handleClose}>✕</button>
        </div>

        <div className="editor-content">
          <div className="form-group">
            <label htmlFor="tracker-name">Tracker Name</label>
            <input
              id="tracker-name"
              type="text"
              value={trackerName}
              onChange={e => {
                setTrackerName(e.target.value);
                if (validationErrors.trackerName) {
                  setValidationErrors(prev => ({ ...prev, trackerName: false }));
                }
              }}
              placeholder="e.g., Game Score, Workout Reps"
              className={`input-text ${validationErrors.trackerName ? 'input-error' : ''}`}
              autoFocus={!tracker}
            />
          </div>

          <div className="items-section">
            <h3>Tracker Items</h3>
            
            <div className="items-list">
              {items.map((item, index) => (
                <div key={item.id} className="item-row">
                  <div className="item-name">{item.name}</div>
                  <div className="item-actions">
                    <button
                      className="btn-mini"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="btn-mini"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      className="btn-mini btn-delete"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="empty-items">
                  No items yet. Add counters below.
                </div>
              )}
            </div>

            <form onSubmit={handleAddItem} className="add-item-form-row">
              <input
                ref={newItemInputRef}
                type="text"
                value={newItemName}
                onChange={e => {
                  setNewItemName(e.target.value);
                  if (validationErrors.newItemName) {
                    setValidationErrors(prev => ({ ...prev, newItemName: false }));
                  }
                }}
                placeholder="New item name (e.g. Home Team)"
                className={`input-text flex-1 ${validationErrors.newItemName ? 'input-error' : ''}`}
              />
              <button type="submit" className="btn-add-small">
                + Add
              </button>
            </form>
          </div>
        </div>

        <div className="editor-footer">
          <button
            className="btn-primary btn-done"
            onClick={() => {
              if (handleSave()) {
                onCancel();
              }
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

