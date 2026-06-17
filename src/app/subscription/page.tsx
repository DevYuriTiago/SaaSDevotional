"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AmbientSphere from "@/components/AmbientSphere";
import { Icon } from "@/components/icons";
import { PREMIUM_PRICE, PREMIUM_PRICE_ANNUAL, PREMIUM_ANNUAL_SAVINGS } from "@/lib/constants";

const features = [
    "Devocionais ilimitados",
    "Jornadas de 21 dias completas",
    "Diário espiritual completo",
    "Modo madrugada",
    "Áudios exclusivos",
    "Conquistas especiais",
    "Histórico completo",
];

const fmt = (v: number) => v.toFixed(2).replace(".", ",");
const annualMonthly = fmt(PREMIUM_PRICE_ANNUAL / 12); // R$/mês equivalente no anual

export default function SubscriptionPage() {
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<"month" | "year">("year");

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
                alert(data.error ?? "Erro ao iniciar pagamento.");
                setLoading(false);
            }
        } catch {
            alert("Erro de conexão. Tente novamente.");
            setLoading(false);
        }
    }

    return (
        <main className="relative min-h-dvh px-5 py-10 lg:pb-10 overflow-hidden" style={{ background: "var(--night)" }}>
            <AmbientSphere />
            <div className="relative z-10 w-full max-w-md lg:max-w-xl mx-auto">
                {/* Close button */}
                <div className="flex justify-end mb-6">
                    <Link href="/dashboard" className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", color: "var(--text-muted)" }}>
                        <Icon name="close" size={18} />
                    </Link>
                </div>

                {/* Crown + headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-8"
                >
                    <div
                        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}
                    >
                        <Icon name="crown" size={32} style={{ color: "var(--gold)" }} />
                    </div>
                    <h1 className="font-display mb-2" style={{ color: "var(--cream)", fontSize: "clamp(1.6rem, 6vw, 2.1rem)", fontWeight: 400 }}>
                        Assinatura <span style={{ fontStyle: "italic", color: "var(--gold)" }}>Premium</span>
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Sua jornada espiritual, sem limites.
                    </p>
                </motion.div>

                {/* Feature checklist */}
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
                                className="flex items-center gap-3 text-sm"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                <span
                                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(255,252,245,0.05)" }}
                                >
                                    <Icon name="check" size={13} style={{ color: "var(--text-secondary)" }} />
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
                        }}
                    >
                        <span className="absolute -top-2 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
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
                            plan === "year" ? "Assinar plano anual" : "Assinar plano mensal"
                        )}
                    </button>
                    <p className="text-xs text-center mt-3" style={{ color: "var(--text-muted)" }}>
                        Cancelar quando quiser.
                    </p>
                </motion.div>

                <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
                    <Link href="/dashboard" style={{ color: "var(--text-muted)" }}>Continuar no plano gratuito</Link>
                </p>
            </div>
        </main>
    );
}
