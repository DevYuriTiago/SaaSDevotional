"use client";

import { usePathname } from "next/navigation";
import DesktopSidebar from "@/components/DesktopSidebar";

const NO_SIDEBAR_PATHS = ["/", "/login", "/signup", "/onboarding"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const showSidebar =
        !NO_SIDEBAR_PATHS.includes(pathname) &&
        !pathname.startsWith("/devotional/generate") &&
        !pathname.startsWith("/auth");

    return (
        <>
            {showSidebar && <DesktopSidebar />}
            <div className={showSidebar ? "lg:pl-64" : ""}>
                {children}
            </div>
        </>
    );
}
