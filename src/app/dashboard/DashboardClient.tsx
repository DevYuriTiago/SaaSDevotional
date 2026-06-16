"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatShortDate } from "@/lib/utils";
import { JOURNEY_THEMES } from "@/lib/constants";
import type { Devotional, JournalEntry } from "@/types";
import BottomNav from "@/components/BottomNav";
import StreakHero from "@/components/StreakHero";
import { Icon, journeyGlyph } from "@/components/icons";

interface Props {
    profile: Record<string, unknown> | null;
    devotionals: Devotional[];
    journalEntries: JournalEntry[];
    activeDates?: string[];
}

export default function DashboardClient({ profile, devotionals, journalEntries, activeDates = [] }: Props) {
    const name = (profile?.name as string) ?? "Amigo";
    const streak = (profile?.streak_days as number) ?? 0;
    const lastDate = (profile?.last_devotional_date as string) ?? null;
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

    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden pb-24 lg:pb-10">
            <div className="relative z-10 max-w-md lg:max-w-5xl mx-auto px-5 pt-10">
                <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">

                    {/* ── Coluna principal ── */}
                    <div>
                        {/* Header */}
                        <motion.div custom={0} variants={card} initial="hidden" animate="visible" className="flex items-center justify-between mb-7">
                            <div>
                                <p className="eyebrow mb-1.5" style={{ color: "var(--text-muted)" }}><span className="gold-rule" /> {greeting}</p>
                                <h1 className="font-display text-2xl" style={{ color: "var(--cream)" }}>{name}</h1>
                            </div>
                            <Link
                                href="/profile"
                                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{ background: "var(--gradient-gold)", color: "#2A1E08", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }}
                            >
                                {name[0]?.toUpperCase()}
                            </Link>
                        </motion.div>

                        {/* Chama da Vigília — constância e retorno diário */}
                        <motion.div custom={1} variants={card} initial="hidden" animate="visible" className="mb-5">
                            <StreakHero streak={streak} lastDate={lastDate} activeDates={activeDates} />
                        </motion.div>

                        {/* CTA principal */}
                        <motion.div custom={2} variants={card} initial="hidden" animate="visible" className="mb-5">
                            <Link href="/emotion" className="block rounded-3xl p-6 relative overflow-hidden surface-wood transition-all hover:-translate-y-0.5">
                                <div className="absolute left-0 right-0 bottom-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)", opacity: 0.6 }} />
                                <p className="eyebrow mb-2">agora</p>
                                <h2 className="font-display text-xl mb-1" style={{ color: "var(--cream)" }}>
                                    O que você está sentindo?
                                </h2>
                                <p className="text-sm flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                                    Receba seu devocional personalizado <Icon name="arrow-right" size={15} style={{ color: "var(--gold)" }} />
                                </p>
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        <motion.div custom={3} variants={card} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 mb-5">
                            <div className="card-base p-4 flex items-center gap-3">
                                <Icon name="book" size={20} style={{ color: "var(--text-muted)" }} />
                                <div>
                                    <p className="font-display text-2xl leading-none" style={{ color: "var(--cream)" }}>{totalDevotionals}</p>
                                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Devocionais</p>
                                </div>
                            </div>
                            <div className="card-base p-4 flex items-center gap-3">
                                <Icon name="pen" size={20} style={{ color: "var(--text-muted)" }} />
                                <div>
                                    <p className="font-display text-2xl leading-none" style={{ color: "var(--cream)" }}>{journalEntries.length}</p>
                                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>No diário</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Premium upsell */}
                        {!isPremium && devotionalsUsed >= 1 && (
                            <motion.div custom={4} variants={card} initial="hidden" animate="visible" className="mb-5">
                                <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "rgba(247,201,122,0.08)", border: "1px solid rgba(247,201,122,0.22)" }}>
                                    <Icon name="crown" size={26} style={{ color: "var(--gold)", flexShrink: 0 }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--cream)" }}>Limite gratuito atingido</p>
                                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>R$ 24,90/mês para devocionais ilimitados</p>
                                    </div>
                                    <Link href="/subscription" className="text-xs font-semibold px-4 py-2 rounded-full flex-shrink-0"
                                        style={{ background: "var(--gradient-gold)", color: "#2A1E08" }}>
                                        Assinar
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {/* Devocionais recentes */}
                        <motion.div custom={5} variants={card} initial="hidden" animate="visible" className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold" style={{ color: "var(--cream)" }}>Devocionais recentes</h3>
                                <Link href="/devotional/history" className="text-xs" style={{ color: "var(--text-muted)" }}>Ver todos</Link>
                            </div>
                            <div className="space-y-2">
                                {devotionals.length === 0 ? (
                                    <div className="card-base p-5 text-center">
                                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Nenhum devocional ainda</p>
                                        <Link href="/emotion" className="text-sm mt-2 inline-flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>Gerar agora <Icon name="arrow-right" size={14} /></Link>
                                    </div>
                                ) : (
                                    devotionals.slice(0, 3).map((dev) => (
                                        <div key={dev.id} className="card-base p-4 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(255,252,245,0.05)" }}>
                                                <Icon name="book" size={17} style={{ color: "var(--text-secondary)" }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: "var(--cream)" }}>{dev.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,252,245,0.05)", color: "var(--text-muted)" }}>{dev.emotion}</span>
                                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatShortDate(dev.created_at)}</span>
                                                </div>
                                            </div>
                                            {dev.is_saved && <Icon name="bookmark" size={15} style={{ color: "var(--gold)", fill: "var(--gold)" }} />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Coluna lateral ── */}
                    <div>
                        <motion.div custom={6} variants={card} initial="hidden" animate="visible" className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold" style={{ color: "var(--cream)" }}>Jornadas de 21 dias</h3>
                                <Link href="/journey" className="text-xs" style={{ color: "var(--text-muted)" }}>Ver todas</Link>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {JOURNEY_THEMES.slice(0, 4).map((j) => (
                                    <Link key={j.slug} href={isPremium ? `/journey/${j.slug}` : "/subscription"} className="card-base card-hover p-4 block">
                                        <Icon name={journeyGlyph(j.slug)} size={22} style={{ color: "var(--text-secondary)" }} className="mb-2" />
                                        <p className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>{j.label}</p>
                                        {!isPremium && <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "var(--text-muted)" }}><Icon name="lock" size={11} /> Premium</p>}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        {journalEntries.length > 0 && (
                            <motion.div custom={7} variants={card} initial="hidden" animate="visible" className="mb-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold" style={{ color: "var(--cream)" }}>Diário</h3>
                                    <Link href="/journal" className="text-xs" style={{ color: "var(--text-muted)" }}>Ver tudo</Link>
                                </div>
                                <div className="space-y-2">
                                    {journalEntries.slice(0, 2).map((entry) => (
                                        <div key={entry.id} className="card-base p-4">
                                            <p className="text-xs line-clamp-3 leading-relaxed font-serif-devotional" style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>{entry.content}</p>
                                            <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>{formatShortDate(entry.created_at)}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            <BottomNav />
        </main>
    );
}
