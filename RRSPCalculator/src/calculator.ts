/**
 * Canadian Tax & Retirement Mathematical Engine
 * Comprehensive Portfolio Strategy Simulator & Account Comparison:
 * - Single Individual vs. Couple (2 Persons / Spousal Planning)
 * - Pension Income Splitting (CRA Form T1032, Age 65+)
 * - Dual Basic Personal Amounts & Age/Pension Credits
 * - Dual OAS Clawback Shields ($91k x 2 = $182k)
 * - RRSP / RRIF with CRA Mandatory Age 71+ Minimums
 * - Personal Investment (Taxable Non-Registered with 50% Capital Gains Inclusion)
 * - TFSA (Tax-Free Savings Account)
 */

export type HouseholdMode = "single" | "couple";

export interface SimulationParams {
  householdMode: HouseholdMode;
  annualSaving: number;
  mode: "preTax" | "cashOut";
  reinvestRefund: boolean;
  yearsAccumulation: number;
  retireAge: number; // Person 1 retirement age
  person2RetireAge?: number; // Person 2 retirement age (for couples)
  retireNetSpending: number;
  workTaxRate: number; // Person 1 MTR (e.g. 0.43)
  person2WorkTaxRate?: number; // Person 2 MTR (e.g. 0.30)
  growthRatePreTax: number;
  taxDrag: number;
  retireGrowthRate: number;
  enableIncomeSplitting?: boolean; // default true (age 65+)
}

export type DecumulationStrategy =
  | "oasShield"      // Cap RRSP draw below OAS threshold, bridge with PI/TFSA
  | "rrspMeltdown"   // Aggressively draw RRSP between retireAge and 71
  | "taxableFirst"   // Exhaust taxable PI first, let RRSP/TFSA compound longer
  | "proRata";       // Draw proportionally across all accounts

export interface StrategySimulationParams {
  householdMode: HouseholdMode;
  annualSaving: number;
  yearsAccumulation: number;
  retireAge: number;
  person2RetireAge?: number;
  retireNetSpending: number;
  workTaxRate: number;
  person2WorkTaxRate?: number;
  growthRatePreTax: number;
  taxDrag: number;
  retireGrowthRate: number;
  enableIncomeSplitting?: boolean;
  // Allocation in accumulation
  rrspPct: number;
  piPct: number;
  tfsaPct: number;
  // Explicit household savings breakdown (optional)
  person1RrspSaving?: number;
  person2RrspSaving?: number;
  piSaving?: number;
  tfsaSaving?: number;
  reinvestRefundTo: "tfsa" | "pi" | "none";
  // Other Income Sources (CPP, OAS, Employer DB Pension, Rental)
  includeOtherIncome?: boolean;
  person1CppAnnual?: number;
  person1CppStartAge?: number;
  person2CppAnnual?: number;
  person2CppStartAge?: number;
  person1OasAnnual?: number;
  person2OasAnnual?: number;
  employerPensionAnnual?: number;
  employerPensionStartAge?: number;
  otherTaxableIncome?: number;
  // Decumulation strategy
  decumStrategy: DecumulationStrategy;
}

export interface YearRecord {
  year: number;
  age: number;
  person2Age?: number;
  startBalance: number;
  contribution: number;
  growth: number;
  withdrawalGross: number;
  taxPaid: number;
  withdrawalNet: number;
  endBalance: number;
  isRRIFForced?: boolean;
  rrifMinGross?: number;
  surplusNet?: number;
}

export interface StrategyYearRecord {
  year: number;
  age: number;
  person2Age?: number;
  // Balances
  rrspStart: number;
  piStart: number;
  tfsaStart: number;
  totalStart: number;
  // Contributions (Accumulation)
  rrspContrib: number;
  piContrib: number;
  tfsaContrib: number;
  taxRefund: number;
  // Growth
  rrspGrowth: number;
  piGrowth: number;
  tfsaGrowth: number;
  // Guaranteed Other Income
  guaranteedGross: number;
  guaranteedNet: number;
  portfolioNetDraw: number;
  cppIncome: number;
  oasIncome: number;
  dbPensionIncome: number;
  otherIncome: number;
  // Withdrawals (Decumulation)
  rrspGrossDraw: number;
  piGrossDraw: number;
  tfsaGrossDraw: number;
  totalGrossDraw: number;
  // Taxes
  rrspTax: number;
  piTax: number;
  totalTax: number;
  netSpendReceived: number;
  // Ending Balances
  rrspEnd: number;
  piEnd: number;
  tfsaEnd: number;
  totalEnd: number;
  // Strategy Badges
  isRRIFForced?: boolean;
  isOASCapped?: boolean;
  isIncomeSplit?: boolean;
  notes?: string;
}

export interface StrategyResult {
  id: DecumulationStrategy;
  name: string;
  tagline: string;
  longevityYears: number;
  depletionAge: number;
  isPerpetual: boolean;
  terminalBalanceAtRetirement: {
    rrsp: number;
    pi: number;
    tfsa: number;
    total: number;
  };
  totalLifetimeRetirementTax: number;
  totalOASClawbackPaid: number;
  totalRefundsAccumulated: number;
  annualTaxRefund?: number;
  person1RrspSaving?: number;
  person2RrspSaving?: number;
  piSaving?: number;
  annualGuaranteedGrossAtRetirement?: number;
  annualGuaranteedNetAtRetirement?: number;
  estateValueAtAge85: number;
  couplesAnnualTaxSavings?: number;
  history: StrategyYearRecord[];
}

export interface AccountSimulationResult {
  accountName: string;
  terminalBalance: number;
  totalOutofPocketCost: number;
  totalTaxRefundsReceived: number;
  annualGrossWithdrawalNeeded: number;
  annualRetirementTaxPaid: number;
  longevityYears: number;
  isPerpetual: boolean;
  oasClawbackRisk: boolean;
  firstRRIFForcedAge: number | null;
  totalRRIFSurplusCash: number;
  couplesTaxAdvantageAnnual?: number;
  accumulationHistory: YearRecord[];
  decumulationHistory: YearRecord[];
}

