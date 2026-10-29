import { StrategyResult } from "../../calculator";
import { formatCurrency } from "../../formatters";
import { state } from "../../state";
import { renderBlueprintCol } from "../ui/blueprintCol";
import { BarSegmentItem, renderSegmentedBar } from "../ui/segmentedBar";
import { AppRenderCallbacks } from "../ui/types";

/**
 * Renders the Starting Point at Retirement — Asset Breakdown Summary Card in the Results Panel
 */
export function renderRetirementStartingSummaryCard(
  currentStrat: StrategyResult,
  isCouple: boolean
): string {
  const tb = currentStrat.terminalBalanceAtRetirement;
  const safeTotal = Math.max(1, tb.total);
  const p1Rrsp = tb.person1Rrsp ?? (isCouple ? Math.round(tb.rrsp * 0.5) : tb.rrsp);
  const p2Rrsp = isCouple ? (tb.person2Rrsp ?? Math.max(0, tb.rrsp - p1Rrsp)) : 0;

  const p1Pct = Math.round((p1Rrsp / safeTotal) * 100);
  const p2Pct = isCouple ? Math.round((p2Rrsp / safeTotal) * 100) : 0;
  const rrspTotalPct = Math.round((tb.rrsp / safeTotal) * 100);
  const piPct = Math.round((tb.pi / safeTotal) * 100);
  const corpPct = Math.round((tb.corp / safeTotal) * 100);
  const tfsaPct = Math.max(
    0,
    100 - (isCouple ? p1Pct + p2Pct : rrspTotalPct) - piPct - corpPct
  );

  const piCostBasis = tb.piCostBasis ?? Math.round(tb.pi * 0.5);
  const piGain = tb.piUnrealizedGain ?? Math.max(0, tb.pi - piCostBasis);
  const corpCostBasis = tb.corpCostBasis ?? Math.round(tb.corp * 0.5);
  const corpGain = tb.corpUnrealizedGain ?? Math.max(0, tb.corp - corpCostBasis);
  const corpCda = Math.round(corpGain * 0.5);
  const taxFreeCushion = tb.tfsa + piCostBasis + corpCda;

  const segments: BarSegmentItem[] = [
    {
      variant: "p1",
      pct: isCouple ? p1Pct : rrspTotalPct,
      title: `${isCouple ? "Person 1 RRSP" : "RRSP"}: ${formatCurrency(p1Rrsp)}`,
      labelHtml: `🟣 ${isCouple ? `P1 RRSP: ${formatCurrency(p1Rrsp)} (${p1Pct}%)` : `RRSP/RRIF: ${formatCurrency(tb.rrsp)} (${rrspTotalPct}%)`}`,
      labelColor: "var(--rrsp-color)",
      labelWeight: "600",
    },
    ...(isCouple
      ? [
          {
            variant: "p2",
            pct: p2Pct,
            title: `Person 2 RRSP: ${formatCurrency(p2Rrsp)}`,
            labelHtml: `🟣 P2 RRSP: ${formatCurrency(p2Rrsp)} (${p2Pct}%)`,
            labelColor: "#8b5cf6",
            labelWeight: "600",
          },
        ]
      : []),
    {
      variant: "pi",
      pct: piPct,
      title: `Personal Account (PI): ${formatCurrency(tb.pi)}`,
      labelHtml: `🟠 Personal (PI): ${formatCurrency(tb.pi)} (${piPct}%)`,
      labelColor: "var(--nonreg-color)",
      labelWeight: "600",
    },
    {
      variant: "corp",
      pct: corpPct,
      title: `Co-Owned Corp (CCPC): ${formatCurrency(tb.corp)}`,
      labelHtml: `🏢 ${isCouple ? "Co-Owned Corp" : "Corp"}: ${formatCurrency(tb.corp)} (${corpPct}%)`,
      labelColor: "var(--corp-color)",
      labelWeight: "600",
      hiddenWhenZero: true,
      isZero: tb.corp <= 0,
    },
    {
      variant: "tfsa",
      pct: tfsaPct,
      title: `TFSA: ${formatCurrency(tb.tfsa)}`,
      labelHtml: `🟢 ${isCouple ? "Dual TFSAs" : "TFSA"}: ${formatCurrency(tb.tfsa)} (${tfsaPct}%)`,
      labelColor: "var(--tfsa-color)",
      labelWeight: "600",
    },
  ];

  return `
    <article class="withdrawal-blueprint-card" style="margin-top:0;margin-bottom:0.25rem;">
      <div class="blueprint-header" style="margin-bottom:0.75rem;">
        <div>
          <div class="blueprint-title">
            <span>🏦</span> Starting Point at Retirement (Age ${state.retireAge}${isCouple ? ` & ${state.person2RetireAge}` : ""}) — Asset Breakdown
          </div>
          <div style="font-size:0.76rem;color:var(--text-secondary);margin-top:0.15rem;">
            ${
              state.startAtRetirement
                ? "Directly configured retirement nest egg & account allocation"
                : `Projected portfolio accumulated after ${state.yearsAccumulation} years of saving ${formatCurrency(state.annualSaving)}/yr`
            }
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          <span class="badge-recommended" style="background:rgba(56,189,248,0.18);color:var(--total-color);border:1px solid rgba(56,189,248,0.4);">
            Total Nest Egg: ${formatCurrency(tb.total)}
          </span>
          ${
            !state.startAtRetirement
              ? `<button type="button" id="btn-customize-retire-breakdown" class="btn-toggle-expand" style="border-color:rgba(99,102,241,0.45);color:var(--rrsp-color);font-weight:600;padding:0.25rem 0.65rem;">
                  ✏️ Customize Starting Assets
                </button>`
              : `<button type="button" id="btn-switch-to-accum" class="btn-toggle-expand" style="padding:0.25rem 0.65rem;">
                  📈 Switch to Working Years
                </button>`
          }
        </div>
      </div>

      ${renderSegmentedBar({
        segments,
        barHeightPx: 14,
        wrapperStyle: "margin:0.35rem 0 0.85rem 0;",
      })}

      <div class="blueprint-grid" style="margin-bottom:0;">
        ${renderBlueprintCol({
          variant: "rrsp",
          icon: "🟣",
          title: `${isCouple ? "Person 1 RRSP / RRIF" : "RRSP / RRIF"} (${isCouple ? p1Pct : rrspTotalPct}%)`,
          titleColor: "var(--rrsp-color)",
          amountText: formatCurrency(isCouple ? p1Rrsp : tb.rrsp),
          noteText: "100% taxable on withdrawal · Converts to RRIF at 71",
        })}
        ${
          isCouple
            ? renderBlueprintCol({
                variant: "rrsp",
                icon: "🟣",
                title: `Person 2 RRSP / Spousal (${p2Pct}%)`,
                titleColor: "#8b5cf6",
                amountText: formatCurrency(p2Rrsp),
                noteText: "Eligible for 50/50 CRA Form T1032 pension splitting",
                customStyle: "border-left-color:#8b5cf6;",
              })
            : ""
        }
        ${renderBlueprintCol({
          variant: "pi",
          icon: "🟠",
          title: `Personal Account (PI) (${piPct}%)`,
          titleColor: "var(--nonreg-color)",
          amountText: formatCurrency(tb.pi),
          noteText: `ACB Principal: ${formatCurrency(piCostBasis)} · Cap Gain: ${formatCurrency(piGain)}`,
        })}
        ${
          tb.corp > 0
            ? renderBlueprintCol({
                variant: "corp",
                icon: "🏢",
                title: `${isCouple ? "2-Person Co-Owned Corp" : "Private Corp (CCPC)"} (${corpPct}%)`,
                titleColor: "var(--corp-color)",
                amountText: formatCurrency(tb.corp),
                noteText: `Retained Basis: ${formatCurrency(corpCostBasis)} · Tax-Free CDA: ${formatCurrency(corpCda)}`,
              })
            : ""
        }
        ${renderBlueprintCol({
          variant: "tfsa",
          icon: "🟢",
          title: `${isCouple ? "Dual TFSAs" : "TFSA"} (${tfsaPct}%)`,
          titleColor: "var(--tfsa-color)",
          amountText: formatCurrency(tb.tfsa),
          noteText: `100% tax-free · Total Tax-Free Cushion: ${formatCurrency(taxFreeCushion)}`,
        })}
      </div>
    </article>
  `;
}

