/**
 * Textos dos e-mails da curadoria de embaixadores.
 * Funções puras (sem I/O) para serem testáveis e para o conteúdo ficar num
 * lugar só. Regra de copy da marca: nada de travessão no texto visível.
 */

export type EmailContent = { subject: string; text: string; html: string };

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://humanah.app";

function firstName(name: string): string {
    return (name ?? "").trim().split(/\s+/)[0] || "amigo";
}

/** Envolve o corpo num HTML sóbrio, na paleta da marca. */
function layout(body: string): string {
    return `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:0;background:#0B0B12;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B12;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#13111D;border:1px solid rgba(247,201,122,0.14);border-radius:20px;padding:36px 32px;font-family:Helvetica,Arial,sans-serif;color:#D9D2C2;line-height:1.65;">
${body}
<tr><td style="padding-top:28px;border-top:1px solid rgba(247,201,122,0.12);color:#9E97AC;font-size:12px;">
Humanáh · <a href="${BASE}" style="color:#F7C97A;text-decoration:none;">humanah.app</a>
</td></tr>
</table>
</td></tr></table></body></html>`;
}

export function approvalEmail({ name, link }: { name: string; link: string }): EmailContent {
    const nome = firstName(name);
    const subject = "Sua inscrição foi aprovada, bem-vindo ao Programa de Embaixadores";

    const text = `${nome}, que alegria ter você conosco.

Sua inscrição no Programa de Embaixadores Humanáh foi aprovada. Lemos a sua história com atenção e acreditamos que a sua voz vai alcançar muita gente.

Este é o seu link exclusivo:
${link}

Cada pessoa que se cadastrar por ele fica ligada a você de forma automática e definitiva. Quando ela assinar, a sua comissão passa a cair todo mês, enquanto a assinatura permanecer ativa.

Como começar:
1. Compartilhe o link na sua bio, nos stories e onde a sua comunidade estiver.
2. Fale do que o Humanáh fez por você. Testemunho pessoal alcança mais do que anúncio.
3. Qualquer dúvida, é só responder este e-mail.

Que Deus multiplique cada semente.

Equipe Humanáh
${BASE}`;

    const html = layout(`
<tr><td>
<p style="margin:0 0 18px;font-size:22px;color:#FBF7E6;">${nome}, que alegria ter você conosco.</p>
<p style="margin:0 0 18px;">Sua inscrição no <strong style="color:#FBF7E6;">Programa de Embaixadores Humanáh</strong> foi aprovada. Lemos a sua história com atenção e acreditamos que a sua voz vai alcançar muita gente.</p>
<p style="margin:0 0 10px;">Este é o seu link exclusivo:</p>
<p style="margin:0 0 24px;"><a href="${link}" style="display:inline-block;background:#F7C97A;color:#2A1E08;font-weight:bold;text-decoration:none;padding:14px 26px;border-radius:999px;">${link}</a></p>
<p style="margin:0 0 18px;">Cada pessoa que se cadastrar por ele fica ligada a você de forma automática e definitiva. Quando ela assinar, a sua comissão passa a cair todo mês, enquanto a assinatura permanecer ativa.</p>
<p style="margin:0 0 8px;color:#FBF7E6;"><strong>Como começar</strong></p>
<p style="margin:0 0 6px;">1. Compartilhe o link na sua bio, nos stories e onde a sua comunidade estiver.</p>
<p style="margin:0 0 6px;">2. Fale do que o Humanáh fez por você. Testemunho pessoal alcança mais do que anúncio.</p>
<p style="margin:0 0 18px;">3. Qualquer dúvida, é só responder este e-mail.</p>
<p style="margin:0;font-style:italic;color:#F7C97A;">Que Deus multiplique cada semente.</p>
</td></tr>`);

    return { subject, text, html };
}

export function rejectionEmail({ name }: { name: string }): EmailContent {
    const nome = firstName(name);
    const subject = "Sobre a sua inscrição no Programa de Embaixadores";

    const text = `${nome}, obrigado por se inscrever.

Lemos a sua inscrição no Programa de Embaixadores Humanáh com carinho. Neste momento não vamos seguir com a sua participação, mas isso não diz nada sobre o seu valor ou o seu chamado. O grupo é pequeno e escolhemos poucos perfis por vez.

Você pode se inscrever de novo mais para frente. Ficaremos felizes em reavaliar.

Que a Palavra continue frutificando na sua caminhada.

Equipe Humanáh
${BASE}`;

    const html = layout(`
<tr><td>
<p style="margin:0 0 18px;font-size:22px;color:#FBF7E6;">${nome}, obrigado por se inscrever.</p>
<p style="margin:0 0 18px;">Lemos a sua inscrição no Programa de Embaixadores Humanáh com carinho. Neste momento não vamos seguir com a sua participação, mas isso não diz nada sobre o seu valor ou o seu chamado. O grupo é pequeno e escolhemos poucos perfis por vez.</p>
<p style="margin:0 0 18px;">Você pode se inscrever de novo mais para frente. Ficaremos felizes em reavaliar.</p>
<p style="margin:0;font-style:italic;color:#F7C97A;">Que a Palavra continue frutificando na sua caminhada.</p>
</td></tr>`);

    return { subject, text, html };
}
