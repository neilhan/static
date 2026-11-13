import React from 'react';
import './MiniFretboard.css';

export interface MiniFretNote {
  row: number;
  col: number;
  label: string;
  color: string;
  highlight?: 'anchor' | 'target' | 'plain';
  title?: string;
}

interface MiniFretboardProps {
  rowCount: number;
  cols: number[];
  notes: MiniFretNote[];
  inactiveRows?: Set<number>;
  fretLabels?: string[];
  variant?: 'fretboard' | 'tile-box';
  tileColor?: string;
  rowHeight?: number;
}

export const MiniFretboard: React.FC<MiniFretboardProps> = ({
  rowCount,
  cols,
  notes,
  inactiveRows,
  fretLabels,
  variant = 'fretboard',
  tileColor,
  rowHeight = 24,
}) => {
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <>
      <div
        className={variant === 'tile-box' ? 'mini-two-string-box' : 'mini-fretboard'}
        style={
          tileColor
            ? ({ '--tile-color': tileColor } as React.CSSProperties)
            : undefined
        }
      >
        {rows.map((row) => {
          const isInactive = inactiveRows?.has(row) ?? false;
          return (
            <div
              key={row}
              className={`mini-string-row ${isInactive ? 'is-inactive-string' : ''}`}
              style={{ height: `${rowHeight}px` }}
            >
              <span className="mini-string-wire" />
              {cols.map((col) => {
                const note = notes.find((n) => n.row === row && n.col === col);
                const highlightClass =
                  note?.highlight === 'anchor'
                    ? 'is-anchor'
                    : note?.highlight === 'target'
                    ? 'is-target'
                    : '';

                return (
                  <div key={col} className="mini-fret-cell">
                    {note && (
                      <span
                        className={`mini-note-dot ${highlightClass}`}
                        style={{ backgroundColor: note.color }}
                        title={note.title}
                      >
                        {note.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {fretLabels && fretLabels.length > 0 && (
        <div className="mini-fret-labels">
          {fretLabels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>
      )}
    </>
  );
};