export function attachRetirementSummaryListeners(
  currentStrat: StrategyResult,
  isCouple: boolean,
  cb: AppRenderCallbacks
): void {
  document.getElementById("btn-customize-retire-breakdown")?.addEventListener("click", () => {
    const tb = currentStrat.terminalBalanceAtRetirement;
    if (isCouple) {
      state.retireStartP1Rrsp = tb.person1Rrsp ?? Math.round(tb.rrsp * 0.5);
      state.retireStartP2Rrsp = tb.person2Rrsp ?? Math.max(0, tb.rrsp - state.retireStartP1Rrsp);
    } else {
      state.retireStartP1Rrsp = tb.rrsp;
      state.retireStartP2Rrsp = 0;
    }
    state.retireStartPi = tb.pi;
    if (tb.pi > 0 && tb.piUnrealizedGain !== undefined) {
      state.retireStartPiGainPct = Math.min(
        95,
        Math.max(0, Math.round(((tb.piUnrealizedGain / tb.pi) * 100) / 5) * 5)
      );
    }
    state.retireStartCorp = tb.corp;
    if (tb.corp > 0 && tb.corpUnrealizedGain !== undefined) {
      state.retireStartCorpGainPct = Math.min(
        95,
        Math.max(0, Math.round(((tb.corpUnrealizedGain / tb.corp) * 100) / 5) * 5)
      );
    }
    state.retireStartTfsa = tb.tfsa;
    state.retireStartTotal = tb.total;
    state.startAtRetirement = true;
    cb.renderControlsPanel();
    cb.updateResultsOnly();
    const startCard = document.getElementById("retire-start-assets-card");
    if (startCard) {
      startCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  document.getElementById("btn-switch-to-accum")?.addEventListener("click", () => {
    state.startAtRetirement = false;
    cb.renderControlsPanel();
    cb.updateResultsOnly();
  });
}

