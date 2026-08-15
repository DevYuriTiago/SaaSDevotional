import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, isAdminAuthed } from "@/lib/admin/auth";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Só transições entre ativo e suspenso passam por aqui. Aprovar e recusar
// continuam na rota de curadoria, que tem efeitos próprios (gerar link, e-mail).
const PERMITIDOS = ["active", "suspended"] as const;

/**
 * Suspende ou reativa um embaixador.
 *
 * Suspender não apaga histórico nem tira o link do ar: o que muda é que novas
 * conversões deixam de ser creditadas (guarda já existente em creditAmbassador).
 * O que ele já ganhou continua devido, porque comissão de indicação legítima
 * não deixa de ser devida por uma suspensão posterior.
 */
export async function POST(request: NextRequest) {
    if (!isAdminAuthed(request.cookies.get(ADMIN_COOKIE)?.value)) {
        return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 });
    }

    const { id, status } = (await request.json().catch(() => ({}))) as { id?: string; status?: string };

    if (!id || !status || !PERMITIDOS.includes(status as (typeof PERMITIDOS)[number])) {
        return NextResponse.json({ ok: false, error: "Requisição inválida" }, { status: 422 });
    }

    const { data: amb } = await admin
        .from("ambassadors")
        .select("id, status")
        .eq("id", id)
        .maybeSingle();

    if (!amb) return NextResponse.json({ ok: false, error: "Não encontrado" }, { status: 404 });

    // Aprovação e recusa não podem ser desfeitas por aqui.
    if (amb.status !== "active" && amb.status !== "suspended") {
        return NextResponse.json(
            { ok: false, error: "Só embaixadores ativos ou suspensos podem mudar por aqui." },
            { status: 409 }
        );
    }

    const { error } = await admin.from("ambassadors").update({ status }).eq("id", id);
    if (error) {
        return NextResponse.json({ ok: false, error: "Não foi possível atualizar." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status });
}
