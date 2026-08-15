import type { SupabaseClient } from "@supabase/supabase-js";

/** O que o portal precisa saber do usuário logado. */
export type PortalUser = {
    id: string;
    email: string | null | undefined;
    email_confirmed_at: string | null | undefined;
};

export type PortalAmbassador = {
    id: string;
    name: string;
    slug: string | null;
    pixKey: string | null;
    donationPercent: number;
    donationTarget: string | null;
};

const SELECT = "id, name, user_id, pix_key, donation_percent, donation_target, ambassador_links(slug)";

type Row = {
    id: string;
    name: string;
    user_id: string | null;
    pix_key?: string | null;
    donation_percent?: number | null;
    donation_target?: string | null;
    ambassador_links?: { slug: string }[] | null;
};

function toPortal(row: Row): PortalAmbassador {
    return {
        id: row.id,
        name: row.name,
        slug: row.ambassador_links?.[0]?.slug ?? null,
        pixKey: row.pix_key ?? null,
        donationPercent: row.donation_percent ?? 0,
        donationTarget: row.donation_target ?? null,
    };
}

/**
 * Descobre qual embaixador pertence ao usuário logado.
 *
 * O embaixador não recebe conta pronta: ele se cadastra normalmente no app com
 * o mesmo e-mail da inscrição, e o vínculo acontece na primeira visita ao portal.
 *
 * Duas travas importantes:
 *  - o e-mail precisa estar CONFIRMADO, senão bastaria alguém se cadastrar com
 *    o e-mail alheio para assumir o portal (caso a confirmação esteja desligada
 *    no projeto Supabase);
 *  - uma inscrição já vinculada a outro usuário nunca é reatribuída.
 */
export async function resolveAmbassador(
    admin: SupabaseClient,
    user: PortalUser
): Promise<PortalAmbassador | null> {
    // Já vinculado: caminho normal de quem já entrou uma vez.
    const { data: linked } = await admin
        .from("ambassadors")
        .select(SELECT)
        .eq("user_id", user.id)
        .maybeSingle();

    if (linked) return toPortal(linked as Row);

    // Primeira visita: só com e-mail confirmado.
    if (!user.email || !user.email_confirmed_at) return null;

    const { data: byEmail } = await admin
        .from("ambassadors")
        .select(SELECT)
        .eq("status", "active")
        .ilike("email", user.email)
        .maybeSingle();

    if (!byEmail) return null;

    const row = byEmail as Row;
    if (row.user_id && row.user_id !== user.id) return null; // pertence a outra conta

    await admin.from("ambassadors").update({ user_id: user.id }).eq("id", row.id);
    return toPortal(row);
}
