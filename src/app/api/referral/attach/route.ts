import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Vincula o usuário atual (convidado) ao convidante dono do `code`.
// Idempotente: se já houver vínculo, retorna ok sem alterar nada.
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { code } = (await request.json().catch(() => ({}))) as { code?: string };
    if (!code) return NextResponse.json({ ok: false, reason: "sem código" });

    // Já vinculado?
    const { data: me } = await admin
        .from("profiles")
        .select("referred_by")
        .eq("id", user.id)
        .single();
    if (me?.referred_by) return NextResponse.json({ ok: true, already: true });

    // Resolve o convidante pelo código (lookup cross-user exige service role).
    const { data: referrer } = await admin
        .from("profiles")
        .select("id")
        .eq("referral_code", code)
        .maybeSingle();

    if (!referrer || referrer.id === user.id) {
        return NextResponse.json({ ok: false, reason: "código inválido" });
    }

    await admin.from("profiles").update({ referred_by: referrer.id }).eq("id", user.id);

    // Cria o convite pendente (unique por invitee — ignora se já existir).
    await admin.from("referrals").insert({
        referrer_id: referrer.id,
        invitee_id: user.id,
        code,
        status: "pending",
    });

    return NextResponse.json({ ok: true });
}
