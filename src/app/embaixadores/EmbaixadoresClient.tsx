"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Icon } from "@/components/icons";
import { LEVELS } from "@/lib/ambassadors/levels";
import { Medallion, type TierSlug } from "./medallions";
import Calculadora from "./Calculadora";
import ApplyForm from "./ApplyForm";

const rise = {
    hidden: { opacity: 0, y: 22 },
    visible: (i: number = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    }),
};

const RANGE_LABEL: Record<string, string> = {
    bronze: "1–100 pagantes",
    prata: "101–200 pagantes",
    ouro: "201–500 pagantes",
    diamante: "501–1.000 pagantes",
    mana: "1.001+ pagantes",
};

const STEPS = [
    {
        n: "I", icon: "compass" as const, title: "Receba seu link exclusivo",
        text: "Aprovado na curadoria, você ganha um link só seu — humanah.app/e/seunome — para compartilhar onde a sua voz alcança.",
    },
    {
        n: "II", icon: "heart" as const, title: "Sua comunidade assina",
        text: "Cada pessoa que chega pelo seu link e assina o Humanáh fica ligada a você — de forma automática e definitiva.",
    },
    {
        n: "III", icon: "sunrise" as const, title: "Você recebe todo mês",
        text: "A comissão é recorrente: cai de novo a cada renovação, enquanto cada assinatura permanecer ativa. Não é venda única — é fruto que permanece.",
    },
];

const FAQS = [
    {
        q: "Custa algo para participar?",
        a: "Nada — nem para se inscrever, nem para permanecer. O programa existe para reconhecer quem já leva a Palavra adiante.",
    },
    {
        q: "Quando e como recebo?",
        a: "Via Pix, mensalmente. A comissão de cada pagamento é confirmada após a garantia de 7 dias e continua caindo enquanto a assinatura do seu indicado estiver ativa.",
    },
    {
        q: "Preciso de quantos seguidores?",
        a: "Não existe número mágico. Avaliamos alcance real e coerência de vida e conteúdo — uma comunidade fiel vale mais do que um número grande.",
    },
    {
        q: "Posso doar a minha comissão?",
        a: "Sim. Se preferir, você pode destinar parte ou 100% do que receber para abençoar sua igreja ou ministério. Muitos embaixadores escolhem esse caminho.",
    },
    {
        q: "Como acompanho meus resultados?",
        a: "Sendo aprovado, você terá acesso ao portal do embaixador: cliques, assinaturas e ganhos, tudo ao vivo, com seu link e materiais prontos para divulgar.",
    },
];

