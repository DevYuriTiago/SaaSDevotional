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

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        captureUtmFromUrl();
        captureReferralFromUrl();
    }, []);

    const annualMonthly = fmt(PREMIUM_PRICE_ANNUAL / 12);

    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden">
            {/* ───────── Nav ───────── */}
            <nav className="absolute inset-x-0 top-0 z-30" style={{ background: "linear-gradient(to bottom, rgba(7,7,13,0.55), rgba(7,7,13,0))" }}>
                <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                        <Image src="/new-icon.png" alt="Humanáh" width={80} height={80} className="rounded-xl w-10 h-10" priority />
                        <span className="flex flex-col leading-none">
                            <Image src="/new-wordmark.png" alt="Humanáh" width={1536} height={1024} priority
                                className="h-auto w-[130px]" style={{ marginTop: -14, marginBottom: -10 }} />
                            <span className="text-[9px] uppercase tracking-[0.22em] pl-0.5" style={{ color: "var(--gold)" }}>seu maná diário</span>
                        </span>
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
                        className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full shrink-0"
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
                {/* Mobile: texto ACIMA, composite ABAIXO — topo cortado p/ o celular subir perto do texto */}
                <div className="lg:hidden">
                    <div className="px-5 pt-24 pb-2">
                        <HeroContent />
                    </div>
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "853 / 1430" }}>
                        <Image src="/background-hero-mbl.png" alt="Humanáh — devocional para o seu momento" fill priority sizes="100vw"
                            className="object-cover object-bottom"
                            style={{
                                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 9%, #000 88%, transparent 100%)",
                                maskImage: "linear-gradient(to bottom, transparent 0%, #000 9%, #000 88%, transparent 100%)",
                            }} />
                    </div>
                </div>
            </section>

            {/* ───────── Pilares ───────── */}
            <section id="recursos" className="relative px-5 sm:px-8 py-14 max-w-5xl mx-auto">
                <motion.p variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="eyebrow mb-10 justify-center text-center" style={{ color: "var(--gold)" }}>
                    um devocional feito para o seu momento
                </motion.p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                    {pillars.map((p, i) => (
                        <motion.div key={p.title} variants={rise} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
                            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{ background: "rgba(247,201,122,0.07)", border: "1px solid rgba(247,201,122,0.18)" }}>
                                <Icon name={p.icon} size={24} style={{ color: "var(--gold)" }} />
                            </div>
                            <h3 className="font-display text-base mb-1.5" style={{ color: "var(--cream)" }}>{p.title}</h3>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{p.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ───────── Conceito do maná ───────── */}
            <section id="como-funciona" className="relative px-5 sm:px-8 py-14">
                <div className="max-w-3xl mx-auto surface-wood rounded-[28px] p-8 sm:p-12 text-center relative overflow-hidden">
                    <div className="absolute left-0 right-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)", opacity: 0.6 }} />
                    <motion.div variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <p className="eyebrow mb-4 justify-center" style={{ color: "var(--gold)" }}>por que maná?</p>
                        <p className="font-serif-devotional leading-relaxed mb-4" style={{ color: "var(--cream)", fontSize: "clamp(1.3rem, 4vw, 1.7rem)" }}>
                            No deserto, Deus enviava pão do céu <span style={{ color: "var(--gold)" }}>todas as manhãs</span>.
                            Ninguém podia estocar — cada dia, um novo.
                        </p>
                        <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                            É dessa ideia que a Humanáh nasce. Você não precisa de mais um plano de leitura parado na estante.
                            Precisa de uma <strong style={{ color: "var(--cream)" }}>Palavra viva, para hoje</strong>.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ───────── Jornadas ───────── */}
            <section id="jornadas" className="relative px-5 sm:px-8 py-16 sm:py-20 max-w-6xl mx-auto">
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

                    {/* Cards de jornada */}
                    <div className="flex items-center justify-center gap-3">
                        {journeys.map((j, i) => (
                            <motion.div key={j.name} variants={rise} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                className="flex-1 rounded-2xl p-5 relative overflow-hidden"
                                style={{
                                    aspectRatio: "3 / 4",
                                    background: i === 1 ? "linear-gradient(180deg, rgba(43,27,77,0.5), rgba(138,79,73,0.35))" : "var(--glass)",
                                    border: i === 1 ? "1px solid rgba(247,201,122,0.4)" : "1px solid var(--glass-border)",
                                    boxShadow: i === 1 ? "0 0 30px rgba(247,201,122,0.12)" : "none",
                                    transform: i === 1 ? "scale(1.06)" : "scale(0.96)",
                                }}>
                                <div className="flex flex-col h-full justify-between">
                                    <Icon name={j.icon} size={22} style={{ color: i === 1 ? "var(--gold)" : "var(--text-secondary)" }} />
                                    <div>
                                        <p className="font-display text-sm leading-tight mb-1" style={{ color: "var(--cream)" }}>{j.name}</p>
                                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>21 dias</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────── Nota do fundador (prova social honesta) ───────── */}
            <section className="relative px-5 sm:px-8 py-14 max-w-2xl mx-auto">
                <motion.div variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card-base p-8 sm:p-10 relative">
                    <div className="absolute left-6 top-4 font-display" style={{ color: "rgba(247,201,122,0.18)", fontSize: "5rem", lineHeight: 0.7 }}>&ldquo;</div>
                    <p className="font-serif-devotional leading-relaxed relative" style={{ color: "var(--text-secondary)", fontSize: "1.15rem" }}>
                        Criei a Humanáh porque eu mesmo já abri a Bíblia sem saber por onde começar. Eu queria um lugar
                        onde a Palavra encontrasse a minha vida real — não um versículo solto, mas uma direção para o dia
                        que eu estava vivendo. Que ela seja, pra você, o pão fresco de cada manhã.
                    </p>
                    <p className="mt-5 text-sm font-semibold" style={{ color: "var(--cream)" }}>
                        Yuri Tiago <span className="font-normal" style={{ color: "var(--text-muted)" }}>· fundador da Humanáh</span>
                    </p>
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
            <section className="relative px-5 sm:px-8 py-14 max-w-lg mx-auto">
                <motion.div variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} className="surface-wood rounded-[28px] p-8 sm:p-10 text-center">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-6"
                        style={{ background: "rgba(247,201,122,0.12)", border: "1px solid rgba(247,201,122,0.3)", color: "var(--gold)" }}>
                        <Icon name="crown" size={14} /> Plano Humanáh
                    </div>
                    <p className="font-display mb-1" style={{ color: "var(--cream)", fontSize: "3rem", fontWeight: 500 }}>
                        R$ {annualMonthly}<span className="text-base font-sans" style={{ color: "var(--text-muted)" }}>/mês</span>
                    </p>
                    <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>no plano anual — devocionais sem limites</p>
                    <p className="text-xs mb-7" style={{ color: "var(--text-muted)" }}>ou R$ {fmt(PREMIUM_PRICE)}/mês, cancele quando quiser</p>
                    <ul className="space-y-2.5 mb-8 text-left max-w-xs mx-auto">
                        {["Devocionais ilimitados", "Jornadas de 21 dias completas", "Diário espiritual", "Áudio e modo madrugada", "Todos os marcos da caminhada"].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                                <Icon name="check" size={16} style={{ color: "var(--gold)" }} /> {item}
                            </li>
                        ))}
                    </ul>
                    <Link href="/signup" className="btn-primary">Começar grátis hoje</Link>
                    <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>Sem cartão para começar.</p>
                </motion.div>
            </section>

            {/* ───────── FAQ ───────── */}
            <section id="perguntas" className="relative px-5 sm:px-8 py-14 max-w-2xl mx-auto">
                <motion.h2 variants={rise} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="font-display text-center mb-10" style={{ color: "var(--cream)", fontSize: "clamp(1.7rem, 5vw, 2.3rem)", fontWeight: 400 }}>
                    Perguntas honestas
                </motion.h2>
                <div className="space-y-3">
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
                            Um novo devocional. Uma nova direção. Todos os dias.
                        </p>
                        <Link href="/signup" className="btn-primary" style={{ width: "auto", minWidth: 260, height: 58, paddingInline: 40, fontSize: "1rem" }}>
                            Começar grátis
                            <Icon name="arrow-right" size={18} strokeWidth={1.8} />
                        </Link>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
                        className="hidden lg:flex justify-center">
                        <Image src="/new-icon.png" alt="Humanáh" width={200} height={200} className="rounded-[40px]"
                            style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 50px rgba(247,201,122,0.15)" }} />
                    </motion.div>
                </div>
            </section>

            {/* ───────── Footer ───────── */}
            <footer className="relative z-10 border-t px-6 py-10 text-center" style={{ borderColor: "var(--glass-border)" }}>
                <div className="flex items-center justify-center gap-2 mb-3">
                    <Image src="/new-icon.png" alt="Humanáh" width={26} height={26} className="rounded-lg" />
                    <span className="font-display text-sm" style={{ color: "var(--cream)" }}>
                        Human<span style={{ color: "var(--gold)" }}>á</span>h
                    </span>
                </div>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>A Palavra encontra sua humanidade, todos os dias.</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>© 2026 Humanáh · humanah.app</p>
            </footer>
        </main>
    );
}
