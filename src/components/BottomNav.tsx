"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const tabs = [
    { href: "/dashboard", icon: "⊞", label: "Início" },
    { href: "/devotional/read", icon: "📖", label: "Devocional" },
    { href: "/journey", icon: "🧭", label: "Jornadas" },
    { href: "/journal", icon: "📝", label: "Diário" },
    { href: "/profile", icon: "👤", label: "Perfil" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="bottom-nav lg:hidden">
            {tabs.map((tab) => {
                const active = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 relative"
                    >
                        <span className="text-lg leading-none" style={{ opacity: active ? 1 : 0.4 }}>{tab.icon}</span>
                        <span
                            className="text-[10px] font-medium transition-colors"
                            style={{ color: active ? "var(--brand-purple)" : "var(--text-muted)" }}
                        >
                            {tab.label}
                        </span>
                        {active && (
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                                style={{ background: "var(--gradient-button)" }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
