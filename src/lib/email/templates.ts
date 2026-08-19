import { appUrl } from "@/lib/app-url";

/**
 * Textos dos e-mails da curadoria de embaixadores.
 * Funções puras (sem I/O) para serem testáveis e para o conteúdo ficar num
 * lugar só. Regra de copy da marca: nada de travessão no texto visível.
 *
 * O HTML usa tabelas e estilo inline porque cliente de e-mail não suporta
 * folha de estilo externa, flexbox nem grid de forma confiável.
 */

export type EmailContent = { subject: string; text: string; html: string };

const BASE = appUrl();
const DOMINIO = BASE.replace(/^https?:\/\//, "");

const OURO = "#F7C97A";
const OURO_CLARO = "#FBE3B0";
const CREME = "#FBF7E6";
const TEXTO = "#D9D2C2";
const APAGADO = "#9E97AC";
const NOITE = "#0B0B12";
const PAINEL = "#13111D";
const BORDA = "rgba(247,201,122,0.14)";
const FONTE = "Helvetica, Arial, sans-serif";

function firstName(name: string): string {
    return (name ?? "").trim().split(/\s+/)[0] || "amigo";
}

/** Moldura comum: fundo escuro, painel central e rodapé da marca. */
function layout(body: string): string {
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:${NOITE};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NOITE};padding:28px 14px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${PAINEL};border:1px solid ${BORDA};border-radius:20px;font-family:${FONTE};color:${TEXTO};line-height:1.65;">

<tr><td style="padding:34px 32px 0;text-align:center;">
  <img src="${BASE}/new-icon.png" width="52" height="52" alt="" style="display:block;margin:0 auto 10px;border-radius:12px;">
  <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${OURO};">Programa de Embaixadores</p>
</td></tr>

${body}

<tr><td style="padding:26px 32px 32px;border-top:1px solid ${BORDA};">
  <p style="margin:0 0 6px;font-size:12px;color:${APAGADO};">
    Dúvidas? É só responder este e-mail, uma pessoa lê e te responde.
  </p>
  <p style="margin:0;font-size:12px;color:${APAGADO};">
    Humanáh · <a href="${BASE}" style="color:${OURO};text-decoration:none;">${DOMINIO}</a>
  </p>
</td></tr>

</table>
</td></tr></table></body></html>`;
}

/** Item numerado das regras: título em creme e explicação em cinza. */
function regra(n: number, titulo: string, texto: string): string {
    return `<tr>
  <td width="26" valign="top" style="padding:0 0 14px;font-family:${FONTE};font-size:13px;color:${OURO};font-weight:bold;">${n}.</td>
  <td valign="top" style="padding:0 0 14px;font-family:${FONTE};font-size:13px;line-height:1.6;color:${TEXTO};">
    <strong style="color:${CREME};">${titulo}</strong> ${texto}
  </td>
</tr>`;
}

/** Passo numerado das instruções de acesso. */
function passo(n: number, conteudo: string): string {
    return `<tr>
  <td width="26" valign="top" style="padding:0 0 12px;font-family:${FONTE};font-size:13px;color:${OURO};font-weight:bold;">${n}.</td>
  <td valign="top" style="padding:0 0 12px;font-family:${FONTE};font-size:13px;line-height:1.6;color:${TEXTO};">${conteudo}</td>
</tr>`;
}

export function approvalEmail({ name, link }: { name: string; link: string }): EmailContent {
    const nome = firstName(name);
    const subject = "Sua inscrição foi aprovada, bem-vindo ao Programa de Embaixadores";

    const text = `${nome}, que alegria ter você conosco.

Sua inscrição no Programa de Embaixadores Humanáh foi aprovada. Lemos a sua história com atenção e acreditamos que a sua voz vai alcançar muita gente.

SEU LINK EXCLUSIVO
${link}

Quem se cadastrar por ele fica ligado a você de forma automática e definitiva.

COMO ACESSAR O SEU PORTAL
1. Crie a sua conta em ${BASE}/signup usando ESTE MESMO e-mail. É por ele que reconhecemos você como embaixador.
2. Confirme o e-mail no link que a plataforma enviar.
3. Entre em ${BASE}/embaixador. Lá estão o seu QR code, os cards prontos para postar, as legendas sugeridas e os seus resultados ao vivo.

Cadastre a sua chave Pix no portal. Sem ela não conseguimos te pagar quando a comissão for liberada. Se preferir, você pode destinar parte ou todo o valor para a sua igreja, e nós separamos no momento do pagamento.

COMO VOCÊ RECEBE
Você começa no nível Bronze, com 5% sobre cada assinatura que trouxer. A porcentagem sobe conforme o número de assinantes, até 30% no nível Maná, e o nível nunca cai depois de conquistado.
A comissão é recorrente: cai de novo a cada renovação, enquanto a assinatura estiver ativa. Cada valor é confirmado após a garantia de 7 dias prevista em lei, e o pagamento é por Pix.

O QUE ESPERAMOS DE VOCÊ
O nome da Humanáh vai junto do seu. Estes combinados existem para proteger os dois.

1. Fale do que você viveu. Divulgue a partir da sua experiência real. Não prometa cura, milagre ou ganho financeiro como resultado do uso, e não apresente o Humanáh como substituto de igreja, de acompanhamento pastoral ou de tratamento de saúde.
2. Deixe claro que é uma parceria. Ao publicar, sinalize que você é embaixador e recebe comissão. Além de ser exigência da lei de publicidade, é o que preserva a confiança de quem te ouve.
3. Não use o nome da Humanáh em disputa. Nada de política partidária, ataque a outras igrejas, denominações ou líderes junto da marca ou do seu link.
4. Divulgue com respeito. Sem disparo em massa para quem não pediu, sem grupos de spam, sem robôs e sem compra de seguidores.
5. Você é embaixador, não porta-voz. Não crie perfis com o nome da marca nem responda como se fosse a nossa equipe.
6. Isto não é rede de indicação. Você ganha pelas assinaturas que traz, nunca por recrutar outros divulgadores. Não prometa ganhos a ninguém em nome do programa.

Se algo aqui for descumprido, podemos suspender a participação. Nesse caso o link para de gerar novas comissões, mas tudo o que você já tiver conquistado continua sendo seu e será pago normalmente.

Que Deus multiplique cada semente.

Equipe Humanáh
${BASE}`;

    const html = layout(`
<tr><td style="padding:22px 32px 0;">
  <h1 style="margin:0 0 14px;font-size:26px;line-height:1.25;font-weight:normal;color:${CREME};">
    ${nome}, que alegria ter você conosco.
  </h1>
  <p style="margin:0 0 18px;font-size:15px;">
    Sua inscrição foi <strong style="color:${CREME};">aprovada</strong>. Lemos a sua história com atenção e
    acreditamos que a sua voz vai alcançar muita gente.
  </p>
</td></tr>

<tr><td style="padding:6px 32px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(247,201,122,0.06);border:1px solid rgba(247,201,122,0.28);border-radius:16px;">
    <tr><td style="padding:20px 22px;text-align:center;">
      <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${APAGADO};">seu link exclusivo</p>
      <a href="${link}" style="display:inline-block;background:${OURO};color:#2A1E08;font-weight:bold;font-size:15px;text-decoration:none;padding:13px 26px;border-radius:999px;">${link.replace(/^https?:\/\//, "")}</a>
      <p style="margin:13px 0 0;font-size:12px;color:${APAGADO};line-height:1.55;">
        Quem se cadastrar por ele fica ligado a você de forma definitiva.
      </p>
    </td></tr>
  </table>
</td></tr>

<tr><td style="padding:28px 32px 0;">
  <p style="margin:0 0 14px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${OURO};">como acessar o seu portal</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${passo(1, `Crie a sua conta em <a href="${BASE}/signup" style="color:${OURO};">${DOMINIO}/signup</a> usando <strong style="color:${CREME};">este mesmo e-mail</strong>. É por ele que reconhecemos você como embaixador.`)}
    ${passo(2, "Confirme o e-mail no link que a plataforma enviar.")}
    ${passo(3, `Entre em <a href="${BASE}/embaixador" style="color:${OURO};">${DOMINIO}/embaixador</a>. Lá estão o seu QR code, os cards prontos para postar, as legendas sugeridas e os seus resultados ao vivo.`)}
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(224,151,90,0.08);border:1px solid rgba(224,151,90,0.25);border-radius:12px;">
    <tr><td style="padding:14px 16px;font-family:${FONTE};font-size:13px;line-height:1.6;color:${TEXTO};">
      <strong style="color:${CREME};">Cadastre a sua chave Pix no portal.</strong> Sem ela não conseguimos te pagar
      quando a comissão for liberada. Se preferir, você pode destinar parte ou todo o valor para a sua igreja,
      e nós separamos no momento do pagamento.
    </td></tr>
  </table>
</td></tr>

<tr><td style="padding:26px 32px 0;">
  <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${OURO};">como você recebe</p>
  <p style="margin:0 0 10px;font-size:13px;line-height:1.6;">
    Você começa no nível <strong style="color:${CREME};">Bronze, com 5%</strong> sobre cada assinatura que trouxer.
    A porcentagem sobe conforme o número de assinantes, até <strong style="color:${OURO};">30% no nível Maná</strong>,
    e o nível nunca cai depois de conquistado.
  </p>
  <p style="margin:0;font-size:13px;line-height:1.6;">
    A comissão é <strong style="color:${CREME};">recorrente</strong>: cai de novo a cada renovação, enquanto a
    assinatura estiver ativa. Cada valor é confirmado após a garantia de 7 dias prevista em lei, e o pagamento é por Pix.
  </p>
</td></tr>

<tr><td style="padding:26px 32px 0;">
  <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${OURO};">o que esperamos de você</p>
  <p style="margin:0 0 16px;font-size:13px;color:${APAGADO};line-height:1.6;">
    O nome da Humanáh vai junto do seu. Estes combinados existem para proteger os dois.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${regra(1, "Fale do que você viveu.", "Divulgue a partir da sua experiência real. Não prometa cura, milagre ou ganho financeiro como resultado do uso, e não apresente o Humanáh como substituto de igreja, de acompanhamento pastoral ou de tratamento de saúde.")}
    ${regra(2, "Deixe claro que é uma parceria.", "Ao publicar, sinalize que você é embaixador e recebe comissão. Além de ser exigência da lei de publicidade, é o que preserva a confiança de quem te ouve.")}
    ${regra(3, "Não use o nome da Humanáh em disputa.", "Nada de política partidária, ataque a outras igrejas, denominações ou líderes junto da marca ou do seu link.")}
    ${regra(4, "Divulgue com respeito.", "Sem disparo em massa para quem não pediu, sem grupos de spam, sem robôs e sem compra de seguidores.")}
    ${regra(5, "Você é embaixador, não porta-voz.", "Não crie perfis com o nome da marca nem responda como se fosse a nossa equipe.")}
    ${regra(6, "Isto não é rede de indicação.", "Você ganha pelas assinaturas que traz, nunca por recrutar outros divulgadores. Não prometa ganhos a ninguém em nome do programa.")}
  </table>
  <p style="margin:2px 0 0;font-size:12px;color:${APAGADO};line-height:1.6;">
    Se algo aqui for descumprido, podemos suspender a participação. Nesse caso o link para de gerar novas
    comissões, mas tudo o que você já tiver conquistado continua sendo seu e será pago normalmente.
  </p>
</td></tr>

<tr><td style="padding:26px 32px 30px;">
  <p style="margin:0;font-size:15px;font-style:italic;color:${OURO_CLARO};">
    Que Deus multiplique cada semente.
  </p>
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
<tr><td style="padding:22px 32px 30px;">
  <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:normal;color:${CREME};">
    ${nome}, obrigado por se inscrever.
  </h1>
  <p style="margin:0 0 16px;font-size:15px;">
    Lemos a sua inscrição com carinho. Neste momento não vamos seguir com a sua participação,
    mas isso não diz nada sobre o seu valor ou o seu chamado. O grupo é pequeno e escolhemos
    poucos perfis por vez.
  </p>
  <p style="margin:0 0 18px;font-size:15px;">
    Você pode se inscrever de novo mais para frente. Ficaremos felizes em reavaliar.
  </p>
  <p style="margin:0;font-size:15px;font-style:italic;color:${OURO_CLARO};">
    Que a Palavra continue frutificando na sua caminhada.
  </p>
</td></tr>`);

    return { subject, text, html };
}
