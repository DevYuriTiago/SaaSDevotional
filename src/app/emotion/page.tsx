"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EMOTION_CATEGORIES } from "@/lib/constants";
import { useDevotionalStore } from "@/store";
import { Icon, EmotionGlyph } from "@/components/icons";

export default function EmotionPage() {
    const router = useRouter();
    const { setEmotion } = useDevotionalStore();
    const [selected, setSelected] = useState<string | null>(null);
    const [showCustom, setShowCustom] = useState(false);
    const [customText, setCustomText] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleProceed() {
        const raw = showCustom ? customText.trim() : selected ?? "";
        if (!raw) return;
        const label = !showCustom
            ? EMOTION_CATEGORIES.find((e) => e.id === selected)?.label ?? raw
            : raw;
        setLoading(true);
        setEmotion(label, raw);
        router.push("/devotional/generate");
    }

    const canProceed = showCustom ? customText.trim().length > 3 : !!selected;
    const today = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" }).toUpperCase();

    return (
        <main className="aurora-bg relative min-h-dvh flex flex-col px-5 pb-8 overflow-hidden">
            <div className="relative z-10 w-full max-w-md lg:max-w-2xl mx-auto flex-1 flex flex-col pt-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-7">
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
                        style={{ color: "var(--text-muted)", border: "1px solid var(--glass-border)" }}
                    >
                        <Icon name="arrow-left" size={18} />
                    </Link>
                    <span className="eyebrow" style={{ color: "var(--text-muted)", fontSize: 10 }}>
                        <span className="gold-rule" /> {today}
                    </span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8"
                >
                    <h1
                        className="font-display leading-[1.08] mb-3"
                        style={{ color: "var(--cream)", fontSize: "clamp(2rem, 8vw, 2.9rem)", fontWeight: 400, letterSpacing: "-0.01em" }}
                    >
                        Como você está se sentindo{" "}
                        <span style={{ fontStyle: "italic", color: "var(--gold)" }}>hoje?</span>
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Escolha a luz deste momento — ou escreva com suas palavras.
                    </p>
                </motion.div>

                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        {!showCustom ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                            >
                                {/* Nichos das emoções */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
                                    {EMOTION_CATEGORIES.map((emotion, i) => {
                                        const isSel = selected === emotion.id;
                                        return (
                                            <motion.button
                                                key={emotion.id}
                                                onClick={() => setSelected(emotion.id)}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.035 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="relative flex flex-col items-center gap-2.5 px-3 pt-5 pb-4 transition-all duration-300"
                                                style={{
                                                    borderRadius: "22px 22px 13px 13px",
                                                    border: isSel ? "1px solid rgba(247,201,122,0.6)" : "1px solid var(--glass-border)",
                                                    background: isSel
                                                        ? "linear-gradient(180deg, rgba(247,201,122,0.16), rgba(247,201,122,0.03))"
                                                        : "var(--glass)",
                                                    boxShadow: isSel
                                                        ? "0 0 24px rgba(247,201,122,0.18), inset 0 1px 0 rgba(247,201,122,0.25)"
                                                        : "inset 0 1px 0 rgba(247,201,122,0.05)",
                                                }}
                                            >
                                                <EmotionGlyph
                                                    glyph={emotion.glyph}
                                                    size={26}
                                                    strokeWidth={1.5}
                                                    style={{
                                                        color: isSel ? "var(--gold)" : emotion.color,
                                                        transition: "color 0.3s",
                                                        filter: isSel ? "drop-shadow(0 0 8px rgba(247,201,122,0.5))" : "none",
                                                    }}
                                                />
                                                <span
                                                    className="font-serif-devotional text-base leading-none text-center"
                                                    style={{ color: isSel ? "var(--cream)" : "var(--text-secondary)" }}
                                                >
                                                    {emotion.label}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setShowCustom(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl text-sm font-medium transition-all mb-6"
                                    style={{ background: "transparent", border: "1px solid var(--glass-border)", color: "var(--text-muted)" }}
                                >
                                    <Icon name="pen" size={16} />
                                    Descrever com minhas palavras
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="custom"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                                className="mb-6"
                            >
                                <textarea
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder="Escreva livremente o que está sentindo... Pode ser uma emoção, uma situação ou um pensamento."
                                    maxLength={500}
                                    rows={6}
                                    className="input-base resize-none mb-3 font-serif-devotional"
                                    style={{ lineHeight: "1.7", fontSize: "1.05rem" }}
                                    autoFocus
                                />
                                <div className="flex justify-between mb-4">
                                    <button
                                        onClick={() => setShowCustom(false)}
                                        className="text-xs flex items-center gap-1"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        <Icon name="chevron-left" size={14} /> Voltar para as emoções
                                    </button>
                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{customText.length}/500</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <button onClick={handleProceed} disabled={!canProceed || loading} className="btn-primary">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                                Interpretando...
                            </span>
                        ) : (
                            <>
                                Receber meu devocional
                                <Icon name="arrow-right" size={18} strokeWidth={1.8} />
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </main>
    );
}
