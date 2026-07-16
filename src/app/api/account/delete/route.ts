import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe/client";

// Cliente service-role: necessário para excluir o usuário do Auth (cascata
// apaga profiles, devocionais, diário e jornadas; analytics vira anônimo).
const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 1) Cancela assinatura Stripe ativa (se houver) — não cobrar conta excluída.
    const { data: profile } = await admin
        .from("profiles")
        .select("stripe_subscription_id")
        .eq("id", user.id)
        .maybeSingle();

    const subId = (profile as { stripe_subscription_id?: string | null } | null)?.stripe_subscription_id;
    if (subId) {
        try {
            await stripe.subscriptions.cancel(subId);
        } catch (err) {
            // Se a assinatura já não existir/estiver cancelada, seguimos com a exclusão.
            console.warn("[account/delete] falha ao cancelar assinatura:", (err as Error).message);
        }
    }

    // 2) Exclui o usuário (cascata remove os dados pessoais vinculados).
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
        return NextResponse.json(
            { error: "Não foi possível excluir a conta agora. Tente novamente em instantes." },
            { status: 500 }
        );
    }

    // 3) Encerra a sessão no servidor.
    try {
        await supabase.auth.signOut();
    } catch { /* sessão já inválida após a exclusão */ }

    return NextResponse.json({ success: true });
}
