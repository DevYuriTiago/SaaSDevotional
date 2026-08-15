import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { resolveAmbassador } from "@/lib/ambassadors/portal";
import { computeEarnings, type AmbassadorStats } from "@/lib/ambassadors/earnings";
import { Icon } from "@/components/icons";
import PortalClient from "./PortalClient";

export const metadata: Metadata = {
    title: "Portal do embaixador",
    robots: { index: false, follow: false },
};

// Os números mudam a cada clique e cada assinatura: nada de cache.
export const dynamic = "force-dynamic";

export default async function PortalPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ambassador = await resolveAmbassador(admin, {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
    });

    // Quem não é embaixador vê o convite, não um erro.
    if (!ambassador) return <NaoEhEmbaixador />;

    const { data: row } = await admin
        .from("ambassador_stats")
        .select("clicks, signups, paying_count, gross_pending_cents, gross_confirmed_cents")
        .eq("ambassador_id", ambassador.id)
        .maybeSingle();

    const stats: AmbassadorStats = {
        clicks: row?.clicks ?? 0,
        signups: row?.signups ?? 0,
        payingCount: row?.paying_count ?? 0,
        grossPendingCents: row?.gross_pending_cents ?? 0,
        grossConfirmedCents: row?.gross_confirmed_cents ?? 0,
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://humanah.app";
    const link = ambassador.slug ? `${baseUrl}/e/${ambassador.slug}` : null;

    // QR gerado no servidor: sem chamada a serviço externo, sem rastrear ninguém.
    const qrSvg = link
        ? await QRCode.toString(link, {
            type: "svg",
            margin: 1,
            color: { dark: "#F7C97A", light: "#00000000" },
        })
        : null;

    return (
        <PortalClient
            name={ambassador.name}
            link={link}
            qrSvg={qrSvg}
            stats={stats}
            earnings={computeEarnings(stats)}
        />
    );
}

function NaoEhEmbaixador() {
    return (
        <main className="aurora-bg relative min-h-dvh flex items-center justify-center px-5 py-16">
            <div className="surface-wood rounded-[28px] p-10 max-w-md text-center">
                <div className="w-14 h-14 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(247,201,122,0.10)", border: "1px solid rgba(247,201,122,0.3)" }}>
                    <Icon name="compass" size={24} style={{ color: "var(--gold)" }} />
                </div>
                <h1 className="font-display text-2xl mb-3" style={{ color: "var(--cream)", fontWeight: 500 }}>
                    Este espaço é dos embaixadores.
                </h1>
                <p className="text-sm leading-relaxed mb-7" style={{ color: "var(--text-secondary)" }}>
                    Se você já se inscreveu, confirme que entrou com o mesmo e-mail que usou
                    na inscrição e que ele já foi verificado. Se ainda não se inscreveu, conheça o programa.
                </p>
                <Link href="/embaixadores" className="btn-primary">Conhecer o programa</Link>
                <Link href="/dashboard" className="block text-xs mt-5" style={{ color: "var(--text-muted)" }}>
                    Voltar ao meu devocional
                </Link>
            </div>
        </main>
    );
}
