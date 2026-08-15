"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import type { Overview } from "@/lib/ambassadors/overview";
import AdminNav from "./AdminNav";

const brl = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const num = (n: number) => n.toLocaleString("pt-BR");
const pct = (n: number) => `${n.toFixed(1).replace(".", ",")}%`;

export default function PainelClient({ overview }: { overview: Overview }) {
    const { counts, totals, ambassadors } = overview;
    const ativos = ambassadors.filter((a) => a.status === "active");
    const semNenhumClique = ativos.filter((a) => a.clicks === 0).length;

    return (
        <main className="aurora-bg relative min-h-dvh px-5 sm:px-8 py-10">
            <div className="max-w-6xl mx-auto">

                <header className="mb-6">
                    <p className="eyebrow mb-1.5" style={{ color: "var(--gold)" }}>
                        <span className="gold-rule" /> programa de embaixadores
                    </p>
                    <h1 className="font-display text-3xl" style={{ color: "var(--cream)", fontWeight: 500 }}>
                        Visão geral
                    </h1>
                </header>

                <AdminNav pendentes={counts.pending} />

                {/* Dinheiro primeiro: é o que responde se o programa vale a pena */}
                <section className="grid sm:grid-cols-3 gap-4 mb-4">
                    <div className="surface-wood rounded-[24px] p-6">
                        <p className="text-[10px] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--text-muted)" }}>
                            receita gerada
                        </p>
                        <p className="font-display leading-none" style={{ color: "var(--gold)", fontSize: "2.3rem", fontWeight: 500 }}>
                            {brl(totals.grossCents)}
                        </p>
                        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                            trazida pelos embaixadores
                        </p>
                    </div>
                    <div className="card-base p-6">
                        <p className="text-[10px] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--text-muted)" }}>
                            comissão a pagar
                        </p>
                        <p className="font-display leading-none" style={{ color: "var(--cream)", fontSize: "2.3rem", fontWeight: 500 }}>
                            {brl(totals.availableCents)}
                        </p>
                        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                            liberada · {brl(totals.pendingCents)} ainda na garantia
                        </p>
                    </div>
                    <div className="card-base p-6">
                        <p className="text-[10px] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--text-muted)" }}>
                            já pago
                        </p>
                        <p className="font-display leading-none" style={{ color: "var(--cream)", fontSize: "2.3rem", fontWeight: 500 }}>
                            {brl(totals.paidCents)}
                        </p>
                        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                            em saques realizados
                        </p>
                    </div>
                </section>

                {/* Funil do programa inteiro */}
                <section className="card-base p-6 mb-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] mb-5" style={{ color: "var(--text-muted)" }}>
                        funil do programa
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <Etapa valor={num(totals.clicks)} rotulo="cliques" />
                        <Etapa valor={num(totals.signups)} rotulo="cadastros"
                            conversao={totals.clicks > 0 ? pct((totals.signups / totals.clicks) * 100) : null} />
                        <Etapa valor={num(totals.paying)} rotulo="assinantes" destaque
                            conversao={totals.signups > 0 ? pct((totals.paying / totals.signups) * 100) : null} />
                    </div>
                </section>

                {/* Situação do time */}
                <section className="flex flex-wrap gap-3 mb-8">
                    <Pilula rotulo="ativos" valor={counts.active} destaque />
                    <Pilula rotulo="aguardando análise" valor={counts.pending} alerta={counts.pending > 0} />
                    <Pilula rotulo="recusados" valor={counts.rejected} />
                    {counts.suspended > 0 && <Pilula rotulo="suspensos" valor={counts.suspended} />}
                    {semNenhumClique > 0 && (
                        <Pilula rotulo="ativos sem nenhum clique" valor={semNenhumClique} alerta />
                    )}
                </section>

                {/* Desempenho individual */}
                <section>
                    <p className="text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: "var(--text-muted)" }}>
                        desempenho por embaixador
                    </p>

                    {ativos.length === 0 ? (
                        <div className="card-base p-12 text-center">
                            <Icon name="constellation" size={38} style={{ color: "var(--text-muted)" }} className="mx-auto mb-4" />
                            <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
                                Nenhum embaixador ativo ainda. Assim que você aprovar o primeiro na curadoria,
                                os números dele aparecem aqui.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-[20px]" style={{ border: "1px solid var(--glass-border)" }}>
                            <table className="w-full text-sm" style={{ borderCollapse: "collapse", minWidth: 780 }}>
                                <thead>
                                    <tr style={{ background: "rgba(11,11,18,0.5)" }}>
                                        <Th>Embaixador</Th>
                                        <Th right>Cliques</Th>
                                        <Th right>Cadastros</Th>
                                        <Th right>Assinantes</Th>
                                        <Th right>Receita</Th>
                                        <Th right>Comissão</Th>
                                        <Th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {ativos.map((a) => (
                                        <tr key={a.ambassadorId} style={{ borderTop: "1px solid var(--glass-border)" }}>
                                            <td className="px-4 py-3.5">
                                                <p style={{ color: "var(--cream)" }}>{a.name}</p>
                                                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                    {a.level ? `${a.level.name} · ${a.ratePct}%` : "sem nível"}
                                                    {a.slug ? ` · /e/${a.slug}` : ""}
                                                </p>
                                            </td>
                                            <Td>{num(a.clicks)}</Td>
                                            <Td sub={a.clicks > 0 ? pct(a.clickToSignupPct) : undefined}>{num(a.signups)}</Td>
                                            <Td sub={a.signups > 0 ? pct(a.signupToPayingPct) : undefined} destaque>
                                                {num(a.payingCount)}
                                            </Td>
                                            <Td>{brl(a.grossTotalCents)}</Td>
                                            <Td destaque>{brl(a.commissionTotalCents)}</Td>
                                            <td className="px-4 py-3.5 text-right">
                                                <Link href={`/admin/relatorio/${a.ambassadorId}`} className="text-xs hover:underline" style={{ color: "var(--gold)" }}>
                                                    relatório
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

function Etapa({ valor, rotulo, conversao, destaque }: {
    valor: string; rotulo: string; conversao?: string | null; destaque?: boolean;
}) {
    return (
        <div>
            <p className="font-display leading-none" style={{
                color: destaque ? "var(--gold)" : "var(--cream)",
                fontSize: "clamp(1.5rem, 5vw, 2rem)", fontWeight: 500,
            }}>{valor}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] mt-1.5" style={{ color: "var(--text-muted)" }}>{rotulo}</p>
            {conversao && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{conversao}</p>}
        </div>
    );
}

function Pilula({ rotulo, valor, destaque, alerta }: {
    rotulo: string; valor: number; destaque?: boolean; alerta?: boolean;
}) {
    const cor = alerta ? "var(--amber)" : destaque ? "var(--gold)" : "var(--text-secondary)";
    return (
        <div className="px-4 py-2.5 rounded-xl flex items-baseline gap-2"
            style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}>
            <span className="font-display text-lg" style={{ color: cor, fontWeight: 500 }}>{valor}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{rotulo}</span>
        </div>
    );
}

function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
    return (
        <th className={`px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium ${right ? "text-right" : "text-left"}`}
            style={{ color: "var(--text-muted)" }}>
            {children}
        </th>
    );
}

function Td({ children, sub, destaque }: { children: React.ReactNode; sub?: string; destaque?: boolean }) {
    return (
        <td className="px-4 py-3.5 text-right">
            <span style={{ color: destaque ? "var(--gold)" : "var(--text-secondary)" }}>{children}</span>
            {sub && <span className="block text-[11px]" style={{ color: "var(--text-muted)" }}>{sub}</span>}
        </td>
    );
}
