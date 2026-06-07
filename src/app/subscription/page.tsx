"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AmbientSphere from "@/components/AmbientSphere";

const features = [
    "Devocionais ilimitados",
    "Jornada de 21 dias",
    "Diário espiritual completo",
    "Modo madrugada",
    "Áudios exclusivos",
    "Conquistas especiais",
    "Histórico completo",
];

export default function SubscriptionPage() {
    const [loading, setLoading] = useState(false);

    async function handleSubscribe() {
        setLoading(true);
        try {
            const res = await fetch("/api/checkout/session", { method: "POST" });
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
        <main className="relative min-h-dvh px-5 py-10 lg:pb-10" style={{ background: "var(--bg-base)" }}>
            <div className="relative z-10 w-full max-w-md lg:max-w-xl mx-auto">
                {/* Close button */}
                <div className="flex justify-end mb-6">
                    <Link href="/dashboard" className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                        style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", color: "var(--text-muted)" }}>
                        ×
                    </Link>
                </div>

                {/* Crown + headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-8"
                >
                    <div className="text-6xl mb-4">👑</div>
                    <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                        Assinatura <span className="gradient-text">Premium</span>
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
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ background: "rgba(168,85,247,0.15)", color: "var(--brand-purple)" }}
                                >✓</span>
                                {f}
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

                {/* Price */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mb-6"
                >
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                        <span className="text-5xl font-bold gradient-text">R$ 24,90</span>
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>/mês</span>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <button onClick={handleSubscribe} disabled={loading} className="btn-primary">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Redirecionando...
                            </span>
                        ) : (
                            "Assinar agora"
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
