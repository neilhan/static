import { formatCurrency } from "../../formatters";
import { state } from "../../state";
import {
  bindSliderPair,
  InlineSliderRowProps,
  renderInlineSliderRow,
} from "../ui/sliderField";
import { AppRenderCallbacks } from "../ui/types";

interface PensionFieldProps {
  title: string;
  dispId: string;
  displayValue: string;
  slider: InlineSliderRowProps;
  extraFooterHtml?: string;
}

function renderPensionField(props: PensionFieldProps): string {
  return `
    <div class="pension-field-group">
      <div class="pension-field-header">
        <span class="pension-field-title">${props.title}</span>
        <span class="pension-field-tag" id="${props.dispId}">${props.displayValue}</span>
      </div>
      ${renderInlineSliderRow(props.slider)}
      ${props.extraFooterHtml ?? ""}
    </div>
  `;
}

function renderCppAgeSelect(selectId: string, currentAge: number): string {
  const options = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70]
    .map((a) => {
      const suffix =
        a === 65
          ? "(Standard)"
          : a < 65
          ? `(-${((65 - a) * 7.2).toFixed(0)}%)`
          : `(+${((a - 65) * 8.4).toFixed(0)}%)`;
      return `<option value="${a}" ${currentAge === a ? "selected" : ""}>Age ${a} ${suffix}</option>`;
    })
    .join("");

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.2rem;font-size:0.73rem;">
      <span style="color:var(--text-muted);">Start Age:</span>
      <select id="${selectId}" class="form-input-number" style="padding:0.15rem 0.4rem;font-size:0.75rem;">
        ${options}
      </select>
    </div>
  `;
}

function calcEstimatedGuaranteedCoverage(isCouple: boolean): {
  estNet: number;
  coveragePct: number;
  portfolioShortfall: number;
} {
  let estGross = 0;
  if (state.includeOtherIncome) {
    if (state.retireAge >= state.person1CppStartAge) estGross += state.person1CppAnnual;
    if (state.retireAge >= 65) estGross += state.person1OasAnnual;
    if (isCouple) {
      if (state.person2RetireAge >= state.person2CppStartAge) estGross += state.person2CppAnnual;
      if (state.person2RetireAge >= 65) estGross += state.person2OasAnnual;
    }
    if (state.retireAge >= state.employerPensionStartAge) estGross += state.employerPensionAnnual;
    estGross += state.otherTaxableIncome;
  }
  const estNet = Math.round(estGross * 0.85);
  const coveragePct = Math.min(
    100,
    Math.round((estNet / Math.max(1, state.retireNetSpending)) * 100)
  );
  const portfolioShortfall = Math.max(0, state.retireNetSpending - estNet);
  return { estNet, coveragePct, portfolioShortfall };
}

export function renderGuaranteedPensionsSection(isCouple: boolean): string {
  const { estNet, coveragePct, portfolioShortfall } = calcEstimatedGuaranteedCoverage(isCouple);

  return `
    <div class="pension-income-card ${state.includeOtherIncome ? "enabled" : ""}" id="pension-income-card">
      <div class="pension-card-header">
        <div class="pension-card-title-group">
          <span class="icon">🛡️</span>
          <span>Guaranteed Pensions & Income</span>
        </div>
        <div class="pension-header-actions">
          <label class="pension-switch" title="Toggle Guaranteed Other Income (CPP/OAS/Pensions)">
            <input type="checkbox" id="check-other-income" ${state.includeOtherIncome ? "checked" : ""}>
            <span class="pension-slider-toggle"></span>
          </label>
          ${
            state.includeOtherIncome
              ? `<button type="button" id="btn-toggle-income-details" class="btn-toggle-expand">
                  ${state.otherIncomeExpanded ? "Collapse ▲" : "Tune Details ▼"}
                </button>`
              : ""
          }
        </div>
      </div>

      ${
        state.includeOtherIncome
          ? `
        <div class="pension-coverage-banner" id="pension-coverage-banner">
          <div class="coverage-metrics-row">
            <span>🛡️ Covers: <strong>${formatCurrency(estNet)}/yr net</strong> (${coveragePct}%)</span>
            <span>💼 Portfolio Bridges: <strong>${formatCurrency(portfolioShortfall)}/yr</strong></span>
          </div>
          <div class="coverage-progress-bar">
            <div class="coverage-seg-pension" style="width: ${coveragePct}%;"></div>
            <div class="coverage-seg-portfolio" style="width: ${100 - coveragePct}%;"></div>
          </div>
        </div>

        <div class="pension-presets-container">
          <div class="pension-presets-label">⚡ Quick Canadian Benchmarks</div>
          <div class="pension-presets-grid">
            <button type="button" class="pension-preset-btn" id="preset-pension-standard" title="Average Canadian CPP ($10k) + full OAS ($8,560)">
              🇨🇦 Standard CPP + OAS
            </button>
            <button type="button" class="pension-preset-btn" id="preset-pension-max" title="Maximum CRA CPP ($16,375) + full OAS ($8,560)">
              👑 Max CPP + OAS
            </button>
            <button type="button" class="pension-preset-btn" id="preset-pension-db" title="Adds a $30,000/yr Employer Defined Benefit pension">
              🏢 DB Pension + CPP
            </button>
            <button type="button" class="pension-preset-btn" id="preset-pension-reset" title="Model purely on personal investment savings">
              🚫 Private Only
            </button>
          </div>
        </div>
        `
          : `
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.45rem;line-height:1.4;">
          Turn on to factor in <strong>Canada Pension Plan (CPP)</strong>, <strong>Old Age Security (OAS)</strong>, and <strong>Company Pensions</strong>.
        </div>
        `
      }

      ${
        state.includeOtherIncome && state.otherIncomeExpanded
          ? `
        <div class="pension-details-body" id="pension-details-body">
          ${renderPensionField({
            title: `👤 ${isCouple ? "Person 1 CPP" : "Canada Pension Plan (CPP)"}`,
            dispId: "disp-p1-cpp",
            displayValue: `${formatCurrency(state.person1CppAnnual)}/yr`,
            slider: {
              sliderId: "slider-p1-cpp",
              numId: "num-p1-cpp",
              value: state.person1CppAnnual,
              sliderMin: 0,
              sliderMax: 22000,
              numMax: 30000,
              step: 500,
            },
            extraFooterHtml: renderCppAgeSelect("select-p1-cpp-age", state.person1CppStartAge),
          })}

          ${renderPensionField({
            title: `🍁 ${isCouple ? "Person 1 OAS" : "Old Age Security (OAS)"}`,
            dispId: "disp-p1-oas",
            displayValue: `${formatCurrency(state.person1OasAnnual)}/yr`,
            slider: {
              sliderId: "slider-p1-oas",
              numId: "num-p1-oas",
              value: state.person1OasAnnual,
              sliderMin: 0,
              sliderMax: 12000,
              numMax: 15000,
              step: 250,
            },
            extraFooterHtml: `<div style="font-size:0.7rem;color:var(--text-muted);">Starts at Age 65 ($8,560 2024-2026 CRA rate). Subject to clawback above $91k.</div>`,
          })}

          ${
            isCouple
              ? `
              ${renderPensionField({
                title: "👤 Person 2 CPP",
                dispId: "disp-p2-cpp",
                displayValue: `${formatCurrency(state.person2CppAnnual)}/yr`,
                slider: {
                  sliderId: "slider-p2-cpp",
                  numId: "num-p2-cpp",
                  value: state.person2CppAnnual,
                  sliderMin: 0,
                  sliderMax: 22000,
                  numMax: 30000,
                  step: 500,
                },
                extraFooterHtml: renderCppAgeSelect("select-p2-cpp-age", state.person2CppStartAge),
              })}

              ${renderPensionField({
                title: "🍁 Person 2 OAS",
                dispId: "disp-p2-oas",
                displayValue: `${formatCurrency(state.person2OasAnnual)}/yr`,
                slider: {
                  sliderId: "slider-p2-oas",
                  numId: "num-p2-oas",
                  value: state.person2OasAnnual,
                  sliderMin: 0,
                  sliderMax: 12000,
                  numMax: 15000,
                  step: 250,
                },
              })}
            `
              : ""
          }

          ${renderPensionField({
            title: "🏢 Employer Defined Benefit (DB) Pension",
            dispId: "disp-db-pension",
            displayValue: `${formatCurrency(state.employerPensionAnnual)}/yr`,
            slider: {
              sliderId: "slider-db-pension",
              numId: "num-db-pension",
              value: state.employerPensionAnnual,
              sliderMin: 0,
              sliderMax: 80000,
              numMax: 150000,
              step: 2500,
            },
            extraFooterHtml: `
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.2rem;font-size:0.73rem;">
                <span style="color:var(--text-muted);">Pension Starts At:</span>
                <select id="select-db-pension-age" class="form-input-number" style="padding:0.15rem 0.4rem;font-size:0.75rem;">
                  ${[55, 58, 60, 62, 65, 67, 70]
                    .map(
                      (a) =>
                        `<option value="${a}" ${state.employerPensionStartAge === a ? "selected" : ""}>Age ${a}</option>`
                    )
                    .join("")}
                </select>
              </div>
            `,
          })}

          ${renderPensionField({
            title: "🏠 Rental or Other Taxable Income",
            dispId: "disp-other-inc",
            displayValue: `${formatCurrency(state.otherTaxableIncome)}/yr`,
            slider: {
              sliderId: "slider-other-inc",
              numId: "num-other-inc",
              value: state.otherTaxableIncome,
              sliderMin: 0,
              sliderMax: 60000,
              numMax: 150000,
              step: 2000,
            },
          })}
        </div>
        `
          : ""
      }
    </div>
  `;
}

export function updatePensionCoverageLive(): void {
  const { estNet, coveragePct, portfolioShortfall } = calcEstimatedGuaranteedCoverage(
    state.householdMode === "couple"
  );

  const banner = document.getElementById("pension-coverage-banner");
  if (!banner) return;

  const metricsRow = banner.querySelector(".coverage-metrics-row");
  if (metricsRow) {
    metricsRow.innerHTML = `
      <span>🛡️ Covers: <strong>${formatCurrency(estNet)}/yr net</strong> (${coveragePct}%)</span>
      <span>💼 Portfolio Bridges: <strong>${formatCurrency(portfolioShortfall)}/yr</strong></span>
    `;
  }
  const segPension = banner.querySelector(".coverage-seg-pension") as HTMLElement | null;
  const segPortfolio = banner.querySelector(".coverage-seg-portfolio") as HTMLElement | null;
  if (segPension) segPension.style.width = `${coveragePct}%`;
  if (segPortfolio) segPortfolio.style.width = `${100 - coveragePct}%`;
}

export function attachPensionsCardListeners(cb: AppRenderCallbacks): void {
  const isCouple = state.householdMode === "couple";

  const checkOther = document.getElementById("check-other-income") as HTMLInputElement | null;
  checkOther?.addEventListener("change", () => {
    state.includeOtherIncome = checkOther.checked;
    cb.renderControlsPanel();
    cb.updateResultsOnly();
  });

  document.getElementById("btn-toggle-income-details")?.addEventListener("click", () => {
    state.otherIncomeExpanded = !state.otherIncomeExpanded;
    cb.renderControlsPanel();
  });

  const applyPensionPreset = (fn: () => void) => {
    fn();
    cb.renderControlsPanel();
    cb.updateResultsOnly();
  };

  document.getElementById("preset-pension-standard")?.addEventListener("click", () =>
    applyPensionPreset(() => {
      state.includeOtherIncome = true;
      state.person1CppAnnual = 10000;
      state.person1CppStartAge = 65;
      state.person1OasAnnual = 8560;
      if (isCouple) {
        state.person2CppAnnual = 8000;
        state.person2CppStartAge = 65;
        state.person2OasAnnual = 8560;
      }
      state.employerPensionAnnual = 0;
      state.otherTaxableIncome = 0;
    })
  );

  document.getElementById("preset-pension-max")?.addEventListener("click", () =>
    applyPensionPreset(() => {
      state.includeOtherIncome = true;
      state.person1CppAnnual = 16375;
      state.person1CppStartAge = 65;
      state.person1OasAnnual = 8560;
      if (isCouple) {
        state.person2CppAnnual = 16375;
        state.person2CppStartAge = 65;
        state.person2OasAnnual = 8560;
      }
      state.employerPensionAnnual = 0;
      state.otherTaxableIncome = 0;
    })
  );

  document.getElementById("preset-pension-db")?.addEventListener("click", () =>
    applyPensionPreset(() => {
      state.includeOtherIncome = true;
      state.person1CppAnnual = 10000;
      state.person1CppStartAge = 65;
      state.person1OasAnnual = 8560;
      if (isCouple) {
        state.person2CppAnnual = 8000;
        state.person2CppStartAge = 65;
        state.person2OasAnnual = 8560;
      }
      state.employerPensionAnnual = 30000;
      state.employerPensionStartAge = state.retireAge;
      state.otherTaxableIncome = 0;
    })
  );

  document.getElementById("preset-pension-reset")?.addEventListener("click", () =>
    applyPensionPreset(() => {
      state.includeOtherIncome = false;
      state.employerPensionAnnual = 0;
      state.otherTaxableIncome = 0;
    })
  );

  if (!state.includeOtherIncome || !state.otherIncomeExpanded) return;

  const bindPensionSlider = (
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
      formatter: (v) => `${formatCurrency(v)}/yr`,
      onChange: (v) => {
        setter(v);
        updatePensionCoverageLive();
        cb.updateResultsOnly();
      },
    });
  };

  bindPensionSlider("slider-p1-cpp", "num-p1-cpp", "disp-p1-cpp", 22000, (v) => {
    state.person1CppAnnual = v;
  });
  bindPensionSlider("slider-p1-oas", "num-p1-oas", "disp-p1-oas", 12000, (v) => {
    state.person1OasAnnual = v;
  });

  const selP1CppAge = document.getElementById("select-p1-cpp-age") as HTMLSelectElement | null;
  selP1CppAge?.addEventListener("change", () => {
    state.person1CppStartAge = parseInt(selP1CppAge.value, 10);
    updatePensionCoverageLive();
    cb.updateResultsOnly();
  });

  if (isCouple) {
    bindPensionSlider("slider-p2-cpp", "num-p2-cpp", "disp-p2-cpp", 22000, (v) => {
      state.person2CppAnnual = v;
    });
    bindPensionSlider("slider-p2-oas", "num-p2-oas", "disp-p2-oas", 12000, (v) => {
      state.person2OasAnnual = v;
    });
    const selP2CppAge = document.getElementById("select-p2-cpp-age") as HTMLSelectElement | null;
    selP2CppAge?.addEventListener("change", () => {
      state.person2CppStartAge = parseInt(selP2CppAge.value, 10);
      updatePensionCoverageLive();
      cb.updateResultsOnly();
    });
  }

  bindPensionSlider("slider-db-pension", "num-db-pension", "disp-db-pension", 80000, (v) => {
    state.employerPensionAnnual = v;
  });
  const selDbAge = document.getElementById("select-db-pension-age") as HTMLSelectElement | null;
  selDbAge?.addEventListener("change", () => {
    state.employerPensionStartAge = parseInt(selDbAge.value, 10);
    updatePensionCoverageLive();
    cb.updateResultsOnly();
  });

  bindPensionSlider("slider-other-inc", "num-other-inc", "disp-other-inc", 60000, (v) => {
    state.otherTaxableIncome = v;
  });
}

