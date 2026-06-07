"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EMOTION_CATEGORIES } from "@/lib/constants";
import { useDevotionalStore } from "@/store";

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

    return (
        <main className="relative min-h-dvh flex flex-col px-5 pb-8" style={{ background: "var(--bg-base)" }}>
            <div className="relative z-10 w-full max-w-md lg:max-w-2xl mx-auto flex-1 flex flex-col pt-14">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard" className="text-lg" style={{ color: "var(--text-muted)" }}>←</Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-7"
                >
                    <h1 className="text-2xl font-bold leading-tight mb-2" style={{ color: "var(--text-primary)" }}>
                        Como você está<br />se sentindo?
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Escolha uma opção ou descreva com suas palavras.
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
                                {/* Emotion grid */}
                                <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
                                    {EMOTION_CATEGORIES.map((emotion, i) => (
                                        <motion.button
                                            key={emotion.id}
                                            onClick={() => setSelected(emotion.id)}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            whileTap={{ scale: 0.93 }}
                                            className="flex flex-col items-center gap-2 rounded-2xl py-4 px-2 transition-all duration-200"
                                            style={selected === emotion.id ? {
                                                background: "rgba(168,85,247,0.18)",
                                                border: "1px solid rgba(168,85,247,0.5)",
                                                boxShadow: "0 0 20px rgba(168,85,247,0.2)",
                                            } : {
                                                background: "var(--glass)",
                                                border: "1px solid var(--glass-border)",
                                            }}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                                                style={{ background: selected === emotion.id ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.06)" }}
                                            >
                                                {emotion.emoji}
                                            </div>
                                            <span
                                                className="text-xs font-medium leading-tight text-center"
                                                style={{ color: selected === emotion.id ? "var(--text-primary)" : "var(--text-secondary)" }}
                                            >
                                                {emotion.label}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>

                                {/* "Descrever" ghost button */}
                                <button
                                    onClick={() => setShowCustom(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-sm font-medium transition-all mb-6"
                                    style={{
                                        background: "transparent",
                                        border: "1px solid var(--glass-border)",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    ✍️ Descrever com minhas palavras
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
                                    className="input-base resize-none mb-3"
                                    style={{ lineHeight: "1.7" }}
                                    autoFocus
                                />
                                <div className="flex justify-between mb-4">
                                    <button
                                        onClick={() => setShowCustom(false)}
                                        className="text-xs flex items-center gap-1"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        ← Voltar para emoções
                                    </button>
                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{customText.length}/500</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Continue button */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <button
                        onClick={handleProceed}
                        disabled={!canProceed || loading}
                        className="btn-primary"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Interpretando...
                            </span>
                        ) : (
                            "Continuar"
                        )}
                    </button>
                </motion.div>
            </div>
        </main>
    );
}

