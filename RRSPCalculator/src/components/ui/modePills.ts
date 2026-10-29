export interface ModePillOption {
  id: string;
  label: string;
  active: boolean;
}

export interface ModePillsProps {
  label: string;
  options: ModePillOption[];
  wrapperStyle?: string;
  hintHtml?: string;
  extraHtml?: string;
}

/**
 * Reusable Segmented Pill Selector (used for Planning Starting Point, Comparison Baseline, etc.).
 */
export function renderModePills({
  label,
  options,
  wrapperStyle,
  hintHtml,
  extraHtml = "",
}: ModePillsProps): string {
  const buttonsHtml = options
    .map(
      (opt) =>
        `<button type="button" id="${opt.id}" class="mode-pill ${opt.active ? "active" : ""}">${opt.label}</button>`
    )
    .join("");

  return `
    <div class="mode-selector"${wrapperStyle ? ` style="${wrapperStyle}"` : ""}>
      <div class="form-label-row" style="margin-bottom:0.25rem;">
        <span class="form-label">${label}</span>
      </div>
      <div class="mode-pills">
        ${buttonsHtml}
      </div>
      ${hintHtml ? `<div class="mode-hint">${hintHtml}</div>` : ""}
      ${extraHtml}
    </div>
  `;
}

