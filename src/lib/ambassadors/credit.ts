import type { SupabaseClient } from "@supabase/supabase-js";

export type CreditParams = {
    userId: string;
    invoiceId: string | null;
    grossCents: number | null;
    currency: string;
    eventType: string;
};
export type CreditResult = { credited: boolean; reason?: string };

/**
 * Registra 1 conversão (fatura paga) creditada ao embaixador que trouxe o usuário.
 * Não calcula comissão — guarda o bruto. Idempotente por UNIQUE(stripe_invoice_id).
 */
export async function creditAmbassador(
    admin: SupabaseClient,
    { userId, invoiceId, grossCents, currency, eventType }: CreditParams
): Promise<CreditResult> {
    if (!invoiceId) return { credited: false, reason: "sem invoice" };

    const { data: attr } = await admin
        .from("attributions")
        .select("ambassador_id")
        .eq("user_id", userId)
        .maybeSingle();
    if (!attr) return { credited: false, reason: "orgânico" };

    const { data: amb } = await admin
        .from("ambassadors")
        .select("user_id, status")
        .eq("id", attr.ambassador_id)
        .maybeSingle();
    if (amb?.status === "suspended") return { credited: false, reason: "suspenso" };
    if (amb?.user_id && amb.user_id === userId) return { credited: false, reason: "auto-compra" };

    const { error } = await admin.from("conversions").insert({
        ambassador_id: attr.ambassador_id,
        user_id: userId,
        stripe_invoice_id: invoiceId,
        stripe_event_type: eventType,
        gross_amount_cents: grossCents ?? 0,
        currency,
        status: "pending",
    });
    if (error) {
        if ((error as { code?: string }).code === "23505") return { credited: false, reason: "já creditado" };
        return { credited: false, reason: "erro ao gravar" };
    }
    return { credited: true };
}
