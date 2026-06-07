"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AmbientSphere from "@/components/AmbientSphere";

const features = [
    { emoji: "🧠", title: "IA que entende seu coração", desc: "Um devocional gerado para o que você está sentindo agora, neste exato momento." },
    { emoji: "📖", title: "Base bíblica profunda", desc: "Versículos selecionados com precisão pastoral. Reflexões que tocam a alma." },
    { emoji: "🔥", title: "Jornadas de 21 dias", desc: "Aprofundamento espiritual por temas como ansiedade, fé, paz interior e propósito." },
    { emoji: "📝", title: "Diário espiritual", desc: "Registre orações, reflexões e aprendizados. Um testemunho vivo da sua caminhada." },
];

const steps = [
    { n: "01", emoji: "💬", title: "Diga o que sente", desc: "Selecione uma emoção ou escreva com suas palavras. Sem filtros." },
    { n: "02", emoji: "🧠", title: "A IA interpreta", desc: "Analisa sua emoção com profundidade espiritual e identifica temas bíblicos." },
    { n: "03", emoji: "✨", title: "Receba seu devocional", desc: "Um devocional completo, único e profundo — criado só para você." },
];

export default function LandingPage() {
    return (
        <main className="relative min-h-dvh overflow-x-hidden">
            {/* ── Hero / Welcome ─────────────────────────────────── */}
            <section className="relative flex flex-col items-center justify-center min-h-dvh px-6 text-center">
                {/* Decorative orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute rounded-full blur-[140px]"
                        style={{ width: 500, height: 500, left: "5%", top: "-5%", background: "rgba(168,85,247,0.14)" }}
                        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute rounded-full blur-[100px]"
                        style={{ width: 400, height: 400, right: "5%", bottom: "10%", background: "rgba(99,102,241,0.12)" }}
                        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
                        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    />
                </div>

                {/* Entrar link */}
                <div className="absolute top-6 right-6 z-20">
                    <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-full"
                        style={{ color: "var(--text-muted)", border: "1px solid var(--glass-border)" }}>
                        Entrar
                    </Link>
                </div>

                <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center">
                    {/* Star icon */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-5"
                    >
                        <span style={{ fontSize: 26, color: "var(--brand-purple)", filter: "drop-shadow(0 0 10px rgba(168,85,247,0.7))" }}>✦</span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-3xl font-bold leading-tight mb-3"
                        style={{ fontFamily: "var(--font-jakarta)", color: "var(--text-primary)" }}
                    >
                        O que você está<br />sentindo hoje?
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.22 }}
                        className="text-sm leading-relaxed mb-8 px-2"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Fale sobre o que está em seu coração<br />e receba um devocional personalizado.
                    </motion.p>

                    {/* Sphere */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
                        className="mb-10"
                    >
                        <AmbientSphere size={240} />
                    </motion.div>

                    {/* CTA - dark glass button (igual ao mockup) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="w-full space-y-3"
                    >
                        <Link
                            href="/signup"
                            className="flex items-center justify-center gap-2 w-full py-4 px-8 rounded-full text-sm font-semibold transition-all"
                            style={{
                                background: "rgba(255,255,255,0.07)",
                                border: "1px solid rgba(255,255,255,0.18)",
                                color: "white",
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            Começar agora →
                        </Link>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Sua jornada espiritual começa aqui.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── How it works ─────────────────────────────────── */}
            <section className="relative z-10 px-6 py-20 max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-12"
                >
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>como funciona</p>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Três passos. Uma experiência.</h2>
                </motion.div>
                <div className="space-y-4">
                    {steps.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="card-base p-5 flex items-start gap-4"
                        >
                            <span className="text-2xl mt-0.5">{s.emoji}</span>
                            <div>
                                <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{s.n}</p>
                                <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{s.title}</h3>
                                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Features ─────────────────────────────────────── */}
            <section className="relative z-10 px-6 py-20 max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-12"
                >
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>o que você recebe</p>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Tudo que sua alma precisa</h2>
                </motion.div>
                <div className="grid grid-cols-2 gap-4">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="card-base p-5"
                        >
                            <span className="text-2xl mb-3 block">{f.emoji}</span>
                            <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Pricing preview ──────────────────────────────── */}
            <section className="relative z-10 px-6 py-20 max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="card-base p-7 text-center"
                    style={{ borderColor: "rgba(168,85,247,0.25)" }}
                >
                    <div
                        className="inline-block text-xs font-semibold px-4 py-1 rounded-full mb-4"
                        style={{ background: "var(--gradient-button)", color: "white" }}
                    >✨ Premium</div>
                    <p className="text-4xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                        R$ 24,90
                        <span className="text-base font-normal" style={{ color: "var(--text-muted)" }}>/mês</span>
                    </p>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Experiência espiritual completa</p>
                    <ul className="space-y-2 mb-8 text-left">
                        {[
                            "Devocionais ilimitados",
                            "Diário espiritual",
                            "Jornadas de 21 dias",
                            "Histórico emocional",
                            "Modo Madrugada",
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                                <span style={{ color: "var(--brand-purple)" }}>✓</span> {item}
                            </li>
                        ))}
                    </ul>
                    <Link href="/signup?plan=premium" className="btn-primary">Assinar Premium</Link>
                </motion.div>
            </section>

            {/* ── Final CTA ────────────────────────────────────── */}
            <section className="relative z-10 px-6 py-24 max-w-lg mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                        Deus tem uma palavra <span className="gradient-text">para o que você sente</span>
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
                        Não daqui a uma semana. Não quando estiver melhor. <strong style={{ color: "var(--text-primary)" }}>Agora.</strong>
                    </p>
                    <Link href="/signup" className="btn-primary">Começar agora</Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t px-6 py-8 text-center" style={{ borderColor: "var(--glass-border)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>© 2026 Sentindo Hoje · Feito com fé e tecnologia</p>
            </footer>
        </main>
    );
}