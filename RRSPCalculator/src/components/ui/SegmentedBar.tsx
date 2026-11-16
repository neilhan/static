import { CSSProperties } from "react";

export interface BarSegmentItem {
  key: string;
  segId?: string;
  lblId?: string;
  variant: string;
  pct: number;
  labelText: string;
  labelColor: string;
  labelWeight?: string | number;
  title?: string;
  hiddenWhenZero?: boolean;
  isZero?: boolean;
}

export interface SegmentedBarProps {
  segments: BarSegmentItem[];
  barHeightPx?: number;
  wrapperStyle?: CSSProperties;
}

export function SegmentedBar({
  segments,
  barHeightPx,
  wrapperStyle,
}: SegmentedBarProps) {
  return (
    <div className="allocation-bar-wrapper" style={wrapperStyle}>
      <div
        className="allocation-bar"
        style={barHeightPx ? { height: `${barHeightPx}px` } : undefined}
      >
        {segments.map((s) => {
          if (s.hiddenWhenZero && s.isZero && !s.segId) return null;
          return (
            <div
              key={s.key}
              id={s.segId}
              className={`alloc-segment ${s.variant}`}
              style={{ width: `${s.pct}%` }}
              title={s.title}
            />
          );
        })}
      </div>
      <div className="alloc-labels-row">
        {segments.map((s) => {
          if (s.hiddenWhenZero && s.isZero && !s.lblId) return null;
          const hidden = Boolean(s.hiddenWhenZero && s.isZero);
          return (
            <span
              key={s.key}
              id={s.lblId}
              style={{
                color: s.labelColor,
                fontWeight: s.labelWeight,
                display: hidden ? "none" : undefined,
              }}
            >
              {s.labelText}
            </span>
          );
        })}
      </div>
    </div>
  );
}
