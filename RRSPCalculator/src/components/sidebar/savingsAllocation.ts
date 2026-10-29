import { formatCurrency } from "../../formatters";
import { state } from "../../state";
import { renderAccountAllocCard } from "../ui/accountAllocCard";
import { BarSegmentItem, renderSegmentedBar } from "../ui/segmentedBar";
import { bindSliderPair, syncInputPair } from "../ui/sliderField";
import { AppRenderCallbacks } from "../ui/types";

export function renderSavingsAllocationSection(isCouple: boolean): string {
  const total = isCouple
    ? state.p1RrspSaving + state.p2RrspSaving + state.piSaving + state.corpSaving
    : state.p1RrspSaving + state.piSaving + state.corpSaving;
  const safeTotal = Math.max(1, total);

  const p1Pct = Math.round((state.p1RrspSaving / safeTotal) * 100);
  const p2Pct = isCouple ? Math.round((state.p2RrspSaving / safeTotal) * 100) : 0;
  const corpPct = Math.round((state.corpSaving / safeTotal) * 100);
  const piPct = Math.max(0, 100 - p1Pct - p2Pct - corpPct);

  const p1Refund = Math.round(state.p1RrspSaving * state.workTaxRate);
  const p2Refund = Math.round(state.p2RrspSaving * state.person2WorkTaxRate);
  const totalRefund = isCouple ? p1Refund + p2Refund : p1Refund;

  const segments: BarSegmentItem[] = [
    {
      segId: "alloc-seg-p1",
      lblId: "alloc-lbl-p1",
      variant: "p1",
      pct: p1Pct,
      labelHtml: `${isCouple ? "P1 RRSP" : "RRSP"}: ${p1Pct}% (${formatCurrency(state.p1RrspSaving)})`,
      labelColor: "var(--rrsp-color)",
    },
    ...(isCouple
      ? [
          {
            segId: "alloc-seg-p2",
            lblId: "alloc-lbl-p2",
            variant: "p2",
            pct: p2Pct,
            labelHtml: `P2 RRSP: ${p2Pct}% (${formatCurrency(state.p2RrspSaving)})`,
            labelColor: "#8b5cf6",
          },
        ]
      : []),
    {
      segId: "alloc-seg-pi",
      lblId: "alloc-lbl-pi",
      variant: "pi",
      pct: piPct,
      labelHtml: `PI: ${piPct}% (${formatCurrency(state.piSaving)})`,
      labelColor: "var(--nonreg-color)",
    },
    {
      segId: "alloc-seg-corp",
      lblId: "alloc-lbl-corp",
      variant: "corp",
      pct: corpPct,
      labelHtml: `Corp: ${corpPct}% (${formatCurrency(state.corpSaving)})`,
      labelColor: "var(--corp-color)",
      hiddenWhenZero: true,
      isZero: state.corpSaving === 0,
    },
  ];

  const presetsHtml = isCouple
    ? `
      <button type="button" id="preset-couple-equal" class="alloc-preset-btn">⚡ 50/50 Equal RRSPs</button>
      <button type="button" id="preset-couple-corp" class="alloc-preset-btn" style="border-color:rgba(244,114,182,0.45);color:var(--corp-color);">🏢 +Co-Owned Corp</button>
      <button type="button" id="preset-couple-highearner" class="alloc-preset-btn">💼 High-Earner First (P1)</button>
      <button type="button" id="preset-couple-balanced" class="alloc-preset-btn">⚖️ 70% RRSP / 30% PI</button>
    `
    : `
      <button type="button" id="preset-single-max" class="alloc-preset-btn">🚀 Max RRSP ($32,490)</button>
      <button type="button" id="preset-single-corp" class="alloc-preset-btn" style="border-color:rgba(244,114,182,0.45);color:var(--corp-color);">🏢 +Private Corp</button>
      <button type="button" id="preset-single-balanced" class="alloc-preset-btn">⚖️ 70% RRSP / 30% PI</button>
      <button type="button" id="preset-single-all" class="alloc-preset-btn">💰 100% RRSP</button>
    `;

  return `
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label">
          ${isCouple ? "Household Savings Allocation (RRSP / PI / Co-Owned Corp)" : "Savings Allocation (RRSP / PI / Corp)"}
        </label>
      </div>

      ${renderSegmentedBar({ segments })}

      <div class="alloc-presets-grid">
        ${presetsHtml}
      </div>

      ${renderAccountAllocCard({
        variant: "p1",
        icon: "👤",
        title: isCouple ? "Person 1 RRSP" : "RRSP Contribution",
        badgeId: "refund-badge-p1",
        badgeClass: "alloc-refund-badge",
        badgeText: `+${formatCurrency(p1Refund)} tax refund`,
        subtitle: "Max CRA Limit: $32,490/yr",
        dispId: "disp-p1-rrsp",
        displayValue: formatCurrency(state.p1RrspSaving),
        slider: {
          sliderId: "slider-p1-rrsp",
          numId: "num-p1-rrsp",
          value: state.p1RrspSaving,
          sliderMin: 0,
          sliderMax: 32490,
          step: 500,
        },
      })}

      ${
        isCouple
          ? renderAccountAllocCard({
              variant: "p2",
              icon: "👤",
              title: "Person 2 RRSP / Spousal",
              badgeId: "refund-badge-p2",
              badgeClass: "alloc-refund-badge",
              badgeText: `+${formatCurrency(p2Refund)} tax refund`,
              subtitle: "Max CRA Limit: $32,490/yr",
              dispId: "disp-p2-rrsp",
              displayValue: formatCurrency(state.p2RrspSaving),
              slider: {
                sliderId: "slider-p2-rrsp",
                numId: "num-p2-rrsp",
                value: state.p2RrspSaving,
                sliderMin: 0,
                sliderMax: 32490,
                step: 500,
              },
            })
          : ""
      }

      ${renderAccountAllocCard({
        variant: "pi",
        icon: "📈",
        title: isCouple ? "Household Personal Account (PI)" : "Personal Investment (PI)",
        badgeText: "50% Capital Gains",
        subtitle: "Taxable Non-Registered",
        dispId: "disp-pi",
        displayValue: formatCurrency(state.piSaving),
        slider: {
          sliderId: "slider-pi",
          numId: "num-pi",
          value: state.piSaving,
          sliderMin: 0,
          sliderMax: 100000,
          numMax: 250000,
          step: 1000,
        },
      })}

      ${renderAccountAllocCard({
        variant: "corp",
        icon: "🏢",
        title: isCouple ? "2-Person Co-Owned Corp (CCPC)" : "Private Corp (CCPC / HoldCo)",
        badgeClass: "alloc-share-badge corp",
        badgeText: "12.2% SBD · CDA + Divs",
        subtitle: isCouple
          ? "Retained Earnings Invested Inside Co-Owned HoldCo"
          : "Retained Earnings Invested Inside Corp",
        dispId: "disp-corp",
        displayValue: formatCurrency(state.corpSaving),
        slider: {
          sliderId: "slider-corp",
          numId: "num-corp",
          value: state.corpSaving,
          sliderMin: 0,
          sliderMax: 150000,
          numMax: 400000,
          step: 1000,
        },
      })}

      <!-- Tax Refund & Reinvestment Destination -->
      <div class="refund-summary-box">
        <div class="refund-summary-header">
          <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">
            🎁 Annual Household Tax Refund
          </span>
          <span id="total-refund-val" class="refund-summary-val">
            +${formatCurrency(totalRefund)}/yr
          </span>
        </div>
        <div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:0.4rem;">
          Reinvest this tax refund annually into:
        </div>
        <div style="display:flex;gap:0.4rem;">
          <button type="button" class="preset-btn ${state.reinvestRefundTo === "tfsa" ? "active" : ""}" id="refund-tfsa">
            ${isCouple ? "Dual TFSAs" : "TFSA"}
          </button>
          <button type="button" class="preset-btn ${state.reinvestRefundTo === "pi" ? "active" : ""}" id="refund-pi">
            Personal (PI)
          </button>
          <button type="button" class="preset-btn ${state.reinvestRefundTo === "none" ? "active" : ""}" id="refund-none">
            Spend
          </button>
        </div>
      </div>
    </div>
  `;
}

