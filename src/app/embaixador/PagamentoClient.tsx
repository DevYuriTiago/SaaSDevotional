"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

const OPCOES_DOACAO = [
    { valor: 0, rotulo: "Nada" },
    { valor: 25, rotulo: "25%" },
    { valor: 50, rotulo: "Metade" },
    { valor: 100, rotulo: "Tudo" },
];

export default function PagamentoClient({
    pixKey, donationPercent, donationTarget,
}: {
    pixKey: string | null;
    donationPercent: number;
    donationTarget: string | null;
}) {
    const [pix, setPix] = useState(pixKey ?? "");
    const [percent, setPercent] = useState(donationPercent);
    const [target, setTarget] = useState(donationTarget ?? "");
    const [salvando, setSalvando] = useState(false);
    const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

    async function salvar(e: React.FormEvent) {
        e.preventDefault();
        setSalvando(true);
        setAviso(null);

        try {
            const res = await fetch("/api/ambassador/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pixKey: pix, donationPercent: percent, donationTarget: target }),
            });
            const json = await res.json();

            if (res.ok && json.ok) {
                setAviso({ tipo: "ok", texto: "Dados salvos." });
            } else {
                const primeiro = json.errors ? Object.values(json.errors)[0] as string : json.error;
                setAviso({ tipo: "erro", texto: primeiro ?? "Não foi possível salvar." });
            }
        } catch {
            setAviso({ tipo: "erro", texto: "Falha de conexão." });
        } finally {
            setSalvando(false);
        }
    }

    return (
        <section className="mt-10">
            <p className="eyebrow mb-3" style={{ color: "var(--gold)" }}>
                <span className="gold-rule" /> como você recebe
            </p>

            <form onSubmit={salvar} className="surface-wood rounded-[24px] p-6">
                {!pixKey && (
                    <div className="rounded-xl p-4 mb-5 flex items-start gap-2.5"
                        style={{ background: "rgba(224,151,90,0.08)", border: "1px solid rgba(224,151,90,0.3)" }}>
                        <Icon name="bell" size={17} style={{ color: "var(--amber)", flexShrink: 0, marginTop: 1 }} />
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            Cadastre a sua chave Pix. Sem ela não conseguimos te pagar quando a comissão for liberada.
                        </p>
                    </div>
                )}

                <label className="block text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--text-muted)" }}>
                    chave pix
                </label>
                <input
                    value={pix}
                    onChange={(e) => setPix(e.target.value)}
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    className="input-base"
                    maxLength={140}
                />

                <div className="mt-7">
                    <label className="block text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--text-muted)" }}>
                        quer destinar parte à sua igreja?
                    </label>
                    <p className="text-xs mb-3.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        Você escolhe quanto da sua comissão vai como doação. Nós separamos na hora do pagamento.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {OPCOES_DOACAO.map((o) => (
                            <button
                                key={o.valor}
                                type="button"
                                onClick={() => setPercent(o.valor)}
                                className="text-xs font-semibold px-4 py-2.5 rounded-full transition-colors"
                                style={{
                                    background: percent === o.valor ? "var(--gradient-gold)" : "transparent",
                                    color: percent === o.valor ? "#2A1E08" : "var(--text-secondary)",
                                    border: percent === o.valor ? "none" : "1px solid var(--glass-border)",
                                }}
                            >
                                {o.rotulo}
                            </button>
                        ))}
                    </div>

                    {percent > 0 && (
                        <input
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="Nome da igreja ou ministério"
                            className="input-base mt-3"
                            maxLength={120}
                        />
                    )}
                </div>

                {aviso && (
                    <p className="text-sm mt-5" style={{ color: aviso.tipo === "ok" ? "var(--gold)" : "var(--amber)" }}>
                        {aviso.texto}
                    </p>
                )}

                <button type="submit" disabled={salvando} className="btn-primary mt-6" style={{ width: "auto", height: 48, paddingInline: 26, fontSize: "0.9rem" }}>
                    {salvando ? "Salvando..." : "Salvar"}
                </button>
            </form>
        </section>
    );
}
