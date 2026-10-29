import { StrategyResult } from "../../calculator";
import { state } from "../../state";
import { renderSimulatorSvgChart } from "../charts/balancesChart";
import { setupSimulatorChartHover } from "../charts/chartTooltip";
import { renderSimulatorIncomeSvgChart } from "../charts/incomeStreamsChart";
import { AppRenderCallbacks } from "../ui/types";
import { renderAdvisorPlanCard } from "./advisorPlanCard";
import { renderCouplesTaxBanner } from "./couplesBanner";
import { attachLedgerListeners, renderLedgerCard } from "./ledgerTable";
import {
  attachRetirementSummaryListeners,
  renderRetirementStartingSummaryCard,
} from "./retirementSummaryCard";
import {
  attachStrategySelectorListeners,
  renderStrategyScorecard,
  renderStrategySelectorSection,
} from "./strategySelector";
import {
  attachBlueprintListeners,
  renderWithdrawalBlueprintCard,
  setBlueprintAge,
} from "./withdrawalBlueprint";

function renderLifespanChartCard(
  currentStrat: StrategyResult,
  isCouple: boolean,
  hasCorp: boolean
): string {
  const currentAge1 = Math.max(18, state.retireAge - state.yearsAccumulation);

  return `
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <h3 style="font-family:var(--font-display);font-size:1.15rem;color:var(--text-primary);margin-bottom:0.2rem;">
            ${
              state.chartViewMode === "incomeStreams"
                ? `Annual Retirement Income & Cashflow Breakdown (Ages ${state.retireAge} to 95+)`
                : `Multi-Account Balance Lifespan Curve (Ages ${state.startAtRetirement ? state.retireAge : currentAge1} to 95+)`
            }
          </h3>
          <span style="font-size:0.75rem;color:var(--text-muted);">
            ${
              state.chartViewMode === "incomeStreams"
                ? "Stacked annual cashflow received from pensions, investments, corporate dividends, and government programs"
                : "Projected investment balances compounding and decumulating over your lifespan"
            }
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
          <div class="chart-view-toggle">
            <button type="button" class="chart-view-btn ${state.chartViewMode === "balances" ? "active" : ""}" id="btn-chart-balances">
              💰 Asset Balances
            </button>
            <button type="button" class="chart-view-btn ${state.chartViewMode === "incomeStreams" ? "active" : ""}" id="btn-chart-income">
              📊 Annual Income Streams
            </button>
          </div>
        </div>
      </div>
      <div class="chart-legend" style="margin-top:0.5rem;padding:0 0.5rem;">
        ${
          state.chartViewMode === "incomeStreams"
            ? `
          <div class="legend-item"><span class="income-legend-dot cpp"></span> CPP</div>
          <div class="legend-item"><span class="income-legend-dot oas"></span> OAS</div>
          <div class="legend-item"><span class="income-legend-dot db"></span> DB/Other</div>
          <div class="legend-item"><span class="income-legend-dot rrsp"></span> RRSP/RRIF Draw</div>
          <div class="legend-item"><span class="income-legend-dot pi"></span> Personal (PI) Draw</div>
          ${hasCorp ? `<div class="legend-item"><span class="income-legend-dot corp"></span> ${isCouple ? "Co-Owned Corp Draw" : "Corp Draw"}</div>` : ""}
          <div class="legend-item"><span class="income-legend-dot tfsa"></span> TFSA Draw</div>
          <div class="legend-item"><span style="width:12px;height:2px;background:#10b981;display:inline-block;border-top:1px dashed #10b981;"></span> Target Net Spend</div>
          `
            : `
          <div class="legend-item"><span class="legend-dot total"></span> <strong>Total Wealth</strong></div>
          <div class="legend-item"><span class="legend-dot rrsp"></span> ${isCouple ? "Joint RRSP/RRIF" : "RRSP/RRIF"}</div>
          <div class="legend-item"><span class="legend-dot nonreg"></span> Personal (PI)</div>
          ${hasCorp ? `<div class="legend-item"><span class="legend-dot corp"></span> ${isCouple ? "2-Person Co-Owned Corp" : "Private Corp"}</div>` : ""}
          <div class="legend-item"><span class="legend-dot tfsa"></span> ${isCouple ? "Dual TFSAs" : "TFSA"}</div>
          `
        }
      </div>
      <div class="svg-chart-wrapper" id="chart-container">
        ${
          state.chartViewMode === "incomeStreams"
            ? renderSimulatorIncomeSvgChart(currentStrat)
            : renderSimulatorSvgChart(currentStrat)
        }
        <div id="chart-tooltip" class="chart-tooltip"></div>
      </div>
    </div>
  `;
}

/**
 * Composes the full Simulator Results Panel from focused sub-components
 */
export function renderSimulatorResults(
  currentStrat: StrategyResult,
  allStrats: StrategyResult[],
  isCouple: boolean
): string {
  const bestStrat = [...allStrats].sort(
    (a, b) =>
      b.longevityYears - a.longevityYears ||
      a.totalLifetimeRetirementTax - b.totalLifetimeRetirementTax
  )[0];

  const corpDollars = currentStrat.corpSaving ?? state.corpSaving;
  const tb = currentStrat.terminalBalanceAtRetirement;
  const hasCorp =
    tb.corp > 0 || corpDollars > 0 || currentStrat.history.some((d) => d.corpEnd > 0);

  return `
    ${
      isCouple
        ? renderCouplesTaxBanner({
            title: "🎉 The Couples Pension & Dividend Splitting Advantage",
            description:
              "By splitting RRIF income (Form T1032) and CCPC corporate dividends 50/50 between two spouses, you utilize two sets of basic personal credits and keep income in lower brackets.",
            annualSavings: currentStrat.couplesAnnualTaxSavings ?? 0,
            subLabel: "Estimated Annual Tax Savings",
          })
        : ""
    }

    ${renderRetirementStartingSummaryCard(currentStrat, isCouple)}
    ${renderAdvisorPlanCard(currentStrat, isCouple, hasCorp)}
    ${renderStrategySelectorSection(bestStrat.id, isCouple, hasCorp)}
    ${renderWithdrawalBlueprintCard(currentStrat, isCouple, hasCorp)}
    ${renderStrategyScorecard(allStrats, bestStrat.id, isCouple)}
    ${renderLifespanChartCard(currentStrat, isCouple, hasCorp)}
    ${renderLedgerCard(currentStrat, isCouple)}
  `;
}

export function attachSimulatorViewListeners(
  currentStrat: StrategyResult,
  isCouple: boolean,
  cb: AppRenderCallbacks
): void {
  attachRetirementSummaryListeners(currentStrat, isCouple, cb);
  attachStrategySelectorListeners(cb);
  attachBlueprintListeners(currentStrat, isCouple, cb);
  attachLedgerListeners(cb);

  // Chart View Mode Toggle Buttons
  document.getElementById("btn-chart-balances")?.addEventListener("click", () => {
    if (state.chartViewMode !== "balances") {
      state.chartViewMode = "balances";
      cb.updateResultsOnly();
    }
  });

  document.getElementById("btn-chart-income")?.addEventListener("click", () => {
    if (state.chartViewMode !== "incomeStreams") {
      state.chartViewMode = "incomeStreams";
      cb.updateResultsOnly();
    }
  });

  setupSimulatorChartHover(currentStrat, isCouple, (age) =>
    setBlueprintAge(age, currentStrat, isCouple, cb)
  );
}

