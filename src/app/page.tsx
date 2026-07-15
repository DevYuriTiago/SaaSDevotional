"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { PREMIUM_PRICE, PREMIUM_PRICE_ANNUAL } from "@/lib/constants";
import { captureUtmFromUrl, captureReferralFromUrl } from "@/lib/analytics/events";

const fmt = (v: number) => v.toFixed(2).replace(".", ",");

const pillars: { icon: IconName; title: string; desc: string }[] = [
    { icon: "heart", title: "Acolhe seu coração", desc: "Fale sobre o que está sentindo, sem julgamentos. Aqui, você é ouvido." },
    { icon: "book", title: "Fundamentado na Palavra", desc: "Cada devocional se apoia na Bíblia — direção na Escritura, não no lugar dela." },
    { icon: "sparkle", title: "Feito para o seu momento", desc: "A Humanáh entende o seu contexto e entrega um direcionamento único." },
    { icon: "sunrise", title: "Fresco todos os dias", desc: "Um novo maná a cada manhã, para fortalecer sua caminhada com Deus." },
];

// Nomes suavizados (sem promessa terapêutica).
const journeys: { icon: IconName; name: string }[] = [
    { icon: "flame", name: "Fortalecendo a fé" },
    { icon: "dove", name: "Descanso em meio à ansiedade" },
    { icon: "compass", name: "Paz interior" },
];

const features: { icon: IconName; title: string; desc: string }[] = [
    { icon: "sparkle", title: "Devocional feito para você", desc: "Versículo, reflexão, oração, aplicação e declaração — a partir do que você vive agora." },
    { icon: "compass", title: "Jornadas de 21 dias", desc: "Caminhos guiados para aprofundar um tema à luz da Palavra." },
    { icon: "pen", title: "Diário espiritual", desc: "Memórias da caminhada — registre o que a Palavra despertou em você." },
    { icon: "flame", title: "Constância que floresce", desc: "Acompanhe seus dias na Palavra e celebre cada marco." },
    { icon: "play", title: "Áudio contemplativo", desc: "Ouça seu devocional e uma música ambiente que aquieta a alma." },
    { icon: "share", title: "Feito para compartilhar", desc: "Cards dourados para levar uma Palavra a quem você ama." },
];

const faqs: { q: string; a: string }[] = [
    { q: "A Humanáh fala por Deus?", a: "Não — e nunca faria isso. Ela te ajuda a encontrar direção na Palavra para o seu momento, sempre fundamentada na Bíblia. Uma companheira de leitura, jamais uma substituta da Escritura." },
    { q: "Preciso baixar algo?", a: "Não. A Humanáh funciona direto no navegador, no celular ou no computador. Se quiser, você pode instalá-la como app na tela inicial — sem loja, sem espera." },
    { q: "Preciso pagar para começar?", a: "Não. Seus 7 primeiros devocionais são por nossa conta. Você só assina se quiser continuar todos os dias, sem limites." },
    { q: "É só mais um app de versículo do dia?", a: "Não. Aqui a Palavra encontra o que VOCÊ está sentindo hoje. Nada de mensagem genérica: o devocional é preparado a partir do seu contexto real." },
    { q: "Por que se chama maná?", a: "No deserto, Deus enviava pão do céu a cada manhã — e ninguém podia estocar. A Humanáh nasce disso: uma Palavra viva, fresca, para o dia de hoje." },
];

const painPoints = [
    "Você abre a Bíblia e não sabe por onde começar.",
    "Tenta orar, mas sente que faltam as palavras.",
    "A semana engole a sua fé — e o domingo não dá conta.",
    "Quer sentir Deus perto, mas o caminho parece longe.",
];

const steps: { n: string; icon: IconName; title: string; desc: string }[] = [
    { n: "01", icon: "heart", title: "Diga o que está no seu coração", desc: "Escolha como você se sente hoje — ou escreva com as suas palavras. Aqui não há julgamento." },
    { n: "02", icon: "sparkle", title: "Receba o seu maná de hoje", desc: "Em segundos, um devocional feito para você: versículo, reflexão, oração e uma aplicação real." },
    { n: "03", icon: "sunrise", title: "Volte amanhã por um novo", desc: "Cada manhã, uma Palavra fresca. É a constância que transforma — um dia de cada vez." },
];

const transformations: { from: string; to: string }[] = [
    { from: "Ansiedade que aperta o peito", to: "Uma paz que passa o entendimento" },
    { from: "Bíblia fechada por não saber começar", to: "Um encontro diário com a Palavra" },
    { from: "Fé no automático, de domingo a domingo", to: "Intimidade com Deus todos os dias" },
    { from: "Culpa por se sentir distante", to: "Graça para recomeçar hoje" },
];

