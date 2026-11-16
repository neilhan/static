import { MouseEvent, useState } from "react";
import { DecumulationStrategy, StrategyResult } from "../../calculator";
import { AppState } from "../../state";
import { BalancesChart } from "../charts/BalancesChart";
import { ChartTooltip } from "../charts/ChartTooltip";
import { IncomeStreamsChart } from "../charts/IncomeStreamsChart";
import { AdvisorPlanCard } from "./AdvisorPlanCard";
import { CouplesTaxBanner } from "./CouplesBanner";
import { LedgerTable } from "./LedgerTable";
import { RetirementSummaryCard } from "./RetirementSummaryCard";
import { StrategyScorecard, StrategySelector } from "./StrategySelector";
import { WithdrawalBlueprint } from "./WithdrawalBlueprint";

interface HoverState {
  index: number;
  lineSvgX: number;
  tipLeft: number;
}

export interface SimulatorViewProps {
  currentStrat: StrategyResult;
  allStrats: StrategyResult[];
  state: AppState;
  isCouple: boolean;
  onSelectStrategy: (strategy: DecumulationStrategy) => void;
  onSelectChartViewMode: (mode: "balances" | "incomeStreams") => void;
  onSelectBlueprintAge: (age: number) => void;
  onToggleLedger: () => void;
  onCustomizeStartingAssets: (currentStrat: StrategyResult) => void;
  onSwitchToAccumulation: () => void;
  onEnablePensions: () => void;
}

