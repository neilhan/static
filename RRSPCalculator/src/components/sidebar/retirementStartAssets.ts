import { formatCompact, formatCurrency } from "../../formatters";
import { state } from "../../state";
import { renderAccountAllocCard } from "../ui/accountAllocCard";
import { BarSegmentItem, renderSegmentedBar } from "../ui/segmentedBar";
import { bindSliderPair, renderSliderField, syncInputPair } from "../ui/sliderField";
import { AppRenderCallbacks } from "../ui/types";

export function renderRetirementStartingAssetsSection(isCouple: boolean): string {
  const total = isCouple
    ? state.retireStartP1Rrsp +
      state.retireStartP2Rrsp +
      state.retireStartPi +
      state.retireStartCorp +
      state.retireStartTfsa
    : state.retireStartP1Rrsp +
      state.retireStartPi +
      state.retireStartCorp +
      state.retireStartTfsa;
  state.retireStartTotal = total;
  const safeTotal = Math.max(1, total);

  const p1Pct = Math.round((state.retireStartP1Rrsp / safeTotal) * 100);
  const p2Pct = isCouple ? Math.round((state.retireStartP2Rrsp / safeTotal) * 100) : 0;
  const piPct = Math.round((state.retireStartPi / safeTotal) * 100);
  const corpPct = Math.round((state.retireStartCorp / safeTotal) * 100);
  const tfsaPct = Math.max(0, 100 - p1Pct - p2Pct - piPct - corpPct);

  const totalRrsp = isCouple
    ? state.retireStartP1Rrsp + state.retireStartP2Rrsp
    : state.retireStartP1Rrsp;
  const piGainDollars = Math.round(state.retireStartPi * (state.retireStartPiGainPct / 100));
  const piAcbDollars = Math.max(0, state.retireStartPi - piGainDollars);
  const corpGainDollars = Math.round(state.retireStartCorp * (state.retireStartCorpGainPct / 100));
  const corpCdaDollars = Math.round(corpGainDollars * 0.5);
  const taxFreePool = state.retireStartTfsa + piAcbDollars + corpCdaDollars;

  const segments: BarSegmentItem[] = [
    {
      segId: "retire-seg-p1",
      lblId: "retire-lbl-p1",
      variant: "p1",
      pct: p1Pct,
      labelHtml: `${isCouple ? "P1 RRSP" : "RRSP"}: ${p1Pct}% (${formatCompact(state.retireStartP1Rrsp)})`,
      labelColor: "var(--rrsp-color)",
    },
    ...(isCouple
      ? [
          {
            segId: "retire-seg-p2",
            lblId: "retire-lbl-p2",
            variant: "p2",
            pct: p2Pct,
            labelHtml: `P2 RRSP: ${p2Pct}% (${formatCompact(state.retireStartP2Rrsp)})`,
            labelColor: "#8b5cf6",
          },
        ]
      : []),
    {
      segId: "retire-seg-pi",
      lblId: "retire-lbl-pi",
      variant: "pi",
      pct: piPct,
      labelHtml: `PI: ${piPct}% (${formatCompact(state.retireStartPi)})`,
      labelColor: "var(--nonreg-color)",
    },
    {
      segId: "retire-seg-corp",
      lblId: "retire-lbl-corp",
      variant: "corp",
      pct: corpPct,
      labelHtml: `Corp: ${corpPct}% (${formatCompact(state.retireStartCorp)})`,
      labelColor: "var(--corp-color)",
      hiddenWhenZero: true,
      isZero: state.retireStartCorp === 0,
    },
    {
      segId: "retire-seg-tfsa",
      lblId: "retire-lbl-tfsa",
      variant: "tfsa",
      pct: tfsaPct,
      labelHtml: `TFSA: ${tfsaPct}% (${formatCompact(state.retireStartTfsa)})`,
      labelColor: "var(--tfsa-color)",
    },
  ];

  const presetsHtml = isCouple
    ? `
      <button type="button" id="retire-preset-couple-equal" class="alloc-preset-btn">⚡ Equal RRSPs (30/30/25/15)</button>
      <button type="button" id="retire-preset-couple-corp" class="alloc-preset-btn" style="border-color:rgba(244,114,182,0.45);color:var(--corp-color);">🏢 +Co-Owned Corp Mix</button>
      <button type="button" id="retire-preset-couple-taxfree" class="alloc-preset-btn">🛡️ Tax-Efficient (20/20/30/30)</button>
      <button type="button" id="retire-preset-couple-allrrsp" class="alloc-preset-btn">🟣 100% RRSP (50/50)</button>
    `
    : `
      <button type="button" id="retire-preset-single-balanced" class="alloc-preset-btn">⚖️ 60% RRSP / 25% PI / 15% TFSA</button>
      <button type="button" id="retire-preset-single-corp" class="alloc-preset-btn" style="border-color:rgba(244,114,182,0.45);color:var(--corp-color);">🏢 +Corp HoldCo Mix</button>
      <button type="button" id="retire-preset-single-taxfree" class="alloc-preset-btn">🛡️ 40% RRSP / 30% PI / 30% TFSA</button>
      <button type="button" id="retire-preset-single-allrrsp" class="alloc-preset-btn">💰 100% RRSP</button>
    `;

  return `
    ${renderSliderField({
      id: "retire-start-assets-card",
      label: isCouple ? "Combined Portfolio at Retirement" : "Starting Portfolio at Retirement",
      sliderId: "slider-retire-total",
      numId: "num-retire-total",
      dispId: "disp-retire-total",
      displayHtml: formatCurrency(total),
      displayStyle: "color:var(--total-color);",
      value: total,
      sliderMin: 50000,
      sliderMax: 6000000,
      numMin: 0,
      numMax: 25000000,
      step: 25000,
    })}

    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label">🏦 Retirement Starting Asset Breakdown</label>
      </div>

      ${renderSegmentedBar({ segments })}

      <div class="alloc-presets-grid">
        ${presetsHtml}
      </div>

      ${renderAccountAllocCard({
        variant: "p1",
        icon: "🟣",
        title: isCouple ? "Person 1 RRSP / RRIF" : "RRSP / RRIF Balance",
        badgeId: "retire-badge-p1",
        badgeClass: "alloc-share-badge rrsp",
        badgeText: `${p1Pct}% of portfolio`,
        subtitle: "100% Taxable · RRIF at 71",
        dispId: "disp-retire-p1-rrsp",
        displayValue: formatCurrency(state.retireStartP1Rrsp),
        slider: {
          sliderId: "slider-retire-p1-rrsp",
          numId: "num-retire-p1-rrsp",
          value: state.retireStartP1Rrsp,
          sliderMin: 0,
          sliderMax: 3000000,
          numMax: 15000000,
          step: 10000,
        },
      })}

      ${
        isCouple
          ? renderAccountAllocCard({
              variant: "p2",
              icon: "🟣",
              title: "Person 2 RRSP / Spousal",
              badgeId: "retire-badge-p2",
              badgeClass: "alloc-share-badge p2",
              badgeText: `${p2Pct}% of portfolio`,
              subtitle: "Eligible for 50/50 Split",
              dispId: "disp-retire-p2-rrsp",
              displayValue: formatCurrency(state.retireStartP2Rrsp),
              slider: {
                sliderId: "slider-retire-p2-rrsp",
                numId: "num-retire-p2-rrsp",
                value: state.retireStartP2Rrsp,
                sliderMin: 0,
                sliderMax: 3000000,
                numMax: 15000000,
                step: 10000,
              },
            })
          : ""
      }

      ${renderAccountAllocCard({
        variant: "pi",
        icon: "🟠",
        title: isCouple ? "Joint Personal Account (PI)" : "Personal Investment (PI)",
        badgeId: "retire-badge-pi",
        badgeClass: "alloc-share-badge pi",
        badgeText: `${piPct}% of portfolio`,
        subtitle: "Taxable Non-Registered",
        dispId: "disp-retire-pi",
        displayValue: formatCurrency(state.retireStartPi),
        slider: {
          sliderId: "slider-retire-pi",
          numId: "num-retire-pi",
          value: state.retireStartPi,
          sliderMin: 0,
          sliderMax: 3000000,
          numMax: 15000000,
          step: 10000,
        },
        subSlider: {
          label: "Unrealized Capital Gains %:",
          dispId: "disp-retire-pi-gain",
          displayText: `${state.retireStartPiGainPct}% Gain (${formatCompact(piGainDollars)}) · ACB: ${formatCompact(piAcbDollars)}`,
          color: "var(--nonreg-color)",
          sliderId: "slider-retire-pi-gain",
          value: state.retireStartPiGainPct,
        },
      })}

      ${renderAccountAllocCard({
        variant: "corp",
        icon: "🏢",
        title: isCouple ? "2-Person Co-Owned Corp (CCPC)" : "Private Corp (CCPC / HoldCo)",
        badgeId: "retire-badge-corp",
        badgeClass: "alloc-share-badge corp",
        badgeText: `${corpPct}% of portfolio`,
        subtitle: isCouple ? "50/50 Spousal Dividends + Tax-Free CDA" : "CCPC Dividends + Tax-Free CDA",
        dispId: "disp-retire-corp",
        displayValue: formatCurrency(state.retireStartCorp),
        slider: {
          sliderId: "slider-retire-corp",
          numId: "num-retire-corp",
          value: state.retireStartCorp,
          sliderMin: 0,
          sliderMax: 4000000,
          numMax: 20000000,
          step: 10000,
        },
        subSlider: {
          label: "Corp Unrealized Cap Gains %:",
          dispId: "disp-retire-corp-gain",
          displayText: `${state.retireStartCorpGainPct}% Gain · Tax-Free CDA: ${formatCompact(corpCdaDollars)}`,
          color: "var(--corp-color)",
          sliderId: "slider-retire-corp-gain",
          value: state.retireStartCorpGainPct,
        },
      })}

      ${renderAccountAllocCard({
        variant: "tfsa",
        icon: "🟢",
        title: isCouple ? "Combined Dual TFSAs" : "TFSA Balance",
        badgeId: "retire-badge-tfsa",
        badgeClass: "alloc-share-badge tfsa",
        badgeText: `${tfsaPct}% of portfolio`,
        subtitle: "100% Tax-Free Growth & Draw",
        dispId: "disp-retire-tfsa",
        displayValue: formatCurrency(state.retireStartTfsa),
        slider: {
          sliderId: "slider-retire-tfsa",
          numId: "num-retire-tfsa",
          value: state.retireStartTfsa,
          sliderMin: 0,
          sliderMax: 1500000,
          numMax: 10000000,
          step: 5000,
        },
      })}

      <!-- Tax Character Summary Box -->
      <div class="refund-summary-box" style="background:rgba(56,189,248,0.07);border-color:rgba(56,189,248,0.25);">
        <div class="refund-summary-header" style="margin-bottom:0.3rem;">
          <span style="font-size:0.78rem;font-weight:700;color:var(--text-primary);">
            🛡️ Tax-Free TFSA + ACB + Corp CDA Cushion
          </span>
          <span id="retire-taxfree-val" class="refund-summary-val" style="color:var(--tfsa-color);font-size:0.88rem;">
            ${formatCurrency(taxFreePool)}
          </span>
        </div>
        <div id="retire-tax-character-note" style="font-size:0.72rem;color:var(--text-secondary);line-height:1.35;">
          <strong>Taxable RRSP:</strong> ${formatCurrency(totalRrsp)}${state.retireStartCorp > 0 ? ` · <strong>Corp:</strong> ${formatCurrency(state.retireStartCorp)}` : ""} · <strong>Tax-Free Cushion:</strong> ${formatCurrency(taxFreePool)}
        </div>
      </div>
    </div>
  `;
}