export function updateAllocationVisuals(): void {
  const isCouple = state.householdMode === "couple";
  const total = isCouple
    ? state.p1RrspSaving + state.p2RrspSaving + state.piSaving + state.corpSaving
    : state.p1RrspSaving + state.piSaving + state.corpSaving;
  const safeTotal = Math.max(1, total);

  const p1Pct = Math.round((state.p1RrspSaving / safeTotal) * 100);
  const p2Pct = isCouple ? Math.round((state.p2RrspSaving / safeTotal) * 100) : 0;
  const corpPct = Math.round((state.corpSaving / safeTotal) * 100);
  const piPct = Math.max(0, 100 - p1Pct - p2Pct - corpPct);

  const segP1 = document.getElementById("alloc-seg-p1");
  const segP2 = document.getElementById("alloc-seg-p2");
  const segPi = document.getElementById("alloc-seg-pi");
  const segCorp = document.getElementById("alloc-seg-corp");

  if (segP1) segP1.style.width = `${p1Pct}%`;
  if (segP2) segP2.style.width = `${p2Pct}%`;
  if (segPi) segPi.style.width = `${piPct}%`;
  if (segCorp) segCorp.style.width = `${corpPct}%`;

  const lblP1 = document.getElementById("alloc-lbl-p1");
  const lblP2 = document.getElementById("alloc-lbl-p2");
  const lblPi = document.getElementById("alloc-lbl-pi");
  const lblCorp = document.getElementById("alloc-lbl-corp");

  if (lblP1) {
    lblP1.textContent = `${isCouple ? "P1 RRSP" : "RRSP"}: ${p1Pct}% (${formatCurrency(state.p1RrspSaving)})`;
  }
  if (lblP2 && isCouple) {
    lblP2.textContent = `P2 RRSP: ${p2Pct}% (${formatCurrency(state.p2RrspSaving)})`;
  }
  if (lblPi) {
    lblPi.textContent = `PI: ${piPct}% (${formatCurrency(state.piSaving)})`;
  }
  if (lblCorp) {
    lblCorp.style.display = state.corpSaving > 0 ? "inline" : "none";
    lblCorp.textContent = `Corp: ${corpPct}% (${formatCurrency(state.corpSaving)})`;
  }

  const p1Refund = Math.round(state.p1RrspSaving * state.workTaxRate);
  const p2Refund = Math.round(state.p2RrspSaving * state.person2WorkTaxRate);
  const totalRefund = isCouple ? p1Refund + p2Refund : p1Refund;

  const badgeP1 = document.getElementById("refund-badge-p1");
  if (badgeP1) badgeP1.textContent = `+${formatCurrency(p1Refund)} tax refund`;

  const badgeP2 = document.getElementById("refund-badge-p2");
  if (badgeP2) badgeP2.textContent = `+${formatCurrency(p2Refund)} tax refund`;

  const totalRefundEl = document.getElementById("total-refund-val");
  if (totalRefundEl) totalRefundEl.textContent = `+${formatCurrency(totalRefund)}/yr`;
}

