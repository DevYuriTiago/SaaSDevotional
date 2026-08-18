import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, isAdminAuthed } from "@/lib/admin/auth";
import { uniqueSlug } from "@/lib/ambassadors/slug";
import { sendMail } from "@/lib/email/mailer";
import { approvalEmail, rejectionEmail } from "@/lib/email/templates";
import { appUrl } from "@/lib/app-url";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Body = { id?: string; action?: string; slug?: string };

/**
 * Decisão da curadoria. A autenticação é verificada AQUI: a tela do admin é
 * conveniência, a fronteira de segurança é a API.
 *
 * Aprovar gera o link /e/<slug>, que o motor de atribuição (Fatia 1) já sabe
 * creditar. O e-mail é o último passo e nunca desfaz a decisão: se falhar, a
 * resposta traz emailSent: false e o admin avisa a pessoa por outro caminho.
 */
export async function POST(request: NextRequest) {
    if (!isAdminAuthed(request.cookies.get(ADMIN_COOKIE)?.value)) {
        return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 });
    }

    const { id, action, slug } = (await request.json().catch(() => ({}))) as Body;

    if (!id || (action !== "approve" && action !== "reject")) {
        return NextResponse.json({ ok: false, error: "Requisição inválida" }, { status: 422 });
    }

    const { data: amb } = await admin
        .from("ambassadors")
        .select("id, name, email, status")
        .eq("id", id)
        .maybeSingle();

    if (!amb) {
        return NextResponse.json({ ok: false, error: "Inscrição não encontrada" }, { status: 404 });
    }
    if (amb.status !== "pending") {
        return NextResponse.json(
            { ok: false, error: "Esta inscrição já foi revisada." },
            { status: 409 }
        );
    }

    const baseUrl = appUrl();

    if (action === "reject") {
        await admin
            .from("ambassadors")
            .update({ status: "rejected", reviewed_at: new Date().toISOString() })
            .eq("id", id);

        const mail = rejectionEmail({ name: amb.name });
        const emailSent = amb.email
            ? await sendMail({ to: amb.email, ...mail })
            : false;

        return NextResponse.json({ ok: true, emailSent });
    }

    // Aprovar: slug único (o admin pode ter editado a sugestão) e link ativo.
    const finalSlug = await uniqueSlug(admin, slug || amb.name);

    const { error: linkErr } = await admin.from("ambassador_links").insert({
        ambassador_id: id,
        slug: finalSlug,
        destination: "/",
    });
    if (linkErr) {
        return NextResponse.json(
            { ok: false, error: "Não foi possível criar o link." },
            { status: 500 }
        );
    }

    await admin
        .from("ambassadors")
        .update({ status: "active", reviewed_at: new Date().toISOString() })
        .eq("id", id);

    const link = `${baseUrl}/e/${finalSlug}`;
    const mail = approvalEmail({ name: amb.name, link });
    const emailSent = amb.email ? await sendMail({ to: amb.email, ...mail }) : false;

    return NextResponse.json({ ok: true, slug: finalSlug, link, emailSent });
}
