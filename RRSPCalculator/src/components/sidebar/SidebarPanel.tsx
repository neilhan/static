import { formatCurrency } from "../../formatters";
import {
  AppState,
  computeActiveAnnualSaving,
  OptimizeBannerInfo,
  scaleTotalSaving,
} from "../../state";
import { ModePills } from "../ui/ModePills";
import { SliderField } from "../ui/SliderField";
import { ComparatorControls } from "./ComparatorControls";
import { PensionsCard } from "./PensionsCard";
import { RetirementStartAssets } from "./RetirementStartAssets";
import { SavingsAllocation } from "./SavingsAllocation";

export interface SidebarPanelProps {
  state: AppState;
  isCouple: boolean;
  optimizeBanner: OptimizeBannerInfo | null;
  pensionPulse: boolean;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onOptimizeSpending: () => void;
}

export function SidebarPanel({
  state,
  isCouple,
  optimizeBanner,
  pensionPulse,
  onUpdateState,
  onOptimizeSpending,
}: SidebarPanelProps) {
  const currentAge1 = Math.max(18, state.retireAge - state.yearsAccumulation);
  const currentAge2 = Math.max(18, state.person2RetireAge - state.yearsAccumulation);
  const activeAnnualSaving = computeActiveAnnualSaving(state);

  return (
    <aside id="controls-panel" className="panel" aria-label="Calculator Settings">
      <h2 className="panel-title">
        {isCouple ? "Household Profile & Targets" : "Your Profile & Targets"}
      </h2>

      <ModePills
        label="Planning Starting Point"
        wrapperStyle={{ marginBottom: "1.15rem" }}
        options={[
          {
            id: "btn-start-accum",
            label: "📈 Save to Retirement",
            active: !state.startAtRetirement,
            onClick: () =>
              onUpdateState((prev) => ({ ...prev, startAtRetirement: false })),
          },
          {
            id: "btn-start-retire",
            label: "🏖️ Start at Retirement",
            active: state.startAtRetirement,
            onClick: () =>
              onUpdateState((prev) => ({ ...prev, startAtRetirement: true })),
          },
        ]}
      />

      {state.startAtRetirement ? (
        <>
          <RetirementStartAssets
            state={state}
            isCouple={isCouple}
            onUpdateState={onUpdateState}
          />
          {state.viewMode === "comparator" && (
            <ComparatorControls state={state} onUpdateState={onUpdateState} />
          )}
        </>
      ) : (
        <>
          <SliderField
            label={isCouple ? "Combined Household Saving" : "Annual Total Saving"}
            sliderId="slider-saving"
            numId="num-saving"
            dispId="disp-saving"
            displayContent={formatCurrency(activeAnnualSaving)}
            value={activeAnnualSaving}
            sliderMin={5000}
            sliderMax={200000}
            numMin={1000}
            numMax={500000}
            step={1000}
            minVal={0}
            onChange={(v) => onUpdateState((prev) => scaleTotalSaving(prev, v))}
          />

          {state.viewMode === "simulator" ? (
            <SavingsAllocation
              state={state}
              isCouple={isCouple}
              onUpdateState={onUpdateState}
            />
          ) : (
            <ComparatorControls state={state} onUpdateState={onUpdateState} />
          )}

          <div className="divider" />

          <SliderField
            label="Years to Invest"
            sliderId="slider-years"
            numId="num-years"
            dispId="disp-years"
            displayContent={`${state.yearsAccumulation} years`}
            value={state.yearsAccumulation}
            sliderMin={3}
            sliderMax={40}
            numMin={1}
            numMax={50}
            step={1}
            onChange={(v) =>
              onUpdateState((prev) => ({ ...prev, yearsAccumulation: Math.round(v) }))
            }
          />
        </>
      )}

      <div className="divider" />

      {isCouple ? (
        <div className="form-group">
          <label className="form-label">Retirement Ages (Person 1 &amp; Person 2)</label>
          <div className="dual-person-grid">
            <div className="dual-person-card">
              <span className="dual-person-title">👤 Person 1</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <input
                  type="number"
                  id="num-retireage"
                  className="form-input-number"
                  style={{ width: "100%", textAlign: "left" }}
                  min={45}
                  max={80}
                  step={1}
                  value={state.retireAge}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!Number.isNaN(v)) {
                      onUpdateState((prev) => ({ ...prev, retireAge: Math.round(v) }));
                    }
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {state.startAtRetirement ? "(Retire Age)" : `(Starts @ ${currentAge1})`}
                </span>
              </div>
            </div>
            <div className="dual-person-card">
              <span className="dual-person-title">👤 Person 2</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <input
                  type="number"
                  id="num-retireage2"
                  className="form-input-number"
                  style={{ width: "100%", textAlign: "left" }}
                  min={45}
                  max={80}
                  step={1}
                  value={state.person2RetireAge}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!Number.isNaN(v)) {
                      onUpdateState((prev) => ({
                        ...prev,
                        person2RetireAge: Math.round(v),
                      }));
                    }
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {state.startAtRetirement ? "(Retire Age)" : `(Starts @ ${currentAge2})`}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <SliderField
          label="Retire at Age"
          sliderId="slider-retireage"
          numId="num-retireage"
          dispId="disp-retireage"
          displayContent={
            <>
              Age {state.retireAge}{" "}
              <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--text-muted)" }}>
                {state.startAtRetirement ? "(Retiring Now)" : `(Starts @ ${currentAge1})`}
              </span>
            </>
          }
          value={state.retireAge}
          sliderMin={50}
          sliderMax={75}
          numMin={45}
          numMax={80}
          step={1}
          onChange={(v) =>
            onUpdateState((prev) => ({ ...prev, retireAge: Math.round(v) }))
          }
        />
      )}

      <SliderField
        label={isCouple ? "Household Spend (After-Tax)" : "Retirement Spend (After-Tax)"}
        sliderId="slider-spend"
        numId="num-spend"
        dispId="disp-spend"
        displayContent={`${formatCurrency(state.retireNetSpending)}/yr`}
        value={state.retireNetSpending}
        sliderMin={20000}
        sliderMax={250000}
        numMin={10000}
        numMax={400000}
        step={2500}
        onChange={(v) =>
          onUpdateState((prev) => ({ ...prev, retireNetSpending: v }))
        }
        extra={
          <>
            <button
              type="button"
              id="btn-optimize-spending"
              className="btn-optimize-spend"
              onClick={onOptimizeSpending}
            >
              ⚡ Auto-Find Max Safe Spending (to Age 95)
            </button>
            <div
              id="optimize-spend-result"
              className="optimize-spend-banner"
              style={{ display: optimizeBanner ? "block" : "none" }}
            >
              {optimizeBanner && (
                <>
                  <strong>🎉 Max Safe Spending Found:</strong> You can sustainably spend{" "}
                  <strong>{formatCurrency(optimizeBanner.maxSpending)}/yr after-tax</strong> until{" "}
                  <strong>Age {optimizeBanner.depletionAge}+</strong> using the{" "}
                  <em>&quot;{optimizeBanner.strategyName}&quot;</em> strategy!
                </>
              )}
            </div>
          </>
        }
      />

      {state.viewMode === "simulator" && (
        <PensionsCard
          state={state}
          isCouple={isCouple}
          pulseHighlight={pensionPulse}
          onUpdateState={onUpdateState}
        />
      )}

      {isCouple && (
        <label className="reinvest-checkbox-row" style={{ marginBottom: "1rem" }}>
          <input
            type="checkbox"
            id="check-splitting"
            checked={state.enableIncomeSplitting}
            onChange={(e) =>
              onUpdateState((prev) => ({
                ...prev,
                enableIncomeSplitting: e.target.checked,
              }))
            }
          />
          <span>Enable CRA Pension &amp; Corp Dividend Splitting</span>
        </label>
      )}

      <div className="divider" />

      {!state.startAtRetirement && (
        <>
          {isCouple ? (
            <div className="form-group">
              <label className="form-label">Working Marginal Tax Rates (MTR)</label>
              <div className="dual-person-grid">
                <div className="dual-person-card">
                  <span className="dual-person-title">👤 Person 1 MTR</span>
                  <input
                    type="number"
                    id="num-tax"
                    className="form-input-number"
                    style={{ width: "100%", textAlign: "left" }}
                    min={15}
                    max={54}
                    step={0.5}
                    value={(state.workTaxRate * 100).toFixed(1)}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) {
                        onUpdateState((prev) => ({ ...prev, workTaxRate: v / 100 }));
                      }
                    }}
                  />
                </div>
                <div className="dual-person-card">
                  <span className="dual-person-title">👤 Person 2 MTR</span>
                  <input
                    type="number"
                    id="num-tax2"
                    className="form-input-number"
                    style={{ width: "100%", textAlign: "left" }}
                    min={15}
                    max={54}
                    step={0.5}
                    value={(state.person2WorkTaxRate * 100).toFixed(1)}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) {
                        onUpdateState((prev) => ({ ...prev, person2WorkTaxRate: v / 100 }));
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <SliderField
              label="Working Marginal Tax Rate"
              sliderId="slider-tax"
              numId="num-tax"
              dispId="disp-tax"
              displayContent={`${(state.workTaxRate * 100).toFixed(1)}%`}
              value={Number((state.workTaxRate * 100).toFixed(1))}
              sliderMin={20}
              sliderMax={54}
              numMin={15}
              numMax={54}
              step={0.5}
              onChange={(v) =>
                onUpdateState((prev) => ({ ...prev, workTaxRate: v / 100 }))
              }
            />
          )}

          <SliderField
            label="Annual Pre-Tax Return"
            sliderId="slider-growth"
            numId="num-growth"
            dispId="disp-growth"
            displayContent={`${(state.growthRatePreTax * 100).toFixed(1)}%`}
            value={Number((state.growthRatePreTax * 100).toFixed(1))}
            sliderMin={3}
            sliderMax={12}
            numMin={1}
            numMax={15}
            step={0.5}
            onChange={(v) =>
              onUpdateState((prev) => ({ ...prev, growthRatePreTax: v / 100 }))
            }
          />

          <SliderField
            label="Tax Drag (Personal / Corp Passive)"
            sliderId="slider-drag"
            numId="num-drag"
            dispId="disp-drag"
            displayContent={`${(state.taxDrag * 100).toFixed(1)}%`}
            value={Number((state.taxDrag * 100).toFixed(1))}
            sliderMin={0.5}
            sliderMax={3.0}
            numMin={0}
            numMax={5}
            step={0.1}
            onChange={(v) =>
              onUpdateState((prev) => ({ ...prev, taxDrag: v / 100 }))
            }
          />
        </>
      )}

      <SliderField
        label="Retirement Return Rate"
        sliderId="slider-retgrowth"
        numId="num-retgrowth"
        dispId="disp-retgrowth"
        displayContent={`${(state.retireGrowthRate * 100).toFixed(1)}%`}
        value={Number((state.retireGrowthRate * 100).toFixed(1))}
        sliderMin={2}
        sliderMax={8}
        numMin={1}
        numMax={10}
        step={0.5}
        onChange={(v) =>
          onUpdateState((prev) => ({ ...prev, retireGrowthRate: v / 100 }))
        }
      />
    </aside>
  );
}
