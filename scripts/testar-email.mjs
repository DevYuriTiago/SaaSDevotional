// Testa o envio por SMTP sem precisar aprovar ninguem de verdade.
//
//   node --env-file=.env.local scripts/testar-email.mjs seu@email.com
//
// O envio no app falha em silencio de proposito (para nunca travar uma
// aprovacao), entao este script existe para você ver o erro real do Zoho.

import nodemailer from "nodemailer";

const destino = process.argv[2];
if (!destino) {
    console.error("\nUso: node --env-file=.env.local scripts/testar-email.mjs seu@email.com\n");
    process.exit(1);
}

const { ZOHO_SMTP_USER: user, ZOHO_SMTP_PASSWORD: pass } = process.env;
const host = process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.com";
const port = Number(process.env.ZOHO_SMTP_PORT ?? 465);

if (!user || !pass) {
    console.error("\nFaltam ZOHO_SMTP_USER e/ou ZOHO_SMTP_PASSWORD no .env.local\n");
    process.exit(1);
}

console.log(`\nServidor : ${host}:${port}`);
console.log(`Conta    : ${user}`);
console.log(`Enviando para ${destino}...\n`);

const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 usa SSL direto; 587 usa STARTTLS
    auth: { user, pass },
});

try {
    // Verifica a conexao e a autenticacao antes de tentar enviar: separa
    // "credencial errada" de "mensagem rejeitada".
    await transport.verify();
    console.log("Conexao e autenticacao: OK");

    const info = await transport.sendMail({
        from: `"Humanáh" <${user}>`,
        to: destino,
        subject: "Teste de envio do Humanáh",
        text: "Se você recebeu isto, o SMTP do Zoho está configurado corretamente.",
        html: '<p style="font-family:Helvetica,Arial,sans-serif">Se você recebeu isto, o SMTP do Zoho está configurado corretamente.</p>',
    });

    console.log(`Enviado. ID da mensagem: ${info.messageId}`);
    console.log("\nConfira a caixa de entrada (e o spam) do destino.\n");
} catch (erro) {
    console.error("\nFALHOU:", erro.message);
    const m = String(erro.message);
    if (/auth/i.test(m)) {
        console.error("\nCausa provavel: senha de aplicativo incorreta, ou o usuario nao e o e-mail completo.");
    } else if (/ENOTFOUND|EAI_AGAIN/i.test(m)) {
        console.error(`\nCausa provavel: servidor "${host}" errado. Se voce acessa o Zoho por zoho.eu, use smtp.zoho.eu.`);
    } else if (/ETIMEDOUT|ECONNREFUSED/i.test(m)) {
        console.error("\nCausa provavel: porta bloqueada. Tente ZOHO_SMTP_PORT=587.");
    }
    process.exit(1);
}
