"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDevotionalStore } from "@/store";
import type { Devotional } from "@/types";

const loadingPhrases = [
    "Interpretando sua emoção...",
    "Buscando na Palavra...",
    "Preparando sua reflexão...",
    "Tecendo sua oração...",
    "Quase pronto...",
];

export default function GenerateDevotionalPage() {
    const router = useRouter();
    const { currentEmotionRaw, setDevotional, setEmotionAnalysis } = useDevotionalStore();
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [limitReached, setLimitReached] = useState(false);
    const [generating, setGenerating] = useState(true);

    useEffect(() => {
        if (!currentEmotionRaw) {
            router.replace("/emotion");
            return;
        }
        generate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cycle loading phrases — para quando não está gerando
    useEffect(() => {
        if (!generating) return;
        const interval = setInterval(() => {
            setPhraseIndex((i) => (i + 1) % loadingPhrases.length);
        }, 2200);
        return () => clearInterval(interval);
    }, [generating]);

    async function generate() {
        setGenerating(true);
        setError(null);
        try {
            const res = await fetch("/api/devotional/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emotion_raw: currentEmotionRaw }),
            });

            const data = await res.json();

            if (res.status === 402) {
                setLimitReached(true);
                setGenerating(false);
                return;
            }

            if (res.status === 429) {
                setGenerating(false);
                setError("A IA está sobrecarregada agora. Aguarde 1 minuto e tente novamente.");
                return;
            }

            if (res.status === 503) {
                setGenerating(false);
                setError("Serviço de IA temporariamente indisponível. Tente novamente em instantes.");
                return;
            }

            if (!res.ok) {
                setGenerating(false);
                throw new Error(data.error ?? "Erro desconhecido");
            }

            setDevotional(data.devotional as Devotional);
            setEmotionAnalysis(data.emotion_analysis);
            router.replace("/devotional/read");
        } catch (e: unknown) {
            setGenerating(false);
            setError(e instanceof Error ? e.message : "Algo deu errado. Tente novamente.");
        }
    }

    if (limitReached) {
        return (
            <main className="relative min-h-screen flex items-center justify-center px-6">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute rounded-full blur-[120px]" style={{ width: 600, height: 600, left: "20%", top: "10%", background: "rgba(124,58,237,0.10)" }} />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center max-w-md glass-strong rounded-3xl p-10"
                >
                    <span className="text-5xl mb-6 block">✨</span>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                        Você já recebeu seu devocional gratuito
                    </h2>
                    <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
                        Para continuar recebendo devocionais personalizados todos os dias, assine o Premium por apenas R$ 24,90/mês.
                    </p>
                    <a href="/subscription" className="btn-primary w-full justify-center">
                        ✨ Assinar Premium
                    </a>
                    <a href="/dashboard" className="btn-ghost w-full justify-center mt-3">
                        Ver meu devocional salvo
                    </a>
                </motion.div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-dvh flex items-center justify-center px-6" style={{ background: "var(--bg-base)" }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
                    <span className="text-4xl mb-5 block">⚠️</span>
                    <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>Algo deu errado</h2>
                    <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>{error}</p>
                    <button onClick={() => generate()} className="btn-primary w-full">
                        Tentar novamente
                    </button>
                    <button onClick={() => router.replace("/emotion")} className="btn-ghost w-full mt-3">
                        Escolher outra emoção
                    </button>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="relative min-h-dvh flex items-center justify-center overflow-hidden px-6">
            <div className="relative z-10 text-center w-full max-w-sm mx-auto">
                {/* Circular loader */}
                <div className="relative mx-auto mb-10" style={{ width: 160, height: 160 }}>
                    {/* Outer pulse ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ border: "1px solid rgba(168,85,247,0.2)" }}
                        animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* Spinning arc */}
                    <motion.div
                        className="absolute inset-2 rounded-full"
                        style={{
                            border: "2px solid transparent",
                            borderTopColor: "#A855F7",
                            borderRightColor: "rgba(168,85,247,0.3)",
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Inner sphere */}
                    <div
                        className="absolute inset-6 rounded-full flex items-center justify-center"
                        style={{
                            background: "radial-gradient(circle at 35% 35%, rgba(236,72,153,0.5), rgba(168,85,247,0.8))",
                            boxShadow: "0 0 40px rgba(168,85,247,0.5)",
                        }}
                    >
                        <motion.span
                            className="text-3xl"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >✨</motion.span>
                    </div>
                </div>

                <motion.p
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5 }}
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                >
                    {loadingPhrases[phraseIndex]}
                </motion.p>
                <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
                    Isso leva apenas alguns segundos
                </p>

                {/* Verse teaser */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="text-sm italic px-4"
                    style={{ color: "var(--text-muted)", fontFamily: "var(--font-cormorant)" }}
                >
                    &ldquo;Não andeis ansiosos por coisa alguma...&rdquo;
                </motion.p>
            </div>
        </main>
    );
}
