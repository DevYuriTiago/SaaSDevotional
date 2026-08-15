"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/components/icons";
import { Medallion, type TierSlug } from "@/app/embaixadores/medallions";
import type { AmbassadorStats, Earnings } from "@/lib/ambassadors/earnings";

const brl = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Taxa de conversão entre duas etapas do funil, já formatada. */
function taxa(de: number, para: number): string | null {
    if (de <= 0) return null;
    return `${((para / de) * 100).toFixed(1).replace(".", ",")}%`;
}

export default function PortalClient({
    name, link, qrSvg, stats, earnings,
}: {
    name: string;
    link: string | null;
    qrSvg: string | null;
    stats: AmbassadorStats;
    earnings: Earnings;
}) {
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const primeiroNome = name.trim().split(/\s+/)[0];

    async function copiar() {
        if (!link) return;
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    }

    return (
        <main className="aurora-bg relative min-h-dvh px-5 sm:px-8 py-10">
            <div className="max-w-3xl mx-auto">

                {/* Cabeçalho com o nível */}
                <header className="flex items-center justify-between gap-4 mb-9">
                    <div>
                        <p className="eyebrow mb-1.5" style={{ color: "var(--gold)" }}>
                            <span className="gold-rule" /> portal do embaixador
                        </p>
                        <h1 className="font-display text-3xl" style={{ color: "var(--cream)", fontWeight: 500 }}>
                            Olá, {primeiroNome}
                        </h1>
                        {earnings.level && (
                            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                                Nível {earnings.level.name}, comissão de {Math.round(earnings.rate * 100)}% sobre cada assinatura.
                            </p>
                        )}
                    </div>
                    {earnings.level && (
                        <Medallion tier={earnings.level.slug as TierSlug} size={78} />
                    )}
                </header>

                {/* Ganhos */}
                <section className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="surface-wood rounded-[24px] p-6">
                        <p className="text-[10px] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--text-muted)" }}>
                            disponível
                        </p>
                        <p className="font-display leading-none" style={{ color: "var(--gold)", fontSize: "2.4rem", fontWeight: 500 }}>
                            {brl(earnings.availableCents)}
                        </p>
                        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                            Comissões já confirmadas.
                        </p>
                    </div>
                    <div className="card-base p-6">
                        <p className="text-[10px] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--text-muted)" }}>
                            a liberar
                        </p>
                        <p className="font-display leading-none" style={{ color: "var(--cream)", fontSize: "2.4rem", fontWeight: 500 }}>
                            {brl(earnings.pendingCents)}
                        </p>
                        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                            Aguardando a garantia de 7 dias.
                        </p>
                    </div>
                </section>

                {/* Link e QR */}
                <section className="surface-wood rounded-[24px] p-6 mb-6">
                    <p className="text-[10px] uppercase tracking-[0.16em] mb-3" style={{ color: "var(--text-muted)" }}>
                        seu link exclusivo
                    </p>
                    {link ? (
                        <>
                            <div className="flex flex-wrap items-center gap-3">
                                <code className="text-sm px-4 py-3 rounded-xl flex-1 min-w-[220px] break-all"
                                    style={{ background: "rgba(11,11,18,0.5)", border: "1px solid var(--glass-border)", color: "var(--gold)" }}>
                                    {link}
                                </code>
                                <button onClick={copiar} className="btn-primary" style={{ width: "auto", height: 48, paddingInline: 22, fontSize: "0.9rem" }}>
                                    <Icon name={copied ? "check" : "share"} size={17} /> {copied ? "Copiado" : "Copiar"}
                                </button>
                            </div>

                            {qrSvg && (
                                <>
                                    <button onClick={() => setShowQr((v) => !v)} className="text-xs mt-4 inline-flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                                        <Icon name="sparkle" size={13} /> {showQr ? "Esconder QR code" : "Mostrar QR code"}
                                    </button>
                                    {showQr && (
                                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 p-5 rounded-2xl inline-block" style={{ background: "rgba(11,11,18,0.5)", border: "1px solid var(--glass-border)" }}>
                                            <div className="w-44 h-44" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                                            <p className="text-[11px] mt-3 max-w-[176px]" style={{ color: "var(--text-muted)" }}>
                                                Bom para projetar num culto ou colocar num impresso.
                                            </p>
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            Seu link ainda está sendo preparado. Em breve ele aparece aqui.
                        </p>
                    )}
                </section>

                {/* Funil */}
                <section className="card-base p-6 mb-6">
                    <p className="text-[10px] uppercase tracking-[0.16em] mb-5" style={{ color: "var(--text-muted)" }}>
                        sua caminhada
                    </p>

                    {stats.clicks === 0 ? (
                        <p className="text-sm py-4 text-center" style={{ color: "var(--text-secondary)" }}>
                            Nenhum clique ainda. Compartilhe o seu link e os números aparecem aqui.
                        </p>
                    ) : (
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <Etapa valor={stats.clicks} rotulo="cliques" />
                            <Etapa valor={stats.signups} rotulo="cadastros" conversao={taxa(stats.clicks, stats.signups)} />
                            <Etapa valor={stats.payingCount} rotulo="assinantes" conversao={taxa(stats.signups, stats.payingCount)} destaque />
                        </div>
                    )}
                </section>

                {/* Progresso de nível */}
                {earnings.nextLevel && (
                    <section className="card-base p-6">
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                Faltam <strong style={{ color: "var(--cream)" }}>{earnings.payingToNextLevel}</strong>
                                {earnings.payingToNextLevel === 1 ? " assinante" : " assinantes"} para o nível{" "}
                                <strong style={{ color: "var(--gold)" }}>{earnings.nextLevel.name}</strong>
                                {" "}({Math.round(earnings.nextLevel.rate * 100)}%).
                            </p>
                            <Medallion tier={earnings.nextLevel.slug as TierSlug} size={54} dimmed />
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(247,201,122,0.10)" }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${earnings.progressPct}%` }}
                                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                className="h-full rounded-full"
                                style={{ background: "var(--gradient-gold)" }}
                            />
                        </div>
                    </section>
                )}

                <Link href="/dashboard" className="block text-center text-xs mt-9" style={{ color: "var(--text-muted)" }}>
                    Voltar ao meu devocional
                </Link>
            </div>
        </main>
    );
}

function Etapa({ valor, rotulo, conversao, destaque }: {
    valor: number; rotulo: string; conversao?: string | null; destaque?: boolean;
}) {
    return (
        <div>
            <p className="font-display leading-none" style={{
                color: destaque ? "var(--gold)" : "var(--cream)",
                fontSize: "clamp(1.6rem, 6vw, 2.1rem)", fontWeight: 500,
            }}>
                {valor.toLocaleString("pt-BR")}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] mt-1.5" style={{ color: "var(--text-muted)" }}>{rotulo}</p>
            {conversao && (
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{conversao}</p>
            )}
        </div>
    );
}
