"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
    { href: "/dashboard", icon: "⊞", label: "Início" },
    { href: "/devotional/read", icon: "📖", label: "Devocional" },
    { href: "/journey", icon: "🧭", label: "Jornadas" },
    { href: "/journal", icon: "📝", label: "Diário" },
    { href: "/profile", icon: "👤", label: "Perfil" },
];

export default function DesktopSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col z-50"
            style={{
                background: "rgba(6, 8, 22, 0.92)",
                backdropFilter: "blur(32px)",
                borderRight: "1px solid var(--glass-border)",
            }}
        >
            {/* Aurora glow inside sidebar */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-none">
                <div className="absolute -top-20 -left-10 w-48 h-48 rounded-full" style={{
                    background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
                    filter: "blur(30px)",
                }} />
            </div>

            {/* Brand */}
            <div className="relative px-6 pt-8 pb-5">
                <Link href="/dashboard" className="block group">
                    <p className="text-[11px] font-medium mb-1 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>IA Espiritual</p>
                    <h2 className="text-sm font-bold leading-snug transition-colors group-hover:text-purple-300" style={{ color: "var(--text-primary)" }}>
                        O Que Você Está<br />Sentindo Hoje?
                    </h2>
                </Link>
            </div>

            {/* New devotional CTA */}
            <div className="relative px-4 mb-5">
                <Link
                    href="/emotion"
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                    style={{
                        background: "var(--gradient-button)",
                        boxShadow: "0 8px 24px rgba(168,85,247,0.35)",
                    }}
                >
                    ✨ Novo devocional
                </Link>
            </div>

            {/* Divider */}
            <div className="mx-4 mb-3" style={{ height: 1, background: "var(--glass-border)" }} />

            {/* Nav */}
            <nav className="relative flex-1 px-3 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const active =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 relative"
                            style={{
                                background: active
                                    ? "rgba(168,85,247,0.14)"
                                    : "transparent",
                                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                            }}
                        >
                            <span className="text-base w-5 text-center leading-none flex-shrink-0"
                                style={{ opacity: active ? 1 : 0.5 }}>
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium flex-1">{item.label}</span>
                            {active && (
                                <motion.div
                                    layoutId="sidebar-dot"
                                    className="w-1.5 h-5 rounded-full flex-shrink-0"
                                    style={{ background: "var(--gradient-button)" }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom: premium upsell */}
            <div className="relative px-4 pb-6 pt-3">
                <div className="mx-0 mb-2" style={{ height: 1, background: "var(--glass-border)" }} />
                <Link
                    href="/subscription"
                    className="block rounded-2xl p-4 mt-3 transition-all hover:border-purple-500/40"
                    style={{
                        background: "rgba(168,85,247,0.07)",
                        border: "1px solid rgba(168,85,247,0.18)",
                    }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">👑</span>
                        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Plano Premium</p>
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Devocionais ilimitados</p>
                    <p className="text-xs font-bold mt-1" style={{ color: "var(--brand-purple)" }}>R$ 24,90/mês →</p>
                </Link>
            </div>
        </aside>
    );
}
