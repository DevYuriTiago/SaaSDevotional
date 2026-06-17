// =============================================================================
// Premium efetivo = assinatura Stripe ativa (subscription_tier === "premium")
// OU premium temporário vigente (premium_until no futuro — vindo de referral).
// =============================================================================

export interface PremiumFields {
    subscription_tier?: string | null;
    premium_until?: string | null;
}

/** Usuário tem acesso premium agora (assinatura OU premium temporário)? */
export function isPremium(profile: PremiumFields | null | undefined): boolean {
    if (!profile) return false;
    if (profile.subscription_tier === "premium") return true;
    if (profile.premium_until) {
        return new Date(profile.premium_until).getTime() > Date.now();
    }
    return false;
}

/** Assinante pagante de verdade (Stripe) — para mostrar o portal de billing. */
export function isPaidSubscriber(profile: PremiumFields | null | undefined): boolean {
    return profile?.subscription_tier === "premium";
}

/**
 * Calcula o novo premium_until ao conceder `days` de premium, empilhando
 * sobre o tempo restante (max(agora, atual) + days).
 */
export function extendPremiumUntil(current: string | null | undefined, days: number): string {
    const base = current && new Date(current).getTime() > Date.now()
        ? new Date(current).getTime()
        : Date.now();
    return new Date(base + days * 86400000).toISOString();
}