const rise = {
    hidden: { opacity: 0, y: 28 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.6, ease: "easeOut" as const } }),
};

// Moldura de celular com placeholder de alvorada (troque preenchendo o arquivo).
function PhoneMock({ src, className, style }: { src: string; className?: string; style?: CSSProperties }) {
    return (
        <div className={`relative rounded-[38px] overflow-hidden ${className ?? ""}`}
            style={{ border: "7px solid #16121f", boxShadow: "0 50px 100px rgba(0,0,0,0.6), 0 0 50px rgba(247,201,122,0.08)", ...style }}>
            <div className="absolute inset-0" style={{
                background: `url('${src}') center top / cover no-repeat, linear-gradient(180deg, #07070D 0%, #141633 52%, #2B1B4D 78%, #8A4F49 100%)`,
            }} />
        </div>
    );
}

const heroChips: { icon: IconName; label: string }[] = [
    { icon: "book", label: "Fundamentado na Bíblia" },
    { icon: "heart", label: "Direcionado para seu momento" },
    { icon: "lock", label: "Privado e seguro" },
    { icon: "flame", label: "Profundo e transformador" },
];

// Conteúdo textual do hero (reusado no desktop e no mobile).
function HeroContent() {
    return (
        <motion.div initial="hidden" animate="visible" className="max-w-lg">
            <motion.p variants={rise} custom={0} className="eyebrow mb-5" style={{ color: "var(--gold)" }}>
                <span className="gold-rule" /> para quem precisa de uma direção hoje
            </motion.p>
            <motion.h1 variants={rise} custom={1} className="font-display leading-[1.02] mb-5"
                style={{ color: "var(--cream)", fontSize: "clamp(2.3rem, 6.2vw, 4.3rem)", fontWeight: 400, letterSpacing: "-0.02em" }}>
                O que você está sentindo <span style={{ fontStyle: "italic", color: "var(--gold)" }}>hoje?</span>
            </motion.h1>
            <motion.p variants={rise} custom={2} className="text-base sm:text-lg leading-relaxed mb-8 max-w-md" style={{ color: "var(--text-secondary)" }}>
                Nem sempre sabemos como orar ou por onde começar. Compartilhe o que está acontecendo
                e receba um devocional <span style={{ color: "var(--gold)" }}>personalizado</span>,
                fundamentado na <span style={{ color: "var(--gold)" }}>Palavra</span>, para o momento exato que você está vivendo.
            </motion.p>
            <motion.div variants={rise} custom={3} className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
                <Link href="/signup" className="btn-primary" style={{ width: "auto", minWidth: 260, height: 58, paddingInline: 30, fontSize: "0.98rem" }}>
                    <Icon name="sparkle" size={18} /> Receber meu primeiro devocional
                </Link>
                <a href="#como-funciona" className="btn-ghost" style={{ width: "auto", minWidth: 190, height: 58, paddingInline: 26 }}>
                    <Icon name="play" size={16} /> Ver como funciona
                </a>
            </motion.div>
            <motion.div variants={rise} custom={4} className="hidden xl:flex flex-wrap gap-2.5">
                {heroChips.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
                        style={{ border: "1px solid var(--glass-border)", background: "rgba(11,11,18,0.4)", backdropFilter: "blur(6px)" }}>
                        <Icon name={c.icon} size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
                        <span className="text-xs leading-tight" style={{ color: "var(--text-secondary)" }}>{c.label}</span>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}

// CTA primário reutilizável — repete o gatilho de ação ao longo da página.
function PrimaryCTA({ label = "Receber meu primeiro devocional", className = "" }: { label?: string; className?: string }) {
    return (
        <div className={`flex justify-center ${className}`}>
            <Link href="/signup" className="btn-primary" style={{ width: "auto", minWidth: 264, height: 56, paddingInline: 30, fontSize: "0.98rem" }}>
                <Icon name="sparkle" size={18} /> {label}
            </Link>
        </div>
    );
}

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        captureUtmFromUrl();
        captureReferralFromUrl();
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const annualMonthly = fmt(PREMIUM_PRICE_ANNUAL / 12);
    const economia = Math.round((1 - (PREMIUM_PRICE_ANNUAL / 12) / PREMIUM_PRICE) * 100);

    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden">
            {/* ───────── Nav ───────── */}
            <nav className="fixed inset-x-0 top-0 z-40 transition-all duration-300"
                style={{
                    background: scrolled ? "rgba(9,9,15,0.9)" : "linear-gradient(to bottom, rgba(7,7,13,0.55), rgba(7,7,13,0))",
                    backdropFilter: scrolled ? "blur(14px)" : "none",
                    WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
                    borderBottom: scrolled ? "1px solid rgba(247,201,122,0.14)" : "1px solid transparent",
                    boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.45)" : "none",
                }}>
                <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
                    {/* Emblema — sempre à esquerda */}
                    <Link href="/" className="flex items-center gap-3 relative z-10" onClick={() => setMenuOpen(false)}>
                        <Image src="/new-icon.png" alt="Humanáh" width={100} height={100} className="rounded-xl w-12 h-12" priority />
                        <Image src="/new-wordmark.png" alt="Humanáh" width={1536} height={1024} priority
                            className="hidden md:block h-auto w-[130px]" style={{ marginTop: -14, marginBottom: -10 }} />
                    </Link>
                    {/* Wordmark centralizada — apenas mobile */}
                    <Link href="/" aria-label="Humanáh" onClick={() => setMenuOpen(false)}
                        className="md:hidden absolute left-1/2 top-1/2" style={{ transform: "translate(-50%, calc(-50% + 6px))" }}>
                        <Image src="/new-wordmark.png" alt="Humanáh" width={1536} height={1024} priority className="h-auto w-[150px]" />
                    </Link>
                    {/* Links desktop */}
                    <div className="hidden md:flex items-center gap-7 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <a href="#como-funciona" className="hover:text-[var(--cream)] transition-colors">Como funciona</a>
                        <a href="#jornadas" className="hover:text-[var(--cream)] transition-colors">Jornadas</a>
                        <a href="#perguntas" className="hover:text-[var(--cream)] transition-colors">Perguntas</a>
                        <Link href="/login" className="hover:text-[var(--cream)] transition-colors">Entrar</Link>
                    </div>
                    {/* CTA desktop */}
                    <Link href="/signup" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full whitespace-nowrap transition-colors hover:bg-[rgba(247,201,122,0.08)]"
                        style={{ border: "1px solid rgba(247,201,122,0.5)", color: "var(--gold)" }}>
                        Começar gratuitamente <Icon name="sparkle" size={14} />
                    </Link>
                    {/* Hambúrguer mobile */}
                    <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label="Abrir menu" aria-expanded={menuOpen}
                        className="md:hidden ml-auto inline-flex items-center justify-center w-11 h-11 rounded-full shrink-0"
                        style={{ border: "1px solid var(--glass-border)", color: "var(--cream)" }}>
                        {menuOpen ? <Icon name="close" size={20} /> : (
                            <span className="flex flex-col gap-[5px]">
                                <span className="block w-5 h-0.5 rounded-full" style={{ background: "var(--cream)" }} />
                                <span className="block w-5 h-0.5 rounded-full" style={{ background: "var(--cream)" }} />
                                <span className="block w-5 h-0.5 rounded-full" style={{ background: "var(--cream)" }} />
                            </span>
                        )}
                    </button>
                    {/* Dropdown mobile */}
                    {menuOpen && (
                        <div className="md:hidden absolute top-full left-4 right-4 mt-2 rounded-2xl p-3 flex flex-col z-40"
                            style={{ background: "rgba(11,11,18,0.97)", border: "1px solid var(--glass-border)", backdropFilter: "blur(14px)" }}>
                            {([["Como funciona", "#como-funciona"], ["Jornadas", "#jornadas"], ["Perguntas", "#perguntas"]] as const).map(([label, href]) => (
                                <a key={href} href={href} onClick={() => setMenuOpen(false)}
                                    className="px-3 py-3 rounded-lg text-sm hover:bg-[rgba(247,201,122,0.06)]" style={{ color: "var(--text-secondary)" }}>{label}</a>
                            ))}
                            <Link href="/login" onClick={() => setMenuOpen(false)}
                                className="px-3 py-3 rounded-lg text-sm hover:bg-[rgba(247,201,122,0.06)]" style={{ color: "var(--text-secondary)" }}>Entrar</Link>
                            <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-primary mt-2" style={{ height: 50 }}>
                                Começar gratuitamente
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* ───────── Hero (composite cinematográfico) ───────── */}
            <section className="relative overflow-hidden">
                {/* Desktop: composite full-width com o texto sobreposto à esquerda */}
                <div className="relative hidden lg:block">
                    <Image src="/background-hero.png" alt="Humanáh — devocional para o seu momento" width={1672} height={941} priority
                        className="w-full h-auto"
                        style={{ WebkitMaskImage: "linear-gradient(to bottom, #000 82%, transparent 100%)", maskImage: "linear-gradient(to bottom, #000 82%, transparent 100%)" }} />
                    <div className="absolute inset-0 flex items-start xl:items-center pt-28 xl:pt-0">
                        <div className="w-full max-w-7xl mx-auto px-8 xl:px-10">
                            <HeroContent />
                        </div>
                    </div>
                </div>
                {/* Mobile: texto sobreposto à paisagem (topo da imagem); celular logo abaixo */}
                <div className="lg:hidden relative">
                    <div className="relative z-10 px-5 pt-24">
                        <HeroContent />
                    </div>
                    <div className="relative z-0 -mt-[500px]">
                        <Image src="/background-hero-mbl.png" alt="Humanáh — devocional para o seu momento" width={853} height={1844} priority
                            className="w-full h-auto"
                            style={{
                                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 12%, #000 90%, transparent 100%)",
                                maskImage: "linear-gradient(to bottom, transparent 0%, #000 12%, #000 90%, transparent 100%)",
                            }} />
                        {/* escurece apenas o céu (topo) atrás do texto, sem tocar o celular */}
                        <div className="absolute inset-x-0 top-0 h-[28%] pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(7,7,13,0.85), transparent)" }} />
                    </div>
                </div>
            </section>

            {/* ───────── Empatia (Problema + Agitação) ───────── */}
            <section className="relative px-5 sm:px-8 pt-16 pb-10 sm:py-24 max-w-3xl mx-auto text-center overflow-hidden">
                <div className="absolute left-1/2 top-4 -translate-x-1/2 pointer-events-none" style={{ width: 520, height: 420, maxWidth: "92vw", background: "radial-gradient(ellipse at center, rgba(247,201,122,0.06), transparent 62%)" }} />
                <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="eyebrow mb-6 justify-center relative" style={{ color: "var(--gold)" }}>
                    talvez você já tenha sentido isso
                </motion.p>
                <motion.h2 variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="font-display leading-tight mb-10 relative" style={{ color: "var(--cream)", fontSize: "clamp(1.7rem, 5.4vw, 2.6rem)", fontWeight: 400 }}>
                    Você quer estar perto de Deus.<br className="hidden sm:block" /> Só não sabe <span style={{ fontStyle: "italic", color: "var(--gold)" }}>por onde começar</span>.
                </motion.h2>
                <div className="max-w-md mx-auto mb-10 space-y-5 text-left relative">
                    {painPoints.map((p, i) => (
                        <motion.p key={p} variants={rise} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="font-serif-devotional italic leading-relaxed pl-5"
                            style={{ color: "var(--text-secondary)", fontSize: "1.08rem", borderLeft: "1px solid rgba(247,201,122,0.28)" }}>
                            {p}
                        </motion.p>
                    ))}
                </div>
                <motion.p variants={rise} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto relative" style={{ color: "var(--cream)" }}>
                    Você não está sozinho — e não precisa de mais culpa. Precisa de um lugar onde a Palavra
                    encontre <strong style={{ color: "var(--gold)" }}>exatamente o que você vive hoje</strong>.
                </motion.p>
            </section>

            {/* ───────── Como funciona (3 passos) ───────── */}
            <section id="como-funciona" className="relative px-5 sm:px-8 py-16 sm:py-24 max-w-5xl mx-auto scroll-mt-24 overflow-hidden">
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 pointer-events-none" style={{ width: 600, height: 320, maxWidth: "100vw", background: "radial-gradient(ellipse at center, rgba(247,201,122,0.05), transparent 65%)" }} />
                <div className="text-center mb-14 relative">
                    <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="eyebrow mb-4 justify-center" style={{ color: "var(--gold)" }}>simples como respirar</motion.p>
                    <motion.h2 variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="font-display leading-tight" style={{ color: "var(--cream)", fontSize: "clamp(1.9rem, 5.2vw, 2.8rem)", fontWeight: 400 }}>
                        Seu maná em <span style={{ fontStyle: "italic", color: "var(--gold)" }}>três passos</span>
                    </motion.h2>
                </div>
                <div className="relative">
                    {/* trilho conector (desktop) */}
                    <div className="hidden sm:block absolute top-7 left-[16.66%] right-[16.66%] h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(247,201,122,0.35) 18%, rgba(247,201,122,0.35) 82%, transparent)" }} />
                    <div className="grid sm:grid-cols-3 gap-10 sm:gap-6 relative">
                        {steps.map((s, i) => (
                            <motion.div key={s.n} variants={rise} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                className="flex flex-col items-center text-center px-2">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 relative z-10"
                                    style={{ background: "var(--night)", border: "1.5px solid rgba(247,201,122,0.45)", boxShadow: "0 0 26px rgba(247,201,122,0.14)" }}>
                                    <span className="font-display" style={{ color: "var(--gold)", fontSize: "1.25rem" }}>{s.n}</span>
                                </div>
                                <div className="mb-4 w-11 h-11 rounded-xl flex items-center justify-center"
                                    style={{ background: "rgba(247,201,122,0.07)", border: "1px solid rgba(247,201,122,0.16)" }}>
                                    <Icon name={s.icon} size={20} style={{ color: "var(--gold)" }} />
                                </div>
                                <h3 className="font-display text-lg mb-2" style={{ color: "var(--cream)" }}>{s.title}</h3>
                                <p className="text-sm leading-relaxed max-w-[15rem]" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <PrimaryCTA className="mt-14" />
                <p className="text-center text-xs mt-3" style={{ color: "var(--text-muted)" }}>Grátis para começar · sem cartão · leva menos de um minuto</p>
            </section>

            {/* ───────── Pilares ───────── */}
            <section id="recursos" className="relative px-5 sm:px-8 py-16 sm:py-24 max-w-6xl mx-auto">
                <div className="lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:items-start">
                    <motion.div variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10 lg:mb-0 lg:sticky lg:top-20">
                        <p className="eyebrow mb-4" style={{ color: "var(--gold)" }}>o que a Humanáh entrega</p>
                        <h2 className="font-display leading-tight mb-4" style={{ color: "var(--cream)", fontSize: "clamp(1.9rem, 5vw, 2.8rem)", fontWeight: 400 }}>
                            Não é só mais um app. É um <span style={{ fontStyle: "italic", color: "var(--gold)" }}>encontro</span>.
                        </h2>
                        <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            Cada detalhe foi pensado para acolher você — e conduzir você à Palavra, nunca para longe dela.
                        </p>
                    </motion.div>
                    <div>
                        {pillars.map((p, i) => (
                            <motion.div key={p.title} variants={rise} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                className="flex gap-5 py-6 border-b last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
                                <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: "rgba(247,201,122,0.07)", border: "1px solid rgba(247,201,122,0.18)" }}>
                                    <Icon name={p.icon} size={22} style={{ color: "var(--gold)" }} />
                                </div>
                                <div>
                                    <h3 className="font-display text-lg mb-1" style={{ color: "var(--cream)" }}>{p.title}</h3>
                                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{p.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────── Conceito do maná (faixa full-bleed) ───────── */}
            <section className="relative py-24 sm:py-32 my-4 overflow-hidden" style={{ background: "linear-gradient(180deg, transparent, rgba(43,27,77,0.22) 28%, rgba(138,79,73,0.14) 72%, transparent)" }}>
                <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(247,201,122,0.5), transparent)" }} />
                <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(247,201,122,0.5), transparent)" }} />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: 720, height: 720, maxWidth: "110vw", background: "radial-gradient(circle, rgba(247,201,122,0.1), transparent 60%)" }} />
                <motion.div variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative max-w-3xl mx-auto px-6 text-center">
                    <p className="eyebrow mb-6 justify-center" style={{ color: "var(--gold)" }}>por que maná?</p>
                    <p className="font-serif-devotional leading-relaxed mb-6" style={{ color: "var(--cream)", fontSize: "clamp(1.6rem, 4.6vw, 2.4rem)" }}>
                        No deserto, Deus enviava pão do céu <span style={{ fontStyle: "italic", color: "var(--gold)" }}>todas as manhãs</span>.
                        Ninguém podia estocar — cada dia, um novo.
                    </p>
                    <p className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                        É dessa ideia que a Humanáh nasce. Você não precisa de mais um plano parado na estante.
                        Precisa de uma <strong style={{ color: "var(--cream)" }}>Palavra viva, para hoje</strong>.
                    </p>
                </motion.div>
            </section>

            {/* ───────── Jornadas ───────── */}
            <section id="jornadas" className="relative px-5 sm:px-8 py-16 sm:py-20 max-w-6xl mx-auto scroll-mt-24">
                <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                    <motion.div variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10 lg:mb-0">
                        <p className="eyebrow mb-3" style={{ color: "var(--gold)" }}>jornadas de 21 dias</p>
                        <h2 className="font-display leading-tight mb-5" style={{ color: "var(--cream)", fontSize: "clamp(1.9rem, 5vw, 2.8rem)", fontWeight: 400 }}>
                            Caminhos de <span style={{ fontStyle: "italic", color: "var(--gold)" }}>transformação</span> para sua alma
                        </h2>
                        <p className="text-base leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
                            Caminhos guiados para você se aprofundar em temas importantes à luz da Palavra, um passo por dia.
                        </p>
                        <ul className="space-y-2.5 mb-8">
                            {["21 dias conectados por um tema", "Um direcionamento por dia", "Aplicações práticas e reais", "Constância que transforma"].map((li) => (
                                <li key={li} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                                    <Icon name="check" size={16} style={{ color: "var(--gold)" }} /> {li}
                                </li>
                            ))}
                        </ul>
                        <Link href="/signup" className="btn-primary" style={{ width: "auto", minWidth: 200, height: 54, paddingInline: 32 }}>Conhecer as jornadas</Link>
                    </motion.div>

                    {/* Cards de jornada — horizontais no mobile, verticais no desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {journeys.map((j, i) => (
                            <motion.div key={j.name} variants={rise} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                className="rounded-2xl p-5 flex sm:flex-col items-center sm:items-start sm:justify-between gap-4 sm:gap-6 sm:min-h-[188px]"
                                style={{
                                    background: i === 1 ? "linear-gradient(160deg, rgba(43,27,77,0.5), rgba(138,79,73,0.35))" : "var(--glass)",
                                    border: i === 1 ? "1px solid rgba(247,201,122,0.4)" : "1px solid var(--glass-border)",
                                    boxShadow: i === 1 ? "0 0 30px rgba(247,201,122,0.12)" : "none",
                                }}>
                                <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                                    style={{ background: "rgba(247,201,122,0.07)", border: "1px solid rgba(247,201,122,0.16)" }}>
                                    <Icon name={j.icon} size={20} style={{ color: i === 1 ? "var(--gold)" : "var(--text-secondary)" }} />
                                </div>
                                <div>
                                    <p className="font-display text-base sm:text-[0.95rem] leading-tight mb-1" style={{ color: "var(--cream)" }}>{j.name}</p>
                                    <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>21 dias</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────── Transformação (antes → depois) ───────── */}
            <section className="relative px-5 sm:px-8 py-16 sm:py-20 max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="eyebrow mb-4 justify-center" style={{ color: "var(--gold)" }}>o que muda quando a Palavra é diária</motion.p>
                    <motion.h2 variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="font-display leading-tight" style={{ color: "var(--cream)", fontSize: "clamp(1.9rem, 5.2vw, 2.8rem)", fontWeight: 400 }}>
                        Pequenos encontros. <span style={{ fontStyle: "italic", color: "var(--gold)" }}>Grandes mudanças.</span>
                    </motion.h2>
                </div>
                <div className="space-y-3">
                    {transformations.map((t, i) => (
                        <motion.div key={t.to} variants={rise} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="card-base p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-center sm:text-left">
                            <span className="flex-1 text-sm sm:text-base leading-snug" style={{ color: "var(--text-muted)", textDecoration: "line-through", textDecorationColor: "rgba(247,201,122,0.45)" }}>{t.from}</span>
                            <Icon name="arrow-right" size={18} strokeWidth={1.8} className="rotate-90 sm:rotate-0 mx-auto sm:mx-0 shrink-0" style={{ color: "var(--gold)" }} />
                            <span className="flex-1 text-base sm:text-lg leading-snug font-medium" style={{ color: "var(--cream)" }}>{t.to}</span>
                        </motion.div>
                    ))}
                </div>
                <PrimaryCTA className="mt-10" />
            </section>

            {/* ───────── Nota do fundador (prova social honesta) ───────── */}
            <section className="relative px-5 sm:px-8 py-16 sm:py-24 max-w-3xl mx-auto overflow-hidden">
                <div className="absolute -left-8 top-2 pointer-events-none font-display select-none" style={{ color: "rgba(247,201,122,0.1)", fontSize: "12rem", lineHeight: 0.7 }}>&ldquo;</div>
                <motion.div variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative">
                    <p className="eyebrow mb-6" style={{ color: "var(--gold)" }}>de quem faz</p>
                    <p className="font-serif-devotional leading-relaxed mb-8" style={{ color: "var(--cream)", fontSize: "clamp(1.3rem, 3.6vw, 1.75rem)" }}>
                        Criei a Humanáh porque eu mesmo já abri a Bíblia sem saber por onde começar. Eu queria um lugar
                        onde a Palavra encontrasse a minha vida real — não um versículo solto, mas uma direção para o dia
                        que eu estava vivendo. Que ela seja, para você, o <span style={{ color: "var(--gold)" }}>pão fresco de cada manhã</span>.
                    </p>
                    <div className="flex items-center gap-3">
                        <Image src="/new-icon.png" alt="" width={44} height={44} className="rounded-xl" />
                        <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--cream)" }}>Yuri Tiago</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>fundador da Humanáh</p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ───────── Vitrine + recursos ───────── */}
            <section className="relative px-5 sm:px-8 py-16 max-w-6xl mx-auto">
                <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                    {/* Prints */}
                    <motion.div variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="relative flex items-end justify-center gap-4 mb-12 lg:mb-0 order-2 lg:order-1">
                        <PhoneMock src="/mockup-share.png" style={{ width: "clamp(150px, 34vw, 200px)", aspectRatio: "9 / 19", transform: "translateY(12px) rotate(-4deg)", opacity: 0.9 }} />
                        <PhoneMock src="/mockup-app.png" style={{ width: "clamp(180px, 40vw, 240px)", aspectRatio: "9 / 19" }} />
                    </motion.div>

                    <motion.div variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} className="order-1 lg:order-2">
                        <p className="eyebrow mb-3" style={{ color: "var(--gold)" }}>tudo o que você precisa</p>
                        <h2 className="font-display leading-tight mb-6" style={{ color: "var(--cream)", fontSize: "clamp(1.9rem, 5vw, 2.8rem)", fontWeight: 400 }}>
                            Uma experiência completa para sua caminhada <span style={{ fontStyle: "italic", color: "var(--gold)" }}>com Deus</span>
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                            {features.map((f) => (
                                <div key={f.title} className="flex gap-3">
                                    <Icon name={f.icon} size={20} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }} />
                                    <div>
                                        <h3 className="text-sm font-semibold mb-0.5" style={{ color: "var(--cream)" }}>{f.title}</h3>
                                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ───────── Oferta / preço ───────── */}
            <section className="relative px-5 sm:px-8 py-16 sm:py-20 max-w-lg mx-auto overflow-hidden">
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 pointer-events-none" style={{ width: 560, height: 400, maxWidth: "95vw", background: "radial-gradient(ellipse at center, rgba(247,201,122,0.08), transparent 62%)" }} />
                <div className="text-center mb-8 relative">
                    <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="eyebrow mb-4 justify-center" style={{ color: "var(--gold)" }}>comece de graça</motion.p>
                    <motion.h2 variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="font-display leading-tight mb-3" style={{ color: "var(--cream)", fontSize: "clamp(1.9rem, 5.2vw, 2.7rem)", fontWeight: 400 }}>
                        Sua caminhada começa <span style={{ fontStyle: "italic", color: "var(--gold)" }}>hoje, sem pagar nada</span>
                    </motion.h2>
                    <motion.p variants={rise} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        Seus 7 primeiros devocionais são por nossa conta. Se fizerem bem à sua alma,
                        continue por menos que um café por mês.
                    </motion.p>
                </div>
                <motion.div variants={rise} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} className="surface-wood rounded-[28px] p-8 sm:p-10 text-center relative overflow-hidden">
                    {economia > 0 && (
                        <div className="absolute top-5 right-5 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--gradient-gold)", color: "#2A1E08" }}>
                            economize {economia}%
                        </div>
                    )}
                    <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-6"
                        style={{ background: "rgba(247,201,122,0.12)", border: "1px solid rgba(247,201,122,0.3)", color: "var(--gold)" }}>
                        <Icon name="crown" size={14} /> Plano Humanáh
                    </div>
                    <p className="font-display mb-1" style={{ color: "var(--cream)", fontSize: "3rem", fontWeight: 500 }}>
                        R$ {annualMonthly}<span className="text-base font-sans" style={{ color: "var(--text-muted)" }}>/mês</span>
                    </p>
                    <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>no plano anual — devocionais sem limites</p>
                    <p className="text-xs mb-7" style={{ color: "var(--text-muted)" }}>ou R$ {fmt(PREMIUM_PRICE)}/mês · cancele quando quiser</p>
                    <ul className="space-y-2.5 mb-8 text-left max-w-xs mx-auto">
                        {["Devocionais ilimitados, todos os dias", "Jornadas de 21 dias completas", "Diário espiritual da sua caminhada", "Áudio e modo madrugada", "Cards para compartilhar a Palavra"].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                                <Icon name="check" size={16} style={{ color: "var(--gold)", flexShrink: 0 }} /> {item}
                            </li>
                        ))}
                    </ul>
                    <Link href="/signup" className="btn-primary">Começar grátis agora</Link>
                    <p className="text-xs mt-3 flex items-center justify-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                        <Icon name="lock" size={12} /> Sem cartão para começar · cancele quando quiser
                    </p>
                </motion.div>
            </section>

            {/* ───────── FAQ ───────── */}
            <section id="perguntas" className="relative px-5 sm:px-8 py-16 sm:py-24 max-w-4xl mx-auto scroll-mt-24">
                <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="eyebrow mb-3 justify-center" style={{ color: "var(--gold)" }}>ainda em dúvida?</motion.p>
                <motion.h2 variants={rise} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="font-display text-center mb-12" style={{ color: "var(--cream)", fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 400 }}>
                    Perguntas <span style={{ fontStyle: "italic", color: "var(--gold)" }}>honestas</span>
                </motion.h2>
                <div className="grid md:grid-cols-2 gap-4 items-start">
                    {faqs.map((f, i) => (
                        <motion.div key={f.q} variants={rise} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card-base p-6">
                            <h3 className="font-semibold text-base mb-2" style={{ color: "var(--cream)" }}>{f.q}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.a}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ───────── CTA final ───────── */}
            <section className="relative px-5 sm:px-8 py-20 sm:py-28 overflow-hidden">
                <div className="absolute right-0 bottom-0 pointer-events-none opacity-60"
                    style={{ width: 460, height: 460, maxWidth: "80vw", background: "radial-gradient(circle at 80% 90%, rgba(247,201,122,0.18), transparent 55%)" }} />
                <div className="relative max-w-6xl mx-auto lg:grid lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-8">
                    <motion.div variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center lg:text-left">
                        <h2 className="font-display leading-snug mb-4" style={{ color: "var(--cream)", fontSize: "clamp(2rem, 6vw, 3.2rem)", fontWeight: 400 }}>
                            Comece hoje mesmo sua<br className="hidden sm:block" /> jornada com a <span style={{ fontStyle: "italic", color: "var(--gold)" }}>Humanáh</span>
                        </h2>
                        <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
                            Um novo devocional. Uma nova direção. Todos os dias.<br className="hidden sm:block" />
                            O seu maná de hoje já está esperando por você.
                        </p>
                        <div className="flex justify-center lg:justify-start">
                            <Link href="/signup" className="btn-primary" style={{ width: "auto", minWidth: 268, height: 58, paddingInline: 34, fontSize: "1rem" }}>
                                <Icon name="sparkle" size={18} /> Receber meu primeiro devocional
                            </Link>
                        </div>
                        <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>Grátis para começar · sem cartão · leva menos de um minuto</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
                        className="hidden lg:flex justify-center">
                        <Image src="/new-icon.png" alt="Humanáh" width={200} height={200} className="rounded-[40px]"
                            style={{ filter: "drop-shadow(0 0 34px rgba(247,201,122,0.3))" }} />
                    </motion.div>
                </div>
            </section>

            {/* ───────── Footer ───────── */}
            <footer className="relative z-10 border-t px-5 sm:px-8 pt-12 pb-10" style={{ borderColor: "var(--glass-border)" }}>
                <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-[1.6fr_1fr_1fr] gap-8 sm:gap-6 mb-10">
                    <div className="col-span-2 sm:col-span-1">
                        <div className="flex items-center gap-2.5 mb-3">
                            <Image src="/new-icon.png" alt="Humanáh" width={32} height={32} className="rounded-lg" />
                            <Image src="/new-wordmark.png" alt="Humanáh" width={1536} height={1024} className="h-auto w-[112px]" style={{ marginTop: -12, marginBottom: -9 }} />
                        </div>
                        <p className="text-xs leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>
                            A Palavra encontra você no momento que está vivendo. Um maná fresco, todos os dias.
                        </p>
                        <Link href="/signup" className="inline-flex items-center gap-1.5 text-xs font-semibold mt-4" style={{ color: "var(--gold)" }}>
                            Começar grátis <Icon name="arrow-right" size={13} />
                        </Link>
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] mb-3" style={{ color: "var(--text-muted)" }}>Navegação</p>
                        <ul className="space-y-2.5 text-sm">
                            {([["Como funciona", "#como-funciona"], ["Jornadas", "#jornadas"], ["Perguntas", "#perguntas"]] as const).map(([l, h]) => (
                                <li key={h}><a href={h} className="hover:text-[var(--cream)] transition-colors" style={{ color: "var(--text-secondary)" }}>{l}</a></li>
                            ))}
                            <li><Link href="/login" className="hover:text-[var(--cream)] transition-colors" style={{ color: "var(--text-secondary)" }}>Entrar</Link></li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] mb-3" style={{ color: "var(--text-muted)" }}>Sobre</p>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/privacidade" className="hover:text-[var(--cream)] transition-colors" style={{ color: "var(--text-secondary)" }}>Privacidade</Link></li>
                            <li><Link href="/termos" className="hover:text-[var(--cream)] transition-colors" style={{ color: "var(--text-secondary)" }}>Termos de uso</Link></li>
                            <li><a href="mailto:contato@humanah.app" className="hover:text-[var(--cream)] transition-colors" style={{ color: "var(--text-secondary)" }}>Contato</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderColor: "var(--glass-border)" }}>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>© 2026 Humanáh · humanah.app</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Feito com fé no Brasil</p>
                </div>
            </footer>
        </main>
    );
}
