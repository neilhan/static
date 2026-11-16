import {
  DecumulationStrategy,
  HouseholdMode,
  SimulationParams,
  StrategySimulationParams,
} from "./calculator";

export interface OptimizeBannerInfo {
  maxSpending: number;
  depletionAge: number;
  strategyName: string;
}

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

function getInitialTheme(): "dark" | "light" {
  if (typeof localStorage === "undefined") return "dark";
  return localStorage.getItem("theme") === "light" ? "light" : "dark";
}

export function createInitialState(): AppState {
  return {
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
    theme: getInitialTheme(),
  };
}

export function computeActiveAnnualSaving(s: AppState): number {
  const isCouple = s.householdMode === "couple";
  return isCouple
    ? s.p1RrspSaving + s.p2RrspSaving + s.piSaving + s.corpSaving
    : s.p1RrspSaving + s.piSaving + s.corpSaving;
}

export function computeActiveRetireStartTotal(s: AppState): number {
  const isCouple = s.householdMode === "couple";
  return isCouple
    ? s.retireStartP1Rrsp +
        s.retireStartP2Rrsp +
        s.retireStartPi +
        s.retireStartCorp +
        s.retireStartTfsa
    : s.retireStartP1Rrsp + s.retireStartPi + s.retireStartCorp + s.retireStartTfsa;
}

export function normalizeHouseholdAllocations(s: AppState): AppState {
  const isCouple = s.householdMode === "couple";
  const next = { ...s };

  if (!isCouple) {
    const currentSum = next.p1RrspSaving + next.piSaving + next.corpSaving;
    if (currentSum !== next.annualSaving) {
      const remaining = Math.max(0, next.annualSaving - next.corpSaving);
      next.p1RrspSaving = Math.min(32490, Math.round(remaining * 0.7));
      next.piSaving = Math.max(0, remaining - next.p1RrspSaving);
    }
    const currentRetireSum =
      next.retireStartP1Rrsp + next.retireStartPi + next.retireStartCorp + next.retireStartTfsa;
    if (currentRetireSum !== next.retireStartTotal) {
      next.retireStartP1Rrsp = Math.max(
        0,
        next.retireStartTotal - next.retireStartPi - next.retireStartCorp - next.retireStartTfsa
      );
      next.retireStartTotal =
        next.retireStartP1Rrsp + next.retireStartPi + next.retireStartCorp + next.retireStartTfsa;
    }
  } else {
    const currentSum = next.p1RrspSaving + next.p2RrspSaving + next.piSaving + next.corpSaving;
    if (currentSum !== next.annualSaving) {
      const remaining = Math.max(0, next.annualSaving - next.corpSaving);
      const half = Math.min(32490, Math.round(remaining * 0.35));
      next.p1RrspSaving = half;
      next.p2RrspSaving = half;
      next.piSaving = Math.max(0, remaining - half * 2);
    }
    const currentRetireSum =
      next.retireStartP1Rrsp +
      next.retireStartP2Rrsp +
      next.retireStartPi +
      next.retireStartCorp +
      next.retireStartTfsa;
    if (currentRetireSum !== next.retireStartTotal) {
      const rrspPool = Math.max(
        0,
        next.retireStartTotal - next.retireStartPi - next.retireStartCorp - next.retireStartTfsa
      );
      const half = Math.round(rrspPool / 2);
      next.retireStartP1Rrsp = half;
      next.retireStartP2Rrsp = rrspPool - half;
      next.retireStartTotal =
        next.retireStartP1Rrsp +
        next.retireStartP2Rrsp +
        next.retireStartPi +
        next.retireStartCorp +
        next.retireStartTfsa;
    }
  }

  return next;
}

export function scaleTotalSaving(s: AppState, newTotal: number): AppState {
  const isCouple = s.householdMode === "couple";
  const clampedTotal = Math.max(0, newTotal);

  if (isCouple) {
    const currentSum = s.p1RrspSaving + s.p2RrspSaving + s.piSaving + s.corpSaving || 1;
    const r1 = s.p1RrspSaving / currentSum;
    const r2 = s.p2RrspSaving / currentSum;
    const rCorp = s.corpSaving / currentSum;
    let p1 = Math.round(clampedTotal * r1);
    let p2 = Math.round(clampedTotal * r2);
    const corp = Math.round(clampedTotal * rCorp);
    let pi = clampedTotal - p1 - p2 - corp;
    if (p1 > 32490) {
      pi += p1 - 32490;
      p1 = 32490;
    }
    if (p2 > 32490) {
      pi += p2 - 32490;
      p2 = 32490;
    }
    const next: AppState = {
      ...s,
      p1RrspSaving: p1,
      p2RrspSaving: p2,
      corpSaving: Math.max(0, corp),
      piSaving: Math.max(0, pi),
    };
    return { ...next, annualSaving: computeActiveAnnualSaving(next) };
  }

  const currentSum = s.p1RrspSaving + s.piSaving + s.corpSaving || 1;
  const r1 = s.p1RrspSaving / currentSum;
  const rCorp = s.corpSaving / currentSum;
  let p1 = Math.round(clampedTotal * r1);
  const corp = Math.round(clampedTotal * rCorp);
  let pi = clampedTotal - p1 - corp;
  if (p1 > 32490) {
    pi += p1 - 32490;
    p1 = 32490;
  }
  const next: AppState = {
    ...s,
    p1RrspSaving: p1,
    corpSaving: Math.max(0, corp),
    piSaving: Math.max(0, pi),
  };
  return { ...next, annualSaving: computeActiveAnnualSaving(next) };
}

