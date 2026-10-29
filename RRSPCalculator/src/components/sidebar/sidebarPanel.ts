import { formatCurrency } from "../../formatters";
import { state } from "../../state";
import { runOptimizeSafeSpending } from "../layout/header";
import { renderModePills } from "../ui/modePills";
import { bindSliderPair, renderSliderField } from "../ui/sliderField";
import { AppRenderCallbacks } from "../ui/types";
import {
  attachComparatorControlsListeners,
  renderComparatorSidebarControls,
} from "./comparatorControls";
import {
  attachPensionsCardListeners,
  renderGuaranteedPensionsSection,
  updatePensionCoverageLive,
} from "./pensionsCard";
import {
  attachRetirementStartListeners,
  renderRetirementStartingAssetsSection,
} from "./retirementStartAssets";
import {
  attachSavingsAllocationListeners,
  renderSavingsAllocationSection,
  updateAllocationVisuals,
} from "./savingsAllocation";

export function renderControlsHTML(isCouple: boolean): string {
  const currentAge1 = Math.max(18, state.retireAge - state.yearsAccumulation);
  const currentAge2 = Math.max(18, state.person2RetireAge - state.yearsAccumulation);

  return `
    <h2 class="panel-title">${isCouple ? "Household Profile & Targets" : "Your Profile & Targets"}</h2>

    ${renderModePills({
      label: "Planning Starting Point",
      wrapperStyle: "margin-bottom: 1.15rem;",
      options: [
        {
          id: "btn-start-accum",
          label: "📈 Save to Retirement",
          active: !state.startAtRetirement,
        },
        {
          id: "btn-start-retire",
          label: "🏖️ Start at Retirement",
          active: state.startAtRetirement,
        },
      ],
    })}

    ${
      state.startAtRetirement
        ? `
      ${renderRetirementStartingAssetsSection(isCouple)}
      ${state.viewMode === "comparator" ? renderComparatorSidebarControls() : ""}
      `
        : `
      ${renderSliderField({
        label: isCouple ? "Combined Household Saving" : "Annual Total Saving",
        sliderId: "slider-saving",
        numId: "num-saving",
        dispId: "disp-saving",
        displayHtml: formatCurrency(state.annualSaving),
        value: state.annualSaving,
        sliderMin: 5000,
        sliderMax: 200000,
        numMin: 1000,
        numMax: 500000,
        step: 1000,
      })}

      ${
        state.viewMode === "simulator"
          ? renderSavingsAllocationSection(isCouple)
          : renderComparatorSidebarControls()
      }

      <div class="divider"></div>

      ${renderSliderField({
        label: "Years to Invest",
        sliderId: "slider-years",
        numId: "num-years",
        dispId: "disp-years",
        displayHtml: `${state.yearsAccumulation} years`,
        value: state.yearsAccumulation,
        sliderMin: 3,
        sliderMax: 40,
        numMin: 1,
        numMax: 50,
        step: 1,
      })}
      `
    }

    <div class="divider"></div>

    <!-- Retirement Ages -->
    ${
      isCouple
        ? `
      <div class="form-group">
        <label class="form-label">Retirement Ages (Person 1 & Person 2)</label>
        <div class="dual-person-grid">
          <div class="dual-person-card">
            <span class="dual-person-title">👤 Person 1</span>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <input type="number" id="num-retireage" class="form-input-number" style="width:100%;text-align:left;" min="45" max="80" step="1" value="${state.retireAge}">
              <span style="font-size:0.75rem;color:var(--text-muted);">${state.startAtRetirement ? "(Retire Age)" : `(Starts @ ${currentAge1})`}</span>
            </div>
          </div>
          <div class="dual-person-card">
            <span class="dual-person-title">👤 Person 2</span>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <input type="number" id="num-retireage2" class="form-input-number" style="width:100%;text-align:left;" min="45" max="80" step="1" value="${state.person2RetireAge}">
              <span style="font-size:0.75rem;color:var(--text-muted);">${state.startAtRetirement ? "(Retire Age)" : `(Starts @ ${currentAge2})`}</span>
            </div>
          </div>
        </div>
      </div>
      `
        : renderSliderField({
            label: "Retire at Age",
            sliderId: "slider-retireage",
            numId: "num-retireage",
            dispId: "disp-retireage",
            displayHtml: `Age ${state.retireAge} <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted);">${state.startAtRetirement ? "(Retiring Now)" : `(Starts @ ${currentAge1})`}</span>`,
            value: state.retireAge,
            sliderMin: 50,
            sliderMax: 75,
            numMin: 45,
            numMax: 80,
            step: 1,
          })
    }

    <!-- Retirement Net Spending Goal -->
    ${renderSliderField({
      label: isCouple ? "Household Spend (After-Tax)" : "Retirement Spend (After-Tax)",
      sliderId: "slider-spend",
      numId: "num-spend",
      dispId: "disp-spend",
      displayHtml: `${formatCurrency(state.retireNetSpending)}/yr`,
      value: state.retireNetSpending,
      sliderMin: 20000,
      sliderMax: 250000,
      numMin: 10000,
      numMax: 400000,
      step: 2500,
      extraHtml: `
        <button type="button" id="btn-optimize-spending" class="btn-optimize-spend">
          ⚡ Auto-Find Max Safe Spending (to Age 95)
        </button>
        <div id="optimize-spend-result" class="optimize-spend-banner" style="display:none;"></div>
      `,
    })}

    <!-- Guaranteed Pensions & Other Income Section -->
    ${state.viewMode === "simulator" ? renderGuaranteedPensionsSection(isCouple) : ""}

    ${
      isCouple
        ? `
      <label class="reinvest-checkbox-row" style="margin-bottom:1rem;">
        <input type="checkbox" id="check-splitting" ${state.enableIncomeSplitting ? "checked" : ""}>
        <span>Enable CRA Pension & Corp Dividend Splitting</span>
      </label>`
        : ""
    }

    <div class="divider"></div>

    ${
      !state.startAtRetirement
        ? `
      ${
        isCouple
          ? `
        <div class="form-group">
          <label class="form-label">Working Marginal Tax Rates (MTR)</label>
          <div class="dual-person-grid">
            <div class="dual-person-card">
              <span class="dual-person-title">👤 Person 1 MTR</span>
              <input type="number" id="num-tax" class="form-input-number" style="width:100%;text-align:left;" min="15" max="54" step="0.5" value="${(state.workTaxRate * 100).toFixed(1)}">
            </div>
            <div class="dual-person-card">
              <span class="dual-person-title">👤 Person 2 MTR</span>
              <input type="number" id="num-tax2" class="form-input-number" style="width:100%;text-align:left;" min="15" max="54" step="0.5" value="${(state.person2WorkTaxRate * 100).toFixed(1)}">
            </div>
          </div>
        </div>`
          : renderSliderField({
              label: "Working Marginal Tax Rate",
              sliderId: "slider-tax",
              numId: "num-tax",
              dispId: "disp-tax",
              displayHtml: `${(state.workTaxRate * 100).toFixed(1)}%`,
              value: state.workTaxRate * 100,
              sliderMin: 20,
              sliderMax: 54,
              numMin: 15,
              numMax: 54,
              step: 0.5,
            })
      }

      ${renderSliderField({
        label: "Annual Pre-Tax Return",
        sliderId: "slider-growth",
        numId: "num-growth",
        dispId: "disp-growth",
        displayHtml: `${(state.growthRatePreTax * 100).toFixed(1)}%`,
        value: state.growthRatePreTax * 100,
        sliderMin: 3,
        sliderMax: 12,
        numMin: 1,
        numMax: 15,
        step: 0.5,
      })}

      ${renderSliderField({
        label: "Tax Drag (Personal / Corp Passive)",
        sliderId: "slider-drag",
        numId: "num-drag",
        dispId: "disp-drag",
        displayHtml: `${(state.taxDrag * 100).toFixed(1)}%`,
        value: state.taxDrag * 100,
        sliderMin: 0.5,
        sliderMax: 3.0,
        numMin: 0,
        numMax: 5,
        step: 0.1,
      })}
      `
        : ""
    }

    ${renderSliderField({
      label: "Retirement Return Rate",
      sliderId: "slider-retgrowth",
      numId: "num-retgrowth",
      dispId: "disp-retgrowth",
      displayHtml: `${(state.retireGrowthRate * 100).toFixed(1)}%`,
      value: state.retireGrowthRate * 100,
      sliderMin: 2,
      sliderMax: 8,
      numMin: 1,
      numMax: 10,
      step: 0.5,
    })}
  `;
}

export function attachControlsEventListeners(cb: AppRenderCallbacks): void {
  // Planning Starting Point Toggle
  document.getElementById("btn-start-accum")?.addEventListener("click", () => {
    if (!state.startAtRetirement) return;
    state.startAtRetirement = false;
    cb.renderControlsPanel();
    cb.updateResultsOnly();
  });

  document.getElementById("btn-start-retire")?.addEventListener("click", () => {
    if (state.startAtRetirement) return;
    state.startAtRetirement = true;
    cb.renderControlsPanel();
    cb.updateResultsOnly();
  });

  if (state.startAtRetirement) {
    attachRetirementStartListeners(cb);
  } else {
    attachSavingsAllocationListeners(cb);
  }

  attachPensionsCardListeners(cb);
  attachComparatorControlsListeners(cb);

  // Years & Retirement Age Sliders
  bindSliderPair({
    sliderId: "slider-years",
    numId: "num-years",
    dispId: "disp-years",
    formatter: (v) => `${Math.round(v)} years`,
    onChange: (v) => {
      state.yearsAccumulation = Math.round(v);
      cb.updateResultsOnly();
    },
  });

  bindSliderPair({
    sliderId: "slider-retireage",
    numId: "num-retireage",
    dispId: "disp-retireage",
    formatter: (v) => `Age ${Math.round(v)}`,
    onChange: (v) => {
      state.retireAge = Math.round(v);
      updatePensionCoverageLive();
      cb.updateResultsOnly();
    },
  });

  const numRetire2 = document.getElementById("num-retireage2") as HTMLInputElement | null;
  numRetire2?.addEventListener("input", () => {
    const v = parseFloat(numRetire2.value);
    if (!isNaN(v)) {
      state.person2RetireAge = Math.round(v);
      updatePensionCoverageLive();
      cb.updateResultsOnly();
    }
  });

  bindSliderPair({
    sliderId: "slider-spend",
    numId: "num-spend",
    dispId: "disp-spend",
    maxSliderVal: 250000,
    formatter: (v) => `${formatCurrency(v)}/yr`,
    onChange: (v) => {
      state.retireNetSpending = v;
      updatePensionCoverageLive();
      cb.updateResultsOnly();
    },
  });

  document.getElementById("btn-optimize-spending")?.addEventListener("click", () => {
    runOptimizeSafeSpending(cb);
  });

  document.getElementById("check-splitting")?.addEventListener("change", (e) => {
    state.enableIncomeSplitting = (e.target as HTMLInputElement).checked;
    cb.updateResultsOnly();
  });

  // Tax Rates & Return Assumptions
  bindSliderPair({
    sliderId: "slider-tax",
    numId: "num-tax",
    dispId: "disp-tax",
    formatter: (v) => `${v.toFixed(1)}%`,
    onChange: (v) => {
      state.workTaxRate = v / 100;
      updateAllocationVisuals();
      cb.updateResultsOnly();
    },
  });

  const numTax2 = document.getElementById("num-tax2") as HTMLInputElement | null;
  numTax2?.addEventListener("input", () => {
    const v = parseFloat(numTax2.value);
    if (!isNaN(v)) {
      state.person2WorkTaxRate = v / 100;
      updateAllocationVisuals();
      cb.updateResultsOnly();
    }
  });

  bindSliderPair({
    sliderId: "slider-growth",
    numId: "num-growth",
    dispId: "disp-growth",
    formatter: (v) => `${v.toFixed(1)}%`,
    onChange: (v) => {
      state.growthRatePreTax = v / 100;
      cb.updateResultsOnly();
    },
  });

  bindSliderPair({
    sliderId: "slider-drag",
    numId: "num-drag",
    dispId: "disp-drag",
    formatter: (v) => `${v.toFixed(1)}%`,
    onChange: (v) => {
      state.taxDrag = v / 100;
      cb.updateResultsOnly();
    },
  });

  bindSliderPair({
    sliderId: "slider-retgrowth",
    numId: "num-retgrowth",
    dispId: "disp-retgrowth",
    formatter: (v) => `${v.toFixed(1)}%`,
    onChange: (v) => {
      state.retireGrowthRate = v / 100;
      cb.updateResultsOnly();
    },
  });
}

