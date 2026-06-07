"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { JOURNEY_THEMES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { Devotional } from "@/types";
import ShareModal from "@/components/ShareModal";
import type { ShareData } from "@/components/ShareModal";

interface Props {
    slug: string;
}

type DayStatus = "completed" | "available" | "available_tomorrow" | "locked";

interface DayInfo {
    day: number;
    reference: string;
    theme: string;
    status: DayStatus;
    generated_at?: string;
}

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
    }),
};

function DayButton({ d, selected, onClick }: { d: DayInfo; selected: boolean; onClick: () => void }) {
    const icon =
        d.status === "completed" ? "✓" :
            d.status === "available_tomorrow" ? "🌙" :
                d.status === "locked" ? "🔒" :
                    null;

    return (
        <button
            onClick={onClick}
            title={`${d.reference} · ${d.theme}`}
            className="flex-shrink-0 w-10 h-10 rounded-full font-semibold transition-all flex items-center justify-center"
            style={{
                background: selected
                    ? "var(--gradient-button)"
                    : d.status === "completed"
                        ? "rgba(168,85,247,0.2)"
                        : "var(--glass)",
                border: selected
                    ? "none"
                    : d.status === "available"
                        ? "2px solid var(--brand-purple)"
                        : "1px solid var(--glass-border)",
                color: selected
                    ? "#fff"
                    : d.status === "completed" || d.status === "available"
                        ? "var(--brand-purple)"
                        : "var(--text-muted)",
                boxShadow: selected ? "var(--shadow-button)" : "none",
                fontSize: icon ? "11px" : "14px",
            }}
        >
            {icon ?? d.day}
        </button>
    );
}

