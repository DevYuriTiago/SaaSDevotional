// PATH: src/__tests__/api/admin-review.test.ts

import { NextRequest } from "next/server";
import { deriveAdminToken, ADMIN_COOKIE } from "@/lib/admin/auth";

const { mockUpdateEq, mockLinkInsert, mockSlugSingle, mockAmbSingle, mockSendMail } = vi.hoisted(() => ({
  mockUpdateEq: vi.fn().mockResolvedValue({ error: null }),
  mockLinkInsert: vi.fn().mockResolvedValue({ error: null }),
  mockSlugSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  mockAmbSingle: vi.fn(),
  mockSendMail: vi.fn().mockResolvedValue(true),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === "ambassador_links") {
        const chain = { eq: () => chain, maybeSingle: mockSlugSingle };
        return { select: () => chain, insert: mockLinkInsert };
      }
      // ambassadors
      const chain = { eq: () => chain, maybeSingle: mockAmbSingle };
      return { select: () => chain, update: () => ({ eq: mockUpdateEq }) };
    },
  })),
}));

vi.mock("@/lib/email/mailer", () => ({ sendMail: mockSendMail }));

import { POST } from "@/app/api/admin/ambassadors/review/route";

function makeReq(body: object, authed = true) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authed) headers.cookie = `${ADMIN_COOKIE}=${deriveAdminToken("senha-correta")}`;
  return new NextRequest("http://localhost/api/admin/ambassadors/review", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const APPROVE = { id: "amb-1", action: "approve" };

describe("POST /api/admin/ambassadors/review", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = "senha-correta";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    process.env.NEXT_PUBLIC_APP_URL = "https://humanah.app";
    vi.clearAllMocks();
    mockUpdateEq.mockResolvedValue({ error: null });
    mockLinkInsert.mockResolvedValue({ error: null });
    mockSlugSingle.mockResolvedValue({ data: null, error: null });
    mockSendMail.mockResolvedValue(true);
    mockAmbSingle.mockResolvedValue({
      data: { id: "amb-1", name: "Pastor João", email: "joao@igreja.com", status: "pending" },
      error: null,
    });
  });

  // ── segurança: a API é a fronteira, não a tela ──
  it("sem cookie de admin → 401 e nada é alterado", async () => {
    const res = await POST(makeReq(APPROVE, false));
    expect(res.status).toBe(401);
    expect(mockUpdateEq).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("fail-closed: sem ADMIN_SECRET no ambiente → 401", async () => {
    delete process.env.ADMIN_SECRET;
    const res = await POST(makeReq(APPROVE));
    expect(res.status).toBe(401);
  });

  it("ação desconhecida → 422", async () => {
    const res = await POST(makeReq({ id: "amb-1", action: "explodir" }));
    expect(res.status).toBe(422);
  });

  it("inscrição inexistente → 404", async () => {
    mockAmbSingle.mockResolvedValue({ data: null, error: null });
    const res = await POST(makeReq(APPROVE));
    expect(res.status).toBe(404);
  });

  // ── aprovação ──
  it("aprova: ativa, cria o link e devolve slug e URL", async () => {
    const res = await POST(makeReq(APPROVE));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.slug).toBe("pastorjoao");
    expect(json.link).toBe("https://humanah.app/e/pastorjoao");
    expect(json.emailSent).toBe(true);

    expect(mockLinkInsert).toHaveBeenCalledWith(
      expect.objectContaining({ ambassador_id: "amb-1", slug: "pastorjoao" })
    );
  });

  it("aprova respeitando o slug editado pelo admin", async () => {
    const res = await POST(makeReq({ ...APPROVE, slug: "Pastor João Oficial" }));
    const json = await res.json();
    expect(json.slug).toBe("pastorjoaooficial");
  });

  it("aprova evitando colisão de slug", async () => {
    mockSlugSingle
      .mockResolvedValueOnce({ data: { id: "outro" }, error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    const json = await (await POST(makeReq(APPROVE))).json();
    expect(json.slug).toBe("pastorjoao2");
  });

  it("falha de e-mail NÃO desfaz a aprovação", async () => {
    mockSendMail.mockResolvedValue(false);
    const res = await POST(makeReq(APPROVE));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.emailSent).toBe(false);
    expect(json.link).toBe("https://humanah.app/e/pastorjoao");
    expect(mockLinkInsert).toHaveBeenCalled();
  });

  it("não reprocessa quem já foi revisado", async () => {
    mockAmbSingle.mockResolvedValue({
      data: { id: "amb-1", name: "Pastor João", email: "joao@igreja.com", status: "active" },
      error: null,
    });
    const res = await POST(makeReq(APPROVE));
    expect(res.status).toBe(409);
    expect(mockLinkInsert).not.toHaveBeenCalled();
  });

  // ── recusa ──
  it("recusa: marca rejected, avisa por e-mail e não cria link", async () => {
    const res = await POST(makeReq({ id: "amb-1", action: "reject" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.emailSent).toBe(true);
    expect(mockLinkInsert).not.toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "joao@igreja.com" })
    );
  });
});
