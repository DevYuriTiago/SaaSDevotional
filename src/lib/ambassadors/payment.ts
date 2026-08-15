/**
 * Dados de pagamento do embaixador: chave Pix e preferência de doação.
 *
 * A chave é preenchida pelo próprio embaixador no portal, não pelo admin.
 * Quem é dono do dado é quem digita: elimina erro de transcrição num campo em
 * que errar significa mandar dinheiro para a pessoa errada.
 */

export type PaymentInput = {
    pixKey?: unknown;
    donationPercent?: unknown;
    donationTarget?: unknown;
};

export type PaymentData = {
    pix_key: string;
    donation_percent: number;
    donation_target: string | null;
};

export type PaymentValidation =
    | { ok: true; data: PaymentData }
    | { ok: false; errors: Record<string, string> };

export function validatePaymentPrefs(input: PaymentInput): PaymentValidation {
    const errors: Record<string, string> = {};
    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

    // O Pix aceita CPF, CNPJ, telefone, e-mail e chave aleatória. Tentar
    // adivinhar o formato só serviria para recusar chave válida de gente real,
    // então validamos apenas que existe algo plausível.
    const pix = str(input.pixKey);
    if (pix.length < 5) errors.pixKey = "Informe a sua chave Pix.";
    if (pix.length > 140) errors.pixKey = "Chave Pix longa demais.";

    const percent = typeof input.donationPercent === "number" ? input.donationPercent : Number.NaN;
    if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
        errors.donationPercent = "A doação precisa ser um valor de 0 a 100.";
    }

    const target = str(input.donationTarget);
    if (Number.isInteger(percent) && percent > 0 && target.length < 2) {
        errors.donationTarget = "Diga para qual igreja ou ministério vai a doação.";
    }

    if (Object.keys(errors).length > 0) return { ok: false, errors };

    return {
        ok: true,
        data: {
            pix_key: pix,
            donation_percent: percent,
            // Sem doação, o destino não faz sentido e não fica sobrando do que
            // foi preenchido antes.
            donation_target: percent > 0 ? target : null,
        },
    };
}

/** Divide a comissão entre o embaixador e a doação escolhida por ele. */
export function splitDonation(amountCents: number, donationPercent: number) {
    const donation = Math.round(amountCents * (donationPercent / 100));
    return { donationCents: donation, ambassadorCents: amountCents - donation };
}
