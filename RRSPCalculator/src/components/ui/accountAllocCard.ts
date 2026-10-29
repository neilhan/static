import { InlineSliderRowProps, renderInlineSliderRow } from "./sliderField";

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
}

export interface AccountAllocCardProps {
  variant: "p1" | "p2" | "pi" | "corp" | "tfsa";
  icon: string;
  title: string;
  badgeId?: string;
  badgeClass?: string;
  badgeText: string;
  badgeStyle?: string;
  subtitle: string;
  dispId: string;
  displayValue: string;
  slider: InlineSliderRowProps;
  subSlider?: GainSubSliderProps;
}

/**
 * Reusable Account Allocation Card (used in both Working-Years Savings and Start-at-Retirement Breakdown).
 */
export function renderAccountAllocCard(props: AccountAllocCardProps): string {
  const {
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
  } = props;

  const badgeHtml = badgeClass
    ? `<span${badgeId ? ` id="${badgeId}"` : ""} class="${badgeClass}"${badgeStyle ? ` style="${badgeStyle}"` : ""}>${badgeText}</span>`
    : `<span${badgeId ? ` id="${badgeId}"` : ""} style="${badgeStyle ?? "font-size:0.72rem;color:var(--text-muted);"}">${badgeText}</span>`;

  const subSliderHtml = subSlider
    ? `
      <div class="pi-gain-subbox">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.72rem;margin-bottom:0.2rem;">
          <span style="color:var(--text-secondary);">${subSlider.label}</span>
          <span id="${subSlider.dispId}" style="font-family:var(--font-mono);font-weight:600;color:${subSlider.color};">
            ${subSlider.displayText}
          </span>
        </div>
        <input type="range" id="${subSlider.sliderId}" min="${subSlider.min ?? 0}" max="${subSlider.max ?? 95}" step="${subSlider.step ?? 5}" value="${subSlider.value}" style="width:100%;">
      </div>
    `
    : "";

  return `
    <div class="alloc-card ${variant}">
      <div class="alloc-card-header">
        <span class="alloc-card-title">
          <span>${icon}</span> ${title}
        </span>
        ${badgeHtml}
      </div>
      <div class="form-label-row" style="margin-bottom:0.25rem;">
        <span style="font-size:0.74rem;color:var(--text-muted);">${subtitle}</span>
        <span id="${dispId}" class="form-val-display">${displayValue}</span>
      </div>
      ${renderInlineSliderRow(slider)}
      ${subSliderHtml}
    </div>
  `;
}

