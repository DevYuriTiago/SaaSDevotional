// PATH: src/__tests__/unit/email-templates.test.ts

import { approvalEmail, rejectionEmail } from "@/lib/email/templates";

const LINK = "https://humanah.app/e/pastorjoao";

describe("approvalEmail", () => {
  const mail = approvalEmail({ name: "Pastor João Silva", link: LINK });

  it("trata a pessoa pelo primeiro nome", () => {
    expect(mail.text).toContain("Pastor,");
    expect(mail.html).toContain("Pastor,");
  });

  it("traz o link exclusivo nas duas versões", () => {
    expect(mail.text).toContain(LINK);
    expect(mail.html).toContain(LINK);
  });

  it("tem assunto que deixa claro o resultado", () => {
    expect(mail.subject.toLowerCase()).toContain("aprovada");
  });

  it("não usa travessão (regra de copy da marca)", () => {
    expect(mail.text).not.toContain("—");
    expect(mail.html).not.toContain("—");
    expect(mail.subject).not.toContain("—");
  });

it("ensina como acessar o portal, incluindo o mesmo e-mail", () => {
    // Sem conta criada na aprovacao, esta instrucao e a peca que destrava o
    // acesso: cadastrar-se com o MESMO e-mail e o que liga a pessoa ao portal.
    expect(mail.text).toContain("/signup");
    expect(mail.text).toContain("/embaixador");
    expect(mail.text.toUpperCase()).toContain("MESMO E-MAIL");
    expect(mail.html).toContain("/signup");
    expect(mail.html).toContain("/embaixador");
  });

  it("avisa que a chave Pix precisa ser cadastrada", () => {
    for (const versao of [mail.text, mail.html]) {
      expect(versao).toContain("Pix");
    }
  });

  it("explica o nivel inicial e o teto da comissao", () => {
    expect(mail.text).toContain("Bronze");
    expect(mail.text).toContain("5%");
    expect(mail.text).toContain("30%");
    expect(mail.html).toContain("Bronze");
  });

  it("traz as regras que protegem a marca", () => {
    const t = mail.text.toLowerCase();
    // as protecoes que mais importam: promessa indevida, publicidade oculta,
    // uso politico, spam, personificacao e aparencia de piramide
    expect(t).toContain("cura");
    expect(t).toContain("substituto de igreja");
    expect(t).toContain("recebe comissão");
    expect(t).toContain("política partidária");
    expect(t).toContain("spam");
    expect(t).toContain("porta-voz");
    expect(t).toContain("rede de indicação");
  });

  it("diz o que acontece se as regras forem descumpridas, sem confiscar o ganho", () => {
    expect(mail.text).toContain("suspender");
    expect(mail.text.toLowerCase()).toContain("continua sendo seu");
  });

  it("o HTML usa tabela e estilo inline (cliente de e-mail nao suporta css externo)", () => {
    expect(mail.html).toContain("<table");
    expect(mail.html).toContain("style=");
    expect(mail.html).not.toContain("<link");
    expect(mail.html).not.toContain("</style>");
  });

  it("as imagens usam URL absoluta, senao nao carregam no cliente", () => {
    const imgs = mail.html.match(/<img[^>]+src="([^"]+)"/g) ?? [];
    for (const img of imgs) {
      expect(img).toMatch(/src="https?:\/\//);
    }
  });

  it("nome vazio não quebra o texto", () => {
    const m = approvalEmail({ name: "", link: LINK });
    expect(m.text).toContain("amigo");
  });
});

describe("rejectionEmail", () => {
  const mail = rejectionEmail({ name: "Maria Souza" });

  it("trata pelo primeiro nome e não expõe o link", () => {
    expect(mail.text).toContain("Maria,");
    expect(mail.text).not.toContain("/e/");
  });

  it("não usa travessão", () => {
    expect(mail.text).not.toContain("—");
    expect(mail.html).not.toContain("—");
  });

  it("mantém a porta aberta para nova inscrição", () => {
    expect(mail.text.toLowerCase()).toContain("de novo");
  });
});
