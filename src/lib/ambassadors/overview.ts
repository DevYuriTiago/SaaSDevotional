import { getLevel, type AmbassadorLevel } from "./levels";

/** Uma linha crua da view ambassador_stats, já em camelCase. */
export type StatRow = {
    ambassadorId: string;
    name: string;
    status: string;
    slug: string | null;
    clicks: number;
    blockedClicks: number;
    signups: number;
    payingCount: number;
    grossPendingCents: number;
    grossAvailableCents: number;
    grossPaidCents: number;
};

export type AmbassadorSummary = StatRow & {
    level: AmbassadorLevel | null;
    ratePct: number;
    grossTotalCents: number;
    commissionTotalCents: number;
    commissionAvailableCents: number;
    clickToSignupPct: number;
    signupToPayingPct: number;
};

export type Overview = {
    counts: { active: number; pending: number; rejected: number; suspended: number; total: number };
    totals: {
        clicks: number;
        blockedClicks: number;
        signups: number;
        paying: number;
        grossCents: number;
        commissionCents: number;
        availableCents: number;
        pendingCents: number;
        paidCents: number;
    };
    ambassadors: AmbassadorSummary[];
};

function pct(de: number, para: number): number {
    return de > 0 ? (para / de) * 100 : 0;
}

/**
 * Monta a visão geral do programa a partir das linhas da view.
 *
 * Detalhe que importa: a comissão total é a SOMA das comissões individuais,
 * cada uma calculada pela taxa do nível daquele embaixador. Aplicar uma taxa
 * média sobre o bruto total daria um número errado assim que houver gente em
 * níveis diferentes.
 */
export function buildOverview(rows: StatRow[]): Overview {
    const counts = { active: 0, pending: 0, rejected: 0, suspended: 0, total: rows.length };

    const ambassadors: AmbassadorSummary[] = rows.map((r) => {
        if (r.status in counts) counts[r.status as keyof typeof counts] += 1;

        const level = getLevel(r.payingCount);
        const rate = level?.rate ?? 0;
        const grossTotalCents = r.grossPendingCents + r.grossAvailableCents + r.grossPaidCents;

        return {
            ...r,
            level,
            ratePct: Math.round(rate * 100),
            grossTotalCents,
            commissionTotalCents: Math.round(grossTotalCents * rate),
            commissionAvailableCents: Math.round(r.grossAvailableCents * rate),
            clickToSignupPct: pct(r.clicks, r.signups),
            signupToPayingPct: pct(r.signups, r.payingCount),
        };
    });

    const soma = (fn: (a: AmbassadorSummary) => number) => ambassadors.reduce((s, a) => s + fn(a), 0);

    return {
        counts,
        totals: {
            clicks: soma((a) => a.clicks),
            blockedClicks: soma((a) => a.blockedClicks),
            signups: soma((a) => a.signups),
            paying: soma((a) => a.payingCount),
            grossCents: soma((a) => a.grossTotalCents),
            commissionCents: soma((a) => a.commissionTotalCents),
            availableCents: soma((a) => a.commissionAvailableCents),
            pendingCents: soma((a) => Math.round(a.grossPendingCents * ((a.level?.rate ?? 0)))),
            paidCents: soma((a) => Math.round(a.grossPaidCents * ((a.level?.rate ?? 0)))),
        },
        ambassadors: ambassadors.sort((a, b) => b.payingCount - a.payingCount),
    };
}
