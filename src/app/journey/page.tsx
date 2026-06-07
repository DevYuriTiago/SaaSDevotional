"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { JOURNEY_THEMES } from "@/lib/constants";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";

interface PlanProgress {
    slug: string;
    completedDays: number;
}

export default function JourneyPage() {
    const [isPremium, setIsPremium] = useState(false);
    const [plans, setPlans] = useState<PlanProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setLoading(false); return; }

            const [{ data: profile }, { data: rawPlans }] = await Promise.all([
                supabase.from("profiles").select("subscription_tier").eq("id", user.id).single(),
                supabase
                    .from("journey_plans")
                    .select("slug, journey_days(count)")
                    .eq("user_id", user.id),
            ]);

            setIsPremium(profile?.subscription_tier === "premium");
            setPlans(
                (rawPlans ?? []).map((p) => ({
                    slug: p.slug,
                    completedDays: (p.journey_days as { count: number }[])[0]?.count ?? 0,
                }))
            );
            setLoading(false);
        }
        load();
    }, []);

    const activeJourney = plans.find((p) => p.completedDays < 21);
    const hasActiveJourney = !!activeJourney;

    function getJourneyHref(slug: string): string {
        if (!isPremium) return "/subscription";
        return `/journey/${slug}`;
    }

    return (
        <main className="relative min-h-dvh overflow-x-hidden pb-24 lg:pb-10">
            <div className="relative z-10 max-w-md lg:max-w-2xl mx-auto px-5 pt-10">
                <div className="mb-2">
                    <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Aprofundamento</p>
                    <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Jornadas de 21 dias</h1>
                </div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm mb-6 mt-1" style={{ color: "var(--text-secondary)" }}>
                    Transformação espiritual progressiva — 21 devocionais únicos gerados pela IA.
                </motion.p>

                {!loading && hasActiveJourney && (() => {
                    const t = JOURNEY_THEMES.find((j) => j.slug === activeJourney!.slug);
                    if (!t) return null;
                    const pct = Math.round((activeJourney!.completedDays / 21) * 100);
                    return (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Em andamento</p>
                            <Link href={`/journey/${t.slug}`} className="block rounded-2xl p-5 relative overflow-hidden"
                                style={{ background: "linear-gradient(135deg, rgba(88,28,135,0.4) 0%, rgba(124,58,237,0.25) 100%)", border: "1px solid rgba(168,85,247,0.35)" }}>
                                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 80% 50%, rgba(168,85,247,0.15) 0%, transparent 60%)" }} />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-3xl">{t.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{t.label}</p>
                                            <p className="text-xs" style={{ color: "rgba(196,162,253,0.8)" }}>{activeJourney!.completedDays} de 21 dias concluídos</p>
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: "var(--brand-purple)" }}>{pct}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(168,85,247,0.15)" }}>
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: "var(--gradient-button)" }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max(pct, 3)}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })()}

                <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
                    {JOURNEY_THEMES.map((journey, i) => {
                        const plan = plans.find((p) => p.slug === journey.slug);
                        const isActive = plan && plan.completedDays < 21;
                        const isCompleted = plan && plan.completedDays >= 21;
                        const isOtherActive = hasActiveJourney && activeJourney!.slug !== journey.slug && !isCompleted;
                        const pct = plan ? Math.round((plan.completedDays / 21) * 100) : 0;

                        return (
                            <motion.div key={journey.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                <Link
                                    href={getJourneyHref(journey.slug)}
                                    className="card-base p-4 flex items-start gap-3"
                                    style={isActive ? { borderColor: "rgba(168,85,247,0.4)" } : undefined}
                                >
                                    <div
                                        className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl mt-0.5"
                                        style={{ background: isOtherActive ? "rgba(100,100,100,0.1)" : "rgba(168,85,247,0.12)", opacity: isOtherActive ? 0.5 : 1 }}
                                    >
                                        {journey.emoji}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Linha título + badge */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-sm leading-snug truncate" style={{ color: isOtherActive ? "var(--text-muted)" : "var(--text-primary)" }}>
                                                {journey.label}
                                            </h3>
                                            {isCompleted && (
                                                <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                                                    style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
                                                    ✓ Concluída
                                                </span>
                                            )}
                                            {isActive && (
                                                <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                                                    style={{ background: "rgba(168,85,247,0.15)", color: "var(--brand-purple)" }}>
                                                    Em andamento
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-muted)" }}>{journey.description}</p>

                                        {plan && !isCompleted ? (
                                            <div>
                                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{plan.completedDays} / 21 dias</span>
                                                <div className="h-1 rounded-full overflow-hidden mt-1" style={{ background: "rgba(168,85,247,0.12)" }}>
                                                    <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 3)}%`, background: "var(--gradient-button)" }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                                                    style={{ background: "rgba(168,85,247,0.10)", color: "var(--brand-purple)" }}>
                                                    21 dias
                                                </span>
                                                {!isPremium && (
                                                    <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>👑 Premium</span>
                                                )}
                                                {isOtherActive && isPremium && (
                                                    <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>Complete a ativa primeiro</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {!isPremium && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                        className="mt-6 rounded-2xl p-6 text-center"
                        style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}
                    >
                        <span className="text-3xl mb-3 block">👑</span>
                        <h3 className="font-bold text-base mb-2" style={{ color: "var(--text-primary)" }}>Jornadas no Premium</h3>
                        <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>R$ 24,90/mês — todas as jornadas + devocionais ilimitados.</p>
                        <Link href="/subscription" className="btn-primary">Assinar Premium</Link>
                    </motion.div>
                )}
            </div>
            <BottomNav />
        </main>
    );
}
