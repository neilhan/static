import { CSSProperties } from "react";

export interface BlueprintColProps {
  variant: "rrsp" | "pi" | "corp" | "tfsa" | "net";
  icon: string;
  title: string;
  titleColor: string;
  amountText: string;
  amountColor?: string;
  noteText: string;
  customStyle?: CSSProperties;
}

export function BlueprintCol({
  variant,
  icon,
  title,
  titleColor,
  amountText,
  amountColor,
  noteText,
  customStyle,
}: BlueprintColProps) {
  return (
    <div className={`blueprint-col ${variant}`} style={customStyle}>
      <div className="blueprint-col-title" style={{ color: titleColor }}>
        <span>{icon}</span> {title}
      </div>
      <div
        className="blueprint-amount"
        style={amountColor ? { color: amountColor } : undefined}
      >
        {amountText}
      </div>
      <div className="blueprint-note">{noteText}</div>
    </div>
  );
}

export interface AccountCompareCardProps {
  cardVariant: "card-rrsp" | "card-nonreg" | "card-corp" | "card-tfsa";
  badgeText: string;
  accountName: string;
  longevityText: string;
  longevitySubText: string;
  metrics: Array<{ label: string; value: string }>;
}

export function AccountCompareCard({
  cardVariant,
  badgeText,
  accountName,
  longevityText,
  longevitySubText,
  metrics,
}: AccountCompareCardProps) {
  return (
    <article className={`card ${cardVariant}`}>
      <div className="card-header">
        <span className="card-badge">{badgeText}</span>
        <span className="card-title">{accountName}</span>
      </div>
      <div className="hero-metric">
        <div className="hero-metric-label">Retirement Longevity</div>
        <div className="hero-metric-val">{longevityText}</div>
        <div className="hero-metric-sub">{longevitySubText}</div>
      </div>
      <div className="metric-rows">
        {metrics.map((m) => (
          <div key={m.label} className="metric-row">
            <span className="metric-label">{m.label}</span>
            <span className="metric-val">{m.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
