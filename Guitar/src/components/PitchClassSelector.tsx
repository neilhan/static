import React from 'react';
import {
  AccidentalMode,
  formatPitchClass,
  PITCH_CLASS_COLORS,
} from '../utils/musicTheory';

const ALL_PITCH_CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

interface PitchClassSelectorProps {
  value: number;
  onChange: (pc: number) => void;
  accidentals: AccidentalMode;
}

/** Shared 12-note root pitch-class pill selector strip. */
export const PitchClassSelector: React.FC<PitchClassSelectorProps> = ({
  value,
  onChange,
  accidentals,
}) => (
  <div className="chord-study-pill-row">
    {ALL_PITCH_CLASSES.map((pc) => {
      const label = formatPitchClass(pc, accidentals);
      const isActive = value === pc;
      return (
        <button
          key={pc}
          type="button"
          className={`toggle-btn ${isActive ? 'active' : ''}`}
          style={
            isActive
              ? {
                  backgroundColor: PITCH_CLASS_COLORS[pc],
                  borderColor: PITCH_CLASS_COLORS[pc],
                  color: '#ffffff',
                }
              : undefined
          }
          onClick={() => onChange(pc)}
        >
          {label}
        </button>
      );
    })}
  </div>
);
