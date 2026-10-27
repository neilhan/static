import { describe, it, expect } from "vitest";
import {
  calculateOntarioIncomeTax,
  calculateCoupleTax,
  calcGrossRRSPWithdrawal,
  calcGrossNonRegWithdrawal,
  getRRIFMinFactor,
  runSimulation,
  simulatePortfolioStrategy,
  compareAllStrategies,
  findMaxSafeSpending,
} from "./calculator";

describe("Canadian Tax Modeling", () => {
  it("calculates basic Ontario income tax realistically", () => {
    expect(calculateOntarioIncomeTax(0)).toBe(0);
    expect(calculateOntarioIncomeTax(12000)).toBe(0);

    const tax100k = calculateOntarioIncomeTax(100000);
    expect(tax100k).toBeGreaterThan(20000);
    expect(tax100k).toBeLessThan(25000);
  });

  it("calculates couple income splitting tax savings", () => {
    // $100,000 single vs $100,000 split 50/50 ($50,000 each)
    const singleTax = calculateOntarioIncomeTax(100000, true);
    const coupleTax = calculateCoupleTax(100000, 65, 65, true);

    // Couple tax should be much lower than single tax (saves thousands in tax)
    expect(coupleTax.totalTax).toBeLessThan(singleTax - 6000);
    expect(coupleTax.isSplit).toBe(true);
    expect(coupleTax.spouse1Tax).toBeCloseTo(coupleTax.spouse2Tax, 0);
  });

  it("calculates RRSP gross withdrawal for $80,000 net (Single vs Couple)", () => {
    const single = calcGrossRRSPWithdrawal(80000, "single", 65);
    const couple = calcGrossRRSPWithdrawal(80000, "couple", 65, 65, true);

    // Single needs ~$103,000 gross
    expect(single.gross).toBeGreaterThan(100000);
    // Couple splitting needs significantly less gross (around $91,000 - $94,000)
    expect(couple.gross).toBeLessThan(single.gross - 7000);
    expect(couple.tax).toBeLessThan(single.tax - 7000);
  });
});

describe("Portfolio Strategy Simulator (Single & Couple)", () => {
  const baseSingleParams = {
    householdMode: "single" as const,
    annualSaving: 40000,
    yearsAccumulation: 15,
    retireAge: 65,
    retireNetSpending: 80000,
    workTaxRate: 0.43,
    growthRatePreTax: 0.07,
    taxDrag: 0.015,
    retireGrowthRate: 0.05,
    rrspPct: 70,
    piPct: 30,
    tfsaPct: 0,
    reinvestRefundTo: "tfsa" as const,
  };

  it("simulates OAS Shield strategy for single", () => {
    const res = simulatePortfolioStrategy({
      ...baseSingleParams,
      decumStrategy: "oasShield",
    });

    expect(res.longevityYears).toBeGreaterThan(15);
    expect(res.terminalBalanceAtRetirement.total).toBeGreaterThan(1000000);
  });

  it("simulates 2-person couple with income splitting and verifies higher longevity", () => {
    const singleRes = simulatePortfolioStrategy({
      ...baseSingleParams,
      decumStrategy: "oasShield",
    });

    const coupleRes = simulatePortfolioStrategy({
      ...baseSingleParams,
      householdMode: "couple",
      person2RetireAge: 63,
      person2WorkTaxRate: 0.30,
      enableIncomeSplitting: true,
      decumStrategy: "oasShield",
    });

    // Couple benefits from dual tax brackets, saving significant lifetime taxes
    expect(coupleRes.totalLifetimeRetirementTax).toBeLessThan(singleRes.totalLifetimeRetirementTax);
    expect(coupleRes.longevityYears).toBeGreaterThanOrEqual(singleRes.longevityYears);
    expect(coupleRes.couplesAnnualTaxSavings).toBeGreaterThan(5000);
  });

  it("simulates couple with explicit Person 1, Person 2 RRSP and PI household saving allocations", () => {
    const coupleCustom = simulatePortfolioStrategy({
      ...baseSingleParams,
      householdMode: "couple",
      person2RetireAge: 63,
      person2WorkTaxRate: 0.30,
      annualSaving: 45000,
      person1RrspSaving: 20000,
      person2RrspSaving: 15000,
      piSaving: 10000,
      decumStrategy: "oasShield",
    });

    expect(coupleCustom.person1RrspSaving).toBe(20000);
    expect(coupleCustom.person2RrspSaving).toBe(15000);
    expect(coupleCustom.piSaving).toBe(10000);
    // Person 1: 20000 * 0.43 = 8600. Person 2: 15000 * 0.30 = 4500. Total refund = 13100.
    expect(coupleCustom.annualTaxRefund).toBe(13100);
    expect(coupleCustom.longevityYears).toBeGreaterThan(20);
  });

  it("finds maximum safe annual net spending to age 95", () => {
    const opt = findMaxSafeSpending({
      ...baseSingleParams,
      annualSaving: 40000,
      yearsAccumulation: 15,
      retireAge: 65,
    }, 95);

    expect(opt.maxSpending).toBeGreaterThan(60000);
    expect(opt.strategyResult.longevityYears).toBeGreaterThanOrEqual(30);
  });

  it("simulates guaranteed other income (CPP + OAS) reducing portfolio draw and extending longevity", () => {
    const withoutIncome = simulatePortfolioStrategy({
      ...baseSingleParams,
      retireNetSpending: 85000,
      decumStrategy: "oasShield",
      includeOtherIncome: false,
    });

    const withIncome = simulatePortfolioStrategy({
      ...baseSingleParams,
      retireNetSpending: 85000,
      decumStrategy: "oasShield",
      includeOtherIncome: true,
      person1CppAnnual: 12000,
      person1CppStartAge: 65,
      person1OasAnnual: 8560,
    });

    expect(withIncome.annualGuaranteedGrossAtRetirement).toBe(20560);
    expect(withIncome.annualGuaranteedNetAtRetirement).toBeGreaterThan(17000);

    const firstRetireYear = withIncome.history.find((h) => h.notes !== "Accumulating");
    expect(firstRetireYear).toBeDefined();
    expect(firstRetireYear?.guaranteedGross).toBe(20560);
    expect(firstRetireYear?.portfolioNetDraw).toBeLessThan(85000);
    // Longevity with guaranteed pensions should significantly exceed baseline
    expect(withIncome.longevityYears).toBeGreaterThan(withoutIncome.longevityYears);
  });

  it("factors in CPP, OAS, and employer DB pension for a 2-person couple", () => {
    const coupleWithPensions = simulatePortfolioStrategy({
      ...baseSingleParams,
      householdMode: "couple",
      person2RetireAge: 65,
      enableIncomeSplitting: true,
      retireNetSpending: 100000,
      decumStrategy: "oasShield",
      includeOtherIncome: true,
      person1CppAnnual: 12000,
      person1CppStartAge: 65,
      person2CppAnnual: 10000,
      person2CppStartAge: 65,
      person1OasAnnual: 8560,
      person2OasAnnual: 8560,
      employerPensionAnnual: 25000,
      employerPensionStartAge: 65,
    });

    // Total gross guaranteed = 12000 + 10000 + 8560 + 8560 + 25000 = 64120
    expect(coupleWithPensions.annualGuaranteedGrossAtRetirement).toBe(64120);
    expect(coupleWithPensions.annualGuaranteedNetAtRetirement).toBeGreaterThan(50000);
    expect(coupleWithPensions.longevityYears).toBeGreaterThan(25);
  });
});