export function SimulatorView({
  currentStrat,
  allStrats,
  state,
  isCouple,
  onSelectStrategy,
  onSelectChartViewMode,
  onSelectBlueprintAge,
  onToggleLedger,
  onCustomizeStartingAssets,
  onSwitchToAccumulation,
  onEnablePensions,
}: SimulatorViewProps) {
  const [hoverState, setHoverState] = useState<HoverState | null>(null);

  const bestStrat = [...allStrats].sort(
    (a, b) =>
      b.longevityYears - a.longevityYears ||
      a.totalLifetimeRetirementTax - b.totalLifetimeRetirementTax
  )[0];

  const corpDollars = currentStrat.corpSaving ?? state.corpSaving;
  const tb = currentStrat.terminalBalanceAtRetirement;
  const hasCorp =
    tb.corp > 0 || corpDollars > 0 || currentStrat.history.some((d) => d.corpEnd > 0);

  const currentAge1 = Math.max(18, state.retireAge - state.yearsAccumulation);

  const chartData =
    state.chartViewMode === "incomeStreams"
      ? currentStrat.history.filter((d) => d.age >= state.retireAge)
      : currentStrat.history;

  const hoveredRecord =
    hoverState && hoverState.index >= 0 && hoverState.index < chartData.length
      ? chartData[hoverState.index]
      : null;

  const handleChartMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const count = chartData.length;
    if (count <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relX = mouseX / rect.width;

    const padLeftPct = 70 / 800;
    const padRightPct = 20 / 800;
    const plotWPct = 1 - padLeftPct - padRightPct;

    if (relX < padLeftPct || relX > 1 - padRightPct) {
      setHoverState(null);
      return;
    }

    const plotProgress = (relX - padLeftPct) / plotWPct;
    const index = Math.min(count - 1, Math.max(0, Math.round(plotProgress * (count - 1))));
    const lineSvgX = 70 + (index / Math.max(1, count - 1)) * (800 - 90);
    const tipLeft =
      state.chartViewMode === "incomeStreams"
        ? Math.min(rect.width - 200, Math.max(10, mouseX - 100))
        : Math.min(rect.width - 180, Math.max(10, mouseX - 90));

    setHoverState({ index, lineSvgX, tipLeft });
  };

  const handleChartClick = () => {
    if (state.chartViewMode === "incomeStreams" && hoveredRecord) {
      onSelectBlueprintAge(hoveredRecord.age);
    }
  };

  return (
    <>
      {isCouple && (
        <CouplesTaxBanner
          title="🎉 The Couples Pension & Dividend Splitting Advantage"
          description="By splitting RRIF income (Form T1032) and CCPC corporate dividends 50/50 between two spouses, you utilize two sets of basic personal credits and keep income in lower brackets."
          annualSavings={currentStrat.couplesAnnualTaxSavings ?? 0}
          subLabel="Estimated Annual Tax Savings"
        />
      )}

      <RetirementSummaryCard
        currentStrat={currentStrat}
        state={state}
        isCouple={isCouple}
        onCustomizeStartingAssets={() => onCustomizeStartingAssets(currentStrat)}
        onSwitchToAccumulation={onSwitchToAccumulation}
      />

      <AdvisorPlanCard
        currentStrat={currentStrat}
        state={state}
        isCouple={isCouple}
        hasCorp={hasCorp}
      />

      <StrategySelector
        selectedStrategy={state.decumStrategy}
        bestStratId={bestStrat.id}
        isCouple={isCouple}
        hasCorp={hasCorp}
        onSelectStrategy={onSelectStrategy}
      />

      <WithdrawalBlueprint
        currentStrat={currentStrat}
        state={state}
        isCouple={isCouple}
        hasCorp={hasCorp}
        onSelectAge={onSelectBlueprintAge}
        onEnablePensions={onEnablePensions}
      />

      <StrategyScorecard
        allStrats={allStrats}
        selectedStrategy={state.decumStrategy}
        bestStratId={bestStrat.id}
        isCouple={isCouple}
      />

      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                color: "var(--text-primary)",
                marginBottom: "0.2rem",
              }}
            >
              {state.chartViewMode === "incomeStreams"
                ? `Annual Retirement Income & Cashflow Breakdown (Ages ${state.retireAge} to 95+)`
                : `Multi-Account Balance Lifespan Curve (Ages ${state.startAtRetirement ? state.retireAge : currentAge1} to 95+)`}
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {state.chartViewMode === "incomeStreams"
                ? "Stacked annual cashflow received from pensions, investments, corporate dividends, and government programs"
                : "Projected investment balances compounding and decumulating over your lifespan"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <div className="chart-view-toggle">
              <button
                type="button"
                className={`chart-view-btn ${state.chartViewMode === "balances" ? "active" : ""}`}
                id="btn-chart-balances"
                onClick={() => {
                  setHoverState(null);
                  onSelectChartViewMode("balances");
                }}
              >
                💰 Asset Balances
              </button>
              <button
                type="button"
                className={`chart-view-btn ${state.chartViewMode === "incomeStreams" ? "active" : ""}`}
                id="btn-chart-income"
                onClick={() => {
                  setHoverState(null);
                  onSelectChartViewMode("incomeStreams");
                }}
              >
                📊 Annual Income Streams
              </button>
            </div>
          </div>
        </div>

        <div className="chart-legend" style={{ marginTop: "0.5rem", padding: "0 0.5rem" }}>
          {state.chartViewMode === "incomeStreams" ? (
            <>
              <div className="legend-item">
                <span className="income-legend-dot cpp" /> CPP
              </div>
              <div className="legend-item">
                <span className="income-legend-dot oas" /> OAS
              </div>
              <div className="legend-item">
                <span className="income-legend-dot db" /> DB/Other
              </div>
              <div className="legend-item">
                <span className="income-legend-dot rrsp" /> RRSP/RRIF Draw
              </div>
              <div className="legend-item">
                <span className="income-legend-dot pi" /> Personal (PI) Draw
              </div>
              {hasCorp && (
                <div className="legend-item">
                  <span className="income-legend-dot corp" />{" "}
                  {isCouple ? "Co-Owned Corp Draw" : "Corp Draw"}
                </div>
              )}
              <div className="legend-item">
                <span className="income-legend-dot tfsa" /> TFSA Draw
              </div>
              <div className="legend-item">
                <span
                  style={{
                    width: "12px",
                    height: "2px",
                    background: "#10b981",
                    display: "inline-block",
                    borderTop: "1px dashed #10b981",
                  }}
                />{" "}
                Target Net Spend
              </div>
            </>
          ) : (
            <>
              <div className="legend-item">
                <span className="legend-dot total" /> <strong>Total Wealth</strong>
              </div>
              <div className="legend-item">
                <span className="legend-dot rrsp" />{" "}
                {isCouple ? "Joint RRSP/RRIF" : "RRSP/RRIF"}
              </div>
              <div className="legend-item">
                <span className="legend-dot nonreg" /> Personal (PI)
              </div>
              {hasCorp && (
                <div className="legend-item">
                  <span className="legend-dot corp" />{" "}
                  {isCouple ? "2-Person Co-Owned Corp" : "Private Corp"}
                </div>
              )}
              <div className="legend-item">
                <span className="legend-dot tfsa" /> {isCouple ? "Dual TFSAs" : "TFSA"}
              </div>
            </>
          )}
        </div>

        <div
          className="svg-chart-wrapper"
          id="chart-container"
          onMouseMove={handleChartMouseMove}
          onMouseLeave={() => setHoverState(null)}
          onClick={handleChartClick}
        >
          {state.chartViewMode === "incomeStreams" ? (
            <IncomeStreamsChart
              strat={currentStrat}
              retireAge={state.retireAge}
              retireNetSpending={state.retireNetSpending}
              hoverLineX={hoverState?.lineSvgX ?? null}
            />
          ) : (
            <BalancesChart
              strat={currentStrat}
              hoverLineX={hoverState?.lineSvgX ?? null}
            />
          )}
          <ChartTooltip
            chartViewMode={state.chartViewMode}
            record={hoveredRecord}
            retireAge={state.retireAge}
            hasCorp={hasCorp}
            tipLeft={hoverState?.tipLeft ?? 0}
          />
        </div>
      </div>

      <LedgerTable
        currentStrat={currentStrat}
        retireAge={state.retireAge}
        includeOtherIncome={state.includeOtherIncome}
        ledgerOpen={state.ledgerOpen}
        isCouple={isCouple}
        onToggleLedger={onToggleLedger}
      />
    </>
  );
}
