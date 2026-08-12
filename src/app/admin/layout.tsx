import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminAuthed } from "@/lib/admin/auth";
import LoginClient from "./login/LoginClient";

export const metadata: Metadata = {
    title: "Painel administrativo",
    robots: { index: false, follow: false },
};

/**
 * Portão do painel. Fica aqui (server component, runtime Node) e não no
 * middleware porque o middleware roda em Edge Runtime, sem node:crypto.
 * As rotas de API validam o cookie por conta própria: esta tela é
 * conveniência, não a fronteira de segurança.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    if (!isAdminAuthed(cookieStore.get(ADMIN_COOKIE)?.value)) {
        return <LoginClient />;
    }
    return <>{children}</>;
}
