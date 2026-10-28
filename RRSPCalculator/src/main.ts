import "./style.css";
import {
  runSimulation,
  simulatePortfolioStrategy,
  compareAllStrategies,
  findMaxSafeSpending,
  FullSimulationComparison,
  StrategyResult,
  DecumulationStrategy,
  HouseholdMode,
  StrategyYearRecord,
} from "./calculator";
import homeIcon from "@static/shared/assets/home.svg?raw";

// Application State
let state = {
  householdMode: "single" as HouseholdMode,
  viewMode: "simulator" as "simulator" | "comparator",
  annualSaving: 40000,
  yearsAccumulation: 15,
  retireAge: 65, // Person 1
  person2RetireAge: 63, // Person 2 (for couples)
  retireNetSpending: 80000,
  workTaxRate: 0.43, // Person 1
  person2WorkTaxRate: 0.30, // Person 2
  growthRatePreTax: 0.07,
  taxDrag: 0.015,
  retireGrowthRate: 0.05,
  enableIncomeSplitting: true,

  // Granular Household Savings Allocation ($)
  p1RrspSaving: 25000,
  p2RrspSaving: 10000,
  piSaving: 15000,
  tfsaSaving: 0,

  // Simulator Strategy & Percentages
  rrspPct: 70,
  piPct: 30,
  tfsaPct: 0,
  reinvestRefundTo: "tfsa" as "tfsa" | "pi" | "none",
  decumStrategy: "oasShield" as DecumulationStrategy,

  // Guaranteed Pensions & Other Income
  includeOtherIncome: false,
  otherIncomeExpanded: false,
  person1CppAnnual: 10000,
  person1CppStartAge: 65,
  person2CppAnnual: 8000,
  person2CppStartAge: 65,
  person1OasAnnual: 8560,
  person2OasAnnual: 8560,
  employerPensionAnnual: 0,
  employerPensionStartAge: 65,
  otherTaxableIncome: 0,

  // Direct Comparator Specific State
  comparatorMode: "preTax" as "preTax" | "cashOut",
  comparatorReinvest: false,

  chartViewMode: "balances" as "balances" | "incomeStreams",
  blueprintSelectedAge: null as number | null,

  ledgerOpen: false,
  theme: (localStorage.getItem("theme") as "dark" | "light") || "dark",
};

document.documentElement.setAttribute("data-theme", state.theme);

const app = document.getElementById("app")!;

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatCompact(val: number): string {
  if (val >= 1000000) {
    return `$${(val / 1000000).toFixed(2)}M`;
  }
  if (val >= 1000) {
    return `$${(val / 1000).toFixed(0)}k`;
  }
  return `$${val}`;
}

function getStrategyParams() {
  const isCouple = state.householdMode === "couple";
  const totalSaving = isCouple
    ? state.p1RrspSaving + state.p2RrspSaving + state.piSaving
    : state.p1RrspSaving + state.piSaving;
  state.annualSaving = totalSaving;

  return {
    householdMode: state.householdMode,
    annualSaving: state.annualSaving,
    yearsAccumulation: state.yearsAccumulation,
    retireAge: state.retireAge,
    person2RetireAge: state.person2RetireAge,
    retireNetSpending: state.retireNetSpending,
    workTaxRate: state.workTaxRate,
    person2WorkTaxRate: state.person2WorkTaxRate,
    growthRatePreTax: state.growthRatePreTax,
    taxDrag: state.taxDrag,
    retireGrowthRate: state.retireGrowthRate,
    enableIncomeSplitting: state.enableIncomeSplitting,
    rrspPct: state.rrspPct,
    piPct: state.piPct,
    tfsaPct: state.tfsaPct,
    person1RrspSaving: state.p1RrspSaving,
    person2RrspSaving: isCouple ? state.p2RrspSaving : 0,
    piSaving: state.piSaving,
    tfsaSaving: state.tfsaSaving,
    reinvestRefundTo: state.reinvestRefundTo,
    includeOtherIncome: state.includeOtherIncome,
    person1CppAnnual: state.person1CppAnnual,
    person1CppStartAge: state.person1CppStartAge,
    person2CppAnnual: state.person2CppAnnual,
    person2CppStartAge: state.person2CppStartAge,
    person1OasAnnual: state.person1OasAnnual,
    person2OasAnnual: state.person2OasAnnual,
    employerPensionAnnual: state.employerPensionAnnual,
    employerPensionStartAge: state.employerPensionStartAge,
    otherTaxableIncome: state.otherTaxableIncome,
  };
}

/**
 * Top-Level App Render (Layout Shell)
 * Called on page load and when switching Household Mode (Single/Couple) or View Mode (Simulator/Comparator).
 * Sliders NEVER call this function directly so mouse dragging is 100% uninterrupted.
 */
function renderApp(): void {
  const isCouple = state.householdMode === "couple";
  const base = import.meta.env.BASE_URL ?? "./";
  const appIcon = `${base}calculator.svg`;

  // Make sure savings breakdown matches mode
  if (!isCouple) {
    // Single: p1RrspSaving + piSaving = annualSaving
    const currentSum = state.p1RrspSaving + state.piSaving;
    if (currentSum !== state.annualSaving) {
      state.p1RrspSaving = Math.min(32490, Math.round(state.annualSaving * 0.7));
      state.piSaving = Math.max(0, state.annualSaving - state.p1RrspSaving);
    }
  } else {
    // Couple: p1RrspSaving + p2RrspSaving + piSaving = annualSaving
    const currentSum = state.p1RrspSaving + state.p2RrspSaving + state.piSaving;
    if (currentSum !== state.annualSaving) {
      const half = Math.min(32490, Math.round(state.annualSaving * 0.35));
      state.p1RrspSaving = half;
      state.p2RrspSaving = half;
      state.piSaving = Math.max(0, state.annualSaving - half * 2);
    }
  }

  app.innerHTML = `
    <div class="container">
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
                  ? "Optimize household savings across Person 1 RRSP, Person 2 RRSP, and Personal Accounts. Model CRA pension income splitting (age 65+), dual basic personal tax credits, and dual OAS clawback shields."
                  : "Optimize accumulation allocation (RRSP vs. Personal Investment vs. TFSA) and decumulation sequence to minimize lifetime taxes and shield your OAS pension."
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
          ⚖️ Direct Account Comparison (RRSP vs PI vs TFSA)
        </button>
      </nav>

      <!-- Interactive Scenario Playbook Bar -->
      <div class="scenario-playbook-bar" aria-label="Quick Experiment Scenarios">
        <span class="scenario-playbook-label">🧪 Quick Scenarios:</span>
        <button type="button" class="scenario-chip" id="chip-scenario-baseline">
          🎯 Benchmark ($80k @ 65)
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

      <!-- Main Layout -->
      <main class="main-layout">
        <!-- Controls Sidebar (Persistent DOM Element) -->
        <aside id="controls-panel" class="panel" aria-label="Calculator Settings">
          ${renderControlsHTML(isCouple)}
        </aside>

        <!-- Dynamic Results Panel (Updated on Drag) -->
        <section id="results-container" class="results-container" aria-label="Results">
          <!-- Populated by updateResultsOnly() -->
        </section>
      </main>

      <!-- Rules & Considerations Section -->
      ${renderRulesSection()}

      <footer class="footer-note">
        <p>Built with CRA RRIF prescribed factors (Age 71+), Pension Income Splitting (Form T1032), Federal & Provincial (Ontario benchmark) graduated brackets, Basic Personal Amounts, and Capital Gains 50% inclusion rules.</p>
        <p>© ${new Date().getFullYear()} static-apps · Educational financial model. Not formal financial advice.</p>
      </footer>
    </div>
  `;

  attachStaticEventListeners();
  attachControlsEventListeners();
  updateResultsOnly();
}

/**
 * Re-renders the controls panel contents without recreating the outer container.
 */
function renderControlsPanel(): void {
  const panel = document.getElementById("controls-panel");
  if (!panel) return;
  panel.innerHTML = renderControlsHTML(state.householdMode === "couple");
  attachControlsEventListeners();
}

/**
 * Render Sidebar Controls HTML
 */
