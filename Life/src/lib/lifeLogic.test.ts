import { describe, expect, it } from "vitest";
import { getWeeksInYear } from "./dateUtils";
import { DEFAULT_LIFE_EXPECTANCY, generateLifeGrid } from "./lifeLogic";

describe("generateLifeGrid", () => {
  it("uses default life expectancy and partitions weeks into lived, active, and retirement", () => {
    // 1990-01-01 birth year, checked on 2025-01-15 (2 full weeks into 2025)
    const currentDate = new Date(2025, 0, 15);
    const grid = generateLifeGrid(1990, DEFAULT_LIFE_EXPECTANCY, 80, currentDate);

    expect(grid.years).toHaveLength(DEFAULT_LIFE_EXPECTANCY);
    // Years are ordered newest (top) to oldest (bottom)
    expect(grid.years[0].year).toBe(1990 + DEFAULT_LIFE_EXPECTANCY - 1);
    expect(grid.years[0].age).toBe(DEFAULT_LIFE_EXPECTANCY - 1);
    expect(grid.years[grid.years.length - 1].year).toBe(1990);
    expect(grid.years[grid.years.length - 1].age).toBe(0);

    const expectedTotal = Array.from({ length: DEFAULT_LIFE_EXPECTANCY }, (_, i) =>
      getWeeksInYear(1990 + i)
    ).reduce((sum, w) => sum + w, 0);

    expect(grid.totalWeeks).toBe(expectedTotal);
    expect(grid.livedWeeks + grid.activeWeeks + grid.retirementWeeks).toBe(grid.totalWeeks);
    expect(grid.remainingWeeks).toBe(grid.activeWeeks + grid.retirementWeeks);

    // Current year 2025 (age 35 < activeAge 80): first 2 weeks lived, rest active
    const year2025 = grid.years.find((y) => y.year === 2025)!;
    expect(year2025.weeks.slice(0, 2).every((w) => w.status === "lived")).toBe(true);
    expect(year2025.weeks.slice(2).every((w) => w.status === "active")).toBe(true);

    // Retirement starts at age >= 80 (last 10 years: ages 80..89)
    const age79 = grid.years.find((y) => y.age === 79)!;
    const age80 = grid.years.find((y) => y.age === 80)!;
    expect(age79.weeks.every((w) => w.status === "active")).toBe(true);
    expect(age80.weeks.every((w) => w.status === "retirement")).toBe(true);
  });

  it("handles current year being in retirement phase", () => {
    const currentDate = new Date(2025, 0, 15); // 2 weeks into 2025
    // Birth year 1940 -> in 2025 age is 85 (>= activeAge 80)
    const grid = generateLifeGrid(1940, 90, 80, currentDate);
    const year2025 = grid.years.find((y) => y.year === 2025)!;

    expect(year2025.weeks.slice(0, 2).every((w) => w.status === "lived")).toBe(true);
    expect(year2025.weeks.slice(2).every((w) => w.status === "retirement")).toBe(true);
  });

  it("handles boundary dates before birth year and after life expectancy", () => {
    const beforeBirth = generateLifeGrid(2030, 10, 8, new Date(2025, 0, 1));
    expect(beforeBirth.livedWeeks).toBe(0);
    expect(beforeBirth.remainingWeeks).toBe(beforeBirth.totalWeeks);

    const afterExpectancy = generateLifeGrid(1900, 90, 80, new Date(2025, 0, 1));
    expect(afterExpectancy.livedWeeks).toBe(afterExpectancy.totalWeeks);
    expect(afterExpectancy.remainingWeeks).toBe(0);
    expect(afterExpectancy.activeWeeks).toBe(0);
    expect(afterExpectancy.retirementWeeks).toBe(0);
  });

  it("assigns sequential absolute ids and 1-based weekInYear indices", () => {
    const grid = generateLifeGrid(2020, 2, 1, new Date(2020, 0, 1));
    // Re-reverse to chronological order to check sequential ids
    const chronological = [...grid.years].reverse();
    expect(chronological[0].weeks).toHaveLength(53); // 2020 has 53 ISO weeks
    expect(chronological[1].weeks).toHaveLength(52); // 2021 has 52 ISO weeks

    const allWeeks = chronological.flatMap((y) => y.weeks);
    expect(allWeeks[0]).toMatchObject({ id: 0, weekInYear: 1, year: 2020 });
    expect(allWeeks[52]).toMatchObject({ id: 52, weekInYear: 53, year: 2020 });
    expect(allWeeks[53]).toMatchObject({ id: 53, weekInYear: 1, year: 2021 });
    expect(allWeeks[allWeeks.length - 1].id).toBe(grid.totalWeeks - 1);
  });
});
