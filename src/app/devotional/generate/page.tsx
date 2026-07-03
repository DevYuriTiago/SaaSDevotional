"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useDevotionalStore } from "@/store";
import type { Devotional } from "@/types";
import Horizon from "@/components/Horizon";
import { Icon, BrandMark } from "@/components/icons";
import { track, EVENTS } from "@/lib/analytics/events";

const loadingPhrases = [
    "Interpretando o seu coração...",
    "Buscando na Palavra...",
    "Preparando sua reflexão...",
    "Tecendo a sua oração...",
    "A luz está chegando...",
];

export default function GenerateDevotionalPage() {
    const router = useRouter();
    const { currentEmotionRaw, setDevotional, setEmotionAnalysis } = useDevotionalStore();
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [limitReached, setLimitReached] = useState(false);
    const [generating, setGenerating] = useState(true);
    // Garante UMA única geração (evita a dupla chamada do StrictMode em dev
    // e qualquer duplo-disparo por remount → impede devocional duplicado)
    const startedRef = useRef(false);

    useEffect(() => {
        if (!currentEmotionRaw) {
            router.replace("/emotion");
            return;
        }
        if (startedRef.current) return;
        startedRef.current = true;
        generate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!generating) return;
        const interval = setInterval(() => {
            setPhraseIndex((i) => (i + 1) % loadingPhrases.length);
        }, 2400);
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

            // Paywall tem UI própria; qualquer outro erro mostra a mensagem
            // amigável que o servidor já centraliza (lib/ai/errors).
            if (res.status === 402) { setLimitReached(true); setGenerating(false); track(EVENTS.PAYWALL_VIEWED, { source: "generate_limit" }); return; }
            if (!res.ok) { setGenerating(false); setError(data.error ?? "Algo não saiu como esperado. Tente novamente."); return; }

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
            <main className="aurora-bg relative min-h-dvh flex items-center justify-center px-6 overflow-hidden">
                <Horizon position={0.86} glow={0.8} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center max-w-md surface-wood rounded-3xl p-9"
                >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                        style={{ background: "rgba(247,201,122,0.10)", border: "1px solid rgba(247,201,122,0.3)" }}>
                        <Icon name="crown" size={26} style={{ color: "var(--gold)" }} />
                    </div>
                    <h2 className="font-display text-2xl mb-3" style={{ color: "var(--cream)" }}>
                        Sua experiência gratuita chegou ao fim
                    </h2>
                    <p className="text-sm mb-7" style={{ color: "var(--text-secondary)" }}>
                        Você já sentiu como é receber uma Palavra feita para o seu momento. Para continuar todos os dias — sem limites — assine o Premium a partir de R$ 16,58/mês no plano anual.
                    </p>
                    <Link href="/subscription" className="btn-primary mb-3">Assinar Premium</Link>
                    <Link href="/dashboard" className="btn-ghost">Ver meu devocional salvo</Link>
                </motion.div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="aurora-bg relative min-h-dvh flex items-center justify-center px-6 overflow-hidden">
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center max-w-sm">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-5"
                        style={{ background: "rgba(224,151,90,0.12)", border: "1px solid rgba(224,151,90,0.3)" }}>
                        <Icon name="bell" size={22} style={{ color: "var(--amber)" }} />
                    </div>
                    <h2 className="font-display text-xl mb-3" style={{ color: "var(--cream)" }}>Algo deu errado</h2>
                    <p className="text-sm mb-7" style={{ color: "var(--text-secondary)" }}>{error}</p>
                    <button onClick={() => generate()} className="btn-primary mb-3">Tentar novamente</button>
                    <button onClick={() => router.replace("/emotion")} className="btn-ghost">Escolher outra emoção</button>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="aurora-bg relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-6">
            {/* O loading É o amanhecer: o horizonte sobe */}
            <Horizon rising position={0.32} riseFrom={0.82} />

            <div className="relative z-10 text-center w-full max-w-sm mx-auto">
                <motion.div
                    className="inline-flex mb-9 animate-pulse-glow rounded-full"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ padding: 14, background: "rgba(247,201,122,0.05)" }}
                >
                    <BrandMark size={48} />
                </motion.div>

                <motion.p
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5 }}
                    className="font-display text-xl mb-2"
                    style={{ color: "var(--cream)" }}
                >
                    {loadingPhrases[phraseIndex]}
                </motion.p>
                <p className="text-sm mb-9" style={{ color: "var(--text-muted)" }}>
                    A alegria vem pela manhã · Salmo 30:5
                </p>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="text-base italic px-4 font-serif-devotional"
                    style={{ color: "var(--text-secondary)" }}
                >
                    &ldquo;As misericórdias do Senhor se renovam a cada manhã.&rdquo;
                </motion.p>
            </div>
        </main>
    );
}