function renderControlsHTML(isCouple: boolean): string {
  const currentAge1 = Math.max(18, state.retireAge - state.yearsAccumulation);
  const currentAge2 = Math.max(18, state.person2RetireAge - state.yearsAccumulation);

  return `
    <h2 class="panel-title">${isCouple ? "Household Profile & Targets" : "Your Profile & Targets"}</h2>

    <!-- Total Annual Saving -->
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-saving">
          ${isCouple ? "Combined Household Saving" : "Annual Total Saving"}
        </label>
        <span class="form-val-display" id="disp-saving">${formatCurrency(state.annualSaving)}</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-saving" min="5000" max="150000" step="1000" value="${state.annualSaving}">
        <input type="number" id="num-saving" class="form-input-number" min="1000" max="300000" step="1000" value="${state.annualSaving}">
      </div>
    </div>

    <!-- Granular Savings Allocation Breakdown -->
    ${
      state.viewMode === "simulator"
        ? renderSavingsAllocationSection(isCouple)
        : renderComparatorSidebarControls()
    }

    <div class="divider"></div>

    <!-- Years of Accumulation -->
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-years">Years to Invest</label>
        <span class="form-val-display" id="disp-years">${state.yearsAccumulation} years</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-years" min="3" max="40" step="1" value="${state.yearsAccumulation}">
        <input type="number" id="num-years" class="form-input-number" min="1" max="50" step="1" value="${state.yearsAccumulation}">
      </div>
    </div>

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
              <span style="font-size:0.75rem;color:var(--text-muted);">(Starts @ ${currentAge1})</span>
            </div>
          </div>
          <div class="dual-person-card">
            <span class="dual-person-title">👤 Person 2</span>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <input type="number" id="num-retireage2" class="form-input-number" style="width:100%;text-align:left;" min="45" max="80" step="1" value="${state.person2RetireAge}">
              <span style="font-size:0.75rem;color:var(--text-muted);">(Starts @ ${currentAge2})</span>
            </div>
          </div>
        </div>
      </div>
      `
        : `
      <div class="form-group">
        <div class="form-label-row">
          <label class="form-label" for="slider-retireage">Retire at Age</label>
          <span class="form-val-display" id="disp-retireage">Age ${state.retireAge} <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted);">(Starts @ ${currentAge1})</span></span>
        </div>
        <div class="slider-container">
          <input type="range" id="slider-retireage" min="50" max="75" step="1" value="${state.retireAge}">
          <input type="number" id="num-retireage" class="form-input-number" min="45" max="80" step="1" value="${state.retireAge}">
        </div>
      </div>
      `
    }

    <!-- Retirement Net Spending Goal -->
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-spend">
          ${isCouple ? "Household Spend (After-Tax)" : "Retirement Spend (After-Tax)"}
        </label>
        <span class="form-val-display" id="disp-spend">${formatCurrency(state.retireNetSpending)}/yr</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-spend" min="20000" max="250000" step="2500" value="${state.retireNetSpending}">
        <input type="number" id="num-spend" class="form-input-number" min="10000" max="400000" step="2500" value="${state.retireNetSpending}">
      </div>
      <button type="button" id="btn-optimize-spending" class="btn-optimize-spend">
        ⚡ Auto-Find Max Safe Spending (to Age 95)
      </button>
      <div id="optimize-spend-result" class="optimize-spend-banner" style="display:none;"></div>
    </div>

    <!-- Guaranteed Pensions & Other Income Section -->
    ${state.viewMode === "simulator" ? renderGuaranteedPensionsSection(isCouple) : ""}

    ${
      isCouple
        ? `
      <label class="reinvest-checkbox-row" style="margin-bottom:1rem;">
        <input type="checkbox" id="check-splitting" ${state.enableIncomeSplitting ? "checked" : ""}>
        <span>Enable CRA Pension Income Splitting (Age 65+)</span>
      </label>`
        : ""
    }

    <div class="divider"></div>

    <!-- Working Marginal Tax Rates -->
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
        : `
      <div class="form-group">
        <div class="form-label-row">
          <label class="form-label" for="slider-tax">Working Marginal Tax Rate</label>
          <span class="form-val-display" id="disp-tax">${(state.workTaxRate * 100).toFixed(1)}%</span>
        </div>
        <div class="slider-container">
          <input type="range" id="slider-tax" min="20" max="54" step="0.5" value="${state.workTaxRate * 100}">
          <input type="number" id="num-tax" class="form-input-number" min="15" max="54" step="0.5" value="${state.workTaxRate * 100}">
        </div>
      </div>`
    }

    <!-- Growth & Return Assumptions -->
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-growth">Annual Pre-Tax Return</label>
        <span class="form-val-display" id="disp-growth">${(state.growthRatePreTax * 100).toFixed(1)}%</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-growth" min="3" max="12" step="0.5" value="${state.growthRatePreTax * 100}">
        <input type="number" id="num-growth" class="form-input-number" min="1" max="15" step="0.5" value="${state.growthRatePreTax * 100}">
      </div>
    </div>

    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-drag">Tax Drag (Personal Account)</label>
        <span class="form-val-display" id="disp-drag">${(state.taxDrag * 100).toFixed(1)}%</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-drag" min="0.5" max="3.0" step="0.1" value="${state.taxDrag * 100}">
        <input type="number" id="num-drag" class="form-input-number" min="0" max="5" step="0.1" value="${state.taxDrag * 100}">
      </div>
    </div>

    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-retgrowth">Retirement Return Rate</label>
        <span class="form-val-display" id="disp-retgrowth">${(state.retireGrowthRate * 100).toFixed(1)}%</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-retgrowth" min="2" max="8" step="0.5" value="${state.retireGrowthRate * 100}">
        <input type="number" id="num-retgrowth" class="form-input-number" min="1" max="10" step="0.5" value="${state.retireGrowthRate * 100}">
      </div>
    </div>
  `;
}

/**
 * Render Granular Savings Allocation Breakdown
 */
function renderSavingsAllocationSection(isCouple: boolean): string {
  const total = isCouple
    ? state.p1RrspSaving + state.p2RrspSaving + state.piSaving
    : state.p1RrspSaving + state.piSaving;
  const safeTotal = Math.max(1, total);

  const p1Pct = Math.round((state.p1RrspSaving / safeTotal) * 100);
  const p2Pct = isCouple ? Math.round((state.p2RrspSaving / safeTotal) * 100) : 0;
  const piPct = Math.max(0, 100 - p1Pct - p2Pct);

  const p1Refund = Math.round(state.p1RrspSaving * state.workTaxRate);
  const p2Refund = Math.round(state.p2RrspSaving * state.person2WorkTaxRate);
  const totalRefund = isCouple ? p1Refund + p2Refund : p1Refund;

  return `
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label">
          ${isCouple ? "Household Savings Allocation (RRSP vs PI)" : "Savings Allocation (RRSP vs PI)"}
        </label>
      </div>

      <!-- Live Multi-Segment Allocation Bar -->
      <div class="allocation-bar-wrapper">
        <div class="allocation-bar">
          <div id="alloc-seg-p1" class="alloc-segment p1" style="width: ${p1Pct}%;"></div>
          ${isCouple ? `<div id="alloc-seg-p2" class="alloc-segment p2" style="width: ${p2Pct}%;"></div>` : ""}
          <div id="alloc-seg-pi" class="alloc-segment pi" style="width: ${piPct}%;"></div>
        </div>
        <div class="alloc-labels-row">
          <span id="alloc-lbl-p1" style="color:var(--rrsp-color);">
            ${isCouple ? "P1 RRSP" : "RRSP"}: ${p1Pct}% (${formatCurrency(state.p1RrspSaving)})
          </span>
          ${
            isCouple
              ? `<span id="alloc-lbl-p2" style="color:#8b5cf6;">P2 RRSP: ${p2Pct}% (${formatCurrency(state.p2RrspSaving)})</span>`
              : ""
          }
          <span id="alloc-lbl-pi" style="color:var(--nonreg-color);">
            PI: ${piPct}% (${formatCurrency(state.piSaving)})
          </span>
        </div>
      </div>

      <!-- Quick Preset Strategy Buttons -->
      <div class="alloc-presets-grid">
        ${
          isCouple
            ? `
          <button type="button" id="preset-couple-equal" class="alloc-preset-btn">⚡ 50/50 Equal RRSPs</button>
          <button type="button" id="preset-couple-max" class="alloc-preset-btn">🚀 Max Both RRSPs ($32.5k x 2)</button>
          <button type="button" id="preset-couple-highearner" class="alloc-preset-btn">💼 High-Earner First (P1)</button>
          <button type="button" id="preset-couple-balanced" class="alloc-preset-btn">⚖️ 70% RRSP / 30% PI</button>
        `
            : `
          <button type="button" id="preset-single-max" class="alloc-preset-btn">🚀 Max RRSP ($32,490)</button>
          <button type="button" id="preset-single-balanced" class="alloc-preset-btn">⚖️ 70% RRSP / 30% PI</button>
          <button type="button" id="preset-single-half" class="alloc-preset-btn">🎯 50% RRSP / 50% PI</button>
          <button type="button" id="preset-single-all" class="alloc-preset-btn">💰 100% RRSP</button>
        `
        }
      </div>

      <!-- Account 1: Person 1 RRSP -->
      <div class="alloc-card p1">
        <div class="alloc-card-header">
          <span class="alloc-card-title">
            <span>👤</span> ${isCouple ? "Person 1 RRSP" : "RRSP Contribution"}
          </span>
          <span id="refund-badge-p1" class="alloc-refund-badge">
            +${formatCurrency(p1Refund)} tax refund
          </span>
        </div>
        <div class="form-label-row" style="margin-bottom:0.25rem;">
          <span style="font-size:0.75rem;color:var(--text-muted);">Max CRA Limit: $32,490/yr</span>
          <span id="disp-p1-rrsp" class="form-val-display">${formatCurrency(state.p1RrspSaving)}</span>
        </div>
        <div class="slider-container">
          <input type="range" id="slider-p1-rrsp" min="0" max="32490" step="500" value="${state.p1RrspSaving}">
          <input type="number" id="num-p1-rrsp" class="form-input-number" min="0" max="32490" step="500" value="${state.p1RrspSaving}">
        </div>
      </div>

      <!-- Account 2: Person 2 RRSP / Spousal (Couples Only) -->
      ${
        isCouple
          ? `
        <div class="alloc-card p2">
          <div class="alloc-card-header">
            <span class="alloc-card-title">
              <span>👤</span> Person 2 RRSP / Spousal
            </span>
            <span id="refund-badge-p2" class="alloc-refund-badge">
              +${formatCurrency(p2Refund)} tax refund
            </span>
          </div>
          <div class="form-label-row" style="margin-bottom:0.25rem;">
            <span style="font-size:0.75rem;color:var(--text-muted);">Max CRA Limit: $32,490/yr</span>
            <span id="disp-p2-rrsp" class="form-val-display">${formatCurrency(state.p2RrspSaving)}</span>
          </div>
          <div class="slider-container">
            <input type="range" id="slider-p2-rrsp" min="0" max="32490" step="500" value="${state.p2RrspSaving}">
            <input type="number" id="num-p2-rrsp" class="form-input-number" min="0" max="32490" step="500" value="${state.p2RrspSaving}">
          </div>
        </div>
        `
          : ""
      }

      <!-- Account 3: Personal Investment (PI) / Non-Registered -->
      <div class="alloc-card pi">
        <div class="alloc-card-header">
          <span class="alloc-card-title">
            <span>📈</span> ${isCouple ? "Household Personal Account (PI)" : "Personal Investment (PI)"}
          </span>
          <span style="font-size:0.72rem;color:var(--text-muted);">50% Capital Gains</span>
        </div>
        <div class="form-label-row" style="margin-bottom:0.25rem;">
          <span style="font-size:0.75rem;color:var(--text-muted);">Taxable Non-Registered</span>
          <span id="disp-pi" class="form-val-display">${formatCurrency(state.piSaving)}</span>
        </div>
        <div class="slider-container">
          <input type="range" id="slider-pi" min="0" max="100000" step="1000" value="${state.piSaving}">
          <input type="number" id="num-pi" class="form-input-number" min="0" max="250000" step="1000" value="${state.piSaving}">
        </div>
      </div>

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

function renderComparatorSidebarControls(): string {
  return `
    <div class="mode-selector">
      <span class="form-label">Comparison Baseline</span>
      <div class="mode-pills">
        <button id="mode-pretax" class="mode-pill ${state.comparatorMode === "preTax" ? "active" : ""}">
          Pre-Tax Earnings
        </button>
        <button id="mode-cashout" class="mode-pill ${state.comparatorMode === "cashOut" ? "active" : ""}">
          Cash Out-of-Pocket
        </button>
      </div>
      ${
        state.comparatorMode === "cashOut"
          ? `
        <label class="reinvest-checkbox-row">
          <input type="checkbox" id="check-reinvest" ${state.comparatorReinvest ? "checked" : ""}>
          <span>Gross-up & Reinvest RRSP Tax Refund</span>
        </label>`
          : ""
      }
    </div>
  `;
}

/**
 * Render Guaranteed Pensions & Other Income Card (Sidebar)
 */
function renderGuaranteedPensionsSection(isCouple: boolean): string {
  let estGross = 0;
  if (state.includeOtherIncome) {
    if (state.retireAge >= state.person1CppStartAge) {
      estGross += state.person1CppAnnual;
    }
    if (state.retireAge >= 65) {
      estGross += state.person1OasAnnual;
    }
    if (isCouple) {
      if (state.person2RetireAge >= state.person2CppStartAge) {
        estGross += state.person2CppAnnual;
      }
      if (state.person2RetireAge >= 65) {
        estGross += state.person2OasAnnual;
      }
    }
    if (state.retireAge >= state.employerPensionStartAge) {
      estGross += state.employerPensionAnnual;
    }
    estGross += state.otherTaxableIncome;
  }

  const estNet = Math.round(estGross * 0.85);
  const coveragePct = Math.min(100, Math.round((estNet / Math.max(1, state.retireNetSpending)) * 100));
  const portfolioShortfall = Math.max(0, state.retireNetSpending - estNet);

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
        <!-- Live Coverage Summary Banner -->
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

        <!-- Benchmark Presets Bar -->
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
          <!-- Person 1 CPP -->
          <div class="pension-field-group">
            <div class="pension-field-header">
              <span class="pension-field-title">👤 ${isCouple ? "Person 1 CPP" : "Canada Pension Plan (CPP)"}</span>
              <span class="pension-field-tag" id="disp-p1-cpp">${formatCurrency(state.person1CppAnnual)}/yr</span>
            </div>
            <div class="slider-container">
              <input type="range" id="slider-p1-cpp" min="0" max="22000" step="500" value="${state.person1CppAnnual}">
              <input type="number" id="num-p1-cpp" class="form-input-number" min="0" max="30000" step="500" value="${state.person1CppAnnual}">
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.2rem;font-size:0.73rem;">
              <span style="color:var(--text-muted);">Start Age:</span>
              <select id="select-p1-cpp-age" class="form-input-number" style="padding:0.15rem 0.4rem;font-size:0.75rem;">
                ${[60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70]
                  .map((a) => `<option value="${a}" ${state.person1CppStartAge === a ? "selected" : ""}>Age ${a} ${a === 65 ? "(Standard)" : a < 65 ? "(-" + ((65 - a) * 7.2).toFixed(0) + "%)" : "(+" + ((a - 65) * 8.4).toFixed(0) + "%)"}</option>`)
                  .join("")}
              </select>
            </div>
          </div>

          <!-- Person 1 OAS -->
          <div class="pension-field-group">
            <div class="pension-field-header">
              <span class="pension-field-title">🍁 ${isCouple ? "Person 1 OAS" : "Old Age Security (OAS)"}</span>
              <span class="pension-field-tag" id="disp-p1-oas">${formatCurrency(state.person1OasAnnual)}/yr</span>
            </div>
            <div class="slider-container">
              <input type="range" id="slider-p1-oas" min="0" max="12000" step="250" value="${state.person1OasAnnual}">
              <input type="number" id="num-p1-oas" class="form-input-number" min="0" max="15000" step="250" value="${state.person1OasAnnual}">
            </div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Starts at Age 65 ($8,560 2024-2026 CRA rate). Subject to clawback above $91k.</div>
          </div>

          ${
            isCouple
              ? `
            <!-- Person 2 CPP -->
            <div class="pension-field-group">
              <div class="pension-field-header">
                <span class="pension-field-title">👤 Person 2 CPP</span>
                <span class="pension-field-tag" id="disp-p2-cpp">${formatCurrency(state.person2CppAnnual)}/yr</span>
              </div>
              <div class="slider-container">
                <input type="range" id="slider-p2-cpp" min="0" max="22000" step="500" value="${state.person2CppAnnual}">
                <input type="number" id="num-p2-cpp" class="form-input-number" min="0" max="30000" step="500" value="${state.person2CppAnnual}">
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.2rem;font-size:0.73rem;">
                <span style="color:var(--text-muted);">Start Age:</span>
                <select id="select-p2-cpp-age" class="form-input-number" style="padding:0.15rem 0.4rem;font-size:0.75rem;">
                  ${[60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70]
                    .map((a) => `<option value="${a}" ${state.person2CppStartAge === a ? "selected" : ""}>Age ${a} ${a === 65 ? "(Standard)" : a < 65 ? "(-" + ((65 - a) * 7.2).toFixed(0) + "%)" : "(+" + ((a - 65) * 8.4).toFixed(0) + "%)"}</option>`)
                    .join("")}
                </select>
              </div>
            </div>

            <!-- Person 2 OAS -->
            <div class="pension-field-group">
              <div class="pension-field-header">
                <span class="pension-field-title">🍁 Person 2 OAS</span>
                <span class="pension-field-tag" id="disp-p2-oas">${formatCurrency(state.person2OasAnnual)}/yr</span>
              </div>
              <div class="slider-container">
                <input type="range" id="slider-p2-oas" min="0" max="12000" step="250" value="${state.person2OasAnnual}">
                <input type="number" id="num-p2-oas" class="form-input-number" min="0" max="15000" step="250" value="${state.person2OasAnnual}">
              </div>
            </div>
            `
              : ""
          }

          <!-- Employer DB Pension / Lifetime Annuity -->
          <div class="pension-field-group">
            <div class="pension-field-header">
              <span class="pension-field-title">🏢 Employer Defined Benefit (DB) Pension</span>
              <span class="pension-field-tag" id="disp-db-pension">${formatCurrency(state.employerPensionAnnual)}/yr</span>
            </div>
            <div class="slider-container">
              <input type="range" id="slider-db-pension" min="0" max="80000" step="2500" value="${state.employerPensionAnnual}">
              <input type="number" id="num-db-pension" class="form-input-number" min="0" max="150000" step="2500" value="${state.employerPensionAnnual}">
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.2rem;font-size:0.73rem;">
              <span style="color:var(--text-muted);">Pension Starts At:</span>
              <select id="select-db-pension-age" class="form-input-number" style="padding:0.15rem 0.4rem;font-size:0.75rem;">
                ${[55, 58, 60, 62, 65, 67, 70]
                  .map((a) => `<option value="${a}" ${state.employerPensionStartAge === a ? "selected" : ""}>Age ${a}</option>`)
                  .join("")}
              </select>
            </div>
          </div>

          <!-- Other Taxable Income (Rental, Business, etc.) -->
          <div class="pension-field-group">
            <div class="pension-field-header">
              <span class="pension-field-title">🏠 Rental or Other Taxable Income</span>
              <span class="pension-field-tag" id="disp-other-inc">${formatCurrency(state.otherTaxableIncome)}/yr</span>
            </div>
            <div class="slider-container">
              <input type="range" id="slider-other-inc" min="0" max="60000" step="2000" value="${state.otherTaxableIncome}">
              <input type="number" id="num-other-inc" class="form-input-number" min="0" max="150000" step="2000" value="${state.otherTaxableIncome}">
            </div>
          </div>
        </div>
        `
          : ""
      }
    </div>
  `;
}

