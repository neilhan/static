import { StrategyResult } from "../../calculator";
import { formatCompact } from "../../formatters";

export interface BalancesChartProps {
  strat: StrategyResult;
  hoverLineX: number | null;
}

export function BalancesChart({ strat, hoverLineX }: BalancesChartProps) {
  const data = strat.history;
  const maxLen = data.length;
  if (maxLen === 0) {
    return <p style={{ padding: "2rem", textAlign: "center" }}>No data available</p>;
  }

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

  const gridLines = [0, 1, 2, 3, 4].map((i) => {
    const yVal = (maxVal / 4) * i;
    const yPos = getY(yVal);
    return { i, yVal, yPos };
  });

  const step = Math.max(1, Math.floor(maxLen / 6));
  const xLabels: Array<{ idx: number; xPos: number; age: number }> = [];
  for (let i = 0; i < maxLen; i += step) {
    xLabels.push({ idx: i, xPos: getX(i), age: data[i].age });
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart" id="svg-chart-el">
      <defs>
        <linearGradient id="total-wealth-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--total-color)" stopOpacity={0.22} />
          <stop offset="90%" stopColor="var(--total-color)" stopOpacity={0.01} />
        </linearGradient>
      </defs>

      {gridLines.map((g) => (
        <g key={g.i}>
          <line
            x1={padLeft}
            y1={g.yPos}
            x2={width - padRight}
            y2={g.yPos}
            className="chart-grid-line"
          />
          <text
            x={padLeft - 8}
            y={g.yPos + 4}
            textAnchor="end"
            className="chart-axis-label"
          >
            {formatCompact(g.yVal)}
          </text>
        </g>
      ))}

      {xLabels.map((lbl) => (
        <text
          key={lbl.idx}
          x={lbl.xPos}
          y={height - 10}
          textAnchor="middle"
          className="chart-axis-label"
        >
          Age {lbl.age}
        </text>
      ))}

      <path d={totalAreaPath} fill="url(#total-wealth-grad)" />
      <path d={tfsaPath} className="chart-line tfsa" />
      <path d={piPath} className="chart-line nonreg" />
      {hasCorp && <path d={corpPath} className="chart-line corp" />}
      <path d={rrspPath} className="chart-line rrsp" />
      <path d={totalPath} className="chart-line total" />

      <line
        id="hover-line"
        x1={hoverLineX ?? 0}
        y1={padTop}
        x2={hoverLineX ?? 0}
        y2={padTop + plotH}
        className="chart-hover-line"
        style={{ display: hoverLineX !== null ? "block" : "none" }}
      />
    </svg>
  );
}
