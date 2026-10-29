import homeIcon from "@static/shared/assets/home.svg?raw";
import { findMaxSafeSpending } from "../../calculator";
import { formatCurrency } from "../../formatters";
import { getStrategyParams, state } from "../../state";
import { syncInputPair } from "../ui/sliderField";
import { AppRenderCallbacks } from "../ui/types";

export function renderAppHeader(isCouple: boolean): string {
  const base = import.meta.env.BASE_URL ?? "./";
  const appIcon = `${base}calculator.svg`;

  return `
    <!-- Header -->
    <header class="app-header">
      <nav class="nav-bar">
        <div class="breadcrumb-group">
          <a href="https://neilhan.github.io/static" class="home-link" title="Back to Home" aria-label="Back to Home">
            <span class="home-icon" aria-hidden="true">${homeIcon}</span>
          </a>
          <span class="breadcrumb-sep">/</span>
          <span class="badge-tag">RETIREMENT STRATEGY ENGINE</span>
        </div>
        <button id="theme-toggle" class="theme-toggle-btn" aria-label="Toggle theme">
          ${state.theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </nav>

      <div class="hero-banner">
        <img src="${appIcon}" alt="Calculator Logo" class="app-logo" />
        <div class="hero-text">
          <h1>${isCouple ? "Couples Retirement Strategy Simulator" : "Canadian Retirement Strategy Simulator"}</h1>
          <p>
            ${
              isCouple
                ? "Optimize household savings across Person 1 RRSP, Person 2 RRSP, Personal Accounts, and a 2-Person Co-Owned Corp (CCPC / HoldCo). Model CRA pension & dividend splitting, CDA tax-free dividends, and dual OAS clawback shields."
                : "Optimize accumulation allocation (RRSP vs. Personal Investment vs. Private Corp vs. TFSA) and decumulation sequence to minimize lifetime taxes and shield your OAS pension."
            }
          </p>
        </div>
      </div>
    </header>

    <!-- Household Mode Selector (Single vs Couple) -->
    <div class="household-toggle-wrapper">
      <div class="household-pills">
        <button id="btn-household-single" class="household-pill ${!isCouple ? "active" : ""}">
          👤 Single Individual
        </button>
        <button id="btn-household-couple" class="household-pill ${isCouple ? "active" : ""}">
          👥 Couple (2 Persons / Spousal)
        </button>
      </div>
    </div>

    <!-- Mode Switcher -->
    <nav class="app-nav-tabs" aria-label="View Mode">
      <button id="tab-mode-sim" class="nav-tab-btn ${state.viewMode === "simulator" ? "active" : ""}">
        🎯 Strategy Simulator & Optimizer
      </button>
      <button id="tab-mode-comp" class="nav-tab-btn ${state.viewMode === "comparator" ? "active" : ""}">
        ⚖️ Direct Account Comparison (RRSP vs PI vs Corp vs TFSA)
      </button>
    </nav>

    <!-- Interactive Scenario Playbook Bar -->
    <div class="scenario-playbook-bar" aria-label="Quick Experiment Scenarios">
      <span class="scenario-playbook-label">🧪 Quick Scenarios:</span>
      <button type="button" class="scenario-chip" id="chip-scenario-baseline">
        🎯 Benchmark ($80k @ 65)
      </button>
      <button type="button" class="scenario-chip" id="chip-scenario-couple-corp" style="border-color:rgba(244,114,182,0.5);color:var(--corp-color);">
        🏢 2-Person Co-Owned Corp
      </button>
      <button type="button" class="scenario-chip" id="chip-scenario-retire-now" style="border-color:rgba(168,85,247,0.45);color:#c084fc;">
        🏦 Start @ Retirement ($1.5M + Corp)
      </button>
      <button type="button" class="scenario-chip" id="chip-scenario-early">
        🏖️ Early Freedom (Age 58, $65k)
      </button>
      <button type="button" class="scenario-chip" id="chip-scenario-fat">
        🏰 High Lifestyle ($110k)
      </button>
      <button type="button" class="scenario-chip" id="chip-scenario-cppoas" style="border-color:rgba(59,130,246,0.45);color:#60a5fa;">
        🛡️ +CPP & OAS Guaranteed
      </button>
      <button type="button" class="scenario-chip" id="chip-scenario-optimize" style="border-color:rgba(16,185,129,0.45);color:#10b981;">
        ⚡ Auto-Max Safe Spend (to 95)
      </button>
    </div>
  `;
}

export function runOptimizeSafeSpending(cb: AppRenderCallbacks): void {
  const params = getStrategyParams();
  const opt = findMaxSafeSpending(params, 95);

  state.retireNetSpending = opt.maxSpending;
  state.decumStrategy = opt.bestStrategy;

  syncInputPair(
    "slider-spend",
    "num-spend",
    "disp-spend",
    opt.maxSpending,
    `${formatCurrency(opt.maxSpending)}/yr`,
    250000
  );

  const banner = document.getElementById("optimize-spend-result");
  if (banner) {
    banner.style.display = "block";
    banner.innerHTML = `
      <strong>🎉 Max Safe Spending Found:</strong> You can sustainably spend <strong>${formatCurrency(opt.maxSpending)}/yr after-tax</strong> until <strong>Age ${opt.strategyResult.depletionAge}+</strong> using the <em>"${opt.strategyResult.name}"</em> strategy!
    `;
  }

  cb.updateResultsOnly();
}

