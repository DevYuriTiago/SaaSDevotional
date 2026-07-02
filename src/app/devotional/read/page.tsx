"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useDevotionalStore } from "@/store";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import ShareModal from "@/components/ShareModal";
import DevotionalAudio from "@/components/DevotionalAudio";
import { Icon } from "@/components/icons";
import type { ShareData } from "@/components/ShareModal";

const WEEKDAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const } }),
};

export default function ReadDevotionalPage() {
    const router = useRouter();
    const { currentDevotional } = useDevotionalStore();
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showJournal, setShowJournal] = useState(false);
    const [journalText, setJournalText] = useState("");
    const [journalSaved, setJournalSaved] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        if (!currentDevotional) {
            router.replace("/emotion");
            return;
        }
        setSaved(!!currentDevotional.is_saved);
        supabase
            .from("profiles")
            .select("subscription_tier")
            .single()
            .then(({ data }: { data: { subscription_tier: string } | null }) => {
                if (data?.subscription_tier === "premium") setIsPremium(true);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDevotional, router]);

    if (!currentDevotional) return null;
    const d = currentDevotional;

    const shareData: ShareData | null = {
        type: "devotional",
        title: d.title,
        declaration: d.declaration,
        verse: d.verse,
        verseRef: d.verse_reference,
        emotion: d.emotion,
        reflection: d.reflection,
        reflectiveQuestion: d.reflective_question,
        date: new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" }),
    };

    async function handleSave() {
        setSaving(true);
        await supabase.from("devotionals").update({ is_saved: !saved }).eq("id", d.id);
        setSaved(!saved);
        setSaving(false);
    }

    async function handleSaveJournal() {
        if (!journalText.trim()) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("journal_entries").insert({
            user_id: user.id, devotional_id: d.id, content: journalText.trim(), emotion: d.emotion,
        });
        setJournalSaved(true);
        setTimeout(() => setShowJournal(false), 1500);
    }

    // Semana atual (começando na segunda) para a tira de datas.
    const now = new Date();
    const dow = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dow);
    const week = Array.from({ length: 7 }, (_, i) => {
        const dt = new Date(monday);
        dt.setDate(monday.getDate() + i);
        return dt;
    });
    const todayNum = now.getDate();
    const dateLabel = `${now.getDate()} de ${MONTHS[now.getMonth()]}`;

    const reflectionParas = d.reflection.split("\n\n");
    const verseFirst = d.verse.trim().charAt(0);
    const verseRest = d.verse.trim().slice(1);

    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden pb-28">
            <div className="relative z-10 max-w-md mx-auto px-5 pt-7">
                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-5">
                    <h1 className="font-display text-3xl" style={{ color: "var(--cream)" }}>Devocional</h1>
                    <Link href="/devotional/history" className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ border: "1px solid var(--glass-border)", color: "var(--gold)" }}>
                        <Icon name="book" size={18} />
                    </Link>
                </div>

                {/* ── Tira de datas ── */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto">
                    <span className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full flex-shrink-0"
                        style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
                        <Icon name="calendar" size={13} /> {dateLabel}
                    </span>
                    <div className="flex gap-1 flex-1 justify-between">
                        {week.map((dt, i) => {
                            const isToday = dt.getDate() === todayNum && dt.getMonth() === now.getMonth();
                            return (
                                <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                                    <span
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                                        style={{
                                            background: isToday ? "var(--gradient-gold)" : "transparent",
                                            color: isToday ? "#2A1E08" : "var(--text-secondary)",
                                        }}
                                    >
                                        {dt.getDate()}
                                    </span>
                                    <span className="text-[9px]" style={{ color: isToday ? "var(--gold)" : "var(--text-muted)" }}>{WEEKDAYS[i]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Hero ── */}
                <div className="card-base overflow-hidden mb-7" style={{ padding: 0, borderColor: "rgba(247,201,122,0.2)" }}>
                    <div className="relative" style={{ height: 240 }}>
                        <Image src="/scene-dawn.png" alt="" fill priority className="object-cover" style={{ objectPosition: "50% 35%" }} />
                        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,7,13,0.35) 0%, rgba(7,7,13,0.2) 40%, rgba(7,7,13,0.95) 100%)" }} />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                            <p className="eyebrow mb-2 inline-flex items-center gap-2" style={{ color: "var(--gold)" }}><span className="gold-rule" /> Hoje</p>
                            <h2 className="font-display leading-tight mb-1.5" style={{ color: "var(--cream)", fontSize: "1.55rem", fontWeight: 400 }}>{d.title}</h2>
                            <p className="eyebrow mb-3" style={{ color: "var(--gold)", fontSize: 11 }}>{d.verse_reference}</p>
                            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                                style={{ background: "rgba(11,11,18,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", backdropFilter: "blur(8px)" }}>
                                <Icon name="flame" size={12} style={{ color: "var(--gold)" }} /> {d.emotion}
                            </span>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                            {[
                                { icon: "bookmark" as const, label: saved ? "Salvo" : "Salvar", on: handleSave, active: saved, accent: false },
                                { icon: "pen" as const, label: "Diário", on: () => setShowJournal(true), active: false, accent: false },
                                { icon: "share" as const, label: "Compartilhar", on: () => setShowShare(true), active: false, accent: true },
                            ].map((b, i) => {
                                const gold = b.active || b.accent;
                                return (
                                    <button key={i} onClick={b.on} disabled={saving && b.icon === "bookmark"}
                                        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-medium transition-all"
                                        style={{
                                            color: gold ? "var(--gold)" : "var(--text-secondary)",
                                            border: `1px solid ${gold ? "rgba(247,201,122,0.55)" : "var(--glass-border)"}`,
                                            background: gold ? "rgba(247,201,122,0.08)" : "transparent",
                                            boxShadow: b.accent ? "0 0 18px rgba(247,201,122,0.18)" : "none",
                                        }}>
                                        <Icon name={b.icon} size={16} style={{ fill: b.active && b.icon === "bookmark" ? "var(--gold)" : "none" }} /> {b.label}
                                    </button>
                                );
                            })}
                        </div>
                        <DevotionalAudio devotional={d} isPremium={isPremium} />
                    </div>
                </div>

                {/* ── Reflexão (com Ler mais) ── */}
                <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="mb-8">
                    <p className="eyebrow mb-4"><span className="gold-rule" /> Reflexão</p>
                    <div className="space-y-4">
                        {(expanded ? reflectionParas : reflectionParas.slice(0, 1)).map((p, i) => (
                            <p key={i} className="font-serif-devotional" style={{ color: "var(--text-secondary)", fontSize: "1.12rem", lineHeight: 1.75 }}>{p}</p>
                        ))}
                    </div>
                    {reflectionParas.length > 1 && (
                        <button onClick={() => setExpanded((v) => !v)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--gold)" }}>
                            {expanded ? "Ler menos" : "Ler mais"}
                            <Icon name={expanded ? "chevron-left" : "chevron-right"} size={15} style={{ transform: "rotate(90deg)" }} />
                        </button>
                    )}
                </motion.div>

                {/* ── Versículo-chave ── */}
                <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible"
                    className="card-base p-5 mb-8 relative overflow-hidden" style={{ borderColor: "rgba(247,201,122,0.22)" }}>
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-full" style={{ background: "var(--gradient-gold)" }} />
                    <p className="eyebrow mb-3" style={{ color: "var(--text-muted)" }}>Versículo-chave</p>
                    <blockquote className="font-serif-devotional italic leading-relaxed" style={{ color: "var(--cream)", fontSize: "1.35rem", lineHeight: 1.55 }}>
                        <span className="font-display not-italic float-left mr-2" style={{ color: "var(--gold)", fontSize: "3.2rem", lineHeight: 0.85, marginTop: 4, textShadow: "0 0 24px rgba(247,201,122,0.3)" }}>{verseFirst}</span>
                        {verseRest}
                    </blockquote>
                    <cite className="not-italic eyebrow block mt-3" style={{ color: "var(--gold)", fontSize: 11 }}>{d.verse_reference}</cite>
                </motion.div>

                {/* ── Aplicação prática ── */}
                <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="mb-8">
                    <p className="eyebrow mb-4"><span className="gold-rule" /> Aplicação prática</p>
                    <div className="space-y-4">
                        {d.practical_application.split("\n\n").map((p, i) => (
                            <div key={i} className="flex gap-3.5">
                                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-display text-sm"
                                    style={{ border: "1px solid var(--glass-border)", color: "var(--gold)" }}>{i + 1}</div>
                                <p className="text-[15px] flex-1" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{p}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Oração ── */}
                <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible"
                    className="rounded-2xl p-6 mb-8" style={{ background: "rgba(247,201,122,0.05)", border: "1px solid rgba(247,201,122,0.16)" }}>
                    <p className="eyebrow mb-3 inline-flex items-center gap-1.5"><Icon name="hands" size={14} style={{ color: "var(--text-secondary)" }} /> Oração</p>
                    {d.prayer.split("\n\n").map((p, i) => (
                        <p key={i} className="font-serif-devotional italic mb-2" style={{ color: "var(--text-secondary)", fontSize: "1.12rem", lineHeight: 1.7 }}>{p}</p>
                    ))}
                </motion.div>

                {/* ── Declaração de fé ── */}
                <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible"
                    className="rounded-2xl p-6 mb-8 flex items-start gap-4 surface-wood">
                    <Icon name="heart" size={22} style={{ color: "var(--text-secondary)", flexShrink: 0, marginTop: 4 }} />
                    <div>
                        <p className="eyebrow mb-2">Declaração de fé</p>
                        <p className="font-serif-devotional gradient-text" style={{ fontSize: "1.3rem", fontWeight: 500 }}>{d.declaration}</p>
                    </div>
                </motion.div>

                {/* ── Pergunta reflexiva ── */}
                <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible" className="card-base p-6 mb-9">
                    <p className="eyebrow mb-3"><span className="gold-rule" /> Pergunta reflexiva</p>
                    <p className="font-serif-devotional" style={{ color: "var(--cream)", fontSize: "1.2rem", lineHeight: 1.6 }}>{d.reflective_question}</p>
                </motion.div>

                {/* ── Ações finais ── */}
                <div className="space-y-3">
                    <button onClick={() => setShowJournal(true)} className="btn-ghost"><Icon name="pen" size={16} /> Escrever no diário</button>
                    <Link href="/emotion" className="btn-primary"><Icon name="sunrise" size={18} strokeWidth={1.8} /> Nova emoção</Link>
                    <div className="rounded-2xl p-5 text-center mt-2" style={{ background: "rgba(247,201,122,0.05)", border: "1px solid rgba(247,201,122,0.16)" }}>
                        <p className="font-display text-base mb-1" style={{ color: "var(--cream)" }}>Quer ir mais fundo?</p>
                        <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>Inicie uma jornada de 21 dias</p>
                        <Link href="/journey" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--gold)" }}>
                            Ver jornadas <Icon name="arrow-right" size={15} />
                        </Link>
                    </div>
                </div>
            </div>

            <BottomNav />
            <ShareModal open={showShare} onClose={() => setShowShare(false)} data={shareData} />

            {/* Diário (bottom sheet) */}
            <AnimatePresence>
                {showJournal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center"
                        style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowJournal(false); }}>
                        <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }} className="w-full max-w-md glass-strong rounded-t-3xl p-7 pb-10">
                            <h3 className="font-display text-xl mb-1" style={{ color: "var(--cream)" }}>Diário espiritual</h3>
                            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>O que ficou no seu coração após este devocional?</p>
                            {journalSaved ? (
                                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
                                    <Icon name="check" size={40} style={{ color: "var(--gold)" }} className="mx-auto" />
                                    <p className="mt-4 font-semibold" style={{ color: "var(--cream)" }}>Salvo no diário!</p>
                                </motion.div>
                            ) : (
                                <>
                                    <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)}
                                        placeholder="Escreva seus pensamentos, sentimentos, o que aprendeu hoje..." rows={5}
                                        className="input-base resize-none mb-4 font-serif-devotional" style={{ fontSize: "1.05rem", lineHeight: 1.6 }} autoFocus />
                                    <div className="flex gap-3">
                                        <button onClick={() => setShowJournal(false)} className="btn-ghost flex-1">Cancelar</button>
                                        <button onClick={handleSaveJournal} disabled={!journalText.trim()} className="btn-primary flex-1">Salvar</button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
