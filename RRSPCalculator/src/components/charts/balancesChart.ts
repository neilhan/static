import { StrategyResult } from "../../calculator";
import { formatCompact } from "../../formatters";

/**
 * Multi-Account Balance Lifespan SVG Curve
 */
export function renderSimulatorSvgChart(strat: StrategyResult): string {
  const data = strat.history;
  const maxLen = data.length;
  if (maxLen === 0) return `<p style="padding:2rem;text-align:center;">No data available</p>`;

  let maxVal = 0;
  let hasCorp = strat.terminalBalanceAtRetirement.corp > 0;
  for (const d of data) {
    maxVal = Math.max(maxVal, d.totalEnd, d.rrspEnd, d.piEnd, d.corpEnd, d.tfsaEnd);
    if (d.corpEnd > 0) hasCorp = true;
  }
  maxVal = Math.max(maxVal, 10000) * 1.1;

  const width = 800;
  const height = 300;
  const padLeft = 70;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (idx: number) => padLeft + (idx / Math.max(1, maxLen - 1)) * plotW;
  const getY = (val: number) => padTop + plotH - (val / maxVal) * plotH;

  const buildPath = (key: "rrspEnd" | "piEnd" | "corpEnd" | "tfsaEnd" | "totalEnd") =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(d[key]).toFixed(1)}`)
      .join(" ");

  const totalPath = buildPath("totalEnd");
  const rrspPath = buildPath("rrspEnd");
  const piPath = buildPath("piEnd");
  const corpPath = hasCorp ? buildPath("corpEnd") : "";
  const tfsaPath = buildPath("tfsaEnd");

  const firstX = getX(0).toFixed(1);
  const lastX = getX(maxLen - 1).toFixed(1);
  const bottomY = (padTop + plotH).toFixed(1);
  const totalAreaPath = `${totalPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

  let gridLines = "";
  for (let i = 0; i <= 4; i++) {
    const yVal = (maxVal / 4) * i;
    const yPos = getY(yVal);
    gridLines += `
      <line x1="${padLeft}" y1="${yPos}" x2="${width - padRight}" y2="${yPos}" class="chart-grid-line" />
      <text x="${padLeft - 8}" y="${yPos + 4}" text-anchor="end" class="chart-axis-label">${formatCompact(yVal)}</text>
    `;
  }

  let xLabels = "";
  const step = Math.max(1, Math.floor(maxLen / 6));
  for (let i = 0; i < maxLen; i += step) {
    const d = data[i];
    const xPos = getX(i);
    xLabels += `<text x="${xPos}" y="${height - 10}" text-anchor="middle" class="chart-axis-label">Age ${d.age}</text>`;
  }

  return `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart" id="svg-chart-el">
      <defs>
        <linearGradient id="total-wealth-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--total-color)" stop-opacity="0.22" />
          <stop offset="90%" stop-color="var(--total-color)" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      ${gridLines}
      ${xLabels}
      <path d="${totalAreaPath}" fill="url(#total-wealth-grad)" />
      <path d="${tfsaPath}" class="chart-line tfsa" />
      <path d="${piPath}" class="chart-line nonreg" />
      ${hasCorp ? `<path d="${corpPath}" class="chart-line corp" />` : ""}
      <path d="${rrspPath}" class="chart-line rrsp" />
      <path d="${totalPath}" class="chart-line total" />
      <line id="hover-line" x1="0" y1="${padTop}" x2="0" y2="${padTop + plotH}" class="chart-hover-line" style="display:none;" />
    </svg>
  `;
}

