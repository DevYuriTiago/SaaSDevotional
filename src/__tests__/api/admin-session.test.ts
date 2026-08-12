// PATH: src/__tests__/api/admin-session.test.ts

import { NextRequest } from "next/server";
import { deriveAdminToken, ADMIN_COOKIE } from "@/lib/admin/auth";
import { POST, DELETE } from "@/app/api/admin/session/route";

function makeReq(body: object) {
  return new NextRequest("http://localhost/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/session", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = "senha-correta";
  });

  it("senha correta → 200, cookie httpOnly com o token derivado", async () => {
    const res = await POST(makeReq({ secret: "senha-correta" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const cookie = res.cookies.get(ADMIN_COOKIE);
    expect(cookie?.value).toBe(deriveAdminToken("senha-correta"));
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
  });

  it("o cookie nunca contém a senha em texto puro", async () => {
    const res = await POST(makeReq({ secret: "senha-correta" }));
    expect(res.cookies.get(ADMIN_COOKIE)?.value).not.toContain("senha-correta");
  });

  it("senha errada → 401 e nenhum cookie", async () => {
    const res = await POST(makeReq({ secret: "errada" }));
    expect(res.status).toBe(401);
    expect(res.cookies.get(ADMIN_COOKIE)).toBeUndefined();
  });

  it("corpo sem senha → 401", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(401);
  });

  it("fail-closed: sem ADMIN_SECRET no ambiente → 401", async () => {
    delete process.env.ADMIN_SECRET;
    const res = await POST(makeReq({ secret: "qualquer" }));
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/admin/session", () => {
  it("limpa o cookie de sessão", async () => {
    const res = await DELETE();
    expect(res.status).toBe(200);
    expect(res.cookies.get(ADMIN_COOKIE)?.value).toBe("");
  });
});
