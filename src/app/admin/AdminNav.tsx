"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";

const ABAS = [
    { href: "/admin", label: "Visão geral" },
    { href: "/admin/embaixadores", label: "Curadoria" },
    { href: "/admin/saques", label: "Saques" },
];

export default function AdminNav({ pendentes = 0 }: { pendentes?: number }) {
    const pathname = usePathname();

    async function sair() {
        await fetch("/api/admin/session", { method: "DELETE" });
        window.location.reload();
    }

    return (
        <div className="flex flex-wrap items-center gap-2 mb-8">
            {ABAS.map((a) => {
                const ativa = pathname === a.href;
                return (
                    <Link
                        key={a.href}
                        href={a.href}
                        className="text-xs font-semibold px-4 py-2.5 rounded-full transition-colors"
                        style={{
                            background: ativa ? "var(--gradient-gold)" : "var(--glass)",
                            color: ativa ? "#2A1E08" : "var(--text-secondary)",
                            border: ativa ? "none" : "1px solid var(--glass-border)",
                        }}
                    >
                        {a.label}
                        {a.href === "/admin/embaixadores" && pendentes > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px]"
                                style={{ background: ativa ? "rgba(42,30,8,0.18)" : "rgba(247,201,122,0.16)", color: ativa ? "#2A1E08" : "var(--gold)" }}>
                                {pendentes}
                            </span>
                        )}
                    </Link>
                );
            })}

            <div className="flex items-center gap-2 ml-auto">
                <a href="/api/admin/export" className="btn-ghost text-xs" style={{ width: "auto", height: 38, paddingInline: 14 }}>
                    <Icon name="scroll" size={14} /> CSV
                </a>
                <button onClick={sair} className="btn-ghost text-xs" style={{ width: "auto", height: 38, paddingInline: 14 }}>
                    <Icon name="logout" size={14} /> Sair
                </button>
            </div>
        </div>
    );
}
