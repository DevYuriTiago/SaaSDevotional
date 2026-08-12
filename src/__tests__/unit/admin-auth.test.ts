// PATH: src/__tests__/unit/admin-auth.test.ts

import { deriveAdminToken, verifyAdminSecret, isAdminAuthed } from "@/lib/admin/auth";

describe("deriveAdminToken", () => {
  it("é determinístico e não devolve o segredo cru", () => {
    const t = deriveAdminToken("senha-super-secreta");
    expect(t).toBe(deriveAdminToken("senha-super-secreta"));
    expect(t).not.toContain("senha-super-secreta");
    expect(t).toMatch(/^[a-f0-9]{64}$/);
  });

  it("segredos diferentes geram tokens diferentes", () => {
    expect(deriveAdminToken("a")).not.toBe(deriveAdminToken("b"));
  });
});

describe("verifyAdminSecret", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = "senha-correta";
  });

  it("aceita a senha correta", () => {
    expect(verifyAdminSecret("senha-correta")).toBe(true);
  });

  it("recusa senha errada de mesmo comprimento", () => {
    expect(verifyAdminSecret("senha-errXada".slice(0, 13))).toBe(false);
  });

  it("recusa senha de comprimento diferente sem lançar", () => {
    expect(() => verifyAdminSecret("x")).not.toThrow();
    expect(verifyAdminSecret("x")).toBe(false);
    expect(verifyAdminSecret("senha-correta-bem-mais-longa")).toBe(false);
  });

  it("recusa entrada vazia", () => {
    expect(verifyAdminSecret("")).toBe(false);
  });

  it("fail-closed: sem ADMIN_SECRET configurado, nada é aceito", () => {
    delete process.env.ADMIN_SECRET;
    expect(verifyAdminSecret("senha-correta")).toBe(false);
    expect(verifyAdminSecret("")).toBe(false);
  });
});

describe("isAdminAuthed", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = "senha-correta";
  });

  it("aceita o cookie derivado do segredo atual", () => {
    expect(isAdminAuthed(deriveAdminToken("senha-correta"))).toBe(true);
  });

  it("recusa cookie ausente, vazio ou adulterado", () => {
    expect(isAdminAuthed(null)).toBe(false);
    expect(isAdminAuthed(undefined)).toBe(false);
    expect(isAdminAuthed("")).toBe(false);
    expect(isAdminAuthed("f".repeat(64))).toBe(false);
    expect(isAdminAuthed(deriveAdminToken("outra-senha"))).toBe(false);
  });

  it("fail-closed: sem ADMIN_SECRET, nenhum cookie autentica", () => {
    const valido = deriveAdminToken("senha-correta");
    delete process.env.ADMIN_SECRET;
    expect(isAdminAuthed(valido)).toBe(false);
  });
});
