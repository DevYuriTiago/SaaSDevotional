"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

export default function LoginClient() {
    const [secret, setSecret] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/admin/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ secret }),
        }).catch(() => null);

        if (res?.ok) {
            window.location.reload();
            return;
        }
        setError("Senha incorreta.");
        setLoading(false);
    }

    return (
        <main className="aurora-bg relative min-h-dvh flex items-center justify-center px-5">
            <form onSubmit={onSubmit} className="surface-wood rounded-[28px] p-9 w-full max-w-sm text-center">
                <div className="w-14 h-14 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(247,201,122,0.10)", border: "1px solid rgba(247,201,122,0.3)" }}>
                    <Icon name="lock" size={24} style={{ color: "var(--gold)" }} />
                </div>
                <h1 className="font-display text-2xl mb-2" style={{ color: "var(--cream)", fontWeight: 500 }}>
                    Painel administrativo
                </h1>
                <p className="text-sm mb-7" style={{ color: "var(--text-secondary)" }}>
                    Área restrita da Humanáh.
                </p>

                <input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Senha de acesso"
                    className="input-base text-center"
                    autoFocus
                    autoComplete="current-password"
                />
                {error && <p className="text-xs mt-3" style={{ color: "var(--amber)" }}>{error}</p>}

                <button type="submit" disabled={loading || !secret} className="btn-primary w-full justify-center mt-6">
                    {loading ? "Verificando..." : "Entrar"}
                </button>
            </form>
        </main>
    );
}