export function updateIndividualSaving(
  s: AppState,
  patch: Partial<Pick<AppState, "p1RrspSaving" | "p2RrspSaving" | "piSaving" | "corpSaving">>
): AppState {
  const next: AppState = { ...s, ...patch };
  return { ...next, annualSaving: computeActiveAnnualSaving(next) };
}

export function scaleRetireStartTotal(s: AppState, newTotal: number): AppState {
  const isCouple = s.householdMode === "couple";
  const safeNewTotal = Math.max(0, newTotal);

  if (isCouple) {
    const currentSum =
      s.retireStartP1Rrsp +
        s.retireStartP2Rrsp +
        s.retireStartPi +
        s.retireStartCorp +
        s.retireStartTfsa || 1;
    const rP1 = s.retireStartP1Rrsp / currentSum;
    const rP2 = s.retireStartP2Rrsp / currentSum;
    const rPi = s.retireStartPi / currentSum;
    const rCorp = s.retireStartCorp / currentSum;
    const retireStartP1Rrsp = Math.round((safeNewTotal * rP1) / 1000) * 1000;
    const retireStartP2Rrsp = Math.round((safeNewTotal * rP2) / 1000) * 1000;
    const retireStartPi = Math.round((safeNewTotal * rPi) / 1000) * 1000;
    const retireStartCorp = Math.round((safeNewTotal * rCorp) / 1000) * 1000;
    const retireStartTfsa = Math.max(
      0,
      safeNewTotal - retireStartP1Rrsp - retireStartP2Rrsp - retireStartPi - retireStartCorp
    );
    const next: AppState = {
      ...s,
      retireStartP1Rrsp,
      retireStartP2Rrsp,
      retireStartPi,
      retireStartCorp,
      retireStartTfsa,
    };
    return { ...next, retireStartTotal: computeActiveRetireStartTotal(next) };
  }

  const currentSum =
    s.retireStartP1Rrsp + s.retireStartPi + s.retireStartCorp + s.retireStartTfsa || 1;
  const rP1 = s.retireStartP1Rrsp / currentSum;
  const rPi = s.retireStartPi / currentSum;
  const rCorp = s.retireStartCorp / currentSum;
  const retireStartP1Rrsp = Math.round((safeNewTotal * rP1) / 1000) * 1000;
  const retireStartPi = Math.round((safeNewTotal * rPi) / 1000) * 1000;
  const retireStartCorp = Math.round((safeNewTotal * rCorp) / 1000) * 1000;
  const retireStartTfsa = Math.max(
    0,
    safeNewTotal - retireStartP1Rrsp - retireStartPi - retireStartCorp
  );
  const next: AppState = {
    ...s,
    retireStartP1Rrsp,
    retireStartPi,
    retireStartCorp,
    retireStartTfsa,
  };
  return { ...next, retireStartTotal: computeActiveRetireStartTotal(next) };
}

export function updateIndividualRetireStart(
  s: AppState,
  patch: Partial<
    Pick<
      AppState,
      | "retireStartP1Rrsp"
      | "retireStartP2Rrsp"
      | "retireStartPi"
      | "retireStartCorp"
      | "retireStartTfsa"
    >
  >
): AppState {
  const next: AppState = { ...s, ...patch };
  return { ...next, retireStartTotal: computeActiveRetireStartTotal(next) };
}

export function applyRetireStartPreset(
  s: AppState,
  p1Pct: number,
  p2Pct: number,
  piPct: number,
  corpPct = 0
): AppState {
  const isCouple = s.householdMode === "couple";
  const currentTotal = computeActiveRetireStartTotal(s);
  const baseTotal = currentTotal > 0 ? currentTotal : 1200000;

  if (isCouple) {
    const retireStartP1Rrsp = Math.round((baseTotal * p1Pct) / 1000) * 1000;
    const retireStartP2Rrsp = Math.round((baseTotal * p2Pct) / 1000) * 1000;
    const retireStartPi = Math.round((baseTotal * piPct) / 1000) * 1000;
    const retireStartCorp = Math.round((baseTotal * corpPct) / 1000) * 1000;
    const retireStartTfsa = Math.max(
      0,
      baseTotal - retireStartP1Rrsp - retireStartP2Rrsp - retireStartPi - retireStartCorp
    );
    const next: AppState = {
      ...s,
      retireStartP1Rrsp,
      retireStartP2Rrsp,
      retireStartPi,
      retireStartCorp,
      retireStartTfsa,
    };
    return { ...next, retireStartTotal: computeActiveRetireStartTotal(next) };
  }

  const retireStartP1Rrsp = Math.round((baseTotal * p1Pct) / 1000) * 1000;
  const retireStartPi = Math.round((baseTotal * piPct) / 1000) * 1000;
  const retireStartCorp = Math.round((baseTotal * corpPct) / 1000) * 1000;
  const retireStartTfsa = Math.max(
    0,
    baseTotal - retireStartP1Rrsp - retireStartPi - retireStartCorp
  );
  const next: AppState = {
    ...s,
    retireStartP1Rrsp,
    retireStartPi,
    retireStartCorp,
    retireStartTfsa,
  };
  return { ...next, retireStartTotal: computeActiveRetireStartTotal(next) };
}

