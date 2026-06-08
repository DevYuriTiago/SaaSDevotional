import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    // Proteção por secret key
    const auth = request.headers.get("authorization");
    const secret = process.env.ADMIN_SECRET;

    if (!secret || auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json() as { email?: string; revoke?: boolean };
    const { email, revoke = false } = body;

    if (!email) {
        return NextResponse.json({ error: "email obrigatório" }, { status: 400 });
    }

    // Buscar usuário pelo email
    const { data: { users }, error: listErr } = await admin.auth.admin.listUsers();
    if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });

    const user = users.find(u => u.email === email);
    if (!user) {
        return NextResponse.json({ error: `Usuário ${email} não encontrado. Ele precisa se cadastrar primeiro.` }, { status: 404 });
    }

    const tier = revoke ? "free" : "premium";

    const { error: updateErr } = await admin
        .from("profiles")
        .update({ subscription_tier: tier })
        .eq("id", user.id);

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({
        success: true,
        email,
        tier,
        message: revoke
            ? `${email} rebaixado para free.`
            : `${email} agora é premium. 🎉`,
    });
}
