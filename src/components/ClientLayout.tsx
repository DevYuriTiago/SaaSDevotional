"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
import Toaster from "@/components/Toaster";
import { useUIStore } from "@/store";

// Rotas "web" (tela cheia no desktop, sem moldura de celular): landing, SEO e páginas legais.
function isWebRoute(pathname: string): boolean {
    return (
        pathname === "/" ||
        pathname.startsWith("/versiculos") ||
        pathname.startsWith("/embaixadores") ||
        pathname === "/privacidade" ||
        pathname === "/termos"
    );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const nightMode = useUIStore((s) => s.nightMode);

    useEffect(() => {
        document.documentElement.classList.toggle("night-mode", nightMode);
    }, [nightMode]);

    // Landing e páginas de SEO: web normal em qualquer tela.
    if (isWebRoute(pathname)) {
        return (
            <MotionConfig reducedMotion="user">
                {children}
                <Toaster />
            </MotionConfig>
        );
    }

    // App (auth + telas internas): experiência 100% mobile.
    // No desktop (≥1024px) renderiza dentro de uma moldura de celular centralizada;
    // em celular/tablet-retrato ocupa a tela cheia (as classes só agem no ≥1024px).
    return (
        <MotionConfig reducedMotion="user">
            <div className="device-shell">
                <div className="phone-frame">
                    <div className="phone-screen">{children}</div>
                    <Toaster />
                </div>
            </div>
        </MotionConfig>
    );
}
