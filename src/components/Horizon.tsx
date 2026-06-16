"use client";

import { motion, useReducedMotion } from "framer-motion";

/* ════════════════════════════════════════════════════════════
   O HORIZONTE — assinatura ALVORADA.
   Uma linha de ouro NÍTIDA (não neon) com o calor do amanhecer
   vindo da faixa de gradiente abaixo dela, não de um brilho na
   linha. Pode subir como o nascer do sol (estado de loading).
   Largue dentro de um container relativo.
   ════════════════════════════════════════════════════════════ */

interface HorizonProps {
    /** posição vertical em repouso, 0..1 (fração da altura do pai) */
    position?: number;
    /** anima subindo (amanhecer) — para o loading */
    rising?: boolean;
    /** de onde a linha parte ao subir, 0..1 */
    riseFrom?: number;
    /** intensidade do brilho de alvorada (0..1) */
    glow?: number;
    className?: string;
}

export default function Horizon({
    position = 0.62,
    rising = false,
    riseFrom = 0.82,
    glow = 1,
    className = "",
}: HorizonProps) {
    const reduce = useReducedMotion();
    const restTop = `${position * 100}%`;
    const startTop = `${riseFrom * 100}%`;
    const doRise = rising && !reduce;

    return (
        <motion.div
            aria-hidden
            className={`pointer-events-none absolute left-0 right-0 ${className}`}
            style={{ top: restTop }}
            initial={doRise ? { top: startTop } : false}
            animate={doRise ? { top: restTop } : undefined}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Faixa de amanhecer abaixo da linha — sutil, só um calor de base */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 130,
                    background:
                        "linear-gradient(180deg, rgba(224,151,90,0.12) 0%, rgba(247,201,122,0.03) 32%, transparent 74%)",
                    opacity: glow,
                }}
            />
            {/* Bloom acima da linha — bem contido, para a linha não sumir */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 56,
                    background:
                        "linear-gradient(0deg, rgba(251,227,176,0.10) 0%, transparent 82%)",
                    opacity: glow,
                }}
            />
            {/* A LINHA de ouro — NÍTIDA, gravada (o herói; brilho controlado) */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 1,
                    background:
                        "linear-gradient(90deg, transparent 2%, rgba(247,201,122,0.55) 20%, var(--gold) 50%, rgba(247,201,122,0.55) 80%, transparent 98%)",
                    boxShadow: "0 0 4px rgba(247,201,122,0.55)",
                }}
            />
        </motion.div>
    );
}
