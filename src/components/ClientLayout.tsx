"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
import DesktopSidebar from "@/components/DesktopSidebar";
import Toaster from "@/components/Toaster";
import { useUIStore } from "@/store";

const NO_SIDEBAR_PATHS = ["/", "/login", "/signup", "/onboarding"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { nightMode } = useUIStore();

    const showSidebar =
        !NO_SIDEBAR_PATHS.includes(pathname) &&
        !pathname.startsWith("/devotional/generate") &&
        !pathname.startsWith("/auth");

    useEffect(() => {
        if (nightMode) {
            document.documentElement.classList.add("night-mode");
        } else {
            document.documentElement.classList.remove("night-mode");
        }
    }, [nightMode]);

    return (
        // reducedMotion="user" faz todo o Framer Motion respeitar a preferência
        // de "reduzir movimento" do sistema operacional (acessibilidade).
        <MotionConfig reducedMotion="user">
            {showSidebar && <DesktopSidebar />}
            <div className={showSidebar ? "lg:pl-64" : ""}>
                {children}
            </div>
            <Toaster />
        </MotionConfig>
    );
}
