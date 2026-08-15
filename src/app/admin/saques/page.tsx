import { createClient } from "@supabase/supabase-js";
import { getLevel } from "@/lib/ambassadors/levels";
import SaquesClient, { type Devido, type SaqueFeito } from "./SaquesClient";

export const dynamic = "force-dynamic";

export default async function SaquesPage() {
    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: stats } = await admin
        .from("ambassador_stats")
        .select("ambassador_id, name, paying_count, gross_available_cents, gross_pending_cents")
        .gt("gross_available_cents", 0);

    const linhas = (stats ?? []) as {
        ambassador_id: string; name: string; paying_count: number;
        gross_available_cents: number; gross_pending_cents: number;
    }[];

    // A chave Pix é PII: buscada só aqui, no admin, e só de quem tem saldo.
    const ids = linhas.map((l) => l.ambassador_id);
    const { data: pixRows } = ids.length
        ? await admin.from("ambassadors").select("id, pix_key, email").in("id", ids)
        : { data: [] };

    const pixPorId = new Map(
        ((pixRows ?? []) as { id: string; pix_key: string | null; email: string | null }[])
            .map((r) => [r.id, r])
    );

    const devidos: Devido[] = linhas
        .map((l) => {
            const rate = getLevel(l.paying_count)?.rate ?? 0;
            const contato = pixPorId.get(l.ambassador_id);
            return {
                ambassadorId: l.ambassador_id,
                name: l.name,
                levelName: getLevel(l.paying_count)?.name ?? null,
                ratePct: Math.round(rate * 100),
                amountCents: Math.round(l.gross_available_cents * rate),
                pendingCents: Math.round(l.gross_pending_cents * rate),
                pixKey: contato?.pix_key ?? null,
                email: contato?.email ?? null,
            };
        })
        .filter((d) => d.amountCents > 0)
        .sort((a, b) => b.amountCents - a.amountCents);

    const { data: historico } = await admin
        .from("ambassador_payouts")
        .select("id, amount_cents, conversions_count, paid_at, ambassadors(name)")
        .order("paid_at", { ascending: false })
        .limit(10);

    const feitos: SaqueFeito[] = ((historico ?? []) as unknown as {
        id: string; amount_cents: number; conversions_count: number; paid_at: string;
        ambassadors?: { name: string } | { name: string }[] | null;
    }[]).map((h) => ({
        id: h.id,
        amountCents: h.amount_cents,
        conversionsCount: h.conversions_count,
        paidAt: h.paid_at,
        name: Array.isArray(h.ambassadors) ? h.ambassadors[0]?.name ?? "" : h.ambassadors?.name ?? "",
    }));

    return <SaquesClient devidos={devidos} feitos={feitos} />;
}
