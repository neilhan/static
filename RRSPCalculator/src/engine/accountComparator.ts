import {
  calcCorpDistributionTaxInfo,
  calcGrossCorpWithdrawal,
  calcGrossNonRegWithdrawal,
  calcGrossRRSPWithdrawal,
  calculateCoupleTax,
  calculateOntarioIncomeTax,
  getRRIFMinFactor,
} from "./taxRules";
import { FullSimulationComparison, SimulationParams, YearRecord } from "./types";

/**
 * Run standard isolated account comparisons (RRSP vs PI vs Co-Owned Corp vs TFSA)
 * Supports Single and Couple Modes
 */
export function runSimulation(params: SimulationParams): FullSimulationComparison {
  const {
    householdMode = "single",
    annualSaving,
    mode,
    reinvestRefund,
    yearsAccumulation,
    retireAge,
    person2RetireAge = retireAge,
    retireNetSpending,
    workTaxRate,
    person2WorkTaxRate = workTaxRate * 0.75,
    growthRatePreTax,
    taxDrag,
    retireGrowthRate,
    enableIncomeSplitting = true,
  } = params;

  const currentAge1 = Math.max(18, retireAge - yearsAccumulation);
  const currentAge2 = Math.max(18, person2RetireAge - yearsAccumulation);

  const rrspAnnualLimit = householdMode === "couple" ? 32490 * 2 : 32490;
  const exceedsRrspLimit = annualSaving > rrspAnnualLimit;

  const effectiveWorkMTR =
    householdMode === "couple" ? (workTaxRate + person2WorkTaxRate) / 2 : workTaxRate;

  // Ontario CCPC Small Business Deduction (SBD) Corporate Tax Rate (9% Fed + 3.2% ON = 12.2%)
  const ccpcSbdTaxRate = 0.122;

  let rrspAnnualContrib = 0;
  let nonRegAnnualContrib = 0;
  let corpAnnualContrib = 0;
  let tfsaAnnualContrib = 0;
  let annualRefundReceived = 0;
  let rrspOutofPocketTotal = 0;
  let nonRegOutofPocketTotal = 0;
  let corpOutofPocketTotal = 0;

  if (mode === "preTax") {
    rrspAnnualContrib = annualSaving;
    rrspOutofPocketTotal = annualSaving * yearsAccumulation;

    nonRegAnnualContrib = annualSaving * (1 - effectiveWorkMTR);
    nonRegOutofPocketTotal = nonRegAnnualContrib * yearsAccumulation;

    corpAnnualContrib = annualSaving * (1 - ccpcSbdTaxRate);
    corpOutofPocketTotal = corpAnnualContrib * yearsAccumulation;

    tfsaAnnualContrib = annualSaving * (1 - effectiveWorkMTR);
  } else {
    nonRegAnnualContrib = annualSaving;
    nonRegOutofPocketTotal = annualSaving * yearsAccumulation;
    corpAnnualContrib = annualSaving;
    corpOutofPocketTotal = annualSaving * yearsAccumulation;
    tfsaAnnualContrib = annualSaving;

    if (reinvestRefund) {
      const grossUp = annualSaving / (1 - effectiveWorkMTR);
      rrspAnnualContrib = grossUp;
      rrspOutofPocketTotal = annualSaving * yearsAccumulation;
    } else {
      rrspAnnualContrib = annualSaving;
      annualRefundReceived = annualSaving * effectiveWorkMTR;
      rrspOutofPocketTotal = annualSaving * yearsAccumulation;
    }
  }

  const rrspAccHistory: YearRecord[] = [];
  const nonRegAccHistory: YearRecord[] = [];
  const corpAccHistory: YearRecord[] = [];
  const tfsaAccHistory: YearRecord[] = [];

  let rrspBal = 0;
  let nonRegBal = 0;
  let corpBal = 0;
  let tfsaBal = 0;
  let totalNonRegCostBasis = 0;
  let totalCorpCostBasis = 0;

  if (params.startAtRetirement && params.startingRetirementAssets) {
    const startAssets = params.startingRetirementAssets;
    const p1R = Math.max(
      0,
      startAssets.person1Rrsp ??
        (householdMode === "couple" ? startAssets.rrsp * 0.5 : startAssets.rrsp)
    );
    const p2R =
      householdMode === "couple"
        ? Math.max(0, startAssets.person2Rrsp ?? startAssets.rrsp * 0.5)
        : 0;
    const rTotal = householdMode === "couple" ? p1R + p2R : p1R;
    const piTotal = Math.max(0, startAssets.pi);
    const corpTotal = Math.max(0, startAssets.corp ?? 0);
    const tfsaTotal = Math.max(0, startAssets.tfsa);
    const combinedStart = rTotal + piTotal + corpTotal + tfsaTotal;
    const gainPct = Math.min(95, Math.max(0, startAssets.piUnrealizedGainPct ?? 50)) / 100;
    const corpGainPct = Math.min(95, Math.max(0, startAssets.corpUnrealizedGainPct ?? 50)) / 100;

    if (params.comparatorUseBreakdown) {
      rrspBal = rTotal;
      nonRegBal = piTotal;
      corpBal = corpTotal;
      tfsaBal = tfsaTotal;
      totalNonRegCostBasis = piTotal * (1 - gainPct);
      totalCorpCostBasis = corpTotal * (1 - corpGainPct);
      rrspOutofPocketTotal = rTotal;
      nonRegOutofPocketTotal = totalNonRegCostBasis;
      corpOutofPocketTotal = totalCorpCostBasis;
    } else {
      rrspBal = combinedStart;
      nonRegBal = combinedStart;
      corpBal = combinedStart;
      tfsaBal = combinedStart;
      totalNonRegCostBasis = combinedStart * (1 - gainPct);
      totalCorpCostBasis = combinedStart * (1 - corpGainPct);
      rrspOutofPocketTotal = combinedStart;
      nonRegOutofPocketTotal = totalNonRegCostBasis;
      corpOutofPocketTotal = totalCorpCostBasis;
    }
    annualRefundReceived = 0;
  } else {
    const accumulateAccount = (
      annualContrib: number,
      rate: number,
      outHistory: YearRecord[]
    ): number => {
      let bal = 0;
      for (let y = 1; y <= yearsAccumulation; y++) {
        const start = bal;
        const growth = (start + annualContrib) * rate;
        bal = start + annualContrib + growth;
        outHistory.push({
          year: y,
          age: currentAge1 + y - 1,
          person2Age: householdMode === "couple" ? currentAge2 + y - 1 : undefined,
          startBalance: Math.round(start),
          contribution: Math.round(annualContrib),
          growth: Math.round(growth),
          withdrawalGross: 0,
          taxPaid: 0,
          withdrawalNet: 0,
          endBalance: Math.round(bal),
        });
      }
      return bal;
    };

    rrspBal = accumulateAccount(rrspAnnualContrib, growthRatePreTax, rrspAccHistory);
    totalNonRegCostBasis = nonRegAnnualContrib * yearsAccumulation;
    nonRegBal = accumulateAccount(
      nonRegAnnualContrib,
      Math.max(0, growthRatePreTax - taxDrag),
      nonRegAccHistory
    );
    totalCorpCostBasis = corpAnnualContrib * yearsAccumulation;
    corpBal = accumulateAccount(
      corpAnnualContrib,
      Math.max(0, growthRatePreTax - taxDrag * 0.9),
      corpAccHistory
    );
    tfsaBal = accumulateAccount(tfsaAnnualContrib, growthRatePreTax, tfsaAccHistory);
  }

  // Decumulation Phase
  const baseRrspDecum = calcGrossRRSPWithdrawal(
    retireNetSpending,
    householdMode,
    retireAge,
    person2RetireAge,
    enableIncomeSplitting
  );

  const singleBaselineDecum = calcGrossRRSPWithdrawal(retireNetSpending, "single", retireAge);
  const couplesTaxAdvantageAnnual =
    householdMode === "couple" ? Math.max(0, singleBaselineDecum.tax - baseRrspDecum.tax) : 0;

  const rrspDecumHistory: YearRecord[] = [];
  let rrspDrawBal = rrspBal;
  let rrspYears = 0;
  const maxRetireYears = 55;
  let rrspPerpetual = false;
  let firstRRIFForcedAge: number | null = null;
  let totalRRIFSurplus = 0;

  const oasThreshold = householdMode === "couple" ? 91000 * 2 : 91000;

  for (let y = 1; y <= maxRetireYears; y++) {
    if (rrspDrawBal <= 0) break;
    const age1 = retireAge + y - 1;
    const age2 = person2RetireAge + y - 1;
    const start = rrspDrawBal;
    const growth = start * retireGrowthRate;

    const minAge = Math.min(age1, age2);
    const rrifFactor = getRRIFMinFactor(householdMode === "couple" ? minAge : age1);
    const rrifMinGross = rrifFactor > 0 ? Math.round(start * rrifFactor) : 0;
    const isRRIFForced = rrifMinGross > baseRrspDecum.gross;
    if (isRRIFForced && firstRRIFForcedAge === null) {
      firstRRIFForcedAge = age1;
    }

    const neededGross = Math.max(baseRrspDecum.gross, rrifMinGross);
    const actualGrossDraw = Math.min(start + growth, neededGross);

    const taxRes =
      householdMode === "couple"
        ? calculateCoupleTax(actualGrossDraw, age1, age2, enableIncomeSplitting)
        : { totalTax: calculateOntarioIncomeTax(actualGrossDraw, age1 >= 65) };

    const actualTax = Math.round(taxRes.totalTax);
    const netReceived = Math.max(0, actualGrossDraw - actualTax);
    const surplusNet = Math.max(0, netReceived - retireNetSpending);
    totalRRIFSurplus += surplusNet;

    rrspDrawBal = Math.max(0, start + growth - actualGrossDraw);

    rrspDecumHistory.push({
      year: y,
      age: age1,
      person2Age: householdMode === "couple" ? age2 : undefined,
      startBalance: Math.round(start),
      contribution: 0,
      growth: Math.round(growth),
      withdrawalGross: Math.round(actualGrossDraw),
      taxPaid: actualTax,
      withdrawalNet: Math.round(netReceived),
      endBalance: Math.round(rrspDrawBal),
      isRRIFForced,
      rrifMinGross: rrifMinGross > 0 ? rrifMinGross : undefined,
      surplusNet: surplusNet > 0 ? surplusNet : undefined,
    });

    if (actualGrossDraw >= baseRrspDecum.gross) {
      rrspYears += 1;
    } else {
      rrspYears += actualGrossDraw / baseRrspDecum.gross;
      break;
    }

    if (y >= 40 && rrspDrawBal >= rrspBal && !isRRIFForced) {
      rrspPerpetual = true;
      rrspYears = 55;
      break;
    }
  }

  // Non-Reg Decumulation
  const initialGainRatio =
    nonRegBal > 0 ? Math.max(0, (nonRegBal - totalNonRegCostBasis) / nonRegBal) : 0;
  const nonRegDecum = calcGrossNonRegWithdrawal(
    retireNetSpending,
    initialGainRatio,
    householdMode,
    retireAge,
    person2RetireAge
  );
  const nonRegDecumHistory: YearRecord[] = [];
  let nonRegDrawBal = nonRegBal;
  let nonRegYears = 0;
  const nonRegRetireRate = retireGrowthRate * 0.85;
  let nonRegPerpetual = false;

  for (let y = 1; y <= maxRetireYears; y++) {
    if (nonRegDrawBal <= 0) break;
    const age1 = retireAge + y - 1;
    const age2 = person2RetireAge + y - 1;
    const start = nonRegDrawBal;
    const growth = start * nonRegRetireRate;
    const actualGrossDraw = Math.min(start + growth, nonRegDecum.gross);

    const tax =
      householdMode === "couple"
        ? calculateCoupleTax(actualGrossDraw * initialGainRatio * 0.5, age1, age2, true).totalTax
        : calculateOntarioIncomeTax(actualGrossDraw * initialGainRatio * 0.5, age1 >= 65);

    const net = actualGrossDraw - tax;
    nonRegDrawBal = Math.max(0, start + growth - actualGrossDraw);

    nonRegDecumHistory.push({
      year: y,
      age: age1,
      person2Age: householdMode === "couple" ? age2 : undefined,
      startBalance: Math.round(start),
      contribution: 0,
      growth: Math.round(growth),
      withdrawalGross: Math.round(actualGrossDraw),
      taxPaid: Math.round(tax),
      withdrawalNet: Math.round(net),
      endBalance: Math.round(nonRegDrawBal),
    });

    if (actualGrossDraw >= nonRegDecum.gross) {
      nonRegYears += 1;
    } else {
      nonRegYears += actualGrossDraw / nonRegDecum.gross;
      break;
    }

    if (y >= 40 && nonRegDrawBal >= nonRegBal) {
      nonRegPerpetual = true;
      nonRegYears = 55;
      break;
    }
  }

  // Co-Owned Corporation (CCPC / HoldCo) Decumulation
  const initialCorpGainRatio =
    corpBal > 0 ? Math.max(0, (corpBal - totalCorpCostBasis) / corpBal) : 0;
  const corpDecum = calcGrossCorpWithdrawal(
    retireNetSpending,
    initialCorpGainRatio,
    householdMode,
    retireAge,
    person2RetireAge,
    enableIncomeSplitting
  );
  const corpDecumHistory: YearRecord[] = [];
  let corpDrawBal = corpBal;
  let corpYears = 0;
  const corpRetireRate = retireGrowthRate * 0.88;
  let corpPerpetual = false;

  for (let y = 1; y <= maxRetireYears; y++) {
    if (corpDrawBal <= 0) break;
    const age1 = retireAge + y - 1;
    const age2 = person2RetireAge + y - 1;
    const start = corpDrawBal;
    const growth = start * corpRetireRate;
    const actualGrossDraw = Math.min(start + growth, corpDecum.gross);

    const distInfo = calcCorpDistributionTaxInfo(actualGrossDraw, initialCorpGainRatio);
    let tax = 0;
    if (householdMode === "couple" && enableIncomeSplitting) {
      const halfGrossed = distInfo.grossedUpDividend * 0.5;
      const halfDtc = distInfo.dividendTaxCredit * 0.5;
      tax =
        Math.max(0, calculateOntarioIncomeTax(halfGrossed, age1 >= 65) - halfDtc) +
        Math.max(0, calculateOntarioIncomeTax(halfGrossed, age2 >= 65) - halfDtc);
    } else {
      tax = Math.max(
        0,
        calculateOntarioIncomeTax(distInfo.grossedUpDividend, age1 >= 65) -
          distInfo.dividendTaxCredit
      );
    }

    const net = actualGrossDraw - tax;
    corpDrawBal = Math.max(0, start + growth - actualGrossDraw);

    corpDecumHistory.push({
      year: y,
      age: age1,
      person2Age: householdMode === "couple" ? age2 : undefined,
      startBalance: Math.round(start),
      contribution: 0,
      growth: Math.round(growth),
      withdrawalGross: Math.round(actualGrossDraw),
      taxPaid: Math.round(tax),
      withdrawalNet: Math.round(net),
      endBalance: Math.round(corpDrawBal),
    });

    if (actualGrossDraw >= corpDecum.gross) {
      corpYears += 1;
    } else {
      corpYears += actualGrossDraw / corpDecum.gross;
      break;
    }

    if (y >= 40 && corpDrawBal >= corpBal) {
      corpPerpetual = true;
      corpYears = 55;
      break;
    }
  }

  // TFSA Decumulation
  const tfsaDecumGross = retireNetSpending;
  const tfsaDecumHistory: YearRecord[] = [];
  let tfsaDrawBal = tfsaBal;
  let tfsaYears = 0;
  let tfsaPerpetual = false;

  for (let y = 1; y <= maxRetireYears; y++) {
    if (tfsaDrawBal <= 0) break;
    const age1 = retireAge + y - 1;
    const age2 = person2RetireAge + y - 1;
    const start = tfsaDrawBal;
    const growth = start * retireGrowthRate;
    const actualGrossDraw = Math.min(start + growth, tfsaDecumGross);
    tfsaDrawBal = Math.max(0, start + growth - actualGrossDraw);

    tfsaDecumHistory.push({
      year: y,
      age: age1,
      person2Age: householdMode === "couple" ? age2 : undefined,
      startBalance: Math.round(start),
      contribution: 0,
      growth: Math.round(growth),
      withdrawalGross: Math.round(actualGrossDraw),
      taxPaid: 0,
      withdrawalNet: Math.round(actualGrossDraw),
      endBalance: Math.round(tfsaDrawBal),
    });

    if (actualGrossDraw >= tfsaDecumGross) {
      tfsaYears += 1;
    } else {
      tfsaYears += actualGrossDraw / tfsaDecumGross;
      break;
    }

    if (y >= 40 && tfsaDrawBal >= tfsaBal) {
      tfsaPerpetual = true;
      tfsaYears = 55;
      break;
    }
  }

  const corpGrossedUpAnnual = calcCorpDistributionTaxInfo(
    corpDecum.gross,
    initialCorpGainRatio
  ).grossedUpDividend;

  return {
    params,
    exceedsRrspLimit,
    rrspAnnualLimit,
    rrsp: {
      accountName: householdMode === "couple" ? "Couple's Joint RRSP / RRIF" : "RRSP / RRIF",
      terminalBalance: Math.round(rrspBal),
      totalOutofPocketCost: Math.round(rrspOutofPocketTotal),
      totalTaxRefundsReceived: Math.round(annualRefundReceived * yearsAccumulation),
      annualGrossWithdrawalNeeded: baseRrspDecum.gross,
      annualRetirementTaxPaid: baseRrspDecum.tax,
      longevityYears: Math.round(rrspYears * 10) / 10,
      isPerpetual: rrspPerpetual,
      oasClawbackRisk: baseRrspDecum.gross >= oasThreshold,
      firstRRIFForcedAge,
      totalRRIFSurplusCash: Math.round(totalRRIFSurplus),
      couplesTaxAdvantageAnnual: Math.round(couplesTaxAdvantageAnnual),
      accumulationHistory: rrspAccHistory,
      decumulationHistory: rrspDecumHistory,
    },
    nonReg: {
      accountName:
        householdMode === "couple"
          ? "Couple's Personal Account (Joint PI)"
          : "Personal Investment (Taxable Non-Registered)",
      terminalBalance: Math.round(nonRegBal),
      totalOutofPocketCost: Math.round(nonRegOutofPocketTotal),
      totalTaxRefundsReceived: 0,
      annualGrossWithdrawalNeeded: nonRegDecum.gross,
      annualRetirementTaxPaid: nonRegDecum.tax,
      longevityYears: Math.round(nonRegYears * 10) / 10,
      isPerpetual: nonRegPerpetual,
      oasClawbackRisk: false,
      firstRRIFForcedAge: null,
      totalRRIFSurplusCash: 0,
      accumulationHistory: nonRegAccHistory,
      decumulationHistory: nonRegDecumHistory,
    },
    corp: {
      accountName:
        householdMode === "couple"
          ? "Couple's Co-Owned Corp (CCPC / HoldCo)"
          : "Private Corp (CCPC / HoldCo)",
      terminalBalance: Math.round(corpBal),
      totalOutofPocketCost: Math.round(corpOutofPocketTotal),
      totalTaxRefundsReceived: 0,
      annualGrossWithdrawalNeeded: corpDecum.gross,
      annualRetirementTaxPaid: corpDecum.tax,
      longevityYears: Math.round(corpYears * 10) / 10,
      isPerpetual: corpPerpetual,
      oasClawbackRisk: corpGrossedUpAnnual >= oasThreshold,
      firstRRIFForcedAge: null,
      totalRRIFSurplusCash: 0,
      accumulationHistory: corpAccHistory,
      decumulationHistory: corpDecumHistory,
    },
    tfsa: {
      accountName:
        householdMode === "couple" ? "Couple's Combined TFSAs" : "TFSA (Tax-Free Savings Account)",
      terminalBalance: Math.round(tfsaBal),
      totalOutofPocketCost: Math.round(nonRegOutofPocketTotal),
      totalTaxRefundsReceived: 0,
      annualGrossWithdrawalNeeded: tfsaDecumGross,
      annualRetirementTaxPaid: 0,
      longevityYears: Math.round(tfsaYears * 10) / 10,
      isPerpetual: tfsaPerpetual,
      oasClawbackRisk: false,
      firstRRIFForcedAge: null,
      totalRRIFSurplusCash: 0,
      accumulationHistory: tfsaAccHistory,
      decumulationHistory: tfsaDecumHistory,
    },
  };
}

