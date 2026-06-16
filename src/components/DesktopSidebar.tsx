"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon, BrandMark, type IconName } from "@/components/icons";

const NAV_ITEMS: { href: string; icon: IconName; label: string }[] = [
    { href: "/dashboard", icon: "dawn", label: "Início" },
    { href: "/devotional/read", icon: "book", label: "Devocional" },
    { href: "/journey", icon: "compass", label: "Jornadas" },
    { href: "/journal", icon: "pen", label: "Diário" },
    { href: "/profile", icon: "user", label: "Perfil" },
];

export default function DesktopSidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col z-50"
            style={{
                background: "rgba(8, 7, 15, 0.94)",
                backdropFilter: "blur(32px)",
                borderRight: "1px solid var(--glass-border)",
            }}
        >
            {/* Brilho dourado tênue no topo */}
            <div className="absolute inset-x-0 top-0 h-40 pointer-events-none" style={{
                background: "radial-gradient(120% 80% at 50% 0%, rgba(247,201,122,0.10) 0%, transparent 65%)",
            }} />

            {/* Marca */}
            <div className="relative px-5 pt-7 pb-5">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <BrandMark size={34} />
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>Sua vigília</p>
                        <h2 className="text-sm leading-snug font-display" style={{ color: "var(--cream)" }}>
                            Sentindo Hoje
                        </h2>
                    </div>
                </Link>
            </div>

            {/* Novo devocional */}
            <div className="relative px-4 mb-5">
                <Link
                    href="/emotion"
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{
                        background: "var(--gradient-gold)",
                        color: "#2A1E08",
                        boxShadow: "var(--shadow-button), inset 0 1px 0 rgba(255,255,255,0.4)",
                    }}
                >
                    <Icon name="sunrise" size={17} strokeWidth={1.8} />
                    Novo devocional
                </Link>
            </div>

            <div className="mx-4 mb-3" style={{ height: 1, background: "var(--glass-border)" }} />

            {/* Navegação */}
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
                                background: active ? "rgba(247,201,122,0.10)" : "transparent",
                                color: active ? "var(--cream)" : "var(--text-secondary)",
                            }}
                        >
                            <Icon
                                name={item.icon}
                                size={19}
                                strokeWidth={active ? 1.8 : 1.5}
                                style={{ color: active ? "var(--gold)" : "var(--text-muted)", flexShrink: 0 }}
                            />
                            <span className="text-sm font-medium flex-1">{item.label}</span>
                            {active && (
                                <motion.div
                                    layoutId="sidebar-dot"
                                    className="w-1.5 h-5 rounded-full flex-shrink-0"
                                    style={{ background: "var(--gradient-gold)" }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Premium */}
            <div className="relative px-4 pb-6 pt-3">
                <div className="mb-3" style={{ height: 1, background: "var(--glass-border)" }} />
                <Link
                    href="/subscription"
                    className="block rounded-2xl p-4 transition-all hover:-translate-y-0.5"
                    style={{
                        background: "rgba(247,201,122,0.06)",
                        border: "1px solid rgba(247,201,122,0.20)",
                    }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Icon name="crown" size={16} style={{ color: "var(--gold)" }} />
                        <p className="text-xs font-semibold" style={{ color: "var(--cream)" }}>Plano Premium</p>
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Devocionais ilimitados</p>
                    <p className="text-xs font-bold mt-1" style={{ color: "var(--gold)" }}>R$ 24,90/mês →</p>
                </Link>
            </div>
        </aside>
    );
}
