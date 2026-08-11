"use client";

/**
 * Medalhões dos níveis do Programa de Embaixadores.
 * Regra do design system ("Sem emoji"): os níveis são peças DESENHADAS —
 * moedas cunhadas em SVG, cada uma com seu metal e seu glifo gravado.
 *   Bronze → espiga (o primeiro fruto)     Prata → estrela (constância)
 *   Ouro → coroa (honra)                   Diamante → pedra lapidada (raridade)
 *   Maná → pote de mel (a alma da marca — Êx 16:31)
 */

export type TierSlug = "bronze" | "prata" | "ouro" | "diamante" | "mana";

const METALS: Record<TierSlug, { light: string; base: string; deep: string; glow: string }> = {
    bronze:   { light: "#D9A468", base: "#A06B33", deep: "#5F3A18", glow: "rgba(160,107,51,0.35)" },
    prata:    { light: "#E9EDF4", base: "#AAB2C0", deep: "#636B7A", glow: "rgba(170,178,192,0.30)" },
    ouro:     { light: "#FBE3B0", base: "#F7C97A", deep: "#C9962E", glow: "rgba(247,201,122,0.45)" },
    diamante: { light: "#F0F7FF", base: "#B9D0EC", deep: "#5E7BA6", glow: "rgba(185,208,236,0.35)" },
    mana:     { light: "#FFF3D6", base: "#FBE3B0", deep: "#E0975A", glow: "rgba(251,227,176,0.55)" },
};

function Glyph({ tier, stroke }: { tier: TierSlug; stroke: string }) {
    const common = { fill: "none", stroke, strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    switch (tier) {
        case "bronze": // espiga de trigo
            return (
                <g {...common}>
                    <path d="M32 44V22" />
                    <path d="M32 26c-4-1-6-4-6-8 4 0 6 3 6 8Z" />
                    <path d="M32 26c4-1 6-4 6-8-4 0-6 3-6 8Z" />
                    <path d="M32 34c-4-1-6-4-6-8 4 0 6 3 6 8Z" />
                    <path d="M32 34c4-1 6-4 6-8-4 0-6 3-6 8Z" />
                </g>
            );
        case "prata": // estrela de 4 pontas
            return (
                <g {...common}>
                    <path d="M32 18l3.2 10.8L46 32l-10.8 3.2L32 46l-3.2-10.8L18 32l10.8-3.2Z" />
                </g>
            );
        case "ouro": // coroa
            return (
                <g {...common}>
                    <path d="M20 40h24" />
                    <path d="M20 36l-1-12 8 6 5-9 5 9 8-6-1 12c0 0-6 2-12 2s-12-2-12-2Z" />
                </g>
            );
        case "diamante": // pedra lapidada
            return (
                <g {...common}>
                    <path d="M24 22h16l6 8-14 16-14-16Z" />
                    <path d="M18 30h28M24 22l8 8 8-8M32 46l-4-16M32 46l4-16" strokeWidth={1.6} opacity={0.8} />
                </g>
            );
        case "mana": // pote de mel
            return (
                <g {...common}>
                    <path d="M25 24h14" />
                    <path d="M27 24v-3h10v3" />
                    <path d="M24 28c-2 3-3 6-3 9 0 6 5 9 11 9s11-3 11-9c0-3-1-6-3-9" />
                    <path d="M24 28c2-2 5-3 8-3s6 1 8 3" />
                    <path d="M32 34v4" strokeWidth={2.2} opacity={0.85} />
                </g>
            );
    }
}

export function Medallion({ tier, size = 96, dimmed = false }: { tier: TierSlug; size?: number; dimmed?: boolean }) {
    const m = METALS[tier];
    const id = `med-${tier}`;
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden
            style={{ filter: dimmed ? "none" : `drop-shadow(0 6px 18px ${m.glow})`, opacity: dimmed ? 0.55 : 1, transition: "all .5s var(--ease-spring, ease)" }}>
            <defs>
                <radialGradient id={`${id}-face`} cx="38%" cy="30%" r="80%">
                    <stop offset="0%" stopColor={m.light} stopOpacity={0.28} />
                    <stop offset="55%" stopColor={m.base} stopOpacity={0.10} />
                    <stop offset="100%" stopColor={m.deep} stopOpacity={0.16} />
                </radialGradient>
                <linearGradient id={`${id}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={m.light} />
                    <stop offset="50%" stopColor={m.base} />
                    <stop offset="100%" stopColor={m.deep} />
                </linearGradient>
            </defs>
            {/* face da moeda */}
            <circle cx="32" cy="32" r="30" fill={`url(#${id}-face)`} />
            {/* aro cunhado */}
            <circle cx="32" cy="32" r="30" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="2.4" />
            <circle cx="32" cy="32" r="25.5" fill="none" stroke={m.base} strokeWidth="0.8" opacity="0.5" strokeDasharray="1.5 3" />
            {/* glifo gravado */}
            <Glyph tier={tier} stroke={m.base} />
        </svg>
    );
}
