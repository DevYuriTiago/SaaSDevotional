import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
    // Atalho de desenvolvimento: NUNCA disponível em produção, mesmo que
    // MASTER_MODE vaze para o ambiente. Evita auto-promoção a premium.
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    if (process.env.MASTER_MODE !== "true") {
        return NextResponse.json({ error: "Não disponível" }, { status: 403 });
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await admin
        .from("profiles")
        .update({ subscription_tier: "premium", devotionals_used: 0 })
        .eq("id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        ok: true,
        message: `Usuário ${user.email} promovido a premium. Recarregue o app.`,
    });
}
