"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";

const tabs: { href: string; icon: IconName; label: string }[] = [
    { href: "/dashboard", icon: "dawn", label: "Início" },
    { href: "/devotional/read", icon: "book", label: "Devocional" },
    { href: "/journey", icon: "compass", label: "Jornadas" },
    { href: "/journal", icon: "pen", label: "Diário" },
    { href: "/profile", icon: "user", label: "Perfil" },
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
                        <Icon
                            name={tab.icon}
                            size={21}
                            strokeWidth={active ? 1.8 : 1.5}
                            style={{ color: active ? "var(--gold)" : "var(--text-muted)", opacity: active ? 1 : 0.7 }}
                        />
                        <span
                            className="text-[10px] font-medium transition-colors"
                            style={{ color: active ? "var(--gold)" : "var(--text-muted)" }}
                        >
                            {tab.label}
                        </span>
                        {active && (
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                                style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
