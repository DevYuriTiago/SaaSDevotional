"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { JOURNEY_THEMES } from "@/lib/constants";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";
import { isPremium as isPremiumProfile } from "@/lib/premium";
import { Icon, journeyGlyph } from "@/components/icons";

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
                supabase.from("profiles").select("subscription_tier, premium_until").eq("id", user.id).single(),
                supabase
                    .from("journey_plans")
                    .select("slug, journey_days(count)")
                    .eq("user_id", user.id),
            ]);

            setIsPremium(isPremiumProfile(profile));
            setPlans(
                (rawPlans ?? []).map((p: { slug: string; journey_days: unknown }) => ({
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
        // Free também entra: percorre os 7 primeiros dias; o paywall aparece no 8º.
        return `/journey/${slug}`;
    }

    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden pb-24 lg:pb-10">
            <div className="relative z-10 max-w-md lg:max-w-2xl mx-auto px-5 pt-10">
                <div className="mb-2">
                    <p className="eyebrow mb-1.5" style={{ color: "var(--text-muted)" }}><span className="gold-rule" /> Aprofundamento</p>
                    <h1 className="font-display text-2xl" style={{ color: "var(--cream)" }}>Jornadas de 21 dias</h1>
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
                            <p className="eyebrow mb-2">Em andamento</p>
                            <Link href={`/journey/${t.slug}`} className="block rounded-2xl p-5 relative overflow-hidden surface-wood transition-all hover:-translate-y-0.5">
                                <div className="absolute left-0 right-0 bottom-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)", opacity: 0.6 }} />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(255,252,245,0.05)" }}>
                                            <Icon name={journeyGlyph(t.slug)} size={24} style={{ color: "var(--text-secondary)" }} />
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-display text-base" style={{ color: "var(--cream)" }}>{t.label}</p>
                                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{activeJourney!.completedDays} de 21 dias concluídos</p>
                                        </div>
                                        <span className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>{pct}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(247,201,122,0.15)" }}>
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: "var(--gradient-gold)" }}
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

                <div className="space-y-3">
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
                                    className="card-base card-hover p-4 flex items-start gap-3"
                                    style={isActive ? { borderColor: "rgba(247,201,122,0.4)" } : undefined}
                                >
                                    <div
                                        className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                                        style={{ background: isOtherActive ? "rgba(120,110,90,0.10)" : "rgba(255,252,245,0.05)", opacity: isOtherActive ? 0.5 : 1 }}
                                    >
                                        <Icon name={journeyGlyph(journey.slug)} size={22} style={{ color: isOtherActive ? "var(--text-muted)" : "var(--text-secondary)" }} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Linha título + badge */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-display text-base leading-snug truncate" style={{ color: isOtherActive ? "var(--text-muted)" : "var(--cream)" }}>
                                                {journey.label}
                                            </h3>
                                            {isCompleted && (
                                                <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full whitespace-nowrap inline-flex items-center gap-1"
                                                    style={{ background: "rgba(255,252,245,0.05)", color: "var(--text-secondary)" }}>
                                                    <Icon name="check" size={11} /> Concluída
                                                </span>
                                            )}
                                            {isActive && (
                                                <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                                                    style={{ background: "rgba(255,252,245,0.05)", color: "var(--text-secondary)" }}>
                                                    Em andamento
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-muted)" }}>{journey.description}</p>

                                        {plan && !isCompleted ? (
                                            <div>
                                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{plan.completedDays} / 21 dias</span>
                                                <div className="h-1 rounded-full overflow-hidden mt-1" style={{ background: "rgba(255,252,245,0.06)" }}>
                                                    <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 3)}%`, background: "var(--gradient-gold)" }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                                                    style={{ background: "rgba(255,252,245,0.05)", color: "var(--text-secondary)" }}>
                                                    21 dias
                                                </span>
                                                {!isPremium && (
                                                    <span className="text-xs whitespace-nowrap inline-flex items-center gap-1" style={{ color: "var(--gold)" }}><Icon name="sparkle" size={11} /> 7 dias grátis</span>
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
                        style={{ background: "rgba(247,201,122,0.08)", border: "1px solid rgba(247,201,122,0.22)" }}
                    >
                        <Icon name="crown" size={32} style={{ color: "var(--gold)" }} className="mx-auto mb-3" />
                        <h3 className="font-display text-lg mb-2" style={{ color: "var(--cream)" }}>Comece grátis, vá até o fim no Premium</h3>
                        <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>Os 7 primeiros dias de uma jornada são grátis. O Premium libera os 21 dias completos + devocionais ilimitados, a partir de R$ 16,58/mês.</p>
                        <Link href="/subscription" className="btn-primary">Conhecer o Premium</Link>
                    </motion.div>
                )}
            </div>
            <BottomNav />
        </main>
    );
}