export default function EmbaixadoresClient() {
    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden">

            {/* ───────── Nav mínima ───────── */}
            <nav className="fixed inset-x-0 top-0 z-40" style={{ background: "linear-gradient(to bottom, rgba(7,7,13,0.92), rgba(7,7,13,0.55) 70%, transparent)" }}>
                <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <Image src="/new-icon.png" alt="Humanáh" width={40} height={40} className="rounded-xl w-10 h-10" priority />
                        <Image src="/new-wordmark.png" alt="Humanáh" width={1536} height={1024} priority className="h-auto w-[110px]" style={{ marginTop: -12, marginBottom: -9 }} />
                    </Link>
                    <a href="#inscricao" className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full whitespace-nowrap transition-colors hover:bg-[rgba(247,201,122,0.08)]"
                        style={{ color: "var(--gold)", border: "1px solid rgba(247,201,122,0.35)" }}>
                        Quero ser embaixador
                    </a>
                </div>
            </nav>

            {/* ───────── 1 · Hero ───────── */}
            <section className="relative px-5 sm:px-8 pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none"
                    style={{ width: 720, height: 560, maxWidth: "100vw", background: "radial-gradient(ellipse at 50% 20%, rgba(247,201,122,0.10), transparent 60%)" }} />
                <div className="relative max-w-6xl mx-auto lg:grid lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-10">
                    <motion.div initial="hidden" animate="visible" className="max-w-xl">
                        <motion.p variants={rise} custom={0} className="eyebrow mb-5" style={{ color: "var(--gold)" }}>
                            <span className="gold-rule" /> programa de embaixadores
                        </motion.p>
                        <motion.h1 variants={rise} custom={1} className="font-display leading-[1.05] mb-6"
                            style={{ color: "var(--cream)", fontSize: "clamp(2.1rem, 6.5vw, 3.4rem)", fontWeight: 400 }}>
                            Você já leva a Palavra.<br />
                            Agora ela <span style={{ fontStyle: "italic", color: "var(--gold)" }}>sustenta o seu chamado</span>.
                        </motion.h1>
                        <motion.p variants={rise} custom={2} className="text-base sm:text-lg leading-relaxed mb-8 max-w-md" style={{ color: "var(--text-secondary)" }}>
                            Indique o Humanáh para quem confia em você e receba uma comissão
                            <strong style={{ color: "var(--cream)" }}> recorrente</strong> — todo mês, enquanto cada pessoa permanecer.
                            Sem custo. Com curadoria.
                        </motion.p>
                        <motion.div variants={rise} custom={3} className="flex flex-col sm:flex-row sm:items-center gap-3 mb-9">
                            <a href="#inscricao" className="btn-primary" style={{ width: "auto", minWidth: 250, height: 58, paddingInline: 30, fontSize: "0.98rem" }}>
                                <Icon name="feather" size={18} /> Quero ser embaixador
                            </a>
                            <a href="#como-funciona" className="btn-ghost" style={{ width: "auto", minWidth: 180, height: 58, paddingInline: 26 }}>
                                <Icon name="play" size={16} /> Ver como funciona
                            </a>
                        </motion.div>
                        <motion.div variants={rise} custom={4} className="flex flex-wrap gap-2.5">
                            {[
                                { icon: "check" as const, label: "Sem custo para participar" },
                                { icon: "sunrise" as const, label: "Comissão recorrente" },
                                { icon: "shield" as const, label: "Curadoria manual" },
                            ].map((c) => (
                                <div key={c.label} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
                                    style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}>
                                    <Icon name={c.icon} size={15} style={{ color: "var(--gold)", flexShrink: 0 }} />
                                    <span className="text-xs leading-tight" style={{ color: "var(--text-secondary)" }}>{c.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Maná flutuando — o destino da jornada */}
                    <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.35 }}
                        className="hidden lg:flex flex-col items-center gap-4">
                        <Medallion tier="mana" size={220} />
                        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>nível Maná · 30%</p>
                    </motion.div>
                </div>
            </section>

            {/* ───────── 2 · Reenquadramento ───────── */}
            <section className="relative px-5 sm:px-8 py-16 sm:py-24 max-w-3xl mx-auto text-center">
                <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="eyebrow mb-6 justify-center" style={{ color: "var(--gold)" }}>
                    <span className="gold-rule" /> antes de falar de números
                </motion.p>
                <motion.h2 variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="font-display mb-7" style={{ color: "var(--cream)", fontSize: "clamp(1.7rem, 5.4vw, 2.6rem)", fontWeight: 400 }}>
                    Ministério que <span style={{ fontStyle: "italic", color: "var(--gold)" }}>sustenta</span> ministério.
                </motion.h2>
                <motion.div variants={rise} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="space-y-5 max-w-xl mx-auto">
                    <p className="font-serif-devotional italic text-lg leading-relaxed" style={{ color: "var(--reading, var(--text-secondary))" }}>
                        A Palavra é gratuita — e sempre será. O Humanáh existe para colocá-la
                        no dia de cada pessoa, no momento exato que ela está vivendo.
                    </p>
                    <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        Quem assina, sustenta a obra. Quem a leva mais longe, participa do fruto.
                        É o princípio antigo: quem trabalha na semeadura também colhe dela.
                    </p>
                </motion.div>
                <motion.div variants={rise} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="card-base p-5 mt-9 max-w-md mx-auto flex items-start gap-3 text-left">
                    <Icon name="hands" size={20} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }} />
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        <strong style={{ color: "var(--cream)" }}>Prefere abençoar?</strong> Você pode doar parte
                        ou 100% da sua comissão para a sua igreja ou ministério.
                    </p>
                </motion.div>
            </section>

            {/* ───────── 3 · Como funciona ───────── */}
            <section id="como-funciona" className="relative px-5 sm:px-8 py-16 sm:py-24 max-w-6xl mx-auto scroll-mt-24">
                <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="eyebrow mb-3 justify-center" style={{ color: "var(--gold)" }}>simples de verdade</motion.p>
                <motion.h2 variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="font-display text-center mb-12" style={{ color: "var(--cream)", fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 400 }}>
                    Três passos. <span style={{ fontStyle: "italic", color: "var(--gold)" }}>Nenhuma letra miúda.</span>
                </motion.h2>
                <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
                    {STEPS.map((s, i) => (
                        <motion.div key={s.n} variants={rise} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="card-base p-7 relative overflow-hidden">
                            <span className="font-display absolute -top-3 right-4 select-none" aria-hidden
                                style={{ fontSize: "4.6rem", color: "rgba(247,201,122,0.09)", fontWeight: 500 }}>{s.n}</span>
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                                style={{ background: "rgba(247,201,122,0.10)", border: "1px solid rgba(247,201,122,0.25)" }}>
                                <Icon name={s.icon} size={20} style={{ color: "var(--gold)" }} />
                            </div>
                            <h3 className="font-semibold text-base mb-2.5" style={{ color: "var(--cream)" }}>{s.title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.text}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ───────── 4 · A jornada dos níveis ───────── */}
            <section className="relative px-5 sm:px-8 py-16 sm:py-24 overflow-hidden">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ width: 900, height: 500, maxWidth: "100vw", background: "radial-gradient(ellipse at center, rgba(247,201,122,0.05), transparent 60%)" }} />
                <div className="relative max-w-6xl mx-auto">
                    <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="eyebrow mb-3 justify-center" style={{ color: "var(--gold)" }}>a jornada</motion.p>
                    <motion.h2 variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="font-display text-center mb-4" style={{ color: "var(--cream)", fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 400 }}>
                        Do Bronze ao <span style={{ fontStyle: "italic", color: "var(--gold)" }}>Maná</span>.
                    </motion.h2>
                    <motion.p variants={rise} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-sm text-center mb-14 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                        Quanto mais vidas você alcança, maior a sua parte no fruto.
                        O nível é vitalício — calculado pelo total que você já conquistou. Nunca rebaixa.
                    </motion.p>

                    <div className="flex md:grid md:grid-cols-5 gap-5 md:gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mx-5 px-5 md:mx-0 md:px-0 snap-x">
                        {LEVELS.map((l, i) => {
                            const isMana = l.slug === "mana";
                            return (
                                <motion.div key={l.slug} variants={rise} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                    className="snap-center flex-shrink-0 w-[210px] md:w-auto text-center rounded-[24px] p-6 relative"
                                    style={{
                                        background: isMana ? "linear-gradient(180deg, rgba(247,201,122,0.10), rgba(19,17,29,0.6))" : "var(--glass)",
                                        border: isMana ? "1px solid rgba(247,201,122,0.4)" : "1px solid var(--glass-border)",
                                        boxShadow: isMana ? "0 12px 40px rgba(247,201,122,0.12)" : "none",
                                        transform: isMana ? "translateY(-6px)" : "none",
                                    }}>
                                    {isMana && (
                                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
                                            style={{ background: "var(--gradient-gold)", color: "#2A1E08" }}>O TOPO</span>
                                    )}
                                    <div className="flex justify-center mb-4">
                                        <Medallion tier={l.slug as TierSlug} size={isMana ? 92 : 76} />
                                    </div>
                                    <p className="font-display text-lg mb-0.5" style={{ color: "var(--cream)", fontWeight: 500 }}>{l.name}</p>
                                    <p className="text-[11px] mb-3" style={{ color: "var(--text-muted)" }}>{RANGE_LABEL[l.slug]}</p>
                                    <p className="font-display" style={{ color: "var(--gold)", fontSize: isMana ? "2rem" : "1.5rem", fontWeight: 500 }}>
                                        {Math.round(l.rate * 100)}%
                                    </p>
                                    <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>recorrente</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ───────── 5 · Calculadora ───────── */}
            <section className="relative px-5 sm:px-8 py-16 sm:py-24 max-w-4xl mx-auto">
                <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="eyebrow mb-3 justify-center" style={{ color: "var(--gold)" }}>faça as contas</motion.p>
                <motion.h2 variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="font-display text-center mb-10" style={{ color: "var(--cream)", fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 400 }}>
                    Quanto a sua voz <span style={{ fontStyle: "italic", color: "var(--gold)" }}>pode semear</span>?
                </motion.h2>
                <motion.div variants={rise} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <Calculadora />
                </motion.div>
            </section>

            {/* ───────── 6 · Curadoria ───────── */}
            <section className="relative px-5 sm:px-8 py-16 sm:py-24 max-w-3xl mx-auto text-center">
                <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="eyebrow mb-6 justify-center" style={{ color: "var(--gold)" }}>
                    <span className="gold-rule" /> curadoria
                </motion.p>
                <motion.h2 variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="font-display mb-6" style={{ color: "var(--cream)", fontSize: "clamp(1.7rem, 5.4vw, 2.6rem)", fontWeight: 400 }}>
                    Não é para todos — <span style={{ fontStyle: "italic", color: "var(--gold)" }}>de propósito</span>.
                </motion.h2>
                <motion.p variants={rise} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="text-base leading-relaxed max-w-xl mx-auto mb-10" style={{ color: "var(--text-secondary)" }}>
                    O nome Humanáh só vai na voz de quem vive o que anuncia. Por isso não existe
                    aprovação automática: cada inscrição passa por uma análise humana.
                </motion.p>
                <div className="grid sm:grid-cols-3 gap-4 text-left">
                    {[
                        { icon: "eye" as const, t: "Lemos uma a uma", d: "Cada inscrição é avaliada por uma pessoa — não por um robô." },
                        { icon: "heart" as const, t: "Fé e coerência", d: "Olhamos sua caminhada e seu conteúdo, não só o número de seguidores." },
                        { icon: "mail" as const, t: "Retorno em 7 dias", d: "Aprovado ou não, você recebe uma resposta no seu e-mail." },
                    ].map((c, i) => (
                        <motion.div key={c.t} variants={rise} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="card-base p-6">
                            <Icon name={c.icon} size={20} style={{ color: "var(--gold)" }} className="mb-3" />
                            <h3 className="font-semibold text-sm mb-1.5" style={{ color: "var(--cream)" }}>{c.t}</h3>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{c.d}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ───────── 7 · FAQ ───────── */}
            <section className="relative px-5 sm:px-8 py-16 sm:py-24 max-w-4xl mx-auto">
                <motion.h2 variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="font-display text-center mb-12" style={{ color: "var(--cream)", fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 400 }}>
                    Perguntas <span style={{ fontStyle: "italic", color: "var(--gold)" }}>honestas</span>
                </motion.h2>
                <div className="grid md:grid-cols-2 gap-4 items-start">
                    {FAQS.map((f, i) => (
                        <motion.div key={f.q} variants={rise} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="card-base p-6">
                            <h3 className="font-semibold text-base mb-2" style={{ color: "var(--cream)" }}>{f.q}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.a}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ───────── 8 · Inscrição ───────── */}
            <section id="inscricao" className="relative px-5 sm:px-8 py-16 sm:py-24 max-w-3xl mx-auto scroll-mt-24">
                <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="eyebrow mb-3 justify-center" style={{ color: "var(--gold)" }}>o primeiro passo</motion.p>
                <motion.h2 variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="font-display text-center mb-4" style={{ color: "var(--cream)", fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 400 }}>
                    Apresente-se. <span style={{ fontStyle: "italic", color: "var(--gold)" }}>Nós lemos tudo.</span>
                </motion.h2>
                <motion.p variants={rise} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="text-sm text-center mb-10 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                    Conte quem você é e onde a sua voz alcança. Se fizer sentido caminharmos juntos,
                    seu link exclusivo chega em até 7 dias.
                </motion.p>
                <motion.div variants={rise} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <ApplyForm />
                </motion.div>
            </section>

            {/* ───────── 9 · Fecho + rodapé ───────── */}
            <section className="relative px-5 sm:px-8 pt-10 pb-16 text-center">
                <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="font-serif-devotional italic text-lg max-w-md mx-auto leading-relaxed" style={{ color: "var(--reading, var(--text-secondary))" }}>
                    «Como são formosos os pés dos que anunciam boas-novas.»
                </motion.p>
                <motion.p variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Romanos 10:15</motion.p>
            </section>

            <footer className="relative z-10 border-t px-5 sm:px-8 py-8" style={{ borderColor: "var(--glass-border)" }}>
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/new-icon.png" alt="Humanáh" width={26} height={26} className="rounded-md" />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>© 2026 Humanáh · humanah.app</span>
                    </Link>
                    <div className="flex items-center gap-5 text-xs" style={{ color: "var(--text-muted)" }}>
                        <Link href="/privacidade" className="hover:text-[var(--cream)] transition-colors">Privacidade</Link>
                        <Link href="/termos" className="hover:text-[var(--cream)] transition-colors">Termos</Link>
                        <a href="mailto:contato@humanah.app" className="hover:text-[var(--cream)] transition-colors">Contato</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
