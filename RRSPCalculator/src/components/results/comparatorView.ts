import { FullSimulationComparison } from "../../calculator";
import { formatCurrency } from "../../formatters";
import { state } from "../../state";
import { renderAccountCompareCard } from "../ui/blueprintCol";
import { renderCouplesTaxBanner } from "./couplesBanner";

/**
 * Render Direct Account Comparison Results (RRSP vs PI vs Corp vs TFSA)
 */
export function renderComparatorResults(
  sim: FullSimulationComparison,
  isCouple: boolean
): string {
  return `
    ${
      isCouple
        ? renderCouplesTaxBanner({
            title: "🎉 Couples Income & Dividend Splitting Advantage",
            description:
              "By splitting RRIF income and CCPC corporate dividends 50/50 between two spouses, household gross withdrawals drop substantially for the same after-tax lifestyle!",
            annualSavings: sim.rrsp.couplesTaxAdvantageAnnual ?? 0,
            subLabel: "Annual Tax Saved",
          })
        : ""
    }

    <div class="comparison-grid">
      ${renderAccountCompareCard({
        cardVariant: "card-rrsp",
        badgeText: isCouple ? "Couple's Joint RRSP" : "Tax-Deferred · RRIF at 71",
        accountName: sim.rrsp.accountName,
        longevityText: sim.rrsp.isPerpetual ? "50+ Yrs" : `${sim.rrsp.longevityYears} Yrs`,
        longevitySubText: `Funds household until Age ${state.retireAge + Math.floor(sim.rrsp.longevityYears)}`,
        metrics: [
          { label: "Terminal Balance:", value: formatCurrency(sim.rrsp.terminalBalance) },
          {
            label: "Gross Draw Needed:",
            value: `${formatCurrency(sim.rrsp.annualGrossWithdrawalNeeded)}/yr`,
          },
          {
            label: "Household Tax Paid:",
            value: `${formatCurrency(sim.rrsp.annualRetirementTaxPaid)}/yr`,
          },
        ],
      })}

      ${renderAccountCompareCard({
        cardVariant: "card-nonreg",
        badgeText: "Taxable Account",
        accountName: sim.nonReg.accountName,
        longevityText: sim.nonReg.isPerpetual ? "50+ Yrs" : `${sim.nonReg.longevityYears} Yrs`,
        longevitySubText: `Depleted at Age ${state.retireAge + Math.floor(sim.nonReg.longevityYears)}`,
        metrics: [
          { label: "Terminal Balance:", value: formatCurrency(sim.nonReg.terminalBalance) },
          {
            label: "Gross Draw Needed:",
            value: `${formatCurrency(sim.nonReg.annualGrossWithdrawalNeeded)}/yr`,
          },
          {
            label: "Household Tax Paid:",
            value: `${formatCurrency(sim.nonReg.annualRetirementTaxPaid)}/yr`,
          },
        ],
      })}

      ${renderAccountCompareCard({
        cardVariant: "card-corp",
        badgeText: isCouple ? "12.2% SBD · 50/50 Divs + CDA" : "12.2% SBD · CCPC Divs + CDA",
        accountName: sim.corp.accountName,
        longevityText: sim.corp.isPerpetual ? "50+ Yrs" : `${sim.corp.longevityYears} Yrs`,
        longevitySubText: sim.corp.isPerpetual
          ? `Sustains past Age ${state.retireAge + 50}+`
          : `Funds household until Age ${state.retireAge + Math.floor(sim.corp.longevityYears)}`,
        metrics: [
          { label: "Terminal Balance:", value: formatCurrency(sim.corp.terminalBalance) },
          {
            label: "Gross Corp Payout:",
            value: `${formatCurrency(sim.corp.annualGrossWithdrawalNeeded)}/yr`,
          },
          {
            label: "Personal Dividend Tax:",
            value: `${formatCurrency(sim.corp.annualRetirementTaxPaid)}/yr`,
          },
        ],
      })}

      ${renderAccountCompareCard({
        cardVariant: "card-tfsa",
        badgeText: "Tax-Free Benchmark",
        accountName: sim.tfsa.accountName,
        longevityText: sim.tfsa.isPerpetual ? "50+ Yrs" : `${sim.tfsa.longevityYears} Yrs`,
        longevitySubText: `Funds household until Age ${state.retireAge + Math.floor(sim.tfsa.longevityYears)}`,
        metrics: [
          { label: "Terminal Balance:", value: formatCurrency(sim.tfsa.terminalBalance) },
          {
            label: "Gross Draw Needed:",
            value: `${formatCurrency(sim.tfsa.annualGrossWithdrawalNeeded)}/yr`,
          },
          { label: "Household Tax Paid:", value: "$0/yr" },
        ],
      })}
    </div>
  `;
}

