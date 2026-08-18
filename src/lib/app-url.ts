/**
 * URL pública canônica do app.
 *
 * Existe porque `NEXT_PUBLIC_APP_URL` alimenta coisas que quebram o negócio
 * quando estão erradas: o link do embaixador, o retorno do checkout do Stripe,
 * o sitemap e as imagens de compartilhamento. Um valor inválido na Vercel
 * derrubava tudo isso em silêncio, sem erro nem log.
 *
 * A checagem é simples de propósito: domínio público de verdade tem pelo menos
 * um ponto. Valores de placeholder como "temp" não têm, e caem no domínio real
 * em vez de virar link quebrado. Endereços locais continuam válidos para
 * desenvolvimento.
 */

const FALLBACK = "https://humanah.app";

export function appUrl(): string {
    const raw = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim();
    if (!raw) return FALLBACK;

    try {
        const url = new URL(raw);
        const host = url.hostname;
        const local = host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");

        if (!local && !host.includes(".")) return FALLBACK;

        // origin normaliza barra no fim, evitando montar "https://site//e/slug"
        return url.origin;
    } catch {
        return FALLBACK;
    }
}
