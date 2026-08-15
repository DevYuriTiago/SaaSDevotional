import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { computeEarnings, type AmbassadorStats } from "@/lib/ambassadors/earnings";
import RelatorioClient from "./RelatorioClient";

export const dynamic = "force-dynamic";

export default async function RelatorioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: row } = await admin
        .from("ambassador_stats")
        .select("ambassador_id, name, status, clicks, signups, paying_count, gross_pending_cents, gross_available_cents, gross_paid_cents")
        .eq("ambassador_id", id)
        .maybeSingle();

    if (!row) notFound();

    const stats: AmbassadorStats = {
        clicks: row.clicks,
        signups: row.signups,
        payingCount: row.paying_count,
        grossPendingCents: row.gross_pending_cents,
        grossAvailableCents: row.gross_available_cents,
        grossPaidCents: row.gross_paid_cents,
    };

    const { data: amb } = await admin
        .from("ambassadors")
        .select("created_at, ambassador_links(slug)")
        .eq("id", id)
        .maybeSingle();

    const slug = (amb as { ambassador_links?: { slug: string }[] } | null)?.ambassador_links?.[0]?.slug ?? null;

    return (
        <RelatorioClient
            name={row.name}
            slug={slug}
            desde={(amb as { created_at?: string } | null)?.created_at ?? null}
            stats={stats}
            earnings={computeEarnings(stats)}
        />
    );
}
