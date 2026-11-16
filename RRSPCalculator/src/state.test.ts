import { describe, expect, it } from "vitest";
import {
  applyRetireStartPreset,
  createInitialState,
  getComparatorParams,
  getStrategyParams,
  normalizeHouseholdAllocations,
  scaleRetireStartTotal,
  scaleTotalSaving,
} from "./state";

describe("Pure State Derivations", () => {
  it("getStrategyParams derives totals without mutating input state", () => {
    const state = {
      ...createInitialState(),
      householdMode: "couple" as const,
      annualSaving: 999999,
      p1RrspSaving: 20000,
      p2RrspSaving: 15000,
      piSaving: 10000,
      corpSaving: 5000,
      retireStartTotal: 999999,
    };
    const snapshot = structuredClone(state);

    const params = getStrategyParams(state);

    expect(params.annualSaving).toBe(50000);
    expect(params.person1RrspSaving).toBe(20000);
    expect(params.person2RrspSaving).toBe(15000);
    expect(state).toEqual(snapshot);
  });

  it("getComparatorParams derives parameters without mutating input state", () => {
    const state = {
      ...createInitialState(),
      householdMode: "single" as const,
      p1RrspSaving: 25000,
      piSaving: 15000,
      corpSaving: 10000,
    };
    const snapshot = structuredClone(state);

    const params = getComparatorParams(state);

    expect(params.annualSaving).toBe(50000);
    expect(params.startingRetirementAssets?.person2Rrsp).toBe(0);
    expect(state).toEqual(snapshot);
  });

  it("normalizeHouseholdAllocations returns a new normalized object when switching to couple", () => {
    const base = { ...createInitialState(), householdMode: "couple" as const };
    const snapshot = structuredClone(base);

    const normalized = normalizeHouseholdAllocations(base);

    expect(base).toEqual(snapshot);
    expect(
      normalized.p1RrspSaving +
        normalized.p2RrspSaving +
        normalized.piSaving +
        normalized.corpSaving
    ).toBe(normalized.annualSaving);
    expect(
      normalized.retireStartP1Rrsp +
        normalized.retireStartP2Rrsp +
        normalized.retireStartPi +
        normalized.retireStartCorp +
        normalized.retireStartTfsa
    ).toBe(normalized.retireStartTotal);
  });

  it("scaleTotalSaving and scaleRetireStartTotal keep bucket sums synchronized", () => {
    const base = createInitialState();
    const scaledSave = scaleTotalSaving(base, 80000);
    expect(scaledSave.annualSaving).toBe(80000);
    expect(scaledSave.p1RrspSaving).toBeLessThanOrEqual(32490);
    expect(scaledSave.p1RrspSaving + scaledSave.piSaving + scaledSave.corpSaving).toBe(80000);

    const scaledRetire = scaleRetireStartTotal(base, 2000000);
    expect(scaledRetire.retireStartTotal).toBe(2000000);

    const preset = applyRetireStartPreset(scaledRetire, 0.4, 0, 0.3, 0);
    expect(preset.retireStartTotal).toBe(2000000);
    expect(preset.retireStartP1Rrsp).toBe(800000);
    expect(preset.retireStartPi).toBe(600000);
    expect(preset.retireStartTfsa).toBe(600000);
  });
});
