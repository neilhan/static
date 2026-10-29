import { StrategyResult } from "../../calculator";
import { formatCompact } from "../../formatters";
import { state } from "../../state";

/**
 * Stacked Bar SVG Chart for Annual Retirement Income Streams & Cashflow
 */
export function renderSimulatorIncomeSvgChart(strat: StrategyResult): string {
  const retireData = strat.history.filter((d) => d.age >= state.retireAge);
  const count = retireData.length;
  if (count === 0) {
    return `<p style="padding:2rem;text-align:center;color:var(--text-muted);">No retirement data available for current settings.</p>`;
  }

  let maxIncome = state.retireNetSpending;
  for (const d of retireData) {
    const totalGross =
      (d.cppIncome || 0) +
      (d.oasIncome || 0) +
      (d.dbPensionIncome || 0) +
      (d.otherIncome || 0) +
      d.rrspGrossDraw +
      d.piGrossDraw +
      (d.corpGrossDraw || 0) +
      d.tfsaGrossDraw;
    if (totalGross > maxIncome) maxIncome = totalGross;
  }
  maxIncome = Math.max(maxIncome, 10000) * 1.15;

  const width = 800;
  const height = 300;
  const padLeft = 70;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getY = (val: number) => padTop + plotH - (val / maxIncome) * plotH;
  const barWidth = Math.max(4, Math.min(22, (plotW / count) * 0.72));

  let gridLines = "";
  for (let i = 0; i <= 4; i++) {
    const yVal = (maxIncome / 4) * i;
    const yPos = getY(yVal);
    gridLines += `
      <line x1="${padLeft}" y1="${yPos.toFixed(1)}" x2="${(width - padRight).toFixed(1)}" y2="${yPos.toFixed(1)}" class="chart-grid-line" />
      <text x="${(padLeft - 8).toFixed(1)}" y="${(yPos + 4).toFixed(1)}" text-anchor="end" class="chart-axis-label">${formatCompact(yVal)}</text>
    `;
  }

  const targetY = getY(state.retireNetSpending);
  const targetLine = `
    <line x1="${padLeft}" y1="${targetY.toFixed(1)}" x2="${(width - padRight).toFixed(1)}" y2="${targetY.toFixed(1)}" stroke="#10b981" stroke-width="2" stroke-dasharray="5,4" />
    <text x="${(width - padRight).toFixed(1)}" y="${(targetY - 6).toFixed(1)}" text-anchor="end" fill="#10b981" font-size="11" font-weight="700">Target Net: ${formatCompact(state.retireNetSpending)}</text>
  `;

  let bars = "";
  let xLabels = "";
  const labelStep = Math.max(1, Math.floor(count / 7));

  for (let i = 0; i < count; i++) {
    const d = retireData[i];
    const xCenter = padLeft + (i / Math.max(1, count - 1)) * plotW;
    const xLeft = xCenter - barWidth / 2;

    if (i % labelStep === 0 || i === count - 1) {
      xLabels += `<text x="${xCenter.toFixed(1)}" y="${height - 10}" text-anchor="middle" class="chart-axis-label">Age ${d.age}</text>`;
    }

    const layers = [
      { val: d.cppIncome || 0, color: "#3b82f6" },
      { val: d.oasIncome || 0, color: "#60a5fa" },
      { val: (d.dbPensionIncome || 0) + (d.otherIncome || 0), color: "#818cf8" },
      { val: d.rrspGrossDraw || 0, color: "var(--rrsp-color)" },
      { val: d.piGrossDraw || 0, color: "var(--nonreg-color)" },
      { val: d.corpGrossDraw || 0, color: "var(--corp-color)" },
      { val: d.tfsaGrossDraw || 0, color: "var(--tfsa-color)" },
    ];

    let currentStackVal = 0;
    for (const layer of layers) {
      if (layer.val <= 0) continue;
      const segH = (layer.val / maxIncome) * plotH;
      const yTop = getY(currentStackVal + layer.val);
      bars += `<rect x="${xLeft.toFixed(1)}" y="${yTop.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${segH.toFixed(1)}" fill="${layer.color}" rx="1" opacity="0.9" />`;
      currentStackVal += layer.val;
    }
  }

  return `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart" id="svg-chart-el">
      ${gridLines}
      ${targetLine}
      ${bars}
      ${xLabels}
      <line id="hover-line" x1="0" y1="${padTop}" x2="0" y2="${padTop + plotH}" class="chart-hover-line" style="display:none;" />
    </svg>
  `;
}

