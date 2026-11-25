import React, { useMemo, useState } from 'react';
import { ContainerKind, ContainerRef } from '../core/types';

type MoveFormProps = {
  currentContainer: ContainerRef;
  isNested: boolean;
  todayStr: string;
  onMove: (target: ContainerRef) => void;
  onCancel: () => void;
};

const getMondayOfDate = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDay(); // 0 = Sun, 1 = Mon, ...
  const diffToMon = day === 0 ? -6 : 1 - day;
  dt.setUTCDate(dt.getUTCDate() + diffToMon);
  return dt.toISOString().slice(0, 10);
};

export const MoveForm: React.FC<MoveFormProps> = ({
  currentContainer,
  isNested,
  todayStr,
  onMove,
  onCancel,
}) => {
  const [kind, setKind] = useState<ContainerKind>(currentContainer.kind);
  const [dayVal, setDayVal] = useState<string>(
    currentContainer.kind === 'day'
      ? currentContainer.key
      : currentContainer.kind === 'week'
        ? currentContainer.key.replace(/^week-/, '')
        : todayStr
  );
  const [monthVal, setMonthVal] = useState<string>(
    currentContainer.kind === 'month'
      ? currentContainer.key
      : todayStr.slice(0, 7)
  );
  const [yearVal, setYearVal] = useState<string>(
    currentContainer.kind === 'year'
      ? currentContainer.key
      : todayStr.slice(0, 4)
  );

  const targetContainer = useMemo((): ContainerRef | null => {
    switch (kind) {
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
  }, [kind, dayVal, monthVal, yearVal]);

  const alreadyThere =
    !isNested &&
    targetContainer !== null &&
    targetContainer.kind === currentContainer.kind &&
    targetContainer.key === currentContainer.key;

  return (
    <div className="inline-move-bar">
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value as ContainerKind)}
        aria-label="Move target type"
      >
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
        <option value="notes">Notes</option>
      </select>

      {(kind === 'day' || kind === 'week') && (
        <input
          type="date"
          value={dayVal}
          onChange={(e) => setDayVal(e.target.value)}
          aria-label={kind === 'week' ? 'Pick any day in target week' : 'Target date'}
        />
      )}

      {kind === 'month' && (
        <input
          type="month"
          value={monthVal}
          onChange={(e) => setMonthVal(e.target.value)}
          aria-label="Target month"
        />
      )}

      {kind === 'year' && (
        <input
          type="number"
          min={2000}
          max={2100}
          value={yearVal}
          onChange={(e) => setYearVal(e.target.value)}
          aria-label="Target year"
          style={{ width: '5.5rem' }}
        />
      )}

      <button
        type="button"
        className="btn-primary btn-sm"
        disabled={!targetContainer || alreadyThere}
        onClick={() => {
          if (targetContainer) onMove(targetContainer);
        }}
      >
        Move
      </button>
      <button type="button" className="btn-sm btn-ghost" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
};
