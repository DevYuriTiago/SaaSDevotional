"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { useUIStore } from "@/store";
import { Icon, type IconName } from "@/components/icons";

interface Props {
    profile: Record<string, unknown> | null;
    userEmail: string;
}

const LEVELS = [
    { label: "Iniciante", min: 0 },
    { label: "Buscador", min: 100 },
    { label: "Crescendo", min: 300 },
    { label: "Perseverante", min: 700 },
    { label: "Maduro", min: 1500 },
];

function getLevel(xp: number) {
    const lvl = [...LEVELS].reverse().find((l) => xp >= l.min) ?? LEVELS[0];
    const idx = LEVELS.indexOf(lvl);
    const next = LEVELS[idx + 1];
    const pct = next
        ? Math.min(100, Math.round(((xp - lvl.min) / (next.min - lvl.min)) * 100))
        : 100;
    return { ...lvl, idx, next, pct };
}

export default function ProfileClient({ profile, userEmail }: Props) {
    const router = useRouter();
    const { nightMode, toggleNightMode } = useUIStore();
    const name = (profile?.name as string) ?? "Amigo";
    const streak = (profile?.streak_days as number) ?? 0;
    const totalDevotionals = (profile?.total_devotionals as number) ?? 0;
    const isPremium = profile?.subscription_tier === "premium";

    const [maxJourneyDays, setMaxJourneyDays] = useState(0);
    const [totalJourneyDays, setTotalJourneyDays] = useState(0);

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: plans } = await supabase
                .from("journey_plans")
                .select("slug, journey_days(count)")
                .eq("user_id", user.id);
            if (!plans) return;
            let maxDays = 0, totalDays = 0;
            for (const p of plans) {
                const cnt = (p.journey_days as { count: number }[])[0]?.count ?? 0;
                totalDays += cnt;
                if (cnt > maxDays) maxDays = cnt;
            }
            setMaxJourneyDays(maxDays);
            setTotalJourneyDays(totalDays);
        }
        load();
    }, []);

    const baseXp = totalDevotionals * 10 + totalJourneyDays * 20;
    // Multiplicador de streak: 0.7× sem streak, 1.0× no streak 10, até 1.5× no streak 30+
    const streakMult = Math.min(1.5, 0.7 + streak * 0.03);
    const xp = Math.round(baseXp * streakMult);
    const level = getLevel(xp);

    const achievements: { icon: IconName; label: string; desc: string; unlocked: boolean }[] = [
        { icon: "book", label: "Primeiro Passo", desc: "1º devocional", unlocked: totalDevotionals >= 1 },
        { icon: "sparkle", label: "Fiel", desc: "7 devocionais", unlocked: totalDevotionals >= 7 },
        { icon: "star", label: "Perseverante", desc: "30 devocionais", unlocked: totalDevotionals >= 30 },
        { icon: "flame", label: "Em Chamas", desc: "Streak de 7 dias", unlocked: streak >= 7 },
        { icon: "sparkle", label: "Fundamentos", desc: "7 dias em jornada", unlocked: maxJourneyDays >= 7 },
        { icon: "flame", label: "Aprofundamento", desc: "14 dias em jornada", unlocked: maxJourneyDays >= 14 },
        { icon: "dove", label: "Maturidade", desc: "21 dias em jornada", unlocked: maxJourneyDays >= 21 },
    ];
    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    }

    const stats: { label: string; value: number; unit: string; icon: IconName }[] = [
        { label: "Streak", value: streak, unit: "dias", icon: "flame" },
        { label: "Devocionais", value: totalDevotionals, unit: "total", icon: "book" },
    ];

    return (
        <main className="aurora-bg relative min-h-dvh pb-24 lg:pb-10">
            <div className="relative z-10 max-w-md lg:max-w-xl mx-auto px-5 pt-10">
                {/* Avatar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-8"
                >
                    <div
                        className="font-display w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-4"
                        style={{
                            background: "var(--gradient-gold)",
                            color: "var(--night)",
                            fontWeight: 500,
                            boxShadow: "0 0 40px rgba(247,201,122,0.3)",
                        }}
                    >
                        {name[0]}
                    </div>
                    <h1 className="font-display text-xl mb-1" style={{ color: "var(--cream)", fontWeight: 500 }}>{name}</h1>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{userEmail}</p>
                    {isPremium && (
                        <span
                            className="mt-3 text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1.5"
                            style={{ background: "rgba(247,201,122,0.15)", color: "var(--gold)", border: "1px solid rgba(247,201,122,0.3)" }}
                        >
                            <Icon name="crown" size={13} style={{ color: "var(--gold)" }} /> Premium
                        </span>
                    )}
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 gap-3 mb-6"
                >
                    {stats.map((s, i) => (
                        <div key={i} className="card-base p-4 text-center">
                            <Icon name={s.icon} size={24} style={{ color: "var(--text-secondary)" }} className="mx-auto mb-1.5" />
                            <p className="font-display text-2xl mb-0.5" style={{ color: "var(--cream)", fontWeight: 500 }}>{s.value}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.unit}</p>
                        </div>
                    ))}
                </motion.div>

                {/* XP + Nível */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="card-base p-4 mb-4"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="eyebrow mb-0.5" style={{ color: "var(--text-muted)" }}>Nível</p>
                            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                {level.idx + 1} · {level.label}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end mb-0.5">
                                <span
                                    className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                    style={{
                                        background: "rgba(255,252,245,0.05)",
                                        color: streakMult >= 1 ? "var(--text-secondary)" : "var(--amber)",
                                    }}
                                >
                                    {streakMult >= 1 ? "+" : ""}{Math.round((streakMult - 1) * 100)}%
                                </span>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>streak</p>
                            </div>
                            <p className="font-display text-sm" style={{ color: "var(--cream)", fontWeight: 500 }}>{xp} XP</p>
                        </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,252,245,0.05)" }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: "var(--gradient-gold)" }}
                            initial={{ width: 0 }}
                            animate={{ width: `${level.pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                    {level.next && (
                        <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                            {level.next.min - xp} XP para {level.next.label}
                        </p>
                    )}
                </motion.div>

                {/* Conquistas */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="eyebrow" style={{ color: "var(--text-muted)" }}>Conquistas</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{unlockedCount}/{achievements.length}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        {achievements.map((a, i) => (
                            <motion.div
                                key={a.label}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.05 }}
                                className="flex items-center gap-4 rounded-2xl px-4 py-3"
                                style={{
                                    background: a.unlocked ? "rgba(255,252,245,0.05)" : "rgba(255,255,255,0.03)",
                                    border: `1px solid ${a.unlocked ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)"}`,
                                    opacity: a.unlocked ? 1 : 0.5,
                                }}
                            >
                                {/* Medalha */}
                                <div
                                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                                    style={{
                                        background: "rgba(255,252,245,0.05)",
                                        border: `1.5px solid ${a.unlocked ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.08)"}`,
                                    }}
                                >
                                    <Icon
                                        name={a.unlocked ? a.icon : "lock"}
                                        size={20}
                                        style={{ color: a.unlocked ? "var(--text-secondary)" : "var(--text-muted)" }}
                                    />
                                </div>
                                {/* Texto */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold leading-tight truncate" style={{ color: a.unlocked ? "var(--text-primary)" : "var(--text-muted)" }}>
                                        {a.label}
                                    </p>
                                    <p className="text-xs mt-0.5 leading-tight" style={{ color: "var(--text-muted)" }}>
                                        {a.desc}
                                    </p>
                                </div>
                                {/* Check */}
                                {a.unlocked && (
                                    <Icon name="check" size={16} strokeWidth={2} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Menu items */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2 mb-6"
                >
                    {!isPremium && (
                        <Link href="/subscription" className="card-base p-4 flex items-center gap-3 block"
                            style={{ borderColor: "rgba(247,201,122,0.25)" }}
                        >
                            <Icon name="crown" size={20} style={{ color: "var(--gold)" }} />
                            <div className="flex-1">
                                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Assinar Premium</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>R$ 24,90/mês · Devocionais ilimitados</p>
                            </div>
                            <Icon name="arrow-right" size={16} style={{ color: "var(--text-muted)" }} />
                        </Link>
                    )}
                    <Link href="/journal" className="card-base p-4 flex items-center gap-3 block">
                        <Icon name="pen" size={20} style={{ color: "var(--text-secondary)" }} />
                        <p className="text-sm font-semibold flex-1" style={{ color: "var(--text-primary)" }}>Meu diário espiritual</p>
                        <Icon name="arrow-right" size={16} style={{ color: "var(--text-muted)" }} />
                    </Link>
                    <Link href="/devotional/history" className="card-base p-4 flex items-center gap-3 block">
                        <Icon name="book" size={20} style={{ color: "var(--text-secondary)" }} />
                        <p className="text-sm font-semibold flex-1" style={{ color: "var(--text-primary)" }}>Histórico de devocionais</p>
                        <Icon name="arrow-right" size={16} style={{ color: "var(--text-muted)" }} />
                    </Link>
                    <Link href="/journey" className="card-base p-4 flex items-center gap-3 block">
                        <Icon name="flame" size={20} style={{ color: "var(--text-secondary)" }} />
                        <p className="text-sm font-semibold flex-1" style={{ color: "var(--text-primary)" }}>Jornadas de 21 dias</p>
                        <Icon name="arrow-right" size={16} style={{ color: "var(--text-muted)" }} />
                    </Link>
                    <button
                        onClick={toggleNightMode}
                        className="card-base p-4 flex items-center gap-3 w-full text-left"
                    >
                        <Icon name={nightMode ? "moon" : "sunrise"} size={20} style={{ color: "var(--text-secondary)" }} />
                        <div className="flex-1">
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Modo Madrugada</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {nightMode ? "Ativo — visual contemplativo escuro" : "Desativado — visual padrão"}
                            </p>
                        </div>
                        <div
                            className="w-11 h-6 rounded-full relative transition-all duration-300 flex-shrink-0"
                            style={{
                                background: nightMode ? "var(--gradient-gold)" : "rgba(255,255,255,0.1)",
                                border: `1px solid ${nightMode ? "transparent" : "rgba(255,255,255,0.12)"}`,
                            }}
                        >
                            <div
                                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300"
                                style={{
                                    left: nightMode ? "calc(100% - 22px)" : "2px",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                                }}
                            />
                        </div>
                    </button>
                </motion.div>

                {/* Logout */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                >
                    <button
                        onClick={handleLogout}
                        className="btn-ghost w-full"
                        style={{ color: "var(--text-muted)" }}
                    >
                        <Icon name="logout" size={16} /> Sair da conta
                    </button>
                </motion.div>
            </div>

            <BottomNav />
        </main>
    );
}
