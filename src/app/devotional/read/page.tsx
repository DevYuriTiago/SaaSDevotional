"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDevotionalStore } from "@/store";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import ShareModal from "@/components/ShareModal";
import type { ShareData } from "@/components/ShareModal";

const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.18, duration: 0.7, ease: "easeOut" as const },
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

    const supabase = createClient();

    useEffect(() => {
        if (!currentDevotional) {
            router.replace("/emotion");
        }
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
        await supabase
            .from("devotionals")
            .update({ is_saved: !saved })
            .eq("id", d.id);
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

    return (
        <main className="relative min-h-dvh overflow-x-hidden pb-28 lg:pb-10" style={{ background: "var(--bg-base)" }}>

            {/* ── Card de capa (imagem + título sobreposto) ── */}
            <div className="px-4 pt-5">
                <div className="relative rounded-3xl overflow-hidden" style={{ height: 220 }}>
                    {/* Landscape gradient simulating mountain scene */}
                    <div className="absolute inset-0" style={{
                        background: "linear-gradient(180deg, #050310 0%, #150a3a 25%, #2d1065 55%, #4c1d95 80%, #6d28d9 100%)"
                    }} />
                    {/* Stars layer */}
                    {[...Array(18)].map((_, i) => (
                        <div key={i} className="absolute rounded-full" style={{
                            width: i % 3 === 0 ? 2 : 1,
                            height: i % 3 === 0 ? 2 : 1,
                            left: `${(i * 17 + 5) % 95}%`,
                            top: `${(i * 13 + 8) % 50}%`,
                            background: "white",
                            opacity: 0.4 + (i % 4) * 0.15,
                        }} />
                    ))}
                    {/* Mountain silhouette at bottom */}
                    <div className="absolute bottom-0 left-0 right-0" style={{
                        height: "55%",
                        background: "linear-gradient(180deg, transparent 0%, rgba(10,4,30,0.85) 100%)"
                    }} />
                    {/* Purple glow orb */}
                    <div className="absolute" style={{
                        width: 120, height: 120, right: "15%", top: "10%",
                        background: "radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)",
                        filter: "blur(20px)"
                    }} />

                    {/* Top actions */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-10">
                        <Link href="/emotion" className="text-sm flex items-center gap-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                            ← Voltar
                        </Link>
                        <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>Hoje, {today}</p>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center justify-center w-8 h-8"
                            style={{ color: saved ? "#EC4899" : "rgba(255,255,255,0.6)" }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                        </button>
                    </div>

                    {/* Title + verse overlaid at bottom of card */}
                    <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
                        <h1 className="text-lg font-bold leading-tight text-white mb-1">{d.title}</h1>
                        <p className="text-xs font-semibold" style={{ color: "rgba(196,162,253,0.9)" }}>{d.verse_reference}</p>
                    </div>
                </div>
            </div>

            {/* ── Action bar: ♡ | ▶ play | share ── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-10 py-5 px-5"
                style={{ borderBottom: "1px solid var(--glass-border)" }}
            >
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                    style={{ color: saved ? "#EC4899" : "var(--text-muted)", background: saved ? "rgba(236,72,153,0.12)" : "transparent" }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                </button>
                <button
                    onClick={() => setShowJournal(true)}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-xl"
                    style={{ background: "var(--gradient-button)", boxShadow: "var(--shadow-button)" }}
                >
                    ▶
                </button>
                <button
                    onClick={() => setShowShare(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                    style={{ color: "var(--text-muted)" }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </motion.div>

            <div className="relative z-10 max-w-lg lg:max-w-3xl mx-auto px-5 pt-6">
                {/* Reflexão */}
                <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="mb-6">
                    <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Reflexão</p>
                    <div className="space-y-3">
                        {d.reflection.split("\n\n").map((paragraph, i) => (
                            <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </motion.div>

                {/* Versículo */}
                <motion.div
                    custom={1}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="card-base p-5 mb-6 relative overflow-hidden"
                    style={{ borderColor: "rgba(168,85,247,0.2)" }}
                >
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full" style={{ background: "var(--gradient-button)" }} />
                    <blockquote
                        className="italic pl-3 mb-2 leading-relaxed"
                        style={{ color: "var(--text-primary)", fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "1.15rem" }}
                    >
                        &quot;{d.verse}&quot;
                    </blockquote>
                    <cite className="not-italic text-xs font-semibold pl-3" style={{ color: "var(--brand-purple)" }}>— {d.verse_reference}</cite>
                </motion.div>

                {/* Aplicação prática */}
                <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="mb-6">
                    <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Aplicação prática</p>
                    <div className="space-y-3">
                        {d.practical_application.split("\n\n").map((paragraph, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                                    style={{ background: "rgba(168,85,247,0.15)", color: "var(--brand-purple)", fontSize: 10, fontWeight: 700 }}>
                                    {i + 1}
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{paragraph}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Oração */}
                <motion.div
                    custom={3}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-2xl p-5 mb-6"
                    style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.15)" }}
                >
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--brand-purple)" }}>🙏 Oração</p>
                    {d.prayer.split("\n\n").map((paragraph, i) => (
                        <p key={i} className="text-sm leading-relaxed italic mb-2" style={{ color: "var(--text-secondary)" }}>{paragraph}</p>
                    ))}
                </motion.div>

                {/* Declaração de fé */}
                <motion.div
                    custom={4}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-2xl p-5 mb-6 flex items-start gap-4"
                    style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}
                >
                    <span className="text-2xl flex-shrink-0">❤️</span>
                    <div>
                        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Declaração de fé</p>
                        <p
                            className="leading-relaxed font-semibold gradient-text"
                            style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}
                        >
                            {d.declaration}
                        </p>
                    </div>
                </motion.div>

                {/* Pergunta reflexiva */}
                <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible" className="card-base p-5 mb-8">
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Pergunta reflexiva</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{d.reflective_question}</p>
                </motion.div>

                {/* Ações finais */}
                <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-3">
                    <button onClick={() => setShowJournal(true)} className="btn-ghost">
                        📝 Escrever no diário
                    </button>
                    <Link href="/emotion" className="btn-primary">✨ Nova emoção</Link>
                    <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.15)" }}>
                        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>🔥 Quer ir mais fundo?</p>
                        <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>Inicie uma jornada de 21 dias</p>
                        <Link href="/journey" className="text-sm font-semibold" style={{ color: "var(--brand-purple)" }}>Ver jornadas →</Link>
                    </div>
                </motion.div>
            </div>

            <BottomNav />

            {/* Share modal */}
            <ShareModal open={showShare} onClose={() => setShowShare(false)} data={shareData} />

            {/* Journal modal (bottom sheet) */}
            <AnimatePresence>
                {showJournal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center"
                        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowJournal(false); }}
                    >
                        <motion.div
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 60, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="w-full max-w-lg glass-strong rounded-t-3xl p-7 pb-10"
                        >
                            <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>Diário espiritual</h3>
                            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>O que ficou no seu coração após este devocional?</p>
                            {journalSaved ? (
                                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
                                    <span className="text-4xl">✅</span>
                                    <p className="mt-4 font-semibold" style={{ color: "var(--text-primary)" }}>Salvo no diário!</p>
                                </motion.div>
                            ) : (
                                <>
                                    <textarea
                                        value={journalText}
                                        onChange={(e) => setJournalText(e.target.value)}
                                        placeholder="Escreva seus pensamentos, sentimentos, o que aprendeu hoje..."
                                        rows={5}
                                        className="input-base resize-none mb-4"
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

