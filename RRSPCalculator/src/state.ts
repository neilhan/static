import {
  DecumulationStrategy,
  HouseholdMode,
  SimulationParams,
  StrategySimulationParams,
} from "./calculator";

export interface AppState {
  householdMode: HouseholdMode;
  viewMode: "simulator" | "comparator";
  annualSaving: number;
  yearsAccumulation: number;
  retireAge: number; // Person 1
  person2RetireAge: number; // Person 2 (for couples)
  retireNetSpending: number;
  workTaxRate: number; // Person 1
  person2WorkTaxRate: number; // Person 2
  growthRatePreTax: number;
  taxDrag: number;
  retireGrowthRate: number;
  enableIncomeSplitting: boolean;

  // Granular Household Savings Allocation ($)
  p1RrspSaving: number;
  p2RrspSaving: number;
  piSaving: number;
  corpSaving: number;
  tfsaSaving: number;

  // Starting Point at Retirement Mode & Asset Breakdown ($)
  startAtRetirement: boolean;
  retireStartTotal: number;
  retireStartP1Rrsp: number;
  retireStartP2Rrsp: number;
  retireStartPi: number;
  retireStartPiGainPct: number;
  retireStartCorp: number;
  retireStartCorpGainPct: number;
  retireStartTfsa: number;
  comparatorUseBreakdown: boolean;

  // Simulator Strategy & Percentages
  rrspPct: number;
  piPct: number;
  corpPct: number;
  tfsaPct: number;
  reinvestRefundTo: "tfsa" | "pi" | "none";
  decumStrategy: DecumulationStrategy;

  // Guaranteed Pensions & Other Income
  includeOtherIncome: boolean;
  otherIncomeExpanded: boolean;
  person1CppAnnual: number;
  person1CppStartAge: number;
  person2CppAnnual: number;
  person2CppStartAge: number;
  person1OasAnnual: number;
  person2OasAnnual: number;
  employerPensionAnnual: number;
  employerPensionStartAge: number;
  otherTaxableIncome: number;

  // Direct Comparator Specific State
  comparatorMode: "preTax" | "cashOut";
  comparatorReinvest: boolean;

  chartViewMode: "balances" | "incomeStreams";
  blueprintSelectedAge: number | null;

  ledgerOpen: boolean;
  theme: "dark" | "light";
}

export const state: AppState = {
  householdMode: "single",
  viewMode: "simulator",
  annualSaving: 40000,
  yearsAccumulation: 15,
  retireAge: 65,
  person2RetireAge: 63,
  retireNetSpending: 80000,
  workTaxRate: 0.43,
  person2WorkTaxRate: 0.30,
  growthRatePreTax: 0.07,
  taxDrag: 0.015,
  retireGrowthRate: 0.05,
  enableIncomeSplitting: true,

  // Granular Household Savings Allocation ($)
  p1RrspSaving: 25000,
  p2RrspSaving: 10000,
  piSaving: 15000,
  corpSaving: 0,
  tfsaSaving: 0,

  // Starting Point at Retirement Mode & Asset Breakdown ($)
  startAtRetirement: false,
  retireStartTotal: 1200000,
  retireStartP1Rrsp: 700000,
  retireStartP2Rrsp: 350000,
  retireStartPi: 300000,
  retireStartPiGainPct: 50,
  retireStartCorp: 0,
  retireStartCorpGainPct: 50,
  retireStartTfsa: 200000,
  comparatorUseBreakdown: false,

  // Simulator Strategy & Percentages
  rrspPct: 70,
  piPct: 30,
  corpPct: 0,
  tfsaPct: 0,
  reinvestRefundTo: "tfsa",
  decumStrategy: "oasShield",

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
  comparatorMode: "preTax",
  comparatorReinvest: false,

  chartViewMode: "balances",
  blueprintSelectedAge: null,

  ledgerOpen: false,
  theme: (localStorage.getItem("theme") as "dark" | "light") || "dark",
};