export interface FullSimulationComparison {
  params: SimulationParams;
  rrsp: AccountSimulationResult;
  nonReg: AccountSimulationResult;
  tfsa: AccountSimulationResult;
  exceedsRrspLimit: boolean;
  rrspAnnualLimit: number;
}

/**
 * Official CRA Prescribed RRIF Minimum Withdrawal Factors (Post-2015 Budget).
 */
export function getRRIFMinFactor(age: number): number {
  if (age < 71) return 0;
  const factors: Record<number, number> = {
    71: 0.0528,
    72: 0.0540,
    73: 0.0553,
    74: 0.0567,
    75: 0.0582,
    76: 0.0598,
    77: 0.0617,
    78: 0.0636,
    79: 0.0658,
    80: 0.0682,
    81: 0.0708,
    82: 0.0738,
    83: 0.0771,
    84: 0.0808,
    85: 0.0851,
    86: 0.0899,
    87: 0.0955,
    88: 0.1021,
    89: 0.1099,
    90: 0.1192,
    91: 0.1306,
    92: 0.1449,
    93: 0.1634,
    94: 0.1879,
  };
  if (age >= 95) return 0.20;
  return factors[age] ?? (1 / (90 - age));
}

/**
 * Standard Canadian (Ontario benchmark) Combined Federal + Provincial Tax Calculator.
 * Supports age 65+ pension credit ($2,000 eligible pension credit = ~$300 fed tax reduction).
 */
export function calculateOntarioIncomeTax(taxableIncome: number, isAge65Plus = true): number {
  if (taxableIncome <= 0) return 0;

  const fedBrackets = [
    { limit: 55867, rate: 0.15 },
    { limit: 111733, rate: 0.205 },
    { limit: 173205, rate: 0.26 },
    { limit: 246752, rate: 0.29 },
    { limit: Infinity, rate: 0.33 },
  ];
  const fedBPA = 15705;

  let fedTax = 0;
  let remainingFed = taxableIncome;
  let prevLimit = 0;
  for (const b of fedBrackets) {
    if (remainingFed <= 0) break;
    const chunk = Math.min(remainingFed, b.limit - prevLimit);
    fedTax += chunk * b.rate;
    remainingFed -= chunk;
    prevLimit = b.limit;
  }
  fedTax = Math.max(0, fedTax - fedBPA * 0.15);

  // Pension Income Amount Tax Credit for retirees (15% on up to $2,000 = $300)
  if (isAge65Plus && taxableIncome > 2000) {
    fedTax = Math.max(0, fedTax - 300);
  }

  const onBrackets = [
    { limit: 51446, rate: 0.0505 },
    { limit: 102894, rate: 0.0915 },
    { limit: 150000, rate: 0.1116 },
    { limit: 220000, rate: 0.1216 },
    { limit: Infinity, rate: 0.1316 },
  ];
  const onBPA = 12399;

  let onTax = 0;
  let remainingOn = taxableIncome;
  prevLimit = 0;
  for (const b of onBrackets) {
    if (remainingOn <= 0) break;
    const chunk = Math.min(remainingOn, b.limit - prevLimit);
    onTax += chunk * b.rate;
    remainingOn -= chunk;
    prevLimit = b.limit;
  }
  onTax = Math.max(0, onTax - onBPA * 0.0505);

  let surtax = 0;
  if (onTax > 5315) {
    surtax += (onTax - 5315) * 0.2;
  }
  if (onTax > 6802) {
    surtax += (onTax - 6802) * 0.36;
  }
  onTax += surtax;

  return fedTax + onTax;
}

/**
 * Couple's Combined Ontario Tax with CRA Pension Income Splitting (Form T1032)
 * At age 65+, couples can split up to 50% of eligible pension/RRIF income.
 */
export function calculateCoupleTax(
  grossIncome: number,
  age1: number,
  age2: number,
  enableSplitting = true
): { totalTax: number; spouse1Tax: number; spouse2Tax: number; isSplit: boolean } {
  if (grossIncome <= 0) {
    return { totalTax: 0, spouse1Tax: 0, spouse2Tax: 0, isSplit: false };
  }

  // Eligible for pension income splitting if at least one spouse is 65+
  const canSplit = enableSplitting && (age1 >= 65 || age2 >= 65);

  if (canSplit) {
    // Optimal split: 50/50 division of income
    const half = grossIncome / 2;
    const tax1 = calculateOntarioIncomeTax(half, age1 >= 65);
    const tax2 = calculateOntarioIncomeTax(half, age2 >= 65);
    return {
      totalTax: Math.round(tax1 + tax2),
      spouse1Tax: Math.round(tax1),
      spouse2Tax: Math.round(tax2),
      isSplit: true,
    };
  }

  // No splitting: taxed on single earner
  const singleTax = calculateOntarioIncomeTax(grossIncome, age1 >= 65);
  return {
    totalTax: Math.round(singleTax),
    spouse1Tax: Math.round(singleTax),
    spouse2Tax: 0,
    isSplit: false,
  };
}

/**
 * Reverse calculate the gross RRSP withdrawal needed to net targetNet spend
 * Supports single or couple with income splitting.
 */
