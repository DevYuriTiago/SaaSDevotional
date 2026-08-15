// PATH: src/__tests__/unit/ambassadors-earnings.test.ts

import { computeEarnings, type AmbassadorStats } from "@/lib/ambassadors/earnings";

const base: AmbassadorStats = {
  clicks: 0,
  signups: 0,
  payingCount: 0,
  grossPendingCents: 0,
  grossConfirmedCents: 0,
};

describe("computeEarnings", () => {
  it("sem pagantes: nível nulo, ganhos zerados e progresso rumo ao Bronze", () => {
    const e = computeEarnings(base);
    expect(e.level).toBeNull();
    expect(e.rate).toBe(0);
    expect(e.availableCents).toBe(0);
    expect(e.pendingCents).toBe(0);
    expect(e.nextLevel?.slug).toBe("bronze");
    expect(e.payingToNextLevel).toBe(1);
  });

  it("aplica a taxa do nível sobre o bruto confirmado e o pendente", () => {
    // 50 pagantes = Bronze (5%)
    const e = computeEarnings({
      ...base,
      payingCount: 50,
      grossConfirmedCents: 100_000, // R$ 1.000,00
      grossPendingCents: 20_000,
    });
    expect(e.level?.slug).toBe("bronze");
    expect(e.rate).toBe(0.05);
    expect(e.availableCents).toBe(5_000); // 5% de 100.000
    expect(e.pendingCents).toBe(1_000);
  });

  it("usa a taxa do nível alcançado, não a do anterior", () => {
    // 250 pagantes = Ouro (15%)
    const e = computeEarnings({ ...base, payingCount: 250, grossConfirmedCents: 100_000 });
    expect(e.level?.slug).toBe("ouro");
    expect(e.availableCents).toBe(15_000);
  });

  it("na fronteira exata do nível, já vale a taxa nova", () => {
    expect(computeEarnings({ ...base, payingCount: 100 }).level?.slug).toBe("bronze");
    expect(computeEarnings({ ...base, payingCount: 101 }).level?.slug).toBe("prata");
    expect(computeEarnings({ ...base, payingCount: 1001 }).level?.slug).toBe("mana");
  });

  it("informa quantos pagantes faltam para o próximo nível", () => {
    const e = computeEarnings({ ...base, payingCount: 90 });
    expect(e.nextLevel?.slug).toBe("prata");
    expect(e.payingToNextLevel).toBe(11); // 101 - 90
  });

  it("no topo (Maná) não há próximo nível e o progresso é total", () => {
    const e = computeEarnings({ ...base, payingCount: 5000 });
    expect(e.level?.slug).toBe("mana");
    expect(e.nextLevel).toBeNull();
    expect(e.payingToNextLevel).toBe(0);
    expect(e.progressPct).toBe(100);
  });

  it("progresso fica sempre entre 0 e 100", () => {
    for (const payingCount of [0, 1, 50, 100, 101, 500, 1000, 1001, 9999]) {
      const p = computeEarnings({ ...base, payingCount }).progressPct;
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
    }
  });

  it("arredonda para centavos inteiros (nunca fração de centavo)", () => {
    const e = computeEarnings({ ...base, payingCount: 10, grossConfirmedCents: 999 });
    expect(Number.isInteger(e.availableCents)).toBe(true);
  });
});
