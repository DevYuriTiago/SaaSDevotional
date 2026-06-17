import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Código curto e legível (8 chars base36).
function genCode(): string {
    return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .single();

    let code = profile?.referral_code as string | null | undefined;

    // Gera o código na primeira vez (com algumas tentativas em caso de colisão).
    if (!code) {
        for (let attempt = 0; attempt < 5 && !code; attempt++) {
            const candidate = genCode();
            const { error } = await admin
                .from("profiles")
                .update({ referral_code: candidate })
                .eq("id", user.id);
            if (!error) code = candidate;
        }
    }

    // Estatísticas do convite.
    const { count: total } = await admin
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", user.id);

    const { count: rewarded } = await admin
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", user.id)
        .eq("status", "rewarded");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://oquevoceestasentindohoje.app";
    const url = code ? `${appUrl}/?ref=${code}` : null;

    return NextResponse.json({
        code: code ?? null,
        url,
        total: total ?? 0,
        rewarded: rewarded ?? 0,
    });
}
