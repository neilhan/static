import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  AccidentalMode,
  ChordInversion,
  formatPitchClass,
  getFretPitchClass,
  getTileBlocksForFretboard,
  INLAY_FRETS,
  isNaturalPitchClass,
  PITCH_CLASS_COLORS,
  SeventhVoicing,
  TileBlock,
  TileFilter,
  TriadVoicing,
} from '../utils/musicTheory';
import { playFretNote } from '../utils/guitarAudio';
import './Fretboard.css';

export type MarkerBorderKind = 'root' | 'solid' | 'dashed' | 'selected' | 'muted';
export type PatternFilter = 'all' | 'oct-2' | 'oct-3' | 'unison';

export interface FretMarker {
  label: string;
  color: string;
  border: MarkerBorderKind;
}

interface FretboardProps {
  /** Pitch classes from String 1 (high e) to String 6 (low E) */
  strings: number[];
  maxFret: number;
  accidentals: AccidentalMode;
  showAllNotes: boolean;
  showAccidentals: boolean;
  connectSameNotes: boolean;
  patternFilter?: PatternFilter;
  tileFilter?: TileFilter;
  overlayBlocks?: TileBlock[];
  triadVoicings?: Array<TriadVoicing | SeventhVoicing>;
  activeTriadVoicingId?: string | null;
  selectedFrets: Set<string>;
  playSoundOnClick?: boolean;
  getMarker?: (stringIndex: number, fret: number, pitchClass: number) => FretMarker | null;
  onToggleFret?: (stringIndex: number, fret: number, pitchClass: number) => void;
}

