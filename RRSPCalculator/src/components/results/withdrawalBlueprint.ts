import {
  DecumulationStrategy,
  StrategyResult,
  StrategyYearRecord,
} from "../../calculator";
import { formatCurrency } from "../../formatters";
import { state } from "../../state";
import { renderBlueprintCol } from "../ui/blueprintCol";
import { AppRenderCallbacks } from "../ui/types";

interface IncomeStreamSegment {
  variant: string;
  label: string;
  fullTitle: string;
  amount: number;
  pct: number;
}

/**
 * Renders the interactive income breakdown bar, itemized stack, and draw cards for a given age
 */
export function renderBlueprintDynamicDetails(
  record: StrategyYearRecord,
  selectedAge: number,
  isCouple: boolean,
  hasCorp = false
): string {
  const cpp = record.cppIncome || 0;
  const oas = record.oasIncome || 0;
  const dbAndOther = (record.dbPensionIncome || 0) + (record.otherIncome || 0);
  const rrsp = record.rrspGrossDraw || 0;
  const pi = record.piGrossDraw || 0;
  const corp = record.corpGrossDraw || 0;
  const tfsa = record.tfsaGrossDraw || 0;
  const totalGross = cpp + oas + dbAndOther + rrsp + pi + corp + tfsa;
  const safeGross = Math.max(1, totalGross);

  const cppPct = Math.round((cpp / safeGross) * 100);
  const oasPct = Math.round((oas / safeGross) * 100);
  const dbPct = Math.round((dbAndOther / safeGross) * 100);
  const rrspPct = Math.round((rrsp / safeGross) * 100);
  const piPct = Math.round((pi / safeGross) * 100);
  const corpPct = Math.round((corp / safeGross) * 100);
  const tfsaPct = Math.max(0, 100 - cppPct - oasPct - dbPct - rrspPct - piPct - corpPct);

  const showCorpCol = hasCorp || corp > 0 || record.corpStart > 0;

  const activeStreams: IncomeStreamSegment[] = [
    { variant: "cpp", label: "CPP", fullTitle: "CPP", amount: cpp, pct: cppPct },
    { variant: "oas", label: "OAS", fullTitle: "OAS", amount: oas, pct: oasPct },
    {
      variant: "db",
      label: "DB/Other",
      fullTitle: "DB Pension/Other",
      amount: dbAndOther,
      pct: dbPct,
    },
    { variant: "rrsp", label: "RRSP", fullTitle: "RRSP/RRIF", amount: rrsp, pct: rrspPct },
    { variant: "pi", label: "PI", fullTitle: "Personal (PI)", amount: pi, pct: piPct },
    {
      variant: "corp",
      label: "Corp",
      fullTitle: "Co-Owned Corp (CDA + Div)",
      amount: corp,
      pct: corpPct,
    },
    { variant: "tfsa", label: "TFSA", fullTitle: "TFSA", amount: tfsa, pct: tfsaPct },
  ].filter((s) => s.amount > 0);

  return `
    <!-- Multi-Segment Visual Income Breakdown Bar -->
    <div class="income-breakdown-bar-wrapper">
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:600;color:var(--text-secondary);margin-bottom:0.25rem;">
        <span>Gross Income Composition (Total: ${formatCurrency(totalGross)})</span>
        <span style="color:#10b981;">Net Received: ${formatCurrency(record.netSpendReceived)} (Tax: ${formatCurrency(record.totalTax)})</span>
      </div>
      <div class="income-breakdown-bar">
        ${activeStreams
          .map(
            (s) =>
              `<div class="income-bar-seg ${s.variant}" style="width:${s.pct}%;" title="${s.fullTitle}: ${formatCurrency(s.amount)} (${s.pct}%)"></div>`
          )
          .join("")}
      </div>
      <div class="income-legend-row">
        ${activeStreams
          .map(
            (s) =>
              `<div class="income-legend-item"><span class="income-legend-dot ${s.variant}"></span> ${s.label}: ${formatCurrency(s.amount)} (${s.pct}%)</div>`
          )
          .join("")}
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
      ${renderBlueprintCol({
        variant: "rrsp",
        icon: "🟣",
        title: isCouple ? "Joint RRSP / RRIF" : "RRSP / RRIF",
        titleColor: "var(--rrsp-color)",
        amountText: formatCurrency(record.rrspGrossDraw),
        noteText: record.isRRIFForced
          ? "Mandatory RRIF Min Active"
          : record.rrspGrossDraw > 0
          ? "Taxable graduated bracket draw"
          : "$0 needed (deferred)",
      })}
      ${renderBlueprintCol({
        variant: "pi",
        icon: "🟠",
        title: "Personal Account (PI)",
        titleColor: "var(--nonreg-color)",
        amountText: formatCurrency(record.piGrossDraw),
        noteText: record.piGrossDraw > 0 ? "50% capital gains inclusion" : "$0 needed this year",
      })}
      ${
        showCorpCol
          ? renderBlueprintCol({
              variant: "corp",
              icon: "🏢",
              title: isCouple ? "Co-Owned Corp" : "Private Corp",
              titleColor: "var(--corp-color)",
              amountText: formatCurrency(corp),
              noteText:
                corp > 0
                  ? isCouple
                    ? "Tax-free CDA + 50/50 split divs"
                    : "Tax-free CDA + CCPC dividends"
                  : "$0 distributed this year",
            })
          : ""
      }
      ${renderBlueprintCol({
        variant: "tfsa",
        icon: "🟢",
        title: isCouple ? "Dual TFSAs" : "TFSA",
        titleColor: "var(--tfsa-color)",
        amountText: formatCurrency(record.tfsaGrossDraw),
        noteText: record.tfsaGrossDraw > 0 ? "100% tax-free buffer" : "Kept compounding tax-free",
      })}
      ${renderBlueprintCol({
        variant: "net",
        icon: "💰",
        title: "Net Cash Received",
        titleColor: "#10b981",
        amountText: formatCurrency(record.netSpendReceived),
        amountColor: "#10b981",
        noteText:
          record.guaranteedGross > 0
            ? `${formatCurrency(record.guaranteedNet)} pensions + ${formatCurrency(record.portfolioNetDraw)} portfolio`
            : `After paying ${formatCurrency(record.totalTax)} in tax`,
      })}
    </div>
  `;
}

