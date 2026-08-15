import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, isAdminAuthed } from "@/lib/admin/auth";
import { getLevel } from "@/lib/ambassadors/levels";
import { buildCsv, type CsvRow } from "@/lib/ambassadors/csv";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// CSV agregado por embaixador. Só números: nenhum dado de usuário final sai daqui.
export async function GET(request: NextRequest) {
    if (!isAdminAuthed(request.cookies.get(ADMIN_COOKIE)?.value)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: stats } = await admin
        .from("ambassador_stats")
        .select("ambassador_id, name, status, clicks, signups, paying_count, gross_pending_cents, gross_available_cents, gross_paid_cents")
        .order("paying_count", { ascending: false });

    const linhas = (stats ?? []) as {
        ambassador_id: string; name: string; status: string;
        clicks: number; signups: number; paying_count: number;
        gross_pending_cents: number; gross_available_cents: number; gross_paid_cents: number;
    }[];

    const { data: links } = await admin.from("ambassador_links").select("ambassador_id, slug");
    const slugPorId = new Map(
        ((links ?? []) as { ambassador_id: string; slug: string }[]).map((l) => [l.ambassador_id, l.slug])
    );

    const rows: CsvRow[] = linhas.map((l) => {
        const bruto = l.gross_pending_cents + l.gross_available_cents + l.gross_paid_cents;
        const rate = getLevel(l.paying_count)?.rate ?? 0;
        return {
            name: l.name,
            status: l.status,
            slug: slugPorId.get(l.ambassador_id) ?? null,
            clicks: l.clicks,
            signups: l.signups,
            payingCount: l.paying_count,
            grossTotalCents: bruto,
            commissionCents: Math.round(bruto * rate),
        };
    });

    const hoje = new Date().toISOString().slice(0, 10);
    // BOM no início para o Excel abrir os acentos corretamente.
    return new NextResponse("﻿" + buildCsv(rows), {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="embaixadores-${hoje}.csv"`,
        },
    });
}
