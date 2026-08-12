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
