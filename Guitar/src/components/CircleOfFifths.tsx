import React from 'react';
import {
  AccidentalMode,
  CIRCLE_OF_FIFTHS,
  formatPitchClass,
  getKeyWedge,
  KeyWedgeChord,
  PITCH_CLASS_COLORS,
} from '../utils/musicTheory';
import './CircleOfFifths.css';

interface CircleOfFifthsProps {
  selectedIndex: number;
  selectedQuality: 'major' | 'minor';
  activeWedgeRoman: KeyWedgeChord['roman'] | null;
  accidentals: AccidentalMode;
  highlightedPitchClasses?: number[];
  changedPitchClass?: { pitchClass: number; direction: 'cw' | 'ccw' } | null;
  showDiatonicArc?: boolean;
  showPentatonicArc?: boolean;
  onSelectSlice: (index: number, quality: 'major' | 'minor') => void;
}

const CX = 220;
const CY = 220;
const OUTER_R = 200;
const MID_R = 132;
const INNER_R = 72;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function createAnnularSectorPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number
): string {
  const p1 = polarToCartesian(cx, cy, rOuter, startDeg);
  const p2 = polarToCartesian(cx, cy, rOuter, endDeg);
  const p3 = polarToCartesian(cx, cy, rInner, endDeg);
  const p4 = polarToCartesian(cx, cy, rInner, startDeg);

  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 0 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function createArcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const p1 = polarToCartesian(cx, cy, r, startDeg);
  const p2 = polarToCartesian(cx, cy, r, endDeg);
  const span = ((endDeg - startDeg) % 360 + 360) % 360;
  const largeArc = span > 180 ? 1 : 0;
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
  selectedIndex,
  selectedQuality,
  activeWedgeRoman,
  accidentals,
  highlightedPitchClasses = [],
  changedPitchClass = null,
  showDiatonicArc = false,
  showPentatonicArc = false,
  onSelectSlice,
}) => {
  const wedge = getKeyWedge(selectedIndex);
  const wedgeByKey = new Map<string, KeyWedgeChord>();
  wedge.forEach((item) => {
    if (item.ring === 'outer' || item.ring === 'inner') {
      wedgeByKey.set(`${item.circleIndex}:${item.ring}`, item);
    }
  });

  const diatonicIndices = new Set(
    Array.from({ length: 7 }, (_, i) => (selectedIndex - 1 + i + 12) % 12)
  );
  const pentatonicIndices = new Set(
    Array.from({ length: 5 }, (_, i) => (selectedIndex + i + 12) % 12)
  );

  const diatonicArcPath = createArcPath(
    CX,
    CY,
    OUTER_R + 9,
    (selectedIndex - 1) * 30 - 13,
    (selectedIndex + 5) * 30 + 13
  );
  const pentatonicArcPath = createArcPath(
    CX,
    CY,
    OUTER_R + 19,
    selectedIndex * 30 - 13,
    (selectedIndex + 4) * 30 + 13
  );

  const highlightedSet = new Set(highlightedPitchClasses);
  const centerPos = CIRCLE_OF_FIFTHS[selectedIndex];
  const centerMajorLabel = formatPitchClass(centerPos.majorPc, accidentals);
  const centerMinorLabel = `${formatPitchClass(centerPos.minorPc, accidentals)}m`;

  return (
    <div className="circle-wheel-wrap">
      <svg
        viewBox="-12 -12 464 464"
        className="circle-wheel-svg"
        role="img"
        aria-label="Interactive Circle of Fifths"
      >
        {CIRCLE_OF_FIFTHS.map((pos) => {
          const startDeg = pos.index * 30 - 15;
          const endDeg = pos.index * 30 + 15;
          const midDeg = pos.index * 30;

          const outerPath = createAnnularSectorPath(CX, CY, MID_R, OUTER_R, startDeg, endDeg);
          const innerPath = createAnnularSectorPath(CX, CY, INNER_R, MID_R, startDeg, endDeg);

          const outerWedge = wedgeByKey.get(`${pos.index}:outer`);
          const innerWedge = wedgeByKey.get(`${pos.index}:inner`);

          const isCenterMajor = pos.index === selectedIndex && selectedQuality === 'major';
          const isCenterMinor = pos.index === selectedIndex && selectedQuality === 'minor';

          const isActiveWedgeOuter =
            outerWedge !== undefined && activeWedgeRoman === outerWedge.roman;
          const isActiveWedgeInner =
            innerWedge !== undefined && activeWedgeRoman === innerWedge.roman;

          const isOuterFretHighlighted = highlightedSet.has(pos.majorPc);
          const isInnerFretHighlighted = highlightedSet.has(pos.minorPc);

          const isOuterChanged =
            changedPitchClass !== null && changedPitchClass.pitchClass === pos.majorPc;

          const isDiatonicSlice = showDiatonicArc && diatonicIndices.has(pos.index);
          const isPentatonicSlice = showPentatonicArc && pentatonicIndices.has(pos.index);

          const outerLabelPos = polarToCartesian(CX, CY, (OUTER_R + MID_R) / 2 - 4, midDeg);
          const sigLabelPos = polarToCartesian(CX, CY, OUTER_R - 14, midDeg);
          const innerLabelPos = polarToCartesian(CX, CY, (MID_R + INNER_R) / 2 + 2, midDeg);
          const outerRomanPos = polarToCartesian(CX, CY, MID_R + 14, midDeg);
          const innerRomanPos = polarToCartesian(CX, CY, INNER_R + 13, midDeg);

          const majorLabel =
            pos.index === 6
              ? `${formatPitchClass(pos.majorPc, 'sharp')}/${formatPitchClass(pos.majorPc, 'flat')}`
              : formatPitchClass(pos.majorPc, pos.accidentalMode);
          const minorLabel = `${formatPitchClass(pos.minorPc, pos.accidentalMode)}m`;

          const majorColor = PITCH_CLASS_COLORS[pos.majorPc] ?? '#4ecdc4';
          const minorColor = PITCH_CLASS_COLORS[pos.minorPc] ?? '#646cff';

          return (
            <g key={pos.index}>
              {/* Outer Major Slice */}
              <g
                className={[
                  'circle-slice',
                  outerWedge ? 'in-wedge' : '',
                  isCenterMajor ? 'is-center' : '',
                  isActiveWedgeOuter ? 'is-active-chord' : '',
                  isOuterFretHighlighted ? 'is-fret-highlighted' : '',
                  isOuterChanged ? 'is-changed-note' : '',
                  isDiatonicSlice ? 'is-diatonic-slice' : '',
                  isPentatonicSlice ? 'is-pentatonic-slice' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectSlice(pos.index, 'major')}
                role="button"
                tabIndex={0}
                aria-label={`${majorLabel} Major (${pos.signatureLabel})`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSlice(pos.index, 'major');
                  }
                }}
              >
                <path
                  d={outerPath}
                  style={{ '--slice-accent': majorColor } as React.CSSProperties}
                />
                <text
                  x={sigLabelPos.x}
                  y={sigLabelPos.y}
                  className="circle-sig-label"
                >
                  {pos.signatureLabel}
                </text>
                <text
                  x={outerLabelPos.x}
                  y={outerLabelPos.y}
                  className="circle-major-label"
                >
                  {majorLabel}
                </text>
                {outerWedge && (
                  <text
                    x={outerRomanPos.x}
                    y={outerRomanPos.y}
                    className="circle-roman-label"
                  >
                    {outerWedge.roman}
                  </text>
                )}
              </g>

              {/* Inner Relative Minor Slice */}
              <g
                className={[
                  'circle-slice circle-slice--inner',
                  innerWedge ? 'in-wedge' : '',
                  isCenterMinor ? 'is-center' : '',
                  isActiveWedgeInner ? 'is-active-chord' : '',
                  isInnerFretHighlighted ? 'is-fret-highlighted' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectSlice(pos.index, 'minor')}
                role="button"
                tabIndex={0}
                aria-label={`${minorLabel} Minor`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSlice(pos.index, 'minor');
                  }
                }}
              >
                <path
                  d={innerPath}
                  style={{ '--slice-accent': minorColor } as React.CSSProperties}
                />
                <text
                  x={innerLabelPos.x}
                  y={innerLabelPos.y}
                  className="circle-minor-label"
                >
                  {minorLabel}
                </text>
                {innerWedge && (
                  <text
                    x={innerRomanPos.x}
                    y={innerRomanPos.y}
                    className="circle-roman-label circle-roman-label--inner"
                  >
                    {innerWedge.roman}
                  </text>
                )}
              </g>
            </g>
          );
        })}

        {/* Outer Scale Span Arcs */}
        {showDiatonicArc && (
          <path d={diatonicArcPath} className="circle-span-arc circle-span-arc--diatonic" />
        )}
        {showPentatonicArc && (
          <path d={pentatonicArcPath} className="circle-span-arc circle-span-arc--pentatonic" />
        )}

        {/* Center Hub */}
        <circle cx={CX} cy={CY} r={INNER_R - 4} className="circle-center-hub" />
        <text x={CX} y={CY - 16} className="circle-hub-eyebrow">
          KEY CENTER
        </text>
        <text x={CX} y={CY + 6} className="circle-hub-title">
          {selectedQuality === 'major' ? `${centerMajorLabel} Maj` : centerMinorLabel}
        </text>
        <text x={CX} y={CY + 24} className="circle-hub-sub">
          {selectedQuality === 'major' ? `Rel: ${centerMinorLabel}` : `Rel: ${centerMajorLabel} Maj`} · {centerPos.signatureLabel}
        </text>
      </svg>
    </div>
  );
};