export function calcGrossRRSPWithdrawal(
  targetNet: number,
  householdMode: HouseholdMode = "single",
  age1 = 65,
  age2 = 65,
  enableSplitting = true
): {
  gross: number;
  tax: number;
  effectiveRate: number;
  isSplit: boolean;
} {
  let low = targetNet;
  let high = targetNet * 2.5;
  let gross = targetNet;

  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    const taxRes =
      householdMode === "couple"
        ? calculateCoupleTax(mid, age1, age2, enableSplitting)
        : { totalTax: calculateOntarioIncomeTax(mid, age1 >= 65), isSplit: false };

    const net = mid - taxRes.totalTax;
    if (Math.abs(net - targetNet) < 1) {
      gross = mid;
      break;
    }
    if (net < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
    gross = mid;
  }

  const finalTaxRes =
    householdMode === "couple"
      ? calculateCoupleTax(gross, age1, age2, enableSplitting)
      : { totalTax: calculateOntarioIncomeTax(gross, age1 >= 65), isSplit: false };

  return {
    gross: Math.round(gross),
    tax: Math.round(finalTaxRes.totalTax),
    effectiveRate: gross > 0 ? finalTaxRes.totalTax / gross : 0,
    isSplit: finalTaxRes.isSplit,
  };
}

/**
 * Calculate the gross withdrawal needed from a non-registered account.
 */
