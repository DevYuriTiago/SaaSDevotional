import { PREMIUM_PRICE } from "@/lib/constants";

/**
 * Fonte ÚNICA dos níveis do Programa de Embaixadores.
 * Usada pela calculadora da landing e, nas próximas fatias, pelo portal
 * e pelo cálculo de comissão — alterar aqui muda em todo lugar.
 * Nível por total conquistado (lifetime): nunca rebaixa.
 */
export type AmbassadorLevel = {
    name: string;
    slug: string;
    min: number;
    max: number | null; // null = sem teto (topo)
    rate: number;       // comissão recorrente sobre o pagamento
};

export const LEVELS: AmbassadorLevel[] = [
    { name: "Bronze",   slug: "bronze",   min: 1,    max: 100,  rate: 0.05 },
    { name: "Prata",    slug: "prata",    min: 101,  max: 200,  rate: 0.10 },
    { name: "Ouro",     slug: "ouro",     min: 201,  max: 500,  rate: 0.15 },
    { name: "Diamante", slug: "diamante", min: 501,  max: 1000, rate: 0.20 },
    { name: "Maná",     slug: "mana",     min: 1001, max: null, rate: 0.30 },
];

/** Nível para uma quantidade de pagantes conquistados. null se count ≤ 0. */
export function getLevel(count: number): AmbassadorLevel | null {
    if (count <= 0) return null;
    return LEVELS.find((l) => count >= l.min && (l.max === null || count <= l.max)) ?? null;
}

/** Estimativa de ganho mensal recorrente: pagantes ativos × preço × taxa do nível. */
export function estimateMonthly(count: number, price: number = PREMIUM_PRICE): number {
    const level = getLevel(count);
    if (!level) return 0;
    return count * price * level.rate;
}
