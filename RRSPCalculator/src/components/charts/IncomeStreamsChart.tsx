import { StrategyResult } from "../../calculator";
import { formatCompact } from "../../formatters";

export interface IncomeStreamsChartProps {
  strat: StrategyResult;
  retireAge: number;
  retireNetSpending: number;
  hoverLineX: number | null;
}

export function IncomeStreamsChart({
  strat,
  retireAge,
  retireNetSpending,
  hoverLineX,
}: IncomeStreamsChartProps) {
  const retireData = strat.history.filter((d) => d.age >= retireAge);
  const count = retireData.length;
  if (count === 0) {
    return (
      <p style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
        No retirement data available for current settings.
      </p>
    );
  }

  let maxIncome = retireNetSpending;
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
  const targetY = getY(retireNetSpending);
  const labelStep = Math.max(1, Math.floor(count / 7));

  const gridLines = [0, 1, 2, 3, 4].map((i) => {
    const yVal = (maxIncome / 4) * i;
    const yPos = getY(yVal);
    return { i, yVal, yPos };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart" id="svg-chart-el">
      {gridLines.map((g) => (
        <g key={g.i}>
          <line
            x1={padLeft}
            y1={Number(g.yPos.toFixed(1))}
            x2={Number((width - padRight).toFixed(1))}
            y2={Number(g.yPos.toFixed(1))}
            className="chart-grid-line"
          />
          <text
            x={Number((padLeft - 8).toFixed(1))}
            y={Number((g.yPos + 4).toFixed(1))}
            textAnchor="end"
            className="chart-axis-label"
          >
            {formatCompact(g.yVal)}
          </text>
        </g>
      ))}

      <line
        x1={padLeft}
        y1={Number(targetY.toFixed(1))}
        x2={Number((width - padRight).toFixed(1))}
        y2={Number(targetY.toFixed(1))}
        stroke="#10b981"
        strokeWidth="2"
        strokeDasharray="5,4"
      />
      <text
        x={Number((width - padRight).toFixed(1))}
        y={Number((targetY - 6).toFixed(1))}
        textAnchor="end"
        fill="#10b981"
        fontSize="11"
        fontWeight="700"
      >
        Target Net: {formatCompact(retireNetSpending)}
      </text>

      {retireData.map((d, i) => {
        const xCenter = padLeft + (i / Math.max(1, count - 1)) * plotW;
        const xLeft = xCenter - barWidth / 2;

        const layers = [
          { key: "cpp", val: d.cppIncome || 0, color: "#3b82f6" },
          { key: "oas", val: d.oasIncome || 0, color: "#60a5fa" },
          {
            key: "db",
            val: (d.dbPensionIncome || 0) + (d.otherIncome || 0),
            color: "#818cf8",
          },
          { key: "rrsp", val: d.rrspGrossDraw || 0, color: "var(--rrsp-color)" },
          { key: "pi", val: d.piGrossDraw || 0, color: "var(--nonreg-color)" },
          { key: "corp", val: d.corpGrossDraw || 0, color: "var(--corp-color)" },
          { key: "tfsa", val: d.tfsaGrossDraw || 0, color: "var(--tfsa-color)" },
        ];

        let currentStackVal = 0;
        const rects = layers.map((layer) => {
          if (layer.val <= 0) return null;
          const segH = (layer.val / maxIncome) * plotH;
          const yTop = getY(currentStackVal + layer.val);
          currentStackVal += layer.val;
          return (
            <rect
              key={layer.key}
              x={Number(xLeft.toFixed(1))}
              y={Number(yTop.toFixed(1))}
              width={Number(barWidth.toFixed(1))}
              height={Number(segH.toFixed(1))}
              fill={layer.color}
              rx={1}
              opacity={0.9}
            />
          );
        });

        const showLabel = i % labelStep === 0 || i === count - 1;

        return (
          <g key={d.age}>
            {rects}
            {showLabel && (
              <text
                x={Number(xCenter.toFixed(1))}
                y={height - 10}
                textAnchor="middle"
                className="chart-axis-label"
              >
                Age {d.age}
              </text>
            )}
          </g>
        );
      })}

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
