import { CSSProperties } from "react";
import { InlineSliderRow, InlineSliderRowProps } from "./SliderField";

export interface GainSubSliderProps {
  label: string;
  dispId: string;
  displayText: string;
  color: string;
  sliderId: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
}

export interface AccountAllocCardProps {
  variant: "p1" | "p2" | "pi" | "corp" | "tfsa";
  icon: string;
  title: string;
  badgeId?: string;
  badgeClass?: string;
  badgeText: string;
  badgeStyle?: CSSProperties;
  subtitle: string;
  dispId: string;
  displayValue: string;
  slider: InlineSliderRowProps;
  subSlider?: GainSubSliderProps;
}

export function AccountAllocCard({
  variant,
  icon,
  title,
  badgeId,
  badgeClass,
  badgeText,
  badgeStyle,
  subtitle,
  dispId,
  displayValue,
  slider,
  subSlider,
}: AccountAllocCardProps) {
  return (
    <div className={`alloc-card ${variant}`}>
      <div className="alloc-card-header">
        <span className="alloc-card-title">
          <span>{icon}</span> {title}
        </span>
        {badgeClass ? (
          <span id={badgeId} className={badgeClass} style={badgeStyle}>
            {badgeText}
          </span>
        ) : (
          <span
            id={badgeId}
            style={badgeStyle ?? { fontSize: "0.72rem", color: "var(--text-muted)" }}
          >
            {badgeText}
          </span>
        )}
      </div>
      <div className="form-label-row" style={{ marginBottom: "0.25rem" }}>
        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{subtitle}</span>
        <span id={dispId} className="form-val-display">
          {displayValue}
        </span>
      </div>
      <InlineSliderRow {...slider} />
      {subSlider && (
        <div className="pi-gain-subbox">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.72rem",
              marginBottom: "0.2rem",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>{subSlider.label}</span>
            <span
              id={subSlider.dispId}
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: subSlider.color,
              }}
            >
              {subSlider.displayText}
            </span>
          </div>
          <input
            type="range"
            id={subSlider.sliderId}
            min={subSlider.min ?? 0}
            max={subSlider.max ?? 95}
            step={subSlider.step ?? 5}
            value={subSlider.value}
            style={{ width: "100%" }}
            onChange={(e) => subSlider.onChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      )}
    </div>
  );
}
