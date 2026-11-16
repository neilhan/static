import { CSSProperties, ReactNode } from "react";

export interface ModePillOption {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface ModePillsProps {
  label: string;
  options: ModePillOption[];
  wrapperStyle?: CSSProperties;
  hint?: ReactNode;
  extra?: ReactNode;
}

export function ModePills({
  label,
  options,
  wrapperStyle,
  hint,
  extra,
}: ModePillsProps) {
  return (
    <div className="mode-selector" style={wrapperStyle}>
      <div className="form-label-row" style={{ marginBottom: "0.25rem" }}>
        <span className="form-label">{label}</span>
      </div>
      <div className="mode-pills">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            id={opt.id}
            className={`mode-pill ${opt.active ? "active" : ""}`}
            onClick={opt.onClick}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {hint && <div className="mode-hint">{hint}</div>}
      {extra}
    </div>
  );
}
