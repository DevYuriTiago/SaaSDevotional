"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { formatShortDate } from "@/lib/utils";
import { Medallion, type TierSlug } from "@/app/embaixadores/medallions";
import type { AmbassadorStats, Earnings } from "@/lib/ambassadors/earnings";
import AdminNav from "../../AdminNav";

export type Detalhe = {
    id: string;
    name: string;
    email: string | null;
    whatsapp: string | null;
    socialPlatform: string | null;
    socialHandle: string | null;
    followersCount: number | null;
    church: string | null;
    testimony: string | null;
    promotionPlan: string | null;
    status: string;
    createdAt: string;
    reviewedAt: string | null;
    pixKey: string | null;
    donationPercent: number;
    donationTarget: string | null;
    link: string | null;
    blockedClicks: number;
};

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (n: number) => n.toLocaleString("pt-BR");

const PLATAFORMA: Record<string, string> = {
    instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", outro: "Outro",
};

const SITUACAO: Record<string, { rotulo: string; cor: string }> = {
    active: { rotulo: "ativo", cor: "var(--gold)" },
    pending: { rotulo: "aguardando análise", cor: "var(--amber)" },
    suspended: { rotulo: "suspenso", cor: "var(--amber)" },
    rejected: { rotulo: "recusado", cor: "var(--text-muted)" },
};

function perfilUrl(plataforma: string | null, handle: string | null): string | null {
    if (!handle) return null;
    const h = handle.replace(/^@/, "").trim();
    if (!h) return null;
    if (plataforma === "instagram") return "https://instagram.com/" + h;
    if (plataforma === "tiktok") return "https://tiktok.com/@" + h;
    if (plataforma === "youtube") return "https://youtube.com/@" + h;
    return h.startsWith("http") ? h : null;
}

