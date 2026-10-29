export type HouseholdMode = "single" | "couple";

export interface RetirementStartingAssets {
  rrsp: number;
  person1Rrsp?: number;
  person2Rrsp?: number;
  pi: number;
  piUnrealizedGainPct?: number; // 0 to 95 (default 50%)
  corp?: number; // Co-owned Private Corporation (CCPC / HoldCo) balance
  corpUnrealizedGainPct?: number; // 0 to 95 (default 50%)
  tfsa: number;
}

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
  startAtRetirement?: boolean;
  startingRetirementAssets?: RetirementStartingAssets;
  comparatorUseBreakdown?: boolean;
}

export type DecumulationStrategy =
  | "oasShield" // Cap RRSP draw below OAS threshold, bridge with PI/Corp/TFSA
  | "rrspMeltdown" // Aggressively draw RRSP between retireAge and 71
  | "taxableFirst" // Exhaust taxable PI & Corp first, let RRSP/TFSA compound longer
  | "proRata"; // Draw proportionally across all accounts

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
  corpPct?: number;
  tfsaPct: number;
  // Explicit household savings breakdown (optional)
  person1RrspSaving?: number;
  person2RrspSaving?: number;
  piSaving?: number;
  corpSaving?: number;
  tfsaSaving?: number;
  reinvestRefundTo: "tfsa" | "pi" | "none";
  // Starting point at retirement with asset breakdown (optional)
  startAtRetirement?: boolean;
  startingRetirementAssets?: RetirementStartingAssets;
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
  corpStart: number;
  tfsaStart: number;
  totalStart: number;
  // Contributions (Accumulation)
  rrspContrib: number;
  piContrib: number;
  corpContrib: number;
  tfsaContrib: number;
  taxRefund: number;
  // Growth
  rrspGrowth: number;
  piGrowth: number;
  corpGrowth: number;
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
  corpGrossDraw: number;
  tfsaGrossDraw: number;
  totalGrossDraw: number;
  // Taxes
  rrspTax: number;
  piTax: number;
  corpTax: number;
  totalTax: number;
  netSpendReceived: number;
  // Ending Balances
  rrspEnd: number;
  piEnd: number;
  corpEnd: number;
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
    person1Rrsp?: number;
    person2Rrsp?: number;
    pi: number;
    piCostBasis?: number;
    piUnrealizedGain?: number;
    corp: number;
    corpCostBasis?: number;
    corpUnrealizedGain?: number;
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
  corpSaving?: number;
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
  corp: AccountSimulationResult;
  tfsa: AccountSimulationResult;
  exceedsRrspLimit: boolean;
  rrspAnnualLimit: number;
}

