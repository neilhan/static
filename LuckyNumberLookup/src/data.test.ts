import { describe, it, expect } from "vitest";
import { toLookupIndex, lookup, LOOKUP_TABLE } from "./data";

/**
 * Lookup index is calculated as follows:
 * - Input 1–81: use the number as-is for lookup.
 * - Any other integer: index = value % 81, with the rule that remainder 0 → 81.
 *   So 81, 162, 243, … and 0 all map to index 81.
 */
describe("toLookupIndex (how 1–81 is calculated)", () => {
  it("uses 1–81 directly for lookup (no remainder calc)", () => {
    for (let n = 1; n <= 81; n++) {
      expect(toLookupIndex(n)).toBe(n);
    }
  });

  it("remainder 0 maps to 81: 81, 162, 243, 0", () => {
    expect(toLookupIndex(81)).toBe(81);
    expect(toLookupIndex(162)).toBe(81);
    expect(toLookupIndex(243)).toBe(81);
    expect(toLookupIndex(0)).toBe(81);
  });

  it("numbers above 81 use remainder; remainder 0 becomes 81", () => {
    expect(toLookupIndex(82)).toBe(1);  // 82 % 81 = 1
    expect(toLookupIndex(163)).toBe(1); // 163 % 81 = 1
    expect(toLookupIndex(80)).toBe(80);
    expect(toLookupIndex(161)).toBe(80); // 161 % 81 = 80
  });

  it("large numbers reduce via remainder", () => {
    expect(toLookupIndex(1000)).toBe(1000 % 81); // 1000 % 81 = 28
    expect(toLookupIndex(1000)).toBe(28);
    expect(toLookupIndex(81 * 100)).toBe(81);    // 8100 % 81 = 0 → 81
  });

  it("negative numbers: normalized with ((n % 81) + 81) % 81, then 0 → 81", () => {
    expect(toLookupIndex(-1)).toBe(80);   // (-1 % 81 + 81) % 81 = 80
    expect(toLookupIndex(-81)).toBe(81);  // (-81 % 81 + 81) % 81 = 0 → 81
    expect(toLookupIndex(-82)).toBe(80);
  });

  it("non-finite input falls back to 1", () => {
    expect(toLookupIndex(Number.NaN)).toBe(1);
    expect(toLookupIndex(Number.POSITIVE_INFINITY)).toBe(1);
    expect(toLookupIndex(Number.NEGATIVE_INFINITY)).toBe(1);
  });
});

describe("lookup (table result for index 1–81)", () => {
  it("1–81 each return the correct table row (same index)", () => {
    for (let n = 1; n <= 81; n++) {
      const row = lookup(n);
      expect(row).toBe(LOOKUP_TABLE[n - 1]);
      expect(row.num).toBe(n);
    }
  });

  it("remainder 0 (81, 162, 0) all return row 81", () => {
    const row81 = LOOKUP_TABLE[80];
    expect(lookup(81)).toEqual(row81);
    expect(lookup(162)).toEqual(row81);
    expect(lookup(0)).toEqual(row81);
  });

  it("82 and 1 return the same row (index 1)", () => {
    expect(lookup(82)).toEqual(lookup(1));
    expect(lookup(82).num).toBe(1);
  });

  it("row has num, phrases (4), and result 吉|凶|中", () => {
    const row = lookup(1);
    expect(row.num).toBe(1);
    expect(row.phrases).toHaveLength(4);
    expect(["吉", "凶", "中"]).toContain(row.result);
  });
});
