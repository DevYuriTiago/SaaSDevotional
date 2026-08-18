import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { computeEarnings, type AmbassadorStats } from "@/lib/ambassadors/earnings";
import { appUrl } from "@/lib/app-url";
import DetalheClient, { type Detalhe } from "./DetalheClient";

export const dynamic = "force-dynamic";

/**
 * Ficha completa do embaixador. Existe porque, depois da curadoria, a inscrição
 * saía da fila e os dados do formulário (WhatsApp, perfil, testemunho) ficavam
 * inacessíveis: o admin precisa continuar podendo consultar quem é a pessoa.
 */
export default async function FichaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: amb } = await admin
        .from("ambassadors")
        .select("id, name, email, whatsapp, social_platform, social_handle, followers_count, church, testimony, promotion_plan, status, created_at, reviewed_at, pix_key, donation_percent, donation_target, ambassador_links(slug)")
        .eq("id", id)
        .maybeSingle();

    if (!amb) notFound();

    const { data: row } = await admin
        .from("ambassador_stats")
        .select("clicks, blocked_clicks, signups, paying_count, gross_pending_cents, gross_available_cents, gross_paid_cents")
        .eq("ambassador_id", id)
        .maybeSingle();

    const stats: AmbassadorStats = {
        clicks: row?.clicks ?? 0,
        signups: row?.signups ?? 0,
        payingCount: row?.paying_count ?? 0,
        grossPendingCents: row?.gross_pending_cents ?? 0,
        grossAvailableCents: row?.gross_available_cents ?? 0,
        grossPaidCents: row?.gross_paid_cents ?? 0,
    };

    const slug = (amb as { ambassador_links?: { slug: string }[] }).ambassador_links?.[0]?.slug ?? null;

    const detalhe: Detalhe = {
        id: amb.id,
        name: amb.name,
        email: amb.email,
        whatsapp: amb.whatsapp,
        socialPlatform: amb.social_platform,
        socialHandle: amb.social_handle,
        followersCount: amb.followers_count,
        church: amb.church,
        testimony: amb.testimony,
        promotionPlan: amb.promotion_plan,
        status: amb.status,
        createdAt: amb.created_at,
        reviewedAt: amb.reviewed_at,
        pixKey: amb.pix_key,
        donationPercent: amb.donation_percent ?? 0,
        donationTarget: amb.donation_target,
        link: slug ? `${appUrl()}/e/${slug}` : null,
        blockedClicks: row?.blocked_clicks ?? 0,
    };

    return <DetalheClient d={detalhe} stats={stats} earnings={computeEarnings(stats)} />;
}