export function syncAllSavingInputs(): void {
  const isCouple = state.householdMode === "couple";
  const total = isCouple
    ? state.p1RrspSaving + state.p2RrspSaving + state.piSaving + state.corpSaving
    : state.p1RrspSaving + state.piSaving + state.corpSaving;
  state.annualSaving = total;

  syncInputPair("slider-saving", "num-saving", "disp-saving", total, formatCurrency(total), 200000);
  syncInputPair(
    "slider-p1-rrsp",
    "num-p1-rrsp",
    "disp-p1-rrsp",
    state.p1RrspSaving,
    formatCurrency(state.p1RrspSaving),
    32490
  );
  if (isCouple) {
    syncInputPair(
      "slider-p2-rrsp",
      "num-p2-rrsp",
      "disp-p2-rrsp",
      state.p2RrspSaving,
      formatCurrency(state.p2RrspSaving),
      32490
    );
  }
  syncInputPair(
    "slider-pi",
    "num-pi",
    "disp-pi",
    state.piSaving,
    formatCurrency(state.piSaving),
    100000
  );
  syncInputPair(
    "slider-corp",
    "num-corp",
    "disp-corp",
    state.corpSaving,
    formatCurrency(state.corpSaving),
    150000
  );

  updateAllocationVisuals();
}

