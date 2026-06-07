"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatShortDate } from "@/lib/utils";
import { JOURNEY_THEMES } from "@/lib/constants";
import type { Devotional, JournalEntry } from "@/types";
import BottomNav from "@/components/BottomNav";

interface Props {
    profile: Record<string, unknown> | null;
    devotionals: Devotional[];
    journalEntries: JournalEntry[];
}

export default function DashboardClient({ profile, devotionals, journalEntries }: Props) {
    const name = (profile?.name as string) ?? "Amigo";
    const streak = (profile?.streak_days as number) ?? 0;
    const totalDevotionals = (profile?.total_devotionals as number) ?? 0;
    const isPremium = profile?.subscription_tier === "premium";
    const devotionalsUsed = (profile?.devotionals_used as number) ?? 0;

    const card = {
        hidden: { opacity: 0, y: 16 },
        visible: (i: number) => ({
            opacity: 1, y: 0,
            transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" as const },
        }),
    };

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

    // Build 7-day streak dots
    const last7 = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const label = d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
        const active = i >= 7 - streak;
        return { label, active };
    });

    return (
        <main className="relative min-h-dvh overflow-x-hidden pb-24 lg:pb-10">
            <div className="relative z-10 max-w-md lg:max-w-5xl mx-auto px-5 pt-10">

                {/* ── Desktop: grid 2 colunas ── */}
                <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">

                    {/* ── Coluna principal ── */}
                    <div>
                        {/* Header */}
                        <motion.div
                            custom={0}
                            variants={card}
                            initial="hidden"
                            animate="visible"
                            className="flex items-center justify-between mb-7"
                        >
                            <div>
                                <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{greeting},</p>
                                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{name} 👋</h1>
                            </div>
                            <Link
                                href="/profile"
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{ background: "var(--gradient-primary)", color: "white" }}
                            >
                                {name[0]}
                            </Link>
                        </motion.div>

                        {/* Streak strip */}
                        <motion.div
                            custom={1}
                            variants={card}
                            initial="hidden"
                            animate="visible"
                            className="card-base p-4 mb-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="streak-badge">🔥 {streak} dias</span>
                                </div>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Constância espiritual</p>
                            </div>
                            <div className="flex items-end justify-between gap-1">
                                {last7.map((day, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5">
                                        <div
                                            className="w-8 h-8 rounded-full transition-all duration-300"
                                            style={{
                                                background: day.active
                                                    ? "var(--gradient-button)"
                                                    : "var(--glass)",
                                                border: `1px solid ${day.active ? "transparent" : "var(--glass-border)"}`,
                                                boxShadow: day.active ? "0 0 12px rgba(168,85,247,0.4)" : "none",
                                            }}
                                        />
                                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{day.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* CTA principal */}
                        <motion.div custom={2} variants={card} initial="hidden" animate="visible" className="mb-5">
                            <Link
                                href="/emotion"
                                className="block rounded-3xl p-6 relative overflow-hidden"
                                style={{
                                    background: "var(--gradient-button)",
                                    boxShadow: "var(--shadow-button)",
                                }}
                            >
                                <div className="absolute inset-0 opacity-20"
                                    style={{ background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3), transparent)" }}
                                />
                                <p className="text-xs font-medium mb-2 relative z-10" style={{ color: "rgba(255,255,255,0.75)" }}>Agora</p>
                                <h2 className="text-lg font-bold mb-1 relative z-10 text-white">
                                    O que você está sentindo?
                                </h2>
                                <p className="text-sm relative z-10" style={{ color: "rgba(255,255,255,0.75)" }}>
                                    Receba seu devocional personalizado →
                                </p>
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        <motion.div custom={3} variants={card} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 mb-5">
                            <div className="card-base p-4">
                                <p className="text-2xl font-bold mb-0.5" style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{totalDevotionals}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>📖 Devocionais</p>
                            </div>
                            <div className="card-base p-4">
                                <p className="text-2xl font-bold mb-0.5" style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{journalEntries.length}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>📝 No diário</p>
                            </div>
                        </motion.div>

                        {/* Premium upsell */}
                        {!isPremium && devotionalsUsed >= 1 && (
                            <motion.div custom={4} variants={card} initial="hidden" animate="visible" className="mb-5">
                                <div
                                    className="rounded-2xl p-5 flex items-center gap-4"
                                    style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)" }}
                                >
                                    <span className="text-2xl flex-shrink-0">👑</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>Limite gratuito atingido</p>
                                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>R$ 24,90/mês para devocionais ilimitados</p>
                                    </div>
                                    <Link href="/subscription" className="text-xs font-semibold px-4 py-2 rounded-full flex-shrink-0"
                                        style={{ background: "var(--gradient-button)", color: "white" }}>
                                        Assinar
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {/* Recent devotionals */}
                        <motion.div custom={5} variants={card} initial="hidden" animate="visible" className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Devocionais recentes</h3>
                                <Link href="/devotional/history" className="text-xs" style={{ color: "var(--brand-purple)" }}>Ver todos</Link>
                            </div>
                            <div className="space-y-2">
                                {devotionals.length === 0 ? (
                                    <div className="card-base p-5 text-center">
                                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Nenhum devocional ainda</p>
                                        <Link href="/emotion" className="text-sm mt-2 block" style={{ color: "var(--brand-purple)" }}>Gerar agora →</Link>
                                    </div>
                                ) : (
                                    devotionals.slice(0, 3).map((dev) => (
                                        <div key={dev.id} className="card-base p-4 flex items-center gap-3">
                                            <div
                                                className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                                                style={{ background: "rgba(168,85,247,0.12)" }}
                                            >📖</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{dev.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.10)", color: "var(--brand-purple)" }}>{dev.emotion}</span>
                                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatShortDate(dev.created_at)}</span>
                                                </div>
                                            </div>
                                            {dev.is_saved && <span className="text-xs flex-shrink-0">🔖</span>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>{/* fim coluna principal */}

                    {/* ── Coluna lateral (desktop only) ── */}
                    <div>
                        {/* Journeys */}
                        <motion.div custom={6} variants={card} initial="hidden" animate="visible" className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Jornadas de 21 dias</h3>
                                <Link href="/journey" className="text-xs" style={{ color: "var(--brand-purple)" }}>Ver todas</Link>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {JOURNEY_THEMES.slice(0, 4).map((j) => (
                                    <Link
                                        key={j.slug}
                                        href={isPremium ? `/journey/${j.slug}` : "/subscription"}
                                        className="card-base p-4 block"
                                    >
                                        <span className="text-2xl mb-2 block">{j.emoji}</span>
                                        <p className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>{j.label}</p>
                                        {!isPremium && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>👑 Premium</p>}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        {/* Diário recente (desktop) */}
                        {journalEntries.length > 0 && (
                            <motion.div custom={7} variants={card} initial="hidden" animate="visible" className="mb-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Diário</h3>
                                    <Link href="/journal" className="text-xs" style={{ color: "var(--brand-purple)" }}>Ver tudo</Link>
                                </div>
                                <div className="space-y-2">
                                    {journalEntries.slice(0, 2).map((entry) => (
                                        <div key={entry.id} className="card-base p-4">
                                            <p className="text-xs line-clamp-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{entry.content}</p>
                                            <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>{formatShortDate(entry.created_at)}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>{/* fim coluna lateral */}

                </div>{/* fim grid */}
            </div>

            <BottomNav />
        </main>
    );
}
