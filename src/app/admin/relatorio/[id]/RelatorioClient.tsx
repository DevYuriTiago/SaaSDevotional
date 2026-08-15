"use client";

import Image from "next/image";
import { formatShortDate } from "@/lib/utils";
import type { AmbassadorStats, Earnings } from "@/lib/ambassadors/earnings";

const brl = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function pct(de: number, para: number): string {
    if (de <= 0) return "0%";
    return `${((para / de) * 100).toFixed(1).replace(".", ",")}%`;
}

/**
 * Relatório de um embaixador, feito para ser impresso ou salvo em PDF pelo
 * próprio navegador. Fundo branco e tinta escura de propósito: relatório
 * impresso no tema escuro do app gasta tinta e sai ilegível.
 */
export default function RelatorioClient({
    name, slug, desde, stats, earnings,
}: {
    name: string;
    slug: string | null;
    desde: string | null;
    stats: AmbassadorStats;
    earnings: Earnings;
}) {
    const brutoTotal = stats.grossPendingCents + stats.grossAvailableCents + stats.grossPaidCents;

    return (
        <main className="relatorio min-h-dvh py-10 px-5">
            <div className="mx-auto" style={{ maxWidth: 760 }}>

                <button onClick={() => window.print()} className="btn-imprimir">
                    Imprimir ou salvar em PDF
                </button>

                <article className="folha">
                    <header className="cabecalho">
                        <div className="marca">
                            <Image src="/new-icon.png" alt="" width={44} height={44} />
                            <div>
                                <p className="marca-nome">Humanáh</p>
                                <p className="marca-sub">Programa de Embaixadores</p>
                            </div>
                        </div>
                        <p className="emissao">Emitido em {formatShortDate(new Date().toISOString())}</p>
                    </header>

                    <section className="identificacao">
                        <h1>{name}</h1>
                        <p>
                            {earnings.level ? `Nível ${earnings.level.name}, comissão de ${Math.round(earnings.rate * 100)}%` : "Ainda sem nível"}
                            {slug ? ` · humanah.app/e/${slug}` : ""}
                            {desde ? ` · desde ${formatShortDate(desde)}` : ""}
                        </p>
                    </section>

                    <section>
                        <h2>Resultados</h2>
                        <table>
                            <tbody>
                                <tr><th>Cliques no link</th><td>{stats.clicks.toLocaleString("pt-BR")}</td><td className="obs"></td></tr>
                                <tr><th>Cadastros</th><td>{stats.signups.toLocaleString("pt-BR")}</td><td className="obs">{pct(stats.clicks, stats.signups)} dos cliques</td></tr>
                                <tr><th>Assinantes</th><td>{stats.payingCount.toLocaleString("pt-BR")}</td><td className="obs">{pct(stats.signups, stats.payingCount)} dos cadastros</td></tr>
                            </tbody>
                        </table>
                    </section>

                    <section>
                        <h2>Financeiro</h2>
                        <table>
                            <tbody>
                                <tr><th>Receita gerada</th><td>{brl(brutoTotal)}</td><td className="obs">soma das assinaturas trazidas</td></tr>
                                <tr><th>Comissão já paga</th><td>{brl(earnings.paidCents)}</td><td className="obs"></td></tr>
                                <tr><th>Comissão liberada</th><td>{brl(earnings.availableCents)}</td><td className="obs">disponível para saque</td></tr>
                                <tr><th>Comissão a liberar</th><td>{brl(earnings.pendingCents)}</td><td className="obs">dentro da garantia de 7 dias</td></tr>
                            </tbody>
                        </table>
                    </section>

                    <footer className="rodape">
                        <p>
                            Relatório gerado automaticamente pela plataforma Humanáh. Os valores de comissão
                            seguem a taxa do nível vigente e se confirmam após a garantia de 7 dias prevista
                            no Código de Defesa do Consumidor.
                        </p>
                        <p>humanah.app · contato@humanah.app</p>
                    </footer>
                </article>
            </div>

            <style>{`
                .relatorio { background: #EDEAE2; color: #1A160F; }
                .folha {
                    background: #fff; border-radius: 6px; padding: 46px 44px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.12);
                    font-family: Georgia, 'Times New Roman', serif;
                }
                .btn-imprimir {
                    display: block; margin: 0 0 18px auto; padding: 11px 22px;
                    border-radius: 999px; border: none; cursor: pointer;
                    background: linear-gradient(135deg,#FBE3B0,#F7C97A 50%,#C9962E);
                    color: #2A1E08; font-weight: 700; font-size: 13px;
                    font-family: system-ui, sans-serif;
                }
                .cabecalho {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    padding-bottom: 18px; border-bottom: 2px solid #C9962E; margin-bottom: 26px;
                }
                .marca { display: flex; gap: 12px; align-items: center; }
                .marca img { border-radius: 8px; }
                .marca-nome { font-size: 19px; font-weight: 700; margin: 0; letter-spacing: 0.02em; }
                .marca-sub { font-size: 11px; margin: 2px 0 0; color: #6B6357;
                    text-transform: uppercase; letter-spacing: 0.14em;
                    font-family: system-ui, sans-serif; }
                .emissao { font-size: 11px; color: #6B6357; margin: 0;
                    font-family: system-ui, sans-serif; }

                .identificacao { margin-bottom: 30px; }
                .identificacao h1 { font-size: 27px; margin: 0 0 5px; font-weight: 400; }
                .identificacao p { font-size: 12.5px; color: #6B6357; margin: 0;
                    font-family: system-ui, sans-serif; }

                .relatorio h2 {
                    font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em;
                    color: #9C7320; margin: 0 0 10px; font-family: system-ui, sans-serif;
                }
                .relatorio section { margin-bottom: 26px; }
                .relatorio table { width: 100%; border-collapse: collapse; }
                .relatorio th {
                    text-align: left; font-weight: 400; font-size: 14px;
                    padding: 9px 0; border-bottom: 1px solid #E4E0D6; width: 44%;
                }
                .relatorio td {
                    padding: 9px 0; border-bottom: 1px solid #E4E0D6;
                    font-size: 16px; font-weight: 700;
                }
                .relatorio td.obs {
                    font-size: 11.5px; font-weight: 400; color: #6B6357; text-align: right;
                    font-family: system-ui, sans-serif;
                }

                .rodape { margin-top: 34px; padding-top: 16px; border-top: 1px solid #E4E0D6; }
                .rodape p { font-size: 10.5px; color: #6B6357; margin: 0 0 5px; line-height: 1.55;
                    font-family: system-ui, sans-serif; }

                @media print {
                    .relatorio { background: #fff; padding: 0; }
                    .folha { box-shadow: none; border-radius: 0; padding: 0; }
                    .btn-imprimir { display: none; }
                    @page { margin: 18mm; }
                }
            `}</style>
        </main>
    );
}
