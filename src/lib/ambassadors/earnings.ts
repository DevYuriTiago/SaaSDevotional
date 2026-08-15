import { getLevel, LEVELS, type AmbassadorLevel } from "./levels";

/**
 * Números crus vindos da view ambassador_stats. O bruto vem separado em três
 * faixas: dentro da garantia, liberado mas ainda não pago, e já pago.
 */
export type AmbassadorStats = {
    clicks: number;
    signups: number;
    payingCount: number;
    /** Dentro da janela de 7 dias: ainda pode ser estornado. */
    grossPendingCents: number;
    /** Passou dos 7 dias e ainda não entrou num saque. */
    grossAvailableCents: number;
    /** Já pago em algum saque. */
    grossPaidCents: number;
};

export type Earnings = {
    level: AmbassadorLevel | null;
    nextLevel: AmbassadorLevel | null;
    /** Quantos pagantes faltam para o próximo nível (0 no topo). */
    payingToNextLevel: number;
    /** Avanço dentro do nível atual, de 0 a 100. */
    progressPct: number;
    rate: number;
    /** Comissão liberada para saque (passou a garantia e não foi paga). */
    availableCents: number;
    /** Comissão ainda dentro da garantia de 7 dias. */
    pendingCents: number;
    /** Comissão já recebida em saques anteriores. */
    paidCents: number;
};

/**
 * Deriva nível, taxa e comissão a partir dos números crus.
 * A regra de faixas e taxas vive só em levels.ts: aqui é aplicação, não definição.
 */
export function computeEarnings(stats: AmbassadorStats): Earnings {
    const level = getLevel(stats.payingCount);
    const rate = level?.rate ?? 0;

    const nextLevel = level
        ? LEVELS.find((l) => l.min > level.min) ?? null
        : LEVELS[0];

    const payingToNextLevel = nextLevel ? Math.max(nextLevel.min - stats.payingCount, 0) : 0;

    // Progresso dentro da faixa atual. Sem nível ainda, a faixa é "0 até o Bronze".
    const floor = level?.min ?? 0;
    const ceiling = nextLevel?.min ?? null;
    const progressPct = ceiling === null
        ? 100
        : Math.min(100, Math.max(0, ((stats.payingCount - floor) / (ceiling - floor)) * 100));

    return {
        level,
        nextLevel,
        payingToNextLevel,
        progressPct,
        rate,
        availableCents: Math.round(stats.grossAvailableCents * rate),
        pendingCents: Math.round(stats.grossPendingCents * rate),
        paidCents: Math.round(stats.grossPaidCents * rate),
    };
}
