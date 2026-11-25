import React, { useMemo, useState } from 'react';
import { ContainerRef } from '../core/types';
import { addDays } from '../state/journalActions';

type QuickAddKind =
  | 'today'
  | 'tomorrow'
  | 'day'
  | 'week'
  | 'month'
  | 'year'
  | 'notes';

type QuickAddModalProps = {
  todayStr: string;
  selectedDay: string;
  onAdd: (params: {
    title: string;
    body?: string;
    container: ContainerRef;
    time?: string;
  }) => void;
  onClose: () => void;
};

const getMondayOfDate = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  dt.setUTCDate(dt.getUTCDate() + diffToMon);
  return dt.toISOString().slice(0, 10);
};

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  todayStr,
  selectedDay,
  onAdd,
  onClose,
}) => {
  const [text, setText] = useState('');
  const [when, setWhen] = useState<QuickAddKind>(
    selectedDay === todayStr ? 'today' : 'day'
  );
  const [dayVal, setDayVal] = useState(selectedDay);
  const [monthVal, setMonthVal] = useState(todayStr.slice(0, 7));
  const [yearVal, setYearVal] = useState(todayStr.slice(0, 4));
  const [timeVal, setTimeVal] = useState('');

  const targetContainer = useMemo((): ContainerRef | null => {
    switch (when) {
      case 'today':
        return { kind: 'day', key: todayStr };
      case 'tomorrow':
        return { kind: 'day', key: addDays(todayStr, 1) };
      case 'day':
        return /^\d{4}-\d{2}-\d{2}$/.test(dayVal)
          ? { kind: 'day', key: dayVal }
          : null;
      case 'week':
        return /^\d{4}-\d{2}-\d{2}$/.test(dayVal)
          ? { kind: 'week', key: `week-${getMondayOfDate(dayVal)}` }
          : null;
      case 'month':
        return /^\d{4}-\d{2}$/.test(monthVal)
          ? { kind: 'month', key: monthVal }
          : null;
      case 'year':
        return /^\d{4}$/.test(yearVal)
          ? { kind: 'year', key: yearVal }
          : null;
      case 'notes':
        return { kind: 'notes', key: 'notes' };
    }
  }, [when, todayStr, dayVal, monthVal, yearVal]);

  const lines = text.split(/\r?\n/);
  const title = (lines[0] ?? '').trim();
  const body = lines.slice(1).join('\n').trim();
  const isDayTarget = when === 'today' || when === 'tomorrow' || when === 'day';

  const handleSubmit = () => {
    if (!title || !targetContainer) return;
    onAdd({
      title,
      body: body || undefined,
      container: targetContainer,
      time: isDayTarget && timeVal ? timeVal : undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Item</h2>
          <button type="button" className="btn-sm btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span>Title (Shift+Enter for details)</span>
            <textarea
              rows={3}
              autoFocus
              placeholder="First line = title&#10;Optional details..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
                if (e.key === 'Escape') {
                  onClose();
                }
              }}
            />
          </label>

          <label className="field">
            <span>When</span>
            <select
              value={when}
              onChange={(e) => setWhen(e.target.value as QuickAddKind)}
            >
              <option value="today">Today ({todayStr})</option>
              <option value="tomorrow">Tomorrow ({addDays(todayStr, 1)})</option>
              <option value="day">Pick a day…</option>
              <option value="week">Week (rough plan)</option>
              <option value="month">Month (rough plan)</option>
              <option value="year">Year (rough plan)</option>
              <option value="notes">Notes</option>
            </select>
          </label>

          {(when === 'day' || when === 'week') && (
            <label className="field">
              <span>{when === 'week' ? 'Any day in target week' : 'Date'}</span>
              <input
                type="date"
                value={dayVal}
                onChange={(e) => setDayVal(e.target.value)}
              />
            </label>
          )}

          {when === 'month' && (
            <label className="field">
              <span>Month</span>
              <input
                type="month"
                value={monthVal}
                onChange={(e) => setMonthVal(e.target.value)}
              />
            </label>
          )}

          {when === 'year' && (
            <label className="field">
              <span>Year</span>
              <input
                type="number"
                min={2000}
                max={2100}
                value={yearVal}
                onChange={(e) => setYearVal(e.target.value)}
              />
            </label>
          )}

          {isDayTarget && (
            <label className="field">
              <span>Time (optional)</span>
              <input
                type="time"
                value={timeVal}
                onChange={(e) => setTimeVal(e.target.value)}
              />
            </label>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-sm btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!title || !targetContainer}
            onClick={handleSubmit}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
