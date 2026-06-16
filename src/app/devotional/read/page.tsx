"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDevotionalStore } from "@/store";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import ShareModal from "@/components/ShareModal";
import DevotionalAudio from "@/components/DevotionalAudio";
import { Icon } from "@/components/icons";
import type { ShareData } from "@/components/ShareModal";

const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" as const },
    }),
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

    const shareData: ShareData | null = d ? {
        type: "devotional",
        title: d.title,
        declaration: d.declaration,
        verse: d.verse,
        verseRef: d.verse_reference,
        date: new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" }),
    } : null;

    async function handleSave() {
        if (!d) return;
        setSaving(true);
        await supabase.from("devotionals").update({ is_saved: !saved }).eq("id", d.id);
        setSaved(!saved);
        setSaving(false);
    }

    async function handleSaveJournal() {
        if (!journalText.trim() || !d) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("journal_entries").insert({
            user_id: user.id,
            devotional_id: d.id,
            content: journalText.trim(),
            emotion: d.emotion,
        });
        setJournalSaved(true);
        setTimeout(() => setShowJournal(false), 1500);
    }

    const today = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
    const verseFirst = d.verse.trim().charAt(0);
    const verseRest = d.verse.trim().slice(1);

    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden pb-28 lg:pb-10">

            {/* ── Capa: cena de amanhecer ── */}
            <div className="relative z-10 px-4 pt-5">
                <div className="relative rounded-3xl overflow-hidden" style={{ height: 210 }}>
                    {/* céu noite → alvorada */}
                    <div className="absolute inset-0" style={{
                        background: "linear-gradient(180deg, #07070D 0%, #141633 42%, #2B1B4D 66%, #C9824A 100%)"
                    }} />
                    {/* estrelas */}
                    {[...Array(16)].map((_, i) => (
                        <div key={i} className="absolute rounded-full" style={{
                            width: i % 3 === 0 ? 2 : 1,
                            height: i % 3 === 0 ? 2 : 1,
                            left: `${(i * 17 + 5) % 95}%`,
                            top: `${(i * 13 + 6) % 48}%`,
                            background: "var(--gold-light)",
                            opacity: 0.35 + (i % 4) * 0.14,
                        }} />
                    ))}
                    {/* linha do horizonte (ouro) */}
                    <div className="absolute left-0 right-0" style={{
                        bottom: "30%", height: 1,
                        background: "linear-gradient(90deg, transparent, var(--gold) 50%, transparent)",
                        boxShadow: "0 0 10px rgba(247,201,122,0.5)",
                    }} />
                    {/* escurecimento inferior p/ legibilidade */}
                    <div className="absolute bottom-0 left-0 right-0" style={{
                        height: "62%",
                        background: "linear-gradient(180deg, transparent 0%, rgba(7,7,13,0.82) 100%)"
                    }} />

                    {/* ações topo */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-10">
                        <Link href="/emotion" className="flex items-center gap-1 text-sm" style={{ color: "rgba(251,247,230,0.85)" }}>
                            <Icon name="arrow-left" size={17} /> Voltar
                        </Link>
                        <p className="eyebrow" style={{ color: "rgba(251,247,230,0.6)", fontSize: 10 }}>Hoje · {today}</p>
                        <button onClick={handleSave} disabled={saving} className="flex items-center justify-center w-8 h-8"
                            style={{ color: saved ? "var(--gold)" : "rgba(251,247,230,0.7)" }}>
                            <Icon name="bookmark" size={19} style={{ fill: saved ? "var(--gold)" : "none" }} />
                        </button>
                    </div>

                    {/* título + ref sobre a capa */}
                    <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
                        <h1 className="font-display text-2xl leading-tight mb-1" style={{ color: "var(--cream)" }}>{d.title}</h1>
                        <p className="eyebrow" style={{ color: "var(--gold)", fontSize: 11 }}>{d.verse_reference}</p>
                    </div>
                </div>
            </div>

            {/* ── Barra de ações: salvar · diário · compartilhar ── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 flex items-center justify-center gap-3 py-5 px-5 max-w-lg lg:max-w-3xl mx-auto"
            >
                <button onClick={handleSave} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full text-sm font-medium transition-all"
                    style={{
                        color: saved ? "var(--gold)" : "var(--text-secondary)",
                        border: `1px solid ${saved ? "rgba(247,201,122,0.45)" : "var(--glass-border)"}`,
                        background: saved ? "rgba(247,201,122,0.08)" : "transparent",
                    }}>
                    <Icon name="bookmark" size={17} style={{ fill: saved ? "var(--gold)" : "none" }} />
                    {saved ? "Salvo" : "Salvar"}
                </button>
                <button onClick={() => setShowJournal(true)}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full text-sm font-medium transition-all"
                    style={{ color: "var(--text-secondary)", border: "1px solid var(--glass-border)" }}>
                    <Icon name="pen" size={17} /> Diário
                </button>
                <button onClick={() => setShowShare(true)}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full text-sm font-medium transition-all"
                    style={{ color: "var(--text-secondary)", border: "1px solid var(--glass-border)" }}>
                    <Icon name="share" size={16} /> Compartilhar
                </button>
            </motion.div>

            {/* ── Player de áudio ── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="relative z-10 max-w-lg lg:max-w-3xl mx-auto px-5 pb-1"
            >
                <DevotionalAudio devotional={d} isPremium={isPremium} />
            </motion.div>

            <div className="relative z-10 max-w-lg lg:max-w-3xl mx-auto px-5 pt-6">
                {/* Reflexão */}
                <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="mb-8">
                    <p className="eyebrow mb-4"><span className="gold-rule" /> Reflexão</p>
                    <div className="space-y-4">
                        {d.reflection.split("\n\n").map((paragraph, i) => (
                            <p key={i} className="font-serif-devotional leading-relaxed" style={{ color: "var(--text-secondary)", fontSize: "1.12rem", lineHeight: 1.75 }}>
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </motion.div>

                {/* Versículo — com drop-cap de ouro */}
                <motion.div
                    custom={1} variants={sectionVariants} initial="hidden" animate="visible"
                    className="relative mb-8 pl-5"
                >
                    <div className="absolute left-0 top-1 bottom-1 w-px" style={{ background: "linear-gradient(180deg, var(--gold), transparent)" }} />
                    <p className="eyebrow mb-3">Versículo</p>
                    <blockquote className="font-serif-devotional italic leading-relaxed" style={{ color: "var(--cream)", fontSize: "1.45rem", lineHeight: 1.6 }}>
                        <span className="font-display not-italic float-left mr-2" style={{
                            color: "var(--gold)", fontSize: "3.4rem", lineHeight: 0.9, marginTop: 4,
                            textShadow: "0 0 24px rgba(247,201,122,0.3)",
                        }}>{verseFirst}</span>
                        {verseRest}
                    </blockquote>
                    <cite className="not-italic eyebrow block mt-3" style={{ color: "var(--gold)", fontSize: 11 }}>— {d.verse_reference}</cite>
                </motion.div>

                {/* Aplicação prática */}
                <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="mb-8">
                    <p className="eyebrow mb-4"><span className="gold-rule" /> Aplicação prática</p>
                    <div className="space-y-3.5">
                        {d.practical_application.split("\n\n").map((paragraph, i) => (
                            <div key={i} className="flex gap-3.5">
                                <div className="font-display flex-shrink-0 flex items-center justify-center"
                                    style={{ width: 26, height: 26, color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: 1 }}>
                                    {i + 1}
                                </div>
                                <p className="text-[15px] leading-relaxed flex-1" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{paragraph}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Oração */}
                <motion.div
                    custom={3} variants={sectionVariants} initial="hidden" animate="visible"
                    className="rounded-2xl p-6 mb-8"
                    style={{ background: "rgba(247,201,122,0.05)", border: "1px solid rgba(247,201,122,0.16)" }}
                >
                    <p className="eyebrow mb-3">Oração</p>
                    {d.prayer.split("\n\n").map((paragraph, i) => (
                        <p key={i} className="font-serif-devotional leading-relaxed italic mb-2" style={{ color: "var(--text-secondary)", fontSize: "1.12rem", lineHeight: 1.7 }}>{paragraph}</p>
                    ))}
                </motion.div>

                {/* Declaração de fé */}
                <motion.div
                    custom={4} variants={sectionVariants} initial="hidden" animate="visible"
                    className="rounded-2xl p-6 mb-8 flex items-start gap-4 surface-wood"
                >
                    <Icon name="heart" size={22} style={{ color: "var(--text-secondary)", flexShrink: 0, marginTop: 4 }} />
                    <div>
                        <p className="eyebrow mb-2">Declaração de fé</p>
                        <p className="font-serif-devotional leading-relaxed gradient-text" style={{ fontSize: "1.3rem", fontWeight: 500 }}>
                            {d.declaration}
                        </p>
                    </div>
                </motion.div>

                {/* Pergunta reflexiva */}
                <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible" className="card-base p-6 mb-9">
                    <p className="eyebrow mb-3"><span className="gold-rule" /> Pergunta reflexiva</p>
                    <p className="font-serif-devotional" style={{ color: "var(--cream)", fontSize: "1.2rem", lineHeight: 1.6 }}>{d.reflective_question}</p>
                </motion.div>

                {/* Ações finais */}
                <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-3">
                    <button onClick={() => setShowJournal(true)} className="btn-ghost">
                        <Icon name="pen" size={16} /> Escrever no diário
                    </button>
                    <Link href="/emotion" className="btn-primary">
                        <Icon name="sunrise" size={18} strokeWidth={1.8} /> Nova emoção
                    </Link>
                    <div className="rounded-2xl p-5 text-center mt-2" style={{ background: "rgba(247,201,122,0.05)", border: "1px solid rgba(247,201,122,0.16)" }}>
                        <p className="font-display text-base mb-1" style={{ color: "var(--cream)" }}>Quer ir mais fundo?</p>
                        <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>Inicie uma jornada de 21 dias</p>
                        <Link href="/journey" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--gold)" }}>
                            Ver jornadas <Icon name="arrow-right" size={15} />
                        </Link>
                    </div>
                </motion.div>
            </div>

            <BottomNav />

            <ShareModal open={showShare} onClose={() => setShowShare(false)} data={shareData} />

            {/* Diário (bottom sheet) */}
            <AnimatePresence>
                {showJournal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center"
                        style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowJournal(false); }}
                    >
                        <motion.div
                            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="w-full max-w-lg glass-strong rounded-t-3xl p-7 pb-10"
                        >
                            <h3 className="font-display text-xl mb-1" style={{ color: "var(--cream)" }}>Diário espiritual</h3>
                            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>O que ficou no seu coração após este devocional?</p>
                            {journalSaved ? (
                                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
                                    <Icon name="check" size={40} style={{ color: "var(--gold)" }} className="mx-auto" />
                                    <p className="mt-4 font-semibold" style={{ color: "var(--cream)" }}>Salvo no diário!</p>
                                </motion.div>
                            ) : (
                                <>
                                    <textarea
                                        value={journalText}
                                        onChange={(e) => setJournalText(e.target.value)}
                                        placeholder="Escreva seus pensamentos, sentimentos, o que aprendeu hoje..."
                                        rows={5}
                                        className="input-base resize-none mb-4 font-serif-devotional"
                                        style={{ fontSize: "1.05rem", lineHeight: 1.6 }}
                                        autoFocus
                                    />
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
