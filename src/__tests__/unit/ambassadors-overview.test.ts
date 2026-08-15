// PATH: src/__tests__/unit/ambassadors-overview.test.ts

import { buildOverview, type StatRow } from "@/lib/ambassadors/overview";

function row(over: Partial<StatRow> = {}): StatRow {
    return {
        ambassadorId: "amb-1",
        name: "Pastor João",
        status: "active",
        slug: "pastorjoao",
        clicks: 0,
        blockedClicks: 0,
        signups: 0,
        payingCount: 0,
        grossPendingCents: 0,
        grossAvailableCents: 0,
        grossPaidCents: 0,
        ...over,
    };
}

describe("buildOverview", () => {
    it("conta os embaixadores por situação", () => {
        const o = buildOverview([
            row({ ambassadorId: "a", status: "active" }),
            row({ ambassadorId: "b", status: "active" }),
            row({ ambassadorId: "c", status: "pending" }),
            row({ ambassadorId: "d", status: "rejected" }),
            row({ ambassadorId: "e", status: "suspended" }),
        ]);
        expect(o.counts).toEqual({ active: 2, pending: 1, rejected: 1, suspended: 1, total: 5 });
    });

    it("soma o funil e o dinheiro de todos", () => {
        const o = buildOverview([
            row({ ambassadorId: "a", clicks: 100, signups: 20, payingCount: 5, grossAvailableCents: 10_000 }),
            row({ ambassadorId: "b", clicks: 50, signups: 10, payingCount: 2, grossPaidCents: 4_000 }),
        ]);
        expect(o.totals.clicks).toBe(150);
        expect(o.totals.signups).toBe(30);
        expect(o.totals.paying).toBe(7);
        expect(o.totals.grossCents).toBe(14_000);
    });

    it("calcula a comissão de cada um pela taxa do seu próprio nível", () => {
        const o = buildOverview([
            // 250 pagantes = Ouro (15%) sobre 100.000
            row({ ambassadorId: "a", payingCount: 250, grossAvailableCents: 100_000 }),
            // 10 pagantes = Bronze (5%) sobre 100.000
            row({ ambassadorId: "b", payingCount: 10, grossAvailableCents: 100_000 }),
        ]);
        const porId = new Map(o.ambassadors.map((a) => [a.ambassadorId, a]));
        expect(porId.get("a")!.commissionTotalCents).toBe(15_000);
        expect(porId.get("b")!.commissionTotalCents).toBe(5_000);
        // o total é a soma das comissões individuais, não uma taxa média
        expect(o.totals.commissionCents).toBe(20_000);
    });

    it("calcula as taxas de conversão de cada etapa", () => {
        const [a] = buildOverview([row({ clicks: 200, signups: 50, payingCount: 10 })]).ambassadors;
        expect(a.clickToSignupPct).toBeCloseTo(25, 5);
        expect(a.signupToPayingPct).toBeCloseTo(20, 5);
    });

    it("não divide por zero quando não houve clique nem cadastro", () => {
        const [a] = buildOverview([row()]).ambassadors;
        expect(a.clickToSignupPct).toBe(0);
        expect(a.signupToPayingPct).toBe(0);
    });

    it("ordena do maior para o menor número de assinantes", () => {
        const o = buildOverview([
            row({ ambassadorId: "a", payingCount: 3 }),
            row({ ambassadorId: "b", payingCount: 30 }),
            row({ ambassadorId: "c", payingCount: 12 }),
        ]);
        expect(o.ambassadors.map((x) => x.ambassadorId)).toEqual(["b", "c", "a"]);
    });

    it("lista vazia devolve zeros sem quebrar", () => {
        const o = buildOverview([]);
        expect(o.counts.total).toBe(0);
        expect(o.totals.grossCents).toBe(0);
        expect(o.ambassadors).toEqual([]);
    });

    it("separa o que já foi pago do que ainda é devido", () => {
        const o = buildOverview([
            row({ payingCount: 10, grossAvailableCents: 20_000, grossPaidCents: 60_000, grossPendingCents: 20_000 }),
        ]);
        // Bronze 5%: devido = disponível, pago = já saiu
        expect(o.totals.availableCents).toBe(1_000);
        expect(o.totals.paidCents).toBe(3_000);
        expect(o.totals.pendingCents).toBe(1_000);
    });
});