export function attachSavingsAllocationListeners(cb: AppRenderCallbacks): void {
  const isCouple = state.householdMode === "couple";

  // Total Combined Saving Handler
  bindSliderPair({
    sliderId: "slider-saving",
    numId: "num-saving",
    dispId: "disp-saving",
    maxSliderVal: 200000,
    minVal: 0,
    formatter: formatCurrency,
    onChange: (newTotal) => {
      state.annualSaving = newTotal;
      if (isCouple) {
        const currentSum =
          state.p1RrspSaving + state.p2RrspSaving + state.piSaving + state.corpSaving || 1;
        const r1 = state.p1RrspSaving / currentSum;
        const r2 = state.p2RrspSaving / currentSum;
        const rCorp = state.corpSaving / currentSum;
        let p1 = Math.round(newTotal * r1);
        let p2 = Math.round(newTotal * r2);
        const corp = Math.round(newTotal * rCorp);
        let pi = newTotal - p1 - p2 - corp;
        if (p1 > 32490) {
          pi += p1 - 32490;
          p1 = 32490;
        }
        if (p2 > 32490) {
          pi += p2 - 32490;
          p2 = 32490;
        }
        state.p1RrspSaving = p1;
        state.p2RrspSaving = p2;
        state.corpSaving = Math.max(0, corp);
        state.piSaving = Math.max(0, pi);
      } else {
        const currentSum = state.p1RrspSaving + state.piSaving + state.corpSaving || 1;
        const r1 = state.p1RrspSaving / currentSum;
        const rCorp = state.corpSaving / currentSum;
        let p1 = Math.round(newTotal * r1);
        const corp = Math.round(newTotal * rCorp);
        let pi = newTotal - p1 - corp;
        if (p1 > 32490) {
          pi += p1 - 32490;
          p1 = 32490;
        }
        state.p1RrspSaving = p1;
        state.corpSaving = Math.max(0, corp);
        state.piSaving = Math.max(0, pi);
      }
      syncAllSavingInputs();
      cb.updateResultsOnly();
    },
  });

  const bindAccountSaving = (
    sliderId: string,
    numId: string,
    dispId: string,
    maxSliderVal: number,
    setter: (v: number) => void
  ) => {
    bindSliderPair({
      sliderId,
      numId,
      dispId,
      maxSliderVal,
      minVal: 0,
      formatter: formatCurrency,
      onChange: (v) => {
        setter(v);
        const total = isCouple
          ? state.p1RrspSaving + state.p2RrspSaving + state.piSaving + state.corpSaving
          : state.p1RrspSaving + state.piSaving + state.corpSaving;
        state.annualSaving = total;
        syncInputPair(
          "slider-saving",
          "num-saving",
          "disp-saving",
          total,
          formatCurrency(total),
          200000
        );
        updateAllocationVisuals();
        cb.updateResultsOnly();
      },
    });
  };

  bindAccountSaving("slider-p1-rrsp", "num-p1-rrsp", "disp-p1-rrsp", 32490, (v) => {
    state.p1RrspSaving = v;
  });
  if (isCouple) {
    bindAccountSaving("slider-p2-rrsp", "num-p2-rrsp", "disp-p2-rrsp", 32490, (v) => {
      state.p2RrspSaving = v;
    });
  }
  bindAccountSaving("slider-pi", "num-pi", "disp-pi", 100000, (v) => {
    state.piSaving = v;
  });
  bindAccountSaving("slider-corp", "num-corp", "disp-corp", 150000, (v) => {
    state.corpSaving = v;
  });

  // Quick Presets
  const applyPreset = (fn: () => void) => {
    fn();
    syncAllSavingInputs();
    cb.updateResultsOnly();
  };

  if (isCouple) {
    document.getElementById("preset-couple-equal")?.addEventListener("click", () =>
      applyPreset(() => {
        const rrspPool = Math.min(state.annualSaving, 32490 * 2);
        const half = Math.min(32490, Math.floor(rrspPool / 2));
        state.p1RrspSaving = half;
        state.p2RrspSaving = half;
        state.corpSaving = 0;
        state.piSaving = Math.max(0, state.annualSaving - half * 2);
      })
    );
    document.getElementById("preset-couple-corp")?.addEventListener("click", () =>
      applyPreset(() => {
        const base = Math.max(state.annualSaving, 70000);
        state.p1RrspSaving = Math.min(32490, Math.round((base * 0.25) / 500) * 500);
        state.p2RrspSaving = Math.min(32490, Math.round((base * 0.25) / 500) * 500);
        state.corpSaving = Math.round((base * 0.4) / 1000) * 1000;
        state.piSaving = Math.max(
          0,
          base - state.p1RrspSaving - state.p2RrspSaving - state.corpSaving
        );
      })
    );
    document.getElementById("preset-couple-highearner")?.addEventListener("click", () =>
      applyPreset(() => {
        const p1 = Math.min(32490, state.annualSaving);
        const remainder = Math.max(0, state.annualSaving - p1);
        const p2 = Math.min(32490, remainder);
        state.p1RrspSaving = p1;
        state.p2RrspSaving = p2;
        state.corpSaving = 0;
        state.piSaving = Math.max(0, remainder - p2);
      })
    );
    document.getElementById("preset-couple-balanced")?.addEventListener("click", () =>
      applyPreset(() => {
        const rrspTarget = Math.round(state.annualSaving * 0.7);
        const p1 = Math.min(32490, Math.floor(rrspTarget / 2));
        const p2 = Math.min(32490, rrspTarget - p1);
        state.p1RrspSaving = p1;
        state.p2RrspSaving = p2;
        state.corpSaving = 0;
        state.piSaving = Math.max(0, state.annualSaving - p1 - p2);
      })
    );
  } else {
    document.getElementById("preset-single-max")?.addEventListener("click", () =>
      applyPreset(() => {
        state.p1RrspSaving = Math.min(32490, state.annualSaving);
        state.corpSaving = 0;
        state.piSaving = Math.max(0, state.annualSaving - state.p1RrspSaving);
      })
    );
    document.getElementById("preset-single-corp")?.addEventListener("click", () =>
      applyPreset(() => {
        const base = Math.max(state.annualSaving, 60000);
        state.p1RrspSaving = Math.min(32490, Math.round((base * 0.4) / 500) * 500);
        state.corpSaving = Math.round((base * 0.5) / 1000) * 1000;
        state.piSaving = Math.max(0, base - state.p1RrspSaving - state.corpSaving);
      })
    );
    document.getElementById("preset-single-balanced")?.addEventListener("click", () =>
      applyPreset(() => {
        state.p1RrspSaving = Math.min(32490, Math.round(state.annualSaving * 0.7));
        state.corpSaving = 0;
        state.piSaving = Math.max(0, state.annualSaving - state.p1RrspSaving);
      })
    );
    document.getElementById("preset-single-all")?.addEventListener("click", () =>
      applyPreset(() => {
        state.p1RrspSaving = Math.min(32490, state.annualSaving);
        state.piSaving = 0;
        state.corpSaving = 0;
      })
    );
  }

  // Refund Reinvestment Target Buttons
  const setRefundTarget = (target: "tfsa" | "pi" | "none") => {
    state.reinvestRefundTo = target;
    document.querySelectorAll(".refund-summary-box .preset-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.getElementById(`refund-${target}`)?.classList.add("active");
    cb.updateResultsOnly();
  };

  document.getElementById("refund-tfsa")?.addEventListener("click", () => setRefundTarget("tfsa"));
  document.getElementById("refund-pi")?.addEventListener("click", () => setRefundTarget("pi"));
  document.getElementById("refund-none")?.addEventListener("click", () => setRefundTarget("none"));
}

