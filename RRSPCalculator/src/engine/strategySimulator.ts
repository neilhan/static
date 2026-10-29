import {
  calcCorpDistributionTaxInfo,
  calcGrossCorpWithdrawal,
  calcGrossNonRegWithdrawal,
  calcGrossRRSPWithdrawal,
  calculateCoupleTax,
  calculateOntarioIncomeTax,
  getRRIFMinFactor,
} from "./taxRules";
import {
  DecumulationStrategy,
  StrategyResult,
  StrategySimulationParams,
  StrategyYearRecord,
} from "./types";

/**
 * Advanced Multi-Account Portfolio Strategy Simulator (Single & Couple Support)
 */
export function simulatePortfolioStrategy(params: StrategySimulationParams): StrategyResult {
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
    corpPct = 0,
    tfsaPct,
    reinvestRefundTo,
    decumStrategy,
  } = params;

  const currentAge1 = Math.max(18, retireAge - yearsAccumulation);
  const currentAge2 = Math.max(18, person2RetireAge - yearsAccumulation);

  const rrspAnnualLimit = householdMode === "couple" ? 32490 * 2 : 32490;
  const oasThreshold = householdMode === "couple" ? 91000 * 2 : 91000;

  let rawRrsp = 0;
  let rawPi = 0;
  let rawCorp = 0;
  let rawTfsa = 0;
  let annualRefund = 0;
  let p1RrspAlloc = 0;
  let p2RrspAlloc = 0;

  const hasExplicitSaving =
    params.person1RrspSaving !== undefined ||
    params.person2RrspSaving !== undefined ||
    params.piSaving !== undefined ||
    params.corpSaving !== undefined;

  if (hasExplicitSaving) {
    if (householdMode === "couple") {
      p1RrspAlloc = Math.min(32490, Math.max(0, params.person1RrspSaving ?? 0));
      p2RrspAlloc = Math.min(32490, Math.max(0, params.person2RrspSaving ?? 0));
      rawRrsp = p1RrspAlloc + p2RrspAlloc;
      rawPi = Math.max(0, params.piSaving ?? 0);
      rawCorp = Math.max(0, params.corpSaving ?? 0);
      rawTfsa = Math.max(0, params.tfsaSaving ?? 0);
      annualRefund = p1RrspAlloc * workTaxRate + p2RrspAlloc * person2WorkTaxRate;
    } else {
      p1RrspAlloc = Math.min(32490, Math.max(0, params.person1RrspSaving ?? 0));
      rawRrsp = p1RrspAlloc;
      rawPi = Math.max(0, params.piSaving ?? 0);
      rawCorp = Math.max(0, params.corpSaving ?? 0);
      rawTfsa = Math.max(0, params.tfsaSaving ?? 0);
      annualRefund = p1RrspAlloc * workTaxRate;
    }
  } else {
    const totalPct = rrspPct + piPct + corpPct + tfsaPct || 100;
    const normRrspPct = rrspPct / totalPct;
    const normPiPct = piPct / totalPct;
    const normCorpPct = corpPct / totalPct;
    const normTfsaPct = tfsaPct / totalPct;

    rawRrsp = annualSaving * normRrspPct;
    rawPi = annualSaving * normPiPct;
    rawCorp = annualSaving * normCorpPct;
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

  let rrspBal = 0;
  let p1RrspBal = 0;
  let p2RrspBal = 0;
  let piBal = 0;
  let corpBal = 0;
  let tfsaBal = 0;
  let piCostBasis = 0;
  let corpCostBasis = 0;
  const history: StrategyYearRecord[] = [];
  const piGrowthRate = Math.max(0, growthRatePreTax - taxDrag);
  const corpGrowthRate = Math.max(0, growthRatePreTax - taxDrag * 0.9);
  const isStartingAtRetire = Boolean(params.startAtRetirement && params.startingRetirementAssets);

  if (isStartingAtRetire && params.startingRetirementAssets) {
    const startAssets = params.startingRetirementAssets;
    if (householdMode === "couple") {
      p1RrspBal = Math.max(0, startAssets.person1Rrsp ?? startAssets.rrsp * 0.5);
      p2RrspBal = Math.max(0, startAssets.person2Rrsp ?? startAssets.rrsp * 0.5);
      rrspBal = p1RrspBal + p2RrspBal;
    } else {
      p1RrspBal = Math.max(0, startAssets.person1Rrsp ?? startAssets.rrsp);
      p2RrspBal = 0;
      rrspBal = p1RrspBal;
    }
    piBal = Math.max(0, startAssets.pi);
    corpBal = Math.max(0, startAssets.corp ?? 0);
    tfsaBal = Math.max(0, startAssets.tfsa);
    const gainPct = Math.min(95, Math.max(0, startAssets.piUnrealizedGainPct ?? 50)) / 100;
    const corpGainPct = Math.min(95, Math.max(0, startAssets.corpUnrealizedGainPct ?? 50)) / 100;
    piCostBasis = piBal * (1 - gainPct);
    corpCostBasis = corpBal * (1 - corpGainPct);
    annualRefund = 0;
  } else {
    const p1Share = rawRrsp > 0 ? p1RrspAlloc / rawRrsp : householdMode === "couple" ? 0.5 : 1;
    const p2Share = householdMode === "couple" ? 1 - p1Share : 0;

    for (let y = 1; y <= yearsAccumulation; y++) {
      const age1 = currentAge1 + y - 1;
      const age2 = currentAge2 + y - 1;
      const rrspStart = rrspBal;
      const piStart = piBal;
      const corpStart = corpBal;
      const tfsaStart = tfsaBal;

      const rrspGrowth = (rrspStart + rawRrsp) * growthRatePreTax;
      const piGrowth = (piStart + rawPi) * piGrowthRate;
      const corpGrowth = (corpStart + rawCorp) * corpGrowthRate;
      const tfsaGrowth = (tfsaStart + rawTfsa) * growthRatePreTax;

      rrspBal = rrspStart + rawRrsp + rrspGrowth;
      p1RrspBal = rrspBal * p1Share;
      p2RrspBal = rrspBal * p2Share;
      piBal = piStart + rawPi + piGrowth;
      corpBal = corpStart + rawCorp + corpGrowth;
      tfsaBal = tfsaStart + rawTfsa + tfsaGrowth;
      piCostBasis += rawPi;
      corpCostBasis += rawCorp;

      history.push({
        year: y,
        age: age1,
        person2Age: householdMode === "couple" ? age2 : undefined,
        rrspStart: Math.round(rrspStart),
        piStart: Math.round(piStart),
        corpStart: Math.round(corpStart),
        tfsaStart: Math.round(tfsaStart),
        totalStart: Math.round(rrspStart + piStart + corpStart + tfsaStart),
        rrspContrib: Math.round(rawRrsp),
        piContrib: Math.round(rawPi),
        corpContrib: Math.round(rawCorp),
        tfsaContrib: Math.round(rawTfsa),
        taxRefund: Math.round(annualRefund),
        rrspGrowth: Math.round(rrspGrowth),
        piGrowth: Math.round(piGrowth),
        corpGrowth: Math.round(corpGrowth),
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
        corpGrossDraw: 0,
        tfsaGrossDraw: 0,
        totalGrossDraw: 0,
        rrspTax: 0,
        piTax: 0,
        corpTax: 0,
        totalTax: 0,
        netSpendReceived: 0,
        rrspEnd: Math.round(rrspBal),
        piEnd: Math.round(piBal),
        corpEnd: Math.round(corpBal),
        tfsaEnd: Math.round(tfsaBal),
        totalEnd: Math.round(rrspBal + piBal + corpBal + tfsaBal),
        notes: "Accumulating",
      });
    }
  }

  const terminalBal = {
    rrsp: Math.round(rrspBal),
    person1Rrsp: Math.round(p1RrspBal),
    person2Rrsp: Math.round(p2RrspBal),
    pi: Math.round(piBal),
    piCostBasis: Math.round(piCostBasis),
    piUnrealizedGain: Math.round(Math.max(0, piBal - piCostBasis)),
    corp: Math.round(corpBal),
    corpCostBasis: Math.round(corpCostBasis),
    corpUnrealizedGain: Math.round(Math.max(0, corpBal - corpCostBasis)),
    tfsa: Math.round(tfsaBal),
    total: Math.round(rrspBal + piBal + corpBal + tfsaBal),
  };

  let totalLifetimeTax = 0;
  let totalOASClawback = 0;
  let yearsFunded = 0;
  let isPerpetual = false;
  let estateValueAtAge85 = 0;
  let firstYearGuaranteedGross = 0;
  let firstYearGuaranteedNet = 0;
  const maxRetireYears = 55;
  const piRetireRate = retireGrowthRate * 0.85;
  const corpRetireRate = retireGrowthRate * 0.88;

  const evalCombinedHouseholdTax = (
    regularTaxable: number,
    cGrossDraw: number,
    cGainRatio: number,
    age1: number,
    age2: number
  ): { totalTax: number; isSplit: boolean; grossedUpDiv: number; dtc: number } => {
    if (cGrossDraw <= 0) {
      const res =
        householdMode === "couple"
          ? calculateCoupleTax(regularTaxable, age1, age2, enableIncomeSplitting)
          : { totalTax: calculateOntarioIncomeTax(regularTaxable, age1 >= 65), isSplit: false };
      return { totalTax: res.totalTax, isSplit: res.isSplit, grossedUpDiv: 0, dtc: 0 };
    }

    const corpInfo = calcCorpDistributionTaxInfo(cGrossDraw, cGainRatio);
    if (householdMode === "couple") {
      const canSplitRegular = enableIncomeSplitting && (age1 >= 65 || age2 >= 65);
      const reg1 = canSplitRegular ? regularTaxable * 0.5 : regularTaxable;
      const reg2 = canSplitRegular ? regularTaxable * 0.5 : 0;
      const div1 = enableIncomeSplitting
        ? corpInfo.grossedUpDividend * 0.5
        : corpInfo.grossedUpDividend;
      const div2 = enableIncomeSplitting ? corpInfo.grossedUpDividend * 0.5 : 0;
      const dtc1 = enableIncomeSplitting
        ? corpInfo.dividendTaxCredit * 0.5
        : corpInfo.dividendTaxCredit;
      const dtc2 = enableIncomeSplitting ? corpInfo.dividendTaxCredit * 0.5 : 0;

      const t1 = Math.max(0, calculateOntarioIncomeTax(reg1 + div1, age1 >= 65) - dtc1);
      const t2 = Math.max(0, calculateOntarioIncomeTax(reg2 + div2, age2 >= 65) - dtc2);
      return {
        totalTax: Math.round(t1 + t2),
        isSplit: canSplitRegular || enableIncomeSplitting,
        grossedUpDiv: corpInfo.grossedUpDividend,
        dtc: corpInfo.dividendTaxCredit,
      };
    }

    const singleTax = Math.max(
      0,
      calculateOntarioIncomeTax(regularTaxable + corpInfo.grossedUpDividend, age1 >= 65) -
        corpInfo.dividendTaxCredit
    );
    return {
      totalTax: Math.round(singleTax),
      isSplit: false,
      grossedUpDiv: corpInfo.grossedUpDividend,
      dtc: corpInfo.dividendTaxCredit,
    };
  };

  for (let y = 1; y <= maxRetireYears; y++) {
    const age1 = retireAge + y - 1;
    const age2 = person2RetireAge + y - 1;
    const totalCurrentStart = rrspBal + piBal + corpBal + tfsaBal;
    if (totalCurrentStart <= 0) break;

    const rrspStart = rrspBal;
    const piStart = piBal;
    const corpStart = corpBal;
    const tfsaStart = tfsaBal;

    const rrspGrowth = rrspStart * retireGrowthRate;
    const piGrowth = piStart * piRetireRate;
    const corpGrowth = corpStart * corpRetireRate;
    const tfsaGrowth = tfsaStart * retireGrowthRate;

    const rrspAvail = rrspStart + rrspGrowth;
    const piAvail = piStart + piGrowth;
    const corpAvail = corpStart + corpGrowth;
    const tfsaAvail = tfsaStart + tfsaGrowth;

    const minAge = Math.min(age1, age2);
    const rrifFactor = getRRIFMinFactor(householdMode === "couple" ? minAge : age1);
    const rrifMinGross = rrifFactor > 0 ? Math.min(rrspAvail, rrspStart * rrifFactor) : 0;

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
        p1Oas = age1 >= 75 ? baseOas * 1.1 : baseOas;
      }
      if (householdMode === "couple" && age2 >= 65) {
        const baseOas = params.person2OasAnnual ?? 8560;
        p2Oas = age2 >= 75 ? baseOas * 1.1 : baseOas;
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
    const targetNet = Math.max(0, retireNetSpending - guaranteedNet);

    if (y === 1) {
      firstYearGuaranteedGross = guaranteedGross;
      firstYearGuaranteedNet = guaranteedNet;
    }

    let rrspGrossDraw = 0;
    let piGrossDraw = 0;
    let corpGrossDraw = 0;
    let tfsaGrossDraw = 0;
    let isRRIFForced = false;
    let isOASCapped = false;
    let yearNotes = "";

    const piGainRatio = piBal > 0 ? Math.max(0, (piBal - piCostBasis) / piBal) : 0;
    const corpGainRatio = corpBal > 0 ? Math.max(0, (corpBal - corpCostBasis) / corpBal) : 0;

    if (decumStrategy === "oasShield") {
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
        const needed = calcGrossRRSPWithdrawal(
          targetNet,
          householdMode,
          age1,
          age2,
          enableIncomeSplitting
        );
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

        if (shortfall > 0 && corpAvail > 0) {
          const corpRes = calcGrossCorpWithdrawal(
            shortfall,
            corpGainRatio,
            householdMode,
            age1,
            age2,
            enableIncomeSplitting
          );
          const drawFromCorp = Math.min(corpAvail, corpRes.gross);
          corpGrossDraw = drawFromCorp;
          const corpNet = Math.max(
            0,
            drawFromCorp - corpRes.tax * (drawFromCorp / Math.max(1, corpRes.gross))
          );
          shortfall = Math.max(0, shortfall - corpNet);
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
          let shortfall = targetNet - rrspNet;
          piGrossDraw = Math.min(piAvail, shortfall);
          shortfall = Math.max(0, shortfall - piGrossDraw);
          if (shortfall > 0 && corpAvail > 0) {
            corpGrossDraw = Math.min(corpAvail, shortfall * 1.06);
            shortfall = Math.max(0, shortfall - corpGrossDraw * 0.94);
          }
          if (shortfall > 0) tfsaGrossDraw = Math.min(tfsaAvail, shortfall);
        }
        yearNotes = "Early RRSP Meltdown";
      } else {
        const needed = calcGrossRRSPWithdrawal(
          targetNet,
          householdMode,
          age1,
          age2,
          enableIncomeSplitting
        );
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
        if (shortfall > 0 && corpAvail > 0) {
          corpGrossDraw = Math.min(corpAvail, shortfall * 1.06);
          shortfall = Math.max(0, shortfall - corpGrossDraw * 0.94);
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

      if (corpAvail > 0 && shortfall > 0) {
        const corpRes = calcGrossCorpWithdrawal(
          shortfall,
          corpGainRatio,
          householdMode,
          age1,
          age2,
          enableIncomeSplitting
        );
        const draw = Math.min(corpAvail, corpRes.gross);
        corpGrossDraw = draw;
        const net = Math.max(0, draw - corpRes.tax * (draw / Math.max(1, corpRes.gross)));
        shortfall = Math.max(0, shortfall - net);
      }

      if (shortfall > 0 && rrspAvail > rrspGrossDraw) {
        const needed = calcGrossRRSPWithdrawal(
          shortfall,
          householdMode,
          age1,
          age2,
          enableIncomeSplitting
        );
        const addDraw = Math.min(rrspAvail - rrspGrossDraw, needed.gross);
        rrspGrossDraw += addDraw;
      }

      if (shortfall > 0 && tfsaAvail > 0) {
        tfsaGrossDraw = Math.min(tfsaAvail, shortfall);
      }
      yearNotes =
        piAvail > 0 || corpAvail > 0
          ? corpAvail > 0 && piAvail <= 0
            ? "Spending Co-Owned Corp First"
            : "Spending Taxable / Corp First"
          : "Taxable & Corp Exhausted";
    } else {
      const totalAvail = rrspAvail + piAvail + corpAvail + tfsaAvail;
      const rrspShare = totalAvail > 0 ? rrspAvail / totalAvail : 0;
      const piShare = totalAvail > 0 ? piAvail / totalAvail : 0;
      const corpShare = totalAvail > 0 ? corpAvail / totalAvail : 0;
      const tfsaShare = totalAvail > 0 ? tfsaAvail / totalAvail : 0;

      const rrspPart = calcGrossRRSPWithdrawal(
        targetNet * rrspShare,
        householdMode,
        age1,
        age2,
        enableIncomeSplitting
      ).gross;
      rrspGrossDraw = Math.max(rrifMinGross, Math.min(rrspAvail, rrspPart));
      piGrossDraw = Math.min(piAvail, targetNet * piShare * 1.05);
      if (corpShare > 0) {
        const corpPart = calcGrossCorpWithdrawal(
          targetNet * corpShare,
          corpGainRatio,
          householdMode,
          age1,
          age2,
          enableIncomeSplitting
        ).gross;
        corpGrossDraw = Math.min(corpAvail, corpPart);
      }
      tfsaGrossDraw = Math.min(tfsaAvail, targetNet * tfsaShare);
      yearNotes = "Proportional Draw";
    }

    // Top-up convergence
    for (let pass = 0; pass < 3; pass++) {
      const regularTaxable = guaranteedGross + rrspGrossDraw + piGrossDraw * piGainRatio * 0.5;
      const curTax = evalCombinedHouseholdTax(
        regularTaxable,
        corpGrossDraw,
        corpGainRatio,
        age1,
        age2
      ).totalTax;

      const curNet =
        guaranteedGross + rrspGrossDraw + piGrossDraw + corpGrossDraw + tfsaGrossDraw - curTax;
      const diff = retireNetSpending - curNet;
      if (diff <= 300) break;

      if (tfsaAvail > tfsaGrossDraw) {
        const canTake = Math.min(tfsaAvail - tfsaGrossDraw, diff);
        tfsaGrossDraw += canTake;
      } else if (piAvail > piGrossDraw) {
        const canTake = Math.min(piAvail - piGrossDraw, diff * 1.05);
        piGrossDraw += canTake;
      } else if (corpAvail > corpGrossDraw) {
        const canTake = Math.min(corpAvail - corpGrossDraw, diff * 1.08);
        corpGrossDraw += canTake;
      } else if (rrspAvail > rrspGrossDraw) {
        const needed = calcGrossRRSPWithdrawal(
          diff,
          householdMode,
          age1,
          age2,
          enableIncomeSplitting
        ).gross;
        const canTake = Math.min(rrspAvail - rrspGrossDraw, needed);
        rrspGrossDraw += canTake;
      } else {
        break;
      }
    }

    const piTaxableGain = piGrossDraw * piGainRatio * 0.5;
    const regularTaxableIncome = guaranteedGross + rrspGrossDraw + piTaxableGain;
    const taxRes = evalCombinedHouseholdTax(
      regularTaxableIncome,
      corpGrossDraw,
      corpGainRatio,
      age1,
      age2
    );

    const yearTotalTax = taxRes.totalTax;
    const combinedTaxableIncomeForOAS = regularTaxableIncome + taxRes.grossedUpDiv;

    const netCorpTaxableImpact = Math.max(0, taxRes.grossedUpDiv * 0.45);
    const portfolioTaxableWeight = rrspGrossDraw + piTaxableGain + netCorpTaxableImpact;
    const totalPortfolioTax = Math.max(0, yearTotalTax - guaranteedTax);
    const rrspTax =
      portfolioTaxableWeight > 0
        ? Math.round(totalPortfolioTax * (rrspGrossDraw / portfolioTaxableWeight))
        : 0;
    const piTax =
      portfolioTaxableWeight > 0
        ? Math.round(totalPortfolioTax * (piTaxableGain / portfolioTaxableWeight))
        : 0;
    const corpTax = Math.max(0, Math.round(totalPortfolioTax - rrspTax - piTax));

    totalLifetimeTax += yearTotalTax;

    if (combinedTaxableIncomeForOAS > oasThreshold) {
      const clawback = (combinedTaxableIncomeForOAS - oasThreshold) * 0.15;
      totalOASClawback += clawback;
    }

    const netReceived = Math.round(
      guaranteedGross + rrspGrossDraw + piGrossDraw + corpGrossDraw + tfsaGrossDraw - yearTotalTax
    );
    const portfolioNetDraw = Math.max(0, netReceived - guaranteedNet);

    rrspBal = Math.max(0, rrspAvail - rrspGrossDraw);
    piBal = Math.max(0, piAvail - piGrossDraw);
    corpBal = Math.max(0, corpAvail - corpGrossDraw);
    tfsaBal = Math.max(0, tfsaAvail - tfsaGrossDraw);
    piCostBasis = Math.max(0, piCostBasis - piGrossDraw * (1 - piGainRatio));
    corpCostBasis = Math.max(0, corpCostBasis - corpGrossDraw * (1 - corpGainRatio));

    history.push({
      year: (isStartingAtRetire ? 0 : yearsAccumulation) + y,
      age: age1,
      person2Age: householdMode === "couple" ? age2 : undefined,
      rrspStart: Math.round(rrspStart),
      piStart: Math.round(piStart),
      corpStart: Math.round(corpStart),
      tfsaStart: Math.round(tfsaStart),
      totalStart: Math.round(totalCurrentStart),
      rrspContrib: 0,
      piContrib: 0,
      corpContrib: 0,
      tfsaContrib: 0,
      taxRefund: 0,
      rrspGrowth: Math.round(rrspGrowth),
      piGrowth: Math.round(piGrowth),
      corpGrowth: Math.round(corpGrowth),
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
      corpGrossDraw: Math.round(corpGrossDraw),
      tfsaGrossDraw: Math.round(tfsaGrossDraw),
      totalGrossDraw: Math.round(rrspGrossDraw + piGrossDraw + corpGrossDraw + tfsaGrossDraw),
      rrspTax,
      piTax,
      corpTax,
      totalTax: Math.round(yearTotalTax),
      netSpendReceived: netReceived,
      rrspEnd: Math.round(rrspBal),
      piEnd: Math.round(piBal),
      corpEnd: Math.round(corpBal),
      tfsaEnd: Math.round(tfsaBal),
      totalEnd: Math.round(rrspBal + piBal + corpBal + tfsaBal),
      isRRIFForced,
      isOASCapped,
      isIncomeSplit: taxRes.isSplit,
      notes: yearNotes,
    });

    const totalRemaining = rrspBal + piBal + corpBal + tfsaBal;
    if (netReceived >= retireNetSpending * 0.85) {
      yearsFunded += 1;
    } else if (totalRemaining <= 100) {
      yearsFunded += Math.max(0, netReceived / retireNetSpending);
      break;
    } else {
      yearsFunded += 1;
    }

    if (age1 === 85) {
      estateValueAtAge85 = Math.round(
        rrspBal * (1 - 0.45) +
          piBal * (1 - piGainRatio * 0.25) +
          corpBal * (1 - corpGainRatio * 0.28) +
          tfsaBal
      );
    }

    if (
      y >= 45 &&
      terminalBal.total > 0 &&
      rrspBal + piBal + corpBal + tfsaBal >= terminalBal.total
    ) {
      isPerpetual = true;
      yearsFunded = 55;
      break;
    }
  }

  const baseDecum = calcGrossRRSPWithdrawal(
    retireNetSpending,
    householdMode,
    retireAge,
    person2RetireAge,
    enableIncomeSplitting
  );
  const singleBaseline = calcGrossRRSPWithdrawal(retireNetSpending, "single", retireAge);
  const couplesAnnualTaxSavings =
    householdMode === "couple" ? Math.max(0, singleBaseline.tax - baseDecum.tax) : 0;

  const stratNames: Record<DecumulationStrategy, { name: string; tagline: string }> = {
    oasShield: {
      name:
        householdMode === "couple"
          ? "Dual OAS Shield & Income Splitting"
          : "OAS Shield & Tax Smoothing",
      tagline:
        householdMode === "couple"
          ? "Splits RRIF & Corp dividends 50/50 and shields up to $182k combined from OAS clawback."
          : "Caps RRSP withdrawals below the ~$91k clawback line; bridges lifestyle with PI, Corp & TFSA.",
    },
    rrspMeltdown: {
      name: "Early RRSP Meltdown",
      tagline:
        "Aggressively burns down RRSP between retirement and age 71 to eliminate the RRIF tax bomb.",
    },
    taxableFirst: {
      name: "Taxable (PI & Corp) First",
      tagline:
        "Spends Personal (PI) and Corporate (CCPC) investments first, letting RRSP and TFSA compound untouched.",
    },
    proRata: {
      name: "Proportional Balanced Draw",
      tagline:
        "Draws simultaneously from RRSP, PI, Co-Owned Corp, and TFSA in proportion to their current balances.",
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
    totalRefundsAccumulated: isStartingAtRetire ? 0 : Math.round(annualRefund * yearsAccumulation),
    annualTaxRefund: Math.round(annualRefund),
    person1RrspSaving: Math.round(p1RrspAlloc),
    person2RrspSaving: Math.round(p2RrspAlloc),
    piSaving: Math.round(rawPi),
    corpSaving: Math.round(rawCorp),
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
  targetDepletionAge = 95
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

