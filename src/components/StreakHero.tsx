"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@/components/icons";
import { STREAK_MILESTONES } from "@/lib/constants";

/* ════════════════════════════════════════════════════════════
   A CHAMA DA VIGÍLIA — gamificação de constância.
   "Mantende as vossas lâmpadas acesas" (Mt 25). A chama puxa o
   retorno diário por aversão à perda: acesa hoje → brilha; streak
   vivo mas hoje pendente → pulsa em espera; zerada → fria.
   ════════════════════════════════════════════════════════════ */

function dayKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface StreakHeroProps {
    streak: number;
    lastDate: string | null;
    activeDates: string[];
}

export default function StreakHero({ streak, lastDate, activeDates }: StreakHeroProps) {
    const reduce = useReducedMotion();
    const today = new Date();
    const todayKey = dayKey(today);
    const activeSet = new Set(activeDates.map((s) => dayKey(new Date(s))));
    const doneToday = activeSet.has(todayKey) || (lastDate ? dayKey(new Date(lastDate)) === todayKey : false);

    // Semana atual (domingo → sábado)
    const letters = ["D", "S", "T", "Q", "Q", "S", "S"];
    const week = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - today.getDay() + i);
        const k = dayKey(d);
        return {
            letter: letters[i],
            active: activeSet.has(k) || (k === todayKey && doneToday),
            isToday: k === todayKey,
            isFuture: d > today && k !== todayKey,
        };
    });

    // Próximo marco
    const next = STREAK_MILESTONES.find((m) => m.days > streak);
    const prev = [...STREAK_MILESTONES].reverse().find((m) => m.days <= streak);
    const prevDays = prev?.days ?? 0;
    const pct = next ? Math.min(100, Math.round(((streak - prevDays) / (next.days - prevDays)) * 100)) : 100;

    // Estado da chama
    const flameState: "bright" | "waiting" | "cold" =
        doneToday ? "bright" : streak > 0 ? "waiting" : "cold";

    let title: string;
    let sub: string;
    const showCta = !doneToday;
    if (flameState === "cold") {
        title = "Comece sua vigília";
        sub = "Acenda a primeira chama hoje.";
    } else if (flameState === "bright") {
        title = "Chama acesa hoje";
        sub = "Volte amanhã para manter sua sequência viva.";
    } else {
        title = "Sua chama espera por você";
        sub = `Não deixe ${streak} ${streak === 1 ? "dia" : "dias"} se apagar — acenda a de hoje.`;
    }

    const flameColor = flameState === "cold" ? "var(--text-muted)" : "var(--gold)";
    const flicker = flameState === "bright" && !reduce;
    const waiting = flameState === "waiting" && !reduce;

    return (
        <div className="card-base p-6 relative overflow-hidden text-center">
            {/* brilho quente atrás da chama */}
            {flameState !== "cold" && (
                <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{
                    top: -30, width: 220, height: 220,
                    background: "radial-gradient(circle, rgba(247,201,122,0.16) 0%, transparent 65%)",
                }} />
            )}

            {/* A chama */}
            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    className="flex items-center justify-center rounded-full mb-3"
                    style={{
                        width: 78, height: 78,
                        background: flameState === "cold" ? "rgba(255,252,245,0.04)" : "rgba(247,201,122,0.08)",
                        border: `1px solid ${flameState === "cold" ? "var(--glass-border)" : "rgba(247,201,122,0.3)"}`,
                        boxShadow: flameState === "bright" ? "0 0 32px rgba(247,201,122,0.35)" : "none",
                    }}
                    animate={
                        flicker ? { scale: [1, 1.05, 0.98, 1.03, 1] }
                            : waiting ? { opacity: [0.6, 1, 0.6] }
                                : {}
                    }
                    transition={{ duration: flicker ? 2.4 : 2.8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Icon name="flame" size={38} strokeWidth={1.5}
                        style={{ color: flameColor, opacity: flameState === "cold" ? 0.5 : 1, filter: flameState === "bright" ? "drop-shadow(0 0 8px rgba(247,201,122,0.6))" : "none" }} />
                </motion.div>

                <p className="font-display leading-none" style={{ color: flameState === "cold" ? "var(--text-secondary)" : "var(--gold)", fontSize: "3.2rem", fontWeight: 400 }}>
                    {streak}
                </p>
                <p className="eyebrow mt-1.5">{streak === 1 ? "dia de vigília" : "dias de vigília"}</p>

                {/* Estado do dia + CTA */}
                <div className="mt-4 mb-5">
                    <p className="font-display text-lg mb-0.5" style={{ color: "var(--cream)", fontWeight: 500 }}>{title}</p>
                    <p className="text-xs px-2" style={{ color: "var(--text-secondary)" }}>{sub}</p>
                </div>

                {showCta ? (
                    <Link href="/emotion" className="btn-primary mb-5" style={{ height: 48 }}>
                        <Icon name="flame" size={17} strokeWidth={1.8} />
                        {flameState === "cold" ? "Acender a primeira chama" : "Acender a chama de hoje"}
                    </Link>
                ) : (
                    <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full"
                        style={{ background: "rgba(247,201,122,0.08)", border: "1px solid rgba(247,201,122,0.2)" }}>
                        <Icon name="check" size={15} strokeWidth={2} style={{ color: "var(--gold)" }} />
                        <span className="text-xs font-medium" style={{ color: "var(--cream)" }}>Encontro de hoje concluído</span>
                    </div>
                )}
            </div>

            {/* Faixa da semana */}
            <div className="relative z-10 flex items-end justify-between gap-1 mb-5 px-1">
                {week.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5" style={{ opacity: d.isFuture ? 0.4 : 1 }}>
                        <span className="text-[10px]" style={{ color: d.isToday ? "var(--gold)" : "var(--text-muted)" }}>{d.letter}</span>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                            style={
                                d.active
                                    ? { background: "var(--gradient-gold)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }
                                    : d.isToday
                                        ? { border: "1.5px solid rgba(247,201,122,0.6)", background: "rgba(247,201,122,0.06)" }
                                        : { border: "1px solid var(--glass-border)" }
                            }>
                            {d.active && <Icon name="flame" size={12} strokeWidth={2} style={{ color: "#2A1E08" }} />}
                            {!d.active && d.isToday && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold)" }} />}
                        </div>
                    </div>
                ))}
            </div>

            {/* Próximo marco */}
            {next && (
                <div className="relative z-10 text-left">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            Próximo marco: <span style={{ color: "var(--cream)" }}>{next.label}</span>
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>faltam {next.days - streak}</p>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,252,245,0.05)" }}>
                        <motion.div className="h-full rounded-full" style={{ background: "var(--gradient-gold)" }}
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
                    </div>
                </div>
            )}
        </div>
    );
}
