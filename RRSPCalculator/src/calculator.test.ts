import { describe, it, expect } from "vitest";
import {
  calculateOntarioIncomeTax,
  calculateCoupleTax,
  calcGrossRRSPWithdrawal,
  calcGrossNonRegWithdrawal,
  calcCorpDistributionTaxInfo,
  calcGrossCorpWithdrawal,
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

  it("supports providing a direct starting point at retirement with asset breakdown (Single & Couple)", () => {
    const singleAtRetire = simulatePortfolioStrategy({
      ...baseSingleParams,
      startAtRetirement: true,
      startingRetirementAssets: {
        rrsp: 700000,
        pi: 300000,
        piUnrealizedGainPct: 40,
        tfsa: 200000,
      },
      decumStrategy: "oasShield",
    });

    expect(singleAtRetire.terminalBalanceAtRetirement.rrsp).toBe(700000);
    expect(singleAtRetire.terminalBalanceAtRetirement.pi).toBe(300000);
    expect(singleAtRetire.terminalBalanceAtRetirement.piCostBasis).toBe(180000);
    expect(singleAtRetire.terminalBalanceAtRetirement.piUnrealizedGain).toBe(120000);
    expect(singleAtRetire.terminalBalanceAtRetirement.tfsa).toBe(200000);
    expect(singleAtRetire.terminalBalanceAtRetirement.total).toBe(1200000);
    expect(singleAtRetire.history[0].age).toBe(65);
    expect(singleAtRetire.history[0].totalStart).toBe(1200000);
    expect(singleAtRetire.totalRefundsAccumulated).toBe(0);

    const coupleAtRetire = simulatePortfolioStrategy({
      ...baseSingleParams,
      householdMode: "couple",
      person2RetireAge: 63,
      startAtRetirement: true,
      startingRetirementAssets: {
        rrsp: 800000,
        person1Rrsp: 500000,
        person2Rrsp: 300000,
        pi: 250000,
        piUnrealizedGainPct: 50,
        tfsa: 150000,
      },
      decumStrategy: "oasShield",
    });

    expect(coupleAtRetire.terminalBalanceAtRetirement.person1Rrsp).toBe(500000);
    expect(coupleAtRetire.terminalBalanceAtRetirement.person2Rrsp).toBe(300000);
    expect(coupleAtRetire.terminalBalanceAtRetirement.rrsp).toBe(800000);
    expect(coupleAtRetire.terminalBalanceAtRetirement.total).toBe(1200000);
    expect(coupleAtRetire.longevityYears).toBeGreaterThan(singleAtRetire.longevityYears);
  });

  it("supports direct account comparison starting at retirement", () => {
    const compEqual = runSimulation({
      householdMode: "single",
      annualSaving: 40000,
      mode: "preTax",
      reinvestRefund: false,
      yearsAccumulation: 15,
      retireAge: 65,
      retireNetSpending: 80000,
      workTaxRate: 0.43,
      growthRatePreTax: 0.07,
      taxDrag: 0.015,
      retireGrowthRate: 0.05,
      startAtRetirement: true,
      startingRetirementAssets: {
        rrsp: 700000,
        pi: 300000,
        piUnrealizedGainPct: 50,
        tfsa: 200000,
      },
      comparatorUseBreakdown: false,
    });

    expect(compEqual.rrsp.terminalBalance).toBe(1200000);
    expect(compEqual.nonReg.terminalBalance).toBe(1200000);
    expect(compEqual.tfsa.terminalBalance).toBe(1200000);
    expect(compEqual.rrsp.accumulationHistory.length).toBe(0);

    const compBreakdown = runSimulation({
      ...compEqual.params,
      startingRetirementAssets: {
        rrsp: 700000,
        pi: 300000,
        piUnrealizedGainPct: 50,
        corp: 500000,
        corpUnrealizedGainPct: 60,
        tfsa: 200000,
      },
      comparatorUseBreakdown: true,
    });
    expect(compBreakdown.rrsp.terminalBalance).toBe(700000);
    expect(compBreakdown.nonReg.terminalBalance).toBe(300000);
    expect(compBreakdown.corp.terminalBalance).toBe(500000);
    expect(compBreakdown.tfsa.terminalBalance).toBe(200000);
  });

  it("models 2-person Co-Owned Corp (CCPC / HoldCo) CDA tax-free dividends and spousal splitting", () => {
    const distInfo = calcCorpDistributionTaxInfo(100000, 0.5);
    // 50% unrealized gain -> $50,000 gain -> 50% CDA = $25,000 tax-free CDA + $75,000 CCPC dividend
    expect(distInfo.cdaTaxFreeCash).toBeCloseTo(25000, 0);
    expect(distInfo.taxableDividendCash).toBeCloseTo(75000, 0);
    expect(distInfo.grossedUpDividend).toBeCloseTo(75000 * 1.15, 0);

    const singleCorp = calcGrossCorpWithdrawal(80000, 0.5, "single", 65);
    const coupleCorp = calcGrossCorpWithdrawal(80000, 0.5, "couple", 65, 65, true);

    // Co-owning spouses splitting dividends 50/50 pay materially less personal dividend tax
    expect(coupleCorp.tax).toBeLessThan(singleCorp.tax - 4000);
    expect(coupleCorp.gross).toBeLessThan(singleCorp.gross - 4000);
    expect(coupleCorp.cdaTaxFree).toBeGreaterThan(15000);
  });

  it("simulates 2-person Co-Owned Corp across both accumulation and retirement phases", () => {
    const coupleCorpAccum = simulatePortfolioStrategy({
      ...baseSingleParams,
      householdMode: "couple",
      person2RetireAge: 63,
      person2WorkTaxRate: 0.30,
      annualSaving: 80000,
      person1RrspSaving: 20000,
      person2RrspSaving: 20000,
      piSaving: 5000,
      corpSaving: 35000,
      retireNetSpending: 100000,
      decumStrategy: "oasShield",
    });

    expect(coupleCorpAccum.corpSaving).toBe(35000);
    expect(coupleCorpAccum.terminalBalanceAtRetirement.corp).toBeGreaterThan(700000);
    expect(coupleCorpAccum.terminalBalanceAtRetirement.corpUnrealizedGain).toBeGreaterThan(150000);
    expect(coupleCorpAccum.longevityYears).toBeGreaterThan(20);

    // Ensure all 4 decumulation strategies properly draw down and account for Co-Owned Corp
    const allStrats = compareAllStrategies({
      ...baseSingleParams,
      householdMode: "couple",
      person2RetireAge: 63,
      startAtRetirement: true,
      retireNetSpending: 95000,
      startingRetirementAssets: {
        rrsp: 700000,
        person1Rrsp: 350000,
        person2Rrsp: 350000,
        pi: 200000,
        piUnrealizedGainPct: 50,
        corp: 600000,
        corpUnrealizedGainPct: 50,
        tfsa: 200000,
      },
    });

    const withoutCorp = simulatePortfolioStrategy({
      ...baseSingleParams,
      householdMode: "couple",
      person2RetireAge: 63,
      startAtRetirement: true,
      retireNetSpending: 95000,
      startingRetirementAssets: {
        rrsp: 700000,
        person1Rrsp: 350000,
        person2Rrsp: 350000,
        pi: 200000,
        piUnrealizedGainPct: 50,
        corp: 0,
        tfsa: 200000,
      },
      decumStrategy: "oasShield",
    });

    expect(allStrats).toHaveLength(4);
    for (const s of allStrats) {
      expect(s.terminalBalanceAtRetirement.corp).toBe(600000);
      expect(s.terminalBalanceAtRetirement.total).toBe(1700000);
      expect(s.longevityYears).toBeGreaterThan(22);
      expect(s.longevityYears).toBeGreaterThan(withoutCorp.longevityYears + 8);
    }

    // Verify Direct Account Comparison pre-tax CCPC SBD (12.2% corporate tax vs personal MTR)
    const compCorp = runSimulation({
      householdMode: "couple",
      annualSaving: 50000,
      mode: "preTax",
      reinvestRefund: false,
      yearsAccumulation: 15,
      retireAge: 65,
      person2RetireAge: 63,
      retireNetSpending: 80000,
      workTaxRate: 0.45,
      person2WorkTaxRate: 0.35,
      growthRatePreTax: 0.07,
      taxDrag: 0.015,
      retireGrowthRate: 0.05,
    });
    // CCPC retains 87.8% (after 12.2% SBD) vs 60% personal after-tax (40% blended MTR), so Corp terminal balance > nonReg
    expect(compCorp.corp.terminalBalance).toBeGreaterThan(compCorp.nonReg.terminalBalance);
  });
});