export function calcGrossNonRegWithdrawal(
  targetNet: number,
  capitalGainRatio: number,
  householdMode: HouseholdMode = "single",
  age1 = 65,
  age2 = 65
): { gross: number; tax: number } {
  const gainRatio = Math.max(0, Math.min(0.95, capitalGainRatio));
  let low = targetNet;
  let high = targetNet * 1.5;
  let gross = targetNet;

  for (let i = 0; i < 35; i++) {
    const mid = (low + high) / 2;
    const gainPortion = mid * gainRatio;
    const taxableCapitalGain = gainPortion * 0.5;

    const tax =
      householdMode === "couple"
        ? calculateCoupleTax(taxableCapitalGain, age1, age2, true).totalTax
        : calculateOntarioIncomeTax(taxableCapitalGain, age1 >= 65);

    const net = mid - tax;
    if (Math.abs(net - targetNet) < 1) {
      gross = mid;
      break;
    }
    if (net < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
    gross = mid;
  }

  const gainPortion = gross * gainRatio;
  const taxableCapitalGain = gainPortion * 0.5;
  const tax =
    householdMode === "couple"
      ? calculateCoupleTax(taxableCapitalGain, age1, age2, true).totalTax
      : calculateOntarioIncomeTax(taxableCapitalGain, age1 >= 65);

  return {
    gross: Math.round(gross),
    tax: Math.round(tax),
  };
}

/**
 * Run standard isolated account comparisons (RRSP vs PI vs TFSA)
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

  // Maximum RRSP room: doubles for a couple ($32,490 x 2 = $64,980)
  const rrspAnnualLimit = householdMode === "couple" ? 32490 * 2 : 32490;
  const exceedsRrspLimit = annualSaving > rrspAnnualLimit;

  // Blended household working tax rate for a couple
  const effectiveWorkMTR =
    householdMode === "couple"
      ? (workTaxRate + person2WorkTaxRate) / 2
      : workTaxRate;

  let rrspAnnualContrib = 0;
  let nonRegAnnualContrib = 0;
  let tfsaAnnualContrib = 0;
  let annualRefundReceived = 0;
  let rrspOutofPocketTotal = 0;
  let nonRegOutofPocketTotal = 0;

  if (mode === "preTax") {
    rrspAnnualContrib = annualSaving;
    rrspOutofPocketTotal = annualSaving * yearsAccumulation;

    nonRegAnnualContrib = annualSaving * (1 - effectiveWorkMTR);
    nonRegOutofPocketTotal = nonRegAnnualContrib * yearsAccumulation;

    tfsaAnnualContrib = annualSaving * (1 - effectiveWorkMTR);
  } else {
    nonRegAnnualContrib = annualSaving;
    nonRegOutofPocketTotal = annualSaving * yearsAccumulation;
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

  // Accumulation Phase
  const rrspAccHistory: YearRecord[] = [];
  let rrspBal = 0;
  for (let y = 1; y <= yearsAccumulation; y++) {
    const start = rrspBal;
    const growth = (start + rrspAnnualContrib) * growthRatePreTax;
    rrspBal = start + rrspAnnualContrib + growth;
    rrspAccHistory.push({
      year: y,
      age: currentAge1 + y - 1,
      person2Age: householdMode === "couple" ? currentAge2 + y - 1 : undefined,
      startBalance: Math.round(start),
      contribution: Math.round(rrspAnnualContrib),
      growth: Math.round(growth),
      withdrawalGross: 0,
      taxPaid: 0,
      withdrawalNet: 0,
      endBalance: Math.round(rrspBal),
    });
  }

  const nonRegAccHistory: YearRecord[] = [];
  const nonRegGrowthRate = Math.max(0, growthRatePreTax - taxDrag);
  let nonRegBal = 0;
  let totalNonRegCostBasis = nonRegAnnualContrib * yearsAccumulation;
  for (let y = 1; y <= yearsAccumulation; y++) {
    const start = nonRegBal;
    const growth = (start + nonRegAnnualContrib) * nonRegGrowthRate;
    nonRegBal = start + nonRegAnnualContrib + growth;
    nonRegAccHistory.push({
      year: y,
      age: currentAge1 + y - 1,
      person2Age: householdMode === "couple" ? currentAge2 + y - 1 : undefined,
      startBalance: Math.round(start),
      contribution: Math.round(nonRegAnnualContrib),
      growth: Math.round(growth),
      withdrawalGross: 0,
      taxPaid: 0,
      withdrawalNet: 0,
      endBalance: Math.round(nonRegBal),
    });
  }

  const tfsaAccHistory: YearRecord[] = [];
  let tfsaBal = 0;
  for (let y = 1; y <= yearsAccumulation; y++) {
    const start = tfsaBal;
    const growth = (start + tfsaAnnualContrib) * growthRatePreTax;
    tfsaBal = start + tfsaAnnualContrib + growth;
    tfsaAccHistory.push({
      year: y,
      age: currentAge1 + y - 1,
      person2Age: householdMode === "couple" ? currentAge2 + y - 1 : undefined,
      startBalance: Math.round(start),
      contribution: Math.round(tfsaAnnualContrib),
      growth: Math.round(growth),
      withdrawalGross: 0,
      taxPaid: 0,
      withdrawalNet: 0,
      endBalance: Math.round(tfsaBal),
    });
  }

  // Decumulation Phase
  const baseRrspDecum = calcGrossRRSPWithdrawal(
    retireNetSpending,
    householdMode,
    retireAge,
    person2RetireAge,
    enableIncomeSplitting
  );

  // Single baseline for measuring couples tax advantage
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

  // OAS threshold: $91,000 for single, $182,000 for couple splitting income
  const oasThreshold = householdMode === "couple" ? 91000 * 2 : 91000;

  for (let y = 1; y <= maxRetireYears; y++) {
    if (rrspDrawBal <= 0) break;
    const age1 = retireAge + y - 1;
    const age2 = person2RetireAge + y - 1;
    const start = rrspDrawBal;
    const growth = start * retireGrowthRate;

    // CRA RRIF minimum rule (based on older spouse)
    const minAge = Math.min(age1, age2); // CRA allows basing RRIF factor on younger spouse!
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
      accountName: householdMode === "couple" ? "Couple's Personal Account (Joint PI)" : "Personal Investment (Taxable Non-Registered)",
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
    tfsa: {
      accountName: householdMode === "couple" ? "Couple's Combined TFSAs" : "TFSA (Tax-Free Savings Account)",
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

/**
 * ========================================================================
 * ADVANCED PORTFOLIO STRATEGY SIMULATOR (Single & Couple Support)
 * ========================================================================
 */
export function simulatePortfolioStrategy(
  params: StrategySimulationParams
): StrategyResult {
  const {
    householdMode = "single",
    annualSaving,
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
    rrspPct,
    piPct,
    tfsaPct,
    reinvestRefundTo,
    decumStrategy,
  } = params;

  const currentAge1 = Math.max(18, retireAge - yearsAccumulation);
  const currentAge2 = Math.max(18, person2RetireAge - yearsAccumulation);

  // Maximum RRSP limit: doubles for couple ($32,490 x 2 = $64,980)
  const rrspAnnualLimit = householdMode === "couple" ? 32490 * 2 : 32490;
  // OAS clawback threshold: doubles for couple with income splitting ($91,000 x 2 = $182,000)
  const oasThreshold = householdMode === "couple" ? 91000 * 2 : 91000;

  let rawRrsp = 0;
  let rawPi = 0;
  let rawTfsa = 0;
  let annualRefund = 0;
  let p1RrspAlloc = 0;
  let p2RrspAlloc = 0;

  const hasExplicitSaving =
    params.person1RrspSaving !== undefined ||
    params.person2RrspSaving !== undefined ||
    params.piSaving !== undefined;

  if (hasExplicitSaving) {
    if (householdMode === "couple") {
      p1RrspAlloc = Math.min(32490, Math.max(0, params.person1RrspSaving ?? 0));
      p2RrspAlloc = Math.min(32490, Math.max(0, params.person2RrspSaving ?? 0));
      rawRrsp = p1RrspAlloc + p2RrspAlloc;
      rawPi = Math.max(0, params.piSaving ?? 0);
      rawTfsa = Math.max(0, params.tfsaSaving ?? 0);
      annualRefund = p1RrspAlloc * workTaxRate + p2RrspAlloc * person2WorkTaxRate;
    } else {
      p1RrspAlloc = Math.min(32490, Math.max(0, params.person1RrspSaving ?? 0));
      rawRrsp = p1RrspAlloc;
      rawPi = Math.max(0, params.piSaving ?? 0);
      rawTfsa = Math.max(0, params.tfsaSaving ?? 0);
      annualRefund = p1RrspAlloc * workTaxRate;
    }
  } else {
    // Percentage fallback
    const totalPct = rrspPct + piPct + tfsaPct || 100;
    const normRrspPct = rrspPct / totalPct;
    const normPiPct = piPct / totalPct;
    const normTfsaPct = tfsaPct / totalPct;

    rawRrsp = annualSaving * normRrspPct;
    rawPi = annualSaving * normPiPct;
    rawTfsa = annualSaving * normTfsaPct;

    if (rawRrsp > rrspAnnualLimit) {
      const excess = rawRrsp - rrspAnnualLimit;
      rawRrsp = rrspAnnualLimit;
      rawTfsa += excess * 0.5;
      rawPi += excess * 0.5;
    }

    if (householdMode === "couple") {
      p1RrspAlloc = rawRrsp * 0.5;
      p2RrspAlloc = rawRrsp * 0.5;
      annualRefund = p1RrspAlloc * workTaxRate + p2RrspAlloc * person2WorkTaxRate;
    } else {
      p1RrspAlloc = rawRrsp;
      annualRefund = rawRrsp * workTaxRate;
    }
  }

  if (reinvestRefundTo === "tfsa") {
    rawTfsa += annualRefund;
  } else if (reinvestRefundTo === "pi") {
    rawPi += annualRefund;
  }

  // Accumulation Phase
  let rrspBal = 0;
  let piBal = 0;
  let tfsaBal = 0;
  let piCostBasis = 0;
  const history: StrategyYearRecord[] = [];
  const piGrowthRate = Math.max(0, growthRatePreTax - taxDrag);

  for (let y = 1; y <= yearsAccumulation; y++) {
    const age1 = currentAge1 + y - 1;
    const age2 = currentAge2 + y - 1;
    const rrspStart = rrspBal;
    const piStart = piBal;
    const tfsaStart = tfsaBal;

    const rrspGrowth = (rrspStart + rawRrsp) * growthRatePreTax;
    const piGrowth = (piStart + rawPi) * piGrowthRate;
    const tfsaGrowth = (tfsaStart + rawTfsa) * growthRatePreTax;

    rrspBal = rrspStart + rawRrsp + rrspGrowth;
    piBal = piStart + rawPi + piGrowth;
    tfsaBal = tfsaStart + rawTfsa + tfsaGrowth;
    piCostBasis += rawPi;

    history.push({
      year: y,
      age: age1,
      person2Age: householdMode === "couple" ? age2 : undefined,
      rrspStart: Math.round(rrspStart),
      piStart: Math.round(piStart),
      tfsaStart: Math.round(tfsaStart),
      totalStart: Math.round(rrspStart + piStart + tfsaStart),
      rrspContrib: Math.round(rawRrsp),
      piContrib: Math.round(rawPi),
      tfsaContrib: Math.round(rawTfsa),
      taxRefund: Math.round(annualRefund),
      rrspGrowth: Math.round(rrspGrowth),
      piGrowth: Math.round(piGrowth),
      tfsaGrowth: Math.round(tfsaGrowth),
      guaranteedGross: 0,
      guaranteedNet: 0,
      portfolioNetDraw: 0,
      cppIncome: 0,
      oasIncome: 0,
      dbPensionIncome: 0,
      otherIncome: 0,
      rrspGrossDraw: 0,
      piGrossDraw: 0,
      tfsaGrossDraw: 0,
      totalGrossDraw: 0,
      rrspTax: 0,
      piTax: 0,
      totalTax: 0,
      netSpendReceived: 0,
      rrspEnd: Math.round(rrspBal),
      piEnd: Math.round(piBal),
      tfsaEnd: Math.round(tfsaBal),
      totalEnd: Math.round(rrspBal + piBal + tfsaBal),
      notes: "Accumulating",
    });
  }

  const terminalBal = {
    rrsp: Math.round(rrspBal),
    pi: Math.round(piBal),
    tfsa: Math.round(tfsaBal),
    total: Math.round(rrspBal + piBal + tfsaBal),
  };

  // Decumulation Phase
  let totalLifetimeTax = 0;
  let totalOASClawback = 0;
  let yearsFunded = 0;
  let isPerpetual = false;
  let estateValueAtAge85 = 0;
  let firstYearGuaranteedGross = 0;
  let firstYearGuaranteedNet = 0;
  const maxRetireYears = 55;
  const piRetireRate = retireGrowthRate * 0.85;

  for (let y = 1; y <= maxRetireYears; y++) {
    const age1 = retireAge + y - 1;
    const age2 = person2RetireAge + y - 1;
    const totalCurrentStart = rrspBal + piBal + tfsaBal;
    if (totalCurrentStart <= 0) break;

    const rrspStart = rrspBal;
    const piStart = piBal;
    const tfsaStart = tfsaBal;

    const rrspGrowth = rrspStart * retireGrowthRate;
    const piGrowth = piStart * piRetireRate;
    const tfsaGrowth = tfsaStart * retireGrowthRate;

    let rrspAvail = rrspStart + rrspGrowth;
    let piAvail = piStart + piGrowth;
    let tfsaAvail = tfsaStart + tfsaGrowth;

    // CRA RRIF minimum rule (based on younger spouse for couple)
    const minAge = Math.min(age1, age2);
    const rrifFactor = getRRIFMinFactor(householdMode === "couple" ? minAge : age1);
    const rrifMinGross = rrifFactor > 0 ? Math.min(rrspAvail, rrspStart * rrifFactor) : 0;

    // Guaranteed Pensions & Other Income
    let p1Cpp = 0;
    let p2Cpp = 0;
    let p1Oas = 0;
    let p2Oas = 0;
    let dbPension = 0;
    let otherInc = 0;

    if (params.includeOtherIncome) {
      if (age1 >= (params.person1CppStartAge ?? 65)) {
        p1Cpp = params.person1CppAnnual ?? 10000;
      }
      if (householdMode === "couple" && age2 >= (params.person2CppStartAge ?? 65)) {
        p2Cpp = params.person2CppAnnual ?? 8000;
      }
      if (age1 >= 65) {
        const baseOas = params.person1OasAnnual ?? 8560;
        p1Oas = age1 >= 75 ? baseOas * 1.10 : baseOas; // CRA +10% boost at age 75+
      }
      if (householdMode === "couple" && age2 >= 65) {
        const baseOas = params.person2OasAnnual ?? 8560;
        p2Oas = age2 >= 75 ? baseOas * 1.10 : baseOas; // CRA +10% boost at age 75+
      }
      if (age1 >= (params.employerPensionStartAge ?? retireAge)) {
        dbPension = params.employerPensionAnnual ?? 0;
      }
      otherInc = params.otherTaxableIncome ?? 0;
    }

    const guaranteedGross = p1Cpp + p2Cpp + p1Oas + p2Oas + dbPension + otherInc;
    let guaranteedTax = 0;
    if (guaranteedGross > 0) {
      if (householdMode === "couple") {
        const taxable1 = p1Cpp + p1Oas + dbPension * 0.5 + otherInc * 0.5;
        const taxable2 = p2Cpp + p2Oas + dbPension * 0.5 + otherInc * 0.5;
        const tax1 = calculateOntarioIncomeTax(taxable1, age1 >= 65);
        const tax2 = calculateOntarioIncomeTax(taxable2, age2 >= 65);
        guaranteedTax = tax1 + tax2;
      } else {
        guaranteedTax = calculateOntarioIncomeTax(guaranteedGross, age1 >= 65);
      }
    }
    const guaranteedNet = Math.max(0, guaranteedGross - guaranteedTax);
    let targetNet = Math.max(0, retireNetSpending - guaranteedNet);

    if (y === 1) {
      firstYearGuaranteedGross = guaranteedGross;
      firstYearGuaranteedNet = guaranteedNet;
    }

    let rrspGrossDraw = 0;
    let piGrossDraw = 0;
    let tfsaGrossDraw = 0;
    let isRRIFForced = false;
    let isOASCapped = false;
    let yearNotes = "";

    const piGainRatio = piBal > 0 ? Math.max(0, (piBal - piCostBasis) / piBal) : 0;

    // Strategy Execution
    if (decumStrategy === "oasShield") {
      // For single: cap at $88,000. For couple: cap at $176,000 combined!
      const oasCap = householdMode === "couple" ? 176000 : 88000;
      const rrspCap = Math.max(rrifMinGross, Math.min(rrspAvail, oasCap));
      if (rrifMinGross > oasCap) {
        isRRIFForced = true;
        yearNotes = "RRIF Min Exceeds OAS Cap";
      } else {
        isOASCapped = true;
      }

      const trialTax =
        householdMode === "couple"
          ? calculateCoupleTax(rrspCap, age1, age2, enableIncomeSplitting).totalTax
          : calculateOntarioIncomeTax(rrspCap, age1 >= 65);

      const trialNet = Math.max(0, rrspCap - trialTax);

      if (trialNet >= targetNet) {
        const needed = calcGrossRRSPWithdrawal(targetNet, householdMode, age1, age2, enableIncomeSplitting);
        rrspGrossDraw = Math.max(rrifMinGross, Math.min(rrspAvail, needed.gross));
      } else {
        rrspGrossDraw = rrspCap;
        const rrspNet = rrspGrossDraw - trialTax;
        let shortfall = Math.max(0, targetNet - rrspNet);

        if (shortfall > 0 && piAvail > 0) {
          const piRes = calcGrossNonRegWithdrawal(shortfall, piGainRatio, householdMode, age1, age2);
          const drawFromPi = Math.min(piAvail, piRes.gross);
          piGrossDraw = drawFromPi;
          const actualPiTax =
            householdMode === "couple"
              ? calculateCoupleTax(drawFromPi * piGainRatio * 0.5, age1, age2, true).totalTax
              : calculateOntarioIncomeTax(drawFromPi * piGainRatio * 0.5, age1 >= 65);

          const piNet = drawFromPi - actualPiTax;
          shortfall = Math.max(0, shortfall - piNet);
        }

        if (shortfall > 0 && tfsaAvail > 0) {
          const drawFromTfsa = Math.min(tfsaAvail, shortfall);
          tfsaGrossDraw = drawFromTfsa;
          shortfall = Math.max(0, shortfall - drawFromTfsa);
        }
      }
    } else if (decumStrategy === "rrspMeltdown") {
      const meltdownCap = householdMode === "couple" ? 180000 : 105000;
      if (age1 < 71 && rrspAvail > 0) {
        rrspGrossDraw = Math.min(rrspAvail, meltdownCap);
        const rrspTax =
          householdMode === "couple"
            ? calculateCoupleTax(rrspGrossDraw, age1, age2, enableIncomeSplitting).totalTax
            : calculateOntarioIncomeTax(rrspGrossDraw, age1 >= 65);

        const rrspNet = rrspGrossDraw - rrspTax;
        if (rrspNet < targetNet) {
          const shortfall = targetNet - rrspNet;
          piGrossDraw = Math.min(piAvail, shortfall);
          const left = shortfall - piGrossDraw;
          if (left > 0) tfsaGrossDraw = Math.min(tfsaAvail, left);
        }
        yearNotes = "Early RRSP Meltdown";
      } else {
        const needed = calcGrossRRSPWithdrawal(targetNet, householdMode, age1, age2, enableIncomeSplitting);
        rrspGrossDraw = Math.max(rrifMinGross, Math.min(rrspAvail, needed.gross));
        const rrspTax =
          householdMode === "couple"
            ? calculateCoupleTax(rrspGrossDraw, age1, age2, enableIncomeSplitting).totalTax
            : calculateOntarioIncomeTax(rrspGrossDraw, age1 >= 65);

        const rrspNet = rrspGrossDraw - rrspTax;
        let shortfall = Math.max(0, targetNet - rrspNet);
        if (shortfall > 0 && piAvail > 0) {
          piGrossDraw = Math.min(piAvail, shortfall * 1.05);
          shortfall = Math.max(0, shortfall - piGrossDraw);
        }
        if (shortfall > 0 && tfsaAvail > 0) {
          tfsaGrossDraw = Math.min(tfsaAvail, shortfall);
        }
        yearNotes = "Post-71 RRIF Mode";
      }
    } else if (decumStrategy === "taxableFirst") {
      rrspGrossDraw = rrifMinGross;
      const rrspTax =
        rrspGrossDraw > 0
          ? householdMode === "couple"
            ? calculateCoupleTax(rrspGrossDraw, age1, age2, enableIncomeSplitting).totalTax
            : calculateOntarioIncomeTax(rrspGrossDraw, age1 >= 65)
          : 0;

      const rrspNet = rrspGrossDraw - rrspTax;
      let shortfall = Math.max(0, targetNet - rrspNet);

      if (piAvail > 0 && shortfall > 0) {
        const piRes = calcGrossNonRegWithdrawal(shortfall, piGainRatio, householdMode, age1, age2);
        const draw = Math.min(piAvail, piRes.gross);
        piGrossDraw = draw;
        const net =
          draw -
          (householdMode === "couple"
            ? calculateCoupleTax(draw * piGainRatio * 0.5, age1, age2, true).totalTax
            : calculateOntarioIncomeTax(draw * piGainRatio * 0.5, age1 >= 65));
        shortfall = Math.max(0, shortfall - net);
      }

      if (shortfall > 0 && rrspAvail > rrspGrossDraw) {
        const needed = calcGrossRRSPWithdrawal(shortfall, householdMode, age1, age2, enableIncomeSplitting);
        const addDraw = Math.min(rrspAvail - rrspGrossDraw, needed.gross);
        rrspGrossDraw += addDraw;
      }

      if (shortfall > 0 && tfsaAvail > 0) {
        tfsaGrossDraw = Math.min(tfsaAvail, shortfall);
      }
      yearNotes = piAvail > 0 ? "Spending Taxable PI First" : "PI Exhausted";
    } else {
      // Pro-Rata
      const totalAvail = rrspAvail + piAvail + tfsaAvail;
      const rrspShare = totalAvail > 0 ? rrspAvail / totalAvail : 0;
      const piShare = totalAvail > 0 ? piAvail / totalAvail : 0;
      const tfsaShare = totalAvail > 0 ? tfsaAvail / totalAvail : 0;

      const rrspPart = calcGrossRRSPWithdrawal(targetNet * rrspShare, householdMode, age1, age2, enableIncomeSplitting).gross;
      rrspGrossDraw = Math.max(rrifMinGross, Math.min(rrspAvail, rrspPart));
      piGrossDraw = Math.min(piAvail, targetNet * piShare * 1.05);
      tfsaGrossDraw = Math.min(tfsaAvail, targetNet * tfsaShare);
      yearNotes = "Proportional Draw";
    }

    // Top up convergence
    for (let pass = 0; pass < 3; pass++) {
      const taxable = guaranteedGross + rrspGrossDraw + piGrossDraw * piGainRatio * 0.5;
      const curTax =
        householdMode === "couple"
          ? calculateCoupleTax(taxable, age1, age2, enableIncomeSplitting).totalTax
          : calculateOntarioIncomeTax(taxable, age1 >= 65);

      const curNet = guaranteedGross + rrspGrossDraw + piGrossDraw + tfsaGrossDraw - curTax;
      const diff = retireNetSpending - curNet;
      if (diff <= 300) break;

      if (tfsaAvail > tfsaGrossDraw) {
        const canTake = Math.min(tfsaAvail - tfsaGrossDraw, diff);
        tfsaGrossDraw += canTake;
      } else if (piAvail > piGrossDraw) {
        const canTake = Math.min(piAvail - piGrossDraw, diff * 1.05);
        piGrossDraw += canTake;
      } else if (rrspAvail > rrspGrossDraw) {
        const needed = calcGrossRRSPWithdrawal(diff, householdMode, age1, age2, enableIncomeSplitting).gross;
        const canTake = Math.min(rrspAvail - rrspGrossDraw, needed);
        rrspGrossDraw += canTake;
      } else {
        break;
      }
    }

    // Taxes
    const piTaxableGain = piGrossDraw * piGainRatio * 0.5;
    const combinedTaxableIncome = guaranteedGross + rrspGrossDraw + piTaxableGain;

    const taxRes =
      householdMode === "couple"
        ? calculateCoupleTax(combinedTaxableIncome, age1, age2, enableIncomeSplitting)
        : { totalTax: calculateOntarioIncomeTax(combinedTaxableIncome, age1 >= 65), isSplit: false };

    const yearTotalTax = taxRes.totalTax;
    const portfolioTaxable = rrspGrossDraw + piTaxableGain;
    const rrspTax = portfolioTaxable > 0 ? Math.round((yearTotalTax - guaranteedTax) * (rrspGrossDraw / portfolioTaxable)) : 0;
    const piTax = Math.max(0, Math.round(yearTotalTax - guaranteedTax - rrspTax));

    totalLifetimeTax += yearTotalTax;

    if (combinedTaxableIncome > oasThreshold) {
      const clawback = (combinedTaxableIncome - oasThreshold) * 0.15;
      totalOASClawback += clawback;
    }

    const netReceived = Math.round(guaranteedGross + rrspGrossDraw + piGrossDraw + tfsaGrossDraw - yearTotalTax);
    const portfolioNetDraw = Math.max(0, netReceived - guaranteedNet);

    rrspBal = Math.max(0, rrspAvail - rrspGrossDraw);
    piBal = Math.max(0, piAvail - piGrossDraw);
    tfsaBal = Math.max(0, tfsaAvail - tfsaGrossDraw);
    piCostBasis = Math.max(0, piCostBasis - piGrossDraw * (1 - piGainRatio));

    history.push({
      year: yearsAccumulation + y,
      age: age1,
      person2Age: householdMode === "couple" ? age2 : undefined,
      rrspStart: Math.round(rrspStart),
      piStart: Math.round(piStart),
      tfsaStart: Math.round(tfsaStart),
      totalStart: Math.round(totalCurrentStart),
      rrspContrib: 0,
      piContrib: 0,
      tfsaContrib: 0,
      taxRefund: 0,
      rrspGrowth: Math.round(rrspGrowth),
      piGrowth: Math.round(piGrowth),
      tfsaGrowth: Math.round(tfsaGrowth),
      guaranteedGross: Math.round(guaranteedGross),
      guaranteedNet: Math.round(guaranteedNet),
      portfolioNetDraw: Math.round(portfolioNetDraw),
      cppIncome: Math.round(p1Cpp + p2Cpp),
      oasIncome: Math.round(p1Oas + p2Oas),
      dbPensionIncome: Math.round(dbPension),
      otherIncome: Math.round(otherInc),
      rrspGrossDraw: Math.round(rrspGrossDraw),
      piGrossDraw: Math.round(piGrossDraw),
      tfsaGrossDraw: Math.round(tfsaGrossDraw),
      totalGrossDraw: Math.round(rrspGrossDraw + piGrossDraw + tfsaGrossDraw),
      rrspTax,
      piTax,
      totalTax: Math.round(yearTotalTax),
      netSpendReceived: netReceived,
      rrspEnd: Math.round(rrspBal),
      piEnd: Math.round(piBal),
      tfsaEnd: Math.round(tfsaBal),
      totalEnd: Math.round(rrspBal + piBal + tfsaBal),
      isRRIFForced,
      isOASCapped,
      isIncomeSplit: taxRes.isSplit,
      notes: yearNotes,
    });

    const totalRemaining = rrspBal + piBal + tfsaBal;
    if (netReceived >= retireNetSpending * 0.85) {
      yearsFunded += 1;
    } else if (totalRemaining <= 100) {
      yearsFunded += Math.max(0, netReceived / retireNetSpending);
      break;
    } else {
      yearsFunded += 1;
    }

    if (age1 === 85) {
      estateValueAtAge85 = Math.round(rrspBal * (1 - 0.45) + piBal * (1 - piGainRatio * 0.25) + tfsaBal);
    }

    if (y >= 45 && rrspBal + piBal + tfsaBal >= terminalBal.total) {
      isPerpetual = true;
      yearsFunded = 55;
      break;
    }
  }

  const baseDecum = calcGrossRRSPWithdrawal(retireNetSpending, householdMode, retireAge, person2RetireAge, enableIncomeSplitting);
  const singleBaseline = calcGrossRRSPWithdrawal(retireNetSpending, "single", retireAge);
  const couplesAnnualTaxSavings = householdMode === "couple" ? Math.max(0, singleBaseline.tax - baseDecum.tax) : 0;

  const stratNames: Record<DecumulationStrategy, { name: string; tagline: string }> = {
    oasShield: {
      name: householdMode === "couple" ? "Dual OAS Shield & Income Splitting" : "OAS Shield & Tax Smoothing",
      tagline: householdMode === "couple" 
        ? "Splits RRIF income 50/50 and shields up to $182k combined from OAS clawback."
        : "Caps RRSP withdrawals below the ~$91k clawback line; bridges lifestyle with PI/TFSA.",
    },
    rrspMeltdown: {
      name: "Early RRSP Meltdown",
      tagline: "Aggressively burns down RRSP between retirement and age 71 to eliminate the RRIF tax bomb.",
    },
    taxableFirst: {
      name: "Taxable (PI) First",
      tagline: "Spends taxable personal investments first, allowing RRSP and TFSA to compound untouched.",
    },
    proRata: {
      name: "Proportional Balanced Draw",
      tagline: "Draws simultaneously from RRSP, PI, and TFSA in proportion to their current balances.",
    },
  };

  return {
    id: decumStrategy,
    name: stratNames[decumStrategy].name,
    tagline: stratNames[decumStrategy].tagline,
    longevityYears: Math.round(yearsFunded * 10) / 10,
    depletionAge: Math.round(retireAge + yearsFunded),
    isPerpetual,
    terminalBalanceAtRetirement: terminalBal,
    totalLifetimeRetirementTax: Math.round(totalLifetimeTax),
    totalOASClawbackPaid: Math.round(totalOASClawback),
    totalRefundsAccumulated: Math.round(annualRefund * yearsAccumulation),
    annualTaxRefund: Math.round(annualRefund),
    person1RrspSaving: Math.round(p1RrspAlloc),
    person2RrspSaving: Math.round(p2RrspAlloc),
    piSaving: Math.round(rawPi),
    annualGuaranteedGrossAtRetirement: Math.round(firstYearGuaranteedGross),
    annualGuaranteedNetAtRetirement: Math.round(firstYearGuaranteedNet),
    estateValueAtAge85,
    couplesAnnualTaxSavings,
    history,
  };
}

export function compareAllStrategies(
  params: Omit<StrategySimulationParams, "decumStrategy">
): StrategyResult[] {
  const strategies: DecumulationStrategy[] = [
    "oasShield",
    "rrspMeltdown",
    "taxableFirst",
    "proRata",
  ];
  return strategies.map((strat) =>
    simulatePortfolioStrategy({ ...params, decumStrategy: strat })
  );
}

/**
 * Binary search to find the maximum sustainable annual after-tax spending
 * that funds retirement up to a target age (default age 95).
 */
export function findMaxSafeSpending(
  params: Omit<StrategySimulationParams, "retireNetSpending" | "decumStrategy">,
  targetDepletionAge: number = 95
): {
  maxSpending: number;
  bestStrategy: DecumulationStrategy;
  strategyResult: StrategyResult;
} {
  const targetLongevityYears = Math.max(1, targetDepletionAge - params.retireAge);
  const strategies: DecumulationStrategy[] = [
    "oasShield",
    "rrspMeltdown",
    "taxableFirst",
    "proRata",
  ];

  let bestMax = 0;
  let bestStrat: DecumulationStrategy = "oasShield";
  let bestResult: StrategyResult | null = null;

  for (const strat of strategies) {
    let low = 15000;
    let high = 400000;
    let stratMax = 15000;
    let stratRes: StrategyResult | null = null;

    for (let iter = 0; iter < 16; iter++) {
      const mid = Math.round((low + high) / 2 / 1000) * 1000;
      const res = simulatePortfolioStrategy({
        ...params,
        retireNetSpending: mid,
        decumStrategy: strat,
      });

      if (res.isPerpetual || res.longevityYears >= targetLongevityYears) {
        stratMax = mid;
        stratRes = res;
        low = mid + 1000;
      } else {
        high = mid - 1000;
      }
    }

    if (stratMax > bestMax && stratRes) {
      bestMax = stratMax;
      bestStrat = strat;
      bestResult = stratRes;
    }
  }

  return {
    maxSpending: bestMax,
    bestStrategy: bestStrat,
    strategyResult:
      bestResult ||
      simulatePortfolioStrategy({
        ...params,
        retireNetSpending: bestMax,
        decumStrategy: bestStrat,
      }),
  };
}

