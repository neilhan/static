import { describe, it, expect } from "vitest";
import { toLookupIndex, lookup, LOOKUP_TABLE } from "./data";

/**
 * Lookup index is calculated as follows:
 * - Input 1–81: use the number as-is for lookup (no remainder calc).
 * - Any other integer: index is based on remainder when divided by 80.
 *   - remainder 1–80 → that remainder (1–80)
 *   - remainder 0    → 80
 */
describe("toLookupIndex (how 1–81 is calculated)", () => {
  it("uses 1–81 directly for lookup (no remainder calc)", () => {
    for (let n = 1; n <= 81; n++) {
      expect(toLookupIndex(n)).toBe(n);
    }
  });

  it("numbers outside 1–81 use remainder with 80; remainder 0 becomes 80", () => {
    expect(toLookupIndex(82)).toBe(2);   // 82 % 80 = 2
    expect(toLookupIndex(161)).toBe(1);  // 161 % 80 = 1
    expect(toLookupIndex(160)).toBe(80); // 160 % 80 = 0 → 80
    expect(toLookupIndex(0)).toBe(80);   // 0 % 80 = 0 → 80
  });

  it("large numbers reduce via remainder with 80", () => {
    expect(toLookupIndex(1000)).toBe(1000 % 80); // 1000 % 80 = 40
    expect(toLookupIndex(1000)).toBe(40);
    expect(toLookupIndex(80 * 100)).toBe(80);    // 6400 % 80 = 0 → 80
  });

  it("negative numbers: normalized with ((n % 80) + 80) % 80, then 0 → 80", () => {
    expect(toLookupIndex(-1)).toBe(79);   // (-1 % 80 + 80) % 80 = 79
    expect(toLookupIndex(-80)).toBe(80);  // (-80 % 80 + 80) % 80 = 0 → 80
    expect(toLookupIndex(-81)).toBe(79);
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

  it("lookup uses the same index mapping, e.g. 82 uses index 2", () => {
    expect(lookup(82)).toEqual(lookup(2));
    expect(lookup(82).num).toBe(2);
  });

  it("numbers outside 1–81 wrap via remainder 80; 0 and 160 both use row 80", () => {
    const row80 = LOOKUP_TABLE[79];
    expect(lookup(0)).toEqual(row80);
    expect(lookup(160)).toEqual(row80);
  });

  it("81 still uses its own row directly", () => {
    const row81 = LOOKUP_TABLE[80];
    expect(lookup(81)).toEqual(row81);
  });

  it("row has num, phrases (4), and result 吉|凶|中", () => {
    const row = lookup(1);
    expect(row.num).toBe(1);
    expect(row.phrases).toHaveLength(4);
    expect(["吉", "凶", "中"]).toContain(row.result);
  });
});
