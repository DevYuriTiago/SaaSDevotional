import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateApplication } from "@/lib/ambassadors/apply";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inscrição pública de embaixador (landing /embaixadores) → status 'pending'.
// A curadoria é manual (Fatia 3): nada é aprovado automaticamente.
export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    // Honeypot: campo invisível para humanos. Bot preencheu → sucesso falso, sem gravar.
    if (typeof body.website === "string" && body.website.trim() !== "") {
        return NextResponse.json({ ok: true });
    }

    const result = validateApplication(body);
    if (!result.ok) {
        return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
    }

    const { error } = await admin.from("ambassadors").insert({
        ...result.data,
        status: "pending",
    });

    if (error) {
        // E-mail já inscrito → sucesso idempotente (não vaza quem já aplicou).
        if ((error as { code?: string }).code === "23505") {
            return NextResponse.json({ ok: true });
        }
        return NextResponse.json({ ok: false, error: "Não foi possível enviar agora." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
