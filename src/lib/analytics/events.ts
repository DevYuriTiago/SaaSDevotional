// =============================================================================
// Analytics de funil — eventos próprios gravados no Supabase.
// Best-effort: NUNCA lança erro nem bloqueia o fluxo principal.
// =============================================================================

import { createClient as createBrowserClient } from "@/lib/supabase/client";

export const EVENTS = {
    SIGNUP: "signup",
    DEVOTIONAL_GENERATED: "devotional_generated",
    PAYWALL_VIEWED: "paywall_viewed",
    CHECKOUT_STARTED: "checkout_started",
    SUBSCRIPTION_ACTIVATED: "subscription_activated",
    JOURNEY_STARTED: "journey_started",
} as const;

export type AnalyticsEvent = (typeof EVENTS)[keyof typeof EVENTS];

type Props = Record<string, unknown>;

// Cliente Supabase mínimo necessário para inserir (server ou browser/admin).
interface InsertableClient {
    from: (table: string) => { insert: (rows: Props) => unknown };
}

/**
 * Registra um evento. Funciona com o client do servidor (sessão do usuário)
 * ou o admin (service role). Falhas são engolidas — analytics nunca derruba
 * a requisição principal.
 */
export async function logEvent(
    supabase: InsertableClient,
    userId: string | null,
    event: AnalyticsEvent,
    props: Props = {}
): Promise<void> {
    try {
        await Promise.resolve(
            supabase.from("analytics_events").insert({ user_id: userId, event, props })
        );
    } catch {
        // silencioso de propósito
    }
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
const UTM_STORAGE = "sh_utm";

/**
 * Captura parâmetros UTM da URL atual e guarda no localStorage para serem
 * anexados a um evento de conversão posterior (ex.: signup). No-op no servidor.
 */
export function captureUtmFromUrl(): void {
    if (typeof window === "undefined") return;
    try {
        const params = new URLSearchParams(window.location.search);
        const utm: Props = {};
        for (const k of UTM_KEYS) {
            const v = params.get(k);
            if (v) utm[k] = v;
        }
        if (Object.keys(utm).length > 0) {
            localStorage.setItem(UTM_STORAGE, JSON.stringify(utm));
        }
    } catch {
        // ignora
    }
}

/** Recupera os UTM persistidos (se houver). */
export function getStoredUtm(): Props {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(UTM_STORAGE);
        return raw ? (JSON.parse(raw) as Props) : {};
    } catch {
        return {};
    }
}

/**
 * Versão client-side: usa o browser client e injeta o user atual.
 * Para eventos disparados na UI (ex.: paywall_viewed, signup).
 */
export async function track(event: AnalyticsEvent, props: Props = {}): Promise<void> {
    try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("analytics_events").insert({
            user_id: user?.id ?? null,
            event,
            props,
        });
    } catch {
        // silencioso de propósito
    }
}
