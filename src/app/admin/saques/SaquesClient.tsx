"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { formatShortDate } from "@/lib/utils";
import AdminNav from "../AdminNav";

export type Devido = {
    ambassadorId: string;
    name: string;
    levelName: string | null;
    ratePct: number;
    amountCents: number;
    pendingCents: number;
    pixKey: string | null;
    email: string | null;
};

export type SaqueFeito = {
    id: string;
    name: string;
    amountCents: number;
    conversionsCount: number;
    paidAt: string;
};

const brl = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function SaquesClient({ devidos, feitos }: { devidos: Devido[]; feitos: SaqueFeito[] }) {
    const router = useRouter();
    const [busy, setBusy] = useState<string | null>(null);
    const [copiado, setCopiado] = useState<string | null>(null);
    const [aviso, setAviso] = useState<string | null>(null);

    const total = devidos.reduce((s, d) => s + d.amountCents, 0);

    async function marcarPago(d: Devido) {
        if (busy) return;
        if (!confirm(
            `Confirmar que você já pagou ${brl(d.amountCents)} para ${d.name}?\n\n` +
            `Isso registra o saque e baixa o saldo. Faça o Pix antes de confirmar.`
        )) return;

        setBusy(d.ambassadorId);
        setAviso(null);
        try {
            const res = await fetch("/api/admin/payouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ambassadorId: d.ambassadorId }),
            });
            const json = await res.json();
            if (!res.ok || !json.ok) {
                setAviso(json.error ?? "Não foi possível registrar o saque.");
            } else {
                setAviso(`Saque de ${brl(json.amountCents)} registrado para ${d.name}.`);
            }
            router.refresh();
        } catch {
            setAviso("Falha de conexão.");
        } finally {
            setBusy(null);
        }
    }

    async function copiarPix(d: Devido) {
        if (!d.pixKey) return;
        await navigator.clipboard.writeText(d.pixKey);
        setCopiado(d.ambassadorId);
        setTimeout(() => setCopiado(null), 2200);
    }

    return (
        <main className="aurora-bg relative min-h-dvh px-5 sm:px-8 py-10">
            <div className="max-w-4xl mx-auto">

                <header className="mb-8">
                    <p className="eyebrow mb-1.5" style={{ color: "var(--gold)" }}>
                        <span className="gold-rule" /> financeiro
                    </p>
                    <h1 className="font-display text-3xl mb-1" style={{ color: "var(--cream)", fontWeight: 500 }}>
                        Saques
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {devidos.length === 0
                            ? "Nenhuma comissão liberada no momento."
                            : `${brl(total)} a pagar para ${devidos.length} ${devidos.length === 1 ? "embaixador" : "embaixadores"}.`}
                    </p>
                </header>

                <AdminNav />

                {aviso && (
                    <div className="rounded-2xl p-4 mb-6 text-sm"
                        style={{ background: "rgba(247,201,122,0.07)", border: "1px solid rgba(247,201,122,0.3)", color: "var(--text-secondary)" }}>
                        {aviso}
                    </div>
                )}

                {devidos.length === 0 ? (
                    <div className="card-base p-12 text-center">
                        <Icon name="rest" size={38} style={{ color: "var(--text-muted)" }} className="mx-auto mb-4" />
                        <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
                            As comissões aparecem aqui depois que passam a garantia de 7 dias.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {devidos.map((d) => (
                            <article key={d.ambassadorId} className="surface-wood rounded-[24px] p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                    <div>
                                        <h2 className="font-display text-xl" style={{ color: "var(--cream)", fontWeight: 500 }}>{d.name}</h2>
                                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                            {d.levelName ? `Nível ${d.levelName}, ${d.ratePct}% de comissão` : "Sem nível ainda"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-display leading-none" style={{ color: "var(--gold)", fontSize: "2rem", fontWeight: 500 }}>
                                            {brl(d.amountCents)}
                                        </p>
                                        {d.pendingCents > 0 && (
                                            <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                                                + {brl(d.pendingCents)} ainda na garantia
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(11,11,18,0.4)", border: "1px solid var(--glass-border)" }}>
                                    <p className="text-[10px] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--text-muted)" }}>chave pix</p>
                                    {d.pixKey ? (
                                        <div className="flex flex-wrap items-center gap-3">
                                            <code className="text-sm break-all" style={{ color: "var(--gold)" }}>{d.pixKey}</code>
                                            <button onClick={() => copiarPix(d)} className="btn-ghost text-xs" style={{ width: "auto", height: 34, paddingInline: 14 }}>
                                                <Icon name={copiado === d.ambassadorId ? "check" : "share"} size={13} />
                                                {copiado === d.ambassadorId ? "Copiada" : "Copiar"}
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm" style={{ color: "var(--amber)" }}>
                                            Sem chave cadastrada. Peça pelo e-mail {d.email ?? "de contato"} antes de pagar.
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() => marcarPago(d)}
                                    disabled={busy === d.ambassadorId}
                                    className="btn-primary"
                                    style={{ width: "auto", height: 48, paddingInline: 24, fontSize: "0.9rem" }}
                                >
                                    {busy === d.ambassadorId ? "Registrando..." : <><Icon name="check" size={17} /> Já paguei, registrar saque</>}
                                </button>
                                <p className="text-[11px] mt-2.5" style={{ color: "var(--text-muted)" }}>
                                    Faça o Pix pelo seu banco e só então registre aqui.
                                </p>
                            </article>
                        ))}
                    </div>
                )}

                {feitos.length > 0 && (
                    <section className="mt-12">
                        <p className="text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: "var(--text-muted)" }}>saques recentes</p>
                        <ul className="space-y-1.5">
                            {feitos.map((f) => (
                                <li key={f.id} className="flex items-center justify-between text-sm py-2.5 px-4 rounded-xl"
                                    style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}>
                                    <span style={{ color: "var(--text-secondary)" }}>{f.name}</span>
                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        <strong style={{ color: "var(--gold)" }}>{brl(f.amountCents)}</strong>
                                        {" · "}{f.conversionsCount} {f.conversionsCount === 1 ? "conversão" : "conversões"}
                                        {" · "}{formatShortDate(f.paidAt)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </main>
    );
}
