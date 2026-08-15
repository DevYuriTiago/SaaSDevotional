import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { resolveAmbassador } from "@/lib/ambassadors/portal";
import { validatePaymentPrefs } from "@/lib/ambassadors/payment";

const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * O embaixador salva a própria chave Pix e a preferência de doação.
 *
 * Só altera o cadastro que pertence ao usuário logado: o id vem de
 * resolveAmbassador, nunca do corpo da requisição, senão qualquer pessoa
 * poderia trocar a chave Pix de outro embaixador e desviar o pagamento.
 */
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 });

    const ambassador = await resolveAmbassador(admin, {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
    });
    if (!ambassador) {
        return NextResponse.json({ ok: false, error: "Você não é embaixador." }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const result = validatePaymentPrefs(body);
    if (!result.ok) {
        return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
    }

    const { error } = await admin
        .from("ambassadors")
        .update({ ...result.data, payment_updated_at: new Date().toISOString() })
        .eq("id", ambassador.id);

    if (error) {
        return NextResponse.json({ ok: false, error: "Não foi possível salvar." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