export function getStrategyWithdrawalExplanation(
  strat: DecumulationStrategy,
  isCouple: boolean,
  hasCorp = false
): string {
  const corpPhrase = hasCorp
    ? isCouple
      ? ", <strong>2-Person Co-Owned Corp</strong> (50% tax-free CDA + 50/50 split dividends with 1.15× gross-up check),"
      : ", <strong>Private Corp</strong> (50% tax-free CDA + CCPC dividends),"
    : "";

  if (strat === "oasShield") {
    return isCouple
      ? `<strong>The OAS Shield Formula:</strong> Withdraw from your Joint RRSP/RRIF up to <strong>$176,000/yr combined</strong> ($88,000 per spouse via CRA Form T1032 pension income splitting). This keeps both spouses below the ~$91,000 OAS clawback line. Shortfall is bridged from your <strong>Personal Account (PI)</strong>${corpPhrase} and your <strong>TFSA</strong> (100% tax-free).`
      : `<strong>The OAS Shield Formula:</strong> Withdraw from RRSP up to <strong>$88,000/yr</strong> to stay just below the ~$91,000 OAS clawback line. Shortfalls are bridged from your <strong>Personal Account (PI)</strong>${corpPhrase} and your <strong>TFSA</strong> (tax-free).`;
  }
  if (strat === "rrspMeltdown") {
    return isCouple
      ? `<strong>Early RRSP Meltdown Formula:</strong> Draw aggressively from RRSPs (up to <strong>$180,000/yr combined</strong>) between retirement and age 71. This shrinks your future RRIF balance to dismantle the "tax bomb" when CRA mandatory minimums take effect at age 71. If after-tax proceeds are below your ${formatCurrency(state.retireNetSpending)} target, take the remaining from PI${hasCorp ? ", Co-Owned Corp," : ""} then TFSA.`
      : `<strong>Early RRSP Meltdown Formula:</strong> Draw up to <strong>$105,000/yr</strong> from your RRSP before age 71 to burn down the tax-deferred balance before forced CRA minimums begin. Supplement with PI${hasCorp ? ", Corp," : ""} and TFSA if needed.`;
  }
  if (strat === "taxableFirst") {
    return `<strong>Taxable (PI${hasCorp ? " & Corp" : ""}) First Formula:</strong> Withdraw spending from your <strong>Personal Investment (PI)</strong>${hasCorp ? " and <strong>Co-Owned Private Corp (CDA + dividends)</strong>" : ""} first until exhausted. During this time, take <strong>$0 from RRSP</strong> (until mandatory RRIF minimums start at age 71) and <strong>$0 from TFSA</strong>, allowing tax-sheltered accounts to compound untouched.`;
  }
  return `<strong>Proportional Balanced Draw Formula:</strong> Withdraw simultaneously across RRSP, Personal Account${hasCorp ? ", Co-Owned Corp," : ""} and TFSA based on their current balance weights. Each account pays its proportional share toward your ${formatCurrency(state.retireNetSpending)} after-tax spending goal.`;
}

