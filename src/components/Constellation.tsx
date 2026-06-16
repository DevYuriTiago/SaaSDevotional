"use client";

import { motion, useReducedMotion } from "framer-motion";

/* ════════════════════════════════════════════════════════════
   SUA CONSTELAÇÃO — assinatura CARTA CELESTE.
   Cada noite fiel (devocional/dia de streak) acende uma estrela,
   posicionada de forma DETERMINÍSTICA, e uma linha de ouro a liga
   à anterior — como um gravador inscrevendo uma carta celeste.
   Pura geometria vetorial: impossível de clonar por um template.
   ════════════════════════════════════════════════════════════ */

const GOLDEN = 2.399963229728653; // ângulo áureo (rad)

/** posição determinística da i-ésima estrela do usuário (espiral áurea) */
function starPos(i: number) {
    const a = i * GOLDEN;
    const r = Math.sqrt(i + 0.6) * 7.2;
    return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r * 0.92 };
}

/** estrelas "fixas" do fundo (o Verbo como Norte imóvel) — sempre presentes */
function fixedStars(n: number) {
    const out: { x: number; y: number; r: number }[] = [];
    for (let k = 0; k < n; k++) {
        const sx = Math.abs((Math.sin(k * 12.9898) * 43758.5453) % 1);
        const sy = Math.abs((Math.sin(k * 78.233 + 1.3) * 12543.987) % 1);
        out.push({ x: 5 + sx * 90, y: 5 + sy * 90, r: 0.35 + (k % 3) * 0.18 });
    }
    return out;
}

interface ConstellationProps {
    /** quantas estrelas do usuário acender (ex.: dias de streak ou devocionais) */
    count: number;
    /** cor de cada estrela (tom da emoção daquele dia); cai para ouro */
    tones?: string[];
    /** anima o traçado da linha mais recente */
    animate?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export default function Constellation({
    count,
    tones = [],
    animate = true,
    className = "",
    style,
}: ConstellationProps) {
    const reduce = useReducedMotion();
    const n = Math.max(0, Math.min(count, 21));
    const pts = Array.from({ length: n }, (_, i) => starPos(i));
    const bg = fixedStars(16);

    const linePath =
        pts.length > 1
            ? "M" + pts.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" L ")
            : "";

    const doDraw = animate && !reduce;

    return (
        <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className={className}
            style={style}
            aria-hidden="true"
        >
            {/* Estrelas fixas (céu de fundo — belo mesmo no dia 0) */}
            {bg.map((s, i) => (
                <circle key={`f${i}`} cx={s.x} cy={s.y} r={s.r} fill="var(--gold-light)" opacity={0.18} />
            ))}

            {/* Linha de ouro ligando suas noites */}
            {linePath && (
                <motion.path
                    d={linePath}
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth={0.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.7}
                    initial={doDraw ? { pathLength: 0, opacity: 0 } : false}
                    animate={doDraw ? { pathLength: 1, opacity: 0.7 } : undefined}
                    transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                />
            )}

            {/* As estrelas do usuário (a mais recente brilha e cintila) */}
            {pts.map((p, i) => {
                const newest = i === pts.length - 1;
                const tone = tones[i] || "var(--gold)";
                return (
                    <g key={`s${i}`}>
                        {newest && (
                            <circle cx={p.x} cy={p.y} r={3.4} fill="var(--gold)" opacity={0.16} className="animate-twinkle" />
                        )}
                        <path
                            d={`M${p.x} ${p.y - 2.2}L${p.x + 0.7} ${p.y - 0.7} ${p.x + 2.2} ${p.y} ${p.x + 0.7} ${p.y + 0.7} ${p.x} ${p.y + 2.2} ${p.x - 0.7} ${p.y + 0.7} ${p.x - 2.2} ${p.y} ${p.x - 0.7} ${p.y - 0.7}Z`}
                            fill={newest ? "var(--gold)" : tone}
                            opacity={newest ? 1 : 0.78}
                        />
                    </g>
                );
            })}
        </svg>
    );
}
