"use client";

import { useState } from "react";
import { getLevel, estimateMonthly, LEVELS } from "@/lib/ambassadors/levels";
import { PREMIUM_PRICE } from "@/lib/constants";
import { Medallion, type TierSlug } from "./medallions";

const fmtBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export default function Calculadora() {
    const [count, setCount] = useState(300);
    const level = getLevel(count);
    const monthly = estimateMonthly(count);

    return (
        <div className="surface-wood rounded-[28px] p-7 sm:p-10 relative overflow-hidden">
            {/* brilho quente no canto — instrumento sobre a mesa */}
            <div className="absolute -top-16 -right-16 pointer-events-none" style={{ width: 280, height: 280, background: "radial-gradient(circle, rgba(247,201,122,0.12), transparent 65%)" }} />

            <div className="relative grid sm:grid-cols-[auto_1fr] gap-7 sm:gap-10 items-center">
                {/* medalhão do nível atual */}
                <div className="flex sm:flex-col items-center gap-4 sm:gap-2 justify-center">
                    <Medallion tier={(level?.slug ?? "bronze") as TierSlug} size={110} dimmed={!level} />
                    <div className="text-center">
                        <p className="font-display text-lg" style={{ color: "var(--cream)", fontWeight: 500 }}>
                            {level ? level.name : "—"}
                        </p>
                        <p className="text-xs" style={{ color: "var(--gold)" }}>
                            {level ? `${Math.round(level.rate * 100)}% de comissão` : "mova o cursor"}
                        </p>
                    </div>
                </div>

                <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Assinantes ativos pela sua indicação</p>
                        <p className="font-display text-xl" style={{ color: "var(--cream)", fontWeight: 500 }}>
                            {count.toLocaleString("pt-BR")}
                        </p>
                    </div>

                    <input
                        type="range" min={0} max={2000} step={10} value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        aria-label="Quantidade de assinantes ativos"
                        className="amb-range w-full"
                    />
                    {/* Legenda dos níveis. Marcadores posicionados sobre a régua se
                        empilhavam no celular, porque Bronze, Prata e Ouro começam todos
                        nos primeiros 10% da escala. Em lista que quebra linha nada colide,
                        e ainda dá para mostrar o nome de cada nível. */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[10px]">
                        {LEVELS.map((l) => {
                            const atual = level?.slug === l.slug;
                            return (
                                <span key={l.slug} style={{ color: atual ? "var(--gold)" : "var(--text-muted)" }}>
                                    {l.name} <span style={{ opacity: 0.7 }}>{l.min.toLocaleString("pt-BR")}+</span>
                                </span>
                            );
                        })}
                    </div>

                    <div className="mt-5 pt-5 border-t" style={{ borderColor: "var(--glass-border)" }}>
                        <p className="text-xs uppercase tracking-[0.16em] mb-1" style={{ color: "var(--text-muted)" }}>
                            estimativa recorrente
                        </p>
                        <p className="font-display leading-none" style={{ color: "var(--gold)", fontSize: "clamp(2.2rem, 6vw, 3.1rem)", fontWeight: 500 }}>
                            {fmtBRL(monthly)}<span className="font-sans text-base" style={{ color: "var(--text-muted)" }}> /mês</span>
                        </p>
                        <p className="text-[11px] leading-relaxed mt-3 max-w-md" style={{ color: "var(--text-muted)" }}>
                            Estimativa com o plano mensal (R$ {PREMIUM_PRICE.toFixed(2).replace(".", ",")}). A comissão de cada
                            pagamento confirma após a garantia de 7 dias e continua enquanto a assinatura estiver ativa.
                        </p>
                    </div>
                </div>
            </div>

            {/* estilo do cursor — trilho de ouro */}
            <style>{`
                .amb-range { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 999px;
                    background: linear-gradient(90deg, var(--gold-deep), var(--gold) 60%, rgba(247,201,122,0.15));
                    outline: none; cursor: pointer; }
                .amb-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px;
                    border-radius: 50%; background: var(--gradient-gold); border: 2px solid rgba(11,11,18,0.9);
                    box-shadow: 0 4px 14px rgba(201,150,46,0.45); }
                .amb-range::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%;
                    background: var(--gradient-gold); border: 2px solid rgba(11,11,18,0.9);
                    box-shadow: 0 4px 14px rgba(201,150,46,0.45); }
            `}</style>
        </div>
    );
}
