import { StrategyResult } from "../../calculator";
import { formatCurrency } from "../../formatters";
import { state } from "../../state";

/**
 * Interactive Chart Tooltip & Hover Crosshair Handler
 */
export function setupSimulatorChartHover(
  strat: StrategyResult,
  _isCouple: boolean,
  onSelectAge?: (age: number) => void
): void {
  const chartWrapper = document.getElementById("chart-container");
  const svg = document.getElementById("svg-chart-el");
  const hoverLine = document.getElementById("hover-line");
  const tooltip = document.getElementById("chart-tooltip");

  if (!chartWrapper || !svg || !hoverLine || !tooltip) return;

  let lastHoveredAge: number | null = null;
  const hasCorp =
    strat.terminalBalanceAtRetirement.corp > 0 || strat.history.some((h) => h.corpEnd > 0);

  if (state.chartViewMode === "incomeStreams") {
    const retireData = strat.history.filter((d) => d.age >= state.retireAge);
    const count = retireData.length;
    if (count <= 0) return;

    chartWrapper.addEventListener("mousemove", (e) => {
      const rect = chartWrapper.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const relX = mouseX / rect.width;

      const padLeftPct = 70 / 800;
      const padRightPct = 20 / 800;
      const plotWPct = 1 - padLeftPct - padRightPct;

      if (relX < padLeftPct || relX > 1 - padRightPct) {
        hoverLine.style.display = "none";
        tooltip.style.display = "none";
        lastHoveredAge = null;
        return;
      }

      const plotProgress = (relX - padLeftPct) / plotWPct;
      const index = Math.min(count - 1, Math.max(0, Math.round(plotProgress * (count - 1))));
      const d = retireData[index];
      lastHoveredAge = d.age;

      const lineSvgX = 70 + (index / Math.max(1, count - 1)) * (800 - 90);
      hoverLine.setAttribute("x1", lineSvgX.toString());
      hoverLine.setAttribute("x2", lineSvgX.toString());
      hoverLine.style.display = "block";

      const ageHeader = d.person2Age
        ? `P1: Age ${d.age} · P2: Age ${d.person2Age}`
        : `Age ${d.age}`;

      const cpp = d.cppIncome || 0;
      const oas = d.oasIncome || 0;
      const dbAndOther = (d.dbPensionIncome || 0) + (d.otherIncome || 0);
      const corp = d.corpGrossDraw || 0;
      const totalGross =
        cpp + oas + dbAndOther + d.rrspGrossDraw + d.piGrossDraw + corp + d.tfsaGrossDraw;

      tooltip.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 0.35rem; color: #fff;">
          ${ageHeader} (Year ${d.age - state.retireAge + 1} of Retirement)
        </div>
        <div style="color: #10b981; font-weight: 700; margin-bottom: 0.35rem; font-size: 0.9rem;">
          Net Spending: ${formatCurrency(d.netSpendReceived)}
        </div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem;">
          Total Gross Cash Inflows: ${formatCurrency(totalGross)}
        </div>
        ${cpp > 0 ? `<div style="color:#3b82f6;">🏛️ CPP: <strong>+${formatCurrency(cpp)}</strong></div>` : ""}
        ${oas > 0 ? `<div style="color:#60a5fa;">🏛️ OAS: <strong>+${formatCurrency(oas)}</strong></div>` : ""}
        ${dbAndOther > 0 ? `<div style="color:#818cf8;">💼 DB/Other: <strong>+${formatCurrency(dbAndOther)}</strong></div>` : ""}
        ${d.rrspGrossDraw > 0 ? `<div style="color:var(--rrsp-color);">🟣 RRSP Draw: <strong>+${formatCurrency(d.rrspGrossDraw)}</strong></div>` : ""}
        ${d.piGrossDraw > 0 ? `<div style="color:var(--nonreg-color);">🟠 PI Draw: <strong>+${formatCurrency(d.piGrossDraw)}</strong></div>` : ""}
        ${corp > 0 ? `<div style="color:var(--corp-color);">🏢 Corp Div/CDA: <strong>+${formatCurrency(corp)}</strong></div>` : ""}
        ${d.tfsaGrossDraw > 0 ? `<div style="color:var(--tfsa-color);">🟢 TFSA Draw: <strong>+${formatCurrency(d.tfsaGrossDraw)}</strong></div>` : ""}
        <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:0.35rem;padding-top:0.35rem;font-size:0.75rem;color:var(--text-muted);">
          Total Tax Paid: <strong style="color:#ef4444;">${formatCurrency(d.totalTax)}</strong>
          ${d.isOASCapped ? `<br/><span style="color:#10b981;">🛡️ Clawback Shield Active</span>` : ""}
          ${d.isRRIFForced ? `<br/><span style="color:#f59e0b;">⚠️ Mandatory RRIF Min Active</span>` : ""}
          <div style="margin-top:0.25rem;color:#93c5fd;font-style:italic;">💡 Click to inspect this age in Blueprint below</div>
        </div>
      `;

      const tipLeft = Math.min(rect.width - 200, Math.max(10, mouseX - 100));
      tooltip.style.left = `${tipLeft}px`;
      tooltip.style.top = `30px`;
      tooltip.style.display = "block";
    });

    chartWrapper.addEventListener("click", () => {
      if (lastHoveredAge !== null && onSelectAge) {
        onSelectAge(lastHoveredAge);
      }
    });

    chartWrapper.addEventListener("mouseleave", () => {
      hoverLine.style.display = "none";
      tooltip.style.display = "none";
      lastHoveredAge = null;
    });

    return;
  }

  // Balances Mode
  const data = strat.history;
  const maxLen = data.length;
  if (maxLen <= 0) return;

  chartWrapper.addEventListener("mousemove", (e) => {
    const rect = chartWrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relX = mouseX / rect.width;

    const padLeftPct = 70 / 800;
    const padRightPct = 20 / 800;
    const plotWPct = 1 - padLeftPct - padRightPct;

    if (relX < padLeftPct || relX > 1 - padRightPct) {
      hoverLine.style.display = "none";
      tooltip.style.display = "none";
      return;
    }

    const plotProgress = (relX - padLeftPct) / plotWPct;
    const index = Math.min(maxLen - 1, Math.max(0, Math.round(plotProgress * (maxLen - 1))));

    const lineSvgX = 70 + (index / Math.max(1, maxLen - 1)) * (800 - 90);
    hoverLine.setAttribute("x1", lineSvgX.toString());
    hoverLine.setAttribute("x2", lineSvgX.toString());
    hoverLine.style.display = "block";

    const d = data[index];
    const isRetire = d.age >= state.retireAge;
    const ageHeader = d.person2Age
      ? `P1: Age ${d.age} · P2: Age ${d.person2Age}`
      : `Age ${d.age}`;

    tooltip.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 0.35rem; color: #fff;">
        ${ageHeader} (${isRetire ? "Retirement" : "Accumulating"})
      </div>
      <div style="color: var(--total-color); font-weight: 700; margin-bottom: 0.35rem; font-size: 0.9rem;">
        Total Wealth: ${formatCurrency(d.totalEnd)}
      </div>
      <div style="color: var(--rrsp-color);">RRSP: <strong>${formatCurrency(d.rrspEnd)}</strong></div>
      <div style="color: var(--nonreg-color);">PI: <strong>${formatCurrency(d.piEnd)}</strong></div>
      ${hasCorp || d.corpEnd > 0 ? `<div style="color: var(--corp-color);">Corp: <strong>${formatCurrency(d.corpEnd)}</strong></div>` : ""}
      <div style="color: var(--tfsa-color);">TFSA: <strong>${formatCurrency(d.tfsaEnd)}</strong></div>
      <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:0.35rem;padding-top:0.35rem;">
        ${
          isRetire
            ? `
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.2rem;">Retirement Cashflow:</div>
          ${
            d.guaranteedGross > 0
              ? `
            <div style="color:#60a5fa;">🏛️ Pensions: <strong>+${formatCurrency(d.guaranteedGross)} (${formatCurrency(d.guaranteedNet)} net)</strong></div>
            <div style="color:var(--text-secondary);font-size:0.75rem;">Portfolio Bridge: <strong>${formatCurrency(d.portfolioNetDraw)}</strong></div>`
              : ""
          }
          <div style="color:var(--rrsp-color);">RRSP Draw: <strong>${d.rrspGrossDraw > 0 ? formatCurrency(d.rrspGrossDraw) : "$0"}</strong></div>
          <div style="color:var(--nonreg-color);">PI Draw: <strong>${d.piGrossDraw > 0 ? formatCurrency(d.piGrossDraw) : "$0"}</strong></div>
          ${hasCorp || d.corpGrossDraw > 0 ? `<div style="color:var(--corp-color);">Corp Draw: <strong>${d.corpGrossDraw > 0 ? formatCurrency(d.corpGrossDraw) : "$0"}</strong></div>` : ""}
          <div style="color:var(--tfsa-color);">TFSA Draw: <strong>${d.tfsaGrossDraw > 0 ? formatCurrency(d.tfsaGrossDraw) : "$0"}</strong></div>
          <div style="color:#10b981;font-weight:700;margin-top:0.2rem;">Net Spending: ${formatCurrency(d.netSpendReceived)}</div>
          `
            : `
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.2rem;">Annual Savings Added:</div>
          <div style="color:var(--rrsp-color);">RRSP: <strong>+${formatCurrency(d.rrspContrib)}</strong></div>
          <div style="color:var(--nonreg-color);">PI: <strong>+${formatCurrency(d.piContrib)}</strong></div>
          ${d.corpContrib > 0 ? `<div style="color:var(--corp-color);">Corp: <strong>+${formatCurrency(d.corpContrib)}</strong></div>` : ""}
          ${d.tfsaContrib > 0 ? `<div style="color:var(--tfsa-color);">TFSA: <strong>+${formatCurrency(d.tfsaContrib)}</strong></div>` : ""}
          `
        }
      </div>
    `;

    const tipLeft = Math.min(rect.width - 180, Math.max(10, mouseX - 90));
    tooltip.style.left = `${tipLeft}px`;
    tooltip.style.top = `30px`;
    tooltip.style.display = "block";
  });

  chartWrapper.addEventListener("mouseleave", () => {
    hoverLine.style.display = "none";
    tooltip.style.display = "none";
  });
}

