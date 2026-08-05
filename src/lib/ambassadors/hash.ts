import { createHash } from "crypto";

// Salt de app (configurável por env). Mesmo sem env, hashear já pseudonimiza o IP
// para fins de LGPD; o salt evita reverso trivial por rainbow table.
const SALT = process.env.AMBASSADOR_IP_SALT ?? "humanah-embaixador-salt-v1";

/** SHA-256 hex de (SALT + ip). Retorna null para IP vazio. Nunca guarda o IP cru. */
export function hashIp(ip: string | null | undefined): string | null {
    if (!ip) return null;
    return createHash("sha256").update(SALT + ip).digest("hex");
}
