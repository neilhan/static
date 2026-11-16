import { CSSProperties, ReactNode, useEffect, useState } from "react";

export interface InlineSliderRowProps {
  sliderId: string;
  numId: string;
  value: number;
  sliderMin: number;
  sliderMax: number;
  numMin?: number;
  numMax?: number;
  step: number;
  minVal?: number;
  onChange: (val: number) => void;
}

export function InlineSliderRow({
  sliderId,
  numId,
  value,
  sliderMin,
  sliderMax,
  numMin = sliderMin,
  numMax = sliderMax,
  step,
  minVal,
  onChange,
}: InlineSliderRowProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(value.toString());

  useEffect(() => {
    if (!focused) {
      setDraft(value.toString());
    }
  }, [value, focused]);

  const clampedSliderVal = Math.min(sliderMax, Math.max(sliderMin, value));

  return (
    <div className="slider-container">
      <input
        type="range"
        id={sliderId}
        min={sliderMin}
        max={sliderMax}
        step={step}
        value={clampedSliderVal}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) {
            const next = minVal !== undefined ? Math.max(minVal, v) : v;
            setDraft(next.toString());
            onChange(next);
          }
        }}
      />
      <input
        type="number"
        id={numId}
        className="form-input-number"
        min={numMin}
        max={numMax}
        step={step}
        value={focused ? draft : value}
        onFocus={() => {
          setFocused(true);
          setDraft(value.toString());
        }}
        onBlur={() => {
          setFocused(false);
          setDraft(value.toString());
        }}
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          const v = parseFloat(raw);
          if (!Number.isNaN(v)) {
            const next = minVal !== undefined ? Math.max(minVal, v) : v;
            onChange(next);
          }
        }}
      />
    </div>
  );
}

export interface SliderFieldProps extends InlineSliderRowProps {
  id?: string;
  label: string;
  dispId: string;
  displayContent: ReactNode;
  displayStyle?: CSSProperties;
  extra?: ReactNode;
}

export function SliderField({
  id,
  label,
  sliderId,
  dispId,
  displayContent,
  displayStyle,
  extra,
  ...sliderProps
}: SliderFieldProps) {
  return (
    <div className="form-group" id={id}>
      <div className="form-label-row">
        <label className="form-label" htmlFor={sliderId}>
          {label}
        </label>
        <span className="form-val-display" id={dispId} style={displayStyle}>
          {displayContent}
        </span>
      </div>
      <InlineSliderRow sliderId={sliderId} {...sliderProps} />
      {extra}
    </div>
  );
}
