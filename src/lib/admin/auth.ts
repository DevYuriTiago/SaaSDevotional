import { createHmac, timingSafeEqual } from "crypto";

/**
 * Acesso ao painel admin por senha única (ADMIN_SECRET).
 *
 * Dois cuidados que valem a pena mesmo num esquema simples:
 *  1. a senha nunca vai para o navegador: o cookie guarda um token DERIVADO
 *     (HMAC do segredo), então vazar o cookie não vaza a senha;
 *  2. comparações em tempo constante, para não dar pistas por timing.
 * Sem ADMIN_SECRET configurado, tudo é negado (fail-closed).
 */

export const ADMIN_COOKIE = "hmn_admin";

/** Token guardado no cookie: HMAC-SHA256 do segredo com rótulo fixo. */
export function deriveAdminToken(secret: string): string {
    return createHmac("sha256", secret).update("humanah-admin-v1").digest("hex");
}

/** Compara duas strings em tempo constante, tolerando comprimentos diferentes. */
function safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    // timingSafeEqual exige buffers do mesmo tamanho. Comparar sempre o mesmo
    // número de bytes evita que o comprimento vire um canal lateral.
    if (bufA.length !== bufB.length) {
        timingSafeEqual(bufA, bufA);
        return false;
    }
    return timingSafeEqual(bufA, bufB);
}

/** A senha digitada confere com ADMIN_SECRET? */
export function verifyAdminSecret(input: string): boolean {
    const secret = process.env.ADMIN_SECRET;
    if (!secret || !input) return false;
    return safeEqual(input, secret);
}

/** O cookie apresentado corresponde ao ADMIN_SECRET atual? */
export function isAdminAuthed(cookieValue?: string | null): boolean {
    const secret = process.env.ADMIN_SECRET;
    if (!secret || !cookieValue) return false;
    return safeEqual(cookieValue, deriveAdminToken(secret));
}
