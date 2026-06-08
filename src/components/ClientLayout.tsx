"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import DesktopSidebar from "@/components/DesktopSidebar";
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
        <>
            {showSidebar && <DesktopSidebar />}
            <div className={showSidebar ? "lg:pl-64" : ""}>
                {children}
            </div>
        </>
    );
}
