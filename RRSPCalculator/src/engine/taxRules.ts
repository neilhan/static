import { HouseholdMode } from "./types";

/**
 * Official CRA Prescribed RRIF Minimum Withdrawal Factors (Post-2015 Budget).
 */
export function getRRIFMinFactor(age: number): number {
  if (age < 71) return 0;
  const factors: Record<number, number> = {
    71: 0.0528,
    72: 0.054,
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
  if (age >= 95) return 0.2;
  return factors[age] ?? 1 / (90 - age);
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

  const canSplit = enableSplitting && (age1 >= 65 || age2 >= 65);

  if (canSplit) {
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
 * Corporate (CCPC / HoldCo) Distribution Breakdown:
 * - 50% of realized corporate capital gains flow into the Capital Dividend Account (CDA) and are paid out 100% tax-free.
 * - Remaining distribution is paid as a CCPC dividend (1.15x non-eligible dividend gross-up + ~12.02% Federal/Ontario Dividend Tax Credit).
 */
export function calcCorpDistributionTaxInfo(
  grossDraw: number,
  corpGainRatio: number
): {
  cdaTaxFreeCash: number;
  taxableDividendCash: number;
  grossedUpDividend: number;
  dividendTaxCredit: number;
} {
  if (grossDraw <= 0) {
    return {
      cdaTaxFreeCash: 0,
      taxableDividendCash: 0,
      grossedUpDividend: 0,
      dividendTaxCredit: 0,
    };
  }
  const gainRatio = Math.max(0, Math.min(0.95, corpGainRatio));
  const cdaTaxFreeCash = grossDraw * gainRatio * 0.5;
  const taxableDividendCash = Math.max(0, grossDraw - cdaTaxFreeCash);
  const grossedUpDividend = taxableDividendCash * 1.15;
  const dividendTaxCredit = grossedUpDividend * 0.1202;
  return {
    cdaTaxFreeCash,
    taxableDividendCash,
    grossedUpDividend,
    dividendTaxCredit,
  };
}

/**
 * Calculate the gross withdrawal (dividend + CDA distribution) needed from a co-owned CCPC / HoldCo.
 * For a 2-person co-owned corporation, dividends and CDA distributions are split 50/50 between co-owner spouses.
 */
export function calcGrossCorpWithdrawal(
  targetNet: number,
  corpGainRatio: number,
  householdMode: HouseholdMode = "single",
  age1 = 65,
  age2 = 65,
  enableSplitting = true
): { gross: number; tax: number; cdaTaxFree: number; taxableDividend: number } {
  if (targetNet <= 0) {
    return { gross: 0, tax: 0, cdaTaxFree: 0, taxableDividend: 0 };
  }
  let low = targetNet;
  let high = targetNet * 1.85;
  let gross = targetNet;

  const evalTax = (draw: number): number => {
    const info = calcCorpDistributionTaxInfo(draw, corpGainRatio);
    if (householdMode === "couple" && enableSplitting) {
      const halfGrossed = info.grossedUpDividend * 0.5;
      const halfDtc = info.dividendTaxCredit * 0.5;
      const t1 = Math.max(0, calculateOntarioIncomeTax(halfGrossed, age1 >= 65) - halfDtc);
      const t2 = Math.max(0, calculateOntarioIncomeTax(halfGrossed, age2 >= 65) - halfDtc);
      return t1 + t2;
    }
    return Math.max(
      0,
      calculateOntarioIncomeTax(info.grossedUpDividend, age1 >= 65) - info.dividendTaxCredit
    );
  };

  for (let i = 0; i < 35; i++) {
    const mid = (low + high) / 2;
    const tax = evalTax(mid);
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

  const finalTax = evalTax(gross);
  const finalInfo = calcCorpDistributionTaxInfo(gross, corpGainRatio);

  return {
    gross: Math.round(gross),
    tax: Math.round(finalTax),
    cdaTaxFree: Math.round(finalInfo.cdaTaxFreeCash),
    taxableDividend: Math.round(finalInfo.taxableDividendCash),
  };
}