export function attachHeaderListeners(cb: AppRenderCallbacks): void {
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", state.theme);
    document.documentElement.setAttribute("data-theme", state.theme);
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.textContent = state.theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
    }
  });

  document.getElementById("btn-household-single")?.addEventListener("click", () => {
    if (state.householdMode === "single") return;
    state.householdMode = "single";
    cb.renderApp();
  });

  document.getElementById("btn-household-couple")?.addEventListener("click", () => {
    if (state.householdMode === "couple") return;
    state.householdMode = "couple";
    cb.renderApp();
  });

  document.getElementById("tab-mode-sim")?.addEventListener("click", () => {
    if (state.viewMode === "simulator") return;
    state.viewMode = "simulator";
    cb.renderApp();
  });

  document.getElementById("tab-mode-comp")?.addEventListener("click", () => {
    if (state.viewMode === "comparator") return;
    state.viewMode = "comparator";
    cb.renderApp();
  });

  document.getElementById("chip-scenario-baseline")?.addEventListener("click", () => {
    state.startAtRetirement = false;
    state.retireAge = 65;
    state.person2RetireAge = 63;
    state.yearsAccumulation = 15;
    state.retireNetSpending = 80000;
    state.corpSaving = 0;
    state.decumStrategy = "oasShield";
    cb.renderApp();
  });

  document.getElementById("chip-scenario-couple-corp")?.addEventListener("click", () => {
    state.householdMode = "couple";
    state.viewMode = "simulator";
    state.retireAge = 65;
    state.person2RetireAge = 63;
    state.enableIncomeSplitting = true;
    state.retireNetSpending = 100000;
    if (state.startAtRetirement) {
      state.retireStartP1Rrsp = 350000;
      state.retireStartP2Rrsp = 350000;
      state.retireStartPi = 150000;
      state.retireStartCorp = 600000;
      state.retireStartCorpGainPct = 50;
      state.retireStartTfsa = 200000;
      state.retireStartTotal = 1650000;
    } else {
      state.yearsAccumulation = 15;
      state.p1RrspSaving = 20000;
      state.p2RrspSaving = 20000;
      state.piSaving = 5000;
      state.corpSaving = 35000;
      state.annualSaving = 80000;
    }
    state.decumStrategy = "oasShield";
    cb.renderApp();
  });

  document.getElementById("chip-scenario-retire-now")?.addEventListener("click", () => {
    state.startAtRetirement = true;
    state.retireAge = 65;
    state.person2RetireAge = 63;
    state.retireNetSpending = 90000;
    if (state.householdMode === "couple") {
      state.retireStartP1Rrsp = 350000;
      state.retireStartP2Rrsp = 350000;
      state.retireStartPi = 200000;
      state.retireStartCorp = 400000;
      state.retireStartTfsa = 200000;
    } else {
      state.retireStartP1Rrsp = 650000;
      state.retireStartPi = 250000;
      state.retireStartCorp = 400000;
      state.retireStartTfsa = 200000;
    }
    state.retireStartTotal = 1500000;
    state.retireStartPiGainPct = 50;
    state.retireStartCorpGainPct = 50;
    state.decumStrategy = "oasShield";
    cb.renderApp();
  });

  document.getElementById("chip-scenario-early")?.addEventListener("click", () => {
    state.startAtRetirement = false;
    state.retireAge = 58;
    state.person2RetireAge = 56;
    state.yearsAccumulation = 18;
    state.retireNetSpending = 65000;
    state.decumStrategy = "rrspMeltdown";
    cb.renderApp();
  });

  document.getElementById("chip-scenario-fat")?.addEventListener("click", () => {
    state.retireNetSpending = 110000;
    state.decumStrategy = "oasShield";
    syncInputPair("slider-spend", "num-spend", "disp-spend", 110000, `${formatCurrency(110000)}/yr`);
    cb.updateResultsOnly();
  });

  document.getElementById("chip-scenario-cppoas")?.addEventListener("click", () => {
    state.includeOtherIncome = true;
    state.person1CppAnnual = 10000;
    state.person1CppStartAge = 65;
    state.person1OasAnnual = 8560;
    if (state.householdMode === "couple") {
      state.person2CppAnnual = 8000;
      state.person2CppStartAge = 65;
      state.person2OasAnnual = 8560;
    }
    cb.renderControlsPanel();
    cb.updateResultsOnly();
  });

  document.getElementById("chip-scenario-optimize")?.addEventListener("click", () => {
    runOptimizeSafeSpending(cb);
  });
}

