import { formatCurrency } from "../../formatters";

export interface CouplesTaxBannerProps {
  title: string;
  description: string;
  annualSavings: number;
  subLabel: string;
}

export function CouplesTaxBanner({
  title,
  description,
  annualSavings,
  subLabel,
}: CouplesTaxBannerProps) {
  if (annualSavings <= 0) return null;

  return (
    <div className="couple-tax-banner">
      <div className="couple-tax-text">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className="couple-tax-val">
        +{formatCurrency(annualSavings)}/yr
        <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6ee7b7" }}>
          {subLabel}
        </div>
      </div>
    </div>
  );
}
