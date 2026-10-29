export interface BarSegmentItem {
  segId?: string;
  lblId?: string;
  variant: string;
  pct: number;
  labelHtml: string;
  labelColor: string;
  labelWeight?: string;
  title?: string;
  hiddenWhenZero?: boolean;
  isZero?: boolean;
}

export interface SegmentedBarProps {
  segments: BarSegmentItem[];
  barHeightPx?: number;
  wrapperStyle?: string;
}

/**
 * Reusable proportional multi-segment allocation bar + color-coded labels row.
 */
export function renderSegmentedBar({
  segments,
  barHeightPx,
  wrapperStyle,
}: SegmentedBarProps): string {
  const barSegmentsHtml = segments
    .map((s) => {
      if (s.hiddenWhenZero && s.isZero && !s.segId) return "";
      return `<div${s.segId ? ` id="${s.segId}"` : ""} class="alloc-segment ${s.variant}" style="width: ${s.pct}%;"${s.title ? ` title="${s.title}"` : ""}></div>`;
    })
    .join("");

  const labelsHtml = segments
    .map((s) => {
      if (s.hiddenWhenZero && s.isZero && !s.lblId) return "";
      const displayRule = s.hiddenWhenZero && s.isZero ? "display:none;" : "";
      const weightRule = s.labelWeight ? `font-weight:${s.labelWeight};` : "";
      return `<span${s.lblId ? ` id="${s.lblId}"` : ""} style="color:${s.labelColor};${weightRule}${displayRule}">${s.labelHtml}</span>`;
    })
    .join("");

  return `
    <div class="allocation-bar-wrapper"${wrapperStyle ? ` style="${wrapperStyle}"` : ""}>
      <div class="allocation-bar"${barHeightPx ? ` style="height:${barHeightPx}px;"` : ""}>
        ${barSegmentsHtml}
      </div>
      <div class="alloc-labels-row">
        ${labelsHtml}
      </div>
    </div>
  `;
}

