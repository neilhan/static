import { formatCurrency } from "../../formatters";

export interface CouplesTaxBannerProps {
  title: string;
  description: string;
  annualSavings: number;
  subLabel: string;
}

/**
 * Reusable Couples Pension & Corporate Dividend Splitting Banner
 */
export function renderCouplesTaxBanner({
  title,
  description,
  annualSavings,
  subLabel,
}: CouplesTaxBannerProps): string {
  if (annualSavings <= 0) return "";
  return `
    <div class="couple-tax-banner">
      <div class="couple-tax-text">
        <h4>${title}</h4>
        <p>${description}</p>
      </div>
      <div class="couple-tax-val">
        +${formatCurrency(annualSavings)}/yr
        <div style="font-size:0.75rem;font-weight:500;color:#6ee7b7;">${subLabel}</div>
      </div>
    </div>
  `;
}

