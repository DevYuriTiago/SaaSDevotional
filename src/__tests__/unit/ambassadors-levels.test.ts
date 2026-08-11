// PATH: src/__tests__/unit/ambassadors-levels.test.ts

import { LEVELS, getLevel, estimateMonthly } from "@/lib/ambassadors/levels";
import { PREMIUM_PRICE } from "@/lib/constants";

describe("LEVELS", () => {
  it("tem os 5 níveis na ordem, do Bronze ao Maná", () => {
    expect(LEVELS.map((l) => l.slug)).toEqual(["bronze", "prata", "ouro", "diamante", "mana"]);
    expect(LEVELS.map((l) => l.rate)).toEqual([0.05, 0.1, 0.15, 0.2, 0.3]);
  });
});

describe("getLevel (fronteiras exatas)", () => {
  const cases: Array<[number, string | null]> = [
    [0, null],
    [-5, null],
    [1, "bronze"],
    [100, "bronze"],
    [101, "prata"],
    [200, "prata"],
    [201, "ouro"],
    [500, "ouro"],
    [501, "diamante"],
    [1000, "diamante"],
    [1001, "mana"],
    [50000, "mana"],
  ];
  it.each(cases)("%i pagantes → %s", (count, slug) => {
    expect(getLevel(count)?.slug ?? null).toBe(slug);
  });
});

describe("estimateMonthly", () => {
  it("0 pagantes → R$ 0", () => {
    expect(estimateMonthly(0)).toBe(0);
  });

  it("300 pagantes (Ouro 15%) → 300 × preço × 0.15", () => {
    expect(estimateMonthly(300)).toBeCloseTo(300 * PREMIUM_PRICE * 0.15, 2);
  });

  it("1500 pagantes (Maná 30%) → 1500 × preço × 0.30", () => {
    expect(estimateMonthly(1500)).toBeCloseTo(1500 * PREMIUM_PRICE * 0.3, 2);
  });

  it("aceita preço custom", () => {
    expect(estimateMonthly(100, 10)).toBeCloseTo(100 * 10 * 0.05, 2);
  });
});