function updatePensionCoverageLive(): void {
  let estGross = 0;
  if (state.includeOtherIncome) {
    if (state.retireAge >= state.person1CppStartAge) estGross += state.person1CppAnnual;
    if (state.retireAge >= 65) estGross += state.person1OasAnnual;
    if (state.householdMode === "couple") {
      if (state.person2RetireAge >= state.person2CppStartAge) estGross += state.person2CppAnnual;
      if (state.person2RetireAge >= 65) estGross += state.person2OasAnnual;
    }
    if (state.retireAge >= state.employerPensionStartAge) estGross += state.employerPensionAnnual;
    estGross += state.otherTaxableIncome;
  }
  const estNet = Math.round(estGross * 0.85);
  const coveragePct = Math.min(100, Math.round((estNet / Math.max(1, state.retireNetSpending)) * 100));
  const portfolioShortfall = Math.max(0, state.retireNetSpending - estNet);

  const banner = document.getElementById("pension-coverage-banner");
  if (banner) {
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
}

/**
 * Updates ONLY the results panel (#results-container) without touching the controls sidebar DOM.
 * This guarantees slider dragging maintains pointer capture smoothly.
 */
function updateResultsOnly(): void {
  const isCouple = state.householdMode === "couple";
  const resultsContainer = document.getElementById("results-container");
  if (!resultsContainer) return;

  if (state.viewMode === "simulator") {
    const strategyParams = getStrategyParams();
    const currentStratResult = simulatePortfolioStrategy({
      ...strategyParams,
      decumStrategy: state.decumStrategy,
    });
    const allStratComparisons = compareAllStrategies(strategyParams);

    resultsContainer.innerHTML = renderSimulatorResults(
      currentStratResult,
      allStratComparisons,
      isCouple
    );

    attachResultListeners(currentStratResult, isCouple);
    setupSimulatorChartHover(currentStratResult, isCouple);
  } else {
    const comparatorSim = runSimulation({
      householdMode: state.householdMode,
      annualSaving: state.annualSaving,
      mode: state.comparatorMode,
      reinvestRefund: state.comparatorReinvest,
      yearsAccumulation: state.yearsAccumulation,
      retireAge: state.retireAge,
      person2RetireAge: state.person2RetireAge,
      retireNetSpending: state.retireNetSpending,
      workTaxRate: state.workTaxRate,
      person2WorkTaxRate: state.person2WorkTaxRate,
      growthRatePreTax: state.growthRatePreTax,
      taxDrag: state.taxDrag,
      retireGrowthRate: state.retireGrowthRate,
      enableIncomeSplitting: state.enableIncomeSplitting,
    });

    resultsContainer.innerHTML = renderComparatorResults(comparatorSim, isCouple);
  }
}

/**
 * Updates visual allocation bar, percentages, and tax refund badges in the sidebar
 */
function updateAllocationVisuals(): void {
  const isCouple = state.householdMode === "couple";
  const total = isCouple
    ? state.p1RrspSaving + state.p2RrspSaving + state.piSaving
    : state.p1RrspSaving + state.piSaving;
  const safeTotal = Math.max(1, total);

  const p1Pct = Math.round((state.p1RrspSaving / safeTotal) * 100);
  const p2Pct = isCouple ? Math.round((state.p2RrspSaving / safeTotal) * 100) : 0;
  const piPct = Math.max(0, 100 - p1Pct - p2Pct);

  const segP1 = document.getElementById("alloc-seg-p1");
  const segP2 = document.getElementById("alloc-seg-p2");
  const segPi = document.getElementById("alloc-seg-pi");

  if (segP1) segP1.style.width = `${p1Pct}%`;
  if (segP2) segP2.style.width = `${p2Pct}%`;
  if (segPi) segPi.style.width = `${piPct}%`;

  const lblP1 = document.getElementById("alloc-lbl-p1");
  const lblP2 = document.getElementById("alloc-lbl-p2");
  const lblPi = document.getElementById("alloc-lbl-pi");

  if (lblP1) {
    lblP1.textContent = isCouple
      ? `P1 RRSP: ${p1Pct}% (${formatCurrency(state.p1RrspSaving)})`
      : `RRSP: ${p1Pct}% (${formatCurrency(state.p1RrspSaving)})`;
  }
  if (lblP2 && isCouple) {
    lblP2.textContent = `P2 RRSP: ${p2Pct}% (${formatCurrency(state.p2RrspSaving)})`;
  }
  if (lblPi) {
    lblPi.textContent = `PI: ${piPct}% (${formatCurrency(state.piSaving)})`;
  }

  // Refund badges
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

/**
 * Sync all savings inputs to match state values
 */
function syncAllSavingInputs(): void {
  const isCouple = state.householdMode === "couple";
  const total = isCouple
    ? state.p1RrspSaving + state.p2RrspSaving + state.piSaving
    : state.p1RrspSaving + state.piSaving;
  state.annualSaving = total;

  const sliderSaving = document.getElementById("slider-saving") as HTMLInputElement | null;
  const numSaving = document.getElementById("num-saving") as HTMLInputElement | null;
  const dispSaving = document.getElementById("disp-saving");

  if (sliderSaving) sliderSaving.value = total.toString();
  if (numSaving) numSaving.value = total.toString();
  if (dispSaving) dispSaving.textContent = formatCurrency(total);

  const sliderP1 = document.getElementById("slider-p1-rrsp") as HTMLInputElement | null;
  const numP1 = document.getElementById("num-p1-rrsp") as HTMLInputElement | null;
  const dispP1 = document.getElementById("disp-p1-rrsp");
  if (sliderP1) sliderP1.value = state.p1RrspSaving.toString();
  if (numP1) numP1.value = state.p1RrspSaving.toString();
  if (dispP1) dispP1.textContent = formatCurrency(state.p1RrspSaving);

  if (isCouple) {
    const sliderP2 = document.getElementById("slider-p2-rrsp") as HTMLInputElement | null;
    const numP2 = document.getElementById("num-p2-rrsp") as HTMLInputElement | null;
    const dispP2 = document.getElementById("disp-p2-rrsp");
    if (sliderP2) sliderP2.value = state.p2RrspSaving.toString();
    if (numP2) numP2.value = state.p2RrspSaving.toString();
    if (dispP2) dispP2.textContent = formatCurrency(state.p2RrspSaving);
  }

  const sliderPi = document.getElementById("slider-pi") as HTMLInputElement | null;
  const numPi = document.getElementById("num-pi") as HTMLInputElement | null;
  const dispPi = document.getElementById("disp-pi");
  if (sliderPi) sliderPi.value = state.piSaving.toString();
  if (numPi) numPi.value = state.piSaving.toString();
  if (dispPi) dispPi.textContent = formatCurrency(state.piSaving);

  updateAllocationVisuals();
}

/**
 * Renders the interactive income breakdown bar, itemized stack, and draw cards for a given age
 */
function renderBlueprintDynamicDetails(
  record: StrategyYearRecord,
  selectedAge: number,
  isCouple: boolean
): string {
  const cpp = record.cppIncome || 0;
  const oas = record.oasIncome || 0;
  const dbAndOther = (record.dbPensionIncome || 0) + (record.otherIncome || 0);
  const rrsp = record.rrspGrossDraw || 0;
  const pi = record.piGrossDraw || 0;
  const tfsa = record.tfsaGrossDraw || 0;
  const totalGross = cpp + oas + dbAndOther + rrsp + pi + tfsa;
  const safeGross = Math.max(1, totalGross);

  const cppPct = Math.round((cpp / safeGross) * 100);
  const oasPct = Math.round((oas / safeGross) * 100);
  const dbPct = Math.round((dbAndOther / safeGross) * 100);
  const rrspPct = Math.round((rrsp / safeGross) * 100);
  const piPct = Math.round((pi / safeGross) * 100);
  const tfsaPct = Math.max(0, 100 - cppPct - oasPct - dbPct - rrspPct - piPct);

  return `
    <!-- Multi-Segment Visual Income Breakdown Bar -->
    <div class="income-breakdown-bar-wrapper">
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:600;color:var(--text-secondary);margin-bottom:0.25rem;">
        <span>Gross Income Composition (Total: ${formatCurrency(totalGross)})</span>
        <span style="color:#10b981;">Net Received: ${formatCurrency(record.netSpendReceived)} (Tax: ${formatCurrency(record.totalTax)})</span>
      </div>
      <div class="income-breakdown-bar">
        ${cpp > 0 ? `<div class="income-bar-seg cpp" style="width:${cppPct}%;" title="CPP: ${formatCurrency(cpp)} (${cppPct}%)"></div>` : ""}
        ${oas > 0 ? `<div class="income-bar-seg oas" style="width:${oasPct}%;" title="OAS: ${formatCurrency(oas)} (${oasPct}%)"></div>` : ""}
        ${dbAndOther > 0 ? `<div class="income-bar-seg db" style="width:${dbPct}%;" title="DB Pension/Other: ${formatCurrency(dbAndOther)} (${dbPct}%)"></div>` : ""}
        ${rrsp > 0 ? `<div class="income-bar-seg rrsp" style="width:${rrspPct}%;" title="RRSP/RRIF: ${formatCurrency(rrsp)} (${rrspPct}%)"></div>` : ""}
        ${pi > 0 ? `<div class="income-bar-seg pi" style="width:${piPct}%;" title="Personal (PI): ${formatCurrency(pi)} (${piPct}%)"></div>` : ""}
        ${tfsa > 0 ? `<div class="income-bar-seg tfsa" style="width:${tfsaPct}%;" title="TFSA: ${formatCurrency(tfsa)} (${tfsaPct}%)"></div>` : ""}
      </div>
      <div class="income-legend-row">
        ${cpp > 0 ? `<div class="income-legend-item"><span class="income-legend-dot cpp"></span> CPP: ${formatCurrency(cpp)} (${cppPct}%)</div>` : ""}
        ${oas > 0 ? `<div class="income-legend-item"><span class="income-legend-dot oas"></span> OAS: ${formatCurrency(oas)} (${oasPct}%)</div>` : ""}
        ${dbAndOther > 0 ? `<div class="income-legend-item"><span class="income-legend-dot db"></span> DB/Other: ${formatCurrency(dbAndOther)} (${dbPct}%)</div>` : ""}
        ${rrsp > 0 ? `<div class="income-legend-item"><span class="income-legend-dot rrsp"></span> RRSP: ${formatCurrency(rrsp)} (${rrspPct}%)</div>` : ""}
        ${pi > 0 ? `<div class="income-legend-item"><span class="income-legend-dot pi"></span> PI: ${formatCurrency(pi)} (${piPct}%)</div>` : ""}
        ${tfsa > 0 ? `<div class="income-legend-item"><span class="income-legend-dot tfsa"></span> TFSA: ${formatCurrency(tfsa)} (${tfsaPct}%)"></div>` : ""}
      </div>
    </div>

    ${
      record.guaranteedGross > 0
        ? `
      <div class="income-stack-container">
        <div class="income-stack-title">
          <span>🏛️</span> Full Retirement Income Stack at Age ${selectedAge}
        </div>
        <div class="income-stack-rows">
          <div class="income-stack-row">
            <span>1. Guaranteed Pensions & Other Sources (Gross):</span>
            <span style="font-weight:700;color:#60a5fa;">+${formatCurrency(record.guaranteedGross)}/yr</span>
          </div>
          <div class="income-stack-row">
            <span style="color:var(--text-muted);padding-left:1rem;">↳ CPP: ${formatCurrency(cpp)} · OAS: ${formatCurrency(oas)}${dbAndOther > 0 ? ` · Pension/Other: ${formatCurrency(dbAndOther)}` : ""}</span>
            <span style="color:#93c5fd;font-weight:600;">Net: +${formatCurrency(record.guaranteedNet)}/yr</span>
          </div>
          <div class="income-stack-row">
            <span>2. Investment Portfolio Net Draw Needed:</span>
            <span style="font-weight:700;color:#34d399;">+${formatCurrency(record.portfolioNetDraw)}/yr</span>
          </div>
          <div class="income-stack-row total">
            <span>Total Net Spending Cash Delivered:</span>
            <span>${formatCurrency(record.netSpendReceived)}/yr net (Goal: ${formatCurrency(state.retireNetSpending)})</span>
          </div>
        </div>
      </div>
      `
        : `
      <div class="pension-cta-callout">
        <div class="pension-cta-info">
          <span style="font-size:1.15rem;">🛡️</span>
          <span><strong>Have a Pension, CPP, or OAS?</strong> Add them to factor in guaranteed lifetime income and reduce required investment portfolio draw.</span>
        </div>
        <button type="button" class="btn-enable-pensions-inline" id="btn-enable-pensions-inline">
          + Add Pensions & Income
        </button>
      </div>
      `
    }

    <div class="blueprint-grid">
      <div class="blueprint-col rrsp">
        <div class="blueprint-col-title" style="color:var(--rrsp-color);">
          <span>🟣</span> ${isCouple ? "Joint RRSP / RRIF" : "RRSP / RRIF"}
        </div>
        <div class="blueprint-amount">${formatCurrency(record.rrspGrossDraw)}</div>
        <div class="blueprint-note">${record.isRRIFForced ? "Mandatory RRIF Min Active" : record.rrspGrossDraw > 0 ? "Taxable graduated bracket draw" : "$0 needed (deferred)"}</div>
      </div>
      <div class="blueprint-col pi">
        <div class="blueprint-col-title" style="color:var(--nonreg-color);">
          <span>🟠</span> Personal Account (PI)
        </div>
        <div class="blueprint-amount">${formatCurrency(record.piGrossDraw)}</div>
        <div class="blueprint-note">${record.piGrossDraw > 0 ? "50% capital gains inclusion" : "$0 needed this year"}</div>
      </div>
      <div class="blueprint-col tfsa">
        <div class="blueprint-col-title" style="color:var(--tfsa-color);">
          <span>🟢</span> ${isCouple ? "Dual TFSAs" : "TFSA"}
        </div>
        <div class="blueprint-amount">${formatCurrency(record.tfsaGrossDraw)}</div>
        <div class="blueprint-note">${record.tfsaGrossDraw > 0 ? "100% tax-free buffer" : "Kept compounding tax-free"}</div>
      </div>
      <div class="blueprint-col net">
        <div class="blueprint-col-title" style="color:#10b981;">
          <span>💰</span> Net Cash Received
        </div>
        <div class="blueprint-amount" style="color:#10b981;">${formatCurrency(record.netSpendReceived)}</div>
        <div class="blueprint-note">${record.guaranteedGross > 0 ? `${formatCurrency(record.guaranteedNet)} pensions + ${formatCurrency(record.portfolioNetDraw)} portfolio` : `After paying ${formatCurrency(record.totalTax)} in tax`}</div>
      </div>
    </div>
  `;
}

/**
 * Render Simulator Results Section
 */
function renderSimulatorResults(
  currentStrat: StrategyResult,
  allStrats: StrategyResult[],
  isCouple: boolean
): string {
  const currentAge1 = Math.max(18, state.retireAge - state.yearsAccumulation);
  const currentAge2 = Math.max(18, state.person2RetireAge - state.yearsAccumulation);

  const bestStrat = [...allStrats].sort(
    (a, b) =>
      b.longevityYears - a.longevityYears ||
      a.totalLifetimeRetirementTax - b.totalLifetimeRetirementTax
  )[0];

  const p1Rrsp = currentStrat.person1RrspSaving ?? state.p1RrspSaving;
  const p2Rrsp = isCouple ? currentStrat.person2RrspSaving ?? state.p2RrspSaving : 0;
  const piDollars = currentStrat.piSaving ?? state.piSaving;
  const refundDollars = currentStrat.annualTaxRefund ?? Math.round(p1Rrsp * state.workTaxRate + p2Rrsp * state.person2WorkTaxRate);

  return `
    <!-- Couples Tax Advantage Banner -->
    ${
      isCouple && (currentStrat.couplesAnnualTaxSavings ?? 0) > 0
        ? `
      <div class="couple-tax-banner">
        <div class="couple-tax-text">
          <h4>🎉 The Couples Pension Splitting Advantage</h4>
          <p>By splitting income 50/50 between two spouses at age 65+, you utilize two sets of basic personal tax credits and keep income in the lowest tax brackets.</p>
        </div>
        <div class="couple-tax-val">
          +${formatCurrency(currentStrat.couplesAnnualTaxSavings ?? 0)}/yr
          <div style="font-size:0.75rem;font-weight:500;color:#6ee7b7;">Estimated Annual Tax Savings</div>
        </div>
      </div>`
        : ""
    }

    <!-- Tailored Action Plan / Advisor -->
    <article class="advisor-card">
      <div class="advisor-title">
        <span>💡</span> ${isCouple ? "Your Custom 2-Person Household Action Plan" : "Your Custom Tailored Strategy Action Plan"}
      </div>
      <div class="advisor-steps">
        <div class="advisor-step">
          <div class="step-num">1</div>
          <div class="step-content">
            ${
              isCouple
                ? `<strong>Working Years (Ages ${currentAge1} & ${currentAge2}):</strong> Save <strong>${formatCurrency(state.annualSaving)}/year combined</strong>. Contribute <strong>${formatCurrency(p1Rrsp)}</strong> to Person 1 RRSP, <strong>${formatCurrency(p2Rrsp)}</strong> to Person 2 RRSP (or Spousal RRSP), and <strong>${formatCurrency(piDollars)}</strong> to your Personal Account. Reinvest your <strong>${formatCurrency(refundDollars)} refund into ${state.reinvestRefundTo === "tfsa" ? "both TFSAs ($7k each)" : state.reinvestRefundTo === "pi" ? "Personal Account" : "spending"}</strong>.`
                : `<strong>While Working (Next ${state.yearsAccumulation} Years):</strong> Contribute <strong>${formatCurrency(p1Rrsp)}/year to your RRSP</strong> and <strong>${formatCurrency(piDollars)}/year to your Personal Account (PI)</strong>. Reinvest your annual <strong>${formatCurrency(refundDollars)} tax refund</strong> into <strong>${state.reinvestRefundTo === "tfsa" ? "TFSA" : state.reinvestRefundTo === "pi" ? "Personal Account" : "spending"}</strong>.`
            }
          </div>
        </div>
        <div class="advisor-step">
          <div class="step-num">2</div>
          <div class="step-content">
            ${
              isCouple
                ? `<strong>At Retirement (Ages ${state.retireAge} & ${state.person2RetireAge}):</strong> Use the <strong>"${currentStrat.name}"</strong> sequence. At age 65, file <strong>CRA Form T1032</strong> to split up to 50% of RRIF withdrawals. This gives your household <strong>$182,000 of combined room</strong> before triggering any OAS clawback.`
                : `<strong>At Retirement (Age ${state.retireAge} to 71):</strong> Follow the <strong>"${currentStrat.name}"</strong> decumulation rule. Draw from RRSP up to the bracket cap while bridging with your Personal Account and TFSA.`
            }
          </div>
        </div>
        <div class="advisor-step">
          <div class="step-num">3</div>
          <div class="step-content">
            ${
              isCouple
                ? `<strong>At Age 71+:</strong> Convert RRSPs to RRIFs. <em>CRA Pro-Tip:</em> Base your mandatory RRIF minimum withdrawals on the <strong>younger spouse (Age ${Math.min(state.retireAge, state.person2RetireAge)})</strong> to legally minimize forced taxable withdrawals!`
                : `<strong>At Age 71+:</strong> Convert RRSP to a RRIF. Withdraw CRA mandated minimums and use your TFSA/PI as a tax-free buffer to avoid crossing into higher tax brackets and losing your OAS pension.`
            }
          </div>
        </div>
      </div>
    </article>

    <!-- Strategy Selector Cards (Withdrawal Sequencing) -->
    <section>
      <h3 style="font-family:var(--font-display);font-size:1.15rem;margin-bottom:0.6rem;color:var(--text-primary);">
        Choose Your Decumulation Sequencing Strategy:
      </h3>
      <div class="strat-cards-grid">
        <div class="strat-card ${state.decumStrategy === "oasShield" ? "active" : ""}" data-strat="oasShield">
          <div class="strat-card-title">🛡️ ${isCouple ? "Dual OAS Shield" : "OAS Shield & Smoothing"} ${bestStrat.id === "oasShield" ? '<span class="badge-recommended">Optimal</span>' : ""}</div>
          <p class="strat-card-desc">${isCouple ? "Splits income 50/50 and shields up to $182k combined from OAS clawback." : "Caps RRSP draw below the ~$91k clawback line; bridges shortfall from PI/TFSA."}</p>
        </div>
        <div class="strat-card ${state.decumStrategy === "rrspMeltdown" ? "active" : ""}" data-strat="rrspMeltdown">
          <div class="strat-card-title">🔥 Early RRSP Meltdown ${bestStrat.id === "rrspMeltdown" ? '<span class="badge-recommended">Optimal</span>' : ""}</div>
          <p class="strat-card-desc">Burns down RRSP aggressively between retirement and 71 to crush the future RRIF tax bomb.</p>
        </div>
        <div class="strat-card ${state.decumStrategy === "taxableFirst" ? "active" : ""}" data-strat="taxableFirst">
          <div class="strat-card-title">⏳ Taxable (PI) First ${bestStrat.id === "taxableFirst" ? '<span class="badge-recommended">Optimal</span>' : ""}</div>
          <p class="strat-card-desc">Spends taxable personal investment first, allowing tax-sheltered accounts to compound.</p>
        </div>
        <div class="strat-card ${state.decumStrategy === "proRata" ? "active" : ""}" data-strat="proRata">
          <div class="strat-card-title">⚖️ Proportional Balanced Draw ${bestStrat.id === "proRata" ? '<span class="badge-recommended">Optimal</span>' : ""}</div>
          <p class="strat-card-desc">Draws simultaneously from RRSP, PI, and TFSA in proportion to current account weights.</p>
        </div>
      </div>
    </section>

    <!-- Annual Withdrawal Blueprint Card -->
    ${(() => {
      const retireHistory = currentStrat.history.filter((d) => d.age >= state.retireAge);
      const minAge = state.retireAge;
      const maxAge = retireHistory.length > 0 ? retireHistory[retireHistory.length - 1].age : state.retireAge;

      let selectedAge = state.blueprintSelectedAge ?? state.retireAge;
      if (selectedAge < minAge) selectedAge = minAge;
      if (selectedAge > maxAge) selectedAge = maxAge;
      state.blueprintSelectedAge = selectedAge;

      const record = retireHistory.find((d) => d.age === selectedAge) || retireHistory[0] || currentStrat.history[0];
      const yearInRetire = selectedAge - state.retireAge + 1;

      return `
      <article class="withdrawal-blueprint-card">
        <div class="blueprint-header">
          <div class="blueprint-title">
            <span>🎯</span> Retirement Income & Withdrawal Blueprint (${currentStrat.name})
          </div>
          <span class="badge-recommended">Target Spend: ${formatCurrency(state.retireNetSpending)}/yr Net</span>
        </div>

        <!-- Interactive Age Explorer -->
        <div class="blueprint-age-explorer">
          <div class="blueprint-age-label-row">
            <span class="blueprint-age-title">📅 Inspect Cashflow Mix at Age:</span>
            <span class="blueprint-age-display" id="disp-blueprint-age">
              Age ${selectedAge} (Year ${yearInRetire} of Retirement)${isCouple && record.person2Age ? ` · Spouse Age ${record.person2Age}` : ""}
            </span>
          </div>
          <div class="blueprint-age-controls">
            <input type="range" id="slider-blueprint-age" min="${minAge}" max="${maxAge}" step="1" value="${selectedAge}">
            <div class="blueprint-age-chips">
              <button type="button" class="age-chip ${selectedAge === minAge ? "active" : ""}" data-age="${minAge}">
                Age ${minAge} (Retire Start)
              </button>
              ${maxAge >= 71 ? `<button type="button" class="age-chip ${selectedAge === 71 ? "active" : ""}" data-age="71">Age 71 (RRIF Min Rule)</button>` : ""}
              ${maxAge >= 75 ? `<button type="button" class="age-chip ${selectedAge === 75 ? "active" : ""}" data-age="75">Age 75 (OAS +10% Boost)</button>` : ""}
              ${maxAge >= 85 ? `<button type="button" class="age-chip ${selectedAge === 85 ? "active" : ""}" data-age="85">Age 85 (Late Life)</button>` : ""}
            </div>
          </div>
        </div>

        <!-- Dynamic Details Container (updates during slider scrubbing) -->
        <div id="blueprint-dynamic-details">
          ${renderBlueprintDynamicDetails(record, selectedAge, isCouple)}
        </div>

        <div class="blueprint-explanation">
          ${getStrategyWithdrawalExplanation(state.decumStrategy, isCouple)}
        </div>
      </article>
      `;
    })()}

    <!-- Strategy Scorecard Table -->
    <article class="scorecard-card">
      <h3 style="font-family:var(--font-display);font-size:1.15rem;margin-bottom:0.85rem;color:var(--text-primary);">
        📊 Strategy Comparison Scorecard ${isCouple ? "(Household Combined)" : ""}
      </h3>
      <div class="table-responsive" style="margin-top:0;">
        <table class="ledger-table">
          <thead>
            <tr>
              <th class="td-left">Strategy</th>
              <th>Retirement Longevity</th>
              <th>Depletion Age</th>
              <th>Lifetime Taxes Paid</th>
              <th>OAS Clawback</th>
              <th>Estate @ 85</th>
            </tr>
          </thead>
          <tbody>
            ${allStrats
              .map((s) => {
                const isSelected = s.id === state.decumStrategy;
                const isRec = s.id === bestStrat.id;
                return `
                <tr style="${isSelected ? "background:rgba(99,102,241,0.1);" : ""}">
                  <td class="td-left" style="font-weight:700;">
                    ${s.name} ${isRec ? '<span class="badge-recommended">Top Pick</span>' : ""}
                  </td>
                  <td style="color:#10b981;font-weight:700;">${s.isPerpetual ? "50+ Yrs" : `${s.longevityYears} Yrs`}</td>
                  <td>${s.isPerpetual ? "Age 100+" : `Age ${s.depletionAge}`}</td>
                  <td style="color:${s.totalLifetimeRetirementTax === Math.min(...allStrats.map((x) => x.totalLifetimeRetirementTax)) ? "#10b981" : "var(--text-primary)"};">
                    ${formatCurrency(s.totalLifetimeRetirementTax)}
                  </td>
                  <td style="color:${s.totalOASClawbackPaid === 0 ? "#10b981" : "#f59e0b"};">
                    ${formatCurrency(s.totalOASClawbackPaid)}
                  </td>
                  <td>${formatCurrency(s.estateValueAtAge85)}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </article>

    <!-- Visual Lifespan Chart -->
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <h3 style="font-family:var(--font-display);font-size:1.15rem;color:var(--text-primary);margin-bottom:0.2rem;">
            ${
              state.chartViewMode === "incomeStreams"
                ? `Annual Retirement Income & Cashflow Breakdown (Ages ${state.retireAge} to 95+)`
                : `Multi-Account Balance Lifespan Curve (Ages ${currentAge1} to 95+)`
            }
          </h3>
          <span style="font-size:0.75rem;color:var(--text-muted);">
            ${
              state.chartViewMode === "incomeStreams"
                ? "Stacked annual cashflow received from pensions, investments, and government programs"
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
          <div class="legend-item"><span class="income-legend-dot tfsa"></span> TFSA Draw</div>
          <div class="legend-item"><span style="width:12px;height:2px;background:#10b981;display:inline-block;border-top:1px dashed #10b981;"></span> Target Net Spend</div>
          `
            : `
          <div class="legend-item"><span class="legend-dot total"></span> <strong>Total Wealth</strong></div>
          <div class="legend-item"><span class="legend-dot rrsp"></span> ${isCouple ? "Joint RRSP/RRIF" : "RRSP/RRIF"}</div>
          <div class="legend-item"><span class="legend-dot nonreg"></span> Personal (PI)</div>
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

    <!-- Simulator Year-by-Year Ledger -->
    <div class="ledger-card">
      <div class="ledger-toggle-row" id="ledger-toggle" role="button" tabindex="0">
        <h2 class="panel-title" style="margin-bottom: 0;">
          📊 Year-by-Year Multi-Account Cash Flow ${isCouple ? "(2-Person Breakdown)" : ""}
          <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">
            ${state.ledgerOpen ? "▲ Click to collapse" : "▼ Click to view detailed ledger"}
          </span>
        </h2>
      </div>
      ${state.ledgerOpen ? renderSimulatorLedger(currentStrat, isCouple) : ""}
    </div>
  `;
}

/**
 * Render Comparator Results (Direct Account Comparison)
 */
function renderComparatorResults(sim: FullSimulationComparison, isCouple: boolean): string {
  return `
    ${
      isCouple && (sim.rrsp.couplesTaxAdvantageAnnual ?? 0) > 0
        ? `
      <div class="couple-tax-banner">
        <div class="couple-tax-text">
          <h4>🎉 Couples Income Splitting Advantage</h4>
          <p>By splitting income 50/50 between two spouses at age 65+, your RRSP gross withdrawal drops from ~$103,000 to ~$92,000 to yield $80,000 net!</p>
        </div>
        <div class="couple-tax-val">
          +${formatCurrency(sim.rrsp.couplesTaxAdvantageAnnual ?? 0)}/yr
          <div style="font-size:0.75rem;font-weight:500;color:#6ee7b7;">Annual Tax Saved</div>
        </div>
      </div>`
        : ""
    }

    <div class="comparison-grid">
      <!-- RRSP Card -->
      <article class="card card-rrsp">
        <div class="card-header">
          <span class="card-badge">${isCouple ? "Couple's Joint RRSP" : "Tax-Deferred · RRIF at 71"}</span>
          <span class="card-title">${sim.rrsp.accountName}</span>
        </div>
        <div class="hero-metric">
          <div class="hero-metric-label">Retirement Longevity</div>
          <div class="hero-metric-val">
            ${sim.rrsp.isPerpetual ? "50+ Yrs" : `${sim.rrsp.longevityYears} Yrs`}
          </div>
          <div class="hero-metric-sub">
            Funds household until Age ${state.retireAge + Math.floor(sim.rrsp.longevityYears)}
          </div>
        </div>
        <div class="metric-rows">
          <div class="metric-row">
            <span class="metric-label">Terminal Balance:</span>
            <span class="metric-val">${formatCurrency(sim.rrsp.terminalBalance)}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Gross Draw Needed:</span>
            <span class="metric-val">${formatCurrency(sim.rrsp.annualGrossWithdrawalNeeded)}/yr</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Household Tax Paid:</span>
            <span class="metric-val">${formatCurrency(sim.rrsp.annualRetirementTaxPaid)}/yr</span>
          </div>
        </div>
      </article>

      <!-- Personal (Non-Registered) Card -->
      <article class="card card-nonreg">
        <div class="card-header">
          <span class="card-badge">Taxable Account</span>
          <span class="card-title">${sim.nonReg.accountName}</span>
        </div>
        <div class="hero-metric">
          <div class="hero-metric-label">Retirement Longevity</div>
          <div class="hero-metric-val">
            ${sim.nonReg.isPerpetual ? "50+ Yrs" : `${sim.nonReg.longevityYears} Yrs`}
          </div>
          <div class="hero-metric-sub">
            Depleted at Age ${state.retireAge + Math.floor(sim.nonReg.longevityYears)}
          </div>
        </div>
        <div class="metric-rows">
          <div class="metric-row">
            <span class="metric-label">Terminal Balance:</span>
            <span class="metric-val">${formatCurrency(sim.nonReg.terminalBalance)}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Gross Draw Needed:</span>
            <span class="metric-val">${formatCurrency(sim.nonReg.annualGrossWithdrawalNeeded)}/yr</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Household Tax Paid:</span>
            <span class="metric-val">${formatCurrency(sim.nonReg.annualRetirementTaxPaid)}/yr</span>
          </div>
        </div>
      </article>

      <!-- TFSA Card -->
      <article class="card card-tfsa">
        <div class="card-header">
          <span class="card-badge">Tax-Free Benchmark</span>
          <span class="card-title">${sim.tfsa.accountName}</span>
        </div>
        <div class="hero-metric">
          <div class="hero-metric-label">Retirement Longevity</div>
          <div class="hero-metric-val">
            ${sim.tfsa.isPerpetual ? "50+ Yrs" : `${sim.tfsa.longevityYears} Yrs`}
          </div>
          <div class="hero-metric-sub">
            Funds household until Age ${state.retireAge + Math.floor(sim.tfsa.longevityYears)}
          </div>
        </div>
        <div class="metric-rows">
          <div class="metric-row">
            <span class="metric-label">Terminal Balance:</span>
            <span class="metric-val">${formatCurrency(sim.tfsa.terminalBalance)}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Gross Draw Needed:</span>
            <span class="metric-val">${formatCurrency(sim.tfsa.annualGrossWithdrawalNeeded)}/yr</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Household Tax Paid:</span>
            <span class="metric-val">$0/yr</span>
          </div>
        </div>
      </article>
    </div>
  `;
}

/**
 * Render Svg Chart for Simulator (Lifespan Curve)
 */
function renderSimulatorSvgChart(strat: StrategyResult): string {
  const data = strat.history;
  const maxLen = data.length;
  if (maxLen === 0) return `<p style="padding:2rem;text-align:center;">No data available</p>`;

  let maxVal = 0;
  for (const d of data) {
    maxVal = Math.max(maxVal, d.totalEnd, d.rrspEnd, d.piEnd, d.tfsaEnd);
  }
  maxVal = Math.max(maxVal, 10000) * 1.1;

  const width = 800;
  const height = 300;
  const padLeft = 70;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (idx: number) => padLeft + (idx / Math.max(1, maxLen - 1)) * plotW;
  const getY = (val: number) => padTop + plotH - (val / maxVal) * plotH;

  const buildPath = (key: "rrspEnd" | "piEnd" | "tfsaEnd" | "totalEnd") => {
    return data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(d[key]).toFixed(1)}`)
      .join(" ");
  };

  const totalPath = buildPath("totalEnd");
  const rrspPath = buildPath("rrspEnd");
  const piPath = buildPath("piEnd");
  const tfsaPath = buildPath("tfsaEnd");

  // Subtle translucent glowing area under the Total Wealth envelope
  const firstX = getX(0).toFixed(1);
  const lastX = getX(maxLen - 1).toFixed(1);
  const bottomY = (padTop + plotH).toFixed(1);
  const totalAreaPath = `${totalPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

  let gridLines = "";
  for (let i = 0; i <= 4; i++) {
    const yVal = (maxVal / 4) * i;
    const yPos = getY(yVal);
    gridLines += `
      <line x1="${padLeft}" y1="${yPos}" x2="${width - padRight}" y2="${yPos}" class="chart-grid-line" />
      <text x="${padLeft - 8}" y="${yPos + 4}" text-anchor="end" class="chart-axis-label">${formatCompact(yVal)}</text>
    `;
  }

  let xLabels = "";
  const step = Math.max(1, Math.floor(maxLen / 6));
  for (let i = 0; i < maxLen; i += step) {
    const d = data[i];
    const xPos = getX(i);
    xLabels += `<text x="${xPos}" y="${height - 10}" text-anchor="middle" class="chart-axis-label">Age ${d.age}</text>`;
  }

  return `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart" id="svg-chart-el">
      <defs>
        <linearGradient id="total-wealth-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--total-color)" stop-opacity="0.22" />
          <stop offset="90%" stop-color="var(--total-color)" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      ${gridLines}
      ${xLabels}
      <!-- Total Wealth Translucent Area Gradient -->
      <path d="${totalAreaPath}" fill="url(#total-wealth-grad)" />
      <!-- Account-Specific Paths -->
      <path d="${tfsaPath}" class="chart-line tfsa" />
      <path d="${piPath}" class="chart-line nonreg" />
      <path d="${rrspPath}" class="chart-line rrsp" />
      <!-- Total Wealth Prominent Curve -->
      <path d="${totalPath}" class="chart-line total" />
      <line id="hover-line" x1="0" y1="${padTop}" x2="0" y2="${padTop + plotH}" class="chart-hover-line" style="display:none;" />
    </svg>
  `;
}

/**
 * Render Svg Stacked Bar Chart for Annual Retirement Income Streams & Cashflow
 */
function renderSimulatorIncomeSvgChart(strat: StrategyResult): string {
  const retireData = strat.history.filter((d) => d.age >= state.retireAge);
  const count = retireData.length;
  if (count === 0) {
    return `<p style="padding:2rem;text-align:center;color:var(--text-muted);">No retirement data available for current settings.</p>`;
  }

  let maxIncome = state.retireNetSpending;
  for (const d of retireData) {
    const totalGross =
      (d.cppIncome || 0) +
      (d.oasIncome || 0) +
      (d.dbPensionIncome || 0) +
      (d.otherIncome || 0) +
      d.rrspGrossDraw +
      d.piGrossDraw +
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

  let gridLines = "";
  for (let i = 0; i <= 4; i++) {
    const yVal = (maxIncome / 4) * i;
    const yPos = getY(yVal);
    gridLines += `
      <line x1="${padLeft}" y1="${yPos.toFixed(1)}" x2="${(width - padRight).toFixed(1)}" y2="${yPos.toFixed(1)}" class="chart-grid-line" />
      <text x="${(padLeft - 8).toFixed(1)}" y="${(yPos + 4).toFixed(1)}" text-anchor="end" class="chart-axis-label">${formatCompact(yVal)}</text>
    `;
  }

  // Target Net Spending Reference Line
  const targetY = getY(state.retireNetSpending);
  const targetLine = `
    <line x1="${padLeft}" y1="${targetY.toFixed(1)}" x2="${(width - padRight).toFixed(1)}" y2="${targetY.toFixed(1)}" stroke="#10b981" stroke-width="2" stroke-dasharray="5,4" />
    <text x="${(width - padRight).toFixed(1)}" y="${(targetY - 6).toFixed(1)}" text-anchor="end" fill="#10b981" font-size="11" font-weight="700">Target Net: ${formatCompact(state.retireNetSpending)}</text>
  `;

  let bars = "";
  let xLabels = "";
  const labelStep = Math.max(1, Math.floor(count / 7));

  for (let i = 0; i < count; i++) {
    const d = retireData[i];
    const xCenter = padLeft + (i / Math.max(1, count - 1)) * plotW;
    const xLeft = xCenter - barWidth / 2;

    if (i % labelStep === 0 || i === count - 1) {
      xLabels += `<text x="${xCenter.toFixed(1)}" y="${height - 10}" text-anchor="middle" class="chart-axis-label">Age ${d.age}</text>`;
    }

    const cpp = d.cppIncome || 0;
    const oas = d.oasIncome || 0;
    const dbAndOther = (d.dbPensionIncome || 0) + (d.otherIncome || 0);
    const rrsp = d.rrspGrossDraw || 0;
    const pi = d.piGrossDraw || 0;
    const tfsa = d.tfsaGrossDraw || 0;

    let currentStackVal = 0;
    const layers = [
      { val: cpp, color: "#3b82f6" },
      { val: oas, color: "#60a5fa" },
      { val: dbAndOther, color: "#818cf8" },
      { val: rrsp, color: "var(--rrsp-color)" },
      { val: pi, color: "var(--nonreg-color)" },
      { val: tfsa, color: "var(--tfsa-color)" },
    ];

    for (const layer of layers) {
      if (layer.val <= 0) continue;
      const segH = (layer.val / maxIncome) * plotH;
      const yTop = getY(currentStackVal + layer.val);
      bars += `<rect x="${xLeft.toFixed(1)}" y="${yTop.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${segH.toFixed(1)}" fill="${layer.color}" rx="1" opacity="0.9" />`;
      currentStackVal += layer.val;
    }
  }

  return `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart" id="svg-chart-el">
      ${gridLines}
      ${targetLine}
      ${bars}
      ${xLabels}
      <line id="hover-line" x1="0" y1="${padTop}" x2="0" y2="${padTop + plotH}" class="chart-hover-line" style="display:none;" />
    </svg>
  `;
}

/**
 * Strategy Withdrawal Explanation Helper
 */
function getStrategyWithdrawalExplanation(strat: DecumulationStrategy, isCouple: boolean): string {
  if (strat === "oasShield") {
    return isCouple
      ? `<strong>The OAS Shield Formula:</strong> Withdraw from your Joint RRSP/RRIF up to <strong>$176,000/yr combined</strong> ($88,000 per spouse via CRA Form T1032 pension income splitting). This keeps both spouses below the ~$91,000 OAS clawback line. Shortfall is bridged from your <strong>Personal Account (PI)</strong> (where only 50% of capital gains are taxed) and your <strong>TFSA</strong> (100% tax-free).`
      : `<strong>The OAS Shield Formula:</strong> Withdraw from RRSP up to <strong>$88,000/yr</strong> to stay just below the ~$91,000 OAS clawback line. Shortfalls are bridged from your <strong>Personal Account (PI)</strong> (50% capital gains inclusion) and your <strong>TFSA</strong> (tax-free).`;
  }
  if (strat === "rrspMeltdown") {
    return isCouple
      ? `<strong>Early RRSP Meltdown Formula:</strong> Draw aggressively from RRSPs (up to <strong>$180,000/yr combined</strong>) between retirement and age 71. This shrinks your future RRIF balance to dismantle the "tax bomb" when CRA mandatory minimums take effect at age 71. If after-tax proceeds are below your ${formatCurrency(state.retireNetSpending)} target, take the remaining from PI, then TFSA.`
      : `<strong>Early RRSP Meltdown Formula:</strong> Draw up to <strong>$105,000/yr</strong> from your RRSP before age 71 to burn down the tax-deferred balance before forced CRA minimums begin. Supplement with PI and TFSA if needed.`;
  }
  if (strat === "taxableFirst") {
    return `<strong>Taxable (PI) First Formula:</strong> Withdraw <strong>100% of spending from your Personal Investment (PI)</strong> first until it reaches $0. During this time, take <strong>$0 from RRSP</strong> (until mandatory RRIF minimums start at age 71) and <strong>$0 from TFSA</strong>. This allows tax-sheltered accounts to compound untouched for as many years as possible.`;
  }
  // proRata
  return `<strong>Proportional Balanced Draw Formula:</strong> Withdraw simultaneously from RRSP, Personal Account, and TFSA based on their current balance weights. Each account pays its proportional share toward your ${formatCurrency(state.retireNetSpending)} after-tax spending goal.`;
}

/**
 * Render Simulator Ledger Table
 */
function renderSimulatorLedger(strat: StrategyResult, isCouple: boolean): string {
  const rows = strat.history
    .map((d) => {
      const isRetire = d.age >= state.retireAge;
      const ageLabel =
        isCouple && d.person2Age
          ? `P1: Age ${d.age} · P2: Age ${d.person2Age}`
          : `Age ${d.age}`;
      return `
        <tr>
          <td class="td-left" style="font-weight:600;">
            <span class="badge-age">${ageLabel}</span>
            ${d.isIncomeSplit ? `<span class="badge-rrif-min" style="background:rgba(16,185,129,0.2);color:#34d399;border-color:rgba(16,185,129,0.4);">Pension Split</span>` : ""}
            ${d.notes ? `<span class="badge-rrif-min">${d.notes}</span>` : ""}
          </td>
          <td class="td-highlight-rrsp">${formatCurrency(d.rrspEnd)}</td>
          <td class="td-highlight-nonreg">${formatCurrency(d.piEnd)}</td>
          <td style="color:var(--tfsa-color);">${formatCurrency(d.tfsaEnd)}</td>
          <td style="font-weight:700;color:var(--total-color);">${formatCurrency(d.totalEnd)}</td>
          ${
            state.includeOtherIncome
              ? `<td style="color:#60a5fa;font-weight:600;">${isRetire && d.guaranteedGross > 0 ? formatCurrency(d.guaranteedGross) : "—"}</td>`
              : ""
          }
          <td style="color:var(--rrsp-color);font-weight:600;">
            ${isRetire ? (d.rrspGrossDraw > 0 ? formatCurrency(d.rrspGrossDraw) : "—") : (d.rrspContrib > 0 ? `+${formatCurrency(d.rrspContrib)}` : "—")}
          </td>
          <td style="color:var(--nonreg-color);font-weight:600;">
            ${isRetire ? (d.piGrossDraw > 0 ? formatCurrency(d.piGrossDraw) : "—") : (d.piContrib > 0 ? `+${formatCurrency(d.piContrib)}` : "—")}
          </td>
          <td style="color:var(--tfsa-color);font-weight:600;">
            ${isRetire ? (d.tfsaGrossDraw > 0 ? formatCurrency(d.tfsaGrossDraw) : "—") : (d.tfsaContrib > 0 ? `+${formatCurrency(d.tfsaContrib)}` : "—")}
          </td>
          <td style="color:${d.totalTax > 0 ? '#f87171' : 'var(--text-muted)'};">${formatCurrency(d.totalTax)}</td>
          <td style="color:#10b981;font-weight:700;">
            ${isRetire ? formatCurrency(d.netSpendReceived) : "Accumulating"}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="table-responsive">
      <table class="ledger-table">
        <thead>
          <tr>
            <th class="td-left">${isCouple ? "Couple Ages & Strategy" : "Age & Status"}</th>
            <th>RRSP Balance</th>
            <th>Personal (PI) Balance</th>
            <th>TFSA Balance</th>
            <th>Total Wealth</th>
            ${state.includeOtherIncome ? `<th style="color:#60a5fa;">Guaranteed Inc</th>` : ""}
            <th style="color:var(--rrsp-color);">RRSP Draw</th>
            <th style="color:var(--nonreg-color);">PI Draw</th>
            <th style="color:var(--tfsa-color);">TFSA Draw</th>
            <th>Tax Paid</th>
            <th style="color:#10b981;">Net Spend</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Render Educational Rules Section
 */
function renderRulesSection(): string {
  return `
    <section class="rules-section" aria-label="Canadian Retirement Planning Rules & Factors">
      <div class="rules-header">
        <h2>📋 Rules & Factors to Consider in Canadian Retirement Planning</h2>
        <p>Key tax laws, CRA regulations, and structural differences that impact RRSP, Personal Non-Registered, and TFSA accounts.</p>
      </div>

      <div class="rules-grid">
        <article class="rule-card">
          <div class="rule-card-header">
            <div class="rule-title-group">
              <span class="rule-icon">🤝</span>
              <span class="rule-title">Pension Income Splitting (CRA Form T1032)</span>
            </div>
            <span class="rule-tag tag-strategy">Couples Rule</span>
          </div>
          <p class="rule-desc">
            At age 65+, Canadian couples can transfer up to <strong>50% of eligible RRIF withdrawals</strong> to their spouse on line 21000 of their tax return. Both spouses get the <strong>$2,000 Pension Credit</strong> and dual Basic Personal Amounts ($31,410 tax-free combined).
          </p>
          <div class="rule-takeaway">
            <strong>Impact:</strong> Cuts annual retirement income tax by $6,000 to $12,000+ per year, adding 3 to 6 years of longevity to a couple's portfolio!
          </div>
        </article>

        <article class="rule-card">
          <div class="rule-card-header">
            <div class="rule-title-group">
              <span class="rule-icon">🛡️</span>
              <span class="rule-title">Dual OAS Clawback Shield ($182k Combined)</span>
            </div>
            <span class="rule-tag tag-tax">Clawback Shield</span>
          </div>
          <p class="rule-desc">
            While a single person's OAS clawback starts at ~$91,000, a couple splitting income can draw up to <strong>$182,000 combined</strong> before triggering the 15% OAS recovery tax.
          </p>
          <div class="rule-takeaway">
            <strong>Impact:</strong> Fully shields both spouses' Old Age Security pensions from government clawbacks.
          </div>
        </article>

        <article class="rule-card">
          <div class="rule-card-header">
            <div class="rule-title-group">
              <span class="rule-icon">🏛️</span>
              <span class="rule-title">CRA Mandatory RRIF Conversion (Age 71+)</span>
            </div>
            <span class="rule-tag tag-cra">CRA Rule</span>
          </div>
          <p class="rule-desc">
            By December 31 of the year you turn <strong>71</strong>, you must convert your RRSP to a RRIF. For couples, the CRA allows basing mandatory minimums on the <strong>younger spouse's age</strong>, lowering required withdrawals!
          </p>
          <div class="rule-takeaway">
            <strong>Impact:</strong> Using the younger spouse's age legally reduces forced taxable withdrawals and keeps more money compounding.
          </div>
        </article>

        <article class="rule-card">
          <div class="rule-card-header">
            <div class="rule-title-group">
              <span class="rule-icon">📉</span>
              <span class="rule-title">Annual Tax Drag in Personal Accounts</span>
            </div>
            <span class="rule-tag tag-tax">Growth Drag</span>
          </div>
          <p class="rule-desc">
            In non-registered accounts, dividends, interest, and realized capital gains are taxed <strong>every single tax year</strong>, dragging compounding down by <strong>1.0% to 2.0% annually</strong> compared to RRSP/TFSA.
          </p>
          <div class="rule-takeaway">
            <strong>Impact:</strong> Couples have double the TFSA room ($14,000/yr) and double the RRSP room to shelter savings from drag.
          </div>
        </article>
      </div>
    </section>
  `;
}

/**
 * Static event listeners for top-level mode switches and theme
 */
function attachStaticEventListeners(): void {
  // Theme Toggle
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", state.theme);
    document.documentElement.setAttribute("data-theme", state.theme);
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.textContent = state.theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
    }
  });

  // Household Mode Toggle (Single vs Couple)
  document.getElementById("btn-household-single")?.addEventListener("click", () => {
    if (state.householdMode === "single") return;
    state.householdMode = "single";
    renderApp();
  });
  document.getElementById("btn-household-couple")?.addEventListener("click", () => {
    if (state.householdMode === "couple") return;
    state.householdMode = "couple";
    renderApp();
  });

  // View Mode Tabs
  document.getElementById("tab-mode-sim")?.addEventListener("click", () => {
    if (state.viewMode === "simulator") return;
    state.viewMode = "simulator";
    renderApp();
  });
  document.getElementById("tab-mode-comp")?.addEventListener("click", () => {
    if (state.viewMode === "comparator") return;
    state.viewMode = "comparator";
    renderApp();
  });

  // Scenario Chips
  document.getElementById("chip-scenario-baseline")?.addEventListener("click", () => {
    state.retireAge = 65;
    state.person2RetireAge = 63;
    state.yearsAccumulation = 15;
    state.retireNetSpending = 80000;
    state.decumStrategy = "oasShield";
    renderApp();
  });

  document.getElementById("chip-scenario-early")?.addEventListener("click", () => {
    state.retireAge = 58;
    state.person2RetireAge = 56;
    state.yearsAccumulation = 18;
    state.retireNetSpending = 65000;
    state.decumStrategy = "rrspMeltdown";
    renderApp();
  });

  document.getElementById("chip-scenario-fat")?.addEventListener("click", () => {
    state.retireNetSpending = 110000;
    state.decumStrategy = "oasShield";
    const sliderSpend = document.getElementById("slider-spend") as HTMLInputElement | null;
    const numSpend = document.getElementById("num-spend") as HTMLInputElement | null;
    const dispSpend = document.getElementById("disp-spend");
    if (sliderSpend) sliderSpend.value = "110000";
    if (numSpend) numSpend.value = "110000";
    if (dispSpend) dispSpend.textContent = `${formatCurrency(110000)}/yr`;
    updateResultsOnly();
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
    renderControlsPanel();
    updateResultsOnly();
  });
}

/**
 * Attach listeners to controls in the sidebar.
 * All sliders handle input smoothly without re-rendering the sidebar DOM.
 */
function attachControlsEventListeners(): void {
  const isCouple = state.householdMode === "couple";

  // Total Combined Saving Handler
  const sliderSaving = document.getElementById("slider-saving") as HTMLInputElement | null;
  const numSaving = document.getElementById("num-saving") as HTMLInputElement | null;
  const dispSaving = document.getElementById("disp-saving");

  const onTotalSavingChange = (newTotal: number) => {
    state.annualSaving = newTotal;
    if (dispSaving) dispSaving.textContent = formatCurrency(newTotal);

    if (isCouple) {
      const currentSum = state.p1RrspSaving + state.p2RrspSaving + state.piSaving || 1;
      const r1 = state.p1RrspSaving / currentSum;
      const r2 = state.p2RrspSaving / currentSum;
      let p1 = Math.round(newTotal * r1);
      let p2 = Math.round(newTotal * r2);
      let pi = newTotal - p1 - p2;
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
      state.piSaving = Math.max(0, pi);
    } else {
      const currentSum = state.p1RrspSaving + state.piSaving || 1;
      const r1 = state.p1RrspSaving / currentSum;
      let p1 = Math.round(newTotal * r1);
      let pi = newTotal - p1;
      if (p1 > 32490) {
        pi += p1 - 32490;
        p1 = 32490;
      }
      state.p1RrspSaving = p1;
      state.piSaving = Math.max(0, pi);
    }

    // Sync individual input values without re-creating DOM
    const sP1 = document.getElementById("slider-p1-rrsp") as HTMLInputElement | null;
    const nP1 = document.getElementById("num-p1-rrsp") as HTMLInputElement | null;
    const dP1 = document.getElementById("disp-p1-rrsp");
    if (sP1) sP1.value = state.p1RrspSaving.toString();
    if (nP1) nP1.value = state.p1RrspSaving.toString();
    if (dP1) dP1.textContent = formatCurrency(state.p1RrspSaving);

    if (isCouple) {
      const sP2 = document.getElementById("slider-p2-rrsp") as HTMLInputElement | null;
      const nP2 = document.getElementById("num-p2-rrsp") as HTMLInputElement | null;
      const dP2 = document.getElementById("disp-p2-rrsp");
      if (sP2) sP2.value = state.p2RrspSaving.toString();
      if (nP2) nP2.value = state.p2RrspSaving.toString();
      if (dP2) dP2.textContent = formatCurrency(state.p2RrspSaving);
    }

    const sPi = document.getElementById("slider-pi") as HTMLInputElement | null;
    const nPi = document.getElementById("num-pi") as HTMLInputElement | null;
    const dPi = document.getElementById("disp-pi");
    if (sPi) sPi.value = state.piSaving.toString();
    if (nPi) nPi.value = state.piSaving.toString();
    if (dPi) dPi.textContent = formatCurrency(state.piSaving);

    updateAllocationVisuals();
    updateResultsOnly();
  };

  sliderSaving?.addEventListener("input", () => {
    const v = parseFloat(sliderSaving.value) || 0;
    if (numSaving) numSaving.value = v.toString();
    onTotalSavingChange(v);
  });
  numSaving?.addEventListener("input", () => {
    const v = parseFloat(numSaving.value) || 0;
    if (sliderSaving) sliderSaving.value = v.toString();
    onTotalSavingChange(v);
  });

  // Individual Account Saving Sliders
  const bindSavingField = (
    sliderId: string,
    numId: string,
    dispId: string,
    onVal: (v: number) => void
  ) => {
    const slider = document.getElementById(sliderId) as HTMLInputElement | null;
    const num = document.getElementById(numId) as HTMLInputElement | null;
    const disp = document.getElementById(dispId);

    const handle = (v: number) => {
      onVal(v);
      if (disp) disp.textContent = formatCurrency(v);
      // Recalculate combined total
      const total = isCouple
        ? state.p1RrspSaving + state.p2RrspSaving + state.piSaving
        : state.p1RrspSaving + state.piSaving;
      state.annualSaving = total;
      if (sliderSaving) sliderSaving.value = total.toString();
      if (numSaving) numSaving.value = total.toString();
      if (dispSaving) dispSaving.textContent = formatCurrency(total);

      updateAllocationVisuals();
      updateResultsOnly();
    };

    slider?.addEventListener("input", () => {
      const v = parseFloat(slider.value) || 0;
      if (num) num.value = v.toString();
      handle(v);
    });
    num?.addEventListener("input", () => {
      const v = parseFloat(num.value) || 0;
      if (slider) slider.value = v.toString();
      handle(v);
    });
  };

  bindSavingField("slider-p1-rrsp", "num-p1-rrsp", "disp-p1-rrsp", (v) => {
    state.p1RrspSaving = v;
  });

  if (isCouple) {
    bindSavingField("slider-p2-rrsp", "num-p2-rrsp", "disp-p2-rrsp", (v) => {
      state.p2RrspSaving = v;
    });
  }

  bindSavingField("slider-pi", "num-pi", "disp-pi", (v) => {
    state.piSaving = v;
  });

  // Preset Buttons for Couples
  if (isCouple) {
    document.getElementById("preset-couple-equal")?.addEventListener("click", () => {
      const rrspPool = Math.min(state.annualSaving, 32490 * 2);
      const half = Math.min(32490, Math.floor(rrspPool / 2));
      state.p1RrspSaving = half;
      state.p2RrspSaving = half;
      state.piSaving = Math.max(0, state.annualSaving - half * 2);
      syncAllSavingInputs();
      updateResultsOnly();
    });

    document.getElementById("preset-couple-max")?.addEventListener("click", () => {
      state.p1RrspSaving = 32490;
      state.p2RrspSaving = 32490;
      state.annualSaving = Math.max(state.annualSaving, 64980);
      state.piSaving = Math.max(0, state.annualSaving - 64980);
      syncAllSavingInputs();
      updateResultsOnly();
    });

    document.getElementById("preset-couple-highearner")?.addEventListener("click", () => {
      const p1 = Math.min(32490, state.annualSaving);
      const remainder = Math.max(0, state.annualSaving - p1);
      const p2 = Math.min(32490, remainder);
      state.p1RrspSaving = p1;
      state.p2RrspSaving = p2;
      state.piSaving = Math.max(0, remainder - p2);
      syncAllSavingInputs();
      updateResultsOnly();
    });

    document.getElementById("preset-couple-balanced")?.addEventListener("click", () => {
      const rrspTarget = Math.round(state.annualSaving * 0.7);
      const p1 = Math.min(32490, Math.floor(rrspTarget / 2));
      const p2 = Math.min(32490, rrspTarget - p1);
      state.p1RrspSaving = p1;
      state.p2RrspSaving = p2;
      state.piSaving = Math.max(0, state.annualSaving - p1 - p2);
      syncAllSavingInputs();
      updateResultsOnly();
    });
  } else {
    // Single Presets
    document.getElementById("preset-single-max")?.addEventListener("click", () => {
      state.p1RrspSaving = Math.min(32490, state.annualSaving);
      state.piSaving = Math.max(0, state.annualSaving - state.p1RrspSaving);
      syncAllSavingInputs();
      updateResultsOnly();
    });

    document.getElementById("preset-single-balanced")?.addEventListener("click", () => {
      state.p1RrspSaving = Math.min(32490, Math.round(state.annualSaving * 0.7));
      state.piSaving = Math.max(0, state.annualSaving - state.p1RrspSaving);
      syncAllSavingInputs();
      updateResultsOnly();
    });

    document.getElementById("preset-single-half")?.addEventListener("click", () => {
      state.p1RrspSaving = Math.min(32490, Math.round(state.annualSaving * 0.5));
      state.piSaving = Math.max(0, state.annualSaving - state.p1RrspSaving);
      syncAllSavingInputs();
      updateResultsOnly();
    });

    document.getElementById("preset-single-all")?.addEventListener("click", () => {
      state.p1RrspSaving = Math.min(32490, state.annualSaving);
      state.piSaving = 0;
      state.annualSaving = state.p1RrspSaving;
      syncAllSavingInputs();
      updateResultsOnly();
    });
  }

  // Refund Reinvestment Targets
  const setRefundTarget = (target: "tfsa" | "pi" | "none") => {
    state.reinvestRefundTo = target;
    document.querySelectorAll(".refund-summary-box .preset-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.getElementById(`refund-${target}`)?.classList.add("active");
    updateResultsOnly();
  };

  document.getElementById("refund-tfsa")?.addEventListener("click", () => setRefundTarget("tfsa"));
  document.getElementById("refund-pi")?.addEventListener("click", () => setRefundTarget("pi"));
  document.getElementById("refund-none")?.addEventListener("click", () => setRefundTarget("none"));

  // Helper for generic 2-way range/number binding
  const bindSliderPair = (
    sliderId: string,
    numId: string,
    dispId: string,
    formatter: (v: number) => string,
    onVal: (v: number) => void
  ) => {
    const slider = document.getElementById(sliderId) as HTMLInputElement | null;
    const num = document.getElementById(numId) as HTMLInputElement | null;
    const disp = document.getElementById(dispId);

    const handle = (v: number) => {
      onVal(v);
      if (disp) disp.textContent = formatter(v);
      updateResultsOnly();
    };

    slider?.addEventListener("input", () => {
      const v = parseFloat(slider.value);
      if (num) num.value = v.toString();
      handle(v);
    });

    num?.addEventListener("input", () => {
      const v = parseFloat(num.value);
      if (!isNaN(v)) {
        if (slider) slider.value = v.toString();
        handle(v);
      }
    });
  };

  bindSliderPair(
    "slider-years",
    "num-years",
    "disp-years",
    (v) => `${Math.round(v)} years`,
    (v) => {
      state.yearsAccumulation = Math.round(v);
    }
  );

  bindSliderPair(
    "slider-retireage",
    "num-retireage",
    "disp-retireage",
    (v) => `Age ${Math.round(v)}`,
    (v) => {
      state.retireAge = Math.round(v);
    }
  );

  const numRetire2 = document.getElementById("num-retireage2") as HTMLInputElement | null;
  numRetire2?.addEventListener("input", () => {
    const v = parseFloat(numRetire2.value);
    if (!isNaN(v)) {
      state.person2RetireAge = Math.round(v);
      updateResultsOnly();
    }
  });

  bindSliderPair(
    "slider-spend",
    "num-spend",
    "disp-spend",
    (v) => `${formatCurrency(v)}/yr`,
    (v) => {
      state.retireNetSpending = v;
    }
  );

  // Pension Income Splitting Checkbox
  document.getElementById("check-splitting")?.addEventListener("change", (e) => {
    state.enableIncomeSplitting = (e.target as HTMLInputElement).checked;
    updateResultsOnly();
  });

  // Working Marginal Tax Rates
  bindSliderPair(
    "slider-tax",
    "num-tax",
    "disp-tax",
    (v) => `${v.toFixed(1)}%`,
    (v) => {
      state.workTaxRate = v / 100;
      updateAllocationVisuals();
    }
  );

  const numTax2 = document.getElementById("num-tax2") as HTMLInputElement | null;
  numTax2?.addEventListener("input", () => {
    const v = parseFloat(numTax2.value);
    if (!isNaN(v)) {
      state.person2WorkTaxRate = v / 100;
      updateAllocationVisuals();
      updateResultsOnly();
    }
  });

  bindSliderPair(
    "slider-growth",
    "num-growth",
    "disp-growth",
    (v) => `${v.toFixed(1)}%`,
    (v) => {
      state.growthRatePreTax = v / 100;
    }
  );

  bindSliderPair(
    "slider-drag",
    "num-drag",
    "disp-drag",
    (v) => `${v.toFixed(1)}%`,
    (v) => {
      state.taxDrag = v / 100;
    }
  );

  bindSliderPair(
    "slider-retgrowth",
    "num-retgrowth",
    "disp-retgrowth",
    (v) => `${v.toFixed(1)}%`,
    (v) => {
      state.retireGrowthRate = v / 100;
    }
  );

  // Guaranteed Pensions & Other Income Controls
  const checkOther = document.getElementById("check-other-income") as HTMLInputElement | null;
  checkOther?.addEventListener("change", () => {
    state.includeOtherIncome = checkOther.checked;
    renderControlsPanel();
    updateResultsOnly();
  });

  const btnToggleIncome = document.getElementById("btn-toggle-income-details");
  btnToggleIncome?.addEventListener("click", () => {
    state.otherIncomeExpanded = !state.otherIncomeExpanded;
    renderControlsPanel();
  });

  // Benchmark Presets
  document.getElementById("preset-pension-standard")?.addEventListener("click", () => {
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
    renderControlsPanel();
    updateResultsOnly();
  });

  document.getElementById("preset-pension-max")?.addEventListener("click", () => {
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
    renderControlsPanel();
    updateResultsOnly();
  });

  document.getElementById("preset-pension-db")?.addEventListener("click", () => {
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
    renderControlsPanel();
    updateResultsOnly();
  });

  document.getElementById("preset-pension-reset")?.addEventListener("click", () => {
    state.includeOtherIncome = false;
    state.employerPensionAnnual = 0;
    state.otherTaxableIncome = 0;
    renderControlsPanel();
    updateResultsOnly();
  });

  if (state.includeOtherIncome && state.otherIncomeExpanded) {
    bindSliderPair(
      "slider-p1-cpp",
      "num-p1-cpp",
      "disp-p1-cpp",
      (v) => `${formatCurrency(v)}/yr`,
      (v) => {
        state.person1CppAnnual = v;
        updatePensionCoverageLive();
      }
    );

    const selP1CppAge = document.getElementById("select-p1-cpp-age") as HTMLSelectElement | null;
    selP1CppAge?.addEventListener("change", () => {
      state.person1CppStartAge = parseInt(selP1CppAge.value, 10);
      updatePensionCoverageLive();
      updateResultsOnly();
    });

    bindSliderPair(
      "slider-p1-oas",
      "num-p1-oas",
      "disp-p1-oas",
      (v) => `${formatCurrency(v)}/yr`,
      (v) => {
        state.person1OasAnnual = v;
        updatePensionCoverageLive();
      }
    );

    if (isCouple) {
      bindSliderPair(
        "slider-p2-cpp",
        "num-p2-cpp",
        "disp-p2-cpp",
        (v) => `${formatCurrency(v)}/yr`,
        (v) => {
          state.person2CppAnnual = v;
          updatePensionCoverageLive();
        }
      );

      const selP2CppAge = document.getElementById("select-p2-cpp-age") as HTMLSelectElement | null;
      selP2CppAge?.addEventListener("change", () => {
        state.person2CppStartAge = parseInt(selP2CppAge.value, 10);
        updatePensionCoverageLive();
        updateResultsOnly();
      });

      bindSliderPair(
        "slider-p2-oas",
        "num-p2-oas",
        "disp-p2-oas",
        (v) => `${formatCurrency(v)}/yr`,
        (v) => {
          state.person2OasAnnual = v;
          updatePensionCoverageLive();
        }
      );
    }

    bindSliderPair(
      "slider-db-pension",
      "num-db-pension",
      "disp-db-pension",
      (v) => `${formatCurrency(v)}/yr`,
      (v) => {
        state.employerPensionAnnual = v;
        updatePensionCoverageLive();
      }
    );

    const selDbAge = document.getElementById("select-db-pension-age") as HTMLSelectElement | null;
    selDbAge?.addEventListener("change", () => {
      state.employerPensionStartAge = parseInt(selDbAge.value, 10);
      updatePensionCoverageLive();
      updateResultsOnly();
    });

    bindSliderPair(
      "slider-other-inc",
      "num-other-inc",
      "disp-other-inc",
      (v) => `${formatCurrency(v)}/yr`,
      (v) => {
        state.otherTaxableIncome = v;
        updatePensionCoverageLive();
      }
    );
  }

  // Spending Optimizer Handlers
  const handleOptimizeSpending = () => {
    const params = getStrategyParams();
    const opt = findMaxSafeSpending(params, 95);

    state.retireNetSpending = opt.maxSpending;
    state.decumStrategy = opt.bestStrategy;

    const sliderSpend = document.getElementById("slider-spend") as HTMLInputElement | null;
    const numSpend = document.getElementById("num-spend") as HTMLInputElement | null;
    const dispSpend = document.getElementById("disp-spend");
    if (sliderSpend) sliderSpend.value = opt.maxSpending.toString();
    if (numSpend) numSpend.value = opt.maxSpending.toString();
    if (dispSpend) dispSpend.textContent = `${formatCurrency(opt.maxSpending)}/yr`;

    const banner = document.getElementById("optimize-spend-result");
    if (banner) {
      banner.style.display = "block";
      banner.innerHTML = `
        <strong>🎉 Max Safe Spending Found:</strong> You can sustainably spend <strong>${formatCurrency(opt.maxSpending)}/yr after-tax</strong> until <strong>Age ${opt.strategyResult.depletionAge}+</strong> using the <em>"${opt.strategyResult.name}"</em> strategy!
      `;
    }

    updateResultsOnly();
  };

  document.getElementById("btn-optimize-spending")?.addEventListener("click", handleOptimizeSpending);
  document.getElementById("chip-scenario-optimize")?.addEventListener("click", handleOptimizeSpending);

  // Comparator baseline buttons
  document.getElementById("mode-pretax")?.addEventListener("click", () => {
    state.comparatorMode = "preTax";
    renderApp();
  });
  document.getElementById("mode-cashout")?.addEventListener("click", () => {
    state.comparatorMode = "cashOut";
    renderApp();
  });
  document.getElementById("check-reinvest")?.addEventListener("change", (e) => {
    state.comparatorReinvest = (e.target as HTMLInputElement).checked;
    updateResultsOnly();
  });
}

/**
 * Synchronizes the Blueprint Age Explorer UI to a target age
 */
function setBlueprintAge(age: number, currentStrat: StrategyResult, isCouple: boolean): void {
  const retireHistory = currentStrat.history.filter((d) => d.age >= state.retireAge);
  if (retireHistory.length === 0) return;

  const minAge = state.retireAge;
  const maxAge = retireHistory[retireHistory.length - 1].age;
  const validAge = Math.min(maxAge, Math.max(minAge, age));
  state.blueprintSelectedAge = validAge;

  const rec = retireHistory.find((d) => d.age === validAge) || retireHistory[0];
  const yearInRetire = validAge - state.retireAge + 1;

  const dispBlueprintAge = document.getElementById("disp-blueprint-age");
  if (dispBlueprintAge) {
    dispBlueprintAge.textContent = `Age ${validAge} (Year ${yearInRetire} of Retirement)${
      isCouple && rec.person2Age ? ` · Spouse Age ${rec.person2Age}` : ""
    }`;
  }

  const sliderBlueprintAge = document.getElementById("slider-blueprint-age") as HTMLInputElement | null;
  if (sliderBlueprintAge && parseInt(sliderBlueprintAge.value, 10) !== validAge) {
    sliderBlueprintAge.value = validAge.toString();
  }

  document.querySelectorAll<HTMLButtonElement>(".age-chip").forEach((chip) => {
    const chipAge = parseInt(chip.dataset.age || "", 10);
    chip.classList.toggle("active", chipAge === validAge);
  });

  const blueprintDetails = document.getElementById("blueprint-dynamic-details");
  if (blueprintDetails) {
    blueprintDetails.innerHTML = renderBlueprintDynamicDetails(rec, validAge, isCouple);
  }
}

/**
 * Event listeners inside the dynamic results panel (strategy cards, chart view toggle, age explorer, ledger toggle)
 */
function attachResultListeners(currentStrat: StrategyResult, isCouple: boolean): void {
  // Strategy Selector Cards
  document.querySelectorAll<HTMLDivElement>(".strat-card").forEach((card) => {
    card.addEventListener("click", () => {
      const s = card.dataset.strat as DecumulationStrategy;
      if (s && s !== state.decumStrategy) {
        state.decumStrategy = s;
        updateResultsOnly();
      }
    });
  });

  // Chart View Mode Toggle Buttons
  document.getElementById("btn-chart-balances")?.addEventListener("click", () => {
    if (state.chartViewMode !== "balances") {
      state.chartViewMode = "balances";
      updateResultsOnly();
    }
  });

  document.getElementById("btn-chart-income")?.addEventListener("click", () => {
    if (state.chartViewMode !== "incomeStreams") {
      state.chartViewMode = "incomeStreams";
      updateResultsOnly();
    }
  });

  // Interactive Age Explorer Slider
  const sliderBlueprintAge = document.getElementById("slider-blueprint-age") as HTMLInputElement | null;
  sliderBlueprintAge?.addEventListener("input", (e) => {
    const age = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(age)) {
      setBlueprintAge(age, currentStrat, isCouple);
    }
  });

  // Milestone Age Chips
  document.querySelectorAll<HTMLButtonElement>(".age-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const age = parseInt(chip.dataset.age || "", 10);
      if (!isNaN(age)) {
        setBlueprintAge(age, currentStrat, isCouple);
      }
    });
  });

  // Ledger Toggle
  document.getElementById("ledger-toggle")?.addEventListener("click", () => {
    state.ledgerOpen = !state.ledgerOpen;
    updateResultsOnly();
  });

  // Inline CTA to enable pensions & other income
  document.getElementById("btn-enable-pensions-inline")?.addEventListener("click", () => {
    state.includeOtherIncome = true;
    state.otherIncomeExpanded = true;
    renderControlsPanel();
    updateResultsOnly();
    const pensionCard = document.getElementById("pension-income-card");
    if (pensionCard) {
      pensionCard.scrollIntoView({ behavior: "smooth", block: "center" });
      pensionCard.classList.add("highlight-pulse");
      setTimeout(() => pensionCard.classList.remove("highlight-pulse"), 2000);
    }
  });
}

/**
 * Chart Tooltip & Hover Crosshair
 */
function setupSimulatorChartHover(strat: StrategyResult, isCouple: boolean): void {
  const chartWrapper = document.getElementById("chart-container");
  const svg = document.getElementById("svg-chart-el");
  const hoverLine = document.getElementById("hover-line");
  const tooltip = document.getElementById("chart-tooltip");

  if (!chartWrapper || !svg || !hoverLine || !tooltip) return;

  let lastHoveredAge: number | null = null;

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
      const totalGross =
        cpp + oas + dbAndOther + d.rrspGrossDraw + d.piGrossDraw + d.tfsaGrossDraw;

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
      if (lastHoveredAge !== null) {
        setBlueprintAge(lastHoveredAge, strat, isCouple);
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

    const lineSvgX = 70 + (index / (maxLen - 1)) * (800 - 90);
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
          <div style="color:var(--tfsa-color);">TFSA Draw: <strong>${d.tfsaGrossDraw > 0 ? formatCurrency(d.tfsaGrossDraw) : "$0"}</strong></div>
          <div style="color:#10b981;font-weight:700;margin-top:0.2rem;">Net Spending: ${formatCurrency(d.netSpendReceived)}</div>
          `
            : `
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.2rem;">Annual Savings Added:</div>
          <div style="color:var(--rrsp-color);">RRSP: <strong>+${formatCurrency(d.rrspContrib)}</strong></div>
          <div style="color:var(--nonreg-color);">PI: <strong>+${formatCurrency(d.piContrib)}</strong></div>
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

// Initial render
renderApp();
