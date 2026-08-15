import { createClient } from "@supabase/supabase-js";
import { buildOverview, type StatRow } from "@/lib/ambassadors/overview";
import PainelClient from "./PainelClient";

export const dynamic = "force-dynamic";

export default async function PainelPage() {
    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: stats } = await admin
        .from("ambassador_stats")
        .select("ambassador_id, name, status, clicks, blocked_clicks, signups, paying_count, gross_pending_cents, gross_available_cents, gross_paid_cents");

    const { data: links } = await admin.from("ambassador_links").select("ambassador_id, slug");
    const slugPorId = new Map(
        ((links ?? []) as { ambassador_id: string; slug: string }[]).map((l) => [l.ambassador_id, l.slug])
    );

    const rows: StatRow[] = ((stats ?? []) as {
        ambassador_id: string; name: string; status: string;
        clicks: number; blocked_clicks: number; signups: number; paying_count: number;
        gross_pending_cents: number; gross_available_cents: number; gross_paid_cents: number;
    }[]).map((r) => ({
        ambassadorId: r.ambassador_id,
        name: r.name,
        status: r.status,
        slug: slugPorId.get(r.ambassador_id) ?? null,
        clicks: r.clicks,
        blockedClicks: r.blocked_clicks ?? 0,
        signups: r.signups,
        payingCount: r.paying_count,
        grossPendingCents: r.gross_pending_cents,
        grossAvailableCents: r.gross_available_cents,
        grossPaidCents: r.gross_paid_cents,
    }));

    return <PainelClient overview={buildOverview(rows)} />;
}