export default function JourneySlugClient({ slug }: Props) {
    const router = useRouter();
    const theme = JOURNEY_THEMES.find((t) => t.slug === slug);

    // null = verificando, true = mostrar intro, false = ir direto
    const [showIntro, setShowIntro] = useState<boolean | null>(null);
    const [activeJourneySlug, setActiveJourneySlug] = useState<string | null>(null);

    // Plan state
    const [planId, setPlanId] = useState<string | null>(null);
    const [days, setDays] = useState<DayInfo[]>([]);
    const [planLoading, setPlanLoading] = useState(false);
    const [planError, setPlanError] = useState<string | null>(null);
    const [needsPremium, setNeedsPremium] = useState(false);

    // Day content state
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [devotional, setDevotional] = useState<Devotional | null>(null);
    const [dayLoading, setDayLoading] = useState(false);
    const [dayError, setDayError] = useState<string | null>(null);
    const [lockedMessage, setLockedMessage] = useState<string | null>(null);

    const [showShare, setShowShare] = useState(false);

    // Prevent re-fetching already-loaded day when plan refreshes
    const contentForDayRef = useRef<number | null>(null);

    useEffect(() => {
        if (!theme) { router.replace("/journey"); return; }
        checkPlanExists();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function checkPlanExists() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace("/login"); return; }

        const { data: plan } = await supabase
            .from("journey_plans")
            .select("id")
            .eq("user_id", user.id)
            .eq("slug", slug)
            .maybeSingle();

        if (plan) {
            // Jornada já iniciada — ir direto
            setShowIntro(false);
            loadPlan(false);
        } else {
            // Nova jornada — mostrar intro
            setShowIntro(true);
        }
    }

    async function loadPlan(keepSelection: boolean) {
        if (!keepSelection) setPlanLoading(true);
        setPlanError(null);
        try {
            const res = await fetch("/api/journey/plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug }),
            });
            if (res.status === 402) { setNeedsPremium(true); setPlanLoading(false); return; }
            const data = await res.json();
            if (res.status === 409) {
                // Outra jornada ativa
                setActiveJourneySlug(data.active_slug ?? null);
                setPlanLoading(false);
                return;
            }
            if (!res.ok) throw new Error(data.error ?? "Erro ao carregar plano");

            setPlanId(data.plan_id);
            setDays(data.days as DayInfo[]);

            if (!keepSelection) {
                const availableDay = (data.days as DayInfo[]).find((d) => d.status === "available");
                const lastCompleted = [...(data.days as DayInfo[])].reverse().find((d) => d.status === "completed");
                const autoDay = availableDay?.day ?? lastCompleted?.day ?? 1;
                setSelectedDay(autoDay);
            }
        } catch (e: unknown) {
            setPlanError(e instanceof Error ? e.message : "Erro ao carregar plano");
        } finally {
            setPlanLoading(false);
        }
    }

    // Buscar conteúdo quando selectedDay ou planId mudam
    useEffect(() => {
        if (selectedDay === null || !planId) return;
        if (contentForDayRef.current === selectedDay) return; // já carregado

        const dayInfo = days.find((d) => d.day === selectedDay);
        if (!dayInfo) return;

        if (dayInfo.status === "locked") {
            setLockedMessage("Complete os dias anteriores para desbloquear este dia.");
            setDevotional(null);
            return;
        }
        if (dayInfo.status === "available_tomorrow") {
            setLockedMessage("Você já fez o devocional de hoje! Volte amanhã para continuar sua jornada. 🌙");
            setDevotional(null);
            return;
        }
        setLockedMessage(null);
        contentForDayRef.current = selectedDay;
        fetchDayContent(selectedDay);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDay, planId]);

    async function fetchDayContent(day: number) {
        if (!planId) return;
        setDayLoading(true);
        setDayError(null);
        setDevotional(null);
        try {
            const res = await fetch("/api/journey/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug, day, plan_id: planId }),
            });
            if (res.status === 402) { setNeedsPremium(true); setDayLoading(false); return; }
            const data = await res.json();

            if (res.status === 403) {
                contentForDayRef.current = null;
                setLockedMessage(data.message ?? "Dia ainda não disponível.");
                setDayLoading(false);
                return;
            }
            if (!res.ok) throw new Error(data.error ?? "Erro desconhecido");

            setDevotional(data.devotional as Devotional);

            // Se foi uma nova geração, atualiza os status dos dias sem trocar seleção
            if (!data.cached) {
                loadPlan(true);
            }
        } catch (e: unknown) {
            contentForDayRef.current = null;
            setDayError(e instanceof Error ? e.message : "Erro ao carregar devocional");
        } finally {
            setDayLoading(false);
        }
    }

    function handleDayClick(dayInfo: DayInfo) {
        if (dayInfo.day === selectedDay) return;
        setDevotional(null);
        setDayError(null);
        setLockedMessage(null);
        contentForDayRef.current = null;

        if (dayInfo.status === "locked") {
            setLockedMessage("Complete os dias anteriores para desbloquear este dia.");
            setSelectedDay(dayInfo.day);
            return;
        }
        if (dayInfo.status === "available_tomorrow") {
            setLockedMessage("Você já fez o devocional de hoje! Volte amanhã para continuar. 🌙");
            setSelectedDay(dayInfo.day);
            return;
        }
        setSelectedDay(dayInfo.day);
    }

    if (!theme) return null;

    // ── Verificando plano ────────────────────────────────────────────────────
    if (showIntro === null) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center" style={{ background: "var(--bg-base)" }}>
                <motion.div
                    className="w-10 h-10 rounded-full"
                    style={{ border: "2px solid transparent", borderTopColor: "#A855F7" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
            </main>
        );
    }

    // ── Jornada ativa diferente ───────────────────────────────────────────────
    if (activeJourneySlug && activeJourneySlug !== slug) {
        const activeTheme = JOURNEY_THEMES.find((t) => t.slug === activeJourneySlug);
        return (
            <main className="min-h-dvh flex items-center justify-center px-6" style={{ background: "var(--bg-base)" }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
                    <span className="text-5xl mb-5 block">{activeTheme?.emoji ?? "🧭"}</span>
                    <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>Você já tem uma jornada ativa</h2>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                        Complete <strong>{activeTheme?.label ?? activeJourneySlug}</strong> antes de começar uma nova jornada.
                        Cada jornada merece sua atenção completa para transformar sua vida de verdade.
                    </p>
                    <Link href={`/journey/${activeJourneySlug}`} className="btn-primary block mb-3">Continuar minha jornada</Link>
                    <Link href="/journey" className="btn-ghost block">Ver todas as jornadas</Link>
                </motion.div>
            </main>
        );
    }

    // ── Tela de introdução (nova jornada) ────────────────────────────────────
    if (showIntro) {
        return (
            <main className="relative min-h-dvh pb-12" style={{ background: "var(--bg-base)" }}>
                {/* Header com gradiente */}
                <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
                    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0520 0%, #1e0a4a 50%, #3b0764 100%)" }} />
                    <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 70% 40%, rgba(168,85,247,0.3) 0%, transparent 60%)" }} />
                    <div className="absolute inset-0 flex flex-col justify-end px-5 pb-6 z-10">
                        <Link href="/journey" className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>← Jornadas</Link>
                        <span className="text-5xl mb-3 block">{theme.emoji}</span>
                        <h1 className="text-2xl font-bold text-white mb-1">{theme.label}</h1>
                        <p className="text-sm" style={{ color: "rgba(196,162,253,0.9)" }}>Jornada de 21 dias</p>
                    </div>
                </div>

                <div className="max-w-lg mx-auto px-5 pt-7 pb-8">
                    {/* Pitch */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-primary)", fontSize: "1.05rem" }}>
                            {theme.pitch}
                        </p>
                        <p className="text-xs mt-3 mb-7" style={{ color: "var(--text-muted)" }}>{theme.solves}</p>
                    </motion.div>

                    {/* Progresso espiritual */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Progressão espiritual</p>
                        <div className="space-y-3 mb-8">
                            {theme.phases.map((phase, i) => (
                                <motion.div
                                    key={phase.days}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 + i * 0.1 }}
                                    className="flex items-start gap-4 rounded-2xl p-4"
                                    style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                        style={{ background: "rgba(168,85,247,0.12)" }}>
                                        {phase.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-bold" style={{ color: "var(--brand-purple)" }}>{phase.days}</span>
                                            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{phase.label}</span>
                                        </div>
                                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{phase.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Linha de seta conectando fases */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                        className="text-center mb-8"
                    >
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            21 devocionais únicos gerados pela IA, progressivos e personalizados para você
                        </p>
                    </motion.div>

                    {/* CTA */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        {planLoading ? (
                            <div className="flex items-center justify-center gap-3 py-4">
                                <motion.div className="w-5 h-5 rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#A855F7" }}
                                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                <span className="text-sm" style={{ color: "var(--text-muted)" }}>Criando seu plano de 21 dias...</span>
                            </div>
                        ) : planError ? (
                            <div className="text-center">
                                <p className="text-sm mb-4" style={{ color: "#f87171" }}>{planError}</p>
                                <button onClick={() => { setPlanError(null); setShowIntro(false); loadPlan(false); }} className="btn-primary w-full">
                                    Tentar novamente
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setShowIntro(false); loadPlan(false); }}
                                className="btn-primary w-full"
                                style={{ fontSize: "1rem", padding: "14px 0" }}
                            >
                                Começar minha jornada →
                            </button>
                        )}
                        <Link href="/journey" className="btn-ghost w-full mt-3 block text-center">Escolher outra jornada</Link>
                    </motion.div>
                </div>
            </main>
        );
    }
    if (needsPremium) {
        return (
            <main className="min-h-dvh flex items-center justify-center px-6" style={{ background: "var(--bg-base)" }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md glass rounded-3xl p-10">
                    <span className="text-5xl mb-6 block">👑</span>
                    <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Jornadas são Premium</h2>
                    <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
                        Acesse 21 dias de devocionais guiados sobre {theme.label} com o plano Premium.
                    </p>
                    <Link href="/subscription" className="btn-primary">Assinar Premium</Link>
                    <Link href="/journey" className="btn-ghost mt-3 block">Voltar</Link>
                </motion.div>
            </main>
        );
    }

    // ── Carregando plano ──────────────────────────────────────────────────────
    if (planLoading) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center gap-5 px-6" style={{ background: "var(--bg-base)" }}>
                <motion.div
                    className="w-14 h-14 rounded-full"
                    style={{ border: "2px solid transparent", borderTopColor: "#A855F7" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
                <div className="text-center">
                    <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Preparando sua jornada</p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Criando seu plano de 21 dias com a IA...</p>
                </div>
            </main>
        );
    }

    // ── Erro no plano ─────────────────────────────────────────────────────────
    if (planError) {
        return (
            <main className="min-h-dvh flex items-center justify-center px-6" style={{ background: "var(--bg-base)" }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-sm">
                    <span className="text-4xl mb-5 block">⚠️</span>
                    <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>Erro ao carregar</h2>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{planError}</p>
                    <button onClick={() => loadPlan(false)} className="btn-primary w-full">Tentar novamente</button>
                    <Link href="/journey" className="btn-ghost w-full mt-3 block">Voltar às jornadas</Link>
                </motion.div>
            </main>
        );
    }

    const currentDayInfo = days.find((d) => d.day === selectedDay);

    // ── Página principal ──────────────────────────────────────────────────────
    return (
        <main className="relative min-h-dvh pb-12 lg:pb-10" style={{ background: "var(--bg-base)" }}>
            {/* Header */}
            <div className="relative overflow-hidden" style={{ height: 180 }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0520 0%, #1e0a4a 50%, #3b0764 100%)" }} />
                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 70% 50%, rgba(168,85,247,0.25) 0%, transparent 60%)" }} />
                <div className="absolute inset-0 flex flex-col justify-end px-5 pb-5 z-10">
                    <Link href="/journey" className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>← Jornadas</Link>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{theme.emoji}</span>
                        <div>
                            <h1 className="text-lg font-bold text-white">{theme.label}</h1>
                            <p className="text-xs" style={{ color: "rgba(196,162,253,0.85)" }}>
                                {days.filter((d) => d.status === "completed").length} / 21 dias concluídos
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Marcos de progressão espiritual */}
            {days.length > 0 && (() => {
                const PHASES = [
                    { icon: "🌱", label: "Fundamentos",    range: "1–7",   start: 1, end: 7  },
                    { icon: "🔥", label: "Aprofundamento", range: "8–14",  start: 8, end: 14 },
                    { icon: "🕊️", label: "Maturidade",     range: "15–21", start: 15, end: 21 },
                ];
                const activeDay = selectedDay ?? 1;
                const activePhaseIdx = activeDay <= 7 ? 0 : activeDay <= 14 ? 1 : 2;

                return (
                    <div className="px-5 pt-4 pb-1">
                        <div className="flex items-stretch gap-0">
                            {PHASES.map((ph, i) => {
                                const phaseDone = days.filter(d => d.status === "completed" && d.day >= ph.start && d.day <= ph.end).length;
                                const phaseTotal = ph.end - ph.start + 1;
                                const pct = Math.round((phaseDone / phaseTotal) * 100);
                                const isActive = i === activePhaseIdx;
                                const isDone = phaseDone === phaseTotal;
                                const isFuture = i > activePhaseIdx && !isDone;

                                return (
                                    <div key={ph.label} className="flex-1 flex flex-col gap-1.5" style={{ opacity: isFuture ? 0.45 : 1 }}>
                                        {/* barra de progresso do segmento */}
                                        <div className="h-1.5 rounded-full overflow-hidden mx-1"
                                            style={{ background: "rgba(168,85,247,0.12)", outline: isActive ? "1px solid rgba(168,85,247,0.4)" : "none", outlineOffset: 1 }}>
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ background: isDone ? "var(--gradient-button)" : isActive ? "var(--gradient-button)" : "rgba(168,85,247,0.3)" }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(pct, pct > 0 ? 6 : 0)}%` }}
                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                            />
                                        </div>
                                        {/* rótulo */}
                                        <div className="flex items-center gap-1 px-1">
                                            <span className="text-xs leading-none">{ph.icon}</span>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-semibold leading-tight truncate"
                                                    style={{ color: isActive ? "var(--brand-purple)" : isDone ? "rgba(168,85,247,0.7)" : "var(--text-muted)" }}>
                                                    {ph.label}
                                                </p>
                                                <p className="text-[9px] leading-tight" style={{ color: "var(--text-muted)" }}>
                                                    Dias {ph.range}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* Seletor de dias */}
            <div className="px-5 py-4 overflow-x-auto">
                <div className="flex gap-2 w-max">
                    {days.map((d) => (
                        <DayButton key={d.day} d={d} selected={d.day === selectedDay} onClick={() => handleDayClick(d)} />
                    ))}
                </div>
            </div>

            {/* Barra de info do dia */}
            {currentDayInfo && (
                <div className="px-5 mb-3">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        <span style={{ color: "var(--brand-purple)" }}>{currentDayInfo.reference}</span>
                        &nbsp;·&nbsp;{currentDayInfo.theme}
                    </p>
                </div>
            )}

            {/* Área de conteúdo */}
            <div className="relative z-10 max-w-lg lg:max-w-3xl mx-auto px-5 pt-2">

                {/* Mensagem de bloqueio */}
                {lockedMessage && !dayLoading && !devotional && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 px-4">
                        <span className="text-5xl mb-6 block">
                            {lockedMessage.includes("amanhã") ? "🌙" : "🔒"}
                        </span>
                        <p className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                            {lockedMessage.includes("amanhã") ? "Até amanhã!" : "Dia bloqueado"}
                        </p>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{lockedMessage}</p>
                    </motion.div>
                )}

                {/* Loading do dia */}
                {dayLoading && (
                    <div className="flex flex-col items-center py-20 gap-4">
                        <motion.div
                            className="w-12 h-12 rounded-full"
                            style={{ border: "2px solid transparent", borderTopColor: "#A855F7" }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Preparando o dia {selectedDay}...</p>
                    </div>
                )}

                {/* Erro do dia */}
                {dayError && !dayLoading && (
                    <div className="text-center py-16">
                        <span className="text-4xl mb-4 block">⚠️</span>
                        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>{dayError}</p>
                        <button onClick={() => { contentForDayRef.current = null; selectedDay && fetchDayContent(selectedDay); }} className="btn-primary">
                            Tentar novamente
                        </button>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {devotional && !dayLoading && (
                        <motion.div key={selectedDay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>Dia {selectedDay} de 21</p>
                            <h2 className="gradient-text mb-6" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.3 }}>
                                {devotional.title}
                            </h2>

                            {/* Versículo */}
                            <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible"
                                className="card-base p-5 mb-6 relative overflow-hidden"
                                style={{ borderColor: "rgba(168,85,247,0.2)" }}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full" style={{ background: "var(--gradient-button)" }} />
                                <blockquote className="italic pl-3 mb-2 leading-relaxed"
                                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "1.1rem" }}>
                                    &quot;{devotional.verse}&quot;
                                </blockquote>
                                <cite className="not-italic text-xs font-semibold pl-3" style={{ color: "var(--brand-purple)" }}>— {devotional.verse_reference}</cite>
                            </motion.div>

                            {/* Reflexão */}
                            <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible" className="mb-6">
                                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Reflexão</p>
                                <div className="space-y-3">
                                    {devotional.reflection.split("\n\n").map((p, i) => (
                                        <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{p}</p>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Aplicação prática */}
                            <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="mb-6">
                                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Aplicação prática</p>
                                <div className="space-y-3">
                                    {devotional.practical_application.split("\n\n").map((p, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                                                style={{ background: "rgba(168,85,247,0.15)", color: "var(--brand-purple)", fontSize: 10, fontWeight: 700 }}>
                                                {i + 1}
                                            </div>
                                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{p}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Oração */}
                            <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible"
                                className="rounded-2xl p-5 mb-6"
                                style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.15)" }}
                            >
                                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--brand-purple)" }}>🙏 Oração</p>
                                {devotional.prayer.split("\n\n").map((p, i) => (
                                    <p key={i} className="text-sm leading-relaxed italic mb-2" style={{ color: "var(--text-secondary)" }}>{p}</p>
                                ))}
                            </motion.div>

                            {/* Declaração */}
                            <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible"
                                className="rounded-2xl p-5 mb-6 flex items-start gap-4"
                                style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}
                            >
                                <span className="text-2xl flex-shrink-0">❤️</span>
                                <div>
                                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Declaração de fé</p>
                                    <p className="leading-relaxed font-semibold gradient-text"
                                        style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}>
                                        {devotional.declaration}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Pergunta reflexiva */}
                            <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible" className="card-base p-5 mb-8">
                                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Pergunta reflexiva</p>
                                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{devotional.reflective_question}</p>
                            </motion.div>

                            {/* Navegação */}
                            <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-3 mt-2">
                                {/* Botão compartilhar */}
                                <button
                                    onClick={() => setShowShare(true)}
                                    className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5"
                                    style={{ background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.22)" }}
                                >
                                    <span className="text-base">📤</span>
                                    <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Compartilhar este devocional</span>
                                </button>
                                <div className="flex gap-3">
                                {selectedDay && selectedDay > 1 && (
                                    <button onClick={() => handleDayClick(days[selectedDay - 2])} className="btn-ghost flex-1">
                                        ← Dia {selectedDay - 1}
                                    </button>
                                )}
                                {selectedDay && selectedDay < 21 && (() => {
                                    const next = days.find((d) => d.day === selectedDay + 1);
                                    if (!next) return null;
                                    if (next.status === "completed" || next.status === "available") {
                                        return <button onClick={() => handleDayClick(next)} className="btn-primary flex-1">Dia {selectedDay + 1} →</button>;
                                    }
                                    if (next.status === "available_tomorrow") {
                                        return <button disabled className="btn-ghost flex-1 opacity-50 cursor-not-allowed">🌙 Disponível amanhã</button>;
                                    }
                                    return <button disabled className="btn-ghost flex-1 opacity-40 cursor-not-allowed">🔒 Bloqueado</button>;
                                })()}
                                {selectedDay === 21 && (
                                    <Link href="/journey" className="btn-primary flex-1 text-center">🏆 Jornada concluída!</Link>
                                )}
                            </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Share modal */}
            <ShareModal
                open={showShare}
                onClose={() => setShowShare(false)}
                data={(() => {
                    if (!devotional || !theme) return null;
                    const completedCount = days.filter((d) => d.status === "completed").length;
                    const milestone =
                        completedCount >= 21 ? "🏆 Jornada Completa!"
                        : completedCount >= 14 ? `🕊️ Fase Maturidade · Dia ${completedCount}`
                        : completedCount >= 7 ? `🔥 Fase Aprofundamento · Dia ${completedCount}`
                        : completedCount >= 1 ? `🌱 Fase Fundamentos · Dia ${completedCount}`
                        : undefined;
                    return {
                        type: "journey" as const,
                        title: devotional.title,
                        declaration: devotional.declaration,
                        verse: devotional.verse,
                        verseRef: devotional.verse_reference,
                        dayLabel: `Dia ${selectedDay} de 21`,
                        journeyLabel: theme.label,
                        journeyEmoji: theme.emoji,
                        milestone,
                    };
                })()}
            />
        </main>
    );
}

