"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatShortDate, brazilNow } from "@/lib/utils";
import { JOURNEY_THEMES, EMOTION_CATEGORIES } from "@/lib/constants";
import type { Devotional, JournalEntry } from "@/types";
import BottomNav from "@/components/BottomNav";
import MilestoneCelebration from "@/components/MilestoneCelebration";
import { toast } from "@/store";
import { Icon, EmotionGlyph, journeyGlyph, type IconName } from "@/components/icons";

interface ActiveJourney {
    slug: string;
    completedDays: number;
}

interface Props {
    profile: Record<string, unknown> | null;
    devotionals: Devotional[];
    journalEntries: JournalEntry[];
    activeDates?: string[];
    activeJourney?: ActiveJourney | null;
}

// Atalhos de emoção no card "Momento de hoje".
const QUICK_EMOTIONS = ["ansioso", "cansado", "triste", "grato"];

export default function DashboardClient({ profile, devotionals, journalEntries, activeDates = [], activeJourney = null }: Props) {
    const name = (profile?.name as string) ?? "Amigo";
    const firstName = name.split(" ")[0];
    const avatarUrl = (profile?.avatar_url as string) ?? null;
    const streak = (profile?.streak_days as number) ?? 0;
    const totalDevotionals = (profile?.total_devotionals as number) ?? 0;
    const distinctDays = new Set(activeDates.map((d) => d.slice(0, 10))).size;

    const hour = brazilNow().getHours();
    const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

    const quickChips = QUICK_EMOTIONS
        .map((id) => EMOTION_CATEGORIES.find((e) => e.id === id))
        .filter(Boolean) as typeof EMOTION_CATEGORIES;

    const lastDevotional = devotionals[0] ?? null;
    const lastJournal = journalEntries[0] ?? null;
    const journeyTheme = activeJourney ? JOURNEY_THEMES.find((j) => j.slug === activeJourney.slug) : null;

    const fade = {
        hidden: { opacity: 0, y: 18 },
        visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" as const } }),
    };

    const stats: { icon: IconName; value: number; label: string }[] = [
        { icon: "book", value: totalDevotionals, label: "Devocionais\nconcluídos" },
        { icon: "calendar", value: distinctDays, label: "Dias de vigília\nconcluídos" },
        { icon: "compass", value: activeJourney ? 1 : 0, label: "Jornada ativa\nagora" },
        { icon: "star", value: streak, label: "Dias de\nsequência" },
    ];

    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden pb-28">
            <div className="relative z-10 max-w-md mx-auto px-5 pt-9">
                {/* ── Header ── */}
                <motion.div custom={0} variants={fade} initial="hidden" animate="visible" className="flex items-start justify-between mb-7">
                    <div className="min-w-0">
                        <p suppressHydrationWarning className="eyebrow mb-1.5" style={{ color: "var(--text-muted)" }}>{greeting}</p>
                        <h1 className="font-display text-2xl mb-1.5" style={{ color: "var(--cream)" }}>{firstName}</h1>
                        <p className="text-sm leading-snug" style={{ color: "var(--text-secondary)" }}>
                            Deus tem uma palavra para<br />o momento que você está vivendo.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3 flex-shrink-0 ml-3">
                        <Link
                            href="/profile"
                            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold overflow-hidden"
                            style={{
                                background: avatarUrl ? "var(--glass)" : "var(--gradient-gold)",
                                border: avatarUrl ? "1.5px solid rgba(247,201,122,0.4)" : "none",
                                color: "#2A1E08",
                                boxShadow: avatarUrl ? "none" : "inset 0 1px 0 rgba(255,255,255,0.4)",
                            }}
                        >
                            {avatarUrl
                                ? <Image src={avatarUrl} alt="" width={48} height={48} className="w-12 h-12 object-cover" unoptimized />
                                : firstName[0]?.toUpperCase()}
                        </Link>
                        <button
                            onClick={() => toast({ type: "info", title: "Notificações em breve" })}
                            aria-label="Notificações"
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}
                        >
                            <Icon name="bell" size={17} style={{ color: "var(--text-secondary)" }} />
                        </button>
                    </div>
                </motion.div>

                {/* ── Momento de hoje ── */}
                <motion.div custom={1} variants={fade} initial="hidden" animate="visible" className="mb-7">
                    <div className="relative rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(247,201,122,0.28)" }}>
                        {/* foto de amanhecer */}
                        <Image src="/scene-dawn.png" alt="" fill priority className="object-cover" style={{ objectPosition: "70% 40%" }} />
                        {/* véu para legibilidade */}
                        <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(7,7,13,0.96) 38%, rgba(7,7,13,0.55) 70%, rgba(7,7,13,0.25) 100%)" }} />
                        <div className="relative z-10 p-6">
                            <p className="eyebrow mb-4 inline-flex items-center gap-2" style={{ color: "var(--gold)" }}>
                                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(247,201,122,0.12)", border: "1px solid rgba(247,201,122,0.3)" }}>
                                    <Icon name="sparkle" size={13} style={{ color: "var(--gold)" }} />
                                </span>
                                Momento de hoje
                            </p>
                            <h2 className="font-display leading-tight mb-2" style={{ color: "var(--cream)", fontSize: "1.7rem", fontWeight: 400 }}>
                                Como está seu<br /><span style={{ fontStyle: "italic", color: "var(--gold)" }}>coração hoje?</span>
                            </h2>
                            <p className="text-sm mb-5 max-w-[17rem]" style={{ color: "var(--text-secondary)" }}>
                                Escolha como você está se sentindo para receber um direcionamento personalizado.
                            </p>

                            <div className="grid grid-cols-2 gap-2.5 mb-3">
                                {quickChips.map((e) => (
                                    <Link
                                        key={e.id}
                                        href="/emotion"
                                        className="flex items-center gap-2.5 rounded-2xl px-3.5 py-3"
                                        style={{ background: "rgba(11,11,18,0.5)", border: "1px solid var(--glass-border)", backdropFilter: "blur(8px)" }}
                                    >
                                        <EmotionGlyph glyph={e.glyph} size={20} strokeWidth={1.6} style={{ color: e.color }} />
                                        <span className="text-sm" style={{ color: "var(--cream)" }}>{e.label}</span>
                                    </Link>
                                ))}
                            </div>

                            <Link
                                href="/emotion"
                                className="flex items-center justify-center gap-2 rounded-2xl py-3 w-full"
                                style={{ background: "rgba(11,11,18,0.5)", border: "1px solid var(--glass-border)", backdropFilter: "blur(8px)" }}
                            >
                                <Icon name="pen" size={16} style={{ color: "var(--gold)" }} />
                                <span className="text-sm font-medium" style={{ color: "var(--cream)" }}>Quero contar com minhas palavras</span>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* ── Sua jornada atual ── */}
                {activeJourney && journeyTheme && (
                    <motion.div custom={2} variants={fade} initial="hidden" animate="visible" className="mb-7">
                        <div className="flex items-center justify-between mb-3">
                            <p className="eyebrow" style={{ color: "var(--text-muted)" }}>Sua jornada atual</p>
                            <Link href="/journey" className="text-xs inline-flex items-center gap-1" style={{ color: "var(--text-muted)" }}>Ver todas <Icon name="chevron-right" size={13} /></Link>
                        </div>
                        <Link href={`/journey/${activeJourney.slug}`} className="block card-base p-5">
                            <div className="flex items-center gap-4">
                                {/* anel de chama */}
                                <div className="relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: "radial-gradient(circle, rgba(247,201,122,0.15), transparent 70%)", boxShadow: "0 0 24px rgba(247,201,122,0.35), inset 0 0 0 1.5px rgba(247,201,122,0.5)" }}>
                                    <Icon name="flame" size={26} style={{ color: "var(--gold)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="eyebrow mb-0.5" style={{ color: "var(--text-muted)", fontSize: 9 }}>Jornada de 21 dias</p>
                                    <p className="font-display text-lg leading-tight" style={{ color: "var(--cream)" }}>{journeyTheme.label}</p>
                                    <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Dia {Math.min(activeJourney.completedDays + 1, 21)} de 21</p>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(247,201,122,0.12)" }}>
                                        <div className="h-full rounded-full" style={{ width: `${Math.max((activeJourney.completedDays / 21) * 100, 4)}%`, background: "var(--gradient-gold)" }} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* ── Último direcionamento ── */}
                {lastDevotional && (
                    <motion.div custom={3} variants={fade} initial="hidden" animate="visible" className="mb-7">
                        <div className="flex items-center justify-between mb-3">
                            <p className="eyebrow" style={{ color: "var(--text-muted)" }}>Último direcionamento</p>
                            <Link href="/devotional/history" className="text-xs inline-flex items-center gap-1" style={{ color: "var(--text-muted)" }}>Ver todas <Icon name="chevron-right" size={13} /></Link>
                        </div>
                        <Link href="/devotional/history" className="flex items-center gap-4 card-base p-4">
                            <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(255,252,245,0.05)", border: "1px solid var(--glass-border)" }}>
                                <Icon name="book" size={20} style={{ color: "var(--text-secondary)" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-display text-base leading-tight mb-1 line-clamp-2" style={{ color: "var(--cream)" }}>{lastDevotional.title}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{lastDevotional.emotion} · {formatShortDate(lastDevotional.created_at)}</p>
                            </div>
                            <Icon name="arrow-right" size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
                        </Link>
                    </motion.div>
                )}

                {/* ── Diário espiritual ── */}
                {lastJournal && (
                    <motion.div custom={4} variants={fade} initial="hidden" animate="visible" className="mb-7">
                        <div className="flex items-center justify-between mb-3">
                            <p className="eyebrow" style={{ color: "var(--text-muted)" }}>Diário espiritual</p>
                            <Link href="/journal" className="text-xs inline-flex items-center gap-1" style={{ color: "var(--text-muted)" }}>Ver tudo <Icon name="chevron-right" size={13} /></Link>
                        </div>
                        <Link href="/journal" className="flex items-center gap-4 card-base p-4">
                            <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(255,252,245,0.05)", border: "1px solid var(--glass-border)" }}>
                                <Icon name="feather" size={20} style={{ color: "var(--text-secondary)" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="eyebrow mb-1" style={{ color: "var(--text-muted)", fontSize: 9 }}>Última anotação</p>
                                <p className="font-serif-devotional leading-snug line-clamp-2" style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>&ldquo;{lastJournal.content}&rdquo;</p>
                                <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{formatShortDate(lastJournal.created_at)}</p>
                            </div>
                            <Icon name="arrow-right" size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
                        </Link>
                    </motion.div>
                )}

                {/* ── Sua caminhada ── */}
                <motion.div custom={5} variants={fade} initial="hidden" animate="visible">
                    <div className="flex items-center justify-between mb-3">
                        <p className="eyebrow" style={{ color: "var(--text-muted)" }}>Sua caminhada</p>
                        <Link href="/profile" className="text-xs inline-flex items-center gap-1" style={{ color: "var(--text-muted)" }}>Ver progresso <Icon name="chevron-right" size={13} /></Link>
                    </div>
                    <div className="card-base p-5 grid grid-cols-4 gap-2">
                        {stats.map((s, i) => (
                            <div key={i} className="text-center flex flex-col items-center" style={{ borderLeft: i === 0 ? "none" : "1px solid var(--glass-border)" }}>
                                <Icon name={s.icon} size={20} style={{ color: "var(--gold)" }} className="mb-1.5" />
                                <p className="font-display text-2xl leading-none mb-1" style={{ color: "var(--cream)" }}>{s.value}</p>
                                <p className="text-[10px] leading-tight whitespace-pre-line" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <MilestoneCelebration streak={streak} />
            <BottomNav />
        </main>
    );
}