export function normalizeHouseholdAllocations(): void {
  const isCouple = state.householdMode === "couple";
  if (!isCouple) {
    const currentSum = state.p1RrspSaving + state.piSaving + state.corpSaving;
    if (currentSum !== state.annualSaving) {
      const remaining = Math.max(0, state.annualSaving - state.corpSaving);
      state.p1RrspSaving = Math.min(32490, Math.round(remaining * 0.7));
      state.piSaving = Math.max(0, remaining - state.p1RrspSaving);
    }
    const currentRetireSum =
      state.retireStartP1Rrsp + state.retireStartPi + state.retireStartCorp + state.retireStartTfsa;
    if (currentRetireSum !== state.retireStartTotal) {
      state.retireStartP1Rrsp = Math.max(
        0,
        state.retireStartTotal - state.retireStartPi - state.retireStartCorp - state.retireStartTfsa
      );
      state.retireStartTotal =
        state.retireStartP1Rrsp + state.retireStartPi + state.retireStartCorp + state.retireStartTfsa;
    }
  } else {
    const currentSum =
      state.p1RrspSaving + state.p2RrspSaving + state.piSaving + state.corpSaving;
    if (currentSum !== state.annualSaving) {
      const remaining = Math.max(0, state.annualSaving - state.corpSaving);
      const half = Math.min(32490, Math.round(remaining * 0.35));
      state.p1RrspSaving = half;
      state.p2RrspSaving = half;
      state.piSaving = Math.max(0, remaining - half * 2);
    }
    const currentRetireSum =
      state.retireStartP1Rrsp +
      state.retireStartP2Rrsp +
      state.retireStartPi +
      state.retireStartCorp +
      state.retireStartTfsa;
    if (currentRetireSum !== state.retireStartTotal) {
      const rrspPool = Math.max(
        0,
        state.retireStartTotal - state.retireStartPi - state.retireStartCorp - state.retireStartTfsa
      );
      const half = Math.round(rrspPool / 2);
      state.retireStartP1Rrsp = half;
      state.retireStartP2Rrsp = rrspPool - half;
      state.retireStartTotal =
        state.retireStartP1Rrsp +
        state.retireStartP2Rrsp +
        state.retireStartPi +
        state.retireStartCorp +
        state.retireStartTfsa;
    }
  }
}

export function getStrategyParams(): Omit<StrategySimulationParams, "decumStrategy"> {
  const isCouple = state.householdMode === "couple";
  const totalSaving = isCouple
    ? state.p1RrspSaving + state.p2RrspSaving + state.piSaving + state.corpSaving
    : state.p1RrspSaving + state.piSaving + state.corpSaving;
  state.annualSaving = totalSaving;

  const totalRetireStart = isCouple
    ? state.retireStartP1Rrsp +
      state.retireStartP2Rrsp +
      state.retireStartPi +
      state.retireStartCorp +
      state.retireStartTfsa
    : state.retireStartP1Rrsp +
      state.retireStartPi +
      state.retireStartCorp +
      state.retireStartTfsa;
  state.retireStartTotal = totalRetireStart;

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
    corpPct: state.corpPct,
    tfsaPct: state.tfsaPct,
    person1RrspSaving: state.p1RrspSaving,
    person2RrspSaving: isCouple ? state.p2RrspSaving : 0,
    piSaving: state.piSaving,
    corpSaving: state.corpSaving,
    tfsaSaving: state.tfsaSaving,
    reinvestRefundTo: state.reinvestRefundTo,
    startAtRetirement: state.startAtRetirement,
    startingRetirementAssets: {
      rrsp: isCouple ? state.retireStartP1Rrsp + state.retireStartP2Rrsp : state.retireStartP1Rrsp,
      person1Rrsp: state.retireStartP1Rrsp,
      person2Rrsp: isCouple ? state.retireStartP2Rrsp : 0,
      pi: state.retireStartPi,
      piUnrealizedGainPct: state.retireStartPiGainPct,
      corp: state.retireStartCorp,
      corpUnrealizedGainPct: state.retireStartCorpGainPct,
      tfsa: state.retireStartTfsa,
    },
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

export function getComparatorParams(): SimulationParams {
  const isCouple = state.householdMode === "couple";
  return {
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
    startAtRetirement: state.startAtRetirement,
    startingRetirementAssets: {
      rrsp: isCouple ? state.retireStartP1Rrsp + state.retireStartP2Rrsp : state.retireStartP1Rrsp,
      person1Rrsp: state.retireStartP1Rrsp,
      person2Rrsp: isCouple ? state.retireStartP2Rrsp : 0,
      pi: state.retireStartPi,
      piUnrealizedGainPct: state.retireStartPiGainPct,
      corp: state.retireStartCorp,
      corpUnrealizedGainPct: state.retireStartCorpGainPct,
      tfsa: state.retireStartTfsa,
    },
    comparatorUseBreakdown: state.comparatorUseBreakdown,
  };
}

