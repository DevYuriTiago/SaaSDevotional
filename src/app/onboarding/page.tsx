"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Icon, type IconName } from "@/components/icons";

const steps = [
    {
        id: "welcome",
        title: (name: string) => `${name}, você acabou de sentir`,
        subtitle: "Esse é o coração da Humanáh: uma Palavra viva para o seu momento. Vamos personalizar sua caminhada daqui pra frente.",
        content: null,
    },
    {
        id: "how",
        title: () => "Um espaço só seu",
        subtitle: "Sem julgamento. Aqui ficam seus devocionais, seu diário e suas jornadas — só você, Deus e a Palavra.",
        content: null,
    },
    {
        id: "frequency",
        title: () => "Com que frequência você quer se conectar?",
        subtitle: "Vamos criar um hábito espiritual saudável juntos.",
        content: "frequency",
    },
];

const frequencies: { id: string; label: string; icon: IconName; desc: string }[] = [
    { id: "daily", label: "Todo dia", icon: "flame", desc: "Conexão diária com Deus" },
    { id: "weekly", label: "Algumas vezes por semana", icon: "star", desc: "Consistência equilibrada" },
    { id: "whenever", label: "Quando precisar", icon: "dove", desc: "No meu próprio ritmo" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(0);
    const [name, setName] = useState("Amigo");
    const [frequency, setFrequency] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function finish() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Mark onboarding as complete
            await supabase
                .from("profiles")
                .update({ onboarding_completed: true })
                .eq("id", user.id);
        }
        router.push("/emotion");
    }

    const isLast = step === steps.length - 1;

    return (
        <main className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute rounded-full blur-[120px]" style={{ width: 600, height: 600, left: "15%", top: "-10%", background: "rgba(255,252,245,0.05)" }} />
                <div className="absolute rounded-full blur-[80px]" style={{ width: 400, height: 400, right: "5%", bottom: "5%", background: "rgba(224,151,90,0.06)" }} />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                {/* Progress */}
                <div className="flex gap-2 mb-12 justify-center">
                    {steps.map((_, i) => (
                        <motion.div
                            key={i}
                            className="h-1 rounded-full transition-all duration-500"
                            style={{
                                width: i === step ? 32 : 8,
                                background: i <= step ? "var(--text-secondary)" : "var(--glass-border)",
                            }}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.4 }}
                        className="text-center"
                    >
                        <h1 className="font-display mb-4" style={{ color: "var(--cream)", fontSize: "clamp(1.9rem, 7vw, 2.4rem)", fontWeight: 400, letterSpacing: "-0.01em" }}>
                            {steps[step].title(name)}
                        </h1>
                        <p className="text-lg mb-12" style={{ color: "var(--text-secondary)" }}>
                            {steps[step].subtitle}
                        </p>

                        {steps[step].content === "frequency" && (
                            <div className="grid gap-3 mb-8">
                                {frequencies.map((f) => (
                                    <motion.button
                                        key={f.id}
                                        onClick={() => setFrequency(f.id)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-200"
                                        style={{
                                            background: frequency === f.id ? "rgba(255,252,245,0.05)" : "var(--glass)",
                                            border: `1px solid ${frequency === f.id ? "rgba(255,252,245,0.25)" : "var(--glass-border)"}`,
                                            backdropFilter: "blur(12px)",
                                        }}
                                    >
                                        <Icon name={f.icon} size={24} style={{ color: frequency === f.id ? "var(--text-secondary)" : "var(--text-secondary)" }} />
                                        <div>
                                            <p className="font-semibold text-base" style={{ color: "var(--cream)" }}>{f.label}</p>
                                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
                                        </div>
                                        {frequency === f.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                                                style={{ background: "var(--gold)" }}
                                            >
                                                <Icon name="check" size={13} style={{ color: "var(--night)" }} />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-center mt-8">
                    {isLast ? (
                        <button
                            onClick={finish}
                            disabled={loading || (!frequency && steps[step].content === "frequency")}
                            className="btn-primary text-base px-10 py-4"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                                    Preparando...
                                </span>
                            ) : (
                                <>
                                    Começar minha jornada
                                    <Icon name="sparkle" size={18} strokeWidth={1.8} />
                                </>
                            )}
                        </button>
                    ) : (
                        <button onClick={() => setStep((s) => s + 1)} className="btn-primary text-base px-10 py-4">
                            Continuar
                            <Icon name="arrow-right" size={18} strokeWidth={1.8} />
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