interface ConnectionSegment {
  key: string;
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface TileBlockRect {
  id: string;
  label: string;
  color: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface SteppedTileOverlay {
  id: string;
  points: string;
  color: string;
}

interface TriadShapeOverlay {
  id: string;
  points: string;
  color: string;
  isDimmed: boolean;
}

const INVERSION_COLORS: Record<ChordInversion, string> = {
  'Root Position': '#10b981',
  '1st Inversion': '#38bdf8',
  '2nd Inversion': '#f472b6',
  '3rd Inversion': '#f59e0b',
};

const EMPTY_TRIAD_VOICINGS: Array<TriadVoicing | SeventhVoicing> = [];
const EMPTY_OVERLAY_BLOCKS: TileBlock[] = [];

export const makeFretKey = (stringIndex: number, fret: number): string =>
  `${stringIndex}:${fret}`;

export const Fretboard: React.FC<FretboardProps> = ({
  strings,
  maxFret,
  accidentals,
  showAllNotes,
  showAccidentals,
  connectSameNotes,
  patternFilter = 'all',
  tileFilter = 'none',
  overlayBlocks = EMPTY_OVERLAY_BLOCKS,
  triadVoicings = EMPTY_TRIAD_VOICINGS,
  activeTriadVoicingId = null,
  selectedFrets,
  playSoundOnClick = true,
  getMarker,
  onToggleFret,
}) => {
  const frets = Array.from({ length: maxFret + 1 }, (_, i) => i);
  const neckRef = useRef<HTMLDivElement>(null);
  const [segments, setSegments] = useState<ConnectionSegment[]>([]);
  const [tileBlockRects, setTileBlockRects] = useState<TileBlockRect[]>([]);
  const [steppedTiles, setSteppedTiles] = useState<SteppedTileOverlay[]>([]);
  const [triadShapes, setTriadShapes] = useState<TriadShapeOverlay[]>([]);

  const selectedPitchClasses = React.useMemo(() => {
    const pcs = new Set<number>();
    selectedFrets.forEach((key) => {
      const [sStr, fStr] = key.split(':');
      const sIdx = Number(sStr);
      const fret = Number(fStr);
      const openPc = strings[sIdx];
      if (openPc !== undefined) {
        pcs.add(getFretPitchClass(openPc, fret));
      }
    });
    return pcs;
  }, [selectedFrets, strings]);

  useLayoutEffect(() => {
    const neck = neckRef.current;
    const shouldComputeLines = connectSameNotes && selectedPitchClasses.size > 0;
    const shouldComputeTiles = tileFilter !== 'none' || overlayBlocks.length > 0;
    const shouldComputeTriads = triadVoicings.length > 0;

    if (!neck || (!shouldComputeLines && !shouldComputeTiles && !shouldComputeTriads)) {
      setSegments((prev) => (prev.length === 0 ? prev : []));
      setTileBlockRects((prev) => (prev.length === 0 ? prev : []));
      setSteppedTiles((prev) => (prev.length === 0 ? prev : []));
      setTriadShapes((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    const computeOverlays = () => {
      const neckRect = neck.getBoundingClientRect();

      if (shouldComputeLines) {
        const nextSegments: ConnectionSegment[] = [];

        selectedPitchClasses.forEach((pc) => {
          const cells = Array.from(
            neck.querySelectorAll<HTMLElement>(`[data-pc="${pc}"]`)
          );
          const nodes = cells.map((cell) => {
            const r = cell.getBoundingClientRect();
            return {
              stringIndex: Number(cell.dataset.stringIndex),
              fret: Number(cell.dataset.fret),
              x: r.left - neckRect.left + r.width / 2,
              y: r.top - neckRect.top + r.height / 2,
            };
          });

          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const a = nodes[i];
              const b = nodes[j];
              const stringDiff = Math.abs(a.stringIndex - b.stringIndex);
              const fretDiff = Math.abs(a.fret - b.fret);

              const isMatch =
                patternFilter === 'oct-2'
                  ? stringDiff === 2 && fretDiff <= 4
                  : patternFilter === 'oct-3'
                  ? stringDiff === 3 && fretDiff <= 4
                  : patternFilter === 'unison'
                  ? stringDiff === 1 && (fretDiff === 4 || fretDiff === 5)
                  : (stringDiff === 2 || stringDiff === 3) && fretDiff <= 4;

              if (isMatch) {
                nextSegments.push({
                  key: `${pc}-${a.stringIndex}:${a.fret}-${b.stringIndex}:${b.fret}`,
                  color: PITCH_CLASS_COLORS[pc],
                  x1: a.x,
                  y1: a.y,
                  x2: b.x,
                  y2: b.y,
                });
              }
            }
          }
        });

        setSegments(nextSegments);
      } else {
        setSegments((prev) => (prev.length === 0 ? prev : []));
      }

      if (shouldComputeTiles) {
        const blocks = [
          ...getTileBlocksForFretboard(maxFret, tileFilter),
          ...overlayBlocks,
        ];
        const nextRects: TileBlockRect[] = [];
        const nextStepped: SteppedTileOverlay[] = [];

        blocks.forEach((block) => {
          const rows =
            block.rowBounds && block.rowBounds.length > 0
              ? block.rowBounds
              : block.topStartFret !== undefined &&
                  block.topEndFret !== undefined &&
                  block.bottomStartFret !== undefined &&
                  block.bottomEndFret !== undefined
                ? [
                    {
                      stringIndex: block.topStringIndex,
                      startFret: block.topStartFret,
                      endFret: block.topEndFret,
                    },
                    {
                      stringIndex: block.bottomStringIndex,
                      startFret: block.bottomStartFret,
                      endFret: block.bottomEndFret,
                    },
                  ]
                : null;

          if (rows) {
            const measured = rows.map((row) => {
              const leftEl = neck.querySelector<HTMLElement>(
                `[data-string-index="${row.stringIndex}"][data-fret="${row.startFret}"]`
              );
              const rightEl = neck.querySelector<HTMLElement>(
                `[data-string-index="${row.stringIndex}"][data-fret="${row.endFret}"]`
              );
              if (!leftEl || !rightEl) return null;
              const lRect = leftEl.getBoundingClientRect();
              const rRect = rightEl.getBoundingClientRect();
              return {
                leftX: lRect.left - neckRect.left + 3,
                rightX: rRect.right - neckRect.left - 8,
                topY: lRect.top - neckRect.top,
                botY: lRect.bottom - neckRect.top,
              };
            });

            if (measured.some((m) => m === null)) return;
            const validRows = measured as Array<{
              leftX: number;
              rightX: number;
              topY: number;
              botY: number;
            }>;

            const n = validRows.length;
            const pts: string[] = [
              `${validRows[0].leftX},${validRows[0].topY + 3}`,
              `${validRows[0].rightX},${validRows[0].topY + 3}`,
            ];

            for (let i = 0; i < n - 1; i++) {
              const midY = (validRows[i].botY + validRows[i + 1].topY) / 2;
              if (Math.abs(validRows[i].rightX - validRows[i + 1].rightX) > 0.5) {
                pts.push(`${validRows[i].rightX},${midY}`);
                pts.push(`${validRows[i + 1].rightX},${midY}`);
              }
            }

            pts.push(`${validRows[n - 1].rightX},${validRows[n - 1].botY - 3}`);
            pts.push(`${validRows[n - 1].leftX},${validRows[n - 1].botY - 3}`);

            for (let i = n - 1; i > 0; i--) {
              const midY = (validRows[i - 1].botY + validRows[i].topY) / 2;
              if (Math.abs(validRows[i].leftX - validRows[i - 1].leftX) > 0.5) {
                pts.push(`${validRows[i].leftX},${midY}`);
                pts.push(`${validRows[i - 1].leftX},${midY}`);
              }
            }

            nextStepped.push({
              id: block.id,
              points: pts.join(' '),
              color: block.color,
            });
            return;
          }

          const topLeft = neck.querySelector<HTMLElement>(
            `[data-string-index="${block.topStringIndex}"][data-fret="${block.startFret}"]`
          );
          const bottomRight = neck.querySelector<HTMLElement>(
            `[data-string-index="${block.bottomStringIndex}"][data-fret="${block.endFret}"]`
          );
          if (!topLeft || !bottomRight) return;

          const tlRect = topLeft.getBoundingClientRect();
          const brRect = bottomRight.getBoundingClientRect();
          nextRects.push({
            id: block.id,
            label: block.label,
            color: block.color,
            left: tlRect.left - neckRect.left + 3,
            top: tlRect.top - neckRect.top + 3,
            width: brRect.right - tlRect.left - 11,
            height: brRect.bottom - tlRect.top - 6,
          });
        });

        setTileBlockRects(nextRects);
        setSteppedTiles(nextStepped);
      } else {
        setTileBlockRects((prev) => (prev.length === 0 ? prev : []));
        setSteppedTiles((prev) => (prev.length === 0 ? prev : []));
      }

      if (shouldComputeTriads) {
        const nextTriadShapes: TriadShapeOverlay[] = [];

        triadVoicings.forEach((voicing) => {
          const pts: string[] = [];
          for (const note of voicing.notes) {
            const cell = neck.querySelector<HTMLElement>(
              `[data-string-index="${note.stringIndex}"][data-fret="${note.fret}"]`
            );
            if (!cell) return;
            const r = cell.getBoundingClientRect();
            const x = r.left - neckRect.left + r.width / 2;
            const y = r.top - neckRect.top + r.height / 2;
            pts.push(`${x},${y}`);
          }
          if (pts.length === voicing.notes.length && pts.length >= 3) {
            nextTriadShapes.push({
              id: voicing.id,
              points: pts.join(' '),
              color: voicing.color ?? INVERSION_COLORS[voicing.inversion],
              isDimmed:
                activeTriadVoicingId !== null && activeTriadVoicingId !== voicing.id,
            });
          }
        });

        setTriadShapes(nextTriadShapes);
      } else {
        setTriadShapes((prev) => (prev.length === 0 ? prev : []));
      }
    };

    computeOverlays();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(computeOverlays);
    observer.observe(neck);
    return () => observer.disconnect();
  }, [
    connectSameNotes,
    patternFilter,
    tileFilter,
    overlayBlocks,
    triadVoicings,
    activeTriadVoicingId,
    selectedPitchClasses,
    maxFret,
    strings,
  ]);

  return (
    <div className="fretboard-scroll">
      <div className="fretboard" role="grid" aria-label="Guitar fretboard">
        {/* Top fret numbers */}
        <div className="fretboard-header-row">
          <div className="fretboard-string-label-spacer" />
          {frets.map((fret) => (
            <div
              key={`hdr-${fret}`}
              className={`fretboard-fret-num ${fret === 0 ? 'is-nut' : ''} ${
                INLAY_FRETS.has(fret) ? 'is-inlay' : ''
              }`}
            >
              {fret === 0 ? 'Open' : fret}
            </div>
          ))}
        </div>

        {/* 6 Strings (String 1 at top -> String 6 at bottom) */}
        <div className="fretboard-neck" ref={neckRef}>
          {tileBlockRects.map((block) => (
            <div
              key={block.id}
              className="fretboard-tile-block"
              style={
                {
                  left: `${block.left}px`,
                  top: `${block.top}px`,
                  width: `${block.width}px`,
                  height: `${block.height}px`,
                  '--tile-color': block.color,
                } as React.CSSProperties
              }
              aria-hidden="true"
            />
          ))}
          {(segments.length > 0 || triadShapes.length > 0 || steppedTiles.length > 0) && (
            <svg className="fretboard-lines-svg" aria-hidden="true">
              {steppedTiles.map((tile) => (
                <polygon
                  key={`step-${tile.id}`}
                  points={tile.points}
                  fill={tile.color}
                  fillOpacity={0.14}
                  stroke={tile.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              ))}
              {triadShapes.map((shape) => (
                <g key={`triad-${shape.id}`} opacity={shape.isDimmed ? 0.2 : 0.95}>
                  <polygon
                    points={shape.points}
                    fill={shape.color}
                    fillOpacity={shape.isDimmed ? 0.04 : 0.14}
                    stroke="rgba(15, 23, 42, 0.85)"
                    strokeWidth={6}
                    strokeLinejoin="round"
                  />
                  <polygon
                    points={shape.points}
                    fill="none"
                    stroke={shape.color}
                    strokeWidth={3}
                    strokeLinejoin="round"
                  />
                </g>
              ))}
              {segments.map((seg) => (
                <g key={seg.key}>
                  <line
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x2}
                    y2={seg.y2}
                    stroke="rgba(15, 23, 42, 0.85)"
                    strokeWidth={6}
                    strokeLinecap="round"
                  />
                  <line
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x2}
                    y2={seg.y2}
                    stroke={seg.color}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                </g>
              ))}
            </svg>
          )}
          {strings.map((openPc, stringIndex) => {
            const openLabel = formatPitchClass(openPc, accidentals);
            const stringThickness = 1 + stringIndex * 0.35;

            return (
              <div key={`str-${stringIndex}`} className="fretboard-string-row" role="row">
                <div
                  className="fretboard-string-name"
                  title={`String ${stringIndex + 1} (${openLabel})`}
                >
                  {stringIndex + 1}
                </div>

                {frets.map((fret) => {
                  const pc = getFretPitchClass(openPc, fret);
                  const noteLabel = formatPitchClass(pc, accidentals);
                  const key = makeFretKey(stringIndex, fret);
                  const isSelected = selectedFrets.has(key);
                  const customMarker = getMarker?.(stringIndex, fret, pc) ?? null;

                  let marker: FretMarker | null = customMarker;
                  if (isSelected) {
                    marker = {
                      label: customMarker?.label ?? noteLabel,
                      color: customMarker?.color ?? PITCH_CLASS_COLORS[pc],
                      border: 'selected',
                    };
                  } else if (!marker && connectSameNotes && selectedPitchClasses.has(pc)) {
                    marker = {
                      label: noteLabel,
                      color: PITCH_CLASS_COLORS[pc],
                      border: 'solid',
                    };
                  } else if (
                    !marker &&
                    showAllNotes &&
                    (showAccidentals || isNaturalPitchClass(pc))
                  ) {
                    marker = {
                      label: noteLabel,
                      color: PITCH_CLASS_COLORS[pc],
                      border: 'muted',
                    };
                  }

                  const isDoubleInlay = fret === 12 && (stringIndex === 0 || stringIndex === 4);
                  const isSingleInlay =
                    INLAY_FRETS.has(fret) && fret !== 12 && stringIndex === 2;

                  return (
                    <button
                      key={key}
                      type="button"
                      data-pc={pc}
                      data-string-index={stringIndex}
                      data-fret={fret}
                      className={`fret-cell ${fret === 0 ? 'is-nut' : ''}`}
                      onClick={() => {
                        if (playSoundOnClick) {
                          playFretNote(openPc, stringIndex, fret);
                        }
                        onToggleFret?.(stringIndex, fret, pc);
                      }}
                      title={`String ${stringIndex + 1} (${openLabel}), Fret ${fret}: ${noteLabel}`}
                      aria-label={`String ${stringIndex + 1} fret ${fret} ${noteLabel}`}
                      aria-pressed={isSelected}
                    >
                      {fret > 0 && (
                        <span
                          className="fret-string-wire"
                          style={{ height: `${stringThickness}px` }}
                        />
                      )}
                      {(isSingleInlay || isDoubleInlay) && (
                        <span className="fret-inlay-dot" aria-hidden="true" />
                      )}
                      {marker ? (
                        <span
                          className={`fret-note-badge border-${marker.border}`}
                          style={{ backgroundColor: marker.color }}
                        >
                          {marker.label}
                        </span>
                      ) : (
                        <span className="fret-hover-ghost">{noteLabel}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom unobstructed fret-marker strip */}
        <div className="fretboard-marker-row" aria-hidden="true">
          <div className="fretboard-string-label-spacer" />
          {frets.map((fret) => (
            <div
              key={`mkr-${fret}`}
              className={`fretboard-marker-cell ${fret === 0 ? 'is-nut' : ''}`}
            >
              {fret === 12 ? (
                <span className="fretboard-marker-double">
                  <span className="fretboard-marker-pip" />
                  <span className="fretboard-marker-pip" />
                </span>
              ) : INLAY_FRETS.has(fret) ? (
                <span className="fretboard-marker-pip" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