export default function DetalheClient({ d, stats, earnings }: {
    d: Detalhe; stats: AmbassadorStats; earnings: Earnings;
}) {
    const router = useRouter();
    const [ocupado, setOcupado] = useState(false);
    const [copiado, setCopiado] = useState(false);

    const situacao = SITUACAO[d.status] ?? { rotulo: d.status, cor: "var(--text-muted)" };
    const perfil = perfilUrl(d.socialPlatform, d.socialHandle);
    const comissaoTotal = earnings.availableCents + earnings.pendingCents + earnings.paidCents;

    async function copiarLink() {
        if (!d.link) return;
        await navigator.clipboard.writeText(d.link);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2200);
    }

    async function mudarStatus(status: "suspended" | "active") {
        const pergunta = status === "suspended"
            ? "Suspender " + d.name + "?\n\nO link continua no ar, mas novas assinaturas deixam de gerar comissão. O que ele já ganhou continua devido."
            : "Reativar " + d.name + "?";
        if (!confirm(pergunta)) return;

        setOcupado(true);
        try {
            await fetch("/api/admin/ambassadors/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: d.id, status }),
            });
            router.refresh();
        } finally {
            setOcupado(false);
        }
    }

    return (
        <main className="aurora-bg relative min-h-dvh px-5 sm:px-8 py-10">
            <div className="max-w-3xl mx-auto">

                <header className="mb-6">
                    <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs mb-4 transition-colors hover:text-[var(--cream)]"
                        style={{ color: "var(--text-muted)" }}>
                        <Icon name="arrow-left" size={15} /> Voltar ao painel
                    </Link>
                    <p className="eyebrow mb-1.5" style={{ color: "var(--gold)" }}>
                        <span className="gold-rule" /> ficha do embaixador
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-display text-3xl" style={{ color: "var(--cream)", fontWeight: 500 }}>{d.name}</h1>
                        <span className="text-xs px-3 py-1 rounded-full"
                            style={{ color: situacao.cor, border: "1px solid var(--glass-border)" }}>
                            {situacao.rotulo}
                        </span>
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                        inscrito em {formatShortDate(d.createdAt)}
                        {d.reviewedAt ? " · avaliado em " + formatShortDate(d.reviewedAt) : ""}
                    </p>
                </header>

                <AdminNav />

                {/* Contato: o que você usa para falar com a pessoa */}
                <section className="surface-wood rounded-[24px] p-6 mb-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] mb-4" style={{ color: "var(--text-muted)" }}>contato</p>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                        <Campo rotulo="E-mail" valor={d.email} href={d.email ? "mailto:" + d.email : null} />
                        <Campo rotulo="WhatsApp" valor={d.whatsapp}
                            href={d.whatsapp ? "https://wa.me/55" + d.whatsapp.replace(/\D/g, "") : null} />
                        <Campo rotulo="Plataforma" valor={PLATAFORMA[d.socialPlatform ?? ""] ?? d.socialPlatform} />
                        <Campo rotulo="Perfil" valor={d.socialHandle} href={perfil} />
                        <Campo rotulo="Seguidores" valor={d.followersCount != null ? num(d.followersCount) : null} />
                        <Campo rotulo="Igreja ou ministério" valor={d.church} />
                    </div>
                </section>

                {/* Testemunho: o que pesou na curadoria */}
                {d.testimony && (
                    <section className="card-base p-6 mb-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] mb-2.5" style={{ color: "var(--gold)" }}>caminhada com Cristo</p>
                        <p className="font-serif-devotional text-base leading-relaxed whitespace-pre-line" style={{ color: "var(--reading, var(--text-secondary))" }}>
                            {d.testimony}
                        </p>
                    </section>
                )}

                {d.promotionPlan && (
                    <section className="card-base p-6 mb-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--text-muted)" }}>como pretende divulgar</p>
                        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{d.promotionPlan}</p>
                    </section>
                )}

                {/* Link e pagamento */}
                <section className="card-base p-6 mb-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] mb-4" style={{ color: "var(--text-muted)" }}>link e pagamento</p>

                    {d.link ? (
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                            <code className="text-sm break-all" style={{ color: "var(--gold)" }}>{d.link}</code>
                            <button onClick={copiarLink} className="btn-ghost text-xs" style={{ width: "auto", height: 32, paddingInline: 12 }}>
                                <Icon name={copiado ? "check" : "share"} size={12} /> {copiado ? "Copiado" : "Copiar"}
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>Ainda sem link gerado.</p>
                    )}

                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                        <Campo rotulo="Chave Pix" valor={d.pixKey ?? "ainda não cadastrada"} />
                        <Campo rotulo="Doação"
                            valor={d.donationPercent > 0
                                ? d.donationPercent + "% para " + (d.donationTarget ?? "igreja indicada")
                                : "não destina"} />
                    </div>
                </section>

                {/* Resultados */}
                <section className="card-base p-6">
                    <div className="flex items-center justify-between gap-4 mb-5">
                        <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>resultados</p>
                        {earnings.level && <Medallion tier={earnings.level.slug as TierSlug} size={44} />}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <Numero valor={num(stats.clicks)} rotulo="cliques" />
                        <Numero valor={num(stats.signups)} rotulo="cadastros" />
                        <Numero valor={num(stats.payingCount)} rotulo="assinantes" destaque />
                        <Numero valor={brl(comissaoTotal)} rotulo="comissão total" />
                    </div>
                    {d.blockedClicks > 0 && (
                        <p className="text-xs mt-5 pt-4 border-t" style={{ color: "var(--amber)", borderColor: "var(--glass-border)" }}>
                            {num(d.blockedClicks)} {d.blockedClicks === 1 ? "acesso barrado" : "acessos barrados"} pela proteção antifraude.
                        </p>
                    )}
                </section>

                {/* Ações */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <Link href={"/admin/relatorio/" + d.id} className="btn-ghost text-xs" style={{ width: "auto", height: 42, paddingInline: 18 }}>
                        Ver relatório
                    </Link>
                    {d.status === "active" && (
                        <button onClick={() => mudarStatus("suspended")} disabled={ocupado} className="btn-ghost text-xs" style={{ width: "auto", height: 42, paddingInline: 18 }}>
                            Suspender
                        </button>
                    )}
                    {d.status === "suspended" && (
                        <button onClick={() => mudarStatus("active")} disabled={ocupado} className="btn-primary" style={{ width: "auto", height: 42, paddingInline: 18, fontSize: "0.8rem" }}>
                            Reativar
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}

function Campo({ rotulo, valor, href }: { rotulo: string; valor?: string | null; href?: string | null }) {
    if (!valor) return null;
    return (
        <div>
            <span className="text-[10px] uppercase tracking-[0.14em] block mb-0.5" style={{ color: "var(--text-muted)" }}>{rotulo}</span>
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline break-all" style={{ color: "var(--gold)" }}>{valor}</a>
            ) : (
                <span className="text-sm break-all" style={{ color: "var(--text-secondary)" }}>{valor}</span>
            )}
        </div>
    );
}

function Numero({ valor, rotulo, destaque }: { valor: string; rotulo: string; destaque?: boolean }) {
    return (
        <div>
            <p className="font-display leading-none" style={{ color: destaque ? "var(--gold)" : "var(--cream)", fontSize: "1.5rem", fontWeight: 500 }}>{valor}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] mt-1.5" style={{ color: "var(--text-muted)" }}>{rotulo}</p>
        </div>
    );
}
