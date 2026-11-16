import { describe, expect, it } from "vitest";
import { getWeeksInYear } from "./dateUtils";

describe("getWeeksInYear", () => {
  it("returns 53 for non-leap years starting on Thursday", () => {
    expect(getWeeksInYear(2015)).toBe(53);
    expect(getWeeksInYear(2026)).toBe(53);
  });

  it("returns 53 for leap years starting on Wednesday or Thursday", () => {
    // 1992 and 2020 are leap years starting on Wednesday
    expect(getWeeksInYear(1992)).toBe(53);
    expect(getWeeksInYear(2020)).toBe(53);
    // 2004 is a leap year starting on Thursday
    expect(getWeeksInYear(2004)).toBe(53);
  });

  it("returns 52 for standard 52-week years including non-Thursday leap years", () => {
    expect(getWeeksInYear(2021)).toBe(52);
    expect(getWeeksInYear(2023)).toBe(52);
    expect(getWeeksInYear(2024)).toBe(52);
    expect(getWeeksInYear(2025)).toBe(52);
  });

  it("handles century leap-year rules (1900 non-leap vs 2000 leap)", () => {
    // 1900 starts on Monday (not leap) -> 52
    expect(getWeeksInYear(1900)).toBe(52);
    // 2000 starts on Saturday (leap) -> 52
    expect(getWeeksInYear(2000)).toBe(52);
  });
});
