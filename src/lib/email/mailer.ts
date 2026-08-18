import nodemailer from "nodemailer";

/**
 * Envio de e-mail pelo SMTP do Zoho (caixa contato@humanah.app).
 * O domínio já tem SPF/DKIM no Zoho, o que ajuda na entregabilidade.
 *
 * Regra de robustez: e-mail NUNCA derruba a operação de negócio. Sem SMTP
 * configurado, ou em caso de falha no envio, a função retorna false e quem
 * chamou decide o que fazer (na curadoria, a aprovação segue valendo e a tela
 * oferece a mensagem para envio manual).
 */

export type MailInput = { to: string; subject: string; text: string; html: string };

function getTransport() {
    const user = process.env.ZOHO_SMTP_USER;
    const pass = process.env.ZOHO_SMTP_PASSWORD;
    if (!user || !pass) return null;

    // 587 (STARTTLS) e a porta padrao de submissao e a mais compativel: a 465
    // costuma ser interceptada por antivirus que fazem inspecao de TLS, o que
    // quebra a validacao do certificado.
    const port = Number(process.env.ZOHO_SMTP_PORT ?? 587);
    return nodemailer.createTransport({
        host: process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.com",
        port,
        secure: port === 465, // 465 = SSL direto; 587 = STARTTLS
        auth: { user, pass },
    });
}

export async function sendMail({ to, subject, text, html }: MailInput): Promise<boolean> {
    const transport = getTransport();
    if (!transport) {
        console.warn("[email] SMTP não configurado, envio pulado:", subject);
        return false;
    }

    try {
        await transport.sendMail({
            from: `"Humanáh" <${process.env.ZOHO_SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });
        return true;
    } catch (err) {
        console.error("[email] falha no envio:", err instanceof Error ? err.message : err);
        return false;
    }
}
