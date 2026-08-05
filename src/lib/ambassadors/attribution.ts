import type { SupabaseClient } from "@supabase/supabase-js";

export type AttachResult = { ok: boolean; already?: boolean; reason?: string };

/**
 * Grava a atribuição first-touch do usuário ao embaixador dono do link (hmnRef = link_id).
 * Idempotente: se já houver atribuição (ou corrida de UNIQUE), retorna already:true.
 * Guarda anti auto-promoção: embaixador não credita a si mesmo.
 */
export async function captureAttribution(
    admin: SupabaseClient,
    userId: string,
    hmnRef: string | null | undefined
): Promise<AttachResult> {
    if (!hmnRef) return { ok: false, reason: "sem cookie" };

    // Já atribuído? (UNIQUE(user_id) — first-touch)
    const { data: existing } = await admin
        .from("attributions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
    if (existing) return { ok: true, already: true };

    // Resolve o link ativo.
    const { data: link } = await admin
        .from("ambassador_links")
        .select("id, ambassador_id, active")
        .eq("id", hmnRef)
        .maybeSingle();
    if (!link || !link.active) return { ok: false, reason: "link inválido" };

    // Guarda anti auto-promoção.
    const { data: amb } = await admin
        .from("ambassadors")
        .select("user_id, status")
        .eq("id", link.ambassador_id)
        .maybeSingle();
    if (amb?.user_id && amb.user_id === userId) return { ok: false, reason: "auto-promoção" };

    const { error } = await admin.from("attributions").insert({
        user_id: userId,
        ambassador_id: link.ambassador_id,
        link_id: link.id,
    });
    if (error) {
        // Corrida: outro request atribuiu primeiro.
        if ((error as { code?: string }).code === "23505") return { ok: true, already: true };
        return { ok: false, reason: "erro ao gravar" };
    }
    return { ok: true };
}
