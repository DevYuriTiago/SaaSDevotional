"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";

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

    const achievements = [
        { icon: "📖", label: "Primeiro Passo", desc: "1º devocional", unlocked: totalDevotionals >= 1 },
        { icon: "✨", label: "Fiel", desc: "7 devocionais", unlocked: totalDevotionals >= 7 },
        { icon: "💫", label: "Perseverante", desc: "30 devocionais", unlocked: totalDevotionals >= 30 },
        { icon: "🔥", label: "Em Chamas", desc: "Streak de 7 dias", unlocked: streak >= 7 },
        { icon: "🌱", label: "Fundamentos", desc: "7 dias em jornada", unlocked: maxJourneyDays >= 7 },
        { icon: "🔥", label: "Aprofundamento", desc: "14 dias em jornada", unlocked: maxJourneyDays >= 14 },
        { icon: "🕊️", label: "Maturidade", desc: "21 dias em jornada", unlocked: maxJourneyDays >= 21 },
    ];
    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    }

    const stats = [
        { label: "Streak", value: streak, unit: "dias", emoji: "🔥" },
        { label: "Devocionais", value: totalDevotionals, unit: "total", emoji: "📖" },
    ];

    return (
        <main className="relative min-h-dvh pb-24 lg:pb-10">
            <div className="relative z-10 max-w-md lg:max-w-xl mx-auto px-5 pt-10">
                {/* Avatar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-8"
                >
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-4"
                        style={{
                            background: "var(--gradient-primary)",
                            boxShadow: "0 0 40px rgba(168,85,247,0.35)",
                        }}
                    >
                        {name[0]}
                    </div>
                    <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{name}</h1>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{userEmail}</p>
                    {isPremium && (
                        <span
                            className="mt-3 text-xs px-3 py-1 rounded-full font-semibold"
                            style={{ background: "rgba(168,85,247,0.15)", color: "var(--brand-purple)", border: "1px solid rgba(168,85,247,0.3)" }}
                        >
                            👑 Premium
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
                            <span className="text-2xl mb-1 block">{s.emoji}</span>
                            <p
                                className="text-2xl font-bold mb-0.5"
                                style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                            >{s.value}</p>
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
                            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>Nível</p>
                            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                {level.idx + 1} · {level.label}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end mb-0.5">
                                <span
                                    className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                    style={{
                                        background: streakMult >= 1 ? "rgba(168,85,247,0.15)" : "rgba(255,100,50,0.15)",
                                        color: streakMult >= 1 ? "var(--brand-purple)" : "#f97316",
                                    }}
                                >
                                    {streakMult >= 1 ? "+" : ""}{Math.round((streakMult - 1) * 100)}%
                                </span>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>streak</p>
                            </div>
                            <p className="text-sm font-bold" style={{ color: "var(--brand-purple)" }}>{xp} XP</p>
                        </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(168,85,247,0.12)" }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: "var(--gradient-button)" }}
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
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Conquistas</p>
                        <p className="text-xs" style={{ color: "var(--brand-purple)" }}>{unlockedCount}/{achievements.length}</p>
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
                                    background: a.unlocked ? "rgba(168,85,247,0.10)" : "rgba(255,255,255,0.03)",
                                    border: `1px solid ${a.unlocked ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.06)"}`,
                                    opacity: a.unlocked ? 1 : 0.5,
                                }}
                            >
                                {/* Medalha */}
                                <div
                                    className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
                                    style={{
                                        background: a.unlocked
                                            ? "radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(168,85,247,0.08) 100%)"
                                            : "rgba(255,255,255,0.05)",
                                        border: `1.5px solid ${a.unlocked ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.08)"}`,
                                    }}
                                >
                                    {a.unlocked ? a.icon : "🔒"}
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
                                    <span className="text-xs font-bold shrink-0" style={{ color: "var(--brand-purple)" }}>✓</span>
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
                            style={{ borderColor: "rgba(168,85,247,0.25)" }}
                        >
                            <span className="text-xl">👑</span>
                            <div className="flex-1">
                                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Assinar Premium</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>R$ 24,90/mês · Devocionais ilimitados</p>
                            </div>
                            <span style={{ color: "var(--brand-purple)" }}>→</span>
                        </Link>
                    )}
                    <Link href="/journal" className="card-base p-4 flex items-center gap-3 block">
                        <span className="text-xl">📝</span>
                        <p className="text-sm font-semibold flex-1" style={{ color: "var(--text-primary)" }}>Meu diário espiritual</p>
                        <span style={{ color: "var(--text-muted)" }}>→</span>
                    </Link>
                    <Link href="/devotional/history" className="card-base p-4 flex items-center gap-3 block">
                        <span className="text-xl">📖</span>
                        <p className="text-sm font-semibold flex-1" style={{ color: "var(--text-primary)" }}>Histórico de devocionais</p>
                        <span style={{ color: "var(--text-muted)" }}>→</span>
                    </Link>
                    <Link href="/journey" className="card-base p-4 flex items-center gap-3 block">
                        <span className="text-xl">🔥</span>
                        <p className="text-sm font-semibold flex-1" style={{ color: "var(--text-primary)" }}>Jornadas de 21 dias</p>
                        <span style={{ color: "var(--text-muted)" }}>→</span>
                    </Link>
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
                        Sair da conta
                    </button>
                </motion.div>
            </div>

            <BottomNav />
        </main>
    );
}
