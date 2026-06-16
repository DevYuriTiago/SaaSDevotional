"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AmbientSphere from "@/components/AmbientSphere";
import Horizon from "@/components/Horizon";
import { Icon, BrandMark, type IconName } from "@/components/icons";

const features: { icon: IconName; title: string; desc: string }[] = [
    { icon: "sparkle", title: "IA que entende seu coração", desc: "Um devocional gerado para o que você está sentindo agora, neste exato momento." },
    { icon: "book", title: "Base bíblica profunda", desc: "Versículos selecionados com precisão pastoral. Reflexões que tocam a alma." },
    { icon: "constellation", title: "Jornadas de 21 dias", desc: "Aprofundamento espiritual por temas como ansiedade, fé, paz interior e propósito." },
    { icon: "pen", title: "Diário espiritual", desc: "Registre orações, reflexões e aprendizados. Um testemunho vivo da sua caminhada." },
];

const steps: { n: string; icon: IconName; title: string; desc: string }[] = [
    { n: "01", icon: "heart", title: "Diga o que sente", desc: "Selecione uma emoção ou escreva com suas palavras. Sem filtros." },
    { n: "02", icon: "sparkle", title: "A IA interpreta", desc: "Analisa sua emoção com profundidade espiritual e identifica temas bíblicos." },
    { n: "03", icon: "sunrise", title: "Receba seu devocional", desc: "Um devocional completo, único e profundo — criado só para você." },
];

const premiumItems = [
    "Devocionais ilimitados",
    "Diário espiritual",
    "Jornadas de 21 dias",
    "Histórico emocional",
    "Modo Madrugada",
];

export default function LandingPage() {
    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden">
            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="relative flex flex-col items-center justify-center min-h-dvh px-6 text-center overflow-hidden">
                <Horizon position={0.8} glow={0.85} />

                <div className="absolute top-6 right-6 z-20">
                    <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-full"
                        style={{ color: "var(--text-secondary)", border: "1px solid var(--glass-border)" }}>
                        Entrar
                    </Link>
                </div>

                <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
                    {/* Marca dentro da auréola */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className="relative mb-7 flex items-center justify-center"
                        style={{ width: 200, height: 200 }}
                    >
                        <AmbientSphere size={200} className="absolute" />
                        <BrandMark size={62} />
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="eyebrow mb-4"
                        style={{ color: "var(--text-muted)" }}
                    >
                        <span className="gold-rule" /> direcionamento para cada momento
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="font-display leading-[1.06] mb-4"
                        style={{ color: "var(--cream)", fontSize: "clamp(2.2rem, 9vw, 3.2rem)", fontWeight: 400, letterSpacing: "-0.01em" }}
                    >
                        O que você está<br />sentindo{" "}
                        <span style={{ fontStyle: "italic", color: "var(--gold)" }}>hoje?</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.32 }}
                        className="text-[15px] leading-relaxed mb-9 px-2"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Fale sobre o que está em seu coração<br />e receba um devocional feito só para você.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="w-full flex flex-col items-center gap-3"
                    >
                        <Link href="/signup" className="btn-primary">
                            Começar agora
                            <Icon name="arrow-right" size={18} strokeWidth={1.8} />
                        </Link>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Sua jornada espiritual começa aqui.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Como funciona ───────────────────────────────── */}
            <section className="relative z-10 px-6 py-20 max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.7 }}
                    className="text-center mb-12"
                >
                    <p className="eyebrow mb-3" style={{ color: "var(--text-muted)" }}>como funciona</p>
                    <h2 className="font-display text-3xl" style={{ color: "var(--cream)" }}>Três passos. Uma presença.</h2>
                </motion.div>
                <div className="space-y-4">
                    {steps.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="card-base p-5 flex items-start gap-4"
                        >
                            <div className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
                                style={{ background: "rgba(255,252,245,0.05)", border: "1px solid rgba(247,201,122,0.18)" }}>
                                <Icon name={s.icon} size={20} style={{ color: "var(--text-secondary)" }} />
                            </div>
                            <div>
                                <p className="font-display text-xs" style={{ color: "var(--text-muted)" }}>{s.n}</p>
                                <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--cream)" }}>{s.title}</h3>
                                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Recursos ────────────────────────────────────── */}
            <section className="relative z-10 px-6 py-20 max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.7 }}
                    className="text-center mb-12"
                >
                    <p className="eyebrow mb-3" style={{ color: "var(--text-muted)" }}>o que você recebe</p>
                    <h2 className="font-display text-3xl" style={{ color: "var(--cream)" }}>Tudo que sua alma precisa</h2>
                </motion.div>
                <div className="grid grid-cols-2 gap-4">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="card-base p-5"
                        >
                            <Icon name={f.icon} size={24} style={{ color: "var(--text-secondary)" }} className="mb-3" />
                            <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--cream)" }}>{f.title}</h3>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Premium ─────────────────────────────────────── */}
            <section className="relative z-10 px-6 py-20 max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.7 }}
                    className="surface-wood rounded-3xl p-8 text-center"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-5"
                        style={{ background: "rgba(247,201,122,0.12)", border: "1px solid rgba(247,201,122,0.3)", color: "var(--gold)" }}>
                        <Icon name="crown" size={14} /> Premium
                    </div>
                    <p className="font-display text-5xl mb-1" style={{ color: "var(--cream)" }}>
                        R$ 24,90
                        <span className="text-base font-sans" style={{ color: "var(--text-muted)" }}>/mês</span>
                    </p>
                    <p className="text-sm mb-7" style={{ color: "var(--text-secondary)" }}>Experiência espiritual completa</p>
                    <ul className="space-y-2.5 mb-8 text-left">
                        {premiumItems.map((item) => (
                            <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                                <Icon name="check" size={16} style={{ color: "var(--gold)" }} /> {item}
                            </li>
                        ))}
                    </ul>
                    <Link href="/signup?plan=premium" className="btn-primary">Assinar Premium</Link>
                </motion.div>
            </section>

            {/* ── CTA final ───────────────────────────────────── */}
            <section className="relative z-10 px-6 py-24 max-w-lg mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.8 }}
                >
                    <h2 className="font-display text-3xl mb-4 leading-snug" style={{ color: "var(--cream)" }}>
                        Deus tem uma palavra <span style={{ color: "var(--cream)" }}>para o que você sente</span>
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
                        Não daqui a uma semana. Não quando estiver melhor. <strong style={{ color: "var(--cream)" }}>Agora.</strong>
                    </p>
                    <Link href="/signup" className="btn-primary">Começar agora</Link>
                </motion.div>
            </section>

            <footer className="relative z-10 border-t px-6 py-8 text-center" style={{ borderColor: "var(--glass-border)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>© 2026 Sentindo Hoje · Feito com fé e tecnologia</p>
            </footer>
        </main>
    );
}
