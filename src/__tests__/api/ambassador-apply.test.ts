// PATH: src/__tests__/api/ambassador-apply.test.ts

import { NextRequest } from "next/server";
import { validateApplication } from "@/lib/ambassadors/apply";

const { mockInsert } = vi.hoisted(() => ({
  mockInsert: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: vi.fn(() => ({ insert: mockInsert })) })),
}));

import { POST } from "@/app/api/ambassador/apply/route";

const VALID = {
  name: "Pastor João",
  email: "joao@igreja.com",
  whatsapp: "(11) 91234-5678",
  social_platform: "instagram",
  social_handle: "@pastorjoao",
  followers_count: 12000,
  church: "Igreja Vida",
  testimony: "Sirvo a Cristo há 15 anos no ministério de louvor e ensino.",
  promotion_plan: "Stories semanais e menção nos cultos.",
};

function makeReq(body: object) {
  return new NextRequest("http://localhost/api/ambassador/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// validateApplication (pura)
// ---------------------------------------------------------------------------

describe("validateApplication", () => {
  it("payload válido → ok:true com dados normalizados", () => {
    const r = validateApplication(VALID);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.email).toBe("joao@igreja.com");
      expect(r.data.social_platform).toBe("instagram");
      expect(r.data.followers_count).toBe(12000);
    }
  });

  it("rejeita nome curto, e-mail inválido, whatsapp curto, plataforma desconhecida, testemunho curto", () => {
    expect(validateApplication({ ...VALID, name: "A" }).ok).toBe(false);
    expect(validateApplication({ ...VALID, email: "nao-eh-email" }).ok).toBe(false);
    expect(validateApplication({ ...VALID, whatsapp: "123" }).ok).toBe(false);
    expect(validateApplication({ ...VALID, social_platform: "orkut" }).ok).toBe(false);
    expect(validateApplication({ ...VALID, testimony: "curto" }).ok).toBe(false);
  });

  it("followers negativo ou não numérico → inválido", () => {
    expect(validateApplication({ ...VALID, followers_count: -1 }).ok).toBe(false);
    expect(validateApplication({ ...VALID, followers_count: "muitos" }).ok).toBe(false);
  });

  it("campos opcionais podem faltar", () => {
    const rest: Record<string, unknown> = { ...VALID };
    delete rest.church;
    delete rest.promotion_plan;
    expect(validateApplication(rest).ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST /api/ambassador/apply
// ---------------------------------------------------------------------------

describe("POST /api/ambassador/apply", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("payload inválido → 422 com erros", async () => {
    const res = await POST(makeReq({ ...VALID, email: "x" }));
    expect(res.status).toBe(422);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("honeypot preenchido → 200 fake sem gravar", async () => {
    const res = await POST(makeReq({ ...VALID, website: "http://spam.com" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("caminho feliz → insere pending e retorna ok", async () => {
    const res = await POST(makeReq(VALID));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Pastor João",
        email: "joao@igreja.com",
        status: "pending",
        social_platform: "instagram",
        followers_count: 12000,
      })
    );
  });

  it("e-mail duplicado (23505) → 200 idempotente (não vaza inscrição)", async () => {
    mockInsert.mockResolvedValue({ error: { code: "23505" } });
    const res = await POST(makeReq(VALID));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("erro de banco inesperado → 500", async () => {
    mockInsert.mockResolvedValue({ error: { code: "XX000" } });
    const res = await POST(makeReq(VALID));
    expect(res.status).toBe(500);
  });
});