export function updateRetirementAllocationVisuals(): void {
  const isCouple = state.householdMode === "couple";
  const total = isCouple
    ? state.retireStartP1Rrsp +
      state.retireStartP2Rrsp +
      state.retireStartPi +
      state.retireStartCorp +
      state.retireStartTfsa
    : state.retireStartP1Rrsp +
      state.retireStartPi +
      state.retireStartCorp +
      state.retireStartTfsa;
  state.retireStartTotal = total;
  const safeTotal = Math.max(1, total);

  const p1Pct = Math.round((state.retireStartP1Rrsp / safeTotal) * 100);
  const p2Pct = isCouple ? Math.round((state.retireStartP2Rrsp / safeTotal) * 100) : 0;
  const piPct = Math.round((state.retireStartPi / safeTotal) * 100);
  const corpPct = Math.round((state.retireStartCorp / safeTotal) * 100);
  const tfsaPct = Math.max(0, 100 - p1Pct - p2Pct - piPct - corpPct);

  const setWidth = (id: string, pct: number) => {
    const el = document.getElementById(id);
    if (el) el.style.width = `${pct}%`;
  };
  setWidth("retire-seg-p1", p1Pct);
  setWidth("retire-seg-p2", p2Pct);
  setWidth("retire-seg-pi", piPct);
  setWidth("retire-seg-corp", corpPct);
  setWidth("retire-seg-tfsa", tfsaPct);

  const lblP1 = document.getElementById("retire-lbl-p1");
  const lblP2 = document.getElementById("retire-lbl-p2");
  const lblPi = document.getElementById("retire-lbl-pi");
  const lblCorp = document.getElementById("retire-lbl-corp");
  const lblTfsa = document.getElementById("retire-lbl-tfsa");

  if (lblP1) lblP1.textContent = `${isCouple ? "P1 RRSP" : "RRSP"}: ${p1Pct}% (${formatCompact(state.retireStartP1Rrsp)})`;
  if (lblP2 && isCouple) lblP2.textContent = `P2 RRSP: ${p2Pct}% (${formatCompact(state.retireStartP2Rrsp)})`;
  if (lblPi) lblPi.textContent = `PI: ${piPct}% (${formatCompact(state.retireStartPi)})`;
  if (lblCorp) {
    lblCorp.style.display = state.retireStartCorp > 0 ? "inline" : "none";
    lblCorp.textContent = `Corp: ${corpPct}% (${formatCompact(state.retireStartCorp)})`;
  }
  if (lblTfsa) lblTfsa.textContent = `TFSA: ${tfsaPct}% (${formatCompact(state.retireStartTfsa)})`;

  const setText = (id: string, text: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setText("retire-badge-p1", `${p1Pct}% of portfolio`);
  setText("retire-badge-p2", `${p2Pct}% of portfolio`);
  setText("retire-badge-pi", `${piPct}% of portfolio`);
  setText("retire-badge-corp", `${corpPct}% of portfolio`);
  setText("retire-badge-tfsa", `${tfsaPct}% of portfolio`);

  const totalRrsp = isCouple
    ? state.retireStartP1Rrsp + state.retireStartP2Rrsp
    : state.retireStartP1Rrsp;
  const piGainDollars = Math.round(state.retireStartPi * (state.retireStartPiGainPct / 100));
  const piAcbDollars = Math.max(0, state.retireStartPi - piGainDollars);
  const corpGainDollars = Math.round(state.retireStartCorp * (state.retireStartCorpGainPct / 100));
  const corpCdaDollars = Math.round(corpGainDollars * 0.5);
  const taxFreePool = state.retireStartTfsa + piAcbDollars + corpCdaDollars;

  setText(
    "disp-retire-pi-gain",
    `${state.retireStartPiGainPct}% Gain (${formatCompact(piGainDollars)}) · ACB: ${formatCompact(piAcbDollars)}`
  );
  setText(
    "disp-retire-corp-gain",
    `${state.retireStartCorpGainPct}% Gain · Tax-Free CDA: ${formatCompact(corpCdaDollars)}`
  );
  setText("retire-taxfree-val", formatCurrency(taxFreePool));

  const taxNote = document.getElementById("retire-tax-character-note");
  if (taxNote) {
    taxNote.innerHTML = `<strong>Taxable RRSP:</strong> ${formatCurrency(totalRrsp)}${state.retireStartCorp > 0 ? ` · <strong>Corp:</strong> ${formatCurrency(state.retireStartCorp)}` : ""} · <strong>Tax-Free Cushion:</strong> ${formatCurrency(taxFreePool)}`;
  }
}

export function syncAllRetirementStartInputs(): void {
  const isCouple = state.householdMode === "couple";
  const total = isCouple
    ? state.retireStartP1Rrsp +
      state.retireStartP2Rrsp +
      state.retireStartPi +
      state.retireStartCorp +
      state.retireStartTfsa
    : state.retireStartP1Rrsp +
      state.retireStartPi +
      state.retireStartCorp +
      state.retireStartTfsa;
  state.retireStartTotal = total;

  syncInputPair(
    "slider-retire-total",
    "num-retire-total",
    "disp-retire-total",
    total,
    formatCurrency(total),
    6000000
  );
  syncInputPair(
    "slider-retire-p1-rrsp",
    "num-retire-p1-rrsp",
    "disp-retire-p1-rrsp",
    state.retireStartP1Rrsp,
    formatCurrency(state.retireStartP1Rrsp),
    3000000
  );
  if (isCouple) {
    syncInputPair(
      "slider-retire-p2-rrsp",
      "num-retire-p2-rrsp",
      "disp-retire-p2-rrsp",
      state.retireStartP2Rrsp,
      formatCurrency(state.retireStartP2Rrsp),
      3000000
    );
  }
  syncInputPair(
    "slider-retire-pi",
    "num-retire-pi",
    "disp-retire-pi",
    state.retireStartPi,
    formatCurrency(state.retireStartPi),
    3000000
  );
  syncInputPair(
    "slider-retire-corp",
    "num-retire-corp",
    "disp-retire-corp",
    state.retireStartCorp,
    formatCurrency(state.retireStartCorp),
    4000000
  );
  syncInputPair(
    "slider-retire-tfsa",
    "num-retire-tfsa",
    "disp-retire-tfsa",
    state.retireStartTfsa,
    formatCurrency(state.retireStartTfsa),
    1500000
  );

  updateRetirementAllocationVisuals();
}

export function attachRetirementStartListeners(cb: AppRenderCallbacks): void {
  const isCouple = state.householdMode === "couple";

  bindSliderPair({
    sliderId: "slider-retire-total",
    numId: "num-retire-total",
    dispId: "disp-retire-total",
    maxSliderVal: 6000000,
    minVal: 0,
    formatter: formatCurrency,
    onChange: (safeNewTotal) => {
      state.retireStartTotal = safeNewTotal;
      if (isCouple) {
        const currentSum =
          state.retireStartP1Rrsp +
            state.retireStartP2Rrsp +
            state.retireStartPi +
            state.retireStartCorp +
            state.retireStartTfsa || 1;
        const rP1 = state.retireStartP1Rrsp / currentSum;
        const rP2 = state.retireStartP2Rrsp / currentSum;
        const rPi = state.retireStartPi / currentSum;
        const rCorp = state.retireStartCorp / currentSum;
        state.retireStartP1Rrsp = Math.round((safeNewTotal * rP1) / 1000) * 1000;
        state.retireStartP2Rrsp = Math.round((safeNewTotal * rP2) / 1000) * 1000;
        state.retireStartPi = Math.round((safeNewTotal * rPi) / 1000) * 1000;
        state.retireStartCorp = Math.round((safeNewTotal * rCorp) / 1000) * 1000;
        state.retireStartTfsa = Math.max(
          0,
          safeNewTotal -
            state.retireStartP1Rrsp -
            state.retireStartP2Rrsp -
            state.retireStartPi -
            state.retireStartCorp
        );
      } else {
        const currentSum =
          state.retireStartP1Rrsp +
            state.retireStartPi +
            state.retireStartCorp +
            state.retireStartTfsa || 1;
        const rP1 = state.retireStartP1Rrsp / currentSum;
        const rPi = state.retireStartPi / currentSum;
        const rCorp = state.retireStartCorp / currentSum;
        state.retireStartP1Rrsp = Math.round((safeNewTotal * rP1) / 1000) * 1000;
        state.retireStartPi = Math.round((safeNewTotal * rPi) / 1000) * 1000;
        state.retireStartCorp = Math.round((safeNewTotal * rCorp) / 1000) * 1000;
        state.retireStartTfsa = Math.max(
          0,
          safeNewTotal - state.retireStartP1Rrsp - state.retireStartPi - state.retireStartCorp
        );
      }
      syncAllRetirementStartInputs();
      cb.updateResultsOnly();
    },
  });

  const bindRetireAsset = (
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
          ? state.retireStartP1Rrsp +
            state.retireStartP2Rrsp +
            state.retireStartPi +
            state.retireStartCorp +
            state.retireStartTfsa
          : state.retireStartP1Rrsp +
            state.retireStartPi +
            state.retireStartCorp +
            state.retireStartTfsa;
        state.retireStartTotal = total;
        syncInputPair(
          "slider-retire-total",
          "num-retire-total",
          "disp-retire-total",
          total,
          formatCurrency(total),
          6000000
        );
        updateRetirementAllocationVisuals();
        cb.updateResultsOnly();
      },
    });
  };

  bindRetireAsset("slider-retire-p1-rrsp", "num-retire-p1-rrsp", "disp-retire-p1-rrsp", 3000000, (v) => {
    state.retireStartP1Rrsp = v;
  });
  if (isCouple) {
    bindRetireAsset("slider-retire-p2-rrsp", "num-retire-p2-rrsp", "disp-retire-p2-rrsp", 3000000, (v) => {
      state.retireStartP2Rrsp = v;
    });
  }
  bindRetireAsset("slider-retire-pi", "num-retire-pi", "disp-retire-pi", 3000000, (v) => {
    state.retireStartPi = v;
  });
  bindRetireAsset("slider-retire-corp", "num-retire-corp", "disp-retire-corp", 4000000, (v) => {
    state.retireStartCorp = v;
  });
  bindRetireAsset("slider-retire-tfsa", "num-retire-tfsa", "disp-retire-tfsa", 1500000, (v) => {
    state.retireStartTfsa = v;
  });

  const sliderPiGain = document.getElementById("slider-retire-pi-gain") as HTMLInputElement | null;
  sliderPiGain?.addEventListener("input", () => {
    state.retireStartPiGainPct = parseFloat(sliderPiGain.value) || 0;
    updateRetirementAllocationVisuals();
    cb.updateResultsOnly();
  });

  const sliderCorpGain = document.getElementById("slider-retire-corp-gain") as HTMLInputElement | null;
  sliderCorpGain?.addEventListener("input", () => {
    state.retireStartCorpGainPct = parseFloat(sliderCorpGain.value) || 0;
    updateRetirementAllocationVisuals();
    cb.updateResultsOnly();
  });

  const applyRetirePreset = (p1Pct: number, p2Pct: number, piPct: number, corpPct = 0) => {
    const baseTotal = state.retireStartTotal > 0 ? state.retireStartTotal : 1200000;
    if (isCouple) {
      state.retireStartP1Rrsp = Math.round((baseTotal * p1Pct) / 1000) * 1000;
      state.retireStartP2Rrsp = Math.round((baseTotal * p2Pct) / 1000) * 1000;
      state.retireStartPi = Math.round((baseTotal * piPct) / 1000) * 1000;
      state.retireStartCorp = Math.round((baseTotal * corpPct) / 1000) * 1000;
      state.retireStartTfsa = Math.max(
        0,
        baseTotal -
          state.retireStartP1Rrsp -
          state.retireStartP2Rrsp -
          state.retireStartPi -
          state.retireStartCorp
      );
    } else {
      state.retireStartP1Rrsp = Math.round((baseTotal * p1Pct) / 1000) * 1000;
      state.retireStartPi = Math.round((baseTotal * piPct) / 1000) * 1000;
      state.retireStartCorp = Math.round((baseTotal * corpPct) / 1000) * 1000;
      state.retireStartTfsa = Math.max(
        0,
        baseTotal - state.retireStartP1Rrsp - state.retireStartPi - state.retireStartCorp
      );
    }
    syncAllRetirementStartInputs();
    cb.updateResultsOnly();
  };

  if (isCouple) {
    document
      .getElementById("retire-preset-couple-equal")
      ?.addEventListener("click", () => applyRetirePreset(0.3, 0.3, 0.25, 0));
    document
      .getElementById("retire-preset-couple-corp")
      ?.addEventListener("click", () => applyRetirePreset(0.2, 0.2, 0.1, 0.35));
    document
      .getElementById("retire-preset-couple-taxfree")
      ?.addEventListener("click", () => applyRetirePreset(0.2, 0.2, 0.3, 0));
    document
      .getElementById("retire-preset-couple-allrrsp")
      ?.addEventListener("click", () => applyRetirePreset(0.5, 0.5, 0, 0));
  } else {
    document
      .getElementById("retire-preset-single-balanced")
      ?.addEventListener("click", () => applyRetirePreset(0.6, 0, 0.25, 0));
    document
      .getElementById("retire-preset-single-corp")
      ?.addEventListener("click", () => applyRetirePreset(0.35, 0, 0.1, 0.4));
    document
      .getElementById("retire-preset-single-taxfree")
      ?.addEventListener("click", () => applyRetirePreset(0.4, 0, 0.3, 0));
    document
      .getElementById("retire-preset-single-allrrsp")
      ?.addEventListener("click", () => applyRetirePreset(1.0, 0, 0, 0));
  }
}

