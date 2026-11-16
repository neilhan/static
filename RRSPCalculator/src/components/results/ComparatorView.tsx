import { FullSimulationComparison } from "../../calculator";
import { formatCurrency } from "../../formatters";
import { AccountCompareCard } from "../ui/BlueprintCol";
import { CouplesTaxBanner } from "./CouplesBanner";

export interface ComparatorViewProps {
  sim: FullSimulationComparison;
  retireAge: number;
  isCouple: boolean;
}

export function ComparatorView({
  sim,
  retireAge,
  isCouple,
}: ComparatorViewProps) {
  return (
    <>
      {isCouple && (
        <CouplesTaxBanner
          title="🎉 Couples Income & Dividend Splitting Advantage"
          description="By splitting RRIF income and CCPC corporate dividends 50/50 between two spouses, household gross withdrawals drop substantially for the same after-tax lifestyle!"
          annualSavings={sim.rrsp.couplesTaxAdvantageAnnual ?? 0}
          subLabel="Annual Tax Saved"
        />
      )}

      <div className="comparison-grid">
        <AccountCompareCard
          cardVariant="card-rrsp"
          badgeText={isCouple ? "Couple's Joint RRSP" : "Tax-Deferred · RRIF at 71"}
          accountName={sim.rrsp.accountName}
          longevityText={
            sim.rrsp.isPerpetual ? "50+ Yrs" : `${sim.rrsp.longevityYears} Yrs`
          }
          longevitySubText={`Funds household until Age ${retireAge + Math.floor(sim.rrsp.longevityYears)}`}
          metrics={[
            { label: "Terminal Balance:", value: formatCurrency(sim.rrsp.terminalBalance) },
            {
              label: "Gross Draw Needed:",
              value: `${formatCurrency(sim.rrsp.annualGrossWithdrawalNeeded)}/yr`,
            },
            {
              label: "Household Tax Paid:",
              value: `${formatCurrency(sim.rrsp.annualRetirementTaxPaid)}/yr`,
            },
          ]}
        />

        <AccountCompareCard
          cardVariant="card-nonreg"
          badgeText="Taxable Account"
          accountName={sim.nonReg.accountName}
          longevityText={
            sim.nonReg.isPerpetual ? "50+ Yrs" : `${sim.nonReg.longevityYears} Yrs`
          }
          longevitySubText={`Depleted at Age ${retireAge + Math.floor(sim.nonReg.longevityYears)}`}
          metrics={[
            { label: "Terminal Balance:", value: formatCurrency(sim.nonReg.terminalBalance) },
            {
              label: "Gross Draw Needed:",
              value: `${formatCurrency(sim.nonReg.annualGrossWithdrawalNeeded)}/yr`,
            },
            {
              label: "Household Tax Paid:",
              value: `${formatCurrency(sim.nonReg.annualRetirementTaxPaid)}/yr`,
            },
          ]}
        />

        <AccountCompareCard
          cardVariant="card-corp"
          badgeText={
            isCouple ? "12.2% SBD · 50/50 Divs + CDA" : "12.2% SBD · CCPC Divs + CDA"
          }
          accountName={sim.corp.accountName}
          longevityText={
            sim.corp.isPerpetual ? "50+ Yrs" : `${sim.corp.longevityYears} Yrs`
          }
          longevitySubText={
            sim.corp.isPerpetual
              ? `Sustains past Age ${retireAge + 50}+`
              : `Funds household until Age ${retireAge + Math.floor(sim.corp.longevityYears)}`
          }
          metrics={[
            { label: "Terminal Balance:", value: formatCurrency(sim.corp.terminalBalance) },
            {
              label: "Gross Corp Payout:",
              value: `${formatCurrency(sim.corp.annualGrossWithdrawalNeeded)}/yr`,
            },
            {
              label: "Personal Dividend Tax:",
              value: `${formatCurrency(sim.corp.annualRetirementTaxPaid)}/yr`,
            },
          ]}
        />

        <AccountCompareCard
          cardVariant="card-tfsa"
          badgeText="Tax-Free Benchmark"
          accountName={sim.tfsa.accountName}
          longevityText={
            sim.tfsa.isPerpetual ? "50+ Yrs" : `${sim.tfsa.longevityYears} Yrs`
          }
          longevitySubText={`Funds household until Age ${retireAge + Math.floor(sim.tfsa.longevityYears)}`}
          metrics={[
            { label: "Terminal Balance:", value: formatCurrency(sim.tfsa.terminalBalance) },
            {
              label: "Gross Draw Needed:",
              value: `${formatCurrency(sim.tfsa.annualGrossWithdrawalNeeded)}/yr`,
            },
            { label: "Household Tax Paid:", value: "$0/yr" },
          ]}
        />
      </div>
    </>
  );
}
