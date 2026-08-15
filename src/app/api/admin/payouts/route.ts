import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, isAdminAuthed } from "@/lib/admin/auth";
import { getLevel } from "@/lib/ambassadors/levels";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Registra um saque já pago por fora (Pix na mão) e baixa o saldo.
 *
 * Criar o registro e carimbar as conversões é a MESMA operação: nunca zeramos
 * saldo sem deixar o histórico de para onde o dinheiro foi. Se a criação do
 * saque falhar, nada é carimbado e o saldo continua intacto.
 *
 * O carimbo usa a lista exata de conversões lidas agora, não um intervalo de
 * datas: se uma conversão nova vencer a garantia enquanto o admin decide, ela
 * fica para o próximo saque em vez de entrar num valor já transferido.
 */
export async function POST(request: NextRequest) {
    if (!isAdminAuthed(request.cookies.get(ADMIN_COOKIE)?.value)) {
        return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 });
    }

    const { ambassadorId, notes } = (await request.json().catch(() => ({}))) as {
        ambassadorId?: string;
        notes?: string;
    };
    if (!ambassadorId) {
        return NextResponse.json({ ok: false, error: "Embaixador não informado" }, { status: 422 });
    }

    const cutoff = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();

    // Conversões liberadas: passaram da garantia, não estornadas, ainda não pagas.
    const { data: eligible } = await admin
        .from("conversions")
        .select("id, gross_amount_cents, occurred_at")
        .eq("ambassador_id", ambassadorId)
        .is("payout_id", null)
        .neq("status", "refunded")
        .lte("occurred_at", cutoff)
        .order("occurred_at", { ascending: true });

    const rows = (eligible ?? []) as { id: string; gross_amount_cents: number; occurred_at: string }[];
    if (rows.length === 0) {
        return NextResponse.json({ ok: false, error: "Nada disponível para saque." }, { status: 422 });
    }

    // A taxa é a do nível atual: o nível é vitalício, então quem subiu ganha a
    // taxa nova inclusive sobre o que ainda não recebeu.
    const { data: stats } = await admin
        .from("ambassador_stats")
        .select("paying_count")
        .eq("ambassador_id", ambassadorId)
        .maybeSingle();

    const rate = getLevel(stats?.paying_count ?? 0)?.rate ?? 0;
    const grossCents = rows.reduce((sum, r) => sum + r.gross_amount_cents, 0);
    const amountCents = Math.round(grossCents * rate);

    const { data: payout, error: payoutErr } = await admin
        .from("ambassador_payouts")
        .insert({
            ambassador_id: ambassadorId,
            amount_cents: amountCents,
            conversions_count: rows.length,
            period_start: rows[0].occurred_at,
            period_end: rows[rows.length - 1].occurred_at,
            method: "pix",
            notes: notes ?? null,
        })
        .select()
        .single();

    if (payoutErr || !payout) {
        // Sem registro, nada é carimbado: o saldo permanece disponível.
        return NextResponse.json(
            { ok: false, error: "Não foi possível registrar o saque." },
            { status: 500 }
        );
    }

    await admin
        .from("conversions")
        .update({ payout_id: payout.id })
        .in("id", rows.map((r) => r.id));

    return NextResponse.json({
        ok: true,
        payoutId: payout.id,
        amountCents,
        conversionsCount: rows.length,
    });
}
