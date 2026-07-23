"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BrandMark, Icon } from "@/components/icons";
import { PREMIUM_PRICE, PREMIUM_PRICE_ANNUAL, PREMIUM_ANNUAL_SAVINGS } from "@/lib/constants";
import { track, EVENTS } from "@/lib/analytics/events";
import { toast } from "@/store";

const features = [
    "Devocionais ilimitados, todos os dias",
    "Jornadas de 21 dias completas",
    "Diário espiritual da sua caminhada",
    "Áudio do devocional e modo madrugada",
    "Cards dourados para compartilhar a Palavra",
    "Histórico completo e seus marcos",
];

const fmt = (v: number) => v.toFixed(2).replace(".", ",");
const annualMonthly = fmt(PREMIUM_PRICE_ANNUAL / 12); // R$/mês equivalente no anual

export default function SubscriptionPage() {
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<"month" | "year">("year");

    useEffect(() => {
        track(EVENTS.PAYWALL_VIEWED, { source: "subscription_page" });
    }, []);

    async function handleSubscribe() {
        setLoading(true);
        try {
            const res = await fetch("/api/checkout/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast({ type: "error", title: "Não foi possível iniciar o pagamento", description: data.error });
                setLoading(false);
            }
        } catch {
            toast({ type: "error", title: "Erro de conexão", description: "Tente novamente em instantes." });
            setLoading(false);
        }
    }

    return (
        <main className="aurora-bg relative min-h-dvh px-5 py-8 overflow-hidden">
            <div className="relative z-10 w-full max-w-md mx-auto">
                {/* Fechar */}
                <div className="flex justify-end mb-3">
                    <Link href="/dashboard" aria-label="Fechar" className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", color: "var(--text-muted)" }}>
                        <Icon name="close" size={18} />
                    </Link>
                </div>

                {/* Marca + headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-7"
                >
                    <BrandMark size={68} className="mx-auto mb-4" style={{ filter: "drop-shadow(0 0 26px rgba(247,201,122,0.28))" }} />
                    <p className="eyebrow mb-3 justify-center" style={{ color: "var(--gold)" }}>plano humanáh</p>
                    <h1 className="font-display leading-tight mb-2" style={{ color: "var(--cream)", fontSize: "clamp(1.7rem, 6vw, 2.2rem)", fontWeight: 400 }}>
                        Seu maná, <span style={{ fontStyle: "italic", color: "var(--gold)" }}>sem limites</span>
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        Um devocional feito para o seu momento, todos os dias — sem contar quantos.
                    </p>
                </motion.div>

                {/* O que está incluído */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                    className="card-base p-5 mb-5"
                >
                    <ul className="space-y-3">
                        {features.map((f, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.05 }}
                                className="flex items-start gap-3 text-sm leading-snug"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                <span
                                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ background: "rgba(247,201,122,0.12)", border: "1px solid rgba(247,201,122,0.28)" }}
                                >
                                    <Icon name="check" size={12} strokeWidth={2.4} style={{ color: "var(--gold)" }} />
                                </span>
                                {f}
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

                {/* Seletor de plano */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 gap-3 mb-6"
                >
                    {/* Anual */}
                    <button
                        onClick={() => setPlan("year")}
                        className="relative text-left rounded-2xl p-4 transition-all"
                        style={{
                            background: plan === "year" ? "rgba(247,201,122,0.10)" : "var(--glass)",
                            border: plan === "year" ? "1.5px solid var(--gold)" : "1px solid var(--glass-border)",
                            boxShadow: plan === "year" ? "0 0 30px rgba(247,201,122,0.12)" : "none",
                        }}
                    >
                        <span className="absolute -top-2 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ background: "var(--gradient-gold)", color: "#2A1E08" }}>
                            ECONOMIZE R$ {PREMIUM_ANNUAL_SAVINGS}
                        </span>
                        <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Anual</p>
                        <p className="font-display" style={{ color: "var(--cream)", fontSize: "1.5rem", fontWeight: 500 }}>
                            R$ {annualMonthly}<span className="text-xs" style={{ color: "var(--text-muted)" }}>/mês</span>
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>R$ {fmt(PREMIUM_PRICE_ANNUAL)} por ano</p>
                    </button>

                    {/* Mensal */}
                    <button
                        onClick={() => setPlan("month")}
                        className="text-left rounded-2xl p-4 transition-all"
                        style={{
                            background: plan === "month" ? "rgba(247,201,122,0.10)" : "var(--glass)",
                            border: plan === "month" ? "1.5px solid var(--gold)" : "1px solid var(--glass-border)",
                            boxShadow: plan === "month" ? "0 0 30px rgba(247,201,122,0.12)" : "none",
                        }}
                    >
                        <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Mensal</p>
                        <p className="font-display" style={{ color: "var(--cream)", fontSize: "1.5rem", fontWeight: 500 }}>
                            R$ {fmt(PREMIUM_PRICE)}<span className="text-xs" style={{ color: "var(--text-muted)" }}>/mês</span>
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Flexível, cancele quando quiser</p>
                    </button>
                </motion.div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <button onClick={handleSubscribe} disabled={loading} className="btn-primary">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                                Redirecionando...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Icon name="sparkle" size={18} />
                                {plan === "year" ? "Assinar plano anual" : "Assinar plano mensal"}
                            </span>
                        )}
                    </button>
                    <p className="text-xs mt-3 flex items-center justify-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                        <Icon name="lock" size={12} /> Pagamento seguro · cancele quando quiser
                    </p>
                </motion.div>

                <p className="text-center text-sm mt-6">
                    <Link href="/dashboard" style={{ color: "var(--text-muted)" }}>Continuar no plano gratuito</Link>
                </p>
            </div>
        </main>
    );
}
