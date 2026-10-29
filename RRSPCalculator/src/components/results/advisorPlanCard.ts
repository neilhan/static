import { StrategyResult } from "../../calculator";
import { formatCurrency } from "../../formatters";
import { state } from "../../state";

/**
 * Tailored 3-Step Household Action Plan Card
 */
export function renderAdvisorPlanCard(
  currentStrat: StrategyResult,
  isCouple: boolean,
  hasCorp: boolean
): string {
  const currentAge1 = Math.max(18, state.retireAge - state.yearsAccumulation);
  const currentAge2 = Math.max(18, state.person2RetireAge - state.yearsAccumulation);

  const p1Rrsp = currentStrat.person1RrspSaving ?? state.p1RrspSaving;
  const p2Rrsp = isCouple ? (currentStrat.person2RrspSaving ?? state.p2RrspSaving) : 0;
  const piDollars = currentStrat.piSaving ?? state.piSaving;
  const corpDollars = currentStrat.corpSaving ?? state.corpSaving;
  const refundDollars =
    currentStrat.annualTaxRefund ??
    Math.round(p1Rrsp * state.workTaxRate + p2Rrsp * state.person2WorkTaxRate);
  const tb = currentStrat.terminalBalanceAtRetirement;

  return `
    <article class="advisor-card">
      <div class="advisor-title">
        <span>💡</span> ${isCouple ? "Your Custom 2-Person Household Action Plan" : "Your Custom Tailored Strategy Action Plan"}
      </div>
      <div class="advisor-steps">
        <div class="advisor-step">
          <div class="step-num">1</div>
          <div class="step-content">
            ${
              state.startAtRetirement
                ? isCouple
                  ? `<strong>Starting Point at Retirement (Ages ${state.retireAge} & ${state.person2RetireAge}):</strong> Your household enters retirement with <strong>${formatCurrency(tb.total)}</strong> combined wealth: <strong>${formatCurrency(tb.person1Rrsp ?? Math.round(tb.rrsp * 0.5))}</strong> in Person 1 RRSP, <strong>${formatCurrency(tb.person2Rrsp ?? Math.round(tb.rrsp * 0.5))}</strong> in Person 2 RRSP, <strong>${formatCurrency(tb.pi)}</strong> in Personal Account (PI)${tb.corp > 0 ? `, <strong>${formatCurrency(tb.corp)}</strong> in your 2-Person Co-Owned Corp (CCPC)` : ""}, and <strong>${formatCurrency(tb.tfsa)}</strong> in Dual TFSAs.`
                  : `<strong>Starting Point at Retirement (Age ${state.retireAge}):</strong> You enter retirement with <strong>${formatCurrency(tb.total)}</strong> total wealth, broken down into <strong>${formatCurrency(tb.rrsp)}</strong> in RRSP/RRIF, <strong>${formatCurrency(tb.pi)}</strong> in your Personal Account (PI)${tb.corp > 0 ? `, <strong>${formatCurrency(tb.corp)}</strong> in your Private Corp` : ""}, and <strong>${formatCurrency(tb.tfsa)}</strong> in your TFSA.`
                : isCouple
                ? `<strong>Working Years (Ages ${currentAge1} & ${currentAge2}):</strong> Save <strong>${formatCurrency(state.annualSaving)}/year combined</strong>. Contribute <strong>${formatCurrency(p1Rrsp)}</strong> to Person 1 RRSP, <strong>${formatCurrency(p2Rrsp)}</strong> to Person 2 RRSP, <strong>${formatCurrency(piDollars)}</strong> to Personal (PI)${corpDollars > 0 ? `, and retain <strong>${formatCurrency(corpDollars)}</strong> inside your <strong>2-Person Co-Owned Corp (CCPC)</strong>` : ""}. Reinvest your <strong>${formatCurrency(refundDollars)} refund into ${state.reinvestRefundTo === "tfsa" ? "both TFSAs ($7k each)" : state.reinvestRefundTo === "pi" ? "Personal Account" : "spending"}</strong>.`
                : `<strong>While Working (Next ${state.yearsAccumulation} Years):</strong> Contribute <strong>${formatCurrency(p1Rrsp)}/year to your RRSP</strong>, <strong>${formatCurrency(piDollars)}/year to Personal (PI)</strong>${corpDollars > 0 ? `, and retain <strong>${formatCurrency(corpDollars)}/year inside your Private Corp</strong>` : ""}. Reinvest your annual <strong>${formatCurrency(refundDollars)} tax refund</strong> into <strong>${state.reinvestRefundTo === "tfsa" ? "TFSA" : state.reinvestRefundTo === "pi" ? "Personal Account" : "spending"}</strong>.`
            }
          </div>
        </div>
        <div class="advisor-step">
          <div class="step-num">2</div>
          <div class="step-content">
            ${
              isCouple
                ? `<strong>At Retirement (Ages ${state.retireAge} & ${state.person2RetireAge}):</strong> Use the <strong>"${currentStrat.name}"</strong> sequence. File <strong>CRA Form T1032</strong> to split RRIF income 50/50${hasCorp ? ", pay out <strong>100% tax-free Capital Dividend Account (CDA)</strong> balances from corporate capital gains, and split CCPC dividends 50/50" : ""}. This gives your household <strong>$182,000 of combined room</strong> before triggering OAS clawback.`
                : `<strong>At Retirement (Age ${state.retireAge} to 71):</strong> Follow the <strong>"${currentStrat.name}"</strong> decumulation rule. Draw from RRSP up to the bracket cap while bridging with your Personal Account${hasCorp ? ", Private Corp (CDA + dividends)," : ""} and TFSA.`
            }
          </div>
        </div>
        <div class="advisor-step">
          <div class="step-num">3</div>
          <div class="step-content">
            ${
              isCouple
                ? `<strong>At Age 71+:</strong> Convert RRSPs to RRIFs. <em>CRA Pro-Tip:</em> Base your mandatory RRIF minimum withdrawals on the <strong>younger spouse (Age ${Math.min(state.retireAge, state.person2RetireAge)})</strong> to legally minimize forced taxable withdrawals!`
                : `<strong>At Age 71+:</strong> Convert RRSP to a RRIF. Withdraw CRA mandated minimums and use your TFSA/PI${hasCorp ? "/Corp CDA" : ""} as a tax-efficient buffer to avoid crossing into higher tax brackets and losing your OAS pension.`
            }
          </div>
        </div>
      </div>
    </article>
  `;
}