export function renderWithdrawalBlueprintCard(
  currentStrat: StrategyResult,
  isCouple: boolean,
  hasCorp: boolean
): string {
  const retireHistory = currentStrat.history.filter((d) => d.age >= state.retireAge);
  const minAge = state.retireAge;
  const maxAge =
    retireHistory.length > 0 ? retireHistory[retireHistory.length - 1].age : state.retireAge;

  let selectedAge = state.blueprintSelectedAge ?? state.retireAge;
  if (selectedAge < minAge) selectedAge = minAge;
  if (selectedAge > maxAge) selectedAge = maxAge;
  state.blueprintSelectedAge = selectedAge;

  const record =
    retireHistory.find((d) => d.age === selectedAge) ||
    retireHistory[0] ||
    currentStrat.history[0];
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
        ${renderBlueprintDynamicDetails(record, selectedAge, isCouple, hasCorp)}
      </div>

      <div class="blueprint-explanation">
        ${getStrategyWithdrawalExplanation(state.decumStrategy, isCouple, hasCorp)}
      </div>
    </article>
  `;
}

function bindEnablePensionsInlineButton(cb: AppRenderCallbacks): void {
  document.getElementById("btn-enable-pensions-inline")?.addEventListener("click", () => {
    state.includeOtherIncome = true;
    state.otherIncomeExpanded = true;
    cb.renderControlsPanel();
    cb.updateResultsOnly();
    const pensionCard = document.getElementById("pension-income-card");
    if (pensionCard) {
      pensionCard.scrollIntoView({ behavior: "smooth", block: "center" });
      pensionCard.classList.add("highlight-pulse");
      setTimeout(() => pensionCard.classList.remove("highlight-pulse"), 2000);
    }
  });
}

/**
 * Synchronizes the Blueprint Age Explorer UI to a target age without re-rendering the full results panel
 */
export function setBlueprintAge(
  age: number,
  currentStrat: StrategyResult,
  isCouple: boolean,
  cb?: AppRenderCallbacks
): void {
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

  const sliderBlueprintAge = document.getElementById(
    "slider-blueprint-age"
  ) as HTMLInputElement | null;
  if (sliderBlueprintAge && parseInt(sliderBlueprintAge.value, 10) !== validAge) {
    sliderBlueprintAge.value = validAge.toString();
  }

  document.querySelectorAll<HTMLButtonElement>(".age-chip").forEach((chip) => {
    const chipAge = parseInt(chip.dataset.age || "", 10);
    chip.classList.toggle("active", chipAge === validAge);
  });

  const hasCorp =
    currentStrat.terminalBalanceAtRetirement.corp > 0 ||
    currentStrat.history.some((d) => d.corpEnd > 0);
  const blueprintDetails = document.getElementById("blueprint-dynamic-details");
  if (blueprintDetails) {
    blueprintDetails.innerHTML = renderBlueprintDynamicDetails(rec, validAge, isCouple, hasCorp);
    if (cb) {
      bindEnablePensionsInlineButton(cb);
    }
  }
}

export function attachBlueprintListeners(
  currentStrat: StrategyResult,
  isCouple: boolean,
  cb: AppRenderCallbacks
): void {
  const sliderBlueprintAge = document.getElementById(
    "slider-blueprint-age"
  ) as HTMLInputElement | null;
  sliderBlueprintAge?.addEventListener("input", (e) => {
    const age = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(age)) {
      setBlueprintAge(age, currentStrat, isCouple, cb);
    }
  });

  document.querySelectorAll<HTMLButtonElement>(".age-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const age = parseInt(chip.dataset.age || "", 10);
      if (!isNaN(age)) {
        setBlueprintAge(age, currentStrat, isCouple, cb);
      }
    });
  });

  bindEnablePensionsInlineButton(cb);
}

