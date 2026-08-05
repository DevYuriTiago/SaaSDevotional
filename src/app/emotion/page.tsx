"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { EMOTION_CATEGORIES } from "@/lib/constants";
import { useDevotionalStore } from "@/store";
import { getStoredReferral } from "@/lib/analytics/events";
import BottomNav from "@/components/BottomNav";
import { Icon, EmotionGlyph, type IconName } from "@/components/icons";

// Ordem dos chips (8 emoções) + "Outro sentimento" no fim.
const CHIP_ORDER = ["ansioso", "cansado", "triste", "com-raiva", "perdido", "grato", "esperancoso", "com-fe"];

const DELIVERABLES: { icon: IconName; label: string }[] = [
    { icon: "book", label: "Reflexão personalizada" },
    { icon: "scroll", label: "Versículo bíblico" },
    { icon: "hands", label: "Oração específica" },
    { icon: "feather", label: "Aplicação prática" },
    { icon: "crown", label: "Declaração de fé" },
];

export default function EmotionPage() {
    const router = useRouter();
    const { setEmotion } = useDevotionalStore();
    const [selected, setSelected] = useState<string | null>(null);
    const [customText, setCustomText] = useState("");
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Vincula um eventual convite (?ref=) na primeira tela autenticada do fluxo.
    useEffect(() => {
        const code = getStoredReferral();
        if (!code) return;
        fetch("/api/referral/attach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        })
            .catch(() => {})
            .finally(() => { try { localStorage.removeItem("sh_ref"); } catch {} });
    }, []);

    const chips = CHIP_ORDER
        .map((id) => EMOTION_CATEGORIES.find((e) => e.id === id))
        .filter(Boolean) as typeof EMOTION_CATEGORIES;

    const hasText = customText.trim().length > 3;
    const canProceed = !!selected || hasText;

    async function handleProceed() {
        if (!canProceed) return;
        const category = EMOTION_CATEGORIES.find((e) => e.id === selected);
        const raw = hasText ? customText.trim() : selected ?? "";
        const label = hasText ? customText.trim() : category?.label ?? raw;
        setLoading(true);
        setEmotion(label, raw);
        router.push("/devotional/generate");
    }

    const today = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", timeZone: "America/Sao_Paulo" }).toUpperCase();

    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden pb-28">
            <div className="relative z-10 max-w-md mx-auto px-5 pt-6">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-7">
                    <Link href="/dashboard" className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
                        <Icon name="arrow-left" size={18} />
                    </Link>
                    <span className="eyebrow" style={{ color: "var(--text-muted)", fontSize: 10 }}>{today} · Hoje</span>
                    <Link href="/devotional/history" className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
                        <Icon name="book" size={17} />
                    </Link>
                </div>

                {/* Título */}
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h1 className="font-display leading-[1.1] mb-3" style={{ color: "var(--cream)", fontSize: "clamp(2rem, 8vw, 2.6rem)", fontWeight: 400, letterSpacing: "-0.01em" }}>
                        O que você está<br />sentindo <span style={{ fontStyle: "italic", color: "var(--gold)" }}>hoje?</span>
                    </h1>
                    <p className="text-sm leading-relaxed px-2" style={{ color: "var(--text-secondary)" }}>
                        Conte como está sua alma neste momento<br className="hidden sm:block" /> e receba um direcionamento personalizado.
                    </p>
                </motion.div>

                {/* Chips de emoção */}
                <p className="eyebrow mb-4" style={{ color: "var(--text-muted)" }}>Como está seu coração?</p>
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                    {chips.map((e) => {
                        const isSel = selected === e.id;
                        return (
                            <button
                                key={e.id}
                                onClick={() => setSelected(isSel ? null : e.id)}
                                className="flex items-center gap-2.5 rounded-2xl px-3.5 py-3 transition-all duration-200 text-left"
                                style={{
                                    background: isSel ? "rgba(247,201,122,0.12)" : "var(--glass)",
                                    border: `1px solid ${isSel ? "rgba(247,201,122,0.55)" : "var(--glass-border)"}`,
                                    boxShadow: isSel ? "0 0 20px rgba(247,201,122,0.18)" : "none",
                                }}
                            >
                                <EmotionGlyph glyph={e.glyph} size={20} strokeWidth={1.6} style={{ color: isSel ? "var(--gold)" : e.color, flexShrink: 0 }} />
                                <span className="text-sm whitespace-nowrap" style={{ color: isSel ? "var(--cream)" : "var(--text-secondary)" }}>{e.label}</span>
                            </button>
                        );
                    })}
                    {/* Outro sentimento */}
                    <button
                        onClick={() => { setSelected(null); textareaRef.current?.focus(); textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                        className="flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-left"
                        style={{ background: "transparent", border: "1px dashed var(--glass-border)" }}
                    >
                        <Icon name="plus" size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                        <span className="text-sm whitespace-nowrap" style={{ color: "var(--text-muted)" }}>Outro sentimento</span>
                    </button>
                </div>

                {/* Conte com suas palavras */}
                <div className="card-base p-5 mb-6">
                    <p className="eyebrow mb-2 inline-flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                        <Icon name="pen" size={14} style={{ color: "var(--text-secondary)" }} /> Conte com suas palavras
                    </p>
                    <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>O que está acontecendo? Como você está se sentindo?</p>
                    <textarea
                        ref={textareaRef}
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Escreva aqui o que está em seu coração..."
                        maxLength={1000}
                        rows={5}
                        className="input-base resize-none font-serif-devotional"
                        style={{ lineHeight: "1.7", fontSize: "1.05rem" }}
                    />
                    <p className="text-right text-xs mt-2" style={{ color: "var(--text-muted)" }}>{customText.length}/1000</p>
                </div>

                {/* Seu devocional incluirá */}
                <div className="card-base p-5 mb-6">
                    <p className="eyebrow mb-4" style={{ color: "var(--text-muted)" }}>Seu devocional incluirá:</p>
                    <div className="grid grid-cols-5 gap-1">
                        {DELIVERABLES.map((d, i) => (
                            <div key={i} className="flex flex-col items-center text-center gap-2">
                                <Icon name={d.icon} size={22} style={{ color: "var(--gold)" }} />
                                <span className="text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <button onClick={handleProceed} disabled={!canProceed || loading} className="btn-primary w-full justify-center py-4">
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                            Interpretando...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Icon name="sparkle" size={18} /> Receber meu devocional
                        </span>
                    )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4">
                    <Icon name="lock" size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Seus dados estão protegidos com segurança</p>
                </div>
            </div>
            <BottomNav />
        </main>
    );
}
