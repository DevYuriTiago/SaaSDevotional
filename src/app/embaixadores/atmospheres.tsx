"use client";

/**
 * Atmosferas da landing de embaixadores — os três mundos do design system
 * aplicados como camadas de fundo (nunca sobre o conteúdo):
 *   CARTA CELESTE — constelação que cintila (seção do ministério)
 *   TALHA DOURADA — cedro + grão + trilho de ouro (jornada e formulário)
 *   ALVORADA      — o horizonte de ouro que nasce (calculadora e fecho)
 * Posições das estrelas são FIXAS (determinísticas) — nada de Math.random
 * no render, para não haver mismatch de hidratação.
 */

// ── CARTA CELESTE ─────────────────────────────────────────────
// Estrelas + traços finos ligando algumas — uma constelação discreta.
const STARS: Array<[number, number, number, number]> = [
    // [x%, y%, raio, delay s]
    [6, 18, 1.3, 0], [14, 62, 0.9, 1.2], [19, 30, 1.1, 2.1], [26, 74, 0.8, 0.6],
    [31, 12, 1.4, 1.8], [38, 48, 1.0, 0.3], [44, 82, 0.9, 2.6], [50, 22, 1.6, 0.9],
    [57, 58, 0.9, 1.5], [63, 8, 1.1, 2.9], [69, 40, 1.3, 0.2], [74, 70, 0.8, 1.1],
    [81, 26, 1.2, 2.3], [87, 55, 1.0, 0.7], [93, 15, 1.4, 1.7], [96, 78, 0.8, 2.8],
    [10, 88, 1.0, 0.4], [55, 90, 1.1, 1.9], [85, 88, 0.9, 3.1], [41, 33, 0.7, 2.4],
];
const LINKS: Array<[number, number]> = [[2, 4], [4, 7], [7, 10], [10, 12], [12, 14], [5, 8], [8, 11]];

export function Constellation({ opacity = 0.5 }: { opacity?: number }) {
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden
            preserveAspectRatio="none" viewBox="0 0 100 100" style={{ opacity }}>
            {LINKS.map(([a, b]) => (
                <line key={`${a}-${b}`}
                    x1={STARS[a][0]} y1={STARS[a][1]} x2={STARS[b][0]} y2={STARS[b][1]}
                    stroke="rgba(247,201,122,0.14)" strokeWidth="0.12" />
            ))}
            {STARS.map(([x, y, r, d], i) => (
                <circle key={i} cx={x} cy={y} r={r * 0.22} fill="var(--gold-light)"
                    className="animate-twinkle" style={{ animationDelay: `${d}s` }} />
            ))}
        </svg>
    );
}

// ── ALVORADA ──────────────────────────────────────────────────
// O calor subindo do horizonte + o arco fino do sol que vem.
export function DawnGlow({ intensity = 1 }: { intensity?: number }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <div className="absolute inset-x-0 bottom-0" style={{
                height: "70%",
                background: `radial-gradient(85% 75% at 50% 108%, rgba(224,151,90,${0.16 * intensity}), rgba(247,201,122,${0.05 * intensity}) 48%, transparent 72%)`,
            }} />
            {/* arco do sol — só a borda superior de um círculo largo */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{
                bottom: "-42vw", width: "84vw", height: "84vw", borderRadius: "50%",
                border: `1px solid rgba(247,201,122,${0.22 * intensity})`,
                boxShadow: `0 -18px 60px rgba(247,201,122,${0.10 * intensity})`,
            }} />
        </div>
    );
}

// ── TALHA DOURADA ─────────────────────────────────────────────
// Grão de folha sobre o cedro (camada de textura para faixas de madeira).
export function WoodGrain() {
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
            backgroundImage: "var(--grain)",
            backgroundSize: "140px 140px",
            opacity: 0.06,
            mixBlendMode: "soft-light",
        }} />
    );
}

// Cantos cerimoniais — a moldura entalhada do altar (formulário).
export function CornerOrnaments() {
    const GOLD = "1.5px solid rgba(247,201,122,0.55)";
    const base: React.CSSProperties = { position: "absolute", width: 26, height: 26 };
    return (
        <div className="absolute inset-3 sm:inset-4 pointer-events-none" aria-hidden>
            <span style={{ ...base, top: 0, left: 0, borderTop: GOLD, borderLeft: GOLD }} />
            <span style={{ ...base, top: 0, right: 0, borderTop: GOLD, borderRight: GOLD }} />
            <span style={{ ...base, bottom: 0, left: 0, borderBottom: GOLD, borderLeft: GOLD }} />
            <span style={{ ...base, bottom: 0, right: 0, borderBottom: GOLD, borderRight: GOLD }} />
        </div>
    );
}

// ── Fio de ouro (Como funciona) ───────────────────────────────
// A linha que caminha pelos três passos — visível só no desktop.
export function GoldThread() {
    return (
        <svg className="hidden md:block absolute inset-x-0 pointer-events-none" aria-hidden
            style={{ top: 96, height: 40 }} width="100%" viewBox="0 0 1000 40" preserveAspectRatio="none">
            <path d="M40 20 C 220 -6, 380 44, 500 20 S 800 -4, 960 20"
                fill="none" stroke="rgba(247,201,122,0.22)" strokeWidth="1.4" strokeDasharray="1 7" strokeLinecap="round" />
            {[40, 500, 960].map((x) => (
                <circle key={x} cx={x} cy={20} r={3.2} fill="var(--gold)" opacity={0.75} />
            ))}
        </svg>
    );
}
