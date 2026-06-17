"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

interface ReferralInfo {
    code: string | null;
    url: string | null;
    total: number;
    rewarded: number;
}

export default function InviteCard() {
    const [info, setInfo] = useState<ReferralInfo | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch("/api/referral/me")
            .then((r) => r.json())
            .then((d) => setInfo(d))
            .catch(() => {});
    }, []);

    async function handleCopy() {
        if (!info?.url) return;
        try {
            await navigator.clipboard.writeText(info.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        } catch {
            // ignora
        }
    }

    async function handleShare() {
        if (!info?.url) return;
        const text = `Estou usando o Sentindo Hoje — um devocional feito pra cada momento. Faça sua jornada comigo e nós dois ganhamos 7 dias de Premium 🙏\n${info.url}`;
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({ text });
                return;
            } catch {
                // cai pro copy
            }
        }
        handleCopy();
    }

    return (
        <div className="card-base p-5" style={{ borderColor: "rgba(247,201,122,0.25)" }}>
            <div className="flex items-center gap-3 mb-2">
                <Icon name="sparkle" size={20} style={{ color: "var(--gold)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Convide e ganhe 7 dias Premium
                </p>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Quando seu convidado fizer o primeiro devocional, <strong style={{ color: "var(--text-secondary)" }}>vocês dois</strong> ganham 7 dias de Premium.
            </p>

            {info?.url ? (
                <>
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3"
                        style={{ background: "rgba(255,252,245,0.04)", border: "1px solid var(--glass-border)" }}>
                        <span className="text-xs truncate flex-1" style={{ color: "var(--text-secondary)" }}>{info.url}</span>
                        <button onClick={handleCopy} className="flex-shrink-0" aria-label="Copiar link">
                            <Icon name={copied ? "check" : "scroll"} size={16} style={{ color: copied ? "var(--gold)" : "var(--text-muted)" }} />
                        </button>
                    </div>
                    <button onClick={handleShare} className="btn-primary w-full justify-center" style={{ height: 44 }}>
                        <Icon name="share" size={16} /> Compartilhar convite
                    </button>
                    {info.total > 0 && (
                        <p className="text-xs mt-3 text-center" style={{ color: "var(--text-muted)" }}>
                            {info.total} {info.total === 1 ? "convidado" : "convidados"} · {info.rewarded} {info.rewarded === 1 ? "recompensa" : "recompensas"}
                        </p>
                    )}
                </>
            ) : (
                <div className="h-11 rounded-xl animate-pulse" style={{ background: "rgba(255,252,245,0.04)" }} />
            )}
        </div>
    );
}
