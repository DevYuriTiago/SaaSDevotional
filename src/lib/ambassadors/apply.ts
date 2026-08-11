/**
 * Validação pura do formulário de inscrição de embaixador (landing /embaixadores).
 * Separada da rota para ser testável sem mock de rede/banco.
 */

export const SOCIAL_PLATFORMS = ["instagram", "youtube", "tiktok", "outro"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type ApplicationData = {
    name: string;
    email: string;
    whatsapp: string;
    social_platform: SocialPlatform;
    social_handle: string;
    followers_count: number;
    church: string | null;
    testimony: string;
    promotion_plan: string | null;
};

export type ValidationResult =
    | { ok: true; data: ApplicationData }
    | { ok: false; errors: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateApplication(body: Record<string, unknown>): ValidationResult {
    const errors: Record<string, string> = {};
    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

    const name = str(body.name);
    if (name.length < 2) errors.name = "Informe seu nome.";

    const email = str(body.email).toLowerCase();
    if (!EMAIL_RE.test(email)) errors.email = "E-mail inválido.";

    const whatsapp = str(body.whatsapp);
    if (whatsapp.replace(/\D/g, "").length < 10) errors.whatsapp = "WhatsApp inválido (inclua o DDD).";

    const social_platform = str(body.social_platform) as SocialPlatform;
    if (!SOCIAL_PLATFORMS.includes(social_platform)) errors.social_platform = "Escolha sua plataforma principal.";

    const social_handle = str(body.social_handle);
    if (social_handle.length < 2) errors.social_handle = "Informe seu @ ou canal.";

    const followers_count =
        typeof body.followers_count === "number" ? body.followers_count : Number.NaN;
    if (!Number.isFinite(followers_count) || followers_count < 0 || !Number.isInteger(followers_count)) {
        errors.followers_count = "Informe seu número de seguidores.";
    }

    const testimony = str(body.testimony);
    if (testimony.length < 20) errors.testimony = "Conte um pouco mais da sua caminhada (mínimo 20 caracteres).";

    if (Object.keys(errors).length > 0) return { ok: false, errors };

    return {
        ok: true,
        data: {
            name,
            email,
            whatsapp,
            social_platform,
            social_handle,
            followers_count,
            church: str(body.church) || null,
            testimony,
            promotion_plan: str(body.promotion_plan) || null,
        },
    };
}