export function getStrategyParams(s: AppState): Omit<StrategySimulationParams, "decumStrategy"> {
  const isCouple = s.householdMode === "couple";
  const totalSaving = computeActiveAnnualSaving(s);

  return {
    householdMode: s.householdMode,
    annualSaving: totalSaving,
    yearsAccumulation: s.yearsAccumulation,
    retireAge: s.retireAge,
    person2RetireAge: s.person2RetireAge,
    retireNetSpending: s.retireNetSpending,
    workTaxRate: s.workTaxRate,
    person2WorkTaxRate: s.person2WorkTaxRate,
    growthRatePreTax: s.growthRatePreTax,
    taxDrag: s.taxDrag,
    retireGrowthRate: s.retireGrowthRate,
    enableIncomeSplitting: s.enableIncomeSplitting,
    rrspPct: s.rrspPct,
    piPct: s.piPct,
    corpPct: s.corpPct,
    tfsaPct: s.tfsaPct,
    person1RrspSaving: s.p1RrspSaving,
    person2RrspSaving: isCouple ? s.p2RrspSaving : 0,
    piSaving: s.piSaving,
    corpSaving: s.corpSaving,
    tfsaSaving: s.tfsaSaving,
    reinvestRefundTo: s.reinvestRefundTo,
    startAtRetirement: s.startAtRetirement,
    startingRetirementAssets: {
      rrsp: isCouple ? s.retireStartP1Rrsp + s.retireStartP2Rrsp : s.retireStartP1Rrsp,
      person1Rrsp: s.retireStartP1Rrsp,
      person2Rrsp: isCouple ? s.retireStartP2Rrsp : 0,
      pi: s.retireStartPi,
      piUnrealizedGainPct: s.retireStartPiGainPct,
      corp: s.retireStartCorp,
      corpUnrealizedGainPct: s.retireStartCorpGainPct,
      tfsa: s.retireStartTfsa,
    },
    includeOtherIncome: s.includeOtherIncome,
    person1CppAnnual: s.person1CppAnnual,
    person1CppStartAge: s.person1CppStartAge,
    person2CppAnnual: s.person2CppAnnual,
    person2CppStartAge: s.person2CppStartAge,
    person1OasAnnual: s.person1OasAnnual,
    person2OasAnnual: s.person2OasAnnual,
    employerPensionAnnual: s.employerPensionAnnual,
    employerPensionStartAge: s.employerPensionStartAge,
    otherTaxableIncome: s.otherTaxableIncome,
  };
}

export function getComparatorParams(s: AppState): SimulationParams {
  const isCouple = s.householdMode === "couple";
  const annualSaving = computeActiveAnnualSaving(s);

  return {
    householdMode: s.householdMode,
    annualSaving,
    mode: s.comparatorMode,
    reinvestRefund: s.comparatorReinvest,
    yearsAccumulation: s.yearsAccumulation,
    retireAge: s.retireAge,
    person2RetireAge: s.person2RetireAge,
    retireNetSpending: s.retireNetSpending,
    workTaxRate: s.workTaxRate,
    person2WorkTaxRate: s.person2WorkTaxRate,
    growthRatePreTax: s.growthRatePreTax,
    taxDrag: s.taxDrag,
    retireGrowthRate: s.retireGrowthRate,
    enableIncomeSplitting: s.enableIncomeSplitting,
    startAtRetirement: s.startAtRetirement,
    startingRetirementAssets: {
      rrsp: isCouple ? s.retireStartP1Rrsp + s.retireStartP2Rrsp : s.retireStartP1Rrsp,
      person1Rrsp: s.retireStartP1Rrsp,
      person2Rrsp: isCouple ? s.retireStartP2Rrsp : 0,
      pi: s.retireStartPi,
      piUnrealizedGainPct: s.retireStartPiGainPct,
      corp: s.retireStartCorp,
      corpUnrealizedGainPct: s.retireStartCorpGainPct,
      tfsa: s.retireStartTfsa,
    },
    comparatorUseBreakdown: s.comparatorUseBreakdown,
  };
}
